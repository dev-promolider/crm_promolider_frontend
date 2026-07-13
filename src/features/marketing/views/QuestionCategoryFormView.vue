<template>
  <div class="category-form">
    <h1>{{ isEdit ? 'Editar Categoría' : 'Nueva Categoría de Preguntas' }}</h1>

    <div v-if="store.error" class="error">{{ store.error }}</div>

    <form @submit.prevent="submit" class="form">
      <div class="form-group">
        <label>Nombre *</label>
        <input v-model="form.name" type="text" required maxlength="120" placeholder="Ej: Matemáticas Básicas" />
      </div>

      <div class="form-group">
        <label>Descripción</label>
        <textarea v-model="form.description" maxlength="255" placeholder="Descripción opcional de la categoría" rows="3"></textarea>
      </div>

      <div class="form-group checkbox">
        <label>
          <input v-model="form.is_active" type="checkbox" />
          Activo
        </label>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="cancel">Cancelar</button>
        <button type="submit" class="btn-primary" :disabled="store.loading">
          {{ store.loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear') }}
        </button>
      </div>
    </form>
  </div>
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
.category-form { max-width: 600px; margin: 0 auto; padding: 1.5rem; }
.form { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 500; margin-bottom: 0.35rem; color: #334155; }
.form-group input[type="text"], .form-group textarea {
  width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;
  box-sizing: border-box;
}
.form-group textarea { resize: vertical; }
.form-group.checkbox label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
.form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
.btn-primary { background: #2563eb; color: #fff; border: none; padding: 0.5rem 1.25rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 0.5rem 1.25rem; border-radius: 6px; cursor: pointer; }
.error { color: #ef4444; padding: 0.75rem; background: #fef2f2; border-radius: 6px; margin-bottom: 1rem; }
</style>
