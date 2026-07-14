<template>
  <section class="qif-view">
    <!-- Loading -->
    <div v-if="loading && isEdit" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando pregunta...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-banner">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ error }}
    </div>

    <template v-else>
      <!-- Header -->
      <div class="card qif-header-card">
        <div class="qif-header-inner">
          <div>
            <button class="qif-back" @click="goBack">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Volver a preguntas
            </button>
            <h4 class="qif-title">{{ isEdit ? 'Editar Pregunta' : 'Nueva Pregunta' }}</h4>
            <p class="qif-subtitle">{{ isEdit ? 'Modifica los datos de la pregunta' : 'Agrega una nueva pregunta con sus opciones de respuesta' }}</p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="card qif-form-card">
        <form @submit.prevent="submit" class="qif-form">
          <!-- Row: Title + Difficulty + Status -->
          <div class="qif-row">
            <div class="qif-field qif-field--grow">
              <label class="qif-label">Título <span class="qif-required">*</span></label>
              <div class="qif-input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="qif-input-icon"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <input v-model="form.title" type="text" required maxlength="255" class="qif-input" placeholder="Ej: ¿Cuál es la capital de Francia?" />
              </div>
            </div>
            <div class="qif-field">
              <label class="qif-label">Dificultad <span class="qif-required">*</span></label>
              <select v-model="form.difficulty" required class="qif-select">
                <option value="easy">Fácil</option>
                <option value="medium">Media</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
            <div class="qif-field">
              <label class="qif-label">Estado <span class="qif-required">*</span></label>
              <select v-model="form.status" required class="qif-select">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </div>

          <!-- Body -->
          <div class="qif-field">
            <label class="qif-label">Cuerpo (opcional)</label>
            <textarea v-model="form.body" maxlength="1000" class="qif-textarea" placeholder="Texto adicional o explicación de la pregunta" rows="3"></textarea>
          </div>

          <!-- Row: Time Limit + Active Toggle -->
          <div class="qif-row">
            <div class="qif-field">
              <label class="qif-label">Tiempo límite</label>
              <div class="qif-input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="qif-input-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <input v-model.number="form.time_limit" type="number" min="5" max="600" class="qif-input" placeholder="Ej: 30" />
              </div>
              <span class="qif-hint">En segundos (5-600)</span>
            </div>
            <div class="qif-field qif-field--toggle">
              <div class="qif-toggle-wrapper">
                <button type="button" class="qif-toggle" :class="{ 'is-active': form.is_active }" @click="form.is_active = !form.is_active" role="switch">
                  <span class="qif-toggle-knob"></span>
                </button>
                <label class="qif-toggle-label">Pregunta activa</label>
              </div>
            </div>
          </div>

          <!-- Options Section -->
          <div class="qif-options-section">
            <div class="qif-options-header">
              <div class="qif-options-title-group">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <h5 class="qif-options-title">Opciones de respuesta</h5>
              </div>
              <span class="qif-options-count">{{ form.options.length }} / 6</span>
            </div>
            <p class="qif-options-desc">Define las opciones y marca la respuesta correcta (2-6 opciones)</p>

            <div v-for="(opt, idx) in form.options" :key="idx" class="qif-option-row" :class="{ 'is-correct': opt.is_correct }">
              <div class="qif-option-order">
                <span class="qif-option-label">{{ opt.label || String.fromCharCode(65 + idx) }}</span>
              </div>
              <div class="qif-option-input-wrap">
                <input v-model="opt.text" type="text" required :placeholder="'Opción ' + String.fromCharCode(65 + idx)" class="qif-option-input" />
              </div>
              <button type="button" class="qif-option-correct" :class="{ 'is-correct': opt.is_correct }" @click="onCorrectChange(idx)" :title="'Marcar como correcta'">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
              <button v-if="form.options.length > 2" type="button" class="qif-option-remove" @click="removeOption(idx)" title="Eliminar opción">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <button v-if="form.options.length < 6" type="button" class="qif-option-add" @click="addOption">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agregar opción
            </button>
          </div>

          <!-- Actions -->
          <div class="qif-actions">
            <button type="button" class="btn-secondary" @click="goBack">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <svg v-if="!saving" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <div v-else class="spinner-inline"></div>
              {{ saving ? 'Guardando...' : (isEdit ? 'Actualizar pregunta' : 'Crear pregunta') }}
            </button>
          </div>
        </form>
      </div>
    </template>
  </section>
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
      form.value.options.forEach((opt, i) => {
        opt.label = String.fromCharCode(65 + i)
      })
    }

    function onCorrectChange(changedIdx) {
      const clicked = form.value.options[changedIdx]
      if (!clicked) return
      // Toggle: if already correct, uncheck; otherwise mark as correct and uncheck others
      if (clicked.is_correct) {
        clicked.is_correct = false
      } else {
        form.value.options.forEach((opt, idx) => {
          opt.is_correct = idx === changedIdx
        })
      }
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
.qif-view {
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
  margin-bottom: 16px;
}

/* ─── Header ─── */
.qif-header-card {
  margin-bottom: 16px;
}
.qif-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.qif-back {
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
.qif-back:hover { opacity: 0.8; }
.qif-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-bold);
  margin: 0 0 2px 0;
}
.qif-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

