<template>
  <div class="modal-overlay" @click.self="handleClose">
    <div class="modal-card">
      <div class="modal-header">
        <h5>Aprobar Solicitud de Retiro</h5>
        <button class="close-btn" @click="handleClose"><X :size="18" /></button>
      </div>

      <div class="modal-body">
        <!-- Resumen de la solicitud -->
        <div class="request-summary" v-if="request">
          <div class="summary-row">
            <span>Solicitante:</span>
            <strong>{{ request.wallet?.user?.name }} {{ request.wallet?.user?.last_name }} (@{{ request.wallet?.user?.username }})</strong>
          </div>
          <div class="summary-row">
            <span>Monto:</span>
            <strong class="text-premium">{{ formatMoney(request.amount) }}</strong>
          </div>
          <div class="summary-row">
            <span>Cuenta destino:</span>
            <strong>{{ request.account_type }} · {{ request.account_number }}</strong>
          </div>
        </div>

        <div class="form-group">
          <label>Mensaje o Nota de Aprobación (opcional)</label>
          <textarea
            v-model="message"
            placeholder="Escribe detalles del depósito o transacción..."
            class="form-control"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Subir Comprobante (imagen, máx. 10 MB)</label>
          <input
            type="file"
            @change="handleFileChange"
            accept="image/*"
            class="form-control"
          />
          <small v-if="fileError" class="error-msg">{{ fileError }}</small>
          <small v-else-if="fileName" class="file-ok">Archivo seleccionado: {{ fileName }}</small>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleClose">Cancelar</button>
        <button
          class="btn btn-premium"
          :disabled="loading || !!fileError"
          @click="handleConfirm"
        >
          <Loader2 v-if="loading" class="spinner" :size="14" />
          Confirmar Aprobación
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { X, Loader2 } from 'lucide-vue-next';

const props = defineProps({
  request: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'confirm']);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const message = ref('');
const file = ref(null);
const fileName = ref('');
const fileError = ref('');

function handleFileChange(event) {
  const selected = event.target.files[0];
  fileError.value = '';
  fileName.value = '';
  file.value = null;

  if (!selected) return;

  if (selected.size > MAX_FILE_SIZE) {
    fileError.value = 'La imagen supera el tamaño máximo permitido (10 MB).';
    event.target.value = '';
    return;
  }

  file.value = selected;
  fileName.value = selected.name;
}

function handleConfirm() {
  if (fileError.value) return;
  emit('confirm', {
    id: props.request?.id,
    message: message.value,
    file: file.value
  });
}

function handleClose() {
  message.value = '';
  file.value = null;
  fileName.value = '';
  fileError.value = '';
  emit('close');
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Math.abs(amount ?? 0));
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  animation: fadeInModal 0.2s ease-out;
}

@keyframes fadeInModal {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h5 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  color: var(--text-bold);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
}

.close-btn:hover {
  color: var(--text-bold);
  background: rgba(0, 0, 0, 0.05);
}

.modal-body {
  padding: 20px;
}

.request-summary {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-muted);
  padding: 4px 0;
}

.summary-row strong {
  color: var(--text-bold);
  text-align: right;
}

.text-premium {
  color: #10b10b;
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

.error-msg {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.file-ok {
  color: #16a34a;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.08);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
