<template>
  <div>
    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <!-- Encabezado -->
      <header class="border-b border-slate-200 px-5 py-4">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h3 class="text-xl font-semibold text-slate-800">
            Lista de módulos
            <span class="text-slate-500">
              ({{ mutableModules.length }})
            </span>
          </h3>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              @click="openModalPreview"
            >
              Previsualizar
            </button>

            <button
              v-if="Number(courses.certificate) === 1"
              type="button"
              class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
              @click="openModalCertificate"
            >
              Certificado
            </button>

            <button
              type="button"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              @click="toggleCreateModule"
            >
              {{
                showDialogAddModule
                  ? "Cancelar módulo"
                  : "+ Agregar módulo"
              }}
            </button>

            <button
              type="button"
              class="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100"
              @click="openOrderModal"
            >
              Cambiar orden
            </button>

            <button
              v-if="Number(courses.certificate) === 0"
              type="button"
              class="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="sendingRequest"
              @click="sendRequest(courses.id)"
            >
              {{
                sendingRequest
                  ? "Enviando..."
                  : "Solicitar revisión"
              }}
            </button>
          </div>
        </div>
      </header>

      <!-- Contenido -->
      <div class="p-5">
        <!-- Crear módulo -->
        <div
          v-if="showDialogAddModule"
          class="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4"
        >
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label
              for="module-title"
              class="shrink-0 text-lg font-semibold text-slate-800"
            >
              Módulo {{ mutableModules.length + 1 }}:
            </label>

            <input
              id="module-title"
              v-model="title"
              type="text"
              maxlength="255"
              placeholder="Ingrese el título del módulo"
              class="w-full flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              :disabled="storingModule"
              @keyup.enter="storeModule"
            />

            <button
              type="button"
              class="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="storingModule"
              @click="storeModule"
            >
              {{
                storingModule
                  ? "Guardando..."
                  : "Guardar"
              }}
            </button>

            <button
              type="button"
              class="rounded-lg border border-slate-300 bg-white px-5 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
              :disabled="storingModule"
              @click="cancelCreateModule"
            >
              Cancelar
            </button>
          </div>
        </div>

        <!-- Sin módulos -->
        <div
          v-if="
            mutableModules.length === 0 &&
            !showDialogAddModule
          "
          class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"
        >
          <svg
            class="mx-auto mb-3 h-12 w-12 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h10" />
          </svg>

          <p class="text-lg font-medium text-slate-600">
            {{ message }}
          </p>
        </div>

        <!-- Lista de módulos -->
        <ol
          v-else
          class="space-y-4"
        >
          <CourseModuleItem
            v-for="(moduleItem, index) in mutableModules"
            :key="moduleItem.id"
            :ref="
              (component) =>
                setModuleItemRef(
                  component,
                  moduleItem.id,
                )
            "
            :module="moduleItem"
            :course="courses"
            :index="index"
            @delete="showDeleteModuleModal"
            @add-class="showAddClassModal"
            @delete-class="showDeleteClassModal"
            @edit-class="showEditClassModal"
            @module-updated="handleModuleUpdated"
          />
        </ol>
      </div>
    </section>

    <!-- Eliminar módulo -->
    <CustomModal
      v-model="deleteModuleModal"
      color="danger"
      size="small"
    >
      <template #title>
        Eliminar módulo
      </template>

      <template #body>
        <p class="text-slate-700">
          ¿Seguro que deseas eliminar el módulo
          <strong class="font-semibold text-slate-900">
            “{{ mutableModule.name }}”
          </strong>?
        </p>

        <p class="mt-2 text-sm text-red-600">
          Esta acción también puede eliminar las clases asociadas.
        </p>
      </template>

      <template #footer>
        <button
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
          :disabled="deletingModule"
          @click="deleteModuleModal = false"
        >
          Cancelar
        </button>

        <button
          type="button"
          class="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="deletingModule"
          @click="deleteModule"
        >
          {{
            deletingModule
              ? "Eliminando..."
              : "Eliminar"
          }}
        </button>
      </template>
    </CustomModal>

    <!-- Crear clase -->
    <CustomModal
      v-model="createClassModal"
      color="primary"
      size="large"
    >
      <template #title>
        Módulo {{ mutableModule.name }} / Crear clase
      </template>

      <template #body>
        <AddClass
          v-if="mutableModule.id"
          :module-id="mutableModule.id"
          @saved="handleClassCreated"
          @close="createClassModal = false"
        />
      </template>
    </CustomModal>

    <!-- Eliminar clase -->
    <CustomModal
      v-model="deleteClassModal"
      color="danger"
      size="small"
    >
      <template #title>
        Eliminar clase
      </template>

      <template #body>
        <p class="text-slate-700">
          ¿Seguro que deseas eliminar la clase
          <strong class="font-semibold text-slate-900">
            “{{ mutableClass.name }}”
          </strong>?
        </p>
      </template>

      <template #footer>
        <button
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
          :disabled="deletingClass"
          @click="deleteClassModal = false"
        >
          Cancelar
        </button>

        <button
          type="button"
          class="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="deletingClass"
          @click="deleteClass"
        >
          {{
            deletingClass
              ? "Eliminando..."
              : "Eliminar"
          }}
        </button>
      </template>
    </CustomModal>

    <!-- Editar clase -->
    <CustomModal
      v-model="editClassModal"
      color="primary"
      size="large"
    >
      <template #title>
        {{
          mutableClass.has_video
            ? "Editar clase"
            : "Agregar video"
        }}
        |
        {{ mutableClass.name }}
      </template>

      <template #body>
        <div
          v-if="loadingClassDetails"
          class="flex min-h-52 items-center justify-center"
        >
          <div class="text-center">
            <span
              class="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
            />

            <p class="mt-3 text-sm text-slate-600">
              Cargando información de la clase...
            </p>
          </div>
        </div>

        <EditClass
          v-else-if="mutableClass.id"
          :observations="observations"
          :clas="mutableClass"
          :resources="mutableResources"
          :video="mutableVideo"
          @saved="handleClassUpdated"
          @close="editClassModal = false"
        />
      </template>
    </CustomModal>

    <!-- Configurar certificado -->
    <ConfigureCertificate
      v-if="visibleConfigure"
      v-model:visible-configure="visibleConfigure"
      :course="courses"
      @close-modal-certificate="closeModalCertificate"
    />

    <!-- Previsualización -->
    <CoursePreview
      v-if="outerVisible"
      v-model:outer-visible="outerVisible"
      :courses="courses"
      @close-modal-preview="outerVisible = false"
    />

    <!-- Ordenar curso -->
    <OrderCourse
      v-if="orderModal"
      v-model:order-modal="orderModal"
      :courses="courses"
      @close-order-modal="closeOrderModal"
    />
  </div>
