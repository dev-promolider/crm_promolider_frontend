<template>
  <el-dialog
    :model-value="visibleConfigure"
    title=""
    top="1vh"
    class="full-screen-dialog"
    append-to-body
    :close-on-click-modal="false"
    @update:model-value="handleDialogVisibility"
  >
    <div v-loading="loading" class="row">
      <div class="col-md-12 col-12">
        <div class="card">
          <div class="card-header">
            <h4 class="card-title">
              Entrega del certificado
            </h4>
          </div>

          <div class="card-body">
            <form class="form" @submit.prevent="store">
              <div class="row">
                <!-- Condición de entrega -->
                <div class="col-12">
                  <div class="form-group">
                    <label class="d-block">
                      Seleccione la condición que se debe cumplir para entregar
                      un certificado
                    </label>

                    <div class="d-inline py-2">
                      <div>
                        <input
                          id="radio1"
                          v-model="conditionSelected"
                          type="radio"
                          name="certificateCondition"
                          :value="0"
                        />

                        <label for="radio1">
                          Visualizar videos
                        </label>
                      </div>

                      <div>
                        <input
                          id="radio2"
                          v-model="conditionSelected"
                          type="radio"
                          name="certificateCondition"
                          :value="1"
                        />

                        <label for="radio2">
                          Aprobar exámenes
                        </label>
                      </div>

                      <div>
                        <input
                          id="radio3"
                          v-model="conditionSelected"
                          type="radio"
                          name="certificateCondition"
                          :value="2"
                        />

                        <label for="radio3">
                          Visualizar videos y aprobar exámenes
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- Alcance de videos -->
                  <div
                    v-if="showVideos"
                    class="form-group"
                  >
                    <label>
                      Determine el límite de videos que se tendrá que visualizar
                    </label>

                    <el-select
                      v-model="form.type"
                      placeholder="Seleccione cuándo entregar el certificado"
                      class="d-inline"
                      clearable
                      @change="handleChangeCourse"
                    >
                      <el-option
                        v-for="type in typeList"
                        :key="type.value"
                        :label="type.label"
                        :value="type.value"
                      />
                    </el-select>
                  </div>
                </div>

                <!-- Módulo -->
                <div
                  v-if="form.type === 2 || form.type === 3"
                  class="col-lg-3 col-md-3 col-sm-6"
                >
                  <div class="form-group">
                    <label>Seleccione el módulo:</label>

                    <el-select
                      v-model="form.module"
                      placeholder="Seleccione un módulo"
                      class="d-inline"
                      clearable
                      @change="handleChangeModule"
                    >
                      <el-option
                        v-for="moduleItem in modules"
                        :key="moduleItem.id"
                        :label="moduleItem.name"
                        :value="Number(moduleItem.id)"
                      />
                    </el-select>
                  </div>
                </div>

                <!-- Clase -->
                <div
                  v-if="form.type === 3"
                  class="col-lg-3 col-md-3 col-sm-6"
                >
                  <div class="form-group">
                    <label>Seleccione la clase:</label>

                    <el-select
                      v-model="form.lesson"
                      placeholder="Seleccione una clase"
                      class="d-inline"
                      clearable
                    >
                      <el-option
                        v-for="lessonItem in lessons"
                        :key="lessonItem.id"
                        :label="lessonItem.name"
                        :value="Number(lessonItem.id)"
                      />
                    </el-select>
                  </div>
                </div>

                <!-- Certificado personalizado -->
                <div class="col-lg-6">
                  <div class="form-group">
                    <label>
                      ¿El certificado será personalizado?
                    </label>

                    <select
                      v-model="form.customized_certificate"
                      class="form-control"
                    >
                      <option :value="null" disabled>
                        Seleccione una opción
                      </option>

                      <option
                        v-for="option in customizationOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Certificado pagado -->
                <div class="col-12">
                  <div class="d-flex justify-content-start align-items-center">
                    <p class="m-0">
                      ¿Se pagará por el certificado?
                    </p>

                    <input
                      v-model="form.type_certificate_check"
                      class="mx-2"
                      type="checkbox"
                    />
                  </div>
                </div>

                <!-- Precio -->
                <div
                  v-if="form.type_certificate_check"
                  class="col-lg-3 col-md-4 col-sm-6"
                >
                  <div class="form-group py-2">
                    <label>Precio del certificado:</label>

                    <el-input
                      v-model="form.certificate_price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Escriba el precio"
                    />
                  </div>
                </div>

                <!-- Guardar -->
                <div class="col-12">
                  <div class="d-flex justify-content-center">
                    <button
                      type="submit"
                      class="btn btn-success"
                      :disabled="isSubmitting"
                    >
                      <span
                        v-if="isSubmitting"
                        class="spinner-border spinner-border-sm me-2"
                        role="status"
                      />

                      {{ isSubmitting ? "Guardando..." : "Guardar" }}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import {
  computed,
  reactive,
  ref,
  watch,
} from "vue";

