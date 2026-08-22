<template>
  <div class="dashboard-page">
    <header class="page-header">
      <div>
        <h1>Gestionar contenido</h1>
        <p>{{ courseTitle || 'Archivos del libro' }}</p>
      </div>

      <div class="page-actions">
        <RouterLink :to="{ name: 'infoproducts' }" class="btn-secondary">
          Volver
        </RouterLink>
      </div>
    </header>

    <div class="content-grid" :class="{ 'has-observations': hasObservations }">
      <div class="sections-column">

        <!-- ═══ SECCIÓN 1: Muestra gratuita ═══ -->
        <section class="card section-preview">
          <div class="card-head">
            <div class="section-title">
              <h3><Eye size="18" /> Vista previa gratuita</h3>
              <span class="tag-optional">Opcional</span>
            </div>

            <label
              v-if="!previewFile"
              for="previewFileInput"
              class="btn-outline upload-trigger"
              :class="{ disabled: isUploadingPreview }"
            >
              <UploadCloud size="18" />
              {{ isUploadingPreview ? 'Subiendo...' : 'Subir muestra' }}
              <input
                type="file"
                id="previewFileInput"
                class="hidden-input"
                accept=".pdf"
                :disabled="isUploadingPreview"
                @change="(e) => handleFileUpload(e, true)"
              />
            </label>
          </div>

          <p class="section-help">
            Sube un PDF con una parte del libro (por ejemplo, el primer capítulo). Cualquier persona podrá
            leerlo desde el marketplace <strong>antes de comprar</strong>, para saber qué va a recibir.
            Solo se admite PDF y solo puede haber una muestra por libro.
          </p>

          <div v-if="previewUploadProgress > 0" class="progress-bar-container">
            <div class="progress-bar" :style="{ width: previewUploadProgress + '%' }"></div>
            <span class="progress-text">{{ previewUploadProgress }}% Completado</span>
          </div>

          <div v-if="isLoading" class="empty-state">Cargando...</div>

          <div v-else-if="!previewFile" class="empty-state empty-preview">
            <Eye size="28" class="empty-icon" />
            <p>Este libro aún no ofrece muestra gratuita.</p>
            <span>Sin muestra, el comprador solo verá la portada y la descripción.</span>
          </div>

          <div v-else class="files-list">
            <div class="file-item is-preview">
              <div class="file-icon type-pdf">PDF</div>

              <div class="file-details">
                <h4 :title="previewFile.file_name">{{ previewFile.file_name }}</h4>
                <span class="file-meta">
                  {{ (previewFile.size / (1024 * 1024)).toFixed(2) }} MB
                  <span class="preview-badge">Visible para todos</span>
                </span>
              </div>

              <div class="file-actions">
                <button type="button" class="btn-icon" title="Descargar" @click="downloadFile(previewFile)">
                  <Download size="18" />
                </button>
                <button type="button" class="btn-icon danger" title="Quitar la muestra" @click="confirmDelete(previewFile)">
                  <Trash2 size="18" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ SECCIÓN 2: Contenido a la venta ═══ -->
        <section class="card">
          <div class="card-head">
            <div class="section-title">
              <h3><Lock size="18" /> Contenido del libro</h3>
              <span class="tag-paid">Solo para compradores</span>
            </div>

            <label for="bookFile" class="btn-primary upload-trigger" :class="{ disabled: isUploading || limitReached }">
              <UploadCloud size="18" />
              {{ isUploading ? 'Subiendo...' : 'Subir archivo' }}
              <input
                type="file"
                id="bookFile"
                class="hidden-input"
                :accept="acceptAttr"
                :disabled="isUploading || limitReached"
                @change="(e) => handleFileUpload(e, false)"
              />
            </label>
          </div>

          <p class="section-help">
            Estos son los archivos que recibe quien compra el libro. Nadie puede descargarlos sin haberlo
            adquirido.
          </p>

          <p class="upload-info">
            <strong>Formatos permitidos:</strong> {{ allowedFormats.map(f => f.toUpperCase()).join(', ') }}<br />
            <strong>Límite:</strong> máximo {{ maxFiles }} archivos, {{ maxSizeMB }} MB en total (incluida la muestra)
          </p>

          <div v-if="uploadProgress > 0" class="progress-bar-container">
            <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
            <span class="progress-text">{{ uploadProgress }}% Completado</span>
          </div>

          <div class="storage-info">
            <div class="storage-header">
              <span>Almacenamiento utilizado</span>
              <span class="storage-text">{{ usedMB.toFixed(2) }} MB / {{ maxSizeMB }} MB</span>
            </div>
            <div class="storage-track">
              <div class="storage-fill" :style="{ width: Math.min(usagePercentage, 100) + '%' }"></div>
            </div>
          </div>

          <div v-if="isLoading" class="empty-state">Cargando archivos...</div>

          <div v-else-if="saleFiles.length === 0" class="empty-state">
            <FileText size="28" class="empty-icon" />
            <p>Este libro todavía no tiene contenido.</p>
            <span>Sube el PDF o EPUB completo para que tus lectores puedan acceder a él.</span>
          </div>

          <div v-else class="files-list">
            <div v-for="file in saleFiles" :key="file.id" class="file-item">
              <div class="file-icon" :class="'type-' + file.file_type">
                {{ file.file_type.toUpperCase() }}
              </div>

              <div class="file-details">
                <h4 :title="file.file_name">{{ file.file_name }}</h4>
                <span class="file-meta">
                  {{ (file.size / (1024 * 1024)).toFixed(2) }} MB &bull; {{ file.file_type.toUpperCase() }}
                </span>
              </div>

              <div class="file-actions">
                <button type="button" class="btn-icon" title="Descargar" @click="downloadFile(file)">
                  <Download size="18" />
                </button>
                <button type="button" class="btn-icon danger" title="Eliminar" @click="confirmDelete(file)">
                  <Trash2 size="18" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Observaciones del analista (solo si el libro está observado) -->
      <div v-if="hasObservations" class="card observations-card">
        <h3>Observaciones</h3>
        <div v-if="observations.length" class="observations-list">
          <div v-for="observation in observations" :key="observation.id" class="observation-item">
            <div class="observation-header">
              <span class="observation-author">{{ analystName(observation) }}</span>
              <span class="observation-date">{{ formatDate(observation.created_at) }}</span>
            </div>
            <p class="observation-text">{{ observation.observations }}</p>
          </div>
        </div>
        <p v-else class="empty-state">No hay observaciones registradas.</p>
      </div>
    </div>

    <!-- Modal eliminar archivo -->
    <ModalComponent v-model="isDeleteModalOpen" color="danger" size="small">
      <template #title>
        Eliminar archivo
      </template>

      <div v-if="fileSelected" class="text-slate-600">
        Se eliminará <span class="font-bold text-slate-800">{{ fileSelected.file_name }}</span>.
        Esta acción no se puede deshacer.
      </div>

      <template #footer>
        <button class="btn-secondary" @click="isDeleteModalOpen = false">
          Cancelar
        </button>
        <button class="btn-danger" :disabled="isDeleting" @click="deleteFile">
          {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </template>
    </ModalComponent>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { UploadCloud, Download, Trash2, FileText, Eye, Lock } from 'lucide-vue-next';
import ModalComponent from '@/components/common/ModalComponent.vue';
import { infoproductService } from '../services/infoproductService';

const route = useRoute();
const courseId = route.params.id;

const allowedFormats = ['pdf', 'epub', 'xls', 'xlsx', 'xlsm', 'xlsb', 'csv'];
const acceptAttr = allowedFormats.map((f) => '.' + f).join(',');

const files = ref([]);
const observations = ref([]);
const courseTitle = ref('');
const courseStatus = ref(null);
const isLoading = ref(true);
const isUploading = ref(false);
const uploadProgress = ref(0);
const isUploadingPreview = ref(false);
const previewUploadProgress = ref(0);
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);
const fileSelected = ref(null);
const maxFiles = ref(20);
const maxSizeBytes = ref(500 * 1024 * 1024);

