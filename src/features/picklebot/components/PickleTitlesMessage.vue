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
      <div v-for="t in options" :key="t.id" class="text-xs leading-snug">
        <span class="ptm-muted">{{ t.title }}</span>
        <span class="ptm-title font-medium"> — USD {{ t.suggestedPriceUsd }}</span>
      </div>
    </div>
  </div>

  <!-- Interactive title selection -->
  <div v-else class="ptm-root message assistant self-start rounded-2xl rounded-bl-sm py-3 px-4 max-w-[85%] md:max-w-[640px] animate-fade-in-up w-full">
    <p class="ptm-title text-xs font-medium mb-2.5">Elegí un título para tu curso</p>

    <div class="flex flex-col gap-2 mb-3">
      <button v-for="t in options" :key="t.id" type="button"
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
             v-model="instructions"
             placeholder="Instrucciones opcionales para los nuevos títulos..."
             :disabled="disabled"
             maxlength="300"
             class="ptm-input w-full rounded-lg px-3 py-1.5 text-xs outline-none transition-all mb-2">
      <button type="button" @click="regenerate" :disabled="disabled"
              class="ptm-btn-regenerate w-full py-1.5 rounded-lg font-medium transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed">
        Generar nuevos títulos
      </button>
    </div>

    <!-- Sources / metadata accordion: informational only, not part of selection -->
    <div v-if="metadata.length" class="ptm-sources pt-3 mt-2">
      <button type="button" @click="sourcesOpen = !sourcesOpen"
              class="ptm-sources-toggle w-full flex items-center gap-1.5 text-xs font-medium py-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <span>Fuentes en las que nos inspiramos</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-auto transition-transform duration-200" :class="{ 'rotate-180': sourcesOpen }"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div v-if="sourcesOpen" class="flex flex-col gap-1.5 mt-2 animate-fade-in-up">
        <div v-for="m in metadata" :key="m.id" class="ptm-source-card flex items-center gap-2.5 rounded-xl px-3 py-2">
          <span class="ptm-source-icon shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
            <svg v-if="m.source === 'pinecone'" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></svg>
          </span>
          <div class="flex-1 min-w-0">
            <p class="ptm-muted text-xs leading-snug truncate">{{ m.sourceTitle }}</p>
            <p class="ptm-source-caption text-[10px] mt-0.5">{{ sourceLabel(m.source) }}</p>
          </div>
          <span class="ptm-title text-xs font-medium shrink-0">{{ m.price }}</span>
        </div>
      </div>
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

// El backend manda dos arrays paralelos correlacionados por "id":
// options (título + precio sugerido, seleccionable) y metadata (fuente real
// de scraping/RAG, solo informativo).
const options = computed(() => props.msg.content.options || []);
const metadata = computed(() => props.msg.content.metadata || []);

const instructions = ref('');
const sourcesOpen = ref(false);

const selectTitle = (id) => emit('select', id);
const regenerate = () => emit('regenerate', instructions.value.trim());

const sourceLabel = (source) => (source === 'pinecone' ? 'Caché interna' : 'Buscado en vivo');
</script>

<style scoped>
.ptm-root,
.ptm-summary {
  --tint-1: color-mix(in srgb, var(--text-bold) 5%, transparent);
  --tint-2: color-mix(in srgb, var(--text-bold) 9%, transparent);
  --border-strong: color-mix(in srgb, var(--text-bold) 20%, transparent);
  --primary-tint: color-mix(in srgb, var(--primary-color) 12%, transparent);

  background: var(--tint-1);
  border: 1px solid color-mix(in srgb, var(--border-color) 55%, transparent);
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
  border-color: transparent;
  border-radius: 1rem;
  transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.ptm-card:hover:not(:disabled) {
  background: var(--tint-2);
  box-shadow: 0 4px 14px -6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
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
  border-top: 1px solid color-mix(in srgb, var(--border-color) 60%, transparent);
}

.ptm-input {
  background: var(--tint-1);
  border: 1px solid transparent;
  border-radius: 0.75rem;
  color: var(--text-main);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.ptm-input::placeholder {
  color: var(--text-muted);
}
.ptm-input:focus {
  background: var(--tint-2);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 35%, transparent);
}

.ptm-btn-regenerate {
  background: var(--tint-1);
  color: var(--text-bold);
  border: none;
  border-radius: 0.75rem;
}
.ptm-btn-regenerate:hover:not(:disabled) {
  background: var(--tint-2);
}

.ptm-sources {
  border-top: 1px solid color-mix(in srgb, var(--border-color) 60%, transparent);
}

.ptm-sources-toggle {
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
}
.ptm-sources-toggle:hover {
  color: var(--text-bold);
}

.ptm-source-card {
  background: var(--tint-1);
  transition: background-color 0.15s ease;
}
.ptm-source-card:hover {
  background: var(--tint-2);
}

.ptm-source-icon {
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
}

.ptm-source-caption {
  color: var(--text-light, var(--text-muted));
}
</style>
