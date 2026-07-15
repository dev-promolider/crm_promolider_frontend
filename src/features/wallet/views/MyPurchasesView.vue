<template>
  <div class="purchases-container">
    <div class="header-section">
      <div class="title-wrapper">
        <div class="icon-bg">
          <ShoppingBag :size="24" class="text-emerald-400" />
        </div>
        <div>
          <h1 class="page-title">Mis Compras</h1>
          <p class="page-subtitle">Historial detallado de tus transacciones y adquisiciones en la plataforma</p>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-emerald-500/10">
          <DollarSign :size="20" class="text-emerald-400" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Invertido</span>
          <span class="stat-value">${{ formatNumber(totalInvested) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-blue-500/10">
          <ShoppingBag :size="20" class="text-blue-400" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Transacciones</span>
          <span class="stat-value">{{ filteredPayments.length }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-purple-500/10">
          <Calendar :size="20" class="text-purple-400" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Última Compra</span>
          <span class="stat-value">{{ lastPurchaseDate || 'N/A' }}</span>
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
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <Loader2 class="animate-spin text-emerald-400" :size="36" />
        <span>Cargando tus compras...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredPayments.length === 0" class="empty-state">
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
            <tr v-for="pay in filteredPayments" :key="pay.id">
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
                  <CreditCard :size="14" class="mr-1 opacity-70" />
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
const loading = ref(false);
const searchQuery = ref('');

const fetchPurchases = async () => {
  loading.value = true;
  try {
    const userId = authStore.user?.id;
    if (userId) {
      const response = await walletService.getMyPurchases(userId);
      payments.value = response.data || response;
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

// Computed
const filteredPayments = computed(() => {
  if (!searchQuery.value.trim()) return payments.value;
  const query = searchQuery.value.toLowerCase();
  return payments.value.filter(pay => {
    const method = (pay.payment_method?.name || '').toLowerCase();
    const op = (pay.operation_number || '').toLowerCase();
    const detail = (pay.details || '').toLowerCase();
    return method.includes(query) || op.includes(query) || detail.includes(query);
  });
});

const totalInvested = computed(() => {
  return filteredPayments.value.reduce((sum, pay) => sum + parseFloat(pay.amount || 0), 0);
});

const lastPurchaseDate = computed(() => {
  if (payments.value.length === 0) return null;
  const sorted = [...payments.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return formatDate(sorted[0].created_at);
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
.purchases-container {
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
  background: rgba(16, 185, 129, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(16, 185, 129, 0.2);
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
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

/* Table Responsive */
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

/* Cell elements */
.user-cell {
  display: flex;
  flex-direction: column;
}

.user-fullname {
  font-weight: 500;
  color: #f1f5f9;
}

.username-badge {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.125rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #94a3b8;
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
  background: rgba(255, 255, 255, 0.03);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #cbd5e1;
}

.detail-text {
  max-width: 250px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-text {
  color: #64748b;
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
