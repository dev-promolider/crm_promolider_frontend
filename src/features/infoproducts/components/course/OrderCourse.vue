<template>
  <el-dialog
    :model-value="orderModal"
    title="Ordenar clases"
    width="50%"
    :close-on-click-modal="false"
    @update:model-value="handleDialogVisibility"
  >
    <div v-loading="loading">
      <draggable
        v-model="items"
        :item-key="getItemKey"
        group="course-order"
        tag="div"
        class="drag-list"
        :disabled="loading"
        @start="handleDragStart"
        @end="handleDragEnd"
      >
        <template #item="{ element, index }">
          <div>
            <!-- Módulo -->
            <div
              v-if="element.type === 'module'"
              class="drag-module"
            >
              <div>
                <strong>
                  {{ getModuleNumber(index) }}.
                  {{ element.name }}
                </strong>
              </div>
            </div>

            <!-- Clase -->
            <div
              v-else-if="element.type === 'class'"
              class="class-wrapper"
            >
              <div class="drag-class">
                <div class="item">
                  {{ element.name }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </draggable>

      <div
        v-if="!loading && items.length === 0"
        class="empty-state"
      >
        No hay módulos o clases disponibles.
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import axios from "axios";
import draggable from "vuedraggable";
import { ElMessage } from "element-plus";

import { courseService } from "@/features/infoproducts/services/course/courseService";

const props = defineProps({
  courses: {
    type: Object,
    default: null,
  },

  orderModal: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits([
  "closeOrderModal",
  "update:orderModal",
]);

const loading = ref(false);
const dragging = ref(false);
const items = ref([]);

/**
 * Genera una clave estable para cada elemento.
 *
 * Se incluye el tipo porque un módulo y una clase podrían
 * tener el mismo ID.
 */
function getItemKey(element) {
  return `${element.type}-${element.id}`;
}

/**
 * Calcula el número correlativo del módulo según su posición.
 */
function getModuleNumber(index) {
  if (items.value[index]?.type !== "module") {
    return "";
  }

  return items.value
    .slice(0, index + 1)
    .filter((item) => item.type === "module")
    .length;
}

/**
 * Controla el cierre del diálogo de Element Plus.
 */
function handleDialogVisibility(visible) {
  emit("update:orderModal", visible);

  if (!visible) {
    close();
  }
}

function close() {
  dragging.value = false;

  emit("update:orderModal", false);
  emit("closeOrderModal");
}

/**
 * Obtiene el orden actual de módulos y clases.
 */
async function getOrders() {
  if (!props.courses?.id) {
    items.value = [];
    return;
  }

  loading.value = true;

  try {
    const response = await courseService.getOrders(props.courses.id);

    items.value = Array.isArray(response.data)
      ? response.data
      : [];
  } catch (error) {
    items.value = [];

    console.error(
      "Error al obtener el orden del curso:",
      error,
    );

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudo obtener el contenido del curso.",
    );
  } finally {
    loading.value = false;
  }
}

function handleDragStart() {
  dragging.value = true;
}

/**
 * Guarda el nuevo orden al terminar de arrastrar.
 */
async function handleDragEnd(event) {
  dragging.value = false;

  /*
   * Si el elemento terminó en la misma posición,
   * no es necesario enviar solicitudes al backend.
   */
  if (
    event.oldIndex === event.newIndex
  ) {
    return;
  }

  await saveOrder();
}

/**
 * Separa módulos y clases para mantener el formato
 * esperado por los endpoints existentes.
 */
async function saveOrder() {
  if (!props.courses?.id) {
    ElMessage.warning(
      "No se encontró el curso seleccionado.",
    );

    return;
  }

  loading.value = true;

  try {
    const modules = items.value.filter(
      (item) => item.type === "module",
    );

    const classes = items.value.filter(
      (item) => item.type === "class",
    );

    const requests = [];

    if (modules.length > 0) {
      requests.push(
        courseService.changeOrderModule(props.courses.id, modules)
      );
    }

    if (classes.length > 0) {
      requests.push(
        courseService.changeOrder(props.courses.id, classes)
      );
    }

    await Promise.all(requests);

    ElMessage.success(
      "El orden se actualizó correctamente.",
    );

    await getOrders();
  } catch (error) {
    console.error(
      "Error al cambiar el orden:",
      error,
    );

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudo actualizar el orden.",
    );

    /*
     * Recupera el orden almacenado en el backend
     * si alguna solicitud falla.
     */
    await getOrders();
  } finally {
    loading.value = false;
  }
}

/**
 * Carga los elementos cada vez que se abre el modal
 * o cambia el curso seleccionado.
 */
watch(
  [
    () => props.orderModal,
    () => props.courses?.id,
  ],
  async ([visible, courseId]) => {
    if (visible && courseId) {
      await getOrders();
    }

    if (!visible) {
      dragging.value = false;
    }
  },
  {
    immediate: true,
  },
);
</script>

<style scoped>
.drag-list {
  min-height: 40px;
}

.drag-module {
  margin: 5px;
  padding: 10px;
  color: #000;
  font-weight: bold;
  cursor: grab;
  background-color: #f7f7f7;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: box-shadow 0.3s ease;
}

.class-wrapper {
  padding-left: 20px;
}

.drag-class {
  margin: 5px;
  padding: 0 10px;
  color: #000;
  cursor: grab;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: box-shadow 0.3s ease;
}

.drag-module:hover,
.drag-class:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.drag-module:active,
.drag-class:active {
  cursor: grabbing;
}

.item {
  padding: 4px;
  margin: 5px 0;
}

.empty-state {
  padding: 30px 15px;
  color: #6c757d;
  text-align: center;
}
</style>