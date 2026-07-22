<template>
  <div>
    <form @submit.prevent="updateClass">
      <div
        v-loading="loading"
        class="row"
        element-loading-text="Tu video se está procesando. Por favor, espera a que termine."
        element-loading-background="rgba(0, 0, 0, 0.6)"
      >
        <!-- Observación -->
        <div
          v-if="hasObservation"
          class="col-lg-12"
        >
          <div
            class="alert alert-warning"
            role="alert"
          >
            <h4 class="alert-heading">
              Observación
            </h4>

            <p class="p-2">
              {{ observationData.description }}
            </p>
          </div>
        </div>

        <!-- Título -->
        <div class="col-lg-12 mb-2">
          <label for="class-title">
            Título
          </label>

          <el-input
            id="class-title"
            v-model="form.name"
            placeholder="Título de la clase"
            maxlength="254"
            show-word-limit
          />
        </div>

        <!-- Descripción -->
        <div class="col-lg-12 mb-2">
          <label for="class-description">
            Descripción
          </label>

          <el-input
            id="class-description"
            v-model="form.description"
            type="textarea"
            placeholder="Descripción de la clase"
            resize="none"
            :rows="6"
          />
        </div>

        <!-- Video -->
        <div class="col-lg-6 col-md-12 text-center">
          <label>Video de la clase</label>

          <el-upload
            ref="uploadClassVideo"
            v-model:file-list="fileVideoList"
            class="upload-demo"
            action="#"
            drag
            accept=".mp4,video/mp4"
            :limit="1"
            :auto-upload="true"
            :disabled="loadingVideo || isSubmitting"
            :before-upload="validateVideoBeforeUpload"
            :http-request="uploadVideoToS3"
            :on-exceed="handleExceedVideo"
            :on-remove="handleRemoveVideo"
            list-type="text"
          >
            <el-icon class="el-icon--upload">
              <UploadFilled />
            </el-icon>

            <div class="el-upload__text">
              Suelta tu archivo aquí o
              <em>haz clic para cargarlo</em>
            </div>

            <template #tip>
              <div class="el-upload__tip">
                Solo archivos MP4 de hasta 630 MB.
              </div>
            </template>
          </el-upload>
        </div>

        <!-- Recursos -->
        <div class="col-lg-6 col-md-12 text-center">
          <label>Recursos</label>

          <el-upload
            ref="uploadResources"
            v-model:file-list="fileResourcesList"
            class="upload-demo"
            action="#"
            drag
            multiple
            :limit="3"
            :auto-upload="false"
            :disabled="isSubmitting"
            :on-change="onUploadResourceChange"
            :on-exceed="handleExceedResources"
            :on-remove="handleRemoveResource"
            list-type="picture"
          >
            <el-icon class="el-icon--upload">
              <UploadFilled />
            </el-icon>

            <div class="el-upload__text">
              Suelta tus archivos aquí o
              <em>haz clic para cargarlos</em>
            </div>

            <template #tip>
              <div class="el-upload__tip">
                Máximo 50 MB por archivo. La carga de recursos es opcional.
              </div>
            </template>
          </el-upload>
        </div>
      </div>

      <!-- Acciones -->
      <div class="row">
        <div
          v-if="!loadingVideo"
          class="col-lg-12 text-center mt-2"
        >
          <el-button
            :disabled="isSubmitting"
            @click="cancel"
          >
            Cancelar
          </el-button>

          <el-button
            type="primary"
            native-type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting || loadingVideo"
          >
            Guardar
          </el-button>

          <div
            class="alert alert-warning review-warning"
            role="alert"
          >
            Al editar la clase, deberás solicitar una nueva revisión.
          </div>
        </div>

        <div
          v-else
          class="col-lg-12 text-center mt-2"
        >
          <p class="mb-2">
            Subiendo video...
          </p>

          <span class="loader" />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import {
  computed,
  reactive,
  ref,
  watch,
} from "vue";

import axios from "axios";
import { ElMessage } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";

import { courseModuleService } from "@/features/infoproducts/services/course/courseModuleService";

const MAX_VIDEO_SIZE = 630 * 1024 * 1024;
const MAX_RESOURCE_SIZE = 50 * 1024 * 1024;

const props = defineProps({
  clas: {
    type: Object,
    required: true,
  },

  resources: {
    type: Array,
    default: () => [],
  },

  video: {
    type: Array,
    default: () => [],
  },

  observations: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "close",
  "saved",
  "video-uploaded",
]);

