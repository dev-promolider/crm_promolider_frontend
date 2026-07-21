<template>
  <div class="binary-container">
    <div class="header-section">
      <div class="title-wrapper">
        <div>
          <h1 class="page-title">Historial de Corte Binario</h1>
          <p class="page-subtitle">Historial detallado y estadísticas de tus cortes binarios por rangos y puntos</p>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="card">
        <div class="title">
          <span style="background-color: #06b6d4;">
            <Activity :size="18" color="#ffffff" />
          </span>
          <p class="title-text">Total de Cortes</p>
        </div>
        <div class="data">
          <p>{{ totalHistories }}</p>
          <div class="range">
            <div class="fill" style="background-color: #06b6d4; width: 100%;"></div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="title">
          <span style="background-color: #f59e0b;">
            <Calendar :size="18" color="#ffffff" />
          </span>
          <p class="title-text">Último Corte</p>
        </div>
        <div class="data">
          <p style="font-size: 1.5rem; line-height: 2.5rem;">{{ lastCutDate ? formatDate(lastCutDate) : 'N/A' }}</p>
          <div class="range">
            <div class="fill" style="background-color: #f59e0b; width: 100%;"></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="title">
          <span style="background-color: #3b82f6;">
            <Award :size="18" color="#ffffff" />
          </span>
          <p class="title-text">Rango Actual</p>
        </div>
        <div class="data">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1rem;">
            <img v-if="currentRank?.icon" :src="getS3Url(currentRank.icon)" alt="Medalla" style="width:40px; height:40px; object-fit:contain;" @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;" />
            <p style="font-size: 1.5rem; line-height: 2.5rem; margin: 0;">{{ currentRank?.name || 'University' }}</p>
          </div>
          <div class="range">
            <div class="fill" style="background-color: #3b82f6; width: 100%;"></div>
          </div>
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
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <img v-if="history.rank?.icon" :src="getS3Url(history.rank.icon)" alt="Medalla" style="width: 24px; height: 24px; object-fit: contain;" @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;" />
                    <span class="rank-name">{{ history.rank?.name || 'N/A' }}</span>
                  </div>
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

const S3_BASE = 'https://promolider-storage-user.s3.amazonaws.com'

function getS3Url(path) {
  if (!path) return ''
  if (path.includes('api.promolider.email')) {
    path = path.replace(/https?:\/\/api\.promolider\.email/g, '');
  }
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const cleanPath = path.startsWith('/') ? path : '/' + path
  return S3_BASE + cleanPath
}

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
    currentRank.value = histories.value.length > 0 ? histories.value[0].rank : null;
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
  color: var(--text-main);
}

.header-section {
  margin-bottom: 2rem;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-bold);
}

.page-subtitle {
  color: var(--text-muted);
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

.card {
  padding: 1.25rem;
  background-color: var(--card-bg, #fff);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  border: 1px solid var(--border-color, rgba(0,0,0,0.05));
  width: 100%;
}

.card .title {
  display: flex;
  align-items: center;
}

.card .title span {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card .title-text {
  margin-left: 0.75rem;
  color: var(--text-muted, #374151);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0;
}

.card .data {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: 1rem;
}

.card .data p {
  margin: 0 0 1rem 0;
  color: var(--text-bold, #1F2937);
  font-size: 2rem;
  line-height: 2.5rem;
  font-weight: 700;
  text-align: left;
}

.card .data .range {
  position: relative;
  background-color: var(--bg-main, #E5E7EB);
  width: 100%;
  height: 0.5rem;
  border-radius: 0.25rem;
}

.card .data .range .fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 0.25rem;
}

/* Content card */
.content-card {
  background: var(--card-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
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
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-bold);
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
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-bold);
  font-size: 0.875rem;
  outline: none;
}

/* Table */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.premium-table th {
  background: rgba(0, 0, 0, 0.05);
  padding: 1rem;
  color: var(--text-muted);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
}

.sortable-header:hover {
  background-color: rgba(0, 0, 0, 0.025);
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
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
}

.premium-table tbody tr {
  transition: background-color 0.15s ease;
}

.premium-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.025);
}

.rank-name {
  font-weight: 600;
  color: var(--text-bold);
}

.amount-text {
  font-weight: 700;
}

.date-text {
  color: var(--text-muted);
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
  color: var(--text-muted);
}

.pagination-buttons {
  display: flex;
  gap: 0.375rem;
}

.pag-btn {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-main);
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
  background: var(--indicator-green);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.pag-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
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
  color: var(--text-muted);
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem 0;
  color: var(--text-bold);
}

.empty-state p {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
  max-width: 300px;
}
</style>
