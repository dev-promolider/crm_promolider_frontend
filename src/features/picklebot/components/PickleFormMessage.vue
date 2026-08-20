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
  <div v-else key="stepper" class="pfm-root message assistant self-start rounded-2xl rounded-bl-sm py-3 px-4 max-w-[85%] md:max-w-[640px] animate-fade-in-up w-full">
    <div class="flex items-center justify-between mb-2.5">
      <p class="pfm-title text-xs font-medium">Cuéntame más para continuar</p>
      <span class="pfm-muted text-xs shrink-0 ml-3">{{ msg.currentStep + 1 }} / {{ totalSteps }}</span>
    </div>

    <!-- Step slider -->
    <div class="flex items-center gap-1 mb-3">
      <button v-for="(q, i) in questions" :key="q.id" type="button"
              @click="goToStep(i)"
              :disabled="disabled || i > msg.currentStep"
              class="h-1 flex-1 rounded-full transition-colors duration-200"
              :class="stepClass(i)">
      </button>
    </div>

    <div :key="msg.currentStep">
      <div class="pfm-title font-medium text-xs leading-snug mb-2">{{ currentQuestion.question }}</div>

      <div class="flex flex-col gap-1.5">
        <button v-for="ans in currentQuestion.suggestedAnswers" :key="ans"
                type="button"
                @click="selectAnswer(currentQuestion.id, ans)"
                :disabled="disabled"
                class="pfm-answer group flex items-center gap-2.5 text-left px-3 py-1.5 rounded-lg border transition-all duration-150 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                :class="{ 'pfm-answer--selected': isSelected(currentQuestion.id, ans) }">
          <span class="pfm-answer-dot shrink-0 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors"
                :class="{ 'pfm-answer-dot--selected': isSelected(currentQuestion.id, ans) }">
            <svg v-if="isSelected(currentQuestion.id, ans)" xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </span>
          <span>{{ ans }}</span>
        </button>

        <!-- Custom Input for "Otros" -->
        <div v-if="isSelected(currentQuestion.id, 'Otros')" class="pt-1">
          <input type="text"
                 v-model="msg.customAnswers[currentQuestion.id]"
                 placeholder="Especifica tu respuesta..."
                 :disabled="disabled"
                 class="pfm-input w-full rounded-lg px-3 py-1.5 text-xs outline-none transition-all">
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 mt-3">
      <button v-if="msg.currentStep > 0" type="button" @click="goPrev" :disabled="disabled"
              class="pfm-btn-back px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        Atrás
      </button>
      <button type="button" @click="goNext" :disabled="disabled || !canGoNext"
              class="pfm-btn-next flex-1 disabled:opacity-50 disabled:cursor-not-allowed py-1.5 rounded-lg font-medium transition-all text-xs flex items-center justify-center gap-2">
        <span>{{ isLastStep ? 'Enviar Respuestas' : 'Siguiente' }}</span>
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
  border: 1px solid color-mix(in srgb, var(--border-color) 55%, transparent);
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

.pfm-step {
  background: var(--tint-2);
}
.pfm-step--current {
  background: var(--primary-color);
}
.pfm-step--done {
  background: color-mix(in srgb, var(--primary-color) 50%, transparent);
}
.pfm-step--done:hover {
  background: var(--primary-color);
}

.pfm-answer {
  background: var(--tint-1);
  border-color: transparent;
  border-radius: 0.85rem;
  color: var(--text-muted);
  transition: background-color 0.2s ease, transform 0.15s ease;
}
.pfm-answer:hover {
  background: var(--tint-2);
  transform: translateY(-1px);
}
.pfm-answer--selected {
  background: var(--primary-tint);
  color: var(--text-bold);
}

.pfm-answer-dot {
  border-color: color-mix(in srgb, var(--text-bold) 25%, transparent);
}
.pfm-answer:hover .pfm-answer-dot {
  border-color: color-mix(in srgb, var(--text-bold) 40%, transparent);
}
.pfm-answer-dot--selected {
  border-color: var(--primary-color);
  background: var(--primary-color);
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
  color: var(--text-main);
  border-radius: 0.75rem;
}
.pfm-btn-back:hover {
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
