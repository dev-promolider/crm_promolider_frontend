<template>
  <div class="reports-view">
    <div class="card">
      <div class="card-body">
        <div class="card-header">
          <div>
            <h4 class="card-title">Reporte de Herramientas de Marketing</h4>
            <span class="card-meta">Estadísticas de tus herramientas de marketing</span>
          </div>
        </div>

        <!-- Content Type Selector -->
        <div class="row-selector mb-3">
          <div class="selector-group">
            <label for="contentType">Tipo de Contenido:</label>
            <select id="contentType" v-model="selectedContentType" class="form-select-custom" @change="loadData">
              <option value="masterclass">Masterclass</option>
              <option value="minicourse">Mini Cursos</option>
              <option value="ebook">Ebooks</option>
            </select>
          </div>
          <Loader2 v-if="loading" :size="18" class="spinner-inline" />
        </div>

        <!-- ===== ADMIN / PRODUCER TABLE ===== -->
        <div v-if="userRole === 'admin' || userRole === 'producer'">
          <div v-if="groupedData.length > 0" class="table-responsive">
            <table class="table table-striped table-bordered table-hover">
              <thead class="thead-light">
                <tr>
                  <th>#</th>
                  <th>{{ contentTypeLabel }}</th>
                  <th>Fecha</th>
                  <th># Distribuidores</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(group, index) in paginatedData" :key="group.content_id || index">
                  <td>{{ index + 1 }}</td>
                  <td class="cell-name">{{ group.content_name || '-' }}</td>
                  <td>{{ formatDate(group.fecha || group.created_at) }}</td>
                  <td class="cell-center">{{ group.num_distribuidores || 0 }}</td>
                  <td>
                    <span class="badge-status" :class="getEstadoClass(group)">
                      {{ group.estado || getEstadoLabel(group) }}
                    </span>
                  </td>
                  <td>
                    <select class="action-select" @change="handleAction(group, $event)">
                      <option value="">Seleccionar</option>
                      <option value="invitar">Invitar</option>
                      <option value="distribuidores">Lista de Distribuidores</option>
                      <option value="participantes">Lista de Participantes</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination & Info -->
          <div v-if="groupedData.length > 0" class="table-footer">
            <small class="text-muted">Mostrando {{ groupedData.length }} registros</small>
            <nav v-if="totalPages > 1">
              <ul class="pagination-custom">
                <li :class="{ disabled: currentPage <= 1 }">
                  <a href="#" @click.prevent="currentPage > 1 && currentPage--">&laquo;</a>
                </li>
                <li v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
                  <a href="#" @click.prevent="currentPage = page">{{ page }}</a>
                </li>
                <li :class="{ disabled: currentPage >= totalPages }">
                  <a href="#" @click.prevent="currentPage < totalPages && currentPage++">&raquo;</a>
                </li>
              </ul>
            </nav>
          </div>

          <div v-else-if="!loading" class="empty-state">
            <BarChart3 :size="32" class="empty-icon" />
            <p>No hay datos disponibles</p>
          </div>
        </div>

        <!-- ===== DISTRIBUTOR TABLE ===== -->
        <div v-else-if="userRole === 'distributor'">
          <div v-if="masterclasses.length > 0" class="table-responsive">
            <table class="table table-striped table-bordered table-hover">
              <thead class="thead-light">
                <tr>
                  <th>#</th>
                  <th>{{ contentTypeLabel }}</th>
                  <th>Productor</th>
                  <th>Usuarios Registrados</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in distributorData" :key="item.id || index">
                  <td>{{ index + 1 }}</td>
                  <td class="cell-name">{{ item.content_name || '-' }}</td>
                  <td>{{ item.productor_nombre || item.producer_name || '-' }}</td>
                  <td class="cell-center">{{ item.usuarios_registrados || item.registered_users || 0 }}</td>
                  <td>
                    <button class="btn-action" @click="viewStudents(item)">
                      <GraduationCap :size="14" /> Ver Alumnos
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="masterclasses.length > 0" class="table-footer">
            <small class="text-muted">Mostrando {{ masterclasses.length }} registros</small>
          </div>

          <div v-else-if="!loading" class="empty-state">
            <BarChart3 :size="32" class="empty-icon" />
            <p>No hay datos disponibles</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== INVITATION MODAL ===== -->
    <div v-if="showInvitationModal" class="modal-overlay" @click.self="closeInvitationModal">
      <div class="modal-card">
        <div class="modal-header">
          <h5 class="modal-title"><Share2 :size="18" /> Invitar: <u>{{ selectedItem?.content_name || '' }}</u></h5>
          <button class="close-btn" @click="closeInvitationModal"><X :size="20" /></button>
        </div>
        <div class="modal-body">
          <div v-if="invitationData.existInvitation && !newInvitationLink" class="alert-info-custom">
            <h6><Info :size="16" /> Link de Invitación Activo</h6>
            <p>Ya tienes un link de invitación activo para esta herramienta.</p>
            <div class="input-group-custom">
              <input type="text" class="form-input" :value="invitationData.invitationLink" readonly />
              <button class="btn-copy" @click="copyToClipboard(invitationData.invitationLink)"><Copy :size="15" /> Copiar</button>
            </div>
          </div>

          <div v-if="!invitationData.existInvitation && !newInvitationLink" class="alert-warning-custom">
            <h6><AlertTriangle :size="16" /> Crear Link de Invitación</h6>
            <p>No tienes un link de invitación activo. Haz clic en el botón para crear uno.</p>
            <button @click="createInvitationLink" :disabled="loadingInvitation" class="btn-primary-custom">
              <Plus :size="15" />
              {{ loadingInvitation ? 'Creando...' : 'Crear Link de Invitación' }}
            </button>
          </div>

          <div v-if="newInvitationLink" class="alert-success-custom">
            <h6><CheckCircle :size="16" /> Link Creado Exitosamente</h6>
            <p>Tu link de invitación ha sido creado y es válido por 7 días.</p>
            <div class="input-group-custom">
              <input type="text" class="form-input" :value="newInvitationLink" readonly />
              <button class="btn-copy" @click="copyToClipboard(newInvitationLink)"><Copy :size="15" /> Copiar</button>
            </div>
          </div>

          <div v-if="invitationData.existInvitation || newInvitationLink" class="share-section">
            <h6 class="share-title">Compartir via:</h6>
            <div class="share-buttons">
              <a :href="getWhatsappShareUrl()" target="_blank" class="btn-share btn-share-whatsapp">
                <MessageCircle :size="15" /> WhatsApp
              </a>
              <a :href="getFacebookShareUrl()" target="_blank" class="btn-share btn-share-facebook">
                <ExternalLink :size="15" /> Facebook
              </a>
              <button @click="copyToClipboard(getCurrentInvitationLink())" class="btn-share btn-share-copy">
                <Copy :size="15" /> Copiar Link
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeInvitationModal">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- ===== DETAIL MODAL (Distribuidores / Estudiantes / Participantes) ===== -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-card modal-card-wide">
        <div class="modal-header">
          <h5 class="modal-title">
            <component :is="detailIcon" :size="18" />
            {{ detailModalTitle }}
          </h5>
          <button class="close-btn" @click="closeDetailModal"><X :size="20" /></button>
        </div>
        <div class="modal-body">
          <div v-if="detailLoading" class="loading-state">
            <Loader2 class="spinner" :size="28" />
            <p>Cargando...</p>
          </div>

          <div v-else-if="detailData.length === 0" class="empty-state">
            <BarChart3 :size="28" class="empty-icon" />
            <p>No hay registros</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-striped table-bordered table-hover table-sm">
              <thead class="thead-light">
                <tr>
                  <th>#</th>
                  <th v-for="col in detailColumns" :key="col.key">{{ col.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in detailData" :key="row.id || idx">
                  <td>{{ idx + 1 }}</td>
                  <td v-for="col in detailColumns" :key="col.key" class="cell-detail">
                    {{ getNestedValue(row, col.key) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDetailModal">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="showToast" class="toast-notification">
      <div class="toast-content">
        <CheckCircle :size="20" class="text-success" />
        <span>{{ toastMessage }}</span>
        <button @click="showToast = false" class="toast-close"><X :size="16" /></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReportsStore } from '../stores/reportsStore'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { formatDate } from '@/utils/formatDate'
import apiClient from '@/services/apiClient'
import {
  BarChart3, Loader2, Share2, X, Info, AlertTriangle, Plus, CheckCircle,
  Copy, MessageCircle, ExternalLink, GraduationCap, Users, UserCheck, UserPlus
} from 'lucide-vue-next'

const store = useReportsStore()
const authStore = useAuthStore()

// ─── User role ────────────────────────────────────────────────────────
const userRoles = computed(() => authStore.role || [])
const userRole = computed(() => {
  const roles = userRoles.value.map(r => String(r).toLowerCase())
  if (roles.includes('admin') || roles.includes('super-admin')) return 'admin'
  if (roles.includes('producer') || roles.includes('productor')) return 'producer'
  return 'distributor'
})

// ─── State ────────────────────────────────────────────────────────────
const loading = ref(false)
const selectedContentType = ref('masterclass')
const masterclasses = ref([])
const currentPage = ref(1)
const perPage = 10

// Invitation modal
const showInvitationModal = ref(false)
const selectedItem = ref(null)
const loadingInvitation = ref(false)
const invitationData = ref({ existInvitation: false, invitationLink: '' })
const newInvitationLink = ref('')
const showToast = ref(false)
const toastMessage = ref('')

// Detail modal (distributors / students / participants)
const showDetailModal = ref(false)
const detailModalTitle = ref('')
const detailIcon = ref(Users)
const detailData = ref([])
const detailLoading = ref(false)
const detailColumns = ref([])

// ─── Computed ─────────────────────────────────────────────────────────
const contentTypeLabel = computed(() => {
  const labels = { masterclass: 'Masterclass', minicourse: 'Mini Curso', ebook: 'Ebook' }
  return labels[selectedContentType.value] || 'Contenido'
})

// Group by content_id (Admin/Producer view)
const groupedData = computed(() => {
  const grouped = {}
  const keyMap = { masterclass: 'masterclass_id', minicourse: 'minicourse_id', ebook: 'ebook_id' }
  const nameMap = { masterclass: 'masterclass_nombre', minicourse: 'minicourse_nombre', ebook: 'ebook_nombre' }
  const key = keyMap[selectedContentType.value]
  const nameKey = nameMap[selectedContentType.value]

  masterclasses.value.forEach(item => {
    const contentId = item[key]
    if (contentId) {
      if (!grouped[contentId]) {
        grouped[contentId] = {
          content_id: contentId,
          content_name: item[nameKey] || item.masterclass_nombre || item.minicourse_nombre || item.ebook_nombre || item.title || item.name,
          masterclass_nombre: item.masterclass_nombre,
          minicourse_nombre: item.minicourse_nombre,
          ebook_nombre: item.ebook_nombre,
          fecha: item.fecha,
          created_at: item.created_at,
          estado: item.estado,
          status_code: item.status_code,
          status: item.status,
          distributors: [],
          num_distribuidores: 0,
        }
      }
      grouped[contentId].distributors.push(item)
    }
  })

  return Object.values(grouped).map(g => {
    g.num_distribuidores = g.distributors.length
    return g
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(groupedData.value.length / perPage)))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return groupedData.value.slice(start, start + perPage)
})

// Distributor view - flat list with content name mapping
const distributorData = computed(() => {
  const nameMap = { masterclass: 'masterclass_nombre', minicourse: 'minicourse_nombre', ebook: 'ebook_nombre' }
  const nameKey = nameMap[selectedContentType.value]
  return masterclasses.value.map(item => ({
    ...item,
    content_name: item[nameKey] || item.masterclass_nombre || item.minicourse_nombre || item.ebook_nombre || item.title || item.name,
  }))
})

// ─── Helpers ──────────────────────────────────────────────────────────
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part] ?? '', obj) || '-'
}

