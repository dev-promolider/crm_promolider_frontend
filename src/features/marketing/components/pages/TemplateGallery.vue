<template>
  <div class="template-gallery">
    <div class="card-header">
      <div>
        <h4 class="card-title">Galería de plantillas</h4>
        <span class="card-meta">Selecciona una plantilla para personalizarla o crea tu página desde cero</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="gallery-tabs">
      <button class="stats-tab-btn" :class="{ active: currentTab === 'base' }" @click="currentTab = 'base'">
        <Layout :size="15" /> Plantillas base
      </button>
      <button class="stats-tab-btn" :class="{ active: currentTab === 'my' }" @click="currentTab = 'my'">
        <FileText :size="15" /> Mis páginas
        <span v-if="myTemplates.length > 0" class="badge-count">{{ myTemplates.length }}</span>
      </button>
    </div>

    <!-- ===== BASE TEMPLATES ===== -->
    <div v-if="currentTab === 'base'">
      <div v-if="loading" class="loading-state"><Loader2 class="spinner" :size="28" /><p>Cargando...</p></div>
      <div v-else-if="templates.length === 0" class="empty-state">
        <Layout :size="36" class="empty-icon" />
        <p>No hay plantillas base disponibles</p>
      </div>
      <div v-else class="template-grid">
        <div
          v-for="tmpl in templates"
          :key="tmpl.id"
          class="template-card"
          @click="openEditor(tmpl)"
        >
          <div class="template-preview">
            <img
              v-if="tmpl.thumbnail"
              :src="tmpl.thumbnail"
              :alt="tmpl.name"
              class="template-thumb-img"
            />
            <FileText v-else :size="36" class="template-icon" />
          </div>
          <div class="template-info">
            <h6 class="template-name">{{ tmpl.title || tmpl.name }}</h6>
            <span class="template-desc">{{ tmpl.description || 'Plantilla personalizable' }}</span>
          </div>
          <div class="template-actions-overlay">
            <button class="action-btn primary" @click.stop="openEditor(tmpl)">
              <Edit3 :size="14" /> Personalizar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MY PAGES ===== -->
    <div v-if="currentTab === 'my'">
      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filters-left">
          <select v-model="filterStatus" class="filter-select">
            <option value="all">Todas</option>
            <option value="published">Publicadas</option>
            <option value="draft">Borradores</option>
          </select>
          <select v-model="sortBy" class="filter-select">
            <option value="updated_at">Más recientes</option>
            <option value="created_at">Más antiguas</option>
            <option value="title">A-Z</option>
          </select>
        </div>
        <button v-if="templates.length > 0" class="btn-create" @click="openEditor(null)">
          <Plus :size="14" /> Crear desde plantilla
        </button>
      </div>

      <div v-if="loading" class="loading-state"><Loader2 class="spinner" :size="28" /><p>Cargando...</p></div>
      <div v-else-if="filteredTemplates.length === 0" class="empty-state">
        <FileText :size="36" class="empty-icon" />
        <p v-if="filterStatus !== 'all'">No hay {{ filterStatus === 'published' ? 'páginas publicadas' : 'borradores' }}</p>
        <p v-else>No tienes páginas creadas aún</p>
        <button v-if="templates.length > 0" class="btn-primary-sm" @click="openEditor(null)">
          Crear tu primera página
        </button>
      </div>
      <div v-else class="template-grid">
        <div
          v-for="tmpl in filteredTemplates"
          :key="tmpl.id"
          class="template-card my-card"
        >
          <div class="template-preview">
            <span
              class="badge-status"
              :class="tmpl.status === 'published' || tmpl.status === 1 ? 'badge-green' : 'badge-gray'"
            >
              {{ tmpl.status === 'published' || tmpl.status === 1 ? 'Publicado' : 'Borrador' }}
            </span>
            <span class="template-type-badge">{{ tmpl.type || 'Página' }}</span>
          </div>
          <div class="template-info">
            <h6 class="template-name">{{ tmpl.title }}</h6>
            <span class="template-desc">Actualizado {{ formatDate(tmpl.updated_at) }}</span>
            <!-- Public URL link -->
            <a
              v-if="tmpl.status === 'published' && tmpl.slug"
              :href="getPublicUrl(tmpl.slug)"
              target="_blank"
              class="public-link"
              @click.stop
            >
              <ExternalLink :size="12" /> Ver página pública
            </a>
          </div>
          <div class="template-actions">
            <button class="action-btn" @click.stop="openEditor(tmpl, true)" title="Editar">
              <Edit3 :size="14" /> Editar
            </button>
            <button
              v-if="tmpl.status !== 'published' && tmpl.status !== 1"
              class="action-btn publish"
              @click.stop="handlePublish(tmpl)"
              :disabled="store.isSaving"
              title="Publicar"
            >
              <Globe :size="14" /> Publicar
            </button>
            <button
              v-if="tmpl.status === 'published' || tmpl.status === 1"
              class="action-btn unpublish"
              @click.stop="handleUnpublish(tmpl)"
              :disabled="store.isSaving"
              title="Despublicar"
            >
              <EyeOff :size="14" /> Despublicar
            </button>
            <button class="action-btn danger" @click.stop="confirmDelete(tmpl)" title="Eliminar">
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal-content small">
        <h4>¿Eliminar página?</h4>
        <p>Estás a punto de eliminar <strong>{{ deleteTarget.title }}</strong>. Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="deleteTarget = null">Cancelar</button>
          <button class="btn-danger" @click="handleDelete" :disabled="store.isSaving">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePageBuilderStore } from '@/features/marketing/stores/pageBuilderStore'
