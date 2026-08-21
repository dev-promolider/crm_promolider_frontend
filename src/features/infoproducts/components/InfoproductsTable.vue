<template>
  <section class="courses-section">
      <div class="table-toolbar">
        <div class="filter-group search-group">
          <label for="search">Buscar:</label>

          <input
            id="search"
            v-model="search"
            type="text"
            class="filter-select"
            placeholder="Buscar por título..."
          />
        </div>

        <div class="filter-group">
          <label for="filter-type">Filtrar por tipo:</label>

          <select
            id="filter-type"
            v-model="filterType"
            class="filter-select"
          >
            <option value="">Todos</option>
            <option value="1">Cursos</option>
            <option value="2">Libros</option>
          </select>
        </div>

        <div class="filter-group per-page-group">
          <label for="per-page">Mostrar:</label>

          <select
            id="per-page"
            v-model.number="perPage"
            class="filter-select"
          >
            <option
              v-for="option in perPageOptions"
              :key="option"
              :value="option"
            >
              {{ option }} registros
            </option>
          </select>
        </div>
      </div>

      <div v-if="initialLoading" class="loading-box">
          Cargando infoproductos...
      </div>

    <div v-else class="table-card">
        <div class="table-responsive">
            <table class="courses-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Curso</th>
                        <th>Infoproducto</th>
                        <th>Precio</th>
                        <th>Fecha de registro</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>

                <tbody>
                    <tr
                      v-for="(course, index) in courses"
                      :key="course.id"
                    >
                        <td>{{ startIndex + index + 1 }}</td>

                        <td>
                            <div class="course-title">
                                {{ course.title }}
                            </div>
                        </td>

                        <td>{{ course.product_type_id == 1 ? 'Curso' : 'Libro' }}</td>

                        <td>$ {{ course.price }}</td>

                        <td>{{ formatDate(course.created_at) }}</td>

                        <td>
                            <span :class="['status-badge', getStatusClass(course.status)]">
                                {{ getStatusLabel(course.status) }}
                            </span>
                        </td>

                        <td>
                            <select
                                class="action-select"
                                :value="''"
                                @change="handleActionChange($event, course)"
                            >
                                <option value="" disabled>Acciones</option>

                                <option
                                    v-for="option in getAvailableOptions(course)"
                                    :key="option.value"
                                    :value="option.value"
                                    :disabled="option.value === '7' && !course.certificate"
                                >
                                    {{ option.label }}
                                </option>
                            </select>
                        </td>
                    </tr>

                    <tr v-if="courses.length === 0">
                      <td colspan="7" class="empty-cell">
                        No se encontraron infoproductos.
                      </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="totalItems > 0" class="pagination-wrapper">
          <div class="pagination-info">
            Mostrando {{ startItem }} - {{ endIndex }} de {{ totalItems }} registros
          </div>

          <div class="pagination-controls">
            <button
              class="pagination-btn"
              :disabled="currentPage === 1"
              @click="goToPage(1)"
            >
              Primero
            </button>

            <button
              class="pagination-btn"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              Anterior
            </button>

            <button
              v-if="visiblePages[0] > 1"
              class="pagination-btn"
              @click="goToPage(1)"
            >
              1
            </button>

            <span v-if="visiblePages[0] > 2" class="pagination-dots">
              ...
            </span>

            <button
              v-for="page in visiblePages"
              :key="page"
              class="pagination-btn"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <span
              v-if="visiblePages[visiblePages.length - 1] < totalPages - 1"
              class="pagination-dots"
            >
              ...
            </span>

            <button
              v-if="visiblePages[visiblePages.length - 1] < totalPages"
              class="pagination-btn"
              @click="goToPage(totalPages)"
            >
              {{ totalPages }}
            </button>

            <button
              class="pagination-btn"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              Siguiente
            </button>

            <button
              class="pagination-btn"
              :disabled="currentPage === totalPages"
              @click="goToPage(totalPages)"
            >
              Último
            </button>
          </div>
        </div>
    </div>

    <!-- Modal eliminar -->
    <ModalComponent
      v-model="isDeleteModalOpen"
      color="danger"
      size="small"
    >
      <template #title>
        Borrar curso
      </template>

      <div v-if="courseSelected" class="text-slate-600">
        ¿Seguro que desea eliminar el curso <span class="font-bold text-slate-800">{{ courseSelected.title }}</span>?
      </div>

      <template #footer>
        <button class="btn-secondary" @click="closeCourseActionModals">
          Cancelar
        </button>
        <button class="btn-danger" @click="deleteCourse(courseSelected.id)">
          Eliminar
        </button>
      </template>
    </ModalComponent>

    <!-- Modal solicitar revisión -->
    <ModalComponent
      v-model="isReviewModalOpen"
      color="info"
      size="small"
    >
      <template #title>
        Solicitar revisión
      </template>

      <div v-if="courseSelected" class="text-slate-600">
        ¿Desea enviar el curso <span class="font-bold text-slate-800">{{ courseSelected.title }}</span> a revisión para publicarlo?
      </div>

      <template #footer>
        <button class="btn-secondary" @click="closeCourseActionModals">
          Cancelar
        </button>
        <button class="btn-primary" @click="sendRequest(courseSelected.id)">
          Enviar
        </button>
      </template>
    </ModalComponent>

    <!-- Modal Ver Observaciones -->
    <Teleport to="body">
      <div
        v-if="isObservationsModalOpen"
        style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:16px;"
        @click.self="isObservationsModalOpen = false"
      >
        <div class="obs-modal-container">
          <!-- Header -->
          <div class="obs-modal-header">
            <span style="font-size:18px;font-weight:600;display:flex;align-items:center;gap:8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Observaciones del curso
            </span>
            <button @click="isObservationsModalOpen = false" class="obs-modal-close">✕</button>
          </div>
          <!-- Body -->
          <div class="obs-modal-body">
            <div class="obs-modal-alert">
              {{ currentObservation }}
            </div>
          </div>
          <!-- Footer -->
          <div class="obs-modal-footer">
            <button class="obs-modal-btn" @click="isObservationsModalOpen = false">
              Entendido
            </button>
          </div>
        </div>
      </div>
    </Teleport>

      <!-- Modal preparando certificado -->
    <ModalComponent
      v-model="isPreparingCertificate"
      color="default"
      size="small"
      :closeOnBackdrop="false"
    >
      <template #title>
        Preparando certificado...
      </template>
      <div class="text-slate-600 text-center py-4">
        Cargando plantillas y datos del curso...
      </div>
    </ModalComponent>

    <!--
    <CourseEditModal
      v-if="isEditModalOpen && courseSelected"
      :course="courseSelected"
      :categories-list="categories"
      :levels-list="levels"
      @close="closeCourseActionModals"
    />

    <CertificateGenerator
      v-if="isCertificateModalOpen && courseSelected"
      :course="courseSelected"
      :templates="certificateTemplates"
      @certificate-generated="onCertificateGenerated"
      @close-modal="closeCertificateModal"
    />

    <CertificateViewer
      v-if="isCertificatesModalOpen && courseSelected"
      :course="courseSelected"
      :certificates="userCertificates"
      @close-modal="closeCertificatesModal"
      @certificate-downloaded="onCertificateDownloaded"
    />

    <CoursePreview
      v-if="outerVisible"
      :courses="courseSelected"
      :outer-visible="outerVisible"
      @closeModalPreview="closeModalPreview"
    />
    -->
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import 'element-plus/theme-chalk/el-message.css';
import { infoproductService } from '../services/infoproductService';
import ModalComponent from '@/components/common/ModalComponent.vue';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

