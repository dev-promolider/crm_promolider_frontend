<template>
  <Transition name="toast-slide">
    <div v-if="toast" class="toast-notification">
      <div class="toast-icon">
        <CheckCircle2 v-if="toast.type === 'success'" :size="20" class="text-success" />
        <AlertCircle v-else-if="toast.type === 'error'" :size="20" class="text-error" />
        <AlertTriangle v-else-if="toast.type === 'warning'" :size="20" class="text-warning" />
        <Info v-else :size="20" class="text-info" />
      </div>
      <div class="toast-content">
        <h4>{{ toast.title }}</h4>
        <p>{{ toast.message }}</p>
      </div>
      <button class="toast-close" @click="$emit('close')">
        <X :size="16" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

defineProps({
  toast: { type: Object, default: null },
})

defineEmits(['close'])
</script>

<style scoped>
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: var(--card-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 14px 18px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  z-index: 99999;
  max-width: 360px;
}
.toast-icon {
  flex-shrink: 0;
  display: flex;
  margin-top: 2px;
}
.text-success { color: var(--primary-color, #18d600); }
.text-error { color: var(--danger-color, #ef4444); }
.text-warning { color: #d97706; }
.text-info { color: #3b82f6; }
.toast-content h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-bold);
  margin-bottom: 2px;
}
.toast-content p {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
  margin: 0;
}
.toast-close {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 2px;
  flex-shrink: 0;
  transition: color 0.2s;
}
.toast-close:hover {
  color: var(--text-bold);
}

.toast-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.toast-slide-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

@media (max-width: 768px) {
  .toast-notification {
    bottom: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
}
</style>
