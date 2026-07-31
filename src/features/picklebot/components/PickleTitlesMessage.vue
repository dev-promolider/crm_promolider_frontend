<template>
  <!-- Compact summary once a title selection has been submitted -->
  <div v-if="msg.titlesSubmitted" class="ptm-summary message assistant self-start rounded-2xl rounded-bl-sm py-2.5 px-3.5 max-w-[85%] md:max-w-[640px] animate-fade-in-up w-full">
    <div class="flex items-center gap-2 mb-1.5">
      <span class="ptm-summary-icon shrink-0 w-4 h-4 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </span>
      <span class="ptm-title text-xs font-medium">Títulos propuestos</span>
    </div>
    <div class="flex flex-col gap-1">
      <div v-for="t in realTitles" :key="t.id" class="text-xs leading-snug">
        <span class="ptm-muted">{{ t.title }}</span>
        <span class="ptm-title font-medium"> — USD {{ t.suggestedPriceUsd }}</span>
      </div>
    </div>
  </div>

  <!-- Interactive title selection -->
  <div v-else class="ptm-root message assistant self-start rounded-2xl rounded-bl-sm py-3 px-4 max-w-[85%] md:max-w-[640px] animate-fade-in-up w-full">
    <p class="ptm-title text-xs font-medium mb-2.5">Elegí un título para tu curso</p>

    <div class="flex flex-col gap-2 mb-3">
      <button v-for="t in realTitles" :key="t.id" type="button"
              @click="selectTitle(t.id)"
              :disabled="disabled"
              class="ptm-card group w-full flex items-start justify-between gap-3 text-left px-3.5 py-2.5 rounded-xl border transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="ptm-card-title text-xs font-medium">{{ t.title }}</span>
            <span v-if="t.recommended" class="ptm-badge text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0">Recomendado</span>
          </div>
          <span class="ptm-price text-xs mt-1 block">USD {{ t.suggestedPriceUsd }}</span>
        </div>
      </button>
    </div>

    <div class="ptm-regenerate pt-2">
      <input type="text"
             v-model="recommendation"
             placeholder="Instrucciones opcionales para los nuevos títulos..."
             :disabled="disabled"
             maxlength="300"
             class="ptm-input w-full rounded-lg px-3 py-1.5 text-xs outline-none transition-all mb-2">
      <button type="button" @click="regenerate" :disabled="disabled"
              class="ptm-btn-regenerate w-full py-1.5 rounded-lg font-medium transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed">
        Generar nuevos títulos
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  msg: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['select', 'regenerate']);

// El backend siempre incluye una quinta entrada con id "regenerate" dentro
// de content.titles (sin precio real) — se renderiza aparte como acción,
// no como una card de título más.
const realTitles = computed(() => (props.msg.content.titles || []).filter((t) => t.id !== 'regenerate'));

const recommendation = ref('');

const selectTitle = (id) => emit('select', id);
const regenerate = () => emit('regenerate', recommendation.value.trim());
</script>

<style scoped>
.ptm-root,
.ptm-summary {
  --tint-1: color-mix(in srgb, var(--text-bold) 5%, transparent);
  --tint-2: color-mix(in srgb, var(--text-bold) 9%, transparent);
  --border-strong: color-mix(in srgb, var(--text-bold) 20%, transparent);
  --primary-tint: color-mix(in srgb, var(--primary-color) 12%, transparent);

  background: var(--tint-1);
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.ptm-summary-icon {
  background: var(--primary-color);
}

.ptm-title {
  color: var(--text-bold);
}

.ptm-muted {
  color: var(--text-muted);
}

.ptm-card {
  background: var(--tint-1);
  border-color: var(--border-color);
}
.ptm-card:hover:not(:disabled) {
  background: var(--tint-2);
  border-color: var(--border-strong);
}

.ptm-card-title {
  color: var(--text-bold);
}

.ptm-badge {
  background: var(--primary-tint);
  color: var(--primary-color);
}

.ptm-price {
  color: var(--text-muted);
}

.ptm-regenerate {
  border-top: 1px solid var(--border-color);
}

.ptm-input {
  background: var(--tint-2);
  border: 1px solid var(--border-color);
  color: var(--text-main);
}
.ptm-input::placeholder {
  color: var(--text-muted);
}
.ptm-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.ptm-btn-regenerate {
  background: var(--tint-2);
  color: var(--text-bold);
  border: 1px solid var(--border-color);
}
.ptm-btn-regenerate:hover:not(:disabled) {
  background: var(--tint-1);
}
</style>
