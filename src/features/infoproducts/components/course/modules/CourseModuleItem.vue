<template>
  <li class="list-group-item pt-1 pb-2">
    <!-- Encabezado del módulo -->
    <div class="row">
      <div class="col-sm-12 col-md-12 col-lg-12 mb-1">
        <div class="module-header">
          <div class="module-title-container">
            <h3 class="module-number">
              <slot>
                Módulo {{ index + 1 }}:
              </slot>
            </h3>

            <el-input
              v-model="moduleName"
              class="input-module"
              placeholder="Nombre del módulo"
              maxlength="255"
              @keyup.enter="editModule"
            />

            <button
              type="button"
              class="btn btn-outline-primary p-0 btn-size"
              :disabled="savingModule"
              title="Guardar módulo"
              @click="editModule"
            >
              <el-icon :size="22">
                <Check />
              </el-icon>
            </button>

            <button
              type="button"
              class="btn btn-outline-danger p-0 btn-size"
              :disabled="savingModule"
              title="Eliminar módulo"
              @click="deleteModule"
            >
              <el-icon :size="22">
                <Delete />
              </el-icon>
            </button>
          </div>

          <div class="tooltip-container">
            <button
              type="button"
              class="btn btn-outline-secondary p-0 btn-size"
              aria-label="Incorporar clase"
              @click="addClass"
            >
              <el-icon :size="22">
                <Plus />
              </el-icon>
            </button>

            <span class="tooltip-text">
              Incorporar clase
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de clases -->
    <div class="row">
      <div class="col-sm-12 col-md-12 col-lg-12">
        <div
          v-if="loadingClasses"
          v-loading="loadingClasses"
          class="classes-loading"
          element-loading-text="Cargando clases..."
        />

        <ol v-else class="list-group">
          <CourseModuleClass
            v-for="(classItem, classIndex) in classes"
            :key="classItem.id"
            :module="module"
            :observations="observations"
            :clas="classItem"
            @delete-class="handleDeleteClass"
            @edit-class="handleEditClass"
          >
            {{ classIndex + 1 }}
          </CourseModuleClass>
        </ol>

        <div
          v-if="!loadingClasses && classes.length === 0"
          class="empty-classes"
        >
          Este módulo todavía no tiene clases.
        </div>
      </div>
    </div>
  </li>
</template>

<script setup>
import {
  ref,
  watch,
} from "vue";

import { ElMessage } from "element-plus";
import {
  Check,
  Delete,
  Plus,
} from "@element-plus/icons-vue";

import { courseModuleService } from "@/features/infoproducts/services/course/courseModuleService";
import CourseModuleClass from "@/features/infoproducts/components/course/modules/classes/CourseModuleClass.vue";

const props = defineProps({
  module: {
    type: Object,
    required: true,
  },

  course: {
    type: Object,
    required: true,
  },

  index: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits([
  "delete",
  "addClass",
  "deleteClass",
  "editClass",
  "moduleUpdated",
]);

const moduleName = ref("");
const classes = ref([]);
const observations = ref([]);

const loadingClasses = ref(false);
const savingModule = ref(false);

function deleteModule() {
  emit("delete", props.module);
}

function addClass() {
  emit("addClass", props.module);
}

function handleDeleteClass(classSelected) {
  emit("deleteClass", classSelected);
}

function handleEditClass(classSelected) {
  emit("editClass", classSelected);
}

function validateFields() {
  const name = moduleName.value.trim();

  if (!name) {
    ElMessage.warning("El título está vacío.");
    return false;
  }

  if (name.length > 255) {
    ElMessage.warning(
      "El título no puede superar los 255 caracteres.",
    );

    return false;
  }

  if (!props.module?.id) {
    ElMessage.warning(
      "No se encontró el módulo seleccionado.",
    );

    return false;
  }

  return true;
}

async function editModule() {
  if (!validateFields() || savingModule.value) {
    return;
  }

  savingModule.value = true;

  try {
    const response = await courseModuleService.editModule(
      props.module.id,
      moduleName,
    );

    /*
     * El backend original aparentemente devuelve el nombre
     * directamente. También se admite que devuelva un objeto.
     */
    const updatedName =
      typeof response.data === "string"
        ? response.data
        : response.data?.name ?? moduleName.value.trim();

    moduleName.value = updatedName;

    /*
     * No modificamos props.module directamente.
     * El padre recibe el módulo actualizado.
     */
    emit("moduleUpdated", {
      ...props.module,
      name: updatedName,
    });

    ElMessage.success(
      "Módulo modificado correctamente.",
    );
  } catch (error) {
    console.error(
      "Error al actualizar el módulo:",
      error,
    );

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudo actualizar el módulo.",
    );
  } finally {
    savingModule.value = false;
  }
}

async function listClasses() {
  if (!props.module?.id) {
    classes.value = [];
    return;
  }

  try {
    const response = await courseModuleService.listLessons(props.module.id);

    classes.value = Array.isArray(response.data)
      ? response.data
      : [];
  } catch (error) {
    classes.value = [];

    console.error(
      "Error al obtener las clases:",
      error,
    );

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudieron cargar las clases.",
    );
  }
}

