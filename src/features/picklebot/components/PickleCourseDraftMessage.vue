<template>
  <div class="pcd-root message assistant self-start rounded-2xl max-w-[85%] md:max-w-[640px] animate-fade-in-up w-full">
    <div class="pcd-accent rounded-t-2xl"></div>

    <!-- Header -->
    <div class="pcd-header rounded-t-2xl px-4 pt-4 pb-3.5">
      <div class="flex items-start gap-3 flex-wrap">
        <div class="flex items-start gap-2.5 min-w-0 flex-1">
          <span class="pcd-avatar shrink-0 w-9 h-9 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>
          </span>
          <p class="pcd-title text-sm font-semibold leading-snug break-words min-w-0">{{ content?.courseName }}</p>
        </div>
        <span class="pcd-price shrink-0 text-sm font-bold px-3 py-1.5 rounded-full ml-auto" :class="{ 'pcd-price--free': content?.isFree }">
          {{ content?.isFree ? 'Gratis' : `USD ${content?.price}` }}
        </span>
      </div>

      <div class="flex flex-wrap gap-1.5 mt-3">
        <span v-if="content?.category" class="pcd-chip text-[10px] font-medium pl-1.5 pr-2 py-1 rounded-full flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20.59 13.41-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"/><circle cx="7" cy="7" r="1"/></svg>
          {{ content?.category }}
        </span>
        <span v-if="content?.level" class="pcd-chip pcd-chip--level text-[10px] font-medium pl-1.5 pr-2 py-1 rounded-full flex items-center gap-1" :class="levelClass">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          {{ content?.level }}
        </span>
        <span class="pcd-chip text-[10px] font-medium pl-1.5 pr-2 py-1 rounded-full flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          {{ durationLabel }}
        </span>
        <span v-if="content?.hasCertificate" class="pcd-chip text-[10px] font-medium pl-1.5 pr-2 py-1 rounded-full flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/></svg>
          Con certificado
        </span>
      </div>
    </div>

    <p v-if="content?.description" class="pcd-description text-xs leading-relaxed mx-4 mb-3 px-3 py-2.5 rounded-xl">{{ content?.description }}</p>

    <div class="flex flex-col gap-2 px-4 pb-3.5">
      <div v-if="content?.aboutCourse" class="pcd-section rounded-xl px-3 py-2.5 flex gap-2.5">
        <span class="pcd-icon pcd-icon--blue shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        </span>
        <div class="min-w-0">
          <p class="pcd-label text-[11px] font-semibold mb-0.5">Sobre el curso</p>
          <p class="pcd-text text-xs leading-relaxed">{{ content?.aboutCourse }}</p>
        </div>
      </div>
      <div v-if="content?.whatYouWillLearn" class="pcd-section rounded-xl px-3 py-2.5 flex gap-2.5">
        <span class="pcd-icon pcd-icon--green shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10-3-3"/></svg>
        </span>
        <div class="min-w-0">
          <p class="pcd-label text-[11px] font-semibold mb-0.5">Qué vas a aprender</p>
          <p class="pcd-text text-xs leading-relaxed">{{ content?.whatYouWillLearn }}</p>
        </div>
      </div>
      <div v-if="content?.priorKnowledge" class="pcd-section rounded-xl px-3 py-2.5 flex gap-2.5">
        <span class="pcd-icon pcd-icon--orange shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </span>
        <div class="min-w-0">
          <p class="pcd-label text-[11px] font-semibold mb-0.5">Conocimientos previos</p>
          <p class="pcd-text text-xs leading-relaxed">{{ content?.priorKnowledge }}</p>
        </div>
      </div>
      <div v-if="content?.targetAudience" class="pcd-section rounded-xl px-3 py-2.5 flex gap-2.5">
        <span class="pcd-icon pcd-icon--purple shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </span>
        <div class="min-w-0">
          <p class="pcd-label text-[11px] font-semibold mb-0.5">Público objetivo</p>
          <p class="pcd-text text-xs leading-relaxed">{{ content?.targetAudience }}</p>
        </div>
      </div>
    </div>

    <div v-if="content?.modules?.length" class="px-4 pb-3.5">
      <div class="flex items-center justify-between mb-2.5">
        <p class="pcd-label text-[11px] font-semibold flex items-center gap-1.5 uppercase tracking-wide">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Temario del curso
        </p>
        <div class="flex items-center gap-1.5">
          <span class="pcd-chip text-[10px] font-medium px-2 py-1 rounded-full">{{ content.modules.length }} módulos</span>
          <span class="pcd-chip text-[10px] font-medium px-2 py-1 rounded-full">{{ totalTopics }} temas</span>
        </div>
      </div>
      <div class="pcd-module-list flex flex-col gap-2">
        <div v-for="(module, index) in content.modules" :key="index" class="pcd-module rounded-2xl overflow-hidden">
          <button type="button" class="pcd-module-header w-full flex items-start gap-3 px-3.5 py-3 text-left"
                  :aria-expanded="expandedModules.has(index)"
                  :aria-label="`${expandedModules.has(index) ? 'Ocultar' : 'Ver'} temas del módulo ${index + 1}`"
                  @click="toggleModule(index)">
            <span class="pcd-module-number shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold">{{ index + 1 }}</span>
            <div class="min-w-0 flex-1">
              <p class="pcd-text text-xs font-semibold leading-snug break-words whitespace-normal">{{ module.title }}</p>
              <p class="pcd-label text-[11px] leading-relaxed mt-1 break-words whitespace-normal">{{ module.description }}</p>
              <span v-if="module.topics?.length" class="pcd-topic-count inline-flex items-center gap-1 mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                {{ module.topics.length }} {{ module.topics.length === 1 ? 'tema' : 'temas' }}
              </span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pcd-chevron shrink-0 mt-1.5 transition-transform duration-200" :class="{ 'rotate-180': expandedModules.has(index) }"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div v-if="expandedModules.has(index)" class="pcd-module-topics px-3.5 pb-3 pt-0.5 animate-fade-in-up">
            <ul class="pcd-topic-list flex flex-col">
              <li v-for="(topic, tIndex) in module.topics" :key="tIndex" class="pcd-topic text-[11px] leading-relaxed flex gap-2 py-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pcd-topic-icon shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                <span class="min-w-0 break-words whitespace-normal"><span class="pcd-text font-semibold">{{ topic.title }}</span> <span class="pcd-label">— {{ topic.description }}</span></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="pcd-hint flex items-center gap-1.5 text-[11px] mx-4 mb-3.5 px-3 py-2 rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A5.5 5.5 0 1 0 6.5 8.5c0 1.61.7 2.75 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg>
      <span>Podés pedir ajustes escribiendo, por ejemplo: "bajá el precio a 20 dólares".</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  content: { type: Object, default: () => ({}) },
});