import {
  Layout, FileText, Loader2, Edit3, Plus, Globe, EyeOff,
  Trash2, ExternalLink
} from 'lucide-vue-next'

const props = defineProps({ user: { type: Object, default: null } })
const store = usePageBuilderStore()
const router = useRouter()

const currentTab = ref('base')
const loading = ref(false)
const templates = ref([])
const myTemplates = ref([])
const filterStatus = ref('all')
const sortBy = ref('updated_at')
const deleteTarget = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    await store.fetchTemplates()
    templates.value = store.templates
    if (props.user?.id) {
      await store.fetchUserPages(props.user.id)
      myTemplates.value = store.userPages
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})

const filteredTemplates = computed(() => {
  let filtered = [...myTemplates.value]

  if (filterStatus.value === 'published') {
    filtered = filtered.filter(t => t.status === 'published' || t.status === 1)
  } else if (filterStatus.value === 'draft') {
    filtered = filtered.filter(t => t.status !== 'published' && t.status !== 1)
  }

  switch (sortBy.value) {
    case 'title':
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      break
    case 'created_at':
      filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      break
    case 'updated_at':
    default:
      filtered.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
      break
  }

  return filtered
})

function openEditor(template, isEdit = false) {
  if (!template) {
    // Si no hay template específico, ir a galería de base templates
    router.push({ name: 'marketing-pages' })
    return
  }
  if (isEdit) {
    router.push({
      name: 'marketing-pages-editor',
      query: { edit: template.id, userId: props.user?.id }
    })
  } else {
    router.push({
      name: 'marketing-pages-editor',
      query: { template: template.id, userId: props.user?.id }
    })
  }
}

