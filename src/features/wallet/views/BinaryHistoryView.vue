<template>
  <div class="binary-container">
    <div class="header-section">
      <div class="title-wrapper">
        <div class="icon-bg">
          <Activity :size="24" class="text-cyan-400" />
        </div>
        <div>
          <h1 class="page-title">Historial de Corte Binario</h1>
          <p class="page-subtitle">Historial detallado y estadísticas de tus cortes binarios por rangos y puntos</p>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-cyan-500/10">
          <Activity :size="20" class="text-cyan-400" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total de Cortes</span>
          <span class="stat-value">{{ totalHistories }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-amber-500/10">
          <Calendar :size="20" class="text-amber-400" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Último Corte</span>
          <span class="stat-value">{{ lastCutDate ? formatDate(lastCutDate) : 'N/A' }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-blue-500/10">
          <Award :size="20" class="text-blue-400" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Rango Actual</span>
          <span class="stat-value">{{ currentRank || 'University' }}</span>
        </div>
      </div>
    </div>

    <!-- Filter & Table Card -->
    <div class="content-card">
      <div class="card-header-actions">
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar por rango o fecha..."
            @input="debouncedSearch"
            class="search-input"
          />
        </div>
        <div class="per-page-selector">
          <select v-model="perPage" @change="changePerPage" class="premium-select">
            <option :value="10">10 por pág.</option>
            <option :value="20">20 por pág.</option>
            <option :value="50">50 por pág.</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <Loader2 class="animate-spin text-cyan-400" :size="36" />
        <span>Cargando historial binario...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="histories.length === 0" class="empty-state">
        <Inbox :size="48" class="text-gray-500 mb-2" />
        <h3>No se encontraron cortes</h3>
        <p>No tienes registros de cortes binarios que coincidan con la búsqueda.</p>
      </div>

      <!-- Table View -->
      <div v-else>
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th @click="sortBy('rank.name')" class="sortable-header">
                  Rango
                  <ChevronDown v-if="sortKey === 'rank.name'" :size="14" class="sort-icon" :class="{ rotated: sortOrder === 'asc' }" />
                </th>
                <th @click="sortBy('left_points')" class="sortable-header">
                  Puntos Izquierda
                  <ChevronDown v-if="sortKey === 'left_points'" :size="14" class="sort-icon" :class="{ rotated: sortOrder === 'asc' }" />
                </th>
                <th @click="sortBy('right_points')" class="sortable-header">
                  Puntos Derecha
                  <ChevronDown v-if="sortKey === 'right_points'" :size="14" class="sort-icon" :class="{ rotated: sortOrder === 'asc' }" />
                </th>
                <th @click="sortBy('transferred_amount')" class="sortable-header">
                  Monto Transferido
                  <ChevronDown v-if="sortKey === 'transferred_amount'" :size="14" class="sort-icon" :class="{ rotated: sortOrder === 'asc' }" />
                </th>
                <th @click="sortBy('created_at')" class="sortable-header">
                  Fecha de Corte
                  <ChevronDown v-if="sortKey === 'created_at'" :size="14" class="sort-icon" :class="{ rotated: sortOrder === 'asc' }" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="history in histories" :key="history.id">
                <td>
                  <span class="rank-name">{{ history.rank?.name || 'N/A' }}</span>
                </td>
                <td>{{ formatNumber(history.left_points) }}</td>
                <td>{{ formatNumber(history.right_points) }}</td>
                <td>
                  <span class="amount-text text-emerald-400">${{ formatNumber(history.transferred_amount) }}</span>
                </td>
                <td>
                  <span class="date-text">{{ formatDate(history.created_at) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="pagination-wrapper">
          <div class="pagination-info">
            Mostrando {{ (pagination.current_page - 1) * perPage + 1 }} -
            {{ Math.min(pagination.current_page * perPage, pagination.total) }}
            de {{ pagination.total }} registros
          </div>
          <div class="pagination-buttons">
            <button 
              @click="changePage(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="pag-btn"
            >
              <ChevronLeft :size="16" />
            </button>
            <button 
              v-for="page in visiblePages" 
              :key="page" 
              @click="changePage(page)"
              class="pag-btn"
              :class="{ active: page === currentPage }"
            >
              {{ page }}
            </button>
            <button 
              @click="changePage(currentPage + 1)" 
              :disabled="currentPage === pagination.last_page"
              class="pag-btn"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import walletService from '@/features/wallet/services/walletService';
import { 
  Activity, 
  Award, 
  Calendar, 
  Search, 
  Loader2, 
  Inbox, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-vue-next';

// State
const histories = ref([]);
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 10
});
const loading = ref(false);
const currentPage = ref(1);
const perPage = ref(10);
const searchQuery = ref('');
const sortKey = ref('created_at');
const sortOrder = ref('desc');

const totalHistories = ref(0);
const lastCutDate = ref(null);
const currentRank = ref(null);

// Methods
const fetchHistory = async (page = 1) => {
  loading.value = true;
  try {
    const response = await walletService.getBinaryHistory({
      page,
      per_page: perPage.value,
      search: searchQuery.value,
      sort_key: sortKey.value,
      sort_order: sortOrder.value
    });

    const resData = response.data || response;
    histories.value = resData.data || [];
    pagination.value = {
      current_page: resData.current_page || 1,
      last_page: resData.last_page || 1,
      total: resData.total || 0,
      per_page: resData.per_page || perPage.value
    };
    currentPage.value = page;

    // Stats
    totalHistories.value = resData.total || 0;
    lastCutDate.value = histories.value.length > 0 ? histories.value[0].created_at : null;
    currentRank.value = histories.value.length > 0 ? histories.value[0].rank?.name : null;
  } catch (error) {
    console.error('Error fetching binary history:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHistory();
});

// Debounce Search
let timeoutId = null;
const debouncedSearch = () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    fetchHistory(1);
  }, 400);
};

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchHistory(page);
  }
};

