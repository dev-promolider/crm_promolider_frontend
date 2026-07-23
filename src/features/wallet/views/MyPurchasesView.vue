<template>
  <div class="purchases-container">
    <div class="header-section">
      <div class="title-wrapper">
        <div>
          <h1 class="page-title">Mis Compras</h1>
          <p class="page-subtitle">Historial detallado de tus transacciones y adquisiciones en la plataforma</p>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="card">
        <div class="title">
          <span style="background-color: #10b981;">
            <DollarSign :size="18" color="#ffffff" />
          </span>
          <p class="title-text">Total Invertido</p>
        </div>
        <div class="data">
          <p>${{ formatNumber(totalInvested) }}</p>
          <div class="range">
            <div class="fill" style="background-color: #10b981; width: 100%;"></div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="title">
          <span style="background-color: #3b82f6;">
            <ShoppingBag :size="18" color="#ffffff" />
          </span>
          <p class="title-text">Total Transacciones</p>
        </div>
        <div class="data">
          <p>{{ totalTransactions }}</p>
          <div class="range">
            <div class="fill" style="background-color: #3b82f6; width: 100%;"></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="title">
          <span style="background-color: #a855f7;">
            <Calendar :size="18" color="#ffffff" />
          </span>
          <p class="title-text">Última Compra</p>
        </div>
        <div class="data">
          <p style="font-size: 1.5rem; line-height: 2.5rem;">{{ lastPurchaseDate || 'N/A' }}</p>
          <div class="range">
            <div class="fill" style="background-color: #a855f7; width: 100%;"></div>
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
            placeholder="Buscar por método, operación o detalle..."
            class="search-input"
            @input="debouncedFetchPurchases"
            @keyup.enter="changePage(1)"
          />
        </div>
        
        <div class="per-page-selector">
          <span class="per-page-label">Mostrar:</span>
          <select v-model="perPage" @change="changePage(1)" class="per-page-select">
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <Loader2 class="animate-spin text-emerald-400" :size="36" />
        <span>Cargando tus compras...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="payments.length === 0" class="empty-state">
        <Inbox :size="48" class="text-gray-500 mb-2" />
        <h3>No se encontraron compras</h3>
        <p>No tienes transacciones registradas que coincidan con la búsqueda.</p>
      </div>

      <!-- Table View -->
      <div v-else class="table-responsive">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Monto</th>
              <th>Método de Pago</th>
              <th>Número Operación</th>
              <th>Detalle</th>
              <th>Fecha de Compra</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pay in payments" :key="pay.id">
              <td>
                <div class="user-cell">
                  <span class="user-fullname">{{ pay.user?.name }} {{ pay.user?.last_name }}</span>
                </div>
              </td>
              <td>
                <span class="username-badge">@{{ pay.user?.username || 'user' }}</span>
              </td>
              <td>
                <span class="amount-text text-emerald-400">${{ formatNumber(pay.amount) }}</span>
              </td>
              <td>
                <div class="payment-method">
                  <span>{{ pay.payment_method?.name || 'Otro' }}</span>
                </div>
              </td>
              <td>
                <span class="op-number">{{ pay.operation_number || 'N/A' }}</span>
              </td>
              <td>
                <span class="detail-text">{{ pay.details || 'Compra estándar' }}</span>
              </td>
              <td>
                <span class="date-text">{{ formatDate(pay.created_at) }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination-wrapper" v-if="totalPages > 1">
          <div class="pagination-info">
            Mostrando pág {{ currentPage }} de {{ totalPages }} ({{ totalItems }} compras)
          </div>
          <div class="pagination-controls">
            <button
              class="btn-page"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >&lsaquo; Anterior</button>

            <button
              v-for="p in totalPages"
              :key="p"
              class="btn-page btn-page-num"
              :class="{ active: p === currentPage }"
              @click="changePage(p)"
              v-show="Math.abs(p - currentPage) <= 2"
            >{{ p }}</button>

            <button
              class="btn-page"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >Siguiente &rsaquo;</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/features/auth/stores/authStore';
import walletService from '@/features/wallet/services/walletService';
import { 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  Search, 
  Loader2, 
  Inbox, 
  CreditCard 
} from 'lucide-vue-next';

const authStore = useAuthStore();
const payments = ref([]);
const stats = ref({ total_invested: 0, total_transactions: 0, last_purchase_date: null });
const loading = ref(false);
const searchQuery = ref('');

// Pagination state
const currentPage = ref(1);
const perPage = ref(15);
const totalPages = ref(1);
const totalItems = ref(0);

let searchTimeout;
const debouncedFetchPurchases = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchPurchases();
  }, 400);
};

const changePage = (page) => {
  currentPage.value = page;
  fetchPurchases();
};

const fetchPurchases = async () => {
  loading.value = true;
  try {
    const userId = authStore.user?.id;
    if (userId) {
      const params = {
        page: currentPage.value,
        per_page: perPage.value,
        search: searchQuery.value
      };
      const response = await walletService.getMyPurchases(userId, params);
      
      const payload = response.data || response;
      if (payload.stats && payload.paginator) {
        stats.value = payload.stats;
        payments.value = payload.paginator.data || [];
        totalPages.value = payload.paginator.last_page || 1;
        totalItems.value = payload.paginator.total || 0;
      } else {
        payments.value = payload; // fallback
      }
    }
  } catch (error) {
    console.error('Error fetching purchases:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPurchases();
});

// Computed for stats (from backend)
const totalInvested = computed(() => stats.value.total_invested || 0);
const totalTransactions = computed(() => stats.value.total_transactions || 0);
const lastPurchaseDate = computed(() => formatDate(stats.value.last_purchase_date) || 'N/A');

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
.purchases-container {
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

.header-icon-box {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: var(--indicator-blue);
  color: var(--indicator-blue-text);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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

.card .percent {
  margin-left: auto;
  color: #02972f;
  font-weight: 600;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
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
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 380px;
}

.per-page-selector {
  display: flex;
  align-items: center;
}

.per-page-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-right: 0.5rem;
}

.per-page-select {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-bold);
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

.per-page-select:focus {
  border-color: var(--primary-color);
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
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

/* Table Responsive */
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

/* Cell elements */
.user-cell {
  display: flex;
  flex-direction: column;
}

.user-fullname {
  font-weight: 500;
  color: var(--text-bold);
}

.username-badge {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.125rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.amount-text {
  font-weight: 700;
}

.payment-method {
  display: flex;
  align-items: center;
}

.op-number {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.03);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--text-main);
}

.detail-text {
  max-width: 250px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-text {
  color: var(--text-muted);
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

/* ── Pagination Footer ──────────────────────────── */
.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 4px;
  gap: 12px;
  flex-wrap: wrap;
  border-top: 1px solid var(--border-color);
  margin-top: 10px;
}

.pagination-info {
  font-size: 13px;
  color: var(--text-muted);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.15s;
  min-width: 36px;
}

.btn-page:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--indicator-green);
}

.btn-page:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-page-num.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  font-weight: 700;
}
</style>
