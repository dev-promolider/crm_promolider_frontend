<template>
  <section class="qcd-view">
    <!-- Loading -->
    <div v-if="store.loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando categoría...</p>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="error-banner">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ store.error }}
    </div>

    <template v-else-if="store.currentCategory">
      <!-- Header -->
      <div class="card qcd-header-card">
        <div class="qcd-header-inner">
          <div>
            <button class="qcd-back" @click="goBack">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Categorías
            </button>
            <h4 class="qcd-title">{{ store.currentCategory.name }}</h4>
            <p v-if="store.currentCategory.description" class="qcd-desc">{{ store.currentCategory.description }}</p>
            <div class="qcd-meta">
              <span class="badge" :class="store.currentCategory.is_active ? 'badge-active' : 'badge-inactive'">
                {{ store.currentCategory.is_active ? 'Activo' : 'Inactivo' }}
              </span>
              <span class="qcd-count">{{ store.questions.length }} pregunta{{ store.questions.length !== 1 ? 's' : '' }}</span>
            </div>
          </div>
          <button class="btn-primary" @click="addQuestion">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Nueva pregunta
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card qcd-filters-card">
        <div class="qcd-filters-inner">
          <div class="qcd-filter-group">
            <label class="qcd-field-label">Dificultad</label>
            <select v-model="filters.difficulty" @change="applyFilters" class="form-select">
              <option value="">Todas las dificultades</option>
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="hard">Difícil</option>
            </select>
          </div>
          <div class="qcd-filter-group">
            <label class="qcd-field-label">Estado</label>
            <select v-model="filters.status" @change="applyFilters" class="form-select">
              <option value="">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Questions List -->
      <div v-if="store.questions.length > 0" class="qcd-list">
        <div v-for="q in store.questions" :key="q.id" class="card qcd-question-card" :class="{ 'is-inactive': !q.is_active }">
          <div class="qcd-q-header">
            <div class="qcd-q-info">
              <h5 class="qcd-q-title">{{ q.title }}</h5>
              <span v-if="!q.is_active" class="badge badge-inactive qcd-q-inactive-badge">Inactivo</span>
            </div>
            <div class="qcd-q-badges">
              <span class="qcd-badge" :class="'qcd-badge--' + q.difficulty">{{ difficultyLabel(q.difficulty) }}</span>
              <span class="qcd-badge" :class="'qcd-badge--status-' + q.status">{{ statusLabel(q.status) }}</span>
            </div>
          </div>

          <p v-if="q.body" class="qcd-q-body">{{ q.body }}</p>

          <div v-if="q.options && q.options.length > 0" class="qcd-options">
            <div v-for="opt in q.options" :key="opt.id" class="qcd-option" :class="{ 'is-correct': opt.is_correct }">
              <span class="qcd-opt-label">{{ opt.label }}.</span>
              <span class="qcd-opt-text">{{ opt.text }}</span>
              <svg v-if="opt.is_correct" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="qcd-correct-icon"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>

          <div class="qcd-q-footer">
            <div class="qcd-q-meta">
              <svg v-if="q.time_limit" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="qcd-meta-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span v-if="q.time_limit">{{ q.time_limit }}s</span>
            </div>
            <div class="qcd-q-actions">
              <button class="qcd-btn qcd-btn--edit" @click="editQuestion(q)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar
              </button>
              <button class="qcd-btn qcd-btn--delete" @click="deleteQuestion(q)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p class="empty-text">No hay preguntas en esta categoría</p>
        <button class="btn-secondary" @click="addQuestion">Crea la primera pregunta</button>
      </div>
    </template>

    <!-- Not found -->
    <div v-else class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p class="empty-text">Categoría no encontrada</p>
      <button class="btn-secondary" @click="goBack">Volver a categorías</button>
    </div>

    <!-- Confirm Modal & Toast -->
    <ConfirmModal
      :visible="confirm.showConfirm.value"
      :title="confirm.confirmData.value.title"
      :message="confirm.confirmData.value.message"
      :confirm-text="confirm.confirmData.value.confirmText"
      :type="confirm.confirmData.value.type"
      :loading="confirm.confirmLoading.value"
      @confirm="confirm.onConfirm"
      @cancel="confirm.onCancel"
    />
    <ToastNotification
      :toast="toastAlert.toast.value"
      @close="toastAlert.dismiss"
    />
  </section>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionCategoriesStore } from '../stores/questionCategoriesStore'
import ConfirmModal from '../components/ConfirmModal.vue'
import ToastNotification from '../components/ToastNotification.vue'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'

export default {
  name: 'QuestionCategoryDetailView',
  components: { ConfirmModal, ToastNotification },
  setup() {
    const store = useQuestionCategoriesStore()
    const route = useRoute()
    const router = useRouter()
    const filters = ref({ difficulty: '', status: '' })
    const confirm = useConfirm()
    const toastAlert = useToast()

    onMounted(() => {
      loadData()
    })

    async function loadData() {
      await store.fetchCategory(route.params.id)
    }

    function goBack() {
      router.push({ name: 'marketing-question-categories' })
    }

    function applyFilters() {
      const params = {}
      if (filters.value.difficulty) params.difficulty = filters.value.difficulty
      if (filters.value.status) params.status = filters.value.status
      store.fetchQuestions(route.params.id, params)
    }

    function addQuestion() {
      router.push({ name: 'marketing-question-create', params: { categoryId: route.params.id } })
    }

    function editQuestion(q) {
      router.push({ name: 'marketing-question-edit', params: { categoryId: route.params.id, questionId: q.id } })
    }

    async function deleteQuestion(q) {
      const ok = await confirm.show({
        title: 'Eliminar pregunta',
        message: '¿Eliminar esta pregunta? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        type: 'danger',
      })
      if (!ok) return
      await store.deleteQuestion(route.params.id, q.id)
      toastAlert.show('Eliminada', 'Pregunta eliminada correctamente', 'success')
    }

    function difficultyLabel(d) {
      return { easy: 'Fácil', medium: 'Media', hard: 'Difícil' }[d] || d
    }

    function statusLabel(s) {
      return { draft: 'Borrador', published: 'Publicado', archived: 'Archivado' }[s] || s
    }

    return {
      store, filters, goBack, applyFilters, addQuestion, editQuestion,
      deleteQuestion, difficultyLabel, statusLabel,
      confirm, toastAlert,
    }
  }
}
</script>

