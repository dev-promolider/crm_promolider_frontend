<template>
  <div class="admin-tab-container">
    <div class="table-header">
      <h3>Peticiones de {{ type === 'role-courses' ? 'Creador de Cursos' : 'Herramientas de Marketing' }}</h3>
      <Loader2 v-if="store.loading" :size="18" class="spinner" />
    </div>

    <div v-if="store.error" class="error-banner">{{ store.error }}</div>

    <div class="table-responsive">
      <table class="table-custom">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Fecha de Solicitud</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in currentRequests" :key="request.id">
            <td class="font-weight-bolder">#{{ request.id }}</td>
            <td>
              <div class="user-info">
                <span class="user-name">{{ request.name }} {{ request.last_name }}</span>
                <span class="user-username">@{{ request.username }}</span>
              </div>
            </td>
            <td>{{ new Date(request.created_at).toLocaleDateString() }}</td>
            <td>
              <div class="action-buttons">
                <button 
                  class="btn-table-action success" 
                  @click="openApproveModal(request)" 
                  :disabled="store.actionLoading"
                >
                  <CheckCircle2 :size="14" /> Aprobar
                </button>
                <button 
                  class="btn-table-action danger" 
                  @click="openRejectModal(request)" 
                  :disabled="store.actionLoading"
                >
                  <XCircle :size="14" /> Rechazar
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="currentRequests.length === 0 && !store.loading">
            <td colspan="4" class="empty-row">
              <ShieldAlert :size="24" />
              <p>No hay peticiones de rol pendientes.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Approve Modal -->
    <div v-if="showApproveModal" class="modal-overlay" @click.self="showApproveModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h5>Aprobar Petición</h5>
          <button class="close-btn" @click="showApproveModal = false"><X :size="18" /></button>
        </div>
        <div class="modal-body text-center" v-if="selectedRequest">
          <CheckCircle2 :size="48" class="text-success mb-3 mx-auto" />
          <p>¿Conceder permisos a <strong>{{ selectedRequest.name }} {{ selectedRequest.last_name }}</strong>?</p>
          <p class="text-muted-sm mt-2">El usuario obtendrá el rol de {{ type === 'role-courses' ? 'Creador de Cursos' : 'Herramientas de Marketing' }}.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showApproveModal = false" :disabled="store.actionLoading">Cancelar</button>
          <button class="btn-submit success" @click="confirmApprove" :disabled="store.actionLoading">
            <Loader2 v-if="store.actionLoading" :size="14" class="spinner mr-2" />
            <CheckCircle2 v-else :size="14" class="mr-2" />
            Aprobar Petición
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h5>Rechazar Petición</h5>
          <button class="close-btn" @click="showRejectModal = false"><X :size="18" /></button>
        </div>
        <div class="modal-body" v-if="selectedRequest">
          <p class="mb-3 text-sm">La petición de <strong>{{ selectedRequest.name }}</strong> será rechazada. Ingresa un motivo (opcional):</p>
          <div class="form-group">
            <label>Motivo del rechazo</label>
            <textarea 
              v-model="rejectReason" 
              class="form-input" 
              rows="4" 
              placeholder="Ej. No cumple con los requisitos mínimos..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showRejectModal = false" :disabled="store.actionLoading">Cancelar</button>
          <button class="btn-submit danger" @click="confirmReject" :disabled="store.actionLoading">
            <Loader2 v-if="store.actionLoading" :size="14" class="spinner mr-2" />
            <XCircle v-else :size="14" class="mr-2" />
            Confirmar Rechazo
          </button>
        </div>
      </div>
    </div>

    <!-- Result Modal -->
    <ModalComponent 
      v-model="showResultModal" 
      :color="resultModalData.type === 'success' ? 'success' : 'danger'"
      size="small"
    >
      <template #title>
        {{ resultModalData.title }}
      </template>
      <div class="text-center py-2">
        <CheckCircle2 v-if="resultModalData.type === 'success'" :size="48" class="text-success mb-4 mx-auto" />
        <XCircle v-else :size="48" class="text-danger mb-4 mx-auto" />
        <p class="text-lg text-main">{{ resultModalData.message }}</p>
      </div>
      <template #footer>
        <button class="btn-submit" :class="resultModalData.type === 'success' ? 'success' : 'danger'" @click="showResultModal = false">
          Entendido
        </button>
      </template>
    </ModalComponent>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useAdminRequestsStore } from '../stores/adminRequestsStore';
import { Loader2, ShieldAlert, CheckCircle2, XCircle, X } from 'lucide-vue-next';
import ModalComponent from '@/components/common/ModalComponent.vue';

const props = defineProps({
  type: String // 'role-courses' or 'role-tools'
});

const store = useAdminRequestsStore();
const showApproveModal = ref(false);
const showRejectModal = ref(false);
const showResultModal = ref(false);
const resultModalData = ref({ type: 'success', title: '', message: '' });
const selectedRequest = ref(null);
const rejectReason = ref('');

