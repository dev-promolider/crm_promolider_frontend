<template>
  <div class="dinamica-view">
    <div class="card">
      <div class="card-body">
        <div class="card-header">
          <div>
            <h4 class="card-title">Dinámicas</h4>
            <span class="card-meta">Crea y gestiona ruletas y trivias interactivas</span>
          </div>
          <router-link to="/marketing/herramientas" class="nav-back">
            <ArrowLeft :size="15" /> Volver
          </router-link>
        </div>

        <div class="type-selector">
          <div class="dinamica-type-card" @click="createAndRedirect('ruleta')">
            <div class="type-icon"><Shuffle :size="40" /></div>
            <h5>Ruleta Interactiva</h5>
            <p>Crea una ruleta de premios para tus usuarios.</p>
          </div>
          <div class="dinamica-type-card" @click="createAndRedirect('trivia')">
            <div class="type-icon"><HelpCircle :size="40" /></div>
            <h5>Trivia interactiva</h5>
            <p>Crea preguntas y respuestas para evaluar el conocimiento de tus usuarios.</p>
          </div>
        </div>
        <div class="dinamicas-table-section mt-4">
          <h5 class="section-subtitle">
            <ListFilter :size="18" /> Últimas dinámicas
            <small class="text-muted">Listado paginado (10 por página)</small>
          </h5>
          <div v-if="loadingDinamicas" class="loading-state">
            <Loader2 class="spinner" :size="24" />
            <span>Cargando dinámicas...</span>
          </div>
          <div v-else-if="dinamicas.length === 0" class="empty-state">
            Aún no has creado dinámicas.
          </div>
          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Premio</th>
                    <th>Activación</th>
                    <th class="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(d, idx) in paginatedDinamicas" :key="d.id">
                    <td class="cell-name">{{ d.nombre || d.title || '-' }}</td>
                    <td>
                      <span class="badge" :class="d.tipo_dinamica === 'trivia' ? 'badge-info' : 'badge-secondary'">
                        {{ d.tipo_dinamica === 'trivia' ? 'Trivia' : 'Ruleta' }}
                      </span>
                    </td>
                    <td>{{ d.tipo_premio || '-' }}</td>
                    <td>
                      <span class="badge" :class="activacionClass(d)">{{ activacionLabel(d) }}</span>
                    </td>
                    <td class="text-right">
                      <div class="btn-group dropdown">
                        <button type="button" class="btn btn-sm btn-light dropdown-toggle font-weight-bold border-0" @click.stop="toggleDropdown(d.id)">...</button>
                        <div class="dropdown-menu dropdown-menu-right" :class="{ show: openDropdownId === d.id }">
                          <router-link :to="configurarRoute(d)" class="dropdown-item">Editar</router-link>
                          <a v-if="d.slug" class="dropdown-item" :href="getPublicUrl(d.slug)" target="_blank">Ver enlace público</a>
                          <a v-if="d.slug" class="dropdown-item" href="#" @click.prevent="copiarEnlacePublico(getPublicUrl(d.slug))">Compartir enlace</a>
                          <div v-if="d.slug" class="dropdown-divider"></div>
                          <button class="dropdown-item" @click.stop="toggleStatusDinamica(d)">{{ activacionLabel(d) === 'Activa' ? 'Desactivar' : 'Activar' }}</button>
                          <div class="dropdown-divider"></div>
                          <button class="dropdown-item text-danger" @click.stop="confirmDeleteDinamica(d)">Eliminar</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="table-footer">
              <small class="text-muted">Mostrando {{ filteredDinamicas.length }} dinámicas</small>
              <nav>
                <ul class="pagination-custom">
                  <li :class="{ disabled: currentPage <= 1 }"><a href="#" @click.prevent="currentPage > 1 && currentPage--">&laquo;</a></li>
                  <li v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }"><a href="#" @click.prevent="currentPage = page">{{ page }}</a></li>
                  <li :class="{ disabled: currentPage >= totalPages }"><a href="#" @click.prevent="currentPage < totalPages && currentPage++">&raquo;</a></li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDinamicas } from '../services/marketingService'
