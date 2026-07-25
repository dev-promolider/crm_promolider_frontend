<template>
  <div class="request-form-wrapper">
    <div class="request-form-card">
      <div class="card-header-clean">
        <ArrowUpRight :size="20" class="text-premium" />
        <h3>Nueva Solicitud de Retiro</h3>
      </div>

      <p class="form-description">
        Completa los datos para solicitar el retiro de tus fondos. La solicitud quedará
        en estado <strong>Pendiente</strong> hasta que el equipo de administración la procese.
      </p>

      <div class="form-group">
        <label>Monto a Retirar (USD)</label>
        <input
          type="number"
          v-model.number="form.amount"
          placeholder="Min $20.00"
          class="form-control"
          :class="{ 'error-border': errors.amount }"
          min="20"
          max="999999.99"
          step="0.01"
        />
        <small v-if="errors.amount" class="error-msg">{{ errors.amount }}</small>
        <small v-else class="text-muted">Monto mínimo de retiro: $20.00</small>
      </div>

      <div class="form-group">
        <label>Tipo de Cuenta / Billetera</label>
        <select
          v-model="form.account_type"
          class="form-control"
          :class="{ 'error-border': errors.account_type }"
          @change="errors.account_type = ''"
        >
          <option value="">Seleccione opción</option>
          <option v-for="type in accountTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <small v-if="errors.account_type" class="error-msg">{{ errors.account_type }}</small>
      </div>

      <div class="form-group">
        <label>Número de Cuenta / Cuenta de Destino</label>
        <input
          type="text"
          v-model.trim="form.account_number"
          :placeholder="accountNumberPlaceholder"
          class="form-control"
          :class="{ 'error-border': errors.account_number }"
        />
        <small v-if="errors.account_number" class="error-msg">{{ errors.account_number }}</small>
      </div>

      <div class="form-actions mt-4">
        <button
          class="btn btn-premium btn-block"
          :disabled="!isFormValid || store.actionLoading"
          @click="handleSubmit"
        >
          <Loader2 v-if="store.actionLoading" class="spinner" :size="16" />
          Enviar Solicitud
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ArrowUpRight, Loader2 } from 'lucide-vue-next';
import { useRequestsStore } from '../stores/requestsStore';

const emit = defineEmits(['submitted', 'error']);

const store = useRequestsStore();

const MIN_AMOUNT = 20;
const MAX_AMOUNT = 999999.99;

const accountTypes = ['Cuenta de Ahorros', 'Cuenta Corriente', 'Binance', 'Paypal'];

const form = ref({ amount: '', account_type: '', account_number: '' });
const errors = ref({ amount: '', account_type: '', account_number: '' });

const accountNumberPlaceholder = computed(() => {
  switch (form.value.account_type) {
    case 'Paypal':
      return 'correo@paypal.com';
    case 'Binance':
      return 'ID de Binance o Billetera USDT';
    case 'Cuenta de Ahorros':
    case 'Cuenta Corriente':
      return 'Ej: 123-456789-0-01';
    default:
      return 'Número de cuenta, correo o ID de billetera';
  }
});

const isFormValid = computed(() => {
  return (
    Number(form.value.amount) >= MIN_AMOUNT &&
    Number(form.value.amount) <= MAX_AMOUNT &&
    form.value.account_type !== '' &&
    form.value.account_number.trim() !== ''
  );
});

function validate() {
  errors.value = { amount: '', account_type: '', account_number: '' };

  const amount = Number(form.value.amount);
  if (!form.value.amount || isNaN(amount) || amount < MIN_AMOUNT) {
    errors.value.amount = `El monto mínimo de retiro es $${MIN_AMOUNT}.00`;
  } else if (amount > MAX_AMOUNT) {
    errors.value.amount = `El monto máximo permitido es $${MAX_AMOUNT.toLocaleString('en-US')}`;
  }

  if (!form.value.account_type) {
    errors.value.account_type = 'Seleccione un tipo de cuenta.';
  }

  if (!form.value.account_number.trim()) {
    errors.value.account_number = 'Ingrese la cuenta de destino.';
  }

  return !errors.value.amount && !errors.value.account_type && !errors.value.account_number;
}

/** Mapea errores de validación 422 de Laravel a los campos del formulario. */
function mapServerErrors(error) {
  const serverErrors = error.response?.data?.errors;
  if (error.response?.status === 422 && serverErrors) {
    if (serverErrors.amount) errors.value.amount = serverErrors.amount[0];
    if (serverErrors.account_type) errors.value.account_type = serverErrors.account_type[0];
    if (serverErrors.account_number) errors.value.account_number = serverErrors.account_number[0];
    return error.response.data.message || 'Verifique los datos ingresados.';
  }
  return error.response?.data?.message || error.response?.data?.error || 'Error al procesar la solicitud.';
}

async function handleSubmit() {
  if (!validate()) return;

  try {
    await store.createRequest({
      amount: Number(form.value.amount),
      accountType: form.value.account_type,
      accountNumber: form.value.account_number.trim()
    });
    form.value = { amount: '', account_type: '', account_number: '' };
    errors.value = { amount: '', account_type: '', account_number: '' };
    emit('submitted');
  } catch (error) {
    console.error('Error creating funds request:', error);
    emit('error', mapServerErrors(error));
  }
}
</script>

<style scoped>
.request-form-wrapper {
  display: flex;
  justify-content: center;
}

.request-form-card {
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 520px;
}

.card-header-clean {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 14px;
  margin-bottom: 16px;
}

.card-header-clean h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-bold);
  margin: 0;
}

.text-premium {
  color: #10b10b;
}

.form-description {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  display: block;
  margin-bottom: 6px;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-bold);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.form-control:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(22, 197, 94, 0.12);
}

.error-border {
  border-color: #ef4444 !important;
}

.error-msg {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.text-muted {
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-premium {
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.2);
}

.btn-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.3);
}

.btn-block {
  width: 100%;
}

.mt-4 {
  margin-top: 16px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