import { ElMessage } from "element-plus";
import courseCertificateService from "@/features/infoproducts/services/course/courseCertificateService";
import axios from "axios";

const props = defineProps({
  visibleConfigure: {
    type: Boolean,
    required: true,
  },

  course: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits([
  "closeModalCertificate",
  "update:visibleConfigure",
]);

const isSubmitting = ref(false);
const loading = ref(false);

const modules = ref([]);
const lessons = ref([]);

const courseConfiguration = ref({});
const conditionSelected = ref(null);

const typeList = [
  {
    value: 1,
    label: "Curso",
  },
  {
    value: 2,
    label: "Módulo",
  },
  {
    value: 3,
    label: "Clase",
  },
];

const customizationOptions = [
  {
    value: 0,
    label: "No",
  },
  {
    value: 1,
    label: "Sí",
  },
];

const form = reactive({
  type: null,
  lesson: null,
  module: null,
  customized_certificate: null,
  type_certificate_check: false,
  type_certificate: 1,
  certificate_price: 0,
});

/**
 * La condición 0 requiere videos.
 * La condición 1 requiere solamente exámenes.
 * La condición 2 requiere videos y exámenes.
 */
const showVideos = computed(() => {
  return (
    conditionSelected.value === 0 ||
    conditionSelected.value === 2
  );
});

function resetForm() {
  Object.assign(form, {
    type: null,
    lesson: null,
    module: null,
    customized_certificate: null,
    type_certificate_check: false,
    type_certificate: 1,
    certificate_price: 0,
  });

  conditionSelected.value = null;
  lessons.value = [];
  courseConfiguration.value = {};
}

function handleDialogVisibility(value) {
  if (!value) {
    close();
  }
}

function close() {
  emit("update:visibleConfigure", false);
  emit("closeModalCertificate");
}

function handleChangeCourse() {
  form.module = null;
  form.lesson = null;
  lessons.value = [];
}

async function handleChangeModule(moduleId) {
  form.lesson = null;
  lessons.value = [];

  if (!moduleId) {
    return;
  }

  await listLessons(moduleId);
}

async function listModules() {
  if (!props.course?.id) {
    modules.value = [];
    return;
  }

  try {
    const response = await courseCertificateService.listModules(props.course.id);

    modules.value = response.data?.data ?? [];
  } catch (error) {
    modules.value = [];

    console.error("Error al obtener los módulos:", error);

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudieron obtener los módulos.",
    );
  }
}

async function listLessons(moduleId) {
  if (!moduleId) {
    lessons.value = [];
    return;
  }

  try {
    const response = await courseCertificateService.listLessons(moduleId);

    lessons.value = response.data ?? [];
  } catch (error) {
    lessons.value = [];

    console.error("Error al obtener las clases:", error);

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudieron obtener las clases.",
    );
  }
}

