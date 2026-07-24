<template>
  <div class="history-tab">
    <div class="table-header">
      <h3>Mis Solicitudes de Retiro</h3>
      <Loader2 v-if="loading" :size="18" class="spinner" />
    </div>

    <div class="table-responsive">
      <table class="table-custom">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Tipo de Cuenta</th>
            <th>Nº de Cuenta</th>
            <th>Estado</th>
            <th>Soporte</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in requests" :key="request.id">
            <td>{{ formatDate(request.created_at) }}</td>
            <td class="font-weight-bolder">{{ formatMoney(request.amount) }}</td>
            <td>
              <span class="method-badge">{{ request.account_type }}</span>
            </td>
            <td class="account-num">{{ request.account_number }}</td>
            <td>
              <span class="badge-status" :class="getStatusBadgeClass(request.status)">
                {{ getStatusLabel(request.status) }}
              </span>
            </td>
            <td>
              <button
                v-if="request.support_image || request.message"
                class="btn-table-action"
                @click="$emit('view-support', request)"
              >
                <Eye :size="14" /> Ver
              </button>
              <span v-else class="text-muted-cell">-</span>
            </td>
          </tr>
          <tr v-if="requests.length === 0 && !loading">
            <td colspan="6" class="empty-row">
              <Inbox :size="24" />
              <p>Aún no has realizado solicitudes de retiro.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { Eye, Inbox, Loader2 } from 'lucide-vue-next';
import { formatDate } from '@/utils/formatDate';

defineProps({
  requests: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['view-support']);

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Math.abs(amount ?? 0));
}

function getStatusLabel(status) {
  if (status === 0) return 'Pendiente';
  if (status === 1) return 'Aprobado';
  return 'Rechazado';
}

function getStatusBadgeClass(status) {
  if (status === 0) return 'badge-warning';
  if (status === 1) return 'badge-success';
  return 'badge-danger';
}
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.table-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-bold);
  margin: 0;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.table-custom {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.table-custom th {
  padding: 12px 16px;
  font-size: 12px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  border-bottom: 2px solid var(--border-color);
}

.table-custom td {
  padding: 16px;
  font-size: 14px;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.table-custom tbody tr:hover {
  background: rgba(0, 0, 0, 0.025);
}

.font-weight-bolder {
  font-weight: 700;
}

.empty-row {
  text-align: center;
  padding: 48px 16px !important;
  color: var(--text-muted);
}

.empty-row p {
  margin: 12px 0 0 0;
  font-size: 14px;
}

.badge-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}

.badge-warning { background: var(--indicator-orange); color: var(--indicator-orange-text); }
.badge-success { background: var(--indicator-green);  color: var(--indicator-green-text); }
.badge-danger  { background: var(--indicator-red);    color: var(--indicator-red-text); }

.method-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: var(--indicator-blue);
  color: var(--indicator-blue-text);
}

.account-num {
  font-size: 13px;
  color: var(--text-muted);
}

.btn-table-action {
  background: transparent;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-table-action:hover {
  background: #f0fdf4;
}

.text-muted-cell {
  color: var(--text-muted);
  font-size: 12px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
