<template>
  <div class="create-minicourse-view">
    <div class="view-card">
      <div class="view-card-body">
        <div class="view-header">
          <div>
            <h4 class="view-title">Crear Mini Curso</h4>
            <span class="view-meta">Completa los datos para crear un nuevo mini curso</span>
          </div>
          <router-link to="/marketing/herramientas" class="nav-back">
            <ArrowLeft :size="15" /> Volver
          </router-link>
        </div>

        <form @submit.prevent="submitForm" class="create-form">
          <div class="form-grid">
            <div class="form-column">
              <div class="field-group">
                <label>Título del Mini Curso <span class="required-mark">*</span></label>
                <input type="text" class="field-input" v-model="form.title" placeholder="Ej: Introducción al Marketing Digital" required />
              </div>

              <div class="field-row">
                <div class="form-group flex-1">
                  <label>Duración (minutos) <span class="required-mark">*</span></label>
                  <input type="number" class="field-input" v-model.number="form.duration" min="1" placeholder="60" required />
                </div>
                <div class="form-group flex-1">
                  <label>Nivel <span class="required-mark">*</span></label>
                  <select class="field-input" v-model="form.level" required>
                    <option value="">Seleccionar</option>
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div class="field-group">
                <label>Categoría <span class="required-mark">*</span></label>
                <select class="field-input" v-model="form.category_id" required>
                  <option value="">Seleccionar categoría</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div class="field-group">
                <label>Descripción <span class="required-mark">*</span></label>
                <textarea class="field-input" v-model="form.description" rows="4" placeholder="Describe el contenido del mini curso..." required></textarea>
              </div>
            </div>

            <div class="form-column">
              <div class="field-group">
                <label>Imagen del curso <span class="required-mark">*</span></label>
                <div class="file-dropzone" @click="imageInput?.click()" @dragover.prevent @drop.prevent="handleDrop">
                  <Image :size="28" class="dropzone-icon" />
                  <span v-if="!form.image">Arrastra o haz clic para subir imagen</span>
                  <span v-else class="file-selected">{{ form.image.name }}</span>
                  <input ref="imageInput" type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden-input" @change="e => form.image = e.target.files[0]" />
                </div>
                <div v-if="imagePreview" class="image-preview">
                  <img :src="imagePreview" alt="Preview" />
                  <button type="button" class="remove-image" @click="removeImage"><X :size="14" /></button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="errors.length > 0" class="error-banner">
            <AlertCircle :size="16" />
            <ul><li v-for="(err, i) in errors" :key="i">{{ err }}</li></ul>
          </div>

          <div class="form-actions">
            <router-link to="/marketing/herramientas" class="btn-cancel">Cancelar</router-link>
            <button type="submit" class="btn-primary-custom" :disabled="isSubmitting">
              <Loader2 v-if="isSubmitting" :size="16" class="spinner-inline" />
              {{ isSubmitting ? 'Creando...' : 'Crear Mini Curso' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createMiniCourse, getCategories } from '../services/marketingService'
import { ArrowLeft, Image, X, AlertCircle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const categories = ref([])
const isSubmitting = ref(false)
const errors = ref([])

const form = ref({ title: '', duration: '', level: '', category_id: '', description: '', image: null })
const imagePreview = ref(null)
const imageInput = ref(null)

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp']

function getFileExtension(filename) {
  return filename ? '.' + filename.split('.').pop().toLowerCase() : ''
}

function isValidImageFile(file) {
  if (!file) return false
  return ALLOWED_IMAGE_TYPES.includes(file.type) && ALLOWED_IMAGE_EXT.includes(getFileExtension(file.name))
}

watch(() => form.value.image, (file) => {
  if (!file) { imagePreview.value = null; return }
  const r = new FileReader(); r.onload = e => imagePreview.value = e.target.result; r.readAsDataURL(file)
})

function handleDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file && isValidImageFile(file)) {
    form.value.image = file
  } else if (file) {
    errors.value.push('Formato de imagen no válido. Arrastra JPG, PNG o WEBP')
  }
}