const maxSizeMB = computed(() => Math.round(maxSizeBytes.value / (1024 * 1024)));
const usedMB = computed(() => files.value.reduce((total, f) => total + (f.size || 0), 0) / (1024 * 1024));
const usagePercentage = computed(() => (usedMB.value / maxSizeMB.value) * 100);
const limitReached = computed(() => files.value.length >= maxFiles.value);
// La muestra gratuita se gestiona aparte del contenido que se vende.
const previewFile = computed(() => files.value.find((f) => f.is_preview) || null);
const saleFiles = computed(() => files.value.filter((f) => !f.is_preview));
// El estado 3 significa que el libro fue observado por un analista.
const hasObservations = computed(() => Number(courseStatus.value) === 3);

const loadFiles = async () => {
  try {
    const response = await infoproductService.getBookFiles(courseId);
    files.value = response.data?.data || [];

    const meta = response.data?.meta;
    if (meta) {
      maxFiles.value = meta.max_files ?? maxFiles.value;
      maxSizeBytes.value = meta.max_size ?? maxSizeBytes.value;

      if (meta.course) {
        courseTitle.value = meta.course.title || '';
        courseStatus.value = meta.course.status;
      }
    }
  } catch (error) {
    const msg = error.response?.data?.message || 'No se pudieron cargar los archivos del libro';
    ElMessage.error(msg);
  }
};

