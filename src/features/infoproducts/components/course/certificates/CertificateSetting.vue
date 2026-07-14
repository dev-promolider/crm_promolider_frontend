
<template>
  <div v-loading="initialLoading">
    <div class="row">
      <!-- Selección del certificado -->
      <div class="col-lg-6">
        <div class="form-group">
          <label for="certificate-select">Certificados:</label>

          <el-select
            id="certificate-select"
            v-model="templateSave"
            placeholder="Seleccione un certificado"
            class="d-inline w-100"
            clearable
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>

      <!-- Previsualización -->
      <div class="col-lg-6 mt-2">
        <div class="form-group">
          <div class="mb-4">
            <button
              type="button"
              class="btn btn-primary"
              @click="openCertificate"
            >
              Previsualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Firma -->
      <div class="col-lg-6">
        <label>Subir firma</label>

        <el-upload
          ref="courseUpload"
          v-model:file-list="fileList"
          class="picture-card"
          action="#"
          drag
          accept=".jpg,.jpeg,.png,.JPG,.JPEG,.PNG"
          :multiple="false"
          :limit="1"
          :auto-upload="false"
          :on-change="onUploadChange"
          :on-exceed="handleExceed"
          :on-remove="handleRemove"
          list-type="picture"
        >
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>

          <div class="el-upload__text">
            Suelta tu archivo aquí o
            <em>haz clic para cargar</em>
          </div>

          <template #tip>
            <div class="el-upload__tip">
              Solo archivos JPG o PNG con un tamaño máximo de 100 KB.
            </div>
          </template>
        </el-upload>
      </div>
    </div>

    <!-- Guardar configuración -->
    <div class="row mt-2">
      <div class="mx-auto">
        <button
          type="button"
          class="btn text-center btn-primary"
          :disabled="requestLoading"
          @click="createCertificateConfig"
        >
          <span
            v-if="requestLoading"
            class="spinner-border spinner-border-sm me-2"
          />

          {{ requestLoading ? "Guardando..." : "Guardar" }}
        </button>
      </div>
    </div>

    <!-- HTML del certificado -->
    <div v-if="certificateTemplate" class="row mt-2">
      <div class="col-lg-12">
        <div class="form-group">
          <div
            class="d-flex justify-content-center certificate-preview"
            v-html="certificateTemplate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import apiClient from "@/services/apiClient";

const STORAGE_URL = import.meta.env.VITE_APP_STORAGE_URL;

const initialLoading = ref(false);
const requestLoading = ref(false);

const certificates = ref([]);
const options = ref([]);

const templateSave = ref(null);
const certificateTemplate = ref("");

const imgSignature = ref("");
const signatureFile = ref(null);
const fileList = ref([]);

const courseUpload = ref(null);

// Obtiene nombre del archivo desde la ruta almacenada
function getNameSignature(signature) {
  if (!signature) {
    return "";
  }

  const routeParts = signature.split("/");
  return routeParts.at(-1);
}

// Muestra en el componente Upload la firma que ya está guardada.
function fillFiles() {
  if (!imgSignature.value) {
    fileList.value = [];
    return;
  }

  fileList.value = [
    {
      name: getNameSignature(imgSignature.value),
      url: `${STORAGE_URL}/${imgSignature.value}?a=${Math.random()}`,
      status: "success",
    },
  ];
}

// Obtiene los certificados y la configuración almacenada.
async function listCertificates() {
  initialLoading.value = true;

  try {
    const response = await apiClient.get("/config/certificates/list");

    const certificatesData = response.data?.[0] ?? [];
    const signatureConfig = response.data?.[1]?.[0];
    const certificateConfig = response.data?.[2]?.[0];

    certificates.value = certificatesData;

    options.value = certificatesData.map((certificate) => ({
      value: Number(certificate.id),
      label: certificate.name,
    }));

    if (certificateConfig?.value !== undefined) {
      templateSave.value = Number(certificateConfig.value);
    }

    if (signatureConfig?.value) {
      imgSignature.value = signatureConfig.value;
      fillFiles();
    }
  } catch (error) {
    console.error("Error al listar certificados:", error);

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudieron cargar los certificados.",
    );
  } finally {
    initialLoading.value = false;
  }
}

