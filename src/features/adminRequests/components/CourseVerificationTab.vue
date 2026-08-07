<template>
  <div class="admin-tab-container">
    <div class="table-header">
      <h3>Verificación de Infoproductos</h3>
      <Loader2 v-if="store.loading" :size="18" class="spinner" />
    </div>

    <div v-if="store.error" class="error-banner">{{ store.error }}</div>

    <div class="table-responsive">
      <table class="table-custom">
        <thead>
          <tr>
            <th>ID Curso</th>
            <th>Título</th>
            <th>Autor</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in store.courseVerifications" :key="course.id">
            <td class="font-weight-bolder">#{{ course.id }}</td>
            <td class="font-weight-bolder">{{ course.title }}</td>
            <td>
              <div class="user-info">
                <span class="user-name">{{ course.name }} {{ course.last_name }}</span>
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  class="btn-table-action success" 
                  @click="openApproveModal(course)" 
                  :disabled="store.actionLoading"
                >
                  <CheckCircle2 :size="14" /> Aprobar
                </button>
                <button 
                  class="btn-table-action danger" 
                  @click="openRejectModal(course)" 
                  :disabled="store.actionLoading"
                >
                  <XCircle :size="14" /> Observar
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="store.courseVerifications.length === 0 && !store.loading">
            <td colspan="4" class="empty-row">
              <BookOpen :size="24" />
              <p>No hay infoproductos pendientes de verificación.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Approve Modal -->
    <div v-if="showApproveModal" class="modal-overlay" @click.self="showApproveModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h5>Aprobar Curso</h5>
          <button class="close-btn" @click="showApproveModal = false"><X :size="18" /></button>
        </div>
        <div class="modal-body text-center" v-if="selectedCourse">
          <CheckCircle2 :size="48" class="text-success mb-3 mx-auto" />
          <p>¿Aprobar el curso <strong>{{ selectedCourse.title }}</strong>?</p>
          <p class="text-muted-sm mt-2">Una vez aprobado, este curso será visible en el Marketplace para todos los usuarios.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showApproveModal = false" :disabled="store.actionLoading">Cancelar</button>
          <button class="btn-submit success" @click="confirmApprove" :disabled="store.actionLoading">
            <Loader2 v-if="store.actionLoading" :size="14" class="spinner mr-2" />
            <CheckCircle2 v-else :size="14" class="mr-2" />
            Aprobar Curso
          </button>
        </div>
      </div>
    </div>

    <!-- Reject/Observation Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h5>Enviar Observaciones</h5>
          <button class="close-btn" @click="showRejectModal = false"><X :size="18" /></button>
        </div>
        <div class="modal-body" v-if="selectedCourse">
          <p class="mb-3 text-sm">El curso <strong>{{ selectedCourse.title }}</strong> volverá a estado de edición para que el autor corrija lo siguiente:</p>
          <div class="form-group">
            <label>Observaciones</label>
            <textarea 
              v-model="observationText" 
              class="form-input" 
              rows="4" 
              placeholder="Detalla los cambios necesarios para aprobar este curso..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showRejectModal = false" :disabled="store.actionLoading">Cancelar</button>
          <button class="btn-submit danger" @click="confirmReject" :disabled="store.actionLoading || !observationText.trim()">
            <Loader2 v-if="store.actionLoading" :size="14" class="spinner mr-2" />
            <XCircle v-else :size="14" class="mr-2" />
            Enviar Observaciones
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAdminRequestsStore } from '../stores/adminRequestsStore';
import { Loader2, BookOpen, CheckCircle2, XCircle, X } from 'lucide-vue-next';

const store = useAdminRequestsStore();
const showApproveModal = ref(false);
const showRejectModal = ref(false);
const selectedCourse = ref(null);
const observationText = ref('');

onMounted(() => {
  store.fetchCourseVerifications();
});

const openApproveModal = (course) => {
  selectedCourse.value = course;
  showApproveModal.value = true;
};

const openRejectModal = (course) => {
  selectedCourse.value = course;
  observationText.value = '';
  showRejectModal.value = true;
};

const confirmApprove = async () => {
  if (!selectedCourse.value) return;
  await store.approveCourseVerification(selectedCourse.value.id);
  showApproveModal.value = false;
  selectedCourse.value = null;
};

const confirmReject = async () => {
  if (!selectedCourse.value || !observationText.value.trim()) return;
  await store.rejectCourseVerification(selectedCourse.value.id, observationText.value);
  showRejectModal.value = false;
  selectedCourse.value = null;
  observationText.value = '';
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
  color: var(--text-main);
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
  background: var(--main-bg);
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