const loadObservations = async () => {
  try {
    const response = await infoproductService.getCourseObservations(courseId);
    const data = response.data?.data || response.data || [];
    observations.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error cargando observaciones', error);
    observations.value = [];
  }
};

onMounted(async () => {
  isLoading.value = true;
  await loadFiles();
  if (hasObservations.value) {
    await loadObservations();
  }
  isLoading.value = false;
});

const handleFileUpload = async (event, asPreview = false) => {
  const file = event.target.files[0];
  event.target.value = '';

  if (!file) return;

  const extension = file.name.split('.').pop().toLowerCase();

  if (asPreview && extension !== 'pdf') {
    ElMessage.warning('La muestra gratuita debe ser un archivo PDF');
    return;
  }

  if (!allowedFormats.includes(extension)) {
    ElMessage.warning(`El formato ${extension.toUpperCase()} no está permitido`);
    return;
  }

  if (usedMB.value * 1024 * 1024 + file.size > maxSizeBytes.value) {
    ElMessage.warning(`El archivo supera el límite de ${maxSizeMB.value} MB en total`);
    return;
  }

  const cargando = asPreview ? isUploadingPreview : isUploading;
  const progreso = asPreview ? previewUploadProgress : uploadProgress;

  cargando.value = true;
  progreso.value = 0;

  try {
    await infoproductService.uploadBookFile(
      courseId,
      file,
      (progressEvent) => {
        progreso.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      },
      asPreview
    );

    ElMessage.success(asPreview ? 'Muestra gratuita publicada' : 'Archivo subido correctamente');
    await loadFiles();
  } catch (error) {
    const msg = error.response?.data?.message || 'Hubo un error al subir el archivo';
    ElMessage.error(msg);
  } finally {
    cargando.value = false;
    progreso.value = 0;
  }
};

const confirmDelete = (file) => {
  fileSelected.value = file;
  isDeleteModalOpen.value = true;
};

const deleteFile = async () => {
  if (!fileSelected.value || isDeleting.value) return;

  isDeleting.value = true;

  try {
    await infoproductService.deleteBookFile(fileSelected.value.id);
    isDeleteModalOpen.value = false;
    fileSelected.value = null;
    ElMessage.success('Archivo eliminado correctamente');
    await loadFiles();
  } catch (error) {
    const msg = error.response?.data?.message || 'Hubo un error al eliminar el archivo';
    ElMessage.error(msg);
  } finally {
    isDeleting.value = false;
  }
};

const downloadFile = (file) => {
  if (!file.url) {
    ElMessage.warning('Este archivo no tiene una URL disponible');
    return;
  }
  window.open(file.url, '_blank');
};

