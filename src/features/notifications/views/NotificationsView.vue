<template>
  <div class="notifications-page">
    <div class="page-header">
      <h1 class="page-title">Notificaciones</h1>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-grid">
        <!-- Search User -->
        <div class="filter-group">
          <label class="filter-label">Buscar por usuario</label>
          <div class="filter-input-wrapper">
            <Search class="filter-icon" :size="16" />
            <input 
              v-model="filters.search_user" 
              type="text" 
              placeholder="Nombre o username..." 
              class="filter-input with-icon"
              @keyup.enter="applyFilters"
            />
          </div>
        </div>

        <!-- Notification Type -->
        <div class="filter-group">
          <label class="filter-label">Tipo de notificación</label>
          <select 
            v-model="filters.type" 
            class="filter-input"
            @change="applyFilters"
          >
            <option value="Todos">Todos</option>
            <option value="1">Sistema / General</option>
            <option value="2">Cursos / Módulos</option>
            <option value="3">Billetera / Pagos</option>
          </select>
        </div>

        <!-- Date Range -->
        <div class="filter-group">
          <label class="filter-label">Fecha Inicio</label>
          <input 
            v-model="filters.date_start" 
            type="date" 
            class="filter-input"
            @change="applyFilters"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Fecha Fin</label>
          <div class="filter-actions">
            <input 
              v-model="filters.date_end" 
              type="date" 
              class="filter-input flex-1"
              @change="applyFilters"
            />
            <button 
              @click="applyFilters" 
              class="btn-filter-apply"
              title="Aplicar filtros"
            >
              <Filter :size="16" />
            </button>
            <button 
              @click="clearFilters" 
              class="btn-filter-clear"
              title="Limpiar filtros"
            >
              <X :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="list-card">
      <div v-if="loading" class="empty-state">
        <Loader2 class="spinner-icon mb-4" :size="32" />
        <span class="empty-text">Cargando notificaciones...</span>
      </div>

      <div v-else-if="notifications.length === 0" class="empty-state">
        <BellOff :size="48" class="empty-icon mb-4" />
        <h3 class="empty-title">No hay notificaciones</h3>
        <p class="empty-text">No encontramos notificaciones con los filtros aplicados.</p>
      </div>

      <div v-else class="notifications-list">
        <div 
          v-for="notif in notifications" 
          :key="notif.id" 
          class="notif-item"
          :class="{'is-seen': notif.seen}"
        >
          <div class="notif-avatar-wrapper">
            <img v-if="notif.photo" :src="notif.photo" class="notif-avatar" />
            <div v-else class="notif-avatar-placeholder">
              <Bell :size="20" />
            </div>
          </div>
          <div class="notif-content">
            <div class="notif-header">
              <h4 class="notif-title">{{ notif.title }}</h4>
              <span class="notif-time">{{ formatDate(notif.created_at) }}</span>
            </div>
            <p class="notif-body">{{ notif.body }}</p>
          </div>
          <div v-if="!notif.seen" class="notif-unread-indicator">
            <div class="unread-dot"></div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="pagination-footer">
        <span class="pagination-text">
          Mostrando {{ pagination.from || 0 }} a {{ pagination.to || 0 }} de {{ pagination.total || 0 }} notificaciones
        </span>
        <div class="pagination-controls">
          <button 
            @click="changePage(pagination.current_page - 1)" 
            :disabled="pagination.current_page === 1"
            class="btn-page"
          >
            Anterior
          </button>
          <button 
            @click="changePage(pagination.current_page + 1)" 
            :disabled="pagination.current_page === pagination.last_page"
            class="btn-page"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/apiClient';
import { Search, Filter, BellOff, Loader2, Bell, X } from 'lucide-vue-next';
import { ElMessage } from 'element-plus';

const loading = ref(true);
const notifications = ref([]);
const pagination = ref({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0
});

const filters = ref({
  search_user: '',
  type: 'Todos',
  date_start: '',
  date_end: ''
});

const loadNotifications = async (page = 1) => {
  loading.value = true;
  try {
    const params = {
      page,
      ...filters.value
    };
    
    const response = await api.get('/notifications/all', { params });
    
    if (response.data && response.data.data) {
      notifications.value = response.data.data;
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        from: response.data.from,
        to: response.data.to,
        total: response.data.total
      };
    } else {
      // Fallback
      notifications.value = Array.isArray(response.data) ? response.data : [];
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    ElMessage.error('Hubo un problema al cargar las notificaciones.');
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  loadNotifications(1);
};

const clearFilters = () => {
  filters.value = {
    search_user: '',
    type: 'Todos',
    date_start: '',
    date_end: ''
  };
  loadNotifications(1);
};

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    loadNotifications(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
.notifications-page {
  padding: 24px;
  max-width: 1024px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.filters-card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  padding: 20px;
  margin-bottom: 24px;
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .filters-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-color);
}

.filter-input-wrapper {
  position: relative;
}

.filter-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.filter-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--main-bg);
  color: var(--text-color);
  transition: box-shadow 0.2s;
  outline: none;
}
.filter-input:focus {
  box-shadow: 0 0 0 2px rgba(21, 197, 38, 0.2);
}

.filter-input.with-icon {
  padding-left: 36px;
}

.filter-actions {
  display: flex;
  gap: 8px;
}
.filter-actions .flex-1 {
  flex: 1;
}

.btn-filter-apply {
  padding: 8px 16px;
  background-color: #15c526;
  color: white;
  border-radius: 8px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-filter-apply:hover {
  background-color: #12a921;
}

.btn-filter-clear {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--text-muted);
  border-radius: 8px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-filter-clear:hover {
  background-color: rgba(0,0,0,0.05);
}
:root.dark-theme .btn-filter-clear:hover {
  background-color: rgba(255,255,255,0.05);
}

.list-card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  overflow: hidden;
}

.empty-state {
  padding: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.spinner-icon {
  color: #15c526;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-icon {
  color: #d1d5db;
}
:root.dark-theme .empty-icon {
  color: #4b5563;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-color);
}

.empty-text {
  color: var(--text-muted);
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notif-item {
  padding: 16px;
  display: flex;
  gap: 16px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
  cursor: pointer;
}
.notif-item:last-child {
  border-bottom: none;
}
.notif-item:hover {
  background-color: rgba(0,0,0,0.02);
}
:root.dark-theme .notif-item:hover {
  background-color: rgba(255,255,255,0.02);
}
.notif-item.is-seen {
  opacity: 0.75;
}

.notif-avatar-wrapper {
  flex-shrink: 0;
  margin-top: 4px;
}

.notif-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.notif-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(21, 197, 38, 0.2);
  color: #15c526;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notif-title {
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 16px;
}

.notif-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.notif-body {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.notif-unread-indicator {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 8px;
}

.unread-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #15c526;
}

.pagination-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-text {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.btn-page {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: transparent;
  color: var(--text-color);
  transition: background-color 0.2s, opacity 0.2s;
}
.btn-page:hover:not(:disabled) {
  background-color: rgba(0,0,0,0.05);
}
:root.dark-theme .btn-page:hover:not(:disabled) {
  background-color: rgba(255,255,255,0.05);
}
.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
