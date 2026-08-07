<template>
  <div class="admin-tab-container">
    <div class="table-header">
      <h3>Nuevos Usuarios Pendientes de Verificación</h3>
      <Loader2 v-if="store.loading" :size="18" class="spinner" />
    </div>

    <div v-if="store.error" class="error-banner">{{ store.error }}</div>

    <div class="table-responsive">
      <table class="table-custom">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Completo</th>
            <th>Email</th>
            <th>País</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in store.newUsers" :key="user.id">
            <td class="font-weight-bolder">#{{ user.id }}</td>
            <td>
              <div class="user-info">
                <span class="user-name">{{ user.name }} {{ user.last_name }}</span>
                <span class="user-username">@{{ user.username }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ user.country || 'N/A' }}</td>
            <td>
              <button 
                class="btn-table-action success" 
                @click="openApproveModal(user)" 
                :disabled="store.actionLoading"
              >
                <CheckCircle2 :size="14" /> Verificar
              </button>
            </td>
          </tr>
          <tr v-if="store.newUsers.length === 0 && !store.loading">
            <td colspan="5" class="empty-row">
              <Users :size="24" />
              <p>No hay nuevos usuarios pendientes de verificación.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Approve Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h5>Verificar Usuario</h5>
          <button class="close-btn" @click="showModal = false"><X :size="18" /></button>
        </div>
        <div class="modal-body text-center" v-if="selectedUser">
          <CheckCircle2 :size="48" class="text-success mb-3 mx-auto" />
          <p>¿Estás seguro de verificar a <strong>{{ selectedUser.name }} {{ selectedUser.last_name }}</strong> (@{{ selectedUser.username }})?</p>
          <p class="text-muted-sm mt-2">Al verificar a este usuario, podrá acceder a todas las funcionalidades del sistema según su rol.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showModal = false" :disabled="store.actionLoading">Cancelar</button>
          <button class="btn-submit success" @click="confirmApprove" :disabled="store.actionLoading">
            <Loader2 v-if="store.actionLoading" :size="14" class="spinner mr-2" />
            <CheckCircle2 v-else :size="14" class="mr-2" />
            Confirmar Verificación
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAdminRequestsStore } from '../stores/adminRequestsStore';
import { Loader2, Users, CheckCircle2, X } from 'lucide-vue-next';

const store = useAdminRequestsStore();
const showModal = ref(false);
const selectedUser = ref(null);

onMounted(() => {
  store.fetchNewUsers();
});

const openApproveModal = (user) => {
  selectedUser.value = user;
  showModal.value = true;
};

const confirmApprove = async () => {
  if (!selectedUser.value) return;
  const payload = {
    id: selectedUser.value.id,
    status: 2,
    id_referrer_sponsor: selectedUser.value.id_referrer_sponsor || 1 // Enviar el ID del sponsor si existe, por defecto 1 si no
  };
  await store.approveNewUser(payload);
  showModal.value = false;
  selectedUser.value = null;
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
  text-align: left;
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
  max-width: 400px;
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
.mb-3 { margin-bottom: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.mx-auto { margin-left: auto; margin-right: auto; }

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
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.mr-2 { margin-right: 0.5rem; }
</style>
