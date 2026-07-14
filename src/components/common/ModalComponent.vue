<template>
  <div
    class="modal fade"
    tabindex="-1"
    role="dialog"
    aria-hidden="true"
    :class="colorModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
  >
    <div
      class="modal-dialog modal-dialog-centered"
      :class="sizeModal"
      role="document"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <slot name="title">
              Title Component
            </slot>
          </h5>

          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Cerrar"
            @click="closeModal"
          />
        </div>

        <div class="modal-body">
          <slot name="body">
            <p>The body Component</p>
          </slot>
        </div>

        <div class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

defineOptions({
  name: "ModalComponent",
});

const props = defineProps({
  color: {
    type: String,
    default: "primary",
  },

  size: {
    type: String,
    default: "default",
  },

  message: {
    type: String,
    default: "",
  },

  supportImage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close"]);

const colorModal = computed(() => {
  const colors = {
    primary: "modal-primary",
    success: "modal-success",
    info: "modal-info",
    warning: "modal-warning",
    danger: "modal-danger",
  };

  return colors[props.color] ?? colors.primary;
});

const sizeModal = computed(() => {
  const sizes = {
    small: "modal-sm",
    medium: "modal-md",
    large: "modal-lg",
    default: "modal-default",
    extralarge: "modal-xl",
  };

  return sizes[props.size] ?? sizes.default;
});

function closeModal() {
  emit("close");
}
</script>