const analystName = (observation) => {
  const analyst = observation.analyst;
  if (!analyst) return 'Analista no asignado';
  return [analyst.name, analyst.last_name].filter(Boolean).join(' ') || 'Analista no asignado';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--text-bold);
}

.page-header p {
  margin-top: 6px;
  font-size: 14px;
  color: var(--text-muted);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
}

.content-grid.has-observations {
  grid-template-columns: 2fr 1fr;
}

@media (max-width: 992px) {
  .content-grid.has-observations {
    grid-template-columns: 1fr;
  }
}

.card {
  background: var(--card-bg, #fff);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
}

.sections-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
}

/* La sección de muestra se distingue con un borde verde a la izquierda */
.section-preview {
  border-left: 4px solid var(--primary-color);
}

.tag-optional,
.tag-paid {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 12px;
}

.tag-optional {
  background: rgba(24, 214, 0, 0.12);
  color: var(--primary-color);
}

.tag-paid {
  background: var(--indicator-orange, #ffedd5);
  color: var(--indicator-orange-text, #ea580c);
}

.section-help {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
  margin-bottom: 16px;
  max-width: 70ch;
}

.section-help strong {
  color: var(--text-main);
}

.file-item.is-preview {
  border-color: var(--primary-color);
  background: rgba(24, 214, 0, 0.04);
}

.empty-preview {
  border: 1px dashed var(--border-color);
  border-radius: 12px;
}

.upload-info {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 16px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  background: var(--primary-color);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  border: none;
  cursor: pointer;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  background: transparent;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 13px;
  border: 2px solid var(--primary-color);
  cursor: pointer;
}

.btn-outline:hover {
  background: rgba(24, 214, 0, 0.08);
}

.upload-trigger.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
}

.hidden-input {
  display: none;
}

/* Botones del modal de eliminar (misma pauta que InfoproductsTable) */
.btn-danger {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  background: var(--danger-color, #ef4444);
  color: #fff;
}

.btn-danger:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Almacenamiento */
.storage-info {
  margin-bottom: 20px;
}

.storage-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.storage-text {
  font-weight: 700;
  color: var(--text-main);
}

.storage-track {
  height: 8px;
  border-radius: 6px;
  background: var(--bg-main);
  overflow: hidden;
}

.storage-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

/* Lista de archivos */
.files-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-main);
}

.file-icon {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: #64748b;
}

.file-icon.type-pdf { background: #dc2626; }
.file-icon.type-epub { background: #7c3aed; }
.file-icon.type-xls,
.file-icon.type-xlsx,
.file-icon.type-xlsm,
.file-icon.type-xlsb,
.file-icon.type-csv { background: #16a34a; }

.file-details {
  flex: 1;
  min-width: 0;
}

.file-details h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

.file-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-icon.danger:hover {
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.btn-icon.active {
  border-color: var(--primary-color);
  background: rgba(24, 214, 0, 0.1);
  color: var(--primary-color);
}

.preview-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(24, 214, 0, 0.12);
  color: var(--primary-color);
  vertical-align: middle;
}

/* Vacío */
.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-muted);
  font-size: 14px;
}

.empty-state p {
  margin: 12px 0 4px 0;
  font-weight: 600;
  color: var(--text-main);
}

.empty-state span {
  font-size: 13px;
}

.empty-icon {
  color: var(--text-light);
}

/* Observaciones */
.observations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.observation-item {
  padding: 14px;
  border-radius: 10px;
  background: var(--bg-main);
  border: 1px solid var(--border-color);
}

.observation-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.observation-author {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-bold);
}

.observation-date {
  font-size: 12px;
  color: var(--text-muted);
}

.observation-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
  margin: 0;
}

/* Barra de progreso de subida */
.progress-bar-container {
  background-color: var(--bg-main);
  border-radius: 8px;
  overflow: hidden;
  height: 34px;
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.progress-bar {
  background-color: var(--primary-color);
  height: 100%;
  transition: width 0.2s ease;
}

.progress-text {
  position: absolute;
  width: 100%;
  text-align: center;
  font-size: 13px;
  color: var(--text-bold);
  font-weight: 700;
}
</style>