function getEstadoLabel(item) {
  if (item.estado === 'Publicado') return 'Publicado'
  if (item.estado === 'No Publicado') return 'No publicado'
  if (item.estado === 'Privado') return 'Privado'
  const status = item.status !== undefined ? item.status : item.status_code
  if (status == 1) return 'Publicado'
  if (status == 0) return 'No publicado'
  if (status == 2) return 'Privado'
  return 'Desconocido'
}

function getEstadoClass(item) {
  if (item.estado === 'Publicado') return 'badge-green'
  if (item.estado === 'No Publicado') return 'badge-gray'
  if (item.estado === 'Privado') return 'badge-orange'
  const status = item.status !== undefined ? item.status : item.status_code
  if (status == 1) return 'badge-green'
  if (status == 0) return 'badge-gray'
  if (status == 2) return 'badge-orange'
  return ''
}

// ─── Load Data ────────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  currentPage.value = 1
  try {
    const roleViewMap = {
      admin: 'admin',
      producer: 'producer-m',
      distributor: 'distributor',
    }
    const view = roleViewMap[userRole.value] || 'producer-m'
    const userId = authStore.user?.id
    let response
    switch (selectedContentType.value) {
      case 'masterclass':
        response = await store.fetchMasterclassReport(view, userId)
        break
      case 'minicourse':
        response = await store.fetchMiniCourseReport(view, userId)
        break
      case 'ebook':
        response = await store.fetchEbookReport(view, userId)
        break
    }
    const raw = response?.data || response || []
    masterclasses.value = Array.isArray(raw) ? raw : []
  } catch {
    masterclasses.value = []
  } finally {
    loading.value = false
  }
}