// Previsualiza el certificado seleccionado.
function openCertificate() {
  if (
    templateSave.value === null ||
    templateSave.value === undefined ||
    templateSave.value === ""
  ) {
    ElMessage.warning("Seleccione un certificado.");
    return;
  }

  const selectedCertificate = certificates.value.find(
    (certificate) =>
      Number(certificate.id) === Number(templateSave.value),
  );

  if (!selectedCertificate) {
    ElMessage.warning("No se encontró el certificado seleccionado.");
    return;
  }

  certificateTemplate.value = selectedCertificate.template ?? "";
}

// Guarda el certificado seleccionado y la firma.
async function createCertificateConfig() {
  let templateId = -1;

  if (
    templateSave.value !== null &&
    templateSave.value !== undefined &&
    templateSave.value !== ""
  ) {
    const selectedCertificate = certificates.value.find(
      (certificate) =>
        Number(certificate.id) === Number(templateSave.value),
    );

    if (selectedCertificate) {
      templateId = Number(selectedCertificate.id);
    }
  }

  // Se acepta la firma existente como una firma válida, aunque el usuario no haya seleccionado un archivo nuevo.
  const hasSignature =
    signatureFile.value instanceof File || Boolean(imgSignature.value);

  if (templateId === -1 && !hasSignature) {
    ElMessage.warning("Seleccione un certificado o una imagen.");
    return;
  }

  const formData = new FormData();

  formData.append("id", String(templateId));

  // Solo se envía signature cuando el usuario seleccionaun archivo nuevo.
  if (signatureFile.value instanceof File) {
    formData.append("signature", signatureFile.value);
  }

  requestLoading.value = true;

  try {
    const response = await apiClient.post("/certificates/save", formData);

    // Axios coloca la respuesta enviada por el backend dentro de response.data.
    if (
      response.data === "ok" ||
      response.data?.status === "ok" ||
      response.data?.success === true
    ) {
      ElMessage.success("Registro guardado correctamente.");
      return;
    }

    ElMessage.warning(
      response.data?.message ?? "Error al realizar la acción.",
    );
  } catch (error) {
    console.error("Error al guardar el certificado:", error);

    ElMessage.error(
      error.response?.data?.message ??
        "Error al guardar la configuración.",
    );
  } finally {
    requestLoading.value = false;
  }
}

// Valida la firma seleccionada
function onUploadChange(uploadFile, uploadFiles) {
  const rawFile = uploadFile.raw;

  if (!rawFile) {
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png"];
  const isImage = allowedTypes.includes(rawFile.type);

  // 100 KB
  const isValidSize = rawFile.size <= 100 * 1024;

  if (!isImage) {
    ElMessage.error(
      "Solo puede cargar archivos en formato JPG, JPEG o PNG.",
    );

    courseUpload.value?.clearFiles();
    fileList.value = [];
    signatureFile.value = null;

    return;
  }

  if (!isValidSize) {
    ElMessage.error("El archivo no debe pesar más de 100 KB.");

    courseUpload.value?.clearFiles();
    fileList.value = [];
    signatureFile.value = null;

    return;
  }

  fileList.value = uploadFiles;
  signatureFile.value = rawFile;
}

// Se ejecuta cuando se intenta seleccionar más de un archivo.
function handleExceed() {
  ElMessage.error(
    "Solo puede seleccionar un archivo. Elimine la firma actual para reemplazarla.",
  );
}

// Limpia la firma seleccionada del estado local
function handleRemove(uploadFile, uploadFiles) {
  fileList.value = uploadFiles;
  signatureFile.value = null;

  // La firma guardada deja de considerarse seleccionada. Para eliminarla también en el backend sería necesario que el endpoint soporte esa operación.
  imgSignature.value = "";
}

onMounted(() => {
  listCertificates();
});
</script>

<style scoped>
.certificate-preview {
  width: 100%;
  overflow-x: auto;
}

.picture-card {
  width: 100%;
}
</style>