function validateFields() {
  if (conditionSelected.value === null) {
    ElMessage.warning(
      "Seleccione una condición para entregar un certificado.",
    );

    return false;
  }

  /*
   * Cuando la condición es solamente aprobar exámenes,
   * no es necesario seleccionar el límite de videos.
   */
  if (conditionSelected.value !== 1) {
    if (form.type === null) {
      ElMessage.warning(
        "Seleccione cuándo entregar el certificado.",
      );

      return false;
    }

    if (
      (form.type === 2 || form.type === 3) &&
      form.module === null
    ) {
      ElMessage.warning("Seleccione un módulo.");
      return false;
    }

    if (
      form.type === 3 &&
      form.lesson === null
    ) {
      ElMessage.warning("Seleccione una clase.");
      return false;
    }
  }

  if (form.type_certificate_check) {
    const certificatePrice = Number(form.certificate_price);

    if (
      !Number.isFinite(certificatePrice) ||
      certificatePrice <= 0
    ) {
      ElMessage.warning(
        "Ingrese un precio válido mayor que cero.",
      );

      return false;
    }
  }

  if (
    form.customized_certificate === null ||
    form.customized_certificate === undefined
  ) {
    ElMessage.warning(
      "Seleccione si el certificado será personalizado.",
    );

    return false;
  }

  return true;
}

async function store() {
  if (!validateFields()) {
    return;
  }

  if (!props.course?.id) {
    ElMessage.warning("No se encontró el curso seleccionado.");
    return;
  }

  isSubmitting.value = true;
  loading.value = true;

  try {
    form.type_certificate = form.type_certificate_check ? 0 : 1;

    const formData = new FormData();

    formData.append("type", form.type ?? "");
    formData.append("course", String(props.course.id));
    formData.append("module", form.module ?? "");
    formData.append("lesson", form.lesson ?? "");
    formData.append("type_certificate", String(form.type_certificate));
    formData.append("certificate_price", form.type_certificate_check ? String(Number(form.certificate_price)) : "0");
    formData.append("condition_to_certificate", String(conditionSelected.value));
    formData.append("customized_certificate", String(form.customized_certificate));

    const response = await courseCertificateService.storeConfiguration(formData);

    if (response.status === 200) {
      ElMessage.success(
        "El curso ha sido actualizado correctamente.",
      );

      close();
      return;
    }

    ElMessage.warning("Error al validar los datos.");
  } catch (error) {
    console.error(
      "Error al guardar la configuración:",
      error,
    );

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudo guardar la configuración.",
    );
  } finally {
    isSubmitting.value = false;
    loading.value = false;
  }
}

async function getConfiguration() {
  if (!props.course?.id) {
    return;
  }

  try {
    const response = courseCertificateService.getConfiguration(props.course.id);

    courseConfiguration.value = response.data ?? {};

    const configuration = courseConfiguration.value;

    conditionSelected.value =
      configuration.condition_to_certificate !== undefined &&
      configuration.condition_to_certificate !== null
        ? Number(configuration.condition_to_certificate)
        : null;

    form.customized_certificate =
      configuration.customized_certificate !== undefined &&
      configuration.customized_certificate !== null
        ? Number(configuration.customized_certificate)
        : null;

    form.type_certificate =
      configuration.type_certificate !== undefined
        ? Number(configuration.type_certificate)
        : 1;

    form.type_certificate_check =
      form.type_certificate === 0;

    form.certificate_price =
      configuration.certificate_price ?? 0;

    switch (configuration.validated_by) {
      case "course":
        form.type = 1;
        break;

      case "module":
        form.type = 2;
        form.module = Number(configuration.data?.module);
        break;

      case "lesson":
        form.type = 3;
        form.module = Number(configuration.data?.module);

        await listLessons(form.module);

        form.lesson = Number(configuration.data?.lesson);
        break;

      default:
        form.type = null;
        break;
    }
  } catch (error) {
    /*
     * Es posible que un curso todavía no tenga una
     * configuración creada. En ese caso se deja el
     * formulario vacío.
     */
    console.error(
      "Error al obtener la configuración:",
      error,
    );
  }
}

async function loadConfigurationData() {
  if (!props.course?.id) {
    return;
  }

  loading.value = true;
  resetForm();

  try {
    await Promise.all([
      listModules(),
      getConfiguration(),
    ]);
  } finally {
    loading.value = false;
  }
}

/*
 * Se cargan los datos cuando se abre el modal.
 * Esto funciona mejor que created() cuando el componente
 * permanece montado y se abre varias veces.
 */
watch(
  [
    () => props.visibleConfigure,
    () => props.course?.id,
  ],
  async ([visible, courseId]) => {
    if (visible && courseId) {
      await loadConfigurationData();
    }
  },
  {
    immediate: true,
  },
);
</script>