// ─── Actions ──────────────────────────────────────────────────────────
function handleAction(group, event) {
  const action = event.target.value
  event.target.value = ''
  switch (action) {
    case 'invitar':
      openInvitationModal(group)
      break
    case 'distribuidores':
      showDistributorsList(group.content_id)
      break
    case 'participantes':
      showParticipants(group.content_id)
      break
  }
}

async function showDistributorsList(contentId) {
  detailLoading.value = true
  showDetailModal.value = true
  detailModalTitle.value = `Distribuidores - ${contentTypeLabel.value}`
  detailIcon.value = Users
  detailColumns.value = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'username', label: 'Usuario' },
  ]
  detailData.value = []
  try {
    const type = selectedContentType.value === 'minicourse' ? 'minicourse' : selectedContentType.value
    const response = await store.fetchDistributors(type, contentId)
    const items = response?.data || response || []
    detailData.value = Array.isArray(items) ? items : []
  } catch {
    detailData.value = []
  } finally {
    detailLoading.value = false
  }
}

async function showParticipants(contentId) {
  detailLoading.value = true
  showDetailModal.value = true
  detailModalTitle.value = `Participantes - ${contentTypeLabel.value}`
  detailIcon.value = UserCheck
  detailColumns.value = [
    { key: 'user_name', label: 'Nombre' },
    { key: 'user_email', label: 'Email' },
    { key: 'isParticipant', label: 'Participa' },
  ]
  detailData.value = []
  try {
    const type = selectedContentType.value === 'minicourse' ? 'minicourse' : selectedContentType.value
    const response = await store.fetchPendingParticipants(type, contentId)
    const items = response?.data || response || []
    detailData.value = Array.isArray(items) ? items : []
  } catch {
    detailData.value = []
  } finally {
    detailLoading.value = false
  }
}