/* ─── Form ─── */
.qif-form-card {
  overflow: hidden;
}
.qif-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ─── Fields ─── */
.qif-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.qif-field--grow {
  flex: 2;
}
.qif-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}
.qif-required {
  color: var(--danger-color);
}

.qif-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* ─── Inputs ─── */
.qif-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.qif-input-icon {
  position: absolute;
  left: 12px;
  color: var(--text-light);
  pointer-events: none;
}
.qif-input {
  width: 100%;
  padding: 10px 14px 10px 40px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background: var(--card-bg);
  color: var(--text-main);
  transition: all 0.2s;
  box-sizing: border-box;
}
.qif-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08);
}
.qif-input::placeholder {
  color: var(--text-light);
}

.qif-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: var(--card-bg);
  color: var(--text-main);
  transition: all 0.2s;
  resize: vertical;
  box-sizing: border-box;
}
.qif-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08);
}
.qif-textarea::placeholder {
  color: var(--text-light);
}

.qif-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background: var(--card-bg);
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}
.qif-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08);
}

.qif-hint {
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: 2px;
}

/* ─── Toggle ─── */
.qif-field--toggle {
  padding: 16px;
  background: var(--bg-main);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  justify-content: center;
}
.qif-toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}
.qif-toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: var(--border-color);
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  padding: 0;
  flex-shrink: 0;
}
.qif-toggle.is-active {
  background: var(--primary-color);
}
.qif-toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.qif-toggle.is-active .qif-toggle-knob {
  transform: translateX(20px);
}
.qif-toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

/* ─── Options Section ─── */
.qif-options-section {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}
.qif-options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.qif-options-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-bold);
}
.qif-options-title {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}
.qif-options-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  padding: 2px 10px;
  background: var(--card-bg);
  border-radius: 20px;
}
.qif-options-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0 0 16px 0;
}

/* ─── Option Row ─── */
.qif-option-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: all 0.2s;
}
.qif-option-row:hover {
  border-color: rgba(24, 214, 0, 0.2);
}
.qif-option-row.is-correct {
  background: rgba(24, 214, 0, 0.04);
  border-color: rgba(24, 214, 0, 0.3);
}

.qif-option-order {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.qif-option-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
}

.qif-option-input-wrap {
  flex: 1;
  min-width: 0;
}
.qif-option-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--card-bg);
  color: var(--text-main);
  transition: all 0.2s;
  box-sizing: border-box;
}
.qif-option-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08);
}
.qif-option-input::placeholder {
  color: var(--text-light);
}

.qif-option-correct {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  color: var(--text-light);
  transition: all 0.2s;
  display: flex;
  flex-shrink: 0;
}
.qif-option-correct:hover {
  border-color: #16a34a;
  color: #16a34a;
}
.qif-option-correct.is-correct {
  background: rgba(24, 214, 0, 0.12);
  border-color: #16a34a;
  color: #16a34a;
}

.qif-option-remove {
  background: none;
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  color: var(--text-light);
  transition: all 0.2s;
  display: flex;
  flex-shrink: 0;
}
.qif-option-remove:hover {
  color: var(--danger-color);
  background: rgba(239, 68, 68, 0.08);
}

.qif-option-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: transparent;
  border: 1px dashed var(--border-color);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}
.qif-option-add:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(24, 214, 0, 0.04);
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
.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 214, 0, 0.25);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
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

/* ─── Actions ─── */
.qif-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

/* ─── Spinner inline ─── */
.spinner-inline {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .qif-row {
    flex-direction: column;
  }
  .qif-actions {
    flex-direction: column;
  }
  .qif-actions .btn-primary,
  .qif-actions .btn-secondary {
    justify-content: center;
  }
  .qif-option-row {
    flex-wrap: wrap;
  }
  .qif-options-section {
    padding: 14px;
  }
}
</style>