const initialLoading = ref(false);

const courses = ref([]);
const search = ref('');
const filterType = ref('');

const currentPage = ref(1);
const perPage = ref(10);
const perPageOptions = [5, 10, 20, 50];

const meta = ref({
  current_page: 1,
  from: 0,
  last_page: 1,
  per_page: 10,
  to: 0,
  total: 0,
});

const categories = ref([]);
const levels = ref([]);
const certificateTemplates = ref([]);
const userCertificates = ref([]);

const isPreparingCertificate = ref(false);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isReviewModalOpen = ref(false);
const isObservationsModalOpen = ref(false);
const currentObservation = ref('');

const isCertificatesModalOpen = ref(false);
const isCertificateModalOpen = ref(false);
const outerVisible = ref(false);

const courseSelected = ref(null);

const options = [
  {
    value: '1',
    label: 'Módulos y clases',
  },
  {
    value: '2',
    label: 'Solicitar revisión',
  },
  {
    value: '3',
    label: 'Editar',
  },
  {
    value: '4',
    label: 'Eliminar',
  },
  {
    value: '5',
    label: 'Exámenes',
  },
  {
    value: '6',
    label: 'Dinámicas',
  },
  {
    value: '7',
    label: 'Ver certificados',
  },
  {
    value: '8',
    label: 'Previsualizar curso',
  },
  {
    value: '9',
    label: 'Generar certificado',
  },
  {
    value: '10',
    label: 'Lista de Alumnos',
  },
  {
    value: '11',
    label: 'Gestionar contenido',
  },
  {
    value: '12',
    label: 'Ver observaciones',
  },
];

