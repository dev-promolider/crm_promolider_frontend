<template>
  <div v-if="message" :class="['custom-alert', type]">
    <div class="alert-icon">
      <!-- Success Icon -->
      <svg v-if="type === 'success'" stroke="currentColor" viewBox="0 0 24 24" fill="none" class="icon-svg" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
      </svg>
      <!-- Info Icon -->
      <svg v-else-if="type === 'info'" stroke="currentColor" viewBox="0 0 24 24" fill="none" class="icon-svg" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
      </svg>
      <!-- Warning Icon -->
      <svg v-else-if="type === 'warning'" stroke="currentColor" viewBox="0 0 24 24" fill="none" class="icon-svg" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
      </svg>
      <!-- Error Icon -->
      <svg v-else stroke="currentColor" viewBox="0 0 24 24" fill="none" class="icon-svg" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
      </svg>
    </div>
    <div class="alert-content">
      <p class="alert-text">
        <span class="alert-title">{{ defaultTitle }} - </span>
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'error', // 'success', 'info', 'warning', 'error'
    validator: (value) => ['success', 'info', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    default: ''
  }
});

const defaultTitle = computed(() => {
  if (props.title) return props.title;
  switch (props.type) {
    case 'success': return 'Éxito';
    case 'info': return 'Info';
    case 'warning': return 'Advertencia';
    case 'error': return 'Error';
    default: return 'Aviso';
  }
});
</script>

<style scoped>
.custom-alert {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid;
  transition: all 0.3s ease-in-out;
  animation: slideInDown 0.3s ease-out forwards;
}

.custom-alert:hover {
  transform: scale(1.02);
}

@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.icon-svg {
  height: 20px;
  width: 20px;
  flex-shrink: 0;
  margin-right: 12px;
}

.alert-content {
  display: flex;
  flex-direction: column;
}

.alert-text {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}

.alert-title {
  font-weight: bold;
}

/* --- Variantes de Colores --- */
/* Modo Oscuro (Predeterminado para tu CRM) */

/* Success */
.custom-alert.success {
  background-color: #14532d; /* dark:bg-green-900 */
  border-left-color: #15803d; /* dark:border-green-700 */
  color: #dcfce7; /* dark:text-green-100 */
}
.custom-alert.success:hover {
  background-color: #166534; /* dark:hover:bg-green-800 */
}
.custom-alert.success .icon-svg {
  color: #16a34a; /* text-green-600 */
}

/* Info */
.custom-alert.info {
  background-color: #1e3a8a; /* dark:bg-blue-900 */
  border-left-color: #1d4ed8; /* dark:border-blue-700 */
  color: #dbeafe; /* dark:text-blue-100 */
}
.custom-alert.info:hover {
  background-color: #1e40af; /* dark:hover:bg-blue-800 */
}
.custom-alert.info .icon-svg {
  color: #2563eb; /* text-blue-600 */
}

/* Warning */
.custom-alert.warning {
  background-color: #713f12; /* dark:bg-yellow-900 */
  border-left-color: #a16207; /* dark:border-yellow-700 */
  color: #fef9c3; /* dark:text-yellow-100 */
}
.custom-alert.warning:hover {
  background-color: #854d0e; /* dark:hover:bg-yellow-800 */
}
.custom-alert.warning .icon-svg {
  color: #ca8a04; /* text-yellow-600 */
}

/* Error */
.custom-alert.error {
  background-color: #7f1d1d; /* dark:bg-red-900 */
  border-left-color: #b91c1c; /* dark:border-red-700 */
  color: #fee2e2; /* dark:text-red-100 */
}
.custom-alert.error:hover {
  background-color: #991b1b; /* dark:hover:bg-red-800 */
}
.custom-alert.error .icon-svg {
  color: #dc2626; /* text-red-600 */
}
</style>
