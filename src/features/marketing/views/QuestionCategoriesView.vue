<template>
  <section class="qc-list">
    <!-- Header -->
    <div class="card qc-header-card">
      <div class="qc-header-inner">
        <div>
          <span class="qc-eyebrow">Trivia · Banco de preguntas</span>
          <h4 class="qc-title">Categorías de preguntas</h4>
          <p class="qc-subtitle">Diseña y administra el catálogo completo de categorías y preguntas</p>
        </div>
        <button class="btn-primary" @click="router.push('/marketing/categorias-preguntas/crear')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva categoría
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando categorías...</p>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="error-banner">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ store.error }}
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Search & Filter -->
      <div class="card qc-tools-card">
        <div class="qc-tools-inner">
          <div class="qc-search-group">
            <label class="qc-field-label">Buscar</label>
            <div class="search-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="searchTerm" type="text" class="search-input" placeholder="Buscar por nombre..." />
            </div>
          </div>
          <div class="qc-filter-group">
            <label class="qc-field-label">Estado</label>
            <select v-model="statusFilter" class="form-select">
              <option value="all">Todos</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="card qc-table-card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in filteredCategories" :key="category.id">
                <td class="cell-name">
                  <a href="#" @click.prevent="goToDetail(category)">{{ category.name }}</a>
                </td>
                <td>
                  <div class="qc-status-switch">
                    <button
                      type="button"
                      class="qc-status-opt"
                      :class="{ 'is-active': category.is_active }"
                      :disabled="togglingId === category.id"
                      @click="toggleStatus(category)"
                    >
                      Activo
                    </button>
                    <span class="qc-status-divider">/</span>
                    <button
                      type="button"
                      class="qc-status-opt"
                      :class="{ 'is-active': !category.is_active }"
                      :disabled="togglingId === category.id"
                      @click="toggleStatus(category)"
                    >
                      Inactivo
                    </button>
                  </div>
                </td>
                <td class="text-center">
                  <div class="qc-actions" @click.stop>
                    <button type="button" class="qc-actions-toggle" @click="toggleMenu(category.id)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                    <transition name="dropdown-fade">
                      <div v-if="openMenuId === category.id" class="qc-actions-menu">
                        <button type="button" class="qc-actions-item" @click="handleAction('view', category)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          Ver preguntas
                        </button>
                        <button type="button" class="qc-actions-item" @click="handleAction('add', category)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                          Agregar preguntas
                        </button>
                        <button type="button" class="qc-actions-item" @click="handleAction('edit', category)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Editar categoría
                        </button>
                      </div>
                    </transition>
                  </div>
                </td>
              </tr>
              <!-- Empty row -->
              <tr v-if="filteredCategories.length === 0">
                <td colspan="3" class="text-center">
                  <div class="empty-table">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <p class="empty-text">Sin categorías todavía</p>
                    <button class="btn-secondary" @click="router.push('/marketing/categorias-preguntas/crear')">
                      Crea tu primera categoría
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="qc-mobile-view">
        <div v-if="filteredCategories.length > 0">
          <div v-for="category in filteredCategories" :key="'m-' + category.id" class="card qc-mobile-card">
            <div class="qc-mobile-header">
              <a href="#" @click.prevent="goToDetail(category)" class="qc-mobile-name">{{ category.name }}</a>
              <span class="badge" :class="category.is_active ? 'badge-active' : 'badge-inactive'">
                {{ category.is_active ? 'activo' : 'inactivo' }}
              </span>
            </div>
            <div class="qc-mobile-actions">
              <div class="qc-status-switch">
                <button
                  type="button"
                  class="qc-status-opt"
                  :class="{ 'is-active': category.is_active }"
                  :disabled="togglingId === category.id"
                  @click="toggleStatus(category)"
                >Activo</button>
                <span class="qc-status-divider">/</span>
                <button
                  type="button"
                  class="qc-status-opt"
                  :class="{ 'is-active': !category.is_active }"
                  :disabled="togglingId === category.id"
                  @click="toggleStatus(category)"
                >Inactivo</button>
              </div>
              <div class="qc-actions" @click.stop>
                <button type="button" class="qc-actions-toggle" @click="toggleMenu(category.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
                <transition name="dropdown-fade">
                  <div v-if="openMenuId === category.id" class="qc-actions-menu qc-actions-menu--mobile">
                    <button type="button" class="qc-actions-item" @click="handleAction('view', category)">Ver preguntas</button>
                    <button type="button" class="qc-actions-item" @click="handleAction('add', category)">Agregar preguntas</button>
                    <button type="button" class="qc-actions-item" @click="handleAction('edit', category)">Editar categoría</button>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-table">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p class="empty-text">Sin categorías todavía</p>
          <button class="btn-secondary" @click="router.push('/marketing/categorias-preguntas/crear')">Crea tu primera categoría</button>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionCategoriesStore } from '../stores/questionCategoriesStore'

const router = useRouter()
const store = useQuestionCategoriesStore()

const searchTerm = ref('')
const statusFilter = ref('all')
const openMenuId = ref(null)
const togglingId = ref(null)