async function listObservations() {
  if (!props.course?.id) {
    observations.value = [];
    return;
  }

  try {
    const response = await courseModuleService.listObservations(
      props.course.id,
    );

    observations.value = Array.isArray(response.data)
      ? response.data
      : [];
  } catch (error) {
    observations.value = [];

    console.error(
      "Error al obtener las observaciones:",
      error,
    );
  }
}

async function loadModuleData() {
  loadingClasses.value = true;

  try {
    await Promise.all([
      listClasses(),
      listObservations(),
    ]);
  } finally {
    loadingClasses.value = false;
  }
}

/*
 * Actualiza el input si el padre cambia el módulo seleccionado.
 */
watch(
  () => props.module?.name,
  (value) => {
    moduleName.value = value ?? "";
  },
  {
    immediate: true,
  },
);

/*
 * Carga nuevamente las clases si cambia el módulo
 * o el curso.
 */
watch(
  [
    () => props.module?.id,
    () => props.course?.id,
  ],
  ([moduleId, courseId]) => {
    if (moduleId && courseId) {
      loadModuleData();
    }
  },
  {
    immediate: true,
  },
);

/*
 * Permite que el componente padre refresque las clases
 * usando una referencia al componente.
 */
defineExpose({
  listClasses,
  listObservations,
  loadModuleData,
});
</script>

<style scoped>
.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.module-title-container {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
}

.module-number {
  display: inline-block;
  margin: 0;
  font-size: 1.25rem;
  white-space: nowrap;
}

.input-module {
  width: 40%;
}

.btn-size {
  display: inline-flex;
  width: 45px;
  height: 40px;
  align-items: center;
  justify-content: center;
}

.classes-loading {
  min-height: 100px;
}

.empty-classes {
  padding: 15px;
  color: #6c757d;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-container .tooltip-text {
  position: absolute;
  bottom: 125%;
  left: 50%;
  z-index: 10;
  width: auto;
  padding: 8px 12px;
  color: #fff;
  font-size: 11px;
  font-weight: 300;
  text-align: center;
  white-space: nowrap;
  visibility: hidden;
  opacity: 0;
  background-color: #ff9f43;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(255, 159, 67, 0.45);
  transform: translateX(-50%);
  transition:
    opacity 0.3s,
    visibility 0.3s,
    transform 0.3s;
}

.tooltip-container .tooltip-text::after {
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  content: "";
  border-width: 5px;
  border-style: solid;
  border-color: #ff9f43 transparent transparent transparent;
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(-5px);
}

@media (max-width: 800px) {
  .module-header {
    align-items: flex-start;
  }

  .module-title-container {
    flex-wrap: wrap;
  }

  .module-number {
    width: 100%;
  }

  .input-module {
    width: 100%;
    margin: 10px 0;
  }

  .btn-size {
    width: 45px;
    height: 40px;
  }
}
</style>