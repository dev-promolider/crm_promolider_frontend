<template>
  <section class="qcf-view">
    <!-- Header -->
    <div class="card qcf-header-card">
      <div class="qcf-header-inner">
        <div>
          <button class="qcf-back" @click="cancel">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Categorías
          </button>
          <h4 class="qcf-title">{{ isEdit ? 'Editar Categoría' : 'Nueva Categoría' }}</h4>
          <p class="qcf-subtitle">{{ isEdit ? 'Actualiza los datos de la categoría' : 'Crea una nueva categoría para agrupar preguntas' }}</p>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="store.error" class="error-banner">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ store.error }}
    </div>

    <!-- Form -->
    <div class="card qcf-form-card">
      <form @submit.prevent="submit" class="qcf-form">
        <!-- Name -->
        <div class="qcf-field">
          <label class="qcf-label">Nombre <span class="qcf-required">*</span></label>
          <div class="qcf-input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="qcf-input-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <input v-model="form.name" type="text" required maxlength="120" class="qcf-input" placeholder="Ej: Matemáticas Básicas" />
          </div>
        </div>

        <!-- Description -->
        <div class="qcf-field">
          <label class="qcf-label">Descripción</label>
          <textarea v-model="form.description" maxlength="255" class="qcf-textarea" placeholder="Descripción opcional de la categoría" rows="3"></textarea>
        </div>

        <!-- Active Toggle -->
        <div class="qcf-field qcf-field--toggle">
          <div class="qcf-toggle-wrapper">
            <button
              type="button"
              class="qcf-toggle"
              :class="{ 'is-active': form.is_active }"
              @click="form.is_active = !form.is_active"
              role="switch"
            >
              <span class="qcf-toggle-knob"></span>
            </button>
            <label class="qcf-toggle-label">Categoría activa</label>
          </div>
          <p class="qcf-toggle-desc">Las categorías inactivas no se muestran en los cuestionarios</p>
        </div>

        <!-- Actions -->
        <div class="qcf-actions">
          <button type="button" class="btn-secondary" @click="cancel">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="store.loading">
            <svg v-if="!store.loading" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            <div v-else class="spinner-inline"></div>
            {{ store.loading ? 'Guardando...' : (isEdit ? 'Actualizar categoría' : 'Crear categoría') }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionCategoriesStore } from '../stores/questionCategoriesStore'

export default {
  name: 'QuestionCategoryFormView',
  setup() {
    const store = useQuestionCategoriesStore()
    const route = useRoute()
    const router = useRouter()

    const isEdit = computed(() => !!route.params.id)
    const form = ref({ name: '', description: '', is_active: true })

    onMounted(async () => {
      if (isEdit.value) {
        await store.fetchCategory(route.params.id)
        if (store.currentCategory) {
          form.value = {
            name: store.currentCategory.name || '',
            description: store.currentCategory.description || '',
            is_active: store.currentCategory.is_active ?? true,
          }
        }
      }
    })

    async function submit() {
      try {
        if (isEdit.value) {
          await store.updateCategory(route.params.id, form.value)
        } else {
          await store.createCategory(form.value)
        }
        router.push({ name: 'marketing-question-categories' })
      } catch {
        // Error handled by store
      }
    }

    function cancel() {
      router.push({ name: 'marketing-question-categories' })
    }

    return { form, isEdit, store, submit, cancel }
  }
}
</script>

<style scoped>
.qcf-view {
  max-width: 640px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── Header ─── */
.qcf-header-card {
  margin-bottom: 16px;
}
.qcf-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.qcf-back {
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
.qcf-back:hover { opacity: 0.8; }
.qcf-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-bold);
  margin: 0 0 2px 0;
}
.qcf-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

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

/* ─── Form ─── */
.qcf-form-card {
  overflow: hidden;
}
.qcf-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ─── Fields ─── */
.qcf-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.qcf-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}
.qcf-required {
  color: var(--danger-color);
}

.qcf-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.qcf-input-icon {
  position: absolute;
  left: 12px;
  color: var(--text-light);
  pointer-events: none;
}
.qcf-input {
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
.qcf-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08);
}
.qcf-input::placeholder {
  color: var(--text-light);
}

.qcf-textarea {
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
.qcf-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08);
}
.qcf-textarea::placeholder {
  color: var(--text-light);
}

/* ─── Toggle ─── */
.qcf-field--toggle {
  padding: 16px;
  background: var(--bg-main);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}
.qcf-toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}
.qcf-toggle {
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
.qcf-toggle.is-active {
  background: var(--primary-color);
}
.qcf-toggle-knob {
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
.qcf-toggle.is-active .qcf-toggle-knob {
  transform: translateX(20px);
}
.qcf-toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}
.qcf-toggle-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 6px 0 0 0;
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
.qcf-actions {
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
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .qcf-view {
    padding: 0;
  }
  .qcf-actions {
    flex-direction: column;
  }
  .qcf-actions .btn-primary,
  .qcf-actions .btn-secondary {
    justify-content: center;
  }
}
</style>
