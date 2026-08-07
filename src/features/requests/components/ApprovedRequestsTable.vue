<template>
  <div class="pending-tab">
    <div class="table-header">
      <h3>Historial de Solicitudes Aprobadas / Rechazadas</h3>
      <Loader2 v-if="loading" :size="18" class="spinner" />
    </div>

    <!-- Toolbar: registros por página -->
    <div class="table-toolbar">
      <div class="search-bar">
        <!-- Optional search bar placeholder -->
      </div>
      <div class="per-page-selector">
        <label>Mostrar</label>
        <select v-model.number="perPage" class="per-page-select" @change="fetchRequests(1)">
          <option :value="10">10</option>
          <option :value="15">15</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
        <span>registros</span>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table-custom">
        <thead>
          <tr>
            <th>Solicitante</th>
            <th>Monto</th>
            <th>Detalles de Pago</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in requests" :key="req.id">
            <td>
              <div class="user-cell">
                <img
                  v-if="req.wallet?.user?.photo"
                  :src="getAvatarUrl(req.wallet.user.photo)"
                  alt="Avatar"
                  class="user-avatar"
                  @error="$event.target.style.display = 'none'"
                />
                <div class="user-info">
                  <span class="user-name">{{ req.wallet?.user?.name }} {{ req.wallet?.user?.last_name }}</span>
                  <span class="user-username">@{{ req.wallet?.user?.username }}</span>
                </div>
              </div>
            </td>
            <td class="font-weight-bolder text-warning">
              {{ formatMoney(req.amount) }}
            </td>
            <td>
              <div class="payment-details">
                <span class="method-badge">{{ req.account_type }}</span>
                <span class="account-num">{{ req.account_number }}</span>
              </div>
            </td>
            <td>{{ formatDate(req.created_at) }}</td>
            <td>
              <span v-if="req.status === 1" class="status-badge success">
                <Check :size="14" /> Aprobado
              </span>
              <span v-else-if="req.status === 2" class="status-badge danger">
                <X :size="14" /> Rechazado
              </span>
              <span v-else class="status-badge warning">
                {{ req.status }}
              </span>
            </td>
          </tr>
          <tr v-if="requests.length === 0 && !loading">
            <td colspan="5" class="empty-row">
              <ShieldCheck :size="24" class="text-success-icon" />
              <p>No hay solicitudes en el historial.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación en servidor -->
    <div class="pagination-footer" v-if="totalPages > 1">
      <span class="pag-info">
        Mostrando {{ fromItem }}–{{ toItem }} de {{ totalItems }} solicitudes
      </span>
      <div class="pag-controls">
        <button class="btn-page" :disabled="currentPage === 1" @click="fetchRequests(currentPage - 1)">
          &lsaquo; Anterior
        </button>
        <button
          v-for="p in visiblePages"
          :key="p"
          class="btn-page"
          :class="{ active: p === currentPage }"
          @click="fetchRequests(p)"
        >
          {{ p }}
        </button>
        <button class="btn-page" :disabled="currentPage === totalPages" @click="fetchRequests(currentPage + 1)">
          Siguiente &rsaquo;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Check, X, ShieldCheck, Loader2 } from 'lucide-vue-next';
import { formatDate } from '@/utils/formatDate';
import requestsService from '../services/requestsService';

const loading = ref(false);
const requests = ref([]);
const currentPage = ref(1);
const perPage = ref(15);
const totalPages = ref(1);
const totalItems = ref(0);
const fromItem = ref(0);
const toItem = ref(0);

const fetchRequests = async (page = 1) => {
  loading.value = true;
  try {
    const response = await requestsService.getApprovedRequests(page, perPage.value);
    const data = response.data;
    requests.value = data.data || [];
    currentPage.value = data.current_page || 1;
    totalPages.value = data.last_page || 1;
    totalItems.value = data.total || 0;
    fromItem.value = data.from || 0;
    toItem.value = data.to || 0;
  } catch (error) {
    console.error('Error fetching approved requests:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRequests(1);
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const getAvatarUrl = (photoPath) => {
  if (!photoPath) return '';
  if (photoPath.startsWith('http')) return photoPath;
  return `https://promolider-storage-user.s3.sa-east-1.amazonaws.com/${photoPath}`;
};

const formatMoney = (val) => {
  const num = Math.abs(parseFloat(val) || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};
</script>

<style scoped>
/* Respetando estilos de RequestsView / PendingRequestsTable */
.pending-tab {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}
.table-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
}
.table-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
}
.spinner {
  animation: spin 1s linear infinite;
  color: var(--primary-color);
}
.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.per-page-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.per-page-select {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 4px 8px;
  border-radius: 6px;
  outline: none;
}
.table-responsive {
  overflow-x: auto;
}
.table-custom {
  width: 100%;
  border-collapse: collapse;
}
.table-custom th {
  text-align: left;
  padding: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  text-transform: uppercase;
}
.table-custom td {
  padding: 16px 12px;
  font-size: 0.9rem;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}
.user-info {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-weight: 600;
}
.user-username {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.font-weight-bolder {
  font-weight: 700;
}
.text-warning {
  color: #fbbf24;
}
.payment-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.method-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  width: max-content;
}
.account-num {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}
.status-badge.success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}
.status-badge.danger {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
.status-badge.warning {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}
.empty-row {
  text-align: center;
  padding: 3rem 1rem !important;
  color: var(--text-muted);
}
.text-success-icon {
  color: var(--primary-color);
  margin-bottom: 1rem;
  opacity: 0.5;
}
.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  margin-top: 1rem;
}
.pag-info {
  font-size: 0.85rem;
  color: var(--text-muted);
}
.pag-controls {
  display: flex;
  gap: 6px;
}
.btn-page {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-page:hover:not(:disabled) {
  background: var(--hover-bg);
}
.btn-page.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
