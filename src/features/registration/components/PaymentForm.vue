<template>
  <div class="payment-form">
    <div class="info-box">
      <h3>Resumen de Pago</h3>
      <div class="price-row">
        <span>Membresía Promolider</span>
        <span class="price">${{ amount }} USD</span>
      </div>
      <p class="disclaimer">Serás redirigido a nuestra pasarela segura de Openpay para completar tu pago.</p>
    </div>

    <div v-if="error" class="payment-error">
      <AlertCircle :size="20" />
      <span>{{ error }}</span>
    </div>

    <button @click="handlePayment" class="submit-btn" :disabled="loading">
      <span v-if="loading">Procesando...</span>
      <span v-else>Pagar y Completar Registro</span>
    </button>
  </div>
</template>

<script setup>
import { AlertCircle } from 'lucide-vue-next';

defineProps({
  amount: {
    type: String,
    default: '53.10'
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['submit']);

const handlePayment = () => {
  emit('submit');
};
</script>

<style scoped>
.info-box {
  background-color: var(--sidebar-bg);
  border: 1px solid var(--sidebar-hover-bg);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-box h3 {
  color: var(--white);
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px dashed var(--sidebar-hover-bg);
  margin-bottom: 15px;
  color: var(--text-main);
  font-weight: 600;
}

.price-row .price {
  color: var(--primary-color);
  font-size: 20px;
  font-weight: 800;
}

.disclaimer {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.payment-error {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}
</style>
