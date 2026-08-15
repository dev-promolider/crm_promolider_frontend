<template>
  <div class="admin-tab-container">
    <div class="table-header">
      <h3>
        <span v-if="selectedCourseId" class="back-btn" @click="goBack" title="Volver a Cursos">
          <ArrowLeft :size="20" />
        </span>
        {{ selectedCourseId ? 'Exámenes del Curso' : 'Revisión de Exámenes' }}
      </h3>
      <Loader2 v-if="store.loading" :size="18" class="spinner" />
    </div>

    <div v-if="store.error" class="error-banner">{{ store.error }}</div>

    <!-- Master View: Cursos -->
    <div v-if="!selectedCourseId">
      <div class="marketplace-search mb-4">
        <Search :size="16" class="search-icon" />
        <input 
          type="text" 
          class="search-input" 
          v-model="searchQuery" 
          placeholder="Buscar curso..." 
        />
      </div>

      <div v-if="store.examReviewCourses.length === 0 && !store.loading" class="empty-state">
        <Monitor :size="40" class="empty-icon" />
        <p>No hay cursos con exámenes para mostrar.</p>
      </div>
      <div v-else-if="filteredCourses.length === 0 && !store.loading" class="empty-state">
        <Search :size="40" class="empty-icon" />
        <p>No se encontraron cursos con ese nombre.</p>
      </div>

      <div class="row">
        <div v-for="course in filteredCourses" :key="course.id" class="col-md-4 mb-4 grid-col">
          <div class="card c-card" @click="selectCourse(course.id)">
            <div class="c-card-img-wrapper">
              <img
                v-if="course.cover"
                :src="getS3Url(course.cover)"
                class="c-card-img"
                :alt="course.title"
                @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;"
              />
              <div v-else class="c-card-img-placeholder">
                <Monitor :size="48" style="color:#ccc" />
              </div>
            </div>
            <div class="c-card-body">
              <h5 class="c-card-title">{{ course.title }}</h5>
              <div class="c-card-stats">
                <span class="c-badge c-badge--total">{{ course.total_exams }} Exámenes</span>
                <span v-if="course.pending_exams > 0" class="c-badge c-badge--pending">{{ course.pending_exams }} Pendientes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail View: Exámenes del Curso -->
    <div v-else>
      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th>ID Examen</th>
              <th>Examen</th>
              <th>Alumno</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="review in store.selectedCourseExams" :key="review.id">
              <td class="font-weight-bolder">#{{ review.id }}</td>
              <td>{{ review.exam_title || 'N/A' }}</td>
              <td>
                <span class="user-name">{{ review.name || 'Desconocido' }} {{ review.last_name || '' }}</span>
              </td>
              <td>{{ new Date(review.created_at).toLocaleDateString() }}</td>
              <td>
                <span class="status-badge" :class="review.status ? 'graded' : 'pending'">
                  {{ review.status ? 'Calificado' : 'Pendiente' }}
                </span>
              </td>
              <td>
                <button 
                  class="btn-table-action" 
                  :class="review.status ? 'secondary' : 'primary'"
                  @click="openReviewModal(review)" 
                  :disabled="store.actionLoading || loadingDetails"
                >
                  <template v-if="review.status">
                    <Eye :size="14" /> Ver
                  </template>
                  <template v-else>
                    <Edit :size="14" /> Calificar
                  </template>
                </button>
              </td>
            </tr>
            <tr v-if="store.selectedCourseExams.length === 0 && !store.loading">
              <td colspan="6" class="empty-row">
                <CheckSquare :size="24" />
                <p>No hay exámenes para este curso.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="modal-overlay" @click.self="closeReviewModal">
      <div class="modal-card lg">
        <div class="modal-header">
          <h5>{{ selectedReview?.status ? 'Ver Examen' : 'Calificar Examen' }}: {{ selectedReview?.exam_title || 'Examen' }}</h5>
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
            <p><strong>Alumno:</strong> {{ selectedReview?.name }} {{ selectedReview?.last_name }}</p>
            <p><strong>Puntaje Máximo:</strong> {{ examDetails.exam?.max_score || 0 }}</p>
            <p v-if="selectedReview?.status"><strong>Puntaje Obtenido:</strong> {{ selectedReview?.rate || 0 }}</p>
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
                  :disabled="selectedReview?.status"
                />
              </div>
              <div class="q-grading mt-3" v-else>
                <span class="text-muted-sm">Autocalificada (Puntaje: {{ item.points_gained }})</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeReviewModal" :disabled="store.actionLoading">
            {{ selectedReview?.status ? 'Cerrar' : 'Cancelar' }}
          </button>
          <button v-if="!selectedReview?.status" class="btn-submit primary" @click="submitReview" :disabled="store.actionLoading || loadingDetails">
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
import { ref, computed, onMounted } from 'vue';
import { useAdminRequestsStore } from '../stores/adminRequestsStore';
import { Loader2, CheckSquare, Edit, X, Save, ArrowLeft, Search, Monitor, Eye } from 'lucide-vue-next';

