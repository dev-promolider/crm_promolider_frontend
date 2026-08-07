<template>
  <div class="admin-tab-container">
    <div class="table-header">
      <h3>Revisión de Exámenes Pendientes</h3>
      <Loader2 v-if="store.loading" :size="18" class="spinner" />
    </div>

    <div v-if="store.error" class="error-banner">{{ store.error }}</div>

    <div class="table-responsive">
      <table class="table-custom">
        <thead>
          <tr>
            <th>ID Examen</th>
            <th>Alumno</th>
            <th>Curso</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="review in store.examReviews" :key="review.id">
            <td class="font-weight-bolder">#{{ review.id }}</td>
            <td>
              <span class="user-name">{{ review.user?.name || review.name || 'Desconocido' }} {{ review.user?.last_name || review.last_name || '' }}</span>
            </td>
            <td>{{ review.exam?.course?.title || review.course_title || 'N/A' }}</td>
            <td>{{ new Date(review.created_at).toLocaleDateString() }}</td>
            <td>
              <button 
                class="btn-table-action primary" 
                @click="openReviewModal(review)" 
                :disabled="store.actionLoading || loadingDetails"
              >
                <Edit :size="14" /> Calificar
              </button>
            </td>
          </tr>
          <tr v-if="store.examReviews.length === 0 && !store.loading">
            <td colspan="5" class="empty-row">
              <CheckSquare :size="24" />
              <p>No hay exámenes pendientes de calificación manual.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="modal-overlay" @click.self="closeReviewModal">
      <div class="modal-card lg">
        <div class="modal-header">
          <h5>Calificar Examen: {{ selectedReview?.exam?.course?.title || 'Curso' }}</h5>
          <button class="close-btn" @click="closeReviewModal"><X :size="18" /></button>
        </div>
        
        <div class="modal-body" v-if="loadingDetails">
          <div class="flex-center p-4">
            <Loader2 :size="32" class="spinner text-primary" />
            <span class="ml-2">Cargando detalles del examen...</span>
          </div>
        </div>
        
        <div class="modal-body" v-else-if="examDetails">
          <div class="exam-info mb-3">
            <p><strong>Alumno:</strong> {{ selectedReview?.user?.name || selectedReview?.name }}</p>
            <p><strong>Puntaje Máximo:</strong> {{ examDetails.exam?.max_score || 0 }}</p>
          </div>
          
          <div class="questions-list">
            <div v-for="(item, index) in mergedQuestions" :key="index" class="question-card">
              <div class="question-header">
                <span class="q-num">Pregunta {{ index + 1 }}</span>
                <span class="q-points">({{ item.points }} pts)</span>
              </div>
              <p class="q-title">{{ item.title }}</p>
              
              <div class="q-answer mt-2">
                <strong>Respuesta del alumno:</strong>
                <div class="answer-box">
                  {{ item.answer || 'Sin respuesta' }}
                </div>
              </div>
              
              <div class="q-grading mt-3" v-if="item.question_type_id === 3 || item.question_type_id === '3'">
                <label>Puntaje Asignado:</label>
                <input 
                  type="number" 
                  v-model="item.assigned_score" 
                  class="form-input grade-input" 
                  min="0" 
                  :max="item.points"
                  step="0.5"
                />
              </div>
              <div class="q-grading mt-3" v-else>
                <span class="text-muted-sm">Autocalificada (Puntaje: {{ item.points_gained }})</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeReviewModal" :disabled="store.actionLoading">Cancelar</button>
          <button class="btn-submit primary" @click="submitReview" :disabled="store.actionLoading || loadingDetails">
            <Loader2 v-if="store.actionLoading" :size="14" class="spinner mr-2" />
            <Save v-else :size="14" class="mr-2" />
            Guardar Calificaciones
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAdminRequestsStore } from '../stores/adminRequestsStore';
import { Loader2, CheckSquare, Edit, X, Save } from 'lucide-vue-next';

const store = useAdminRequestsStore();
const showReviewModal = ref(false);
const selectedReview = ref(null);
const loadingDetails = ref(false);
const examDetails = ref(null);
const mergedQuestions = ref([]);

onMounted(() => {
  store.fetchExamReviews();
});

const openReviewModal = async (review) => {
  selectedReview.value = review;
  showReviewModal.value = true;
  loadingDetails.value = true;
  examDetails.value = null;
  mergedQuestions.value = [];
  
  try {
    const data = await store.fetchExamReviewDetails(review.id);
    examDetails.value = data;
    
    // Merge questions and details based on index
    if (data.questions && data.details) {
      mergedQuestions.value = data.questions.map((q, idx) => {
        const detail = data.details[idx] || {};
        return {
          ...q,
          answer: detail.options_selected,
          points_gained: detail.points_gained,
          // Initialize assigned_score for open questions (type 3), otherwise null
          assigned_score: (q.question_type_id == 3) ? (detail.points_gained || 0) : null
        };
      });
    }
  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar los detalles del examen.');
  } finally {
    loadingDetails.value = false;
  }
};

const closeReviewModal = () => {
  showReviewModal.value = false;
  selectedReview.value = null;
  examDetails.value = null;
};

const submitReview = async () => {
  if (!selectedReview.value) return;
  
  // Format the rates array as comma-separated string
  // If it's an open question, we pass the assigned_score, else "null"
  const ratesArray = mergedQuestions.value.map(q => {
    if (q.question_type_id == 3) {
      return q.assigned_score !== null ? String(q.assigned_score) : "0";
    }
    return "null";
  });
  
  const payload = {
    exam_id: selectedReview.value.id, // backend expects exam_id to be user_exam_id
    rate: ratesArray.join(',')
  };
  
  try {
    await store.submitExamReview(payload);
    closeReviewModal();
  } catch (e) {
    alert('Error al guardar calificaciones');
  }
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

.user-name {
  font-weight: 600;
  color: var(--text-bold);
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
.btn-table-action.primary {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
.btn-table-action.primary:hover:not(:disabled) {
  background-color: #3b82f6;
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
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.modal-card.lg {
  max-width: 700px;
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

.modal-body { 
  padding: 1.5rem; 
  overflow-y: auto;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.text-primary { color: #3b82f6; }
.ml-2 { margin-left: 0.5rem; }

.exam-info {
  background: rgba(0,0,0,0.02);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-main);
}
.exam-info p { margin-bottom: 0.25rem; }
.exam-info p:last-child { margin-bottom: 0; }

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-card {
  border: 1px solid var(--border-color);
  padding: 1rem;
  border-radius: 8px;
  background: var(--card-bg);
}
.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.q-num { font-weight: 700; color: var(--text-bold); font-size: 0.875rem; }
.q-points { color: var(--text-muted); font-size: 0.75rem; }
.q-title { font-weight: 500; font-size: 0.875rem; color: var(--text-main); }

.answer-box {
  background: rgba(0,0,0,0.03);
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-main);
  margin-top: 0.25rem;
  white-space: pre-wrap;
}

.q-grading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.q-grading label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-bold);
}
.grade-input {
  width: 80px;
}
.form-input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: rgba(0,0,0,0.02);
  color: var(--text-main);
  font-size: 0.875rem;
}
.form-input:focus { outline: none; border-color: #3b82f6; }

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
.btn-submit.primary { background: #3b82f6; }
.btn-submit.primary:hover:not(:disabled) { background: #2563eb; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.mr-2 { margin-right: 0.5rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
.mb-3 { margin-bottom: 1rem; }
.text-muted-sm { font-size: 0.85rem; color: var(--text-muted); }
</style>