import apiClient from '@/services/apiClient'
import {
  ArrowLeft, Shuffle, HelpCircle, AlertCircle, Loader2,
  ListFilter
} from 'lucide-vue-next'

const router = useRouter()

const openDropdownId = ref(null)

function handleClickOutside(e) {
  if (!e.target.closest('.btn-group.dropdown')) {
    openDropdownId.value = null
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

function toggleDropdown(id) {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

function getPublicUrl(slug) {
  return window.location.origin + "/d/" + slug
}

function copiarEnlacePublico(url) {
  if (!url) return
  const input = document.createElement('input')
  input.value = url
  document.body.appendChild(input)
  input.select()
  input.setSelectionRange(0, 99999)
  try {
    document.execCommand('copy')
    alert('Enlace copiado al portapapeles')
  } catch (e) {
    // fallback
  }
  document.body.removeChild(input)
}

function createAndRedirect(tipo) {
  const route = tipo === 'ruleta'
    ? '/marketing/dinamica/new/specifications'
    : '/marketing/dinamica/new/trivia'
  router.push(route)
}

const dinamicas = ref([])
const loadingDinamicas = ref(false)
const currentPage = ref(1)
const perPage = 10

const filteredDinamicas = computed(() => {
  return [...dinamicas.value]
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredDinamicas.value.length / perPage)))

const paginatedDinamicas = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredDinamicas.value.slice(start, start + perPage)
})

function configurarRoute(d) {
  const type = d.tipo_dinamica || ''
  if (type === 'ruleta') return '/marketing/dinamica/' + d.id + '/specifications'
  return '/marketing/dinamica/' + d.id + '/trivia'
}

async function toggleStatusDinamica(d) {
  var msg = activacionLabel(d) === 'Activa' ? 'Desactivar' : 'Activar'
  if (!confirm(msg + ' la dinámica ' + (d.nombre || d.title || '') + '?')) return
  try {
    await apiClient.post('/marketing/dinamicas/' + d.id + '/toggle-status')
    openDropdownId.value = null
    await loadDinamicas()
  } catch (error) {
    console.error('Error toggling status:', error)
  }
}

async function confirmDeleteDinamica(d) {
  if (!confirm('Eliminar la dinámica ' + (d.nombre || d.title || '') + '? Esta accion no se puede deshacer.')) return
  try {
    await apiClient.delete('/marketing/dinamicas/' + d.id)
    openDropdownId.value = null
    await loadDinamicas()
  } catch (error) {
    console.error('Error deleting dinamica:', error)
  }
}

function activacionClass(d) {
  if (d.has_winner) return 'badge-primary'
  if (d.is_active) return 'badge-success'
  return 'badge-warning'
}

function activacionLabel(d) {
  if (d.has_winner) return 'Finalizada'
  if (d.is_active) return 'Activa'
  return 'Pendiente'
}

async function loadDinamicas() {
  loadingDinamicas.value = true
  try {
    var res = await getDinamicas()
    var data = res?.data || res || []
    dinamicas.value = Array.isArray(data) ? data : []
  } catch (err) {
    dinamicas.value = []
  } finally {
    loadingDinamicas.value = false
  }
}

onMounted(async () => {
  await loadDinamicas()
})
</script>