const uploadClassVideo = ref(null);
const uploadResources = ref(null);

const fileVideoList = ref([]);
const fileResourcesList = ref([]);
const fileResourcesRemoved = ref([]);

const isSubmitting = ref(false);
const loading = ref(false);
const loadingVideo = ref(false);

/*
 * Se usa un formulario local para no modificar directamente
 * el objeto recibido mediante props.
 */
const form = reactive({
  name: "",
  description: "",
});

/**
 * Busca la observación correspondiente a la clase actual.
 */
const observationData = computed(() => {
  const classId = Number(props.clas?.id);

  return (
    props.observations.find(
      (observation) =>
        Number(observation.id_class) === classId,
    ) ?? null
  );
});

const hasObservation = computed(() => {
  return observationData.value !== null;
});

/**
 * Inicializa el formulario cuando cambia la clase.
 */
function initializeForm() {
  form.name = props.clas?.name ?? "";
  form.description = props.clas?.description ?? "";

  fileVideoList.value = Array.isArray(props.video)
    ? [...props.video]
    : [];

  fileResourcesList.value = Array.isArray(props.resources)
    ? [...props.resources]
    : [];

  fileResourcesRemoved.value = [];
}

function validateFields() {
  const title = form.name.trim();
  const description = form.description.trim();

  if (!title) {
    ElMessage.warning("El título está vacío.");
    return false;
  }

  if (title.length >= 255) {
    ElMessage.warning("El título es demasiado largo.");
    return false;
  }

  if (!description) {
    ElMessage.warning("La descripción está vacía.");
    return false;
  }

  if (fileVideoList.value.length === 0) {
    ElMessage.warning("El video de la clase está vacío.");
    return false;
  }

  if (!props.clas?.id) {
    ElMessage.warning("No se encontró la clase seleccionada.");
    return false;
  }

  return true;
}

/**
 * Valida el video antes de enviarlo a S3.
 */
function validateVideoBeforeUpload(rawFile) {
  const extensionIsMp4 =
    rawFile.name.toLowerCase().endsWith(".mp4");

  const mimeTypeIsMp4 =
    rawFile.type === "video/mp4" ||
    rawFile.type === "";

  if (!extensionIsMp4 || !mimeTypeIsMp4) {
    ElMessage.error(
      "Solo puede cargar archivos en formato MP4.",
    );

    return false;
  }

  if (rawFile.size > MAX_VIDEO_SIZE) {
    ElMessage.error(
      "El archivo no debe pesar más de 630 MB.",
    );

    return false;
  }

  return true;
}

/**
 * Realiza la carga directa del video utilizando la URL
 * prefirmada proporcionada por el backend.
 */
async function uploadVideoToS3(options) {
  const {
    file,
    onSuccess,
    onError,
  } = options;

  loadingVideo.value = true;

  try {
    const response = await courseModuleService.getSignedUrlForVideoUpload(
      props.clas.id,
      file.name,
    );

    const signedUrl =
      response.data?.data ??
      response.data?.url;

    if (!signedUrl) {
      throw new Error(
        "El servidor no devolvió una URL de carga válida.",
      );
    }

    await courseModuleService.uploadVideoToSignedUrl(signedUrl, file);

    onSuccess?.({
      status: "ok",
    });

    ElMessage.success(
      "El video fue subido correctamente.",
    );

    emit("video-uploaded", {
      name: file.name,
    });
  } catch (error) {
    console.error(
      "Error al subir el video:",
      error,
    );

    onError?.(error);

    ElMessage.error(
      error.response?.data?.message ??
        "Ocurrió un error al subir el video.",
    );
  } finally {
    loadingVideo.value = false;
  }
}

function handleExceedVideo() {
  ElMessage.warning(
    "Solo puede seleccionar un video.",
  );
}

function handleRemoveVideo(
  _removedFile,
  uploadFiles,
) {
  fileVideoList.value = uploadFiles;
}

/**
 * Valida cada recurso agregado.
 */
function onUploadResourceChange(
  uploadFile,
  uploadFiles,
) {
  const rawFile = uploadFile.raw;

  /*
   * Los archivos que ya existían en el servidor no tienen
   * necesariamente la propiedad raw.
   */
  if (!rawFile) {
    fileResourcesList.value = uploadFiles;
    return;
  }

  if (rawFile.size > MAX_RESOURCE_SIZE) {
    ElMessage.error(
      `El archivo "${uploadFile.name}" no debe pesar más de 50 MB.`,
    );

    fileResourcesList.value = uploadFiles.filter(
      (file) => file.uid !== uploadFile.uid,
    );

    return;
  }

  fileResourcesList.value = uploadFiles;
}

