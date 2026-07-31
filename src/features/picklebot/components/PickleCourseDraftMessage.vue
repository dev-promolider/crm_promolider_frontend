<template>
  <div class="pcd-root message assistant self-start rounded-2xl rounded-bl-sm py-3.5 px-4 max-w-[85%] md:max-w-[640px] animate-fade-in-up w-full">
    <div class="flex items-start justify-between gap-3 mb-2.5">
      <p class="pcd-title text-sm font-semibold leading-snug">{{ content.courseName }}</p>
      <span class="pcd-price text-xs font-semibold shrink-0">{{ content.isFree ? 'Gratis' : `USD ${content.price}` }}</span>
    </div>

    <div class="flex flex-wrap gap-1.5 mb-3">
      <span v-if="content.category" class="pcd-chip text-[10px] font-medium px-2 py-1 rounded-full">{{ content.category }}</span>
      <span v-if="content.level" class="pcd-chip text-[10px] font-medium px-2 py-1 rounded-full">{{ content.level }}</span>
      <span class="pcd-chip text-[10px] font-medium px-2 py-1 rounded-full">{{ durationLabel }}</span>
      <span v-if="content.hasCertificate" class="pcd-chip text-[10px] font-medium px-2 py-1 rounded-full">Con certificado</span>
    </div>

    <p v-if="content.description" class="pcd-text text-xs leading-relaxed mb-3">{{ content.description }}</p>

    <div class="flex flex-col gap-2.5">
      <div v-if="content.aboutCourse">
        <p class="pcd-label text-[11px] font-semibold uppercase tracking-wide mb-1">Sobre el curso</p>
        <p class="pcd-text text-xs leading-relaxed">{{ content.aboutCourse }}</p>
      </div>
      <div v-if="content.whatYouWillLearn">
        <p class="pcd-label text-[11px] font-semibold uppercase tracking-wide mb-1">Qué vas a aprender</p>
        <p class="pcd-text text-xs leading-relaxed">{{ content.whatYouWillLearn }}</p>
      </div>
      <div v-if="content.priorKnowledge">
        <p class="pcd-label text-[11px] font-semibold uppercase tracking-wide mb-1">Conocimientos previos</p>
        <p class="pcd-text text-xs leading-relaxed">{{ content.priorKnowledge }}</p>
      </div>
      <div v-if="content.targetAudience">
        <p class="pcd-label text-[11px] font-semibold uppercase tracking-wide mb-1">Público objetivo</p>
        <p class="pcd-text text-xs leading-relaxed">{{ content.targetAudience }}</p>
      </div>
    </div>

    <p class="pcd-hint text-[11px] mt-3">Podés pedir ajustes escribiendo, por ejemplo: "bajá el precio a 20 dólares".</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: { type: Object, required: true },
});

const durationLabel = computed(() => (
  props.content.noEndDate ? 'Sin fecha límite' : `${props.content.durationMonths} meses`
));
</script>

<style scoped>
.pcd-root {
  --tint-1: color-mix(in srgb, var(--text-bold) 5%, transparent);
  --tint-2: color-mix(in srgb, var(--text-bold) 9%, transparent);
  --primary-tint: color-mix(in srgb, var(--primary-color) 12%, transparent);

  background: var(--tint-1);
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.pcd-title {
  color: var(--text-bold);
}

.pcd-price {
  color: var(--primary-color);
  white-space: nowrap;
}

.pcd-chip {
  background: var(--tint-2);
  color: var(--text-muted);
}

.pcd-text {
  color: var(--text-main);
}

.pcd-label {
  color: var(--text-muted);
}

.pcd-hint {
  color: var(--text-muted);
  border-top: 1px solid var(--border-color);
  padding-top: 0.5rem;
}
</style>