const S3_BASE = 'https://promolider-storage-user.s3-accelerate.amazonaws.com';

function getS3Url(path) {
  if (!path) return '';
  if (path.includes('api.promolider.email')) {
    path = path.replace(/https?:\/\/api\.promolider\.email/g, '');
  }
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return S3_BASE + cleanPath;
}

const store = useAdminRequestsStore();

// Master-Detail State
const selectedCourseId = ref(null);
const searchQuery = ref('');

const showReviewModal = ref(false);
const selectedReview = ref(null);
const loadingDetails = ref(false);
const examDetails = ref(null);
const mergedQuestions = ref([]);

onMounted(() => {
  store.fetchExamReviewCourses();
});

const filteredCourses = computed(() => {
  if (!searchQuery.value) return store.examReviewCourses;
  const query = searchQuery.value.toLowerCase();
  return store.examReviewCourses.filter(course => 
    course.title?.toLowerCase().includes(query)
  );
});

const selectCourse = async (courseId) => {
  selectedCourseId.value = courseId;
  await store.fetchExamReviewsByCourse(courseId);
};

const goBack = () => {
  selectedCourseId.value = null;
  store.selectedCourseExams = []; // Clear current exams
  store.fetchExamReviewCourses(); // Refresh courses counts
};

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
    // Refresh current course exams list
    if (selectedCourseId.value) {
      await store.fetchExamReviewsByCourse(selectedCourseId.value);
    }
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn {
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
  color: var(--text-muted);
}
.back-btn:hover {
  background-color: rgba(0,0,0,0.05);
  color: var(--text-main);
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

/* Master View Styles */
.marketplace-search {
  position: relative; 
  max-width: 360px;
}
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-light); pointer-events: none; }
.search-input {
  width: 100%; padding: 8px 12px 8px 38px;
  border: 1px solid var(--border-color); border-radius: 8px;
  font-size: 13px; background: var(--card-bg); color: var(--text-main);
  transition: border-color 0.2s;
}
.search-input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24,214,0,0.08); }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px; color: var(--text-muted); gap: 10px; }
.empty-icon { opacity: 0.4; }

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -12px;
}
.col-md-4 {
  flex: 0 0 33.333%;
  max-width: 33.333%;
  padding: 0 12px;
  display: flex;
}
@media (max-width: 992px) {
  .col-md-4 { flex: 0 0 50%; max-width: 50%; }
}
@media (max-width: 768px) {
  .col-md-4 { flex: 0 0 100%; max-width: 100%; }
}

.c-card {
  cursor: pointer;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
}
.c-card:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  transform: translateY(-4px);
  border-color: rgba(24, 214, 0, 0.2);
}
.c-card:hover .c-card-img {
  transform: scale(1.05);
}
.c-card-img-wrapper {
  position: relative;
  overflow: hidden;
  height: 180px;
  background: var(--bg-main);
}
.c-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.4s ease;
}
.c-card-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-main);
}
.c-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  gap: 8px;
}
.c-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-bold);
  line-height: 1.3;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.c-card-stats {
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.c-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
}
.c-badge--total {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
.c-badge--pending {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Detail View Styles */
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

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}
.status-badge.graded { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

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
.btn-table-action.secondary {
  background-color: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}
.btn-table-action.secondary:hover:not(:disabled) {
  background-color: #4b5563;
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
.form-input:disabled { opacity: 0.7; cursor: not-allowed; }

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
.mb-4 { margin-bottom: 1.5rem; }
.text-muted-sm { font-size: 0.85rem; color: var(--text-muted); }
</style>
