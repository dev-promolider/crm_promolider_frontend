<template>
  <div class="category-detail">
    <div v-if="store.loading" class="loading">Cargando...</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>

    <template v-else-if="store.currentCategory">
      <div class="page-header">
        <div>
          <button class="btn-back" @click="goBack">&larr; Categorías</button>
          <h1>{{ store.currentCategory.name }}</h1>
          <p v-if="store.currentCategory.description" class="desc">{{ store.currentCategory.description }}</p>
          <span :class="store.currentCategory.is_active ? 'badge-active' : 'badge-inactive'">
            {{ store.currentCategory.is_active ? 'Activo' : 'Inactivo' }}
          </span>
          <span class="count-badge">{{ store.questions.length }} preguntas</span>
        </div>
        <button class="btn-primary" @click="addQuestion">+ Nueva Pregunta</button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <select v-model="filters.difficulty" @change="applyFilters">
          <option value="">Todas las dificultades</option>
          <option value="easy">Fácil</option>
          <option value="medium">Media</option>
          <option value="hard">Difícil</option>
        </select>
        <select v-model="filters.status" @change="applyFilters">
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="archived">Archivado</option>
        </select>
      </div>

      <!-- Questions List -->
      <div v-if="store.questions.length" class="questions-list">
        <div v-for="q in store.questions" :key="q.id" class="question-card" :class="{ inactive: !q.is_active }">
          <div class="q-header">
            <h3>{{ q.title }}</h3>
            <div class="q-badges">
              <span :class="'diff-' + q.difficulty">{{ difficultyLabel(q.difficulty) }}</span>
              <span :class="'status-' + q.status">{{ statusLabel(q.status) }}</span>
              <span v-if="!q.is_active" class="badge-inactive">Inactivo</span>
            </div>
          </div>
          <p v-if="q.body" class="q-body">{{ q.body }}</p>
          <div v-if="q.options && q.options.length" class="q-options">
            <div v-for="opt in q.options" :key="opt.id" class="option" :class="{ correct: opt.is_correct }">
              <span class="opt-label">{{ opt.label }}.</span>
              <span>{{ opt.text }}</span>
              <span v-if="opt.is_correct" class="correct-mark">&#10003;</span>
            </div>
          </div>
          <div class="q-meta">
            <span v-if="q.time_limit">Tiempo: {{ q.time_limit }}s</span>
          </div>
          <div class="q-actions">
            <button class="btn-sm btn-secondary" @click="editQuestion(q)">Editar</button>
            <button class="btn-sm btn-danger" @click="deleteQuestion(q)">Eliminar</button>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        No hay preguntas en esta categoría. Crea la primera.
      </div>
    </template>

    <div v-else class="empty">Categoría no encontrada.</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionCategoriesStore } from '../stores/questionCategoriesStore'

export default {
  name: 'QuestionCategoryDetailView',
  setup() {
    const store = useQuestionCategoriesStore()
    const route = useRoute()
    const router = useRouter()
    const filters = ref({ difficulty: '', status: '' })

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
      if (confirm('Eliminar esta pregunta?')) {
        await store.deleteQuestion(route.params.id, q.id)
      }
    }

    function difficultyLabel(d) {
      return { easy: 'Fácil', medium: 'Media', hard: 'Difícil' }[d] || d
    }

    function statusLabel(s) {
      return { draft: 'Borrador', published: 'Publicado', archived: 'Archivado' }[s] || s
    }

    return { store, filters, goBack, applyFilters, addQuestion, editQuestion, deleteQuestion, difficultyLabel, statusLabel }
  }
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.btn-back { background: none; border: none; color: #2563eb; cursor: pointer; padding: 0; font-size: 0.9rem; margin-bottom: 0.5rem; }
.desc { color: #64748b; margin: 0.25rem 0; }
.badge-active { background: #dcfce7; color: #166534; padding: 0.15rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; }
.badge-inactive { background: #fef2f2; color: #991b1b; padding: 0.15rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; }
.count-badge { background: #e0e7ff; color: #4338ca; padding: 0.15rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; margin-left: 0.5rem; }
.filters { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
.filters select { padding: 0.4rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; }
.questions-list { display: flex; flex-direction: column; gap: 1rem; }
.question-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; }
.question-card.inactive { opacity: 0.6; }
.q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.q-header h3 { margin: 0; font-size: 1rem; }
.q-badges { display: flex; gap: 0.4rem; }
.q-badges span { padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.7rem; font-weight: 500; }
.diff-easy { background: #dcfce7; color: #166534; }
.diff-medium { background: #fef9c3; color: #854d0e; }
.diff-hard { background: #fef2f2; color: #991b1b; }
.status-draft { background: #f1f5f9; color: #475569; }
.status-published { background: #dbeafe; color: #1e40af; }
.status-archived { background: #f3f4f6; color: #6b7280; }
.q-body { color: #64748b; font-size: 0.875rem; margin: 0 0 0.75rem; }
.q-options { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
.option { background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.85rem; }
.option.correct { background: #dcfce7; border-color: #86efac; }
.correct-mark { color: #16a34a; margin-left: 0.25rem; font-weight: bold; }
.opt-label { font-weight: 600; color: #64748b; }
.q-meta { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.75rem; }
.q-actions { display: flex; gap: 0.5rem; }
.btn-sm { padding: 0.3rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 4px; cursor: pointer; font-size: 0.8rem; background: #fff; }
.btn-secondary { background: #f1f5f9; }
.btn-danger { background: #ef4444; color: #fff; border-color: #ef4444; }
.btn-primary { background: #2563eb; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.loading, .empty, .error { padding: 2rem; text-align: center; color: #64748b; }
.error { color: #ef4444; }
</style>