const filteredCategories = computed(() => {
  let list = store.categories || []
  if (statusFilter.value === 'active') {
    list = list.filter(c => c.is_active)
  } else if (statusFilter.value === 'inactive') {
    list = list.filter(c => !c.is_active)
  }
  if (searchTerm.value.trim()) {
    const q = searchTerm.value.toLowerCase().trim()
    list = list.filter(c => (c.name || '').toLowerCase().includes(q))
  }
  return list
})

function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function handleAction(action, category) {
  if (action === 'view') {
    router.push(`/marketing/categorias-preguntas/${category.id}`)
  } else if (action === 'add') {
    router.push(`/marketing/categorias-preguntas/${category.id}/preguntas/crear`)
  } else if (action === 'edit') {
    router.push(`/marketing/categorias-preguntas/${category.id}/editar`)
  }
  openMenuId.value = null
}

function goToDetail(category) {
  router.push(`/marketing/categorias-preguntas/${category.id}`)
}

async function toggleStatus(category) {
  togglingId.value = category.id
  try {
    await store.toggleCategoryStatus(category.id)
  } catch (err) {
    console.error('Error toggling status:', err)
  } finally {
    togglingId.value = null
  }
}

function handleOutsideClick(event) {
  if (openMenuId.value !== null) {
    const menus = document.querySelectorAll('.qc-actions-menu, .qc-actions-toggle')
    let clickedInside = false
    menus.forEach(el => {
      if (el.contains(event.target)) clickedInside = true
    })
    if (!clickedInside) openMenuId.value = null
  }
}

onMounted(() => {
  store.fetchCategories()
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.qc-list {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── Header Card ─── */
.qc-header-card {
  margin-bottom: 16px;
}
.qc-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}
.qc-eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  display: block;
  margin-bottom: 4px;
}
.qc-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-bold);
  margin: 0 0 2px 0;
}
.qc-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

/* ─── Buttons ─── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 214, 0, 0.25);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(24, 214, 0, 0.04);
}

/* ─── Loading ─── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  gap: 12px;
  color: var(--text-muted);
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Error ─── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: var(--danger-color);
  font-size: 13px;
  font-weight: 500;
}

/* ─── Tools Card ─── */
.qc-tools-card {
  margin-bottom: 16px;
}
.qc-tools-inner {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.qc-search-group,
.qc-filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 200px;
}
.qc-field-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-light);
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 9px 12px 9px 38px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  background: var(--card-bg);
  color: var(--text-main);
  transition: border-color 0.2s;
}
.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08);
}
.form-select {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  background: var(--card-bg);
  color: var(--text-main);
  cursor: pointer;
  transition: border-color 0.2s;
}
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* ─── Table ─── */
.qc-table-card {
  overflow: hidden;
}
.table-responsive {
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.table thead {
  background: var(--bg-main);
}
.table th {
  padding: 12px 16px;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}
.table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
  color: var(--text-main);
}
.table tbody tr:last-child td {
  border-bottom: none;
}
.table tbody tr:hover {
  background: rgba(24, 214, 0, 0.03);
}
.cell-name a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}
.cell-name a:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* ─── Status Switch ─── */
.qc-status-switch {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.qc-status-opt {
  background: transparent;
  border: none;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
}
.qc-status-opt.is-active {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 2px 6px rgba(24, 214, 0, 0.25);
}
.qc-status-opt:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.qc-status-divider {
  color: var(--text-light);
  font-size: 0.8rem;
}

/* ─── Actions Dropdown ─── */
.qc-actions {
  position: relative;
  display: inline-block;
}
.qc-actions-toggle {
  background: transparent;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  transition: all 0.2s;
}
.qc-actions-toggle:hover {
  background: var(--bg-main);
  color: var(--text-bold);
}
.qc-actions-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  padding: 6px;
  min-width: 210px;
  z-index: 300;
  backdrop-filter: blur(16px);
}
.qc-actions-menu--mobile {
  left: 0;
  right: auto;
}
.qc-actions-item {
  width: 100%;
  background: transparent;
  border: none;
  text-align: left;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-main);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
}
.qc-actions-item:hover {
  background: var(--bg-main);
  color: var(--primary-color);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.15s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ─── Empty Table ─── */
.text-center { text-align: center; }
.empty-table {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  gap: 8px;
}
.empty-icon {
  opacity: 0.3;
  color: var(--text-muted);
}
.empty-text {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

/* ─── Mobile Cards ─── */
.qc-mobile-view {
  display: none;
}
.qc-mobile-card {
  margin-bottom: 10px;
}
.qc-mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.qc-mobile-name {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
}
.qc-mobile-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}
.badge-active {
  background: rgba(24, 214, 0, 0.12);
  color: #166534;
}
.badge-inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #991b1b;
}
body.dark-theme .badge-active {
  background: rgba(24, 214, 0, 0.2);
  color: #4ade80;
}
body.dark-theme .badge-inactive {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* Responsive */
@media (max-width: 768px) {
  .table-responsive {
    display: none;
  }
  .qc-mobile-view {
    display: block;
  }
  .qc-header-inner {
    flex-direction: column;
  }
  .qc-tools-inner {
    flex-direction: column;
  }
}
</style>
