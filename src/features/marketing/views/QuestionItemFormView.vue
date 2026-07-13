<template>
  <div class="question-form">
    <div v-if="loading && isEdit" class="loading">Cargando pregunta...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <template v-else>
      <div class="page-header">
        <button class="btn-back" @click="goBack">&larr; Volver a preguntas</button>
        <h1>{{ isEdit ? 'Editar Pregunta' : 'Nueva Pregunta' }}</h1>
      </div>

      <form @submit.prevent="submit" class="form">
        <div class="form-row">
          <div class="form-group flex-2">
            <label>Título *</label>
            <input v-model="form.title" type="text" required maxlength="255" placeholder="Ej: Cuál es la capital de Francia?" />
          </div>
          <div class="form-group">
            <label>Dificultad *</label>
            <select v-model="form.difficulty" required>
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="hard">Difícil</option>
            </select>
          </div>
          <div class="form-group">
            <label>Estado *</label>
            <select v-model="form.status" required>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Cuerpo (opcional)</label>
          <textarea v-model="form.body" maxlength="1000" placeholder="Texto adicional o explicación" rows="3"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Tiempo límite (segundos)</label>
            <input v-model.number="form.time_limit" type="number" min="5" max="600" placeholder="Ej: 30" />
          </div>
          <div class="form-group checkbox">
            <label>
              <input v-model="form.is_active" type="checkbox" />
              Activo
            </label>
          </div>
        </div>

        <!-- Options -->
        <div class="options-section">
          <h3>Opciones de respuesta (2-6)</h3>
          <div v-for="(opt, idx) in form.options" :key="idx" class="option-row">
            <span class="opt-label">{{ opt.label || String.fromCharCode(65 + idx) }}.</span>
            <input v-model="opt.text" type="text" required :placeholder="'Opción ' + String.fromCharCode(65 + idx)" />
            <label class="correct-label">
              <input v-model="opt.is_correct" type="checkbox" @change="onCorrectChange(idx)" />
              Correcta
            </label>
            <button type="button" class="btn-remove" @click="removeOption(idx)" v-if="form.options.length > 2">&times;</button>
          </div>
          <button type="button" class="btn-add" @click="addOption" v-if="form.options.length < 6">+ Agregar opción</button>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="goBack">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionCategoriesStore } from '../stores/questionCategoriesStore'

export default {
  name: 'QuestionItemFormView',
  setup() {
    const store = useQuestionCategoriesStore()
    const route = useRoute()
    const router = useRouter()

    const isEdit = computed(() => !!route.params.questionId)
    const loading = ref(false)
    const saving = ref(false)
    const error = ref(null)

    const form = ref({
      title: '',
      body: '',
      difficulty: 'medium',
      status: 'draft',
      time_limit: null,
      is_active: true,
      options: [
        { text: '', is_correct: false, label: 'A' },
        { text: '', is_correct: false, label: 'B' },
        { text: '', is_correct: false, label: 'C' },
      ],
    })

    onMounted(async () => {
      if (isEdit.value) {
        loading.value = true
        try {
          await store.fetchCategory(route.params.categoryId)
          const q = store.questions.find(x => x.id === parseInt(route.params.questionId))
          if (q) {
            form.value = {
              title: q.title || '',
              body: q.body || '',
              difficulty: q.difficulty || 'medium',
              status: q.status || 'draft',
              time_limit: q.time_limit || null,
              is_active: q.is_active ?? true,
              options: (q.options || []).length
                ? q.options.map(o => ({ text: o.text, is_correct: o.is_correct, label: o.label }))
                : form.value.options,
            }
          }
        } catch (e) {
          error.value = 'Error al cargar pregunta'
        } finally {
          loading.value = false
        }
      }
    })

    function addOption() {
      const label = String.fromCharCode(65 + form.value.options.length)
      form.value.options.push({ text: '', is_correct: false, label })
    }

    function removeOption(idx) {
      form.value.options.splice(idx, 1)
      // Update labels
      form.value.options.forEach((opt, i) => {
        opt.label = String.fromCharCode(65 + i)
      })
    }

    function onCorrectChange(changedIdx) {
      // Ensure only one correct answer by unchecking others
      form.value.options.forEach((opt, idx) => {
        if (idx !== changedIdx) opt.is_correct = false
      })
    }

    async function submit() {
      // Validate at least one correct
      if (!form.value.options.some(o => o.is_correct)) {
        error.value = 'Debe marcar al menos una opción como correcta'
        return
      }

      saving.value = true
      error.value = null
      try {
        const data = {
          title: form.value.title,
          body: form.value.body || null,
          difficulty: form.value.difficulty,
          status: form.value.status,
          time_limit: form.value.time_limit || null,
          is_active: form.value.is_active,
          options: form.value.options.map(o => ({
            text: o.text,
            is_correct: o.is_correct,
          })),
        }

        if (isEdit.value) {
          await store.updateQuestion(route.params.categoryId, route.params.questionId, data)
        } else {
          await store.createQuestion(route.params.categoryId, data)
        }
        goBack()
      } catch (e) {
        error.value = e.response?.data?.message || 'Error al guardar pregunta'
      } finally {
        saving.value = false
      }
    }

    function goBack() {
      router.push({ name: 'marketing-question-category-detail', params: { id: route.params.categoryId } })
    }

    return { form, isEdit, loading, saving, error, addOption, removeOption, onCorrectChange, submit, goBack }
  }
}
</script>

<style scoped>
.question-form { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
.page-header { margin-bottom: 1rem; }
.btn-back { background: none; border: none; color: #2563eb; cursor: pointer; padding: 0; font-size: 0.9rem; margin-bottom: 0.5rem; }
.form { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; }
.form-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 500; margin-bottom: 0.35rem; color: #334155; }
.form-group input, .form-group select, .form-group textarea {
  width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box;
}
.form-group textarea { resize: vertical; }
.form-group.checkbox label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
.flex-2 { flex: 2; }
.options-section { margin: 1.5rem 0; }
.options-section h3 { font-size: 1rem; margin-bottom: 0.75rem; }
.option-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.option-row .form-group { flex: 1; }
.option-row .btn-remove-option {
  background: #ef4444; color: white; border: none;
  padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;
  margin-top: 22px; flex-shrink: 0;
}
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem; }
.btn-cancel { background: transparent; border: 1px solid #d0d0d0; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

</style>