const totalItems = computed(() => {
  return Number(meta.value.total || 0);
});

const totalPages = computed(() => {
  return Math.max(1, Number(meta.value.last_page || 1));
});

const startIndex = computed(() => {
  const from = Number(meta.value.from || 1);

  return from - 1;
});

const startItem = computed(() => {
  return Number(meta.value.from || 0);
});

const endIndex = computed(() => {
  return Number(meta.value.to || 0);
});

const visiblePages = computed(() => {
  const pages = [];
  const delta = 2;

  const start = Math.max(1, currentPage.value - delta);
  const end = Math.min(totalPages.value, currentPage.value + delta);

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  return pages;
});

const goToPage = async (page) => {
  if (page < 1 || page > totalPages.value) return;
  if (page === currentPage.value) return;

  currentPage.value = page;
  await listCourses();
};

watch([filterType, perPage], async () => {
  currentPage.value = 1;
  await listCourses();
});

let searchTimeout = null;

watch(search, () => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    currentPage.value = 1;
    await listCourses();
  }, 500);
});

onMounted(async () => {
  await Promise.all([
    listCourses(),
    listCategories(),
    listLevels(),
    loadCertificateTemplates(),
  ]);
});

const normalizeArrayResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.templates)) return payload.templates;

  return [];
};

const listCourses = async () => {
  initialLoading.value = true;

  try {
    const response = await infoproductService.getCreatedInfoproducts({
      page: currentPage.value,
      per_page: perPage.value,
      search: search.value,
      product_type_id: filterType.value,
    });

    courses.value = response.data?.data || [];

    meta.value = {
      current_page: Number(response.data?.meta?.current_page || currentPage.value),
      from: Number(response.data?.meta?.from || 0),
      last_page: Number(response.data?.meta?.last_page || 1),
      per_page: Number(response.data?.meta?.per_page || perPage.value),
      to: Number(response.data?.meta?.to || 0),
      total: Number(response.data?.meta?.total || 0),
    };

    currentPage.value = meta.value.current_page;

    if (currentPage.value > meta.value.last_page) {
      currentPage.value = meta.value.last_page;
      await listCourses();
    }
  } catch (error) {
    console.error('Error cargando cursos:', error);
    alert('Error al cargar los infoproductos.');
  } finally {
    initialLoading.value = false;
  }
};

