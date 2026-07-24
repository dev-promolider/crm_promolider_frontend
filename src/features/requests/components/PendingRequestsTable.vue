<template>
  <div class="pending-tab">
    <div class="table-header">
      <h3>Solicitudes de Retiro Pendientes</h3>
      <Loader2 v-if="loading" :size="18" class="spinner" />
    </div>

    <!-- Toolbar: búsqueda + registros por página -->
    <div class="table-toolbar">
      <div class="search-bar">
        <Search :size="14" class="search-icon" />
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Buscar por nombre, usuario o cuenta..."
        />
      </div>
      <div class="per-page-selector">
        <label>Mostrar</label>
        <select v-model.number="perPage" class="per-page-select">
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in paginatedRequests" :key="req.id">
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
              <div class="admin-actions">
                <button class="btn-approve" @click="$emit('approve', req)">
                  <Check :size="14" /> Aprobar
                </button>
                <button class="btn-reject" @click="handleReject(req.id)">
                  <X :size="14" /> Rechazar
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredRequests.length === 0 && !loading">
            <td colspan="5" class="empty-row">
              <ShieldCheck :size="24" class="text-success-icon" />
              <p v-if="searchQuery">No se encontraron solicitudes para "{{ searchQuery }}".</p>
              <p v-else>¡Buen trabajo! No hay solicitudes pendientes de aprobación.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación en cliente -->
    <div class="pagination-footer" v-if="totalPages > 1">
      <span class="pag-info">
        Mostrando {{ pageFrom }}–{{ pageTo }} de {{ filteredRequests.length }} solicitudes
      </span>
      <div class="pag-controls">
        <button class="btn-page" :disabled="currentPage === 1" @click="currentPage--">
          &lsaquo; Anterior
        </button>
        <button
          v-for="p in visiblePages"
          :key="p"
          class="btn-page"
          :class="{ active: p === currentPage }"
          @click="currentPage = p"
        >
          {{ p }}
        </button>
        <button class="btn-page" :disabled="currentPage === totalPages" @click="currentPage++">
          Siguiente &rsaquo;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Check, X, Search, ShieldCheck, Loader2 } from 'lucide-vue-next';
import { formatDate } from '@/utils/formatDate';

const props = defineProps({
  requests: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['approve', 'reject']);

const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(10);

const filteredRequests = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return props.requests;

  return props.requests.filter((req) => {
    const user = req.wallet?.user || {};
    return (
      String(user.name || '').toLowerCase().includes(query) ||
      String(user.last_name || '').toLowerCase().includes(query) ||
      String(user.username || '').toLowerCase().includes(query) ||
      String(req.account_number || '').toLowerCase().includes(query) ||
      String(req.account_type || '').toLowerCase().includes(query)
    );
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRequests.value.length / perPage.value)));

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredRequests.value.slice(start, start + perPage.value);
});

const pageFrom = computed(() => (currentPage.value - 1) * perPage.value + 1);
const pageTo = computed(() => Math.min(currentPage.value * perPage.value, filteredRequests.value.length));

const visiblePages = computed(() => {
  const pages = [];
  for (let p = 1; p <= totalPages.value; p++) {
    if (Math.abs(p - currentPage.value) <= 2) pages.push(p);
  }
  return pages;
});

// Reiniciar a la primera página al cambiar búsqueda o tamaño de página
watch([searchQuery, perPage], () => {
  currentPage.value = 1;
});

// Si la lista se reduce y la página actual queda vacía, retroceder
watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) currentPage.value = newTotal;
});

function handleReject(id) {
  if (!confirm('¿Está seguro de rechazar esta solicitud de retiro?')) return;
  emit('reject', id);
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Math.abs(amount ?? 0));
}

function getAvatarUrl(photoPath) {
  if (!photoPath) return '/img_mantenimiento.png';
  if (photoPath.startsWith('http')) return photoPath;
  return `https://promolider-storage-user.s3.sa-east-1.amazonaws.com/${photoPath}`;
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

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.search-bar {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-bar input {
  padding: 8px 12px 8px 36px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  width: 100%;
  background: var(--card-bg);
  color: var(--text-bold);
  box-sizing: border-box;
}

.search-bar input:focus {
  border-color: #22c55e;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.per-page-select {
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  background: var(--card-bg);
  color: var(--text-bold);
  outline: none;
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

.text-warning {
  color: #d97706;
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

.text-success-icon {
  color: #16a34a;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--text-bold);
  font-size: 13px;
}

.user-username {
  font-size: 12px;
  color: var(--text-muted);
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.method-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: var(--indicator-blue);
  color: var(--indicator-blue-text);
  width: fit-content;
}

.account-num {
  font-size: 12px;
  color: var(--text-muted);
}

.admin-actions {
  display: flex;
  gap: 8px;
}

.btn-approve {
  background: #22c55e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-approve:hover {
  background: #16a34a;
}

.btn-reject {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-reject:hover {
  background: #dc2626;
}

.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.pag-info {
  font-size: 13px;
  color: var(--text-muted);
}

.pag-controls {
  display: flex;
  gap: 6px;
}

.btn-page {
  padding: 8px 14px;
  border-radius: 6px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-page.active {
  background: #16a34a;
  border-color: #16a34a;
  color: white;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
