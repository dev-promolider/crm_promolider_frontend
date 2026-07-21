<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
        role="dialog"
        aria-modal="true"
        @click.self="handleBackdropClick"
      >
        <Transition
          appear
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <div
            class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            :class="sizeClass"
          >
            <!-- Encabezado -->
            <div
              class="flex items-center justify-between border-b px-6 py-4"
              :class="headerClass"
            >
              <div class="text-lg font-semibold">
                <slot name="title">
                  Título
                </slot>
              </div>

              <button
                type="button"
                class="rounded-lg p-2 transition hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-current"
                aria-label="Cerrar modal"
                @click="close"
              >
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <!-- Contenido -->
            <div class="flex-1 overflow-y-auto px-6 py-5">
              <slot name="body">
                <slot />
              </slot>
            </div>

            <!-- Pie -->
            <div
              v-if="$slots.footer"
              class="flex flex-wrap justify-end gap-3 border-t bg-slate-50 px-6 py-4"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },

  color: {
    type: String,
    default: "primary",
  },

  size: {
    type: String,
    default: "default",
  },

  closeOnBackdrop: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "close",
]);

const sizeClass = computed(() => {
  const sizes = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
    extralarge: "max-w-6xl",
    default: "max-w-xl",
  };

  return sizes[props.size] ?? sizes.default;
});

const headerClass = computed(() => {
  const colors = {
    primary: "border-blue-200 bg-blue-600 text-white",
    success: "border-emerald-200 bg-emerald-600 text-white",
    info: "border-cyan-200 bg-cyan-600 text-white",
    warning: "border-amber-200 bg-amber-500 text-white",
    danger: "border-red-200 bg-red-600 text-white",
    default: "border-slate-200 bg-white text-slate-900",
  };

  return colors[props.color] ?? colors.default;
});

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    close();
  }
}

function handleKeydown(event) {
  if (event.key === "Escape" && props.modelValue) {
    close();
  }
}

watch(
  () => props.modelValue,
  (visible) => {
    document.body.style.overflow = visible ? "hidden" : "";
  },
  {
    immediate: true,
  },
);

window.addEventListener("keydown", handleKeydown);

onBeforeUnmount(() => {
  document.body.style.overflow = "";
  window.removeEventListener("keydown", handleKeydown);
});
</script>