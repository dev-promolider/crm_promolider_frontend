<template>
  <div class="step-indicator">
    <div 
      v-for="i in totalSteps" 
      :key="i" 
      class="step" 
      :class="{ active: currentStep === i, completed: currentStep > i }"
    >
      <div class="step-number">
        <span v-if="currentStep <= i">{{ i }}</span>
        <Check v-else :size="16" />
      </div>
      <div class="step-label" v-if="labels[i - 1]">{{ labels[i - 1] }}</div>
    </div>
    <div class="step-line"></div>
  </div>
</template>

<script setup>
import { Check } from 'lucide-vue-next';

defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  },
  labels: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.step-indicator {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: 2rem;
}

.step-line {
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--sidebar-hover-bg);
  z-index: 1;
}

.step {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--sidebar-logo-bg);
  padding: 0 10px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--sidebar-hover-bg);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.3s;
}

.step.active .step-number {
  background-color: var(--primary-color);
  color: var(--white);
  box-shadow: 0 0 10px rgba(24, 214, 0, 0.4);
}

.step.completed .step-number {
  background-color: var(--primary-color);
  color: var(--white);
}

.step-label {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  text-align: center;
}

.step.active .step-label {
  color: var(--primary-color);
}
</style>