<style scoped>
.qcd-view {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── Loading ─── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  gap: 12px;
  color: var(--text-muted);
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Error ─── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: var(--danger-color);
  font-size: 13px;
  font-weight: 500;
}

/* ─── Header Card ─── */
.qcd-header-card {
  margin-bottom: 16px;
}
.qcd-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}
.qcd-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  margin-bottom: 6px;
  transition: opacity 0.2s;
}
.qcd-back:hover {
  opacity: 0.8;
}
.qcd-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-bold);
  margin: 0 0 4px 0;
}
.qcd-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 10px 0;
  line-height: 1.4;
}
.qcd-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.qcd-count {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  padding: 3px 10px;
  background: var(--bg-main);
  border-radius: 20px;
}

/* ─── Buttons ─── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 214, 0, 0.25);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(24, 214, 0, 0.04);
}

/* ─── Badges ─── */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}
.badge-active {
  background: rgba(24, 214, 0, 0.12);
  color: #166534;
}
.badge-inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #991b1b;
}
body.dark-theme .badge-active {
  background: rgba(24, 214, 0, 0.2);
  color: #4ade80;
}
body.dark-theme .badge-inactive {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* ─── Filters Card ─── */
.qcd-filters-card {
  margin-bottom: 16px;
}
.qcd-filters-inner {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.qcd-filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 200px;
}
.qcd-field-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}
.form-select {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  background: var(--card-bg);
  color: var(--text-main);
  cursor: pointer;
  transition: border-color 0.2s;
}
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* ─── Questions List ─── */
.qcd-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.qcd-question-card {
  transition: all 0.2s ease;
}
.qcd-question-card:hover {
  border-color: rgba(24, 214, 0, 0.2);
}
.qcd-question-card.is-inactive {
  opacity: 0.55;
}

/* ─── Question Header ─── */
.qcd-q-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.qcd-q-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.qcd-q-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-bold);
  margin: 0;
}
.qcd-q-inactive-badge {
  font-size: 0.65rem;
}

/* ─── Badges ─── */
.qcd-q-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.qcd-badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.qcd-badge--easy { background: rgba(24, 214, 0, 0.12); color: #166534; }
.qcd-badge--medium { background: rgba(245, 158, 11, 0.12); color: #92400e; }
.qcd-badge--hard { background: rgba(239, 68, 68, 0.1); color: #991b1b; }
.qcd-badge--status-draft { background: rgba(148, 163, 184, 0.15); color: #64748b; }
.qcd-badge--status-published { background: rgba(59, 130, 246, 0.1); color: #1e40af; }
.qcd-badge--status-archived { background: rgba(148, 163, 184, 0.1); color: #6b7280; }

body.dark-theme .qcd-badge--easy { background: rgba(24, 214, 0, 0.2); color: #4ade80; }
body.dark-theme .qcd-badge--medium { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
body.dark-theme .qcd-badge--hard { background: rgba(239, 68, 68, 0.2); color: #f87171; }
body.dark-theme .qcd-badge--status-draft { background: rgba(148, 163, 184, 0.2); color: #94a3b8; }
body.dark-theme .qcd-badge--status-published { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
body.dark-theme .qcd-badge--status-archived { background: rgba(148, 163, 184, 0.15); color: #9ca3af; }

/* ─── Question Body ─── */
.qcd-q-body {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

/* ─── Options ─── */
.qcd-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.qcd-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-main);
  transition: all 0.2s;
}
.qcd-option.is-correct {
  background: rgba(24, 214, 0, 0.06);
  border-color: rgba(24, 214, 0, 0.3);
}
.qcd-opt-label {
  font-weight: 700;
  color: var(--text-muted);
}
.qcd-opt-text {
  color: var(--text-main);
}
.qcd-correct-icon {
  color: #16a34a;
  flex-shrink: 0;
}

/* ─── Question Footer ─── */
.qcd-q-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}
.qcd-q-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-light);
}
.qcd-meta-icon {
  color: var(--text-muted);
}
.qcd-q-actions {
  display: flex;
  gap: 6px;
}
.qcd-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-main);
}
.qcd-btn--edit:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(24, 214, 0, 0.04);
}
.qcd-btn--delete:hover {
  border-color: var(--danger-color);
  color: var(--danger-color);
  background: rgba(239, 68, 68, 0.04);
}

/* ─── Empty State ─── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  gap: 8px;
}
.empty-icon { opacity: 0.3; color: var(--text-muted); }
.empty-text { color: var(--text-muted); font-size: 14px; font-weight: 500; margin: 0; }

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .qcd-header-inner {
    flex-direction: column;
  }
  .qcd-filters-inner {
    flex-direction: column;
  }
  .qcd-q-header {
    flex-direction: column;
  }
  .qcd-q-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
