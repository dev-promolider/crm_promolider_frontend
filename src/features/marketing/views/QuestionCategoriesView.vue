<template>
  <section class="qc-list">
    <!-- Header -->
    <header class="qc-list__header card">
      <div class="card-body d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
        <div class="mb-2 mb-lg-0">
          <p class="qc-eyebrow mb-1">Trivia · Banco de preguntas</p>
          <h4 class="mb-1">Categorías de preguntas</h4>
          <p class="text-muted mb-0">Diseña y administra el catálogo completo.</p>
        </div>
        <button type="button" class="btn btn-primary" @click="router.push('/marketing/categorias-preguntas/crear')">
          + Nueva categoría
        </button>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="store.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="text-muted mt-2">Cargando categorías...</p>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="alert alert-danger">
      {{ store.error }}
    </div>

    <!-- Data -->
    <template v-else>
      <!-- Tools: Search + Filter -->
      <div class="card qc-list__tools">
        <div class="card-body">
          <div class="form-row">
            <div class="form-group col-md-8 mb-1 mb-md-0">
              <label class="font-weight-semibold">Buscar</label>
              <input
                v-model="searchTerm"
                type="text"
                class="form-control"
                placeholder="Buscar por nombre..."
              />
            </div>
            <div class="form-group col-md-4">
              <label class="font-weight-semibold">Estado</label>
              <select v-model="statusFilter" class="form-control">
                <option value="all">Todos</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="card qc-table">
        <div class="table-responsive d-none d-md-block">
          <table class="table table-hover align-middle mb-0">
            <thead class="thead-light">
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in filteredCategories" :key="category.id">
                <td class="font-weight-semibold">
                  <a href="#" @click.prevent="goToDetail(category)">{{ category.name }}</a>
                </td>
                <td>
                  <div class="qc-status__switch">
                    <button
                      type="button"
                      class="qc-status__option"
                      :class="{ 'is-selected': category.is_active }"
                      :disabled="togglingId === category.id"
                      @click="toggleStatus(category)"
                    >
                      Activo
                    </button>
                    <span class="qc-status__divider">/</span>
                    <button
                      type="button"
                      class="qc-status__option"
                      :class="{ 'is-selected': !category.is_active }"
                      :disabled="togglingId === category.id"
                      @click="toggleStatus(category)"
                    >
                      Inactivo
                    </button>
                  </div>
                </td>
                <td class="text-center position-relative">
                  <div class="qc-actions" @click.stop>
                    <button type="button" class="qc-actions__toggle" @click="toggleMenu(category.id)">
                      ⠇
                    </button>
                    <div v-if="openMenuId === category.id" class="qc-actions__menu">
                      <button type="button" class="qc-actions__item" @click="handleAction('view', category)">
                        Ver preguntas
                      </button>
                      <button type="button" class="qc-actions__item" @click="handleAction('add', category)">
                        Agregar preguntas
                      </button>
                      <button type="button" class="qc-actions__item" @click="handleAction('edit', category)">
                        Editar categoría
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredCategories.length === 0">
                <td colspan="3" class="text-center text-muted py-4">
                  <div class="mb-2 font-weight-semibold">Sin categorías todavía</div>
                  <button type="button" class="btn btn-outline-primary" @click="router.push('/marketing/categorias-preguntas/crear')">
                    Crea tu primera categoría
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="d-md-none p-2">
          <div v-if="filteredCategories.length > 0">
            <div v-for="category in filteredCategories" :key="'m-' + category.id" class="qc-card mb-2 p-3 border rounded">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <a href="#" @click.prevent="goToDetail(category)" class="font-weight-bold">{{ category.name }}</a>
                <span class="badge" :class="category.is_active ? 'badge-success' : 'badge-secondary'">
                  {{ category.is_active ? 'activo' : 'inactivo' }}
                </span>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-2">
                <div class="qc-status__switch">
                  <button
                    type="button"
                    class="qc-status__option"
                    :class="{ 'is-selected': category.is_active }"
                    :disabled="togglingId === category.id"
                    @click="toggleStatus(category)"
                  >
                    Activo
                  </button>
                  <span class="qc-status__divider">/</span>
                  <button
                    type="button"
                    class="qc-status__option"
                    :class="{ 'is-selected': !category.is_active }"
                    :disabled="togglingId === category.id"
                    @click="toggleStatus(category)"
                  >
                    Inactivo
                  </button>
                </div>
                <div class="qc-actions" @click.stop>
                  <button type="button" class="qc-actions__toggle" @click="toggleMenu(category.id)">
                    ⋯
                  </button>
                  <div v-if="openMenuId === category.id" class="qc-actions__menu qc-actions__menu--mobile">
                    <button type="button" class="qc-actions__item" @click="handleAction('view', category)">
                      Ver preguntas
                    </button>
                    <button type="button" class="qc-actions__item" @click="handleAction('add', category)">
                      Agregar preguntas
                    </button>
                    <button type="button" class="qc-actions__item" @click="handleAction('edit', category)">
                      Editar categoría
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-muted py-4">
            <p class="font-weight-semibold mb-1">Sin categorías todavía</p>
            <button type="button" class="btn btn-outline-primary" @click="router.push('/marketing/categorias-preguntas/crear')">
              Crea tu primera categoría
            </button>
          </div>
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
  // Filter by status
  if (statusFilter.value === 'active') {
    list = list.filter(c => c.is_active)
  } else if (statusFilter.value === 'inactive') {
    list = list.filter(c => !c.is_active)
  }
  // Filter by search
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
    const target = event.target
    const menus = document.querySelectorAll('.qc-actions__menu, .qc-actions__toggle')
    let clickedInside = false
    menus.forEach(el => {
      if (el.contains(target)) clickedInside = true
    })
    if (!clickedInside) {
      openMenuId.value = null
    }
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
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.qc-eyebrow {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.7rem;
  color: var(--text-muted, #6c757d);
}
.qc-list__header .btn {
  min-width: 190px;
}
.qc-list__tools label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
  color: var(--text-bold, #2c3e50);
}
.qc-card {
  background-color: #fff;
}

.qc-status__switch {
  display: inline-flex;
  align-items: center;
}
.qc-status__option {
  background: transparent;
  border: none;
  padding: 0.1rem 0.4rem;
  border-radius: 12px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #7b7d88;
  transition: background-color 0.2s ease, color 0.2s ease;
  cursor: pointer;
}
.qc-status__option.is-selected {
  background-color: #28c76f;
  color: #fff;
  font-weight: 600;
}
.qc-status__option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.qc-status__option:focus {
  outline: none;
}
.qc-status__divider {
  margin: 0 0.25rem;
  color: #b7bbc7;
}

.qc-actions {
  position: relative;
  display: inline-block;
}
.qc-actions__toggle {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0 8px;
  color: #6e6b7b;
  cursor: pointer;
  letter-spacing: 2px;
}
.qc-actions__toggle:focus {
  outline: none;
}
.qc-actions__menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: #fff;
  border-radius: 0.4rem;
  box-shadow: 0 6px 18px rgba(47, 53, 66, 0.15);
  padding: 0.4rem 0;
  min-width: 200px;
  z-index: 300;
}
.qc-actions__menu--mobile {
  position: absolute;
  left: 0;
  top: 100%;
  margin-top: 0.25rem;
  box-shadow: 0 6px 18px rgba(47, 53, 66, 0.15);
  border: 1px solid #eef1f6;
  min-width: 200px;
  z-index: 200;
}
.qc-actions__item {
  width: 100%;
  background: transparent;
  border: none;
  text-align: left;
  padding: 0.4rem 1rem;
  font-size: 0.9rem;
  color: #4a4f5c;
  cursor: pointer;
}
.qc-actions__item:hover {
  background-color: #f5f7fb;
}
.qc-actions__item:focus {
  outline: none;
}