function getPublicUrl(slug) {
  // Use the same API URL base as apiClient to ensure correct origin
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
  const origin = new URL(apiUrl).origin
  return `${origin}/api/v1/pages/public/${slug}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((now - d) / (1000 * 60 * 60 * 24))
  if (diff === 1) return 'ayer'
  if (diff < 7) return `hace ${diff} días`
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

async function handlePublish(tmpl) {
  try {
    await store.publishPage(tmpl.id)
    await store.fetchUserPages(props.user?.id)
    myTemplates.value = store.userPages
  } catch (e) {
    console.error('Error publishing:', e)
  }
}

async function handleUnpublish(tmpl) {
  try {
    await store.unpublishPage(tmpl.id)
    await store.fetchUserPages(props.user?.id)
    myTemplates.value = store.userPages
  } catch (e) {
    console.error('Error unpublishing:', e)
  }
}

function confirmDelete(tmpl) {
  deleteTarget.value = tmpl
}

async function handleDelete() {
  if (!deleteTarget.value) return
  try {
    await store.deletePage(deleteTarget.value.id)
    await store.fetchUserPages(props.user?.id)
    myTemplates.value = store.userPages
    deleteTarget.value = null
  } catch (e) {
    console.error('Error deleting:', e)
  }
}
</script>

<style scoped>
/* ── Existing styles ── */
.card-header { margin-bottom: 16px; }
.card-meta { font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px; }
.gallery-tabs { display: flex; gap: 6px; margin-bottom: 20px; }
.stats-tab-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent; border: 1px solid var(--border-color);
  padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.stats-tab-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(24,214,0,0.04); }
.stats-tab-btn.active { background: var(--primary-color); color: white; border-color: var(--primary-color); box-shadow: 0 4px 10px rgba(24,214,0,0.25); }
.badge-count {
  background: rgba(255,255,255,0.2); padding: 1px 7px;
  border-radius: 10px; font-size: 11px; font-weight: 700;
}

/* Loading / Empty */
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 8px; color: var(--text-muted); font-size: 13px; }
.spinner { animation: spin 1s linear infinite; color: var(--primary-color); }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px; color: var(--text-muted); gap: 8px; }
.empty-icon { opacity: 0.4; }
.btn-primary-sm {
  margin-top: 8px; background: var(--primary-color); color: white; border: none;
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 700;
  cursor: pointer; transition: opacity 0.2s;
}
.btn-primary-sm:hover { opacity: 0.9; }

/* Filters */
.filters-bar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; gap: 12px; flex-wrap: wrap;
}
.filters-left { display: flex; gap: 8px; }
.filter-select {
  padding: 6px 10px; border: 1px solid var(--border-color);
  border-radius: 6px; font-size: 12px; color: var(--text-muted);
  background: var(--card-bg); cursor: pointer;
  outline: none; transition: border-color 0.2s;
}
.filter-select:focus { border-color: var(--primary-color); }
.btn-create {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--primary-color); color: white; border: none;
  padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 700;
  cursor: pointer; transition: opacity 0.2s;
}
.btn-create:hover { opacity: 0.9; }

/* Template Grid */
.template-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.template-card {
  background: var(--card-bg); border: 1px solid var(--border-color);
  border-radius: 10px; overflow: hidden; cursor: pointer;
  transition: all 0.25s ease; position: relative;
}
.template-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); border-color: rgba(24,214,0,0.2); }
.template-card.my-card { cursor: default; }
.template-preview {
  height: 120px; display: flex; align-items: center; justify-content: center;
  background: var(--bg-main); position: relative;
}
.template-thumb-img { width: 100%; height: 100%; object-fit: cover; }
.template-icon { color: var(--text-light); }

.badge-status {
  position: absolute; top: 10px; right: 10px;
  padding: 3px 8px; border-radius: 20px; font-size: 0.7rem; font-weight: 700;
}
.badge-green { background: rgba(24, 214, 0, 0.12); color: #166534; }
.badge-gray { background: rgba(148, 163, 184, 0.15); color: #64748b; }
.template-type-badge {
  position: absolute; bottom: 10px; left: 10px;
  padding: 2px 7px; border-radius: 4px; font-size: 0.65rem;
  background: rgba(0,0,0,0.06); color: var(--text-muted);
}

.template-actions-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.3); opacity: 0;
  transition: opacity 0.2s;
}
.template-card:hover .template-actions-overlay { opacity: 1; }
.action-btn.primary {
  background: white; color: #1e293b; border: none;
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 6px; cursor: pointer;
  transition: all 0.2s;
}
.action-btn.primary:hover { transform: scale(1.05); }

.template-info { padding: 14px; }
.template-name { font-size: 14px; font-weight: 700; color: var(--text-bold); margin: 0 0 4px 0; }
.template-desc { font-size: 12px; color: var(--text-muted); display: block; }

.public-link {
  display: inline-flex; align-items: center; gap: 4px;
  margin-top: 6px; font-size: 11px; color: #2563eb;
  text-decoration: none; font-weight: 600;
}
.public-link:hover { text-decoration: underline; }

/* Template Actions */
.template-actions {
  display: flex; gap: 4px; padding: 8px 14px 12px;
  border-top: 1px solid var(--border-color);
}
.action-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: transparent; border: 1px solid var(--border-color);
  padding: 5px 9px; border-radius: 6px; font-size: 11px; font-weight: 600;
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { border-color: #94a3b8; color: #1e293b; }
.action-btn.publish { color: #166534; border-color: rgba(24,214,0,0.3); }
.action-btn.publish:hover { background: rgba(24,214,0,0.06); border-color: var(--primary-color); }
.action-btn.unpublish { color: #92400e; border-color: rgba(234,179,8,0.3); }
.action-btn.unpublish:hover { background: rgba(234,179,8,0.06); border-color: #eab308; }
.action-btn.danger { color: #dc2626; border-color: rgba(220,38,38,0.2); margin-left: auto; }
.action-btn.danger:hover { background: #fef2f2; border-color: #dc2626; }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
}
.modal-content.small {
  background: white; border-radius: 12px; padding: 24px;
  max-width: 400px; width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.modal-content h4 { margin: 0 0 8px; font-size: 17px; color: var(--text-bold); }
.modal-content p { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel {
  background: var(--bg-main); border: 1px solid var(--border-color);
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; color: var(--text-muted);
}
.btn-danger {
  background: #dc2626; color: white; border: none;
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 700;
  cursor: pointer; transition: opacity 0.2s;
}
.btn-danger:hover { opacity: 0.9; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .template-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .filters-left { justify-content: stretch; }
  .filter-select { flex: 1; }
}
</style>