async function viewStudents(item) {
  const idMap = { masterclass: 'masterclass_id', minicourse: 'minicourse_id', ebook: 'ebook_id' }
  const contentId = item[idMap[selectedContentType.value]]
  if (!contentId) return

  detailLoading.value = true
  showDetailModal.value = true
  detailModalTitle.value = `Estudiantes - ${contentTypeLabel.value}`
  detailIcon.value = GraduationCap
  detailColumns.value = [
    { key: 'name', label: 'Nombre' },
    { key: 'lastname', label: 'Apellido' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Teléfono' },
  ]
  detailData.value = []
  try {
    const type = selectedContentType.value === 'minicourse' ? 'minicourse' : selectedContentType.value
    const response = await store.fetchStudents(type, contentId)
    const items = response?.data || response || []
    detailData.value = Array.isArray(items) ? items : []
  } catch {
    detailData.value = []
  } finally {
    detailLoading.value = false
  }
}

function closeDetailModal() {
  showDetailModal.value = false
  detailData.value = []
  detailColumns.value = []
}

// ─── Invitation Modal ─────────────────────────────────────────────────
async function openInvitationModal(group) {
  selectedItem.value = group
  newInvitationLink.value = ''
  showInvitationModal.value = true

  const hasPurchased = await checkPurchaseOrRegistration(group)
  if (hasPurchased) {
    await checkExistingInvitation(group)
  } else {
    showInvitationModal.value = false
    showToastMessage('Debes registrar/comprar esta herramienta antes de poder invitar a otros.')
  }
}

async function checkPurchaseOrRegistration(group) {
  try {
    let endpoint = ''
    const contentId = group.content_id
    switch (selectedContentType.value) {
      case 'masterclass':
        endpoint = `/masterclass/check-registration/${contentId}`
        break
      case 'minicourse':
        endpoint = `/marketing/mini-course/invitation/check-purchase/${contentId}`
        break
      case 'ebook':
        endpoint = `/marketing/ebook/check-purchase/${contentId}`
        break
    }
    const response = await apiClient.get(endpoint)
    return response.data?.isPurchased || response.data?.isRegistered || false
  } catch {
    return false
  }
}

async function checkExistingInvitation(group) {
  try {
    let endpoint = ''
    const contentId = group.content_id
    switch (selectedContentType.value) {
      case 'masterclass':
        endpoint = `/masterclass/check-invitation/${contentId}`
        break
      case 'minicourse':
        endpoint = `/marketing/mini-course/invitation/check-invitation/${contentId}`
        break
      case 'ebook':
        endpoint = `/marketing/ebook/check-invitation/${contentId}`
        break
    }
    const response = await apiClient.get(endpoint)
    invitationData.value = {
      existInvitation: response.data?.existInvitation || false,
      invitationLink: response.data?.invitationLink || '',
    }
  } catch {
    invitationData.value = { existInvitation: false, invitationLink: '' }
  }
}

async function createInvitationLink() {
  if (!selectedItem.value?.content_id) return
  loadingInvitation.value = true
  try {
    let endpoint = ''
    const contentId = selectedItem.value.content_id
    switch (selectedContentType.value) {
      case 'masterclass':
        endpoint = `/masterclass/create-invitation/${contentId}`
        break
      case 'minicourse':
        endpoint = `/marketing/mini-course/invitation/invitation-link/${contentId}`
        break
      case 'ebook':
        endpoint = `/marketing/ebook/invitation-link/${contentId}`
        break
    }
    const response = await apiClient.post(endpoint)
    newInvitationLink.value = response.data?.link
    invitationData.value = {
      existInvitation: true,
      invitationLink: response.data?.link,
    }
    showToastMessage('Link de invitación creado exitosamente')
  } catch {
    showToastMessage('Hubo un problema al crear el link de invitación.')
  } finally {
    loadingInvitation.value = false
  }
}

function closeInvitationModal() {
  showInvitationModal.value = false
  selectedItem.value = null
  newInvitationLink.value = ''
}

function getCurrentInvitationLink() {
  return newInvitationLink.value || invitationData.value.invitationLink || ''
}

function getWhatsappShareUrl() {
  const link = getCurrentInvitationLink()
  const contentName = selectedItem.value?.content_name || ''
  const typeLabel = contentTypeLabel.value
  const text = `¡Hola! Te invito a conocer este increíble ${typeLabel}: "${contentName}". Regístrate usando mi link de invitación: ${link}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

function getFacebookShareUrl() {
  const link = getCurrentInvitationLink()
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    showToastMessage('Link copiado al portapapeles')
  } catch {
    showToastMessage('No se pudo copiar el link')
  }
}

function showToastMessage(message) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

// ─── Mount ────────────────────────────────────────────────────────────
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.reports-view { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.card-header { margin-bottom: 12px; }
.card-title { font-size: 1.1rem; font-weight: 700; color: var(--text-bold); margin: 0; }
.card-meta { font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px; }

/* ── Selector ── */
.row-selector { display: flex; align-items: center; gap: 12px; }
.selector-group { display: flex; align-items: center; gap: 8px; }
.selector-group label { font-size: 13px; font-weight: 600; color: var(--text-main); white-space: nowrap; }
.form-select-custom {
  border: 1px solid var(--border-color); border-radius: 8px;
  padding: 7px 12px; font-size: 13px; background: var(--card-bg);
  color: var(--text-main); cursor: pointer; min-width: 180px;
}
.form-select-custom:focus { outline: none; border-color: var(--primary-color); }
.spinner-inline { animation: spin 1s linear infinite; color: var(--primary-color); }
@keyframes spin { to { transform: rotate(360deg); } }
.mb-3 { margin-bottom: 16px; }

/* ── Table ── */
.table-responsive { border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); }
.table { width: 100%; border-collapse: collapse; background: var(--card-bg); }
.table thead { background: var(--bg-main); }
.table th {
  padding: 10px 12px; font-size: 0.78rem; font-weight: 700;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px;
  border-bottom: 1px solid var(--border-color); white-space: nowrap;
}
.table td {
  padding: 10px 12px; font-size: 0.85rem; color: var(--text-main);
  border-bottom: 1px solid var(--border-color); vertical-align: middle;
}
.table tbody tr:last-child td { border-bottom: none; }
.table tbody tr:hover { background: rgba(24, 214, 0, 0.03); }
.cell-name { font-weight: 600; }
.cell-center { text-align: center; font-weight: 600; }
.cell-detail { font-size: 0.82rem; }

/* ── Badges ── */
.badge-status {
  padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;
  white-space: nowrap; display: inline-block;
}
.badge-green { background: rgba(24, 214, 0, 0.12); color: #166534; }
.badge-gray { background: rgba(148, 163, 184, 0.15); color: #64748b; }
.badge-orange { background: rgba(245, 158, 11, 0.12); color: #92400e; }

/* ── Action Select ── */
.action-select {
  border: 1px solid var(--border-color); border-radius: 6px;
  padding: 5px 8px; font-size: 12px; min-width: 140px;
  background: var(--card-bg); color: var(--text-main); cursor: pointer;
}
.action-select:focus { outline: none; border-color: var(--primary-color); }

.btn-action {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--primary-color); color: white; border: none;
  padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.btn-action:hover { opacity: 0.9; }

/* ── Table Footer / Pagination ── */
.table-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
.pagination-custom { display: flex; gap: 4px; list-style: none; padding: 0; margin: 0; }
.pagination-custom li a {
  display: flex; align-items: center; justify-content: center;
  min-width: 32px; height: 32px; padding: 0 6px;
  border: 1px solid var(--border-color); border-radius: 6px;
  font-size: 13px; color: var(--text-main); text-decoration: none;
  transition: all 0.2s; background: var(--card-bg);
}
.pagination-custom li a:hover { border-color: var(--primary-color); color: var(--primary-color); }
.pagination-custom li.active a { background: var(--primary-color); border-color: var(--primary-color); color: white; font-weight: 700; }
.pagination-custom li.disabled a { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

/* ── Empty / Loading States ── */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px; color: var(--text-muted); gap: 8px; }
.empty-icon { opacity: 0.4; }
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 30px; color: var(--text-muted); gap: 8px; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}
.modal-card {
  background: var(--card-bg); border: 1px solid var(--border-color);
  border-radius: 12px; width: 90%; max-width: 540px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: slideUp 0.3s ease-out;
}
.modal-card-wide { max-width: 720px; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--border-color);
}
.modal-title { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0; }
.modal-title u { color: var(--primary-color); }
.close-btn {
  background: none; border: none; color: var(--text-light);
  cursor: pointer; padding: 6px; border-radius: 6px;
  display: flex; transition: all 0.2s;
}
.close-btn:hover { background: var(--bg-main); color: var(--danger-color); }
.modal-body { padding: 20px; max-height: 60vh; overflow-y: auto; }
.modal-footer { display: flex; justify-content: flex-end; padding: 0 20px 20px; }
.btn-cancel {
  background: transparent; border: 1px solid var(--border-color);
  padding: 8px 16px; border-radius: 8px; font-size: 13px;
  font-weight: 500; color: var(--text-main); cursor: pointer; transition: all 0.2s;
}
.btn-cancel:hover { background: var(--bg-main); }

/* ── Alert styles ── */
.alert-info-custom, .alert-warning-custom, .alert-success-custom {
  padding: 14px; border-radius: 8px; margin-bottom: 12px;
}
.alert-info-custom { background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); }
.alert-warning-custom { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); }
.alert-success-custom { background: rgba(24,214,0,0.08); border: 1px solid rgba(24,214,0,0.2); }
.alert-info-custom h6, .alert-warning-custom h6, .alert-success-custom h6 {
  display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; margin: 0 0 6px;
}
.alert-info-custom p, .alert-warning-custom p, .alert-success-custom p {
  font-size: 13px; margin: 0 0 10px; color: var(--text-muted);
}

.input-group-custom { display: flex; gap: 6px; }
.form-input {
  flex: 1; border: 1px solid var(--border-color); border-radius: 6px;
  padding: 7px 10px; font-size: 12px; background: var(--card-bg); color: var(--text-main);
}
.btn-copy {
  display: inline-flex; align-items: center; gap: 4px;
  background: transparent; border: 1px solid var(--border-color);
  padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
  color: var(--text-main); cursor: pointer; white-space: nowrap;
  transition: all 0.2s;
}
.btn-copy:hover { border-color: var(--primary-color); color: var(--primary-color); }

.btn-primary-custom {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--primary-color); color: white; border: none;
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.btn-primary-custom:hover { opacity: 0.9; }
.btn-primary-custom:disabled { opacity: 0.5; cursor: not-allowed; }

.share-section { margin-top: 16px; }
.share-title { font-size: 13px; font-weight: 700; margin-bottom: 10px; }
.share-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
.btn-share {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
  text-decoration: none; cursor: pointer; border: none; transition: all 0.2s;
}
.btn-share-whatsapp { background: #25D366; color: white; }
.btn-share-whatsapp:hover { opacity: 0.9; }
.btn-share-facebook { background: #1877F2; color: white; }
.btn-share-facebook:hover { opacity: 0.9; }
.btn-share-copy { background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main); }
.btn-share-copy:hover { border-color: var(--primary-color); }

/* ── Toast ── */
.toast-notification {
  position: fixed; top: 20px; right: 20px; z-index: 99999;
  animation: slideInRight 0.3s ease-out;
}
.toast-content {
  background: var(--card-bg); border-radius: 8px; padding: 12px 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 10px;
  min-width: 280px; border: 1px solid var(--border-color);
}
.toast-close { background: none; border: none; cursor: pointer; margin-left: auto; padding: 0; color: var(--text-light); }
.toast-close:hover { color: var(--text-main); }
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.text-success { color: #16a34a; }

/* ── Table sm (detail modal) ── */
.table-sm th,
.table-sm td { padding: 6px 10px; font-size: 0.8rem; }
</style>
