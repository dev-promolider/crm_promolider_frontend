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
      <button class="btn-primary" @click="showCreateForm = true">+ Nueva Dinámica</button>
    </div>

    <div v-if="store.loading" class="loading">Cargando...</div>

    <!-- TAB: List -->
    <div v-if="tab === 'list'" class="tab-content">
      <div v-if="store.items.length === 0" class="empty">
        <p>No tienes dinámicas creadas aún.</p>
      </div>
      <table v-else class="table">
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
            <td><span class="badge" :class="item.tipo_dinamica === 'trivia' ? 'badge-trivia' : 'badge-ruleta'">{{ item.tipo_dinamica === 'trivia' ? 'Trivia' : 'Ruleta' }}</span></td>
            <td>
              <span :class="item.is_active ? 'badge-active' : 'badge-inactive'">
                {{ item.is_active ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td>{{ item.registros_count ?? 0 }}</td>
            <td>{{ new Date(item.created_at).toLocaleDateString() }}</td>
            <td class="actions">
              <button class="btn-sm" @click="viewDetail(item)">Ver</button>
              <button class="btn-sm" @click="toggleStatus(item)">
                {{ item.is_active ? 'Desactivar' : 'Activar' }}
              </button>
              <button class="btn-sm btn-danger" @click="confirmDelete(item)">Eliminar</button>
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
        <div v-for="item in store.ruletas" :key="item.id" class="card" @click="viewDetail(item)">
          <h3>{{ item.nombre }}</h3>
          <p>{{ item.descripcion }}</p>
          <div class="card-status">
            <span :class="item.is_active ? 'badge-active' : 'badge-inactive'">
              {{ item.is_active ? 'Activa' : 'Inactiva' }}
            </span>
            <span class="text-muted">{{ item.premios_count || 0 }} premios</span>
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
        <div v-for="item in store.trivias" :key="item.id" class="card" @click="viewDetail(item)">
          <h3>{{ item.nombre }}</h3>
          <p>{{ item.descripcion }}</p>
          <div class="card-status">
            <span :class="item.is_active ? 'badge-active' : 'badge-inactive'">
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
        <span :class="store.currentItem.is_active ? 'badge-active' : 'badge-inactive'">
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
        <button class="btn" @click="toggleStatus(store.currentItem)">
          {{ store.currentItem.is_active ? 'Desactivar' : 'Activar' }}
        </button>
        <button class="btn btn-danger" @click="confirmDelete(store.currentItem)">Eliminar</button>
      </div>
    </div>

    <!-- Create Form Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
      <div class="modal">
        <h2>Nueva Dinámica</h2>
        <form @submit.prevent="handleCreate">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="createForm.nombre" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Tipo *</label>
            <select v-model="createForm.tipo_dinamica" required class="form-control">
              <option value="ruleta">Ruleta</option>
              <option value="trivia">Trivia</option>
            </select>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="createForm.descripcion" class="form-control" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn" @click="showCreateForm = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="store.loading">
              {{ store.loading ? 'Creando...' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal">
        <h2>Confirmar Eliminación</h2>
        <p>¿Estás seguro de eliminar "{{ deleteTarget?.nombre }}"? Esta acción también eliminará todos los registros, premios y turnos asociados.</p>
        <div class="form-actions">
          <button class="btn" @click="showDeleteConfirm = false">Cancelar</button>
          <button class="btn-danger" @click="handleDelete" :disabled="store.loading">
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
