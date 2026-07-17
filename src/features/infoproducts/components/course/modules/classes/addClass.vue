<template>
  <div>
    <form @submit.prevent="storeClass">
      <div
        v-loading="loading"
        class="row"
        element-loading-text="Creando clase"
        element-loading-background="rgba(0, 0, 0, 0.6)"
      >
        <!-- Título -->
        <div class="col-lg-12 mb-2">
          <label for="class-title">Título</label>

          <el-input
            id="class-title"
            v-model="form.name"
            placeholder="Título de la clase"
            type="text"
            maxlength="254"
            class="w-100"
          />
        </div>

        <!-- Descripción -->
        <div class="col-lg-12 mb-2">
          <label for="class-description">Descripción</label>

          <el-input
            id="class-description"
            v-model="form.description"
            type="textarea"
            placeholder="Descripción de la clase"
            resize="none"
            :rows="6"
            class="w-100"
          />
        </div>

        <!-- Recursos -->
        <div class="col-lg-12 mb-2">
          <label>Recursos (opcional)</label>

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
            list-type="text"
            :on-change="onUploadResourceChange"
            :on-exceed="handleExceedResources"
            :on-remove="handleRemoveResource"
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
        <div class="col-lg-12 text-center mt-2">
          <el-button
            type="default"
            :disabled="isSubmitting"
            @click="cancel"
          >
            Cancelar
          </el-button>

          <el-button
            type="primary"
            native-type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            Guardar
          </el-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";

import { courseModuleService } from "@/features/infoproducts/services/course/courseModuleService";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 3;

const props = defineProps({
  moduleId: {
    type: [Number, String],
    required: true,
  },
});

const emit = defineEmits([
  "close",
  "saved",
]);

const loading = ref(false);
const isSubmitting = ref(false);
const fileResourcesList = ref([]);
const uploadResources = ref(null);

const form = reactive({
  name: "",
  description: "",
});

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

  if (!props.moduleId) {
    ElMessage.warning("No se encontró el módulo seleccionado.");
    return false;
  }

  return true;
}

/**
 * Valida cada archivo agregado.
 *
 * Element Plus entrega:
 * - uploadFile: archivo actual
 * - uploadFiles: lista completa de archivos
 */
function onUploadResourceChange(uploadFile, uploadFiles) {
  const rawFile = uploadFile.raw;
  const fileSize = rawFile?.size ?? uploadFile.size ?? 0;

  if (fileSize > MAX_FILE_SIZE) {
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

function handleRemoveResource(_removedFile, uploadFiles) {
  fileResourcesList.value = uploadFiles;
}

function handleExceedResources(exceededFiles) {
  ElMessage.warning(
    `Solo puede seleccionar ${MAX_FILES} archivos. Intentó agregar ${exceededFiles.length} archivo(s) adicional(es).`,
  );
}

function resetAll() {
  form.name = "";
  form.description = "";

  fileResourcesList.value = [];
  uploadResources.value?.clearFiles();

  loading.value = false;
  isSubmitting.value = false;
}

function cancel() {
  resetAll();
  emit("close");
}

async function storeClass() {
  if (!validateFields() || isSubmitting.value) {
    return;
  }

  const formData = new FormData();

  formData.append("title", form.name.trim());
  formData.append("description", form.description.trim());
  formData.append("module_id", String(props.moduleId));

  fileResourcesList.value.forEach((resource) => {
    if (resource.raw instanceof File) {
      formData.append("resources[]", resource.raw);
    }
  });

  loading.value = true;
  isSubmitting.value = true;

  try {
    const response = await courseModuleService.addClass(props.moduleId, formData);

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

    ElMessage.success("La clase ha sido registrada correctamente.");

    /*
     * El componente padre puede refrescar la lista
     * utilizando la información emitida.
     */
    emit("saved", response.data);
    emit("close");

    resetAll();
  } catch (error) {
    console.error("Error al registrar la clase:", error);

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudo registrar la clase.",
    );
  } finally {
    loading.value = false;
    isSubmitting.value = false;
  }
}
</script>