const listCategories = async () => {
  try {
    const response = await infoproductService.getCategories();
    categories.value = normalizeArrayResponse(response.data);
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
};

const listLevels = async () => {
  try {
    const response = await infoproductService.getLevels();
    levels.value = normalizeArrayResponse(response.data);
  } catch (error) {
    console.error('Error cargando niveles:', error);
  }
};

const loadCertificateTemplates = async () => {
  try {
    const response = await infoproductService.getCertificateTemplates();
    const templates = normalizeArrayResponse(response.data);

    certificateTemplates.value = templates.filter((template) => {
      return template.is_active === true || template.is_active === 1;
    });
  } catch (error) {
    console.error('Error cargando plantillas:', error);
    certificateTemplates.value = [];
  }
};

const formatDate = (date) => {
  if (!date) return '-';

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const getStatusLabel = (status) => {
  const statuses = {
    0: 'Inactivo',
    1: 'En espera',
    2: 'Activo',
    3: 'Con observaciones',
    4: 'Nueva revisión',
  };

  return statuses[status] || 'Borrador';
};

const getStatusClass = (status) => {
  const classes = {
    0: 'danger',
    1: 'warning',
    2: 'success',
    3: 'warning',
    4: 'warning',
  };

  return classes[status] || 'secondary';
};

const getAvailableOptions = (course) => {
  let availableOptions = options.map((option) => ({ ...option }));

  if (course.product_type_id == 2) {
    // Los libros no tienen módulos, exámenes, dinámicas, previsualización
    // ni certificados ('7' Ver certificados, '9' Generar certificado).
    availableOptions = availableOptions.filter((option) => {
      return !['1', '5', '6', '7', '8', '9'].includes(option.value);
    });

    availableOptions = availableOptions.map((option) => {
      if (option.value === '10') {
        return {
          ...option,
          label: 'Lista de Compradores',
        };
      }

      return option;
    });
  } else {
    availableOptions = availableOptions.filter((option) => {
      return option.value !== '11';
    });
  }

  availableOptions = availableOptions.filter((option) => {
    if (option.value === '7' || option.value === '9') {
      return Boolean(course.certificate);
    }
    if (option.value === '12') {
      return Number(course.status) === 3;
    }

    return true;
  });

  return availableOptions;
};

const handleActionChange = async (event, course) => {
  const option = event.target.value;
  console.log('[DEBUG] handleActionChange option:', JSON.stringify(option), 'type:', typeof option);

  event.target.value = '';

  // Close modals only for options that don't open a new one, or handle per-case
  if (option !== '12') {
    closeCourseActionModals();
  }

  switch (option) {
    case '1':
      router.push(`/course/module/${course.id}/editModule`);
      break;

    case '2':
      courseSelected.value = course;
      isReviewModalOpen.value = true;
      break;

    case '3':
      router.push(`/courses/edit/${course.id}`);
      break;

    case '4':
      courseSelected.value = course;
      isDeleteModalOpen.value = true;
      break;

    case '5':
      router.push(`/course/exam/${course.id}/create`);
      break;

    case '6':
      router.push(`/course/game/${course.id}`);
      break;

    case '7':
      courseSelected.value = course;
      isCertificatesModalOpen.value = true;
      await loadUserCertificates(course.id);
      break;

    case '8':
      courseSelected.value = course;
      openModalPreview();
      break;

    case '9':
      await handleCertificateGeneration(course);
      break;

    case '10':
      router.push(`/course/students-list/${course.id}`);
      break;

    case '11':
      router.push(`/course/${course.id}/book-content`);
      break;

    case '12':
      courseSelected.value = course;
      currentObservation.value = 'Cargando...';
      isObservationsModalOpen.value = true;
      loadObservations(course.id); // sin await para no bloquear el modal
      break;

    default:
      break;
  }
};

const sendRequest = async (courseId) => {
  try {
    const response = await infoproductService.sendReviewRequest(courseId);
    const result = response.data?.data;

    switch (result) {
      case 'ok':
        ElMessage.success('Curso enviado a revisión correctamente');
        break;

      case 'request':
        ElMessage.info('Ya se ha enviado el curso para su revisión');
        break;

      case 'empty':
        ElMessage.warning('El curso debe tener al menos un módulo y una clase');
        break;

      case 'misconfigured':
        ElMessage.warning('Configure la entrega del certificado');
        break;

      case 'signaturetemplate':
        ElMessage.warning('Seleccione la plantilla y firma para el certificado');
        break;

      default:
        ElMessage.error('Error al validar datos');
        break;
    }

    closeCourseActionModals();
    await listCourses();
  } catch (error) {
    console.error('Error enviando solicitud:', error);
    ElMessage.error('Error al enviar la solicitud.');
  }
};

const deleteCourse = async (courseId) => {
  try {
    const response = await infoproductService.deleteInfoproduct(courseId);
    const data = response.data;

    if (data.status === 'inactive') {
      alert(data.message || 'El curso fue marcado como inactivo.');
    } else if (data.status === 'ok') {
      alert(data.message || 'Curso eliminado correctamente.');
    }

    await listCourses();
    closeCourseActionModals();
  } catch (error) {
    console.error('Error eliminando curso:', error);
    alert('Error al procesar la solicitud.');
  }
};

const loadUserCertificates = async (courseId) => {
  try {
    const response = await infoproductService.getCourseCertificates(courseId);
    userCertificates.value = response.data?.data || [];
  } catch (error) {
    console.error('Error al cargar certificados:', error);
    alert('Error al cargar los certificados.');
  }
};

const loadObservations = async (courseId) => {
  try {
    const response = await infoproductService.getCourseObservations(courseId);
    currentObservation.value = response.data?.data?.observation || 'No hay observaciones.';
  } catch (error) {
    console.error('Error al cargar las observaciones:', error);
    currentObservation.value = 'Ocurrió un error al cargar las observaciones.';
  }
};

const handleCertificateGeneration = async (course) => {
  if (!course.certificate) {
    alert('Este curso no tiene la opción de certificado habilitada.');
    return;
  }

  if (!course.id) {
    alert('Error: el curso no tiene un ID válido.');
    return;
  }

  isPreparingCertificate.value = true;

  try {
    if (certificateTemplates.value.length === 0) {
      await loadCertificateTemplates();
    }

    if (certificateTemplates.value.length === 0) {
      throw new Error('No hay plantillas de certificados disponibles.');
    }

    courseSelected.value = {
      ...course,
      id: Number(course.id),
      title: course.title || 'Sin título',
      certificate: Boolean(course.certificate),
    };

    isCertificateModalOpen.value = true;
  } catch (error) {
    console.error('Error preparando certificado:', error);
    alert(error.message || 'Error al preparar la generación del certificado.');
  } finally {
    isPreparingCertificate.value = false;
  }
};

const closeCourseActionModals = () => {
  isEditModalOpen.value = false;
  isDeleteModalOpen.value = false;
  isReviewModalOpen.value = false;
  isObservationsModalOpen.value = false;
  isCertificatesModalOpen.value = false;
  isCertificateModalOpen.value = false;
};

const openModalPreview = () => {
  outerVisible.value = true;
};

const closeModalPreview = () => {
  outerVisible.value = false;
};

const closeCertificateModal = () => {
  isCertificateModalOpen.value = false;
};

const closeCertificatesModal = () => {
  isCertificatesModalOpen.value = false;
};

const onCertificateGenerated = () => {
  alert('Certificado generado exitosamente.');
  closeCertificateModal();
};

const onCertificateDownloaded = () => {
  alert('Certificado descargado exitosamente.');
};
</script>

<style scoped>
.courses-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 260px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 700;
}

.filter-select,
.action-select {
  width: 100%;
  min-height: 38px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  padding: 0 12px;
  background: var(--card-bg);
  color: var(--text-main);
}

.table-card {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 920px;
}

.courses-table th,
.courses-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  text-align: left;
  vertical-align: middle;
}