const expandedModules = ref(new Set());
const toggleModule = (index) => {
  const next = new Set(expandedModules.value);
  if (next.has(index)) {
    next.delete(index);
  } else {
    next.add(index);
  }
  expandedModules.value = next;
};

const totalTopics = computed(() => (
  props.content?.modules?.reduce((sum, m) => sum + (m.topics?.length ?? 0), 0) ?? 0
));

const durationLabel = computed(() => (
  props.content?.noEndDate ? 'Sin fecha límite' : `${props.content?.durationMonths ?? '?'} meses`
));

const LEVEL_CLASSES = {
  'Básico': 'pcd-chip--level-green',
  'Intermedio': 'pcd-chip--level-orange',
  'Avanzado': 'pcd-chip--level-purple',
};
const levelClass = computed(() => LEVEL_CLASSES[props.content?.level] || '');
</script>

<style scoped>
.pcd-root {
  --tint-1: color-mix(in srgb, var(--text-bold) 4%, transparent);
  --tint-2: color-mix(in srgb, var(--text-bold) 8%, transparent);
  --primary-tint: color-mix(in srgb, var(--primary-color) 12%, transparent);

  background: var(--tint-1);
  border: 1px solid color-mix(in srgb, var(--text-bold) 8%, transparent);
  color: var(--text-main);
  box-shadow: 0 10px 30px -16px rgba(0, 0, 0, 0.16);
  overflow: visible;
}

.pcd-accent {
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 40%, var(--indicator-blue-text, #38bdf8)));
}

.pcd-header {
  background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color) 6%, transparent), transparent);
}

.pcd-avatar {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: var(--white);
  box-shadow: 0 4px 12px -4px color-mix(in srgb, var(--primary-color) 60%, transparent);
}

.pcd-title {
  color: var(--text-bold);
}

.pcd-price {
  background: var(--tint-2);
  color: var(--text-bold);
  white-space: nowrap;
}
.pcd-price--free {
  background: var(--primary-tint);
  color: var(--primary-color);
}

.pcd-chip {
  background: var(--tint-2);
  color: var(--text-muted);
}

.pcd-chip--level-green {
  background: var(--indicator-green);
  color: var(--indicator-green-text);
}
.pcd-chip--level-orange {
  background: var(--indicator-orange);
  color: var(--indicator-orange-text);
}
.pcd-chip--level-purple {
  background: var(--indicator-purple);
  color: var(--indicator-purple-text);
}

.pcd-description {
  background: var(--primary-tint);
  color: var(--text-main);
  font-style: italic;
}

.pcd-section {
  background: var(--tint-1);
  transition: background-color 0.15s ease;
}
.pcd-section:hover {
  background: var(--tint-2);
}

.pcd-icon--blue {
  background: var(--indicator-blue);
  color: var(--indicator-blue-text);
}
.pcd-icon--green {
  background: var(--indicator-green);
  color: var(--indicator-green-text);
}
.pcd-icon--orange {
  background: var(--indicator-orange);
  color: var(--indicator-orange-text);
}
.pcd-icon--purple {
  background: var(--indicator-purple);
  color: var(--indicator-purple-text);
}

.pcd-text {
  color: var(--text-main);
}

.pcd-label {
  color: var(--text-muted);
}

.pcd-hint {
  background: var(--tint-1);
  color: var(--text-muted);
}

.pcd-module {
  border: none;
  background: var(--tint-1);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.pcd-module:hover {
  background: var(--tint-2);
  box-shadow: 0 4px 14px -8px rgba(0, 0, 0, 0.12);
}

.pcd-module-header {
  background: transparent;
  border: none;
  cursor: pointer;
}
.pcd-module-header:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--primary-color) 55%, transparent);
  outline-offset: -2px;
}

.pcd-module-number {
  background: var(--indicator-blue);
  color: var(--indicator-blue-text);
}

.pcd-topic-count {
  background: var(--tint-2);
  color: var(--text-muted);
}
.pcd-topic-count svg {
  color: var(--indicator-blue-text);
}

.pcd-chevron {
  color: var(--text-muted);
}

.pcd-module-topics {
  background: transparent;
}

.pcd-topic-list {
  border-left: 2px solid color-mix(in srgb, var(--text-bold) 10%, transparent);
  margin-left: 0.9rem;
  padding-left: 0.85rem;
}

.pcd-topic + .pcd-topic {
  border-top: 1px solid color-mix(in srgb, var(--text-bold) 8%, transparent);
}

.pcd-topic-icon {
  color: var(--primary-color);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