/* Bootstrap-like overrides for scoped context */
.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  background: #fff;
}
.card-body {
  padding: 1.25rem;
}
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.form-group {
  margin-bottom: 0;
}
.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
}
.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0,123,255,0.15);
}
.col-md-8 { flex: 0 0 calc(66.666% - 8px); }
.col-md-4 { flex: 0 0 calc(33.333% - 8px); }
@media (max-width: 768px) {
  .col-md-8, .col-md-4 { flex: 0 0 100%; }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.btn-primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}
.btn-primary:hover { background: #0069d9; }
.btn-outline-primary {
  background: transparent;
  color: #007bff;
  border-color: #007bff;
}
.btn-outline-primary:hover { background: #007bff; color: white; }

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.table th {
  padding: 12px;
  font-weight: 700;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #6c757d;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}
.table td {
  padding: 12px;
  border-bottom: 1px solid #eef1f4;
  vertical-align: middle;
}
.table tbody tr:hover { background: rgba(0,123,255,0.03); }
.table a {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
}
.table a:hover { text-decoration: underline; }

.text-center { text-align: center; }
.text-muted { color: #6c757d; }
.py-4 { padding-top: 24px; padding-bottom: 24px; }
.py-5 { padding-top: 48px; padding-bottom: 48px; }
.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mt-2 { margin-top: 8px; }
.p-2 { padding: 8px; }
.p-3 { padding: 16px; }
.border { border: 1px solid #e0e0e0; }
.rounded { border-radius: 6px; }
.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}
.alert-danger {
  background: #fde8e8;
  border: 1px solid #fecaca;
  color: #b91c1c;
}
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.badge-success {
  background: #d4edda;
  color: #155724;
}
.badge-secondary {
  background: #e2e3e5;
  color: #383d41;
}
.spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}
@keyframes spinner-border {
  to { transform: rotate(360deg); }
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}
.font-weight-semibold { font-weight: 600; }
.font-weight-bold { font-weight: 700; }
.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.align-items-center { align-items: center; }
.flex-column { flex-direction: column; }
.flex-lg-row { flex-direction: row; }
@media (max-width: 992px) { .flex-lg-row { flex-direction: column; } }
.d-none { display: none; }
.d-md-block { display: block; }
.d-md-none { display: none; }
@media (max-width: 768px) {
  .d-md-block { display: none; }
  .d-md-none { display: block; }
}
.position-relative { position: relative; }
.table td.text-center.position-relative {
  overflow: visible;
}
</style>
