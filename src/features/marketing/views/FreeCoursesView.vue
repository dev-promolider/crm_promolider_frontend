<template>
  <div class="free-courses">
    <div class="page-header">
      <h1>Cursos Gratuitos</h1>
      <button class="btn-primary" @click="showForm = true">+ Nuevo Curso Gratuito</button>
    </div>

    <div v-if="store.loading" class="loading">Cargando...</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>

    <!-- Create Form -->
    <div v-if="showForm" class="form-card">
      <h3>Nuevo Curso Gratuito</h3>
      <form @submit.prevent="createCourse">
        <div class="form-group">
          <label>Nombre del curso *</label>
          <input v-model="form.course_name" type="text" required maxlength="255" placeholder="Ej: Introducción al Marketing" />
        </div>
        <div class="form-group">
          <label>Categoría</label>
          <select v-model="form.category_id">
            <option value="">Sin categoría</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea v-model="form.description" maxlength="500" placeholder="Descripción opcional" rows="2"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="showForm = false">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Guardando...' : 'Crear' }}</button>
        </div>
      </form>
    </div>

    <!-- Courses List -->
    <div v-if="store.courses.length" class="courses-list">
      <div v-for="course in store.courses" :key="course.id" class="course-card">
        <div class="card-body">
          <h3>{{ course.course_name }}</h3>
          <span v-if="course.status" class="status-badge" :class="course.status === 'active' ? 'active' : 'inactive'">
            {{ course.status === 'active' ? 'Activo' : 'Inactivo' }}
          </span>
          <p v-if="course.description" class="desc">{{ course.description }}</p>
          <div class="meta">
            <span v-if="course.category_name" class="category">{{ course.category_name }}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-sm btn-danger" @click="confirmDelete(course)">Eliminar</button>
        </div>
      </div>
    </div>

    <div v-else-if="!showForm && !store.loading" class="empty">
      No hay cursos gratuitos. Crea el primero.
    </div>

    <!-- Delete Modal -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal">
        <h3>Eliminar {{ deleteTarget.course_name }}?</h3>
        <div class="modal-actions">
          <button class="btn-secondary" @click="deleteTarget = null">Cancelar</button>
          <button class="btn-danger" @click="removeCourse">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useFreeCoursesStore } from '../stores/freeCoursesStore'
import * as marketingService from '../services/marketingService'

export default {
  name: 'FreeCoursesView',
  setup() {
    const store = useFreeCoursesStore()
    const showForm = ref(false)
    const saving = ref(false)
    const deleteTarget = ref(null)
    const categories = ref([])
    const form = ref({ course_name: '', category_id: '', description: '' })

    onMounted(async () => {
      await store.fetchCourses()
      try {
        const res = await marketingService.getCategories()
        categories.value = res.data || []
      } catch {}
    })

    async function createCourse() {
      saving.value = true
      try {
        await store.createCourse({
          course_name: form.value.course_name,
          category_id: form.value.category_id || null,
          description: form.value.description || null,
        })
        form.value = { course_name: '', category_id: '', description: '' }
        showForm.value = false
      } catch {}
      finally { saving.value = false }
    }

    function confirmDelete(course) { deleteTarget.value = course }
    async function removeCourse() {
      if (!deleteTarget.value) return
      await store.removeCourse(deleteTarget.value.id)
      deleteTarget.value = null
    }

    return { store, showForm, saving, deleteTarget, categories, form, createCourse, confirmDelete, removeCourse }
  }
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.form-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem; }
.form-card h3 { margin: 0 0 1rem; }
.form-group { margin-bottom: 0.75rem; }
.form-group label { display: block; font-weight: 500; margin-bottom: 0.3rem; color: #334155; }
.form-group input, .form-group select, .form-group textarea {
  width: 100%; padding: 0.45rem 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box;
}
.form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; }
.courses-list { display: grid; gap: 1rem; }
.course-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; }
.card-body h3 { margin: 0 0 0.25rem; font-size: 1rem; }
.desc { color: #64748b; font-size: 0.85rem; margin: 0 0 0.25rem; }
.meta { font-size: 0.8rem; color: #94a3b8; }
.status-badge { display: inline-block; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.7rem; font-weight: 500; margin-bottom: 0.25rem; }
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.inactive { background: #fef2f2; color: #991b1b; }
.card-actions { display: flex; gap: 0.5rem; }
.btn-primary { background: #2563eb; color: #fff; border: none; padding: 0.45rem 0.9rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-primary:disabled { opacity: 0.6; }
.btn-secondary { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 0.45rem 0.9rem; border-radius: 6px; cursor: pointer; }
.btn-sm { padding: 0.3rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.btn-danger { background: #ef4444; color: #fff; border-color: #ef4444; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; padding: 2rem; border-radius: 8px; max-width: 400px; width: 90%; }
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
.loading, .empty, .error { padding: 2rem; text-align: center; color: #64748b; }
.error { color: #ef4444; }
</style>