function handleRemoveResource(
  removedFile,
  uploadFiles,
) {
  fileResourcesList.value = uploadFiles;

  /*
   * Solo se registra como eliminado cuando es un recurso
   * existente del servidor. Un archivo nuevo todavía no
   * tiene una URL almacenada.
   */
  if (!removedFile.url) {
    return;
  }

  const alreadyRemoved =
    fileResourcesRemoved.value.some(
      (file) => file.url === removedFile.url,
    );

  if (!alreadyRemoved) {
    fileResourcesRemoved.value.push({
      name: removedFile.name,
      url: removedFile.url,
    });
  }
}

function handleExceedResources() {
  ElMessage.warning(
    "Solo puede seleccionar un máximo de tres recursos.",
  );
}

function hasNewVideo() {
  return fileVideoList.value.some(
    (file) => file.raw instanceof File,
  );
}

function getNewVideo() {
  return fileVideoList.value.find(
    (file) => file.raw instanceof File,
  );
}

function getNewResources() {
  return fileResourcesList.value.filter(
    (resource) =>
      resource.raw instanceof File,
  );
}

function resetAll() {
  isSubmitting.value = false;
  loading.value = false;
  loadingVideo.value = false;

  initializeForm();
}

function cancel() {
  resetAll();
  emit("close");
}

async function updateClass() {
  if (
    !validateFields() ||
    isSubmitting.value
  ) {
    return;
  }

  if (loadingVideo.value) {
    ElMessage.warning(
      "Espere a que termine la carga del video.",
    );

    return;
  }

  const formData = new FormData();

  formData.append(
    "title",
    form.name.trim(),
  );

  formData.append(
    "description",
    form.description.trim(),
  );

  /*
   * Se conserva el comportamiento del componente original.
   * Verifica si el backend realmente espera el ID de la clase
   * en un campo denominado module_id.
   */
  formData.append(
    "module_id",
    String(props.clas.id),
  );

  if (hasNewVideo()) {
    const newVideo = getNewVideo();

    formData.append(
      "video",
      newVideo.raw,
    );
  }

  getNewResources().forEach((resource) => {
    formData.append(
      "resources[]",
      resource.raw,
    );
  });

  fileResourcesRemoved.value.forEach(
    (resource) => {
      formData.append(
        "resourcesRemoved[]",
        resource.url,
      );
    },
  );

  loading.value = true;
  isSubmitting.value = true;

  try {
    const response = await axios.post(
      `/course/module/class/${props.clas.id}/update`,
      formData,
    );

    const status =
      response.data?.data?.status ??
      response.data?.status;

    if (status !== "ok") {
      ElMessage.warning(
        response.data?.message ??
          "Error al validar los datos.",
      );

      return;
    }

    ElMessage.success(
      "La clase ha sido actualizada correctamente.",
    );

    emit("saved", response.data);
    emit("close");
  } catch (error) {
    console.error(
      "Error al actualizar la clase:",
      error,
    );

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudo actualizar la clase.",
    );
  } finally {
    loading.value = false;
    isSubmitting.value = false;
  }
}

watch(
  () => props.clas?.id,
  () => {
    initializeForm();
  },
  {
    immediate: true,
  },
);

watch(
  () => props.video,
  (value) => {
    fileVideoList.value = Array.isArray(value)
      ? [...value]
      : [];
  },
  {
    deep: true,
  },
);

watch(
  () => props.resources,
  (value) => {
    fileResourcesList.value = Array.isArray(value)
      ? [...value]
      : [];

    fileResourcesRemoved.value = [];
  },
  {
    deep: true,
  },
);
</script>

<style scoped>
.observation-text {
  border: 1px solid #ff9f43 !important;
}

.review-warning {
  padding: 5px;
  margin-top: 10px;
}

.loader {
  display: block;
  position: relative;
  width: 80%;
  height: 12px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid #fff;
  border-radius: 10px;
}

.loader::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 40%;
  height: 100%;
  box-sizing: border-box;
  content: "";
  background: #1ae600;
  animation: animloader 2s linear infinite;
}

@keyframes animloader {
  0% {
    left: 0;
    transform: translateX(-100%);
  }

  100% {
    left: 100%;
    transform: translateX(0%);
  }
}
</style>