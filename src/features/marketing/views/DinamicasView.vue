<template>
  <div class="dinamicas">
    <div class="page-header">
      <h1>Dinámicas</h1>
      <div class="tabs">
        <button :class="{ active: tab === 'list' }" @click="tab = 'list'">Mis Dinámicas</button>
        <button :class="{ active: tab === 'ruleta' }" @click="tab = 'ruleta'">Ruletas</button>
        <button :class="{ active: tab === 'trivia' }" @click="tab = 'trivia'">Trivias</button>
        <button v-if="store.currentItem" :class="{ active: tab === 'detail' }" @click="tab = 'detail'">Detalle</button>
      </div>
      <button class="btn-primary-dinamica" @click="showCreateForm = true">+ Nueva Dinámica</button>
    </div>

    <div v-if="store.loading" class="loading">Cargando...</div>

    <!-- TAB: List -->
    <div v-if="tab === 'list'" class="tab-content">
      <div v-if="store.items.length === 0" class="empty">
        <p>No tienes dinámicas creadas aún.</p>
      </div>
      <table v-else class="dinamicas-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Participantes</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in store.items" :key="item.id">
            <td>{{ item.nombre }}</td>
            <td><span class="dinamica-badge" :class="item.tipo_dinamica === 'trivia' ? 'badge-trivia' : 'badge-ruleta'">{{ item.tipo_dinamica === 'trivia' ? 'Trivia' : 'Ruleta' }}</span></td>
            <td>
              <span class="status-badge-custom" :class="item.is_active ? 'badge-active' : 'badge-inactive'">
                {{ item.is_active ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td>{{ item.registros_count ?? 0 }}</td>
            <td>{{ new Date(item.created_at).toLocaleDateString() }}</td>
            <td class="actions">
              <button class="action-btn-sm" @click="viewDetail(item)">Ver</button>
              <button class="action-btn-sm" @click="toggleStatus(item)">
                {{ item.is_active ? 'Desactivar' : 'Activar' }}
              </button>
              <button class="action-btn-sm btn-action-danger" @click="confirmDelete(item)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TAB: Ruletas -->
    <div v-if="tab === 'ruleta'" class="tab-content">
      <div v-if="store.ruletas.length === 0" class="empty">
        <p>No tienes ruletas creadas.</p>
      </div>
      <div v-else class="card-grid">
        <div v-for="item in store.ruletas" :key="item.id" class="dinamica-card-item" @click="viewDetail(item)">
          <h3>{{ item.nombre }}</h3>
          <p>{{ item.descripcion }}</p>
          <div class="card-status">
            <span class="status-badge-custom" :class="item.is_active ? 'badge-active' : 'badge-inactive'">
              {{ item.is_active ? 'Activa' : 'Inactiva' }}
            </span>
            <span class="muted-text">{{ item.premios_count || 0 }} premios</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: Trivias -->
    <div v-if="tab === 'trivia'" class="tab-content">
      <div v-if="store.trivias.length === 0" class="empty">
        <p>No tienes trivias creadas.</p>
      </div>
      <div v-else class="card-grid">
        <div v-for="item in store.trivias" :key="item.id" class="dinamica-card-item" @click="viewDetail(item)">
          <h3>{{ item.nombre }}</h3>
          <p>{{ item.descripcion }}</p>
          <div class="card-status">
            <span class="status-badge-custom" :class="item.is_active ? 'badge-active' : 'badge-inactive'">
              {{ item.is_active ? 'Activa' : 'Inactiva' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: Detail -->
    <div v-if="tab === 'detail' && store.currentItem" class="tab-content">
      <div class="detail-header">
        <h2>{{ store.currentItem.nombre }}</h2>
        <span class="status-badge-custom" :class="store.currentItem.is_active ? 'badge-active' : 'badge-inactive'">
          {{ store.currentItem.is_active ? 'Activa' : 'Inactiva' }}
        </span>
      </div>
      <p>{{ store.currentItem.descripcion }}</p>
      <div class="detail-meta">
        <div><strong>Tipo:</strong> {{ store.currentItem.tipo_dinamica === 'trivia' ? 'Trivia' : 'Ruleta' }}</div>
        <div><strong>Slug:</strong> {{ store.currentItem.slug }}</div>
        <div><strong>Máx. participantes:</strong> {{ store.currentItem.max_participantes || 'Sin límite' }}</div>
        <div><strong>Modo inscripción:</strong> {{ store.currentItem.modo_inscripcion || 'N/A' }}</div>
        <div><strong>Premios:</strong> {{ store.currentPremios.length }}</div>
      </div>
      <div class="detail-actions">
        <button class="btn-action-dinamica" @click="toggleStatus(store.currentItem)">
          {{ store.currentItem.is_active ? 'Desactivar' : 'Activar' }}
        </button>
        <button class="btn-action-dinamica btn-action-danger" @click="confirmDelete(store.currentItem)">Eliminar</button>
      </div>
    </div>

    <!-- Create Form Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
      <div class="modal-card dinamica-modal">
        <h2>Nueva Dinámica</h2>
        <form @submit.prevent="handleCreate">
          <div class="field-group">
            <label>Nombre *</label>
            <input v-model="createForm.nombre" required class="field-input-custom" />
          </div>
          <div class="field-group">
            <label>Tipo *</label>
            <select v-model="createForm.tipo_dinamica" required class="field-input-custom">
              <option value="ruleta">Ruleta</option>
              <option value="trivia">Trivia</option>
            </select>
          </div>
          <div class="field-group">
            <label>Descripción</label>
            <textarea v-model="createForm.descripcion" class="field-input-custom" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel-dinamica" @click="showCreateForm = false">Cancelar</button>
            <button type="submit" class="btn-primary-dinamica" :disabled="store.loading">
              {{ store.loading ? 'Creando...' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal-card dinamica-modal">
        <h2>Confirmar Eliminación</h2>
        <p>¿Estás seguro de eliminar "{{ deleteTarget?.nombre }}"? Esta acción también eliminará todos los registros, premios y turnos asociados.</p>
        <div class="form-actions">
          <button class="btn-cancel-dinamica" @click="showDeleteConfirm = false">Cancelar</button>
          <button class="btn-danger-dinamica" @click="handleDelete" :disabled="store.loading">
            {{ store.loading ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDinamicasStore } from '../stores/dinamicasStore'

const store = useDinamicasStore()
const tab = ref('list')
const showCreateForm = ref(false)
const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

const createForm = ref({
  nombre: '',
  tipo_dinamica: 'ruleta',
  descripcion: '',
})

onMounted(() => {
  store.fetchAll()
})

function viewDetail(item) {
  store.fetchOne(item.id)
  tab.value = 'detail'
}

async function toggleStatus(item) {
  await store.toggleStatus(item.id)
}

async function handleCreate() {
  const result = await store.create({ ...createForm.value })
  if (result?.success) {
    showCreateForm.value = false
    createForm.value = { nombre: '', tipo_dinamica: 'ruleta', descripcion: '' }
  }
}

function confirmDelete(item) {
  deleteTarget.value = item
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deleteTarget.value) return
  const result = await store.remove(deleteTarget.value.id)
  if (result?.success) {
    showDeleteConfirm.value = false
    deleteTarget.value = null
    if (tab.value === 'detail') {
      store.resetCurrent()
      tab.value = 'list'
    }
  }
}
</script>

<style scoped>
.dinamicas { max-width: 1000px; margin: 0 auto; padding: 1.5rem; animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
.page-header h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-bold); }
.tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tabs button { padding: 0.5rem 1rem; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; font-size: 0.875rem; background: var(--card-bg); color: var(--text-main); transition: all 0.2s; }
.tabs button.active { background: var(--primary-color); color: #fff; border-color: var(--primary-color); }
.tabs button:disabled { opacity: 0.5; cursor: not-allowed; }
.loading { padding: 24px; text-align: center; color: var(--text-muted); }
.tab-content { margin-top: 16px; }
.empty { padding: 24px; text-align: center; color: var(--text-muted); border: 1px solid var(--border-color); border-radius: 8px; background: var(--card-bg); }

/* Table */
.dinamicas-table { width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); }
.dinamicas-table th { padding: 10px 12px; font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; background: var(--bg-main); border-bottom: 1px solid var(--border-color); white-space: nowrap; }
.dinamicas-table td { padding: 10px 12px; font-size: 0.85rem; color: var(--text-main); border-bottom: 1px solid var(--border-color); vertical-align: middle; }
.dinamicas-table tbody tr:last-child td { border-bottom: none; }
.dinamicas-table tbody tr:hover { background: rgba(24, 214, 0, 0.03); }

/* Badges */
.dinamica-badge, .status-badge-custom { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
.badge-trivia { background: rgba(24, 119, 242, 0.12); color: #1a56db; }
.badge-ruleta { background: rgba(24, 214, 0, 0.12); color: #166534; }
.badge-active { background: rgba(24, 214, 0, 0.12); color: #166534; border-radius: 20px; padding: 3px 10px; font-size: 0.75rem; font-weight: 700; }
.badge-inactive { background: rgba(148, 163, 184, 0.15); color: #64748b; border-radius: 20px; padding: 3px 10px; font-size: 0.75rem; font-weight: 700; }
.muted-text { color: var(--text-muted); font-size: 12px; }

/* Action buttons */
.action-btn-sm { padding: 4px 10px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 12px; cursor: pointer; background: var(--card-bg); color: var(--text-main); transition: all 0.2s; margin-right: 4px; }
.action-btn-sm:hover { border-color: var(--primary-color); color: var(--primary-color); }
.btn-action-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger-color); border-color: rgba(239, 68, 68, 0.2); }
.btn-action-danger:hover { background: var(--danger-color); color: white; }

/* Cards grid */
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.dinamica-card-item { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 20px; cursor: pointer; transition: all 0.25s ease; }
.dinamica-card-item:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); border-color: rgba(24, 214, 0, 0.2); }
.dinamica-card-item h3 { font-size: 1rem; font-weight: 700; color: var(--text-bold); margin: 0 0 8px 0; }
.dinamica-card-item p { font-size: 13px; color: var(--text-muted); margin: 0 0 12px 0; line-height: 1.4; }
.card-status { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

/* Detail */
.detail-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.detail-header h2 { font-size: 1.25rem; font-weight: 700; color: var(--text-bold); margin: 0; }
.detail-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px; background: var(--bg-main); border-radius: 8px; margin-bottom: 16px; }
.detail-meta div { font-size: 13px; color: var(--text-main); }
.detail-actions { display: flex; gap: 8px; }
.btn-action-dinamica { padding: 8px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 13px; cursor: pointer; background: var(--card-bg); color: var(--text-main); transition: all 0.2s; }
.btn-action-dinamica:hover { border-color: var(--primary-color); color: var(--primary-color); }

/* Modal */
.modal-card.dinamica-modal { padding: 24px; max-width: 500px; }
.dinamica-modal h2 { font-size: 1.15rem; font-weight: 700; color: var(--text-bold); margin: 0 0 16px 0; }
.dinamica-modal p { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin: 0 0 16px 0; }

.field-group { margin-bottom: 16px; }
.field-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: var(--text-bold); }
.field-input-custom { width: 100%; padding: 9px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 13px; background: var(--card-bg); color: var(--text-main); font-family: inherit; box-sizing: border-box; }
.field-input-custom:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08); }
select.field-input-custom { cursor: pointer; }
textarea.field-input-custom { resize: vertical; }

.form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.btn-cancel-dinamica { background: transparent; border: 1px solid var(--border-color); padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; color: var(--text-main); cursor: pointer; transition: all 0.2s; }
.btn-cancel-dinamica:hover { background: var(--bg-main); }
.btn-primary-dinamica { background: var(--primary-color); color: white; border: none; padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary-dinamica:hover:not(:disabled) { filter: brightness(1.1); }
.btn-primary-dinamica:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger-dinamica { background: var(--danger-color); color: white; border: none; padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-danger-dinamica:hover:not(:disabled) { filter: brightness(1.15); }
.btn-danger-dinamica:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .card-grid { grid-template-columns: 1fr; }
  .detail-meta { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>
