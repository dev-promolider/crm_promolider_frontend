<template>
  <div v-if="visible" class="confirm-overlay" @click.self="$emit('cancel')">
    <div class="confirm-modal">
      <div class="confirm-header">
        <div class="confirm-header-icon" :class="type">
          <AlertTriangle v-if="type === 'danger'" :size="22" />
          <HelpCircle v-else-if="type === 'warning'" :size="22" />
          <Trash2 v-else :size="22" />
        </div>
        <h4 class="confirm-title">{{ title }}</h4>
      </div>
      <p class="confirm-message">{{ message }}</p>
      <div class="confirm-footer">
        <button class="btn-secondary" @click="$emit('cancel')" :disabled="loading">
          Cancelar
        </button>
        <button
          class="btn-confirm"
          :class="'btn-confirm--' + type"
          @click="$emit('confirm')"
          :disabled="loading"
        >
          <div v-if="loading" class="spinner-inline"></div>
          <template v-else>{{ confirmText }}</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AlertTriangle, HelpCircle, Trash2 } from 'lucide-vue-next'

defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '¿Estás seguro?' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirmar' },
  type: { type: String, default: 'danger' },
  loading: { type: Boolean, default: false },
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  animation: fadeIn 0.2s ease-out;
  padding: 16px;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.confirm-modal {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  padding: 28px 24px 20px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.25s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.confirm-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
}
.confirm-header-icon.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}
.confirm-header-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}
.confirm-header-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.confirm-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-bold);
  margin: 0;
}

.confirm-message {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0 0 20px 56px;
}

.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(24, 214, 0, 0.04);
}

.btn-confirm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 110px;
  justify-content: center;
}
.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirm--danger {
  background: #dc2626;
  color: white;
}
.btn-confirm--danger:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
}

.btn-confirm--warning {
  background: #d97706;
  color: white;
}
.btn-confirm--warning:hover:not(:disabled) {
  background: #b45309;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
}

.btn-confirm--info {
  background: var(--primary-color);
  color: white;
}
.btn-confirm--info:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 214, 0, 0.25);
}

.spinner-inline {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