</template>

<script setup>
import {
  onBeforeUnmount,
  ref,
  watch,
} from "vue";

import { ElMessage } from "element-plus";

import { courseModuleService } from "@/features/infoproducts/services/course/courseModuleService";

import CourseModuleItem from "@/features/infoproducts/components/course/modules/CourseModuleItem.vue";
import CustomModal from "@/components/common/ModalComponent.vue";
import ConfigureCertificate from "@/features/infoproducts/components/course/certificates/Certificate.vue";
import CoursePreview from "@/features/infoproducts/components/course/CoursePreview.vue";
import OrderCourse from "@/features/infoproducts/components/course/OrderCourse.vue";
import AddClass from "@/features/infoproducts/components/course/modules/classes/addClass.vue";
import EditClass from "@/features/infoproducts/components/course/modules/classes/editClass.vue";

const STORAGE_URL = import.meta.env.VITE_APP_STORAGE_URL;

const props = defineProps({
  modules: {
    type: Array,
    required: true,
  },

  courses: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits([
  "refresh",
  "modulesUpdated",
]);

const message =
  "Este curso no cuenta con módulos";

const mutableModules = ref([]);
const mutableModule = ref({});
const mutableClass = ref({});

const mutableResources = ref([]);
const mutableVideo = ref([]);
const observations = ref([]);

const title = ref("");
const showDialogAddModule = ref(false);

const deleteModuleModal = ref(false);
const createClassModal = ref(false);
const deleteClassModal = ref(false);
const editClassModal = ref(false);

const visibleConfigure = ref(false);
const outerVisible = ref(false);
const orderModal = ref(false);

const storingModule = ref(false);
const deletingModule = ref(false);
const deletingClass = ref(false);
const sendingRequest = ref(false);
const loadingClassDetails = ref(false);

const moduleItemRefs = new Map();

watch(
  () => props.modules,
  (modules) => {
    mutableModules.value = Array.isArray(modules)
      ? modules.map((moduleItem) => ({
          ...moduleItem,
        }))
      : [];
  },
  {
    immediate: true,
    deep: true,
  },
);

watch(
  () => props.courses?.id,
  async (courseId) => {
    if (!courseId) {
      observations.value = [];
      return;
    }

    await listObservations();
  },
  {
    immediate: true,
  },
);

function setModuleItemRef(
  component,
  moduleId,
) {
  const id = Number(moduleId);

  if (component) {
    moduleItemRefs.set(id, component);
  } else {
    moduleItemRefs.delete(id);
  }
}

function resolveStorageUrl(path) {
  if (!path) {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${STORAGE_URL}/${path}`;
}

function toggleCreateModule() {
  showDialogAddModule.value =
    !showDialogAddModule.value;

  if (!showDialogAddModule.value) {
    title.value = "";
  }
}

function cancelCreateModule() {
  title.value = "";
  showDialogAddModule.value = false;
}

function openModalCertificate() {
  visibleConfigure.value = true;
}

function closeModalCertificate() {
  visibleConfigure.value = false;
}

function openModalPreview() {
  outerVisible.value = true;
}

function openOrderModal() {
  orderModal.value = true;
}

async function closeOrderModal() {
  orderModal.value = false;

  await refreshClassData();

  /*
   * El componente padre debe recargar los módulos,
   * porque su orden pudo haber cambiado.
   */
  emit("refresh");
}

function showDeleteModuleModal(moduleSelected) {
  mutableModule.value = {
    ...moduleSelected,
  };

  deleteModuleModal.value = true;
}

function showAddClassModal(moduleSelected) {
  mutableModule.value = {
    ...moduleSelected,
  };

  createClassModal.value = true;
}

function showDeleteClassModal(classSelected) {
  mutableClass.value = {
    ...classSelected,
  };

  deleteClassModal.value = true;
}

async function showEditClassModal(classSelected) {
  mutableClass.value = {
    ...classSelected,
  };

  mutableResources.value = [];
  mutableVideo.value = [];

  editClassModal.value = true;
  loadingClassDetails.value = true;

  try {
    const response = await courseModuleService.getClassDetails(classSelected.id);

    const details =
      response.data?.data ??
      response.data ??
      {};

    const resources = Array.isArray(
      details.resources,
    )
      ? details.resources
      : [];

    const videos = Array.isArray(details.video)
      ? details.video
      : [];

    mutableClass.value = {
      ...classSelected,
      has_video: videos.length > 0,
    };

    mutableResources.value = resources.map(
      (resource) => ({
        name: resource.filename,
        url: resolveStorageUrl(
          resource.resource_file,
        ),
        resource_file:
          resource.resource_file,
      }),
    );

    mutableVideo.value =
      videos.length > 0
        ? [
            {
              name: videos[0].filename,
              url: resolveStorageUrl(
                videos[0].path,
              ),
              path: videos[0].path,
            },
          ]
        : [];
  } catch (error) {
    console.error(
      "Error al obtener los detalles de la clase:",
      error,
    );

    editClassModal.value = false;

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudieron cargar los detalles de la clase.",
    );
  } finally {
    loadingClassDetails.value = false;
  }
}

function validateModuleFields() {
  const moduleTitle = title.value.trim();

  if (!moduleTitle) {
    ElMessage.warning(
      "El título está vacío.",
    );

    return false;
  }

  if (moduleTitle.length > 255) {
    ElMessage.warning(
      "El título no puede superar los 255 caracteres.",
    );

    return false;
  }

  if (!props.courses?.id) {
    ElMessage.warning(
      "No se encontró el curso.",
    );

    return false;
  }

  return true;
}

async function storeModule() {
  if (
    !validateModuleFields() ||
    storingModule.value
  ) {
    return;
  }

  storingModule.value = true;

  const formData = new FormData();

  formData.append(
    "name",
    title.value.trim(),
  );

  formData.append(
    "course_id",
    String(props.courses.id),
  );

  try {
    const response = await courseModuleService.storeModule(formData);

    const payload =
      response.data?.data ??
      response.data ??
      {};

    if (payload.status !== "ok") {
      ElMessage.warning(
        response.data?.message ??
          "Error al validar los datos.",
      );

      return;
    }

    if (Array.isArray(payload.modules)) {
      mutableModules.value =
        payload.modules;
    }

    title.value = "";
    showDialogAddModule.value = false;

    ElMessage.success(
      "El módulo ha sido registrado correctamente.",
    );

    emit(
      "modulesUpdated",
      [...mutableModules.value],
    );
  } catch (error) {
    console.error(
      "Error al registrar el módulo:",
      error,
    );

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudo registrar el módulo.",
    );
  } finally {
    storingModule.value = false;
  }
}

async function deleteModule() {
  if (
    !mutableModule.value?.id ||
    deletingModule.value
  ) {
    return;
  }

  deletingModule.value = true;

  try {
    const response = await courseModuleService.deleteModule(mutableModule.value.id);

    const payload =
      response.data?.data ??
      response.data ??
      {};

    if (payload.status !== "ok") {
      ElMessage.warning(
        response.data?.message ??
          "Error al validar los datos.",
      );

      return;
    }

    if (Array.isArray(payload.modules)) {
      mutableModules.value =
        payload.modules;
    } else {
      mutableModules.value =
        mutableModules.value.filter(
          (moduleItem) =>
            Number(moduleItem.id) !==
            Number(mutableModule.value.id),
        );
    }

    deleteModuleModal.value = false;

    ElMessage.success(
      "Módulo eliminado correctamente.",
    );

    emit(
      "modulesUpdated",
      [...mutableModules.value],
    );
  } catch (error) {
    console.error(
      "Error al eliminar el módulo:",
      error,
    );

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudo eliminar el módulo.",
    );
  } finally {
    deletingModule.value = false;
  }
}

async function deleteClass() {
  if (
    !mutableClass.value?.id ||
    deletingClass.value
  ) {
    return;
  }

  deletingClass.value = true;

  try {
    const response = await courseModuleService.deleteClass(mutableClass.value.id);

    const payload =
      response.data?.data ??
      response.data ??
      {};

    const successful =
      payload.status === "ok" ||
      payload.status === true ||
      payload.status === 1;

    if (!successful) {
      ElMessage.warning(
        response.data?.message ??
          "Error al validar los datos.",
      );

      return;
    }

    deleteClassModal.value = false;

    ElMessage.success(
      "La clase ha sido eliminada correctamente.",
    );

    await refreshClassData();
  } catch (error) {
    console.error(
      "Error al eliminar la clase:",
      error,
    );

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudo eliminar la clase.",
    );
  } finally {
    deletingClass.value = false;
  }
}

async function handleClassCreated() {
  createClassModal.value = false;

  await refreshClassData(
    mutableModule.value.id,
  );
}

async function handleClassUpdated() {
  editClassModal.value = false;

  await Promise.all([
    refreshClassData(),
    listObservations(),
  ]);
}

function handleModuleUpdated(updatedModule) {
  const moduleIndex =
    mutableModules.value.findIndex(
      (moduleItem) =>
        Number(moduleItem.id) ===
        Number(updatedModule.id),
    );

  if (moduleIndex === -1) {
    return;
  }

  mutableModules.value[moduleIndex] = {
    ...updatedModule,
  };

  emit(
    "modulesUpdated",
    [...mutableModules.value],
  );
}

async function refreshClassData(
  moduleId = null,
) {
  if (moduleId !== null) {
    const component =
      moduleItemRefs.get(Number(moduleId));

    await component?.listClasses?.();
    return;
  }

  const requests = Array.from(
    moduleItemRefs.values(),
  ).map((component) =>
    component?.listClasses?.(),
  );

  await Promise.allSettled(requests);
}

async function listObservations() {
  if (!props.courses?.id) {
    observations.value = [];
    return;
  }

  try {
    const response = await courseModuleService.listObservations(
      props.courses.id,
    );

    observations.value =
      Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? [];
  } catch (error) {
    observations.value = [];

    console.error(
      "Error al obtener las observaciones:",
      error,
    );
  }
}

async function sendRequest(courseId) {
  if (!courseId || sendingRequest.value) {
    return;
  }

  sendingRequest.value = true;

  try {
    const response = await courseModuleService.sendRequest(courseId);

    const result =
      response.data?.data?.data ??
      response.data?.data ??
      response.data;

    const messages = {
      ok: {
        method: "success",
        text: "Curso enviado a revisión correctamente.",
      },

      request: {
        method: "warning",
        text: "Ya se ha enviado el curso para su revisión.",
      },

      empty: {
        method: "warning",
        text: "El curso debe tener al menos un módulo y una clase.",
      },

      misconfigured: {
        method: "warning",
        text: "Configure la entrega del certificado.",
      },

      signaturetemplate: {
        method: "warning",
        text: "Seleccione la plantilla y la firma para el certificado.",
      },
    };

    const notification =
      messages[result];

    if (!notification) {
      ElMessage.warning(
        "Error al validar los datos.",
      );

      return;
    }

    ElMessage[notification.method](
      notification.text,
    );
  } catch (error) {
    console.error(
      "Error al solicitar la revisión:",
      error,
    );

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudo enviar el curso a revisión.",
    );
  } finally {
    sendingRequest.value = false;
  }
}

onBeforeUnmount(() => {
  moduleItemRefs.clear();
});

defineExpose({
  refreshClassData,
  listObservations,
});
</script>