const changePerPage = () => {
  fetchHistory(1);
};

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'desc';
  }
  fetchHistory(1);
};

// Computed visible pages
const visiblePages = computed(() => {
  const range = 2;
  const start = Math.max(1, currentPage.value - range);
  const end = Math.min(pagination.value.last_page, currentPage.value + range);

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Helpers
const formatNumber = (val) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.binary-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  color: #f8fafc;
}

.header-section {
  margin-bottom: 2rem;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(34, 211, 238, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(34, 211, 238, 0.2);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}

.stat-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-top: 0.125rem;
}

/* Content card */
.content-card {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.card-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 380px;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  border-color: rgba(34, 211, 238, 0.4);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
}

.premium-select {
  padding: 0.625rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 0.875rem;
  outline: none;
}

/* Table */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(15, 23, 42, 0.3);
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.premium-table th {
  background: rgba(15, 23, 42, 0.5);
  padding: 1rem;
  color: #94a3b8;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
}

.sortable-header:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.sort-icon {
  display: inline-block;
  vertical-align: middle;
  margin-left: 0.25rem;
  transition: transform 0.2s ease;
}

.sort-icon.rotated {
  transform: rotate(180deg);
}

.premium-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
}

.premium-table tbody tr {
  transition: background-color 0.15s ease;
}

.premium-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.rank-name {
  font-weight: 600;
  color: #e2e8f0;
}

.amount-text {
  font-weight: 700;
}

.date-text {
  color: #64748b;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-buttons {
  display: flex;
  gap: 0.375rem;
}

.pag-btn {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  outline: none;
}

.pag-btn:hover:not(:disabled) {
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
  border-color: rgba(34, 211, 238, 0.2);
}

.pag-btn.active {
  background: #22d3ee;
  color: #0f172a;
  border-color: #22d3ee;
  font-weight: 600;
}

.pag-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.loading-state span {
  margin-top: 1rem;
  color: #94a3b8;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem 0;
  color: #f1f5f9;
}

.empty-state p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
  max-width: 300px;
}
</style>
