<template>
  <div class="message assistant self-start bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm py-4 px-5 max-w-[85%] md:max-w-[480px] animate-fade-in-up w-full">
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm font-medium text-slate-100">Cuéntame más para continuar</p>
      <span class="text-xs text-slate-400 shrink-0 ml-3">{{ msg.currentStep + 1 }} / {{ totalSteps }}</span>
    </div>

    <!-- Step slider -->
    <div class="flex items-center gap-1.5 mb-5">
      <button v-for="(q, i) in questions" :key="q.id" type="button"
              @click="goToStep(i)"
              :disabled="disabled || i > msg.currentStep"
              class="h-1.5 flex-1 rounded-full transition-colors duration-200"
              :class="stepClass(i)">
      </button>
    </div>

    <div :key="msg.currentStep">
      <div class="font-medium text-sm text-slate-100 leading-snug mb-3">{{ currentQuestion.question }}</div>

      <div class="flex flex-col gap-2">
        <button v-for="ans in currentQuestion.suggestedAnswers" :key="ans"
                type="button"
                @click="selectAnswer(currentQuestion.id, ans)"
                :disabled="disabled"
                class="group flex items-center gap-3 text-left px-3.5 py-2.5 rounded-xl border transition-all duration-150 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                :class="isSelected(currentQuestion.id, ans) ? 'bg-primary-500/10 border-primary-500/60 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300'">
          <span class="shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors"
                :class="isSelected(currentQuestion.id, ans) ? 'border-primary-400 bg-primary-500' : 'border-white/25 group-hover:border-white/40'">
            <svg v-if="isSelected(currentQuestion.id, ans)" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </span>
          <span>{{ ans }}</span>
        </button>

        <!-- Custom Input for "Otros" -->
        <div v-if="isSelected(currentQuestion.id, 'Otros')" class="pt-1">
          <input type="text"
                 v-model="msg.customAnswers[currentQuestion.id]"
                 placeholder="Especifica tu respuesta..."
                 :disabled="disabled"
                 class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all">
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 mt-5">
      <button v-if="msg.currentStep > 0" type="button" @click="goPrev" :disabled="disabled"
              class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        Atrás
      </button>
      <button type="button" @click="goNext" :disabled="disabled || !canGoNext"
              class="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-2">
        <svg v-if="msg.formSubmitted" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        <span>{{ msg.formSubmitted ? 'Respuestas Enviadas' : (isLastStep ? 'Enviar Respuestas' : 'Siguiente') }}</span>
      </button>
    </div>
  </div>
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
  if (i === props.msg.currentStep) return 'bg-primary-400';
  if (i < props.msg.currentStep) return 'bg-primary-500/50 hover:bg-primary-400 cursor-pointer';
  return 'bg-white/10 cursor-not-allowed';
};
</script>
