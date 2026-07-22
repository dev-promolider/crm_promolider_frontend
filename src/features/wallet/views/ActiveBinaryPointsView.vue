<template>
  <div class="binary-points-container">
    <div class="header-section">
      <div class="title-wrapper">
        <div>
          <h1 class="page-title">Puntos Binarios Activos</h1>
          <p class="page-subtitle">Detalle de los puntos acumulados listos para el próximo corte binario</p>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="card left-leg-card">
        <div class="title">
          <span style="background-color: #3b82f6;">
            <Users :size="18" color="#ffffff" />
          </span>
          <p class="title-text">Pierna Izquierda</p>
        </div>
        <div class="data">
          <p style="font-size: 2rem; font-weight: 700; color: #3b82f6;">{{ totalLeft.toFixed(2) }} <span style="font-size: 1rem; color: #64748b;">PTS</span></p>
          <div class="range">
            <div class="fill" style="background-color: #3b82f6; width: 100%;"></div>
          </div>
        </div>
      </div>
      
      <div class="card right-leg-card">
        <div class="title">
          <span style="background-color: #10b981;">
            <Users :size="18" color="#ffffff" />
          </span>
          <p class="title-text">Pierna Derecha</p>
        </div>
        <div class="data">
          <p style="font-size: 2rem; font-weight: 700; color: #10b981;">{{ totalRight.toFixed(2) }} <span style="font-size: 1rem; color: #64748b;">PTS</span></p>
          <div class="range">
            <div class="fill" style="background-color: #10b981; width: 100%;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Tabs -->
    <div class="tabs-container">
      <div class="tabs-header">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'left' }" 
          @click="activeTab = 'left'"
        >
          Pierna Izquierda ({{ leftLeg.length }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'right' }" 
          @click="activeTab = 'right'"
        >
          Pierna Derecha ({{ rightLeg.length }})
        </button>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <label for="genFilter" class="filter-label">Filtrar por:</label>
        <select id="genFilter" v-model="generationFilter" class="filter-select">
          <option value="all">Todas las relaciones</option>
          <option value="-1">Derrame</option>
          <option value="0">Compra Propia</option>
          <option value="1">Generación 1</option>
          <option value="2">Generación 2</option>
          <option value="3">Generación 3</option>
          <option value="4">Generación 4</option>
          <option value="5">Generación 5+</option>
        </select>
      </div>

      <div class="tab-content" v-if="!loading">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Generado por</th>
                <th>Relación</th>
                <th>Motivo</th>
                <th>Puntos</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="currentPoints.length === 0">
                <td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                  No hay puntos activos en esta pierna.
                </td>
              </tr>
              <tr v-for="point in currentPoints" :key="point.id">
                <td>
                  <div class="user-cell">
                    <img :src="getS3Url(point.sponsor.photo)" alt="User" class="user-avatar" @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;" />
                    <span class="user-name">{{ point.sponsor.name }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge" :class="getGenerationClass(point.generation)">
                    {{ formatGeneration(point.generation) }}
                  </span>
                </td>
                <td style="color: var(--text-muted);">{{ point.reason }}</td>
                <td style="font-weight: 600; color: var(--text-bold);">+{{ point.points }}</td>
                <td style="color: var(--text-muted);">{{ formatDate(point.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Loading Skeleton -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando puntos activos...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Users } from 'lucide-vue-next';
import walletService from '@/features/wallet/services/walletService';
import dayjs from 'dayjs';

const loading = ref(true);
const activeTab = ref('left');
const generationFilter = ref('all');
const leftLeg = ref([]);
const rightLeg = ref([]);
const totalLeft = ref(0);
const totalRight = ref(0);

const currentPoints = computed(() => {
  let points = activeTab.value === 'left' ? leftLeg.value : rightLeg.value;
  
  if (generationFilter.value !== 'all') {
    const filterVal = parseInt(generationFilter.value);
    if (filterVal === 5) {
      points = points.filter(p => p.generation >= 5);
    } else {
      points = points.filter(p => p.generation === filterVal);
    }
  }
  
  return points;
});

const loadPoints = async () => {
  try {
    loading.value = true;
    const response = await walletService.getActiveBinaryPoints();
    if (response.data?.status === 'success') {
      leftLeg.value = response.data.data.left_leg;
      rightLeg.value = response.data.data.right_leg;
      totalLeft.value = response.data.data.total_left;
      totalRight.value = response.data.data.total_right;
    }
  } catch (error) {
    console.error("Error loading active binary points:", error);
  } finally {
    loading.value = false;
  }
};

const getS3Url = (path) => {
  if (!path) return '/img_mantenimiento.png';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_S3_URL}/${path}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).format('DD MMM YYYY, HH:mm');
};

const formatGeneration = (gen) => {
  if (gen === 0) return 'Compra Propia';
  if (gen === -1) return 'Derrame';
  return `Generación ${gen}`;
};

const getGenerationClass = (gen) => {
  if (gen === 0) return 'badge-self';
  if (gen === -1) return 'badge-spillover';
  if (gen === 1) return 'badge-gen1';
  if (gen === 2) return 'badge-gen2';
  return 'badge-gen-other';
};

onMounted(() => {
  loadPoints();
});
</script>

<style scoped>
.binary-points-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-bold);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: var(--text-muted);
  margin: 0;
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border-color);
}

.card .title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.card .title span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.card .title-text {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.range {
  height: 6px;
  background-color: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 1rem;
}

.fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s ease-in-out;
}

.tabs-container {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.02);
}

.tab-btn {
  flex: 1;
  padding: 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text-main);
  background: rgba(0, 0, 0, 0.02);
}

.tab-btn.active {
  color: var(--text-main);
  border-bottom-color: #3b82f6;
  background: var(--card-bg);
}

.filters-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.01);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 600;
}

.filter-select {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-main);
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
  min-width: 200px;
}

.filter-select:focus {
  border-color: #3b82f6;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(0,0,0,0.02);
}

td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
  color: var(--text-main);
}

tr:hover td {
  background-color: rgba(0, 0, 0, 0.02);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.user-name {
  font-weight: 600;
  color: var(--text-main);
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.badge-self {
  background-color: #f1f5f9;
  color: #475569;
}

.badge-spillover {
  background-color: #fef2f2;
  color: #ef4444;
}

.badge-gen1 {
  background-color: #ecfdf5;
  color: #10b981;
}

.badge-gen2 {
  background-color: #eff6ff;
  color: #3b82f6;
}

.badge-gen-other {
  background-color: #f5f3ff;
  color: #8b5cf6;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: var(--text-muted);
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