function removeImage() { form.value.image = null; imagePreview.value = null; if (imageInput.value) imageInput.value.value = '' }

function validateForm() {
  errors.value = []
  const f = form.value
  if (!f.title?.trim()) errors.value.push('El título es requerido')
  if (!f.duration) errors.value.push('La duración es requerida')
  if (!f.level) errors.value.push('El nivel es requerido')
  if (!f.category_id) errors.value.push('La categoría es requerida')
  if (!f.description?.trim()) errors.value.push('La descripción es requerida')
  if (!f.image) errors.value.push('La imagen es requerida')
  else if (!isValidImageFile(f.image)) {
    errors.value.push('Formato de imagen no válido. Usa JPG, PNG o WEBP')
  }
  return errors.value.length === 0
}

async function submitForm() {
  if (!validateForm()) return
  isSubmitting.value = true
  try {
    const fd = new FormData()
    fd.append('title', form.value.title)
    fd.append('duration', form.value.duration)
    fd.append('level', form.value.level)
    fd.append('category_id', form.value.category_id)
    fd.append('description', form.value.description)
    fd.append('image', form.value.image)
    await createMiniCourse(fd)
    router.push('/marketing/herramientas')
  } catch (error) {
    errors.value = [error.response?.data?.message || 'Error al crear el mini curso']
  } finally { isSubmitting.value = false }
}

onMounted(async () => {
  try {
    const res = await getCategories()
    categories.value = res?.data || res || []
  } catch { categories.value = [] }
})
</script>

<style scoped>
.create-minicourse-view { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.view-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.view-meta { font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px; }
.required-mark { color: var(--danger-color); }

.nav-back {
  display: inline-flex; align-items: center; gap: 5px;
  background: transparent; border: 1px solid var(--border-color);
  padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
  color: var(--text-muted); text-decoration: none; transition: all 0.2s;
}
.nav-back:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(24,214,0,0.04); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }

.field-group { margin-bottom: 16px; }
.field-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: var(--text-bold); }
.field-input {
  width: 100%; padding: 9px 12px; border: 1px solid var(--border-color);
  border-radius: 8px; font-size: 13px; background: var(--card-bg);
  color: var(--text-main); transition: border-color 0.2s; font-family: inherit;
}
.field-input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24,214,0,0.08); }
select.field-input, textarea.field-input { font-family: inherit; }
.field-row { display: flex; gap: 12px; }
.flex-1 { flex: 1; }

.file-dropzone {
  border: 2px dashed var(--border-color); border-radius: 8px;
  padding: 28px; text-align: center; cursor: pointer;
  transition: all 0.2s; color: var(--text-light); font-size: 12px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.file-dropzone:hover { border-color: var(--primary-color); background: rgba(24,214,0,0.03); }
.dropzone-icon { color: var(--text-light); }
.file-selected { font-weight: 600; color: var(--text-main); }
.hidden-input { display: none; }

.image-preview { position: relative; margin-top: 8px; display: inline-block; }
.image-preview img { width: 180px; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); }
.remove-image {
  position: absolute; top: -6px; right: -6px; background: var(--danger-color);
  color: white; border: none; border-radius: 50%; width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}

.error-banner {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 16px; background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2); border-radius: 8px;
  color: var(--danger-color); font-size: 13px; margin-bottom: 16px;
}
.error-banner ul { margin: 0; padding-left: 16px; }
.error-banner li { margin-bottom: 2px; }

.form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--border-color); }
.btn-cancel {
  background: transparent; border: 1px solid var(--border-color);
  padding: 9px 20px; border-radius: 8px; font-size: 13px;
  font-weight: 500; color: var(--text-main); cursor: pointer; text-decoration: none;
  transition: all 0.2s;
}
.btn-cancel:hover { background: var(--bg-main); }
.btn-primary-custom {
  background: var(--primary-color); color: white; border: none;
  padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;
}
.btn-primary-custom:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-1px); }
.btn-primary-custom:disabled { opacity: 0.5; cursor: not-allowed; }
.spinner-inline { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