.courses-table th {
  font-size: 13px;
  text-transform: uppercase;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.03);
}

.course-title {
  width: 220px;
  font-weight: 700;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.status-badge.success {
  background: rgba(22, 163, 74, 0.14);
  color: #16a34a;
}

.status-badge.warning {
  background: rgba(245, 158, 11, 0.16);
  color: #f59e0b;
}

.status-badge.danger {
  background: rgba(239, 68, 68, 0.16);
  color: #ef4444;
}

.status-badge.secondary {
  background: rgba(148, 163, 184, 0.16);
  color: #94a3b8;
}

.empty-cell {
  text-align: center;
  color: var(--text-muted);
  padding: 30px;
}

.loading-box {
  padding: 30px;
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.6);
}

.modal-card {
  width: 100%;
  max-width: 480px;
  padding: 24px;
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
}

.modal-card.small {
  max-width: 360px;
}

.modal-card h3 {
  margin: 0 0 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.btn-secondary,
.btn-danger {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary {
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-main);
}

.btn-danger {
  border: none;
  background: #ef4444;
  color: white;
}

.per-page-group {
  width: 180px;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.pagination-info {
  font-size: 14px;
  color: var(--text-muted);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pagination-btn {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-main);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(0, 255, 0, 0.08);
  color: var(--primary-color);
}

.pagination-btn.active {
  background: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pagination-dots {
  padding: 0 4px;
  color: var(--text-muted);
}

/* Modal Observaciones */
.obs-modal-container {
  background: var(--bg-primary, #ffffff);
  border-radius: 12px;
  max-width: 480px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
}

.obs-modal-header {
  background: var(--primary-color, #00f02b);
  color: white;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.obs-modal-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.obs-modal-close:hover {
  opacity: 1;
}

.obs-modal-body {
  padding: 24px;
  background: var(--bg-secondary, #f8fafc);
}

.obs-modal-alert {
  background: rgba(0, 240, 43, 0.1);
  border: 1px solid rgba(0, 240, 43, 0.3);
  border-radius: 8px;
  padding: 16px;
  color: var(--text-primary, #334155);
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-line;
  font-weight: 500;
}

.obs-modal-footer {
  padding: 16px 24px;
  background: var(--bg-primary, #ffffff);
  border-top: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  justify-content: flex-end;
}

.obs-modal-btn {
  background: var(--primary-color, #00f02b);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: filter 0.2s;
}

.obs-modal-btn:hover {
  filter: brightness(1.1);
}

/* Modo oscuro */
body.dark-theme .obs-modal-container {
  background: #1e293b;
}
body.dark-theme .obs-modal-body {
  background: #0f172a;
}
body.dark-theme .obs-modal-alert {
  color: #f1f5f9;
}
body.dark-theme .obs-modal-footer {
  background: #1e293b;
  border-top-color: #334155;
}
</style>