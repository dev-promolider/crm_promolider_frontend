<template>
  <Transition name="pfm-collapse" mode="out-in">
  <!-- Compact summary once the form has been answered -->
  <div v-if="msg.formSubmitted" key="summary" class="pfm-summary message assistant self-start rounded-2xl rounded-bl-sm py-2.5 px-3.5 max-w-[85%] md:max-w-[640px] w-full">
    <div class="flex items-center gap-2 mb-1.5">
      <span class="pfm-summary-icon shrink-0 w-4 h-4 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </span>
      <span class="pfm-title text-xs font-medium">Respuestas enviadas</span>
    </div>
    <div class="flex flex-col gap-1">
      <div v-for="q in questions" :key="q.id" class="text-xs leading-snug">
        <span class="pfm-muted">{{ q.question }}</span>
        <span class="pfm-title font-medium"> — {{ answerText(q) }}</span>
      </div>
    </div>
  </div>

  <!-- Interactive stepper while the form is being answered -->
  <div v-else key="stepper" class="pfm-root message assistant self-start rounded-2xl rounded-bl-sm py-4 px-4 max-w-[85%] md:max-w-[640px] animate-fade-in-up w-full">
    <div class="flex items-center justify-between gap-3 mb-3">
      <p class="pfm-title text-xs font-semibold flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
        Cuéntame más para continuar
      </p>
      <span class="pfm-step-chip text-[10px] font-semibold shrink-0 px-2 py-1 rounded-full">Pregunta {{ msg.currentStep + 1 }} de {{ totalSteps }}</span>
    </div>

    <!-- Step dots -->
    <div class="flex items-center mb-4" role="list" aria-label="Progreso del formulario">
      <template v-for="(q, i) in questions" :key="q.id">
        <button type="button"
                @click="goToStep(i)"
                :disabled="disabled || i > msg.currentStep"
                class="pfm-step shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200"
                :class="stepClass(i)"
                role="listitem"
                :aria-current="i === msg.currentStep ? 'step' : undefined"
                :aria-label="`Pregunta ${i + 1} de ${totalSteps}${i < msg.currentStep ? ' (respondida)' : ''}`">
          <svg v-if="i < msg.currentStep" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <span v-else>{{ i + 1 }}</span>
        </button>
        <div v-if="i < questions.length - 1" class="pfm-step-line flex-1 h-0.5 mx-1" :class="{ 'pfm-step-line--done': i < msg.currentStep }"></div>
      </template>
    </div>

    <div :key="msg.currentStep" role="group" :aria-label="`Pregunta ${msg.currentStep + 1} de ${totalSteps}`">
      <div class="pfm-title font-semibold text-sm leading-snug mb-3 break-words">{{ currentQuestion.question }}</div>

      <div class="flex flex-col gap-2" role="radiogroup" :aria-label="currentQuestion.question">
        <button v-for="(ans, aIndex) in currentQuestion.suggestedAnswers" :key="ans"
                type="button"
                @click="selectAnswer(currentQuestion.id, ans)"
                :disabled="disabled"
                class="pfm-answer group flex items-center gap-3 text-left px-3.5 py-2.5 rounded-xl border transition-all duration-150 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                :class="{ 'pfm-answer--selected': isSelected(currentQuestion.id, ans) }"
                role="radio" :aria-checked="isSelected(currentQuestion.id, ans)">
          <span class="pfm-answer-letter shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
                :class="{ 'pfm-answer-letter--selected': isSelected(currentQuestion.id, ans) }">
            <svg v-if="isSelected(currentQuestion.id, ans)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <span v-else>{{ String.fromCharCode(65 + aIndex) }}</span>
          </span>
          <span class="pfm-answer-text break-words leading-relaxed">{{ ans }}</span>
        </button>

        <!-- Custom Input for "Otros" -->
        <div v-if="isSelected(currentQuestion.id, 'Otros')" class="pt-1 pl-9">
          <label :for="`pfm-custom-${currentQuestion.id}`" class="sr-only">Especifica tu respuesta para "{{ currentQuestion.question }}"</label>
          <input :id="`pfm-custom-${currentQuestion.id}`" type="text"
                 v-model="msg.customAnswers[currentQuestion.id]"
                 placeholder="Especifica tu respuesta..."
                 :disabled="disabled"
                 autofocus
                 class="pfm-input w-full rounded-lg px-3 py-2 text-xs outline-none transition-all">
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 mt-4">
      <button v-if="msg.currentStep > 0" type="button" @click="goPrev" :disabled="disabled"
              class="pfm-btn-back shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Atrás
      </button>
      <button type="button" @click="goNext" :disabled="disabled || !canGoNext"
              class="pfm-btn-next flex-1 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-xl font-semibold transition-all text-xs flex items-center justify-center gap-2">
        <span>{{ isLastStep ? 'Enviar respuestas' : 'Siguiente' }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>
    </div>
  </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  msg: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['submit']);

const questions = computed(() => props.msg.content.questions);
const totalSteps = computed(() => questions.value.length);
const currentQuestion = computed(() => questions.value[props.msg.currentStep]);
const isLastStep = computed(() => props.msg.currentStep === totalSteps.value - 1);

const isAnswered = (q) => {
  const selected = props.msg.selectedAnswers?.[q.id];
  if (!selected) return false;
  if (selected === 'Otros') return !!props.msg.customAnswers?.[q.id]?.trim();
  return true;
};

const canGoNext = computed(() => isAnswered(currentQuestion.value));

const isSelected = (questionId, answer) => props.msg.selectedAnswers?.[questionId] === answer;

const answerText = (q) => {
  const selected = props.msg.selectedAnswers?.[q.id];
  if (selected === 'Otros') return props.msg.customAnswers?.[q.id] || selected;
  return selected || '—';
};

const selectAnswer = (questionId, answer) => {
  if (!props.msg.selectedAnswers) props.msg.selectedAnswers = {};
  if (!props.msg.customAnswers) props.msg.customAnswers = {};

  props.msg.selectedAnswers[questionId] = answer;
  if (answer !== 'Otros') {
    props.msg.customAnswers[questionId] = '';
  }
};

const goNext = () => {
  if (!canGoNext.value) return;
  if (isLastStep.value) {
    emit('submit');
  } else {
    props.msg.currentStep++;
  }
};

const goPrev = () => {
  if (props.msg.currentStep > 0) props.msg.currentStep--;
};

const goToStep = (i) => {
  if (props.disabled || i > props.msg.currentStep) return;
  props.msg.currentStep = i;
};

const stepClass = (i) => {
  if (i === props.msg.currentStep) return 'pfm-step pfm-step--current';
  if (i < props.msg.currentStep) return 'pfm-step pfm-step--done cursor-pointer';
  return 'pfm-step cursor-not-allowed';
};
</script>

<style scoped>
.pfm-root,
.pfm-summary {
  --tint-1: color-mix(in srgb, var(--text-bold) 5%, transparent);
  --tint-2: color-mix(in srgb, var(--text-bold) 9%, transparent);
  --border-strong: color-mix(in srgb, var(--text-bold) 20%, transparent);
  --primary-tint: color-mix(in srgb, var(--primary-color) 12%, transparent);
  --primary-border: color-mix(in srgb, var(--primary-color) 60%, transparent);

  background: var(--tint-1);
  border: 1px solid color-mix(in srgb, var(--text-bold) 8%, transparent);
  color: var(--text-main);
}

.pfm-summary-icon {
  background: var(--primary-color);
}

.pfm-title {
  color: var(--text-bold);
}

.pfm-muted {
  color: var(--text-muted);
}

.pfm-step-chip {
  background: var(--primary-tint);
  color: var(--primary-color);
  white-space: nowrap;
}

.pfm-step {
  background: var(--tint-2);
  color: var(--text-muted);
  border: none;
}
.pfm-step--current {
  background: var(--primary-color);
  color: var(--white);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 25%, transparent);
}
.pfm-step--done {
  background: color-mix(in srgb, var(--primary-color) 18%, transparent);
  color: var(--primary-color);
}
.pfm-step--done:hover {
  background: color-mix(in srgb, var(--primary-color) 28%, transparent);
}

.pfm-step-line {
  background: var(--tint-2);
  border-radius: 999px;
}
.pfm-step-line--done {
  background: color-mix(in srgb, var(--primary-color) 35%, transparent);
}

.pfm-answer {
  background: var(--tint-1);
  border-color: transparent;
  border-radius: 0.85rem;
  color: var(--text-main);
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}
.pfm-answer:hover:not(:disabled) {
  background: var(--tint-2);
  transform: translateY(-1px);
}
.pfm-answer--selected {
  background: var(--primary-tint);
  border-color: color-mix(in srgb, var(--primary-color) 45%, transparent);
  color: var(--text-bold);
}

.pfm-answer-text {
  color: var(--text-main);
}
.pfm-answer--selected .pfm-answer-text {
  color: var(--text-bold);
  font-weight: 600;
}

.pfm-answer-letter {
  background: var(--tint-2);
  color: var(--text-muted);
  border: 1px solid color-mix(in srgb, var(--text-bold) 14%, transparent);
}
.pfm-answer:hover .pfm-answer-letter {
  border-color: color-mix(in srgb, var(--primary-color) 30%, var(--text-bold) 14%);
}
.pfm-answer-letter--selected {
  background: var(--primary-color);
  color: var(--white);
  border-color: var(--primary-color);
}

.pfm-input {
  background: var(--tint-2);
  border: 1px solid transparent;
  border-radius: 0.75rem;
  color: var(--text-main);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.pfm-input::placeholder {
  color: var(--text-muted);
}
.pfm-input:focus {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 35%, transparent);
}

.pfm-btn-back {
  background: var(--tint-1);
  border: 1px solid color-mix(in srgb, var(--text-bold) 8%, transparent);
  color: var(--text-main);
}
.pfm-btn-back:hover:not(:disabled) {
  background: var(--tint-2);
}

.pfm-btn-next {
  background: var(--primary-color);
  color: var(--white);
  border-radius: 0.75rem;
}
.pfm-btn-next:hover:not(:disabled) {
  background: var(--primary-hover);
}

.pfm-answer:focus-visible,
.pfm-btn-back:focus-visible,
.pfm-btn-next:focus-visible,
.pfm-input:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.pfm-collapse-enter-active,
.pfm-collapse-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.pfm-collapse-enter-from {
  opacity: 0;
  transform: translateY(4px) scale(0.98);
}
.pfm-collapse-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