const loadData = () => {
  if (props.type === 'role-courses') {
    store.fetchRoleRequestsCourses();
  } else {
    store.fetchRoleRequestsTools();
  }
};

onMounted(() => {
  loadData();
});

watch(() => props.type, () => {
  loadData();
});

const currentRequests = computed(() => {
  return props.type === 'role-courses' ? store.roleCourseRequests : store.roleToolRequests;
});

const openApproveModal = (request) => {
  selectedRequest.value = request;
  showApproveModal.value = true;
};

const openRejectModal = (request) => {
  selectedRequest.value = request;
  rejectReason.value = '';
  showRejectModal.value = true;
};

const confirmApprove = async () => {
  if (!selectedRequest.value) return;
  const targetId = selectedRequest.value.id;
  const userName = `${selectedRequest.value.name} ${selectedRequest.value.last_name}`;
  
  try {
    if (props.type === 'role-courses') {
      await store.approveRoleRequestCourses(targetId);
    } else {
      await store.approveRoleRequestTools(targetId);
    }
    
    resultModalData.value = {
      type: 'success',
      title: '¡Aprobación Exitosa!',
      message: `Se concedieron los permisos correctamente a ${userName}.`
    };
  } catch (error) {
    resultModalData.value = {
      type: 'error',
      title: 'Error al Aprobar',
      message: `Ocurrió un error al intentar aprobar a ${userName}. ${error.response?.data?.error || error.message}`
    };
  }
  
  showApproveModal.value = false;
  selectedRequest.value = null;
  showResultModal.value = true;
};

const confirmReject = async () => {
  if (!selectedRequest.value) return;
  const targetId = selectedRequest.value.id;
  const userName = `${selectedRequest.value.name} ${selectedRequest.value.last_name}`;
  
  try {
    if (props.type === 'role-courses') {
      await store.rejectRoleRequestCourses(targetId, rejectReason.value);
    } else {
      await store.rejectRoleRequestTools(targetId, rejectReason.value);
    }
    
    resultModalData.value = {
      type: 'success',
      title: '¡Rechazo Exitoso!',
      message: `Se ha rechazado la solicitud de ${userName}.`
    };
  } catch (error) {
    resultModalData.value = {
      type: 'error',
      title: 'Error al Rechazar',
      message: `Ocurrió un error al intentar rechazar a ${userName}. ${error.response?.data?.error || error.message}`
    };
  }
  
  showRejectModal.value = false;
  selectedRequest.value = null;
  rejectReason.value = '';
  showResultModal.value = true;
};
</script>

<style scoped>
.admin-tab-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-bold);
  margin: 0;
}

.spinner {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}

.error-banner {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 0.875rem;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
}

.table-custom {
  width: 100%;
  border-collapse: collapse;
}

.table-custom th, .table-custom td {
  text-align: left !important;
}

.table-custom th {
  padding: 12px 16px;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.02);
}

.table-custom td {
  padding: 16px;
  font-size: 0.875rem;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.table-custom tbody tr:hover {
  background: rgba(0, 0, 0, 0.02);
}

.font-weight-bolder {
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-weight: 600;
  color: var(--text-bold);
}
.user-username {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-table-action {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.btn-table-action.success {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.btn-table-action.success:hover:not(:disabled) {
  background-color: #10b981;
  color: white;
}
.btn-table-action.danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.btn-table-action.danger:hover:not(:disabled) {
  background-color: #ef4444;
  color: white;
}
.btn-table-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-row {
  text-align: center;
  padding: 3rem 1rem !important;
  color: var(--text-muted);
}
.empty-row p { margin-top: 0.5rem; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: var(--bg-main);
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h5 { margin: 0; font-weight: 600; font-size: 1rem; color: var(--text-bold); }
.close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }
.close-btn:hover { color: var(--text-main); }

.modal-body { padding: 1.5rem; }
.text-success { color: #10b981; }
.text-muted-sm { font-size: 0.85rem; color: var(--text-muted); }
.text-sm { font-size: 0.875rem; color: var(--text-main); }
.mb-3 { margin-bottom: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.mx-auto { margin-left: auto; margin-right: auto; }

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-bold);
  margin-bottom: 0.5rem;
}
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: rgba(0,0,0,0.02);
  color: var(--text-main);
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
}
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: var(--bg-main);
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.02);
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.btn-cancel:hover { background: var(--border-color); }

.btn-submit {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  color: white;
}
.btn-submit.success { background: #10b981; }
.btn-submit.success:hover:not(:disabled) { background: #059669; }
.btn-submit.danger { background: #ef4444; }
.btn-submit.danger:hover:not(:disabled) { background: #dc2626; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.mr-2 { margin-right: 0.5rem; }
</style>