<style scoped>
.dinamica-view { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.card-meta { font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px; }
.nav-back {
  display: inline-flex; align-items: center; gap: 5px;
  background: transparent; border: 1px solid var(--border-color);
  padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
  color: var(--text-muted); text-decoration: none; transition: all 0.2s;
}
.nav-back:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(24,214,0,0.04); }
.type-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 640px) { .type-selector { grid-template-columns: 1fr; } }
.dinamica-type-card {
  background: var(--card-bg); border: 2px solid var(--border-color);
  border-radius: 12px; padding: 32px 24px; text-align: center;
  cursor: pointer; transition: all 0.25s ease;
}
.dinamica-type-card:hover {
  border-color: var(--primary-color); transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(24,214,0,0.1);
}
.type-icon { color: var(--primary-color); margin-bottom: 12px; }
.dinamica-type-card h5 { font-size: 16px; font-weight: 700; color: var(--text-bold); margin: 0 0 8px 0; }
.dinamica-type-card p { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin: 0; }
.section-subtitle { font-size: 15px; font-weight: 700; color: var(--text-bold); margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.section-subtitle small { font-size: 12px; font-weight: 400; margin-left: 4px; }
.error-banner {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 16px; background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2); border-radius: 8px;
  color: var(--danger-color); font-size: 13px; margin-bottom: 14px;
}
.error-banner ul { margin: 0; padding-left: 16px; }
.dinamicas-table-section { border-top: 1px solid var(--border-color); padding-top: 20px; }
.loading-state { display: flex; align-items: center; gap: 10px; padding: 20px; color: var(--text-muted); font-size: 13px; }
.spinner { animation: spin 1s linear infinite; color: var(--primary-color); }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state {
  padding: 24px;
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}
.table-responsive { border-radius: 8px; overflow: visible; border: 1px solid var(--border-color); }
.table { width: 100%; border-collapse: collapse; background: var(--card-bg); }
.table thead.thead-light { background: #f8f9fa; }
.table th {
  padding: 10px 12px; font-size: 0.78rem; font-weight: 700;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px;
  border-bottom: 2px solid var(--border-color); white-space: nowrap;
}
.table td {
  padding: 10px 12px; font-size: 0.85rem; color: var(--text-main);
  border-bottom: 1px solid var(--border-color); vertical-align: middle;
}
.table tbody tr:last-child td { border-bottom: none; }
.table-hover tbody tr:hover { background: rgba(0,0,0,0.03) !important; }
.text-right { text-align: right; }
.text-muted { color: #6c757d; }
.cell-name { font-weight: 600; }
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  text-transform: uppercase;
}
.badge-secondary { background: #e9ecef; color: #6c757d; }
.badge-info { background: #d1ecf1; color: #0c5460; }
.badge-success { background: #d4edda; color: #155724; }
.badge-primary { background: #cce5ff; color: #004085; }
.badge-warning { background: #fff3cd; color: #856404; }
.btn-group.dropdown { position: relative; display: inline-block; }
.btn.btn-sm.btn-light {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  cursor: pointer;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: #f8f9fa;
  color: var(--text-main);
  transition: all 0.2s;
}
.btn.btn-sm.btn-light:hover {
  background: #e9ecef;
  border-color: var(--primary-color);
}
.dropdown-menu {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 1000;
  min-width: 200px;
  padding: 8px 0;
  margin: 4px 0 0;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.dropdown-menu.show { display: block; }
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  color: #333;
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  transition: background 0.15s;
}
.dropdown-item:hover { background: #f8f9fa; color: var(--primary-color); }
.dropdown-item.text-danger:hover { background: #fff5f5; color: #dc3545 !important; }
.dropdown-divider {
  height: 0;
  margin: 8px 0;
  overflow: hidden;
  border-top: 1px solid var(--border-color);
}
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.table-footer small { color: var(--text-muted); font-size: 12px; }
.pagination-custom {
  display: flex;
  gap: 4px;
  list-style: none;
  padding: 0;
  margin: 0;
}
.pagination-custom li a {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-main);
  text-decoration: none;
  transition: all 0.2s;
  background: var(--card-bg);
}
.pagination-custom li a:hover { border-color: var(--primary-color); color: var(--primary-color); }
.pagination-custom li.active a { background: var(--primary-color); border-color: var(--primary-color); color: white; font-weight: 700; }
.pagination-custom li.disabled a { opacity: 0.4; cursor: not-allowed; pointer-events: none; }
</style>
