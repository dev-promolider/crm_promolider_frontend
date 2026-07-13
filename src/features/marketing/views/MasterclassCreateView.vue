<template>
  <div class="create-masterclass-view">
    <div class="card">
      <div class="card-body">
        <div class="card-header">
          <div>
            <h4 class="card-title">Crear Masterclass</h4>
            <span class="card-meta">Completa los datos para crear una nueva masterclass</span>
          </div>
          <router-link to="/marketing/herramientas" class="stats-tab-btn">
            <ArrowLeft :size="15" /> Volver
          </router-link>
        </div>

        <form @submit.prevent="submitForm" class="create-form">
          <div class="form-grid">
            <!-- Left Column -->
            <div class="form-column">
              <div class="form-group">
                <label>Nombre de la Masterclass <span class="required">*</span></label>
                <input type="text" class="form-control" v-model="form.title" placeholder="Ej: Cómo vender en redes sociales" required />
              </div>

              <div class="form-group">
                <label>Categoría <span class="required">*</span></label>
                <select class="form-control" v-model="form.category_id" required>
                  <option value="">Seleccionar categoría</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Descripción <span class="required">*</span></label>
                <textarea class="form-control" v-model="form.description" rows="3" placeholder="Describe de qué trata la masterclass..." required></textarea>
              </div>

              <div class="form-group">
                <label>Objetivo <span class="required">*</span></label>
                <textarea class="form-control" v-model="form.objective" rows="2" placeholder="¿Qué aprenderán los asistentes?" required></textarea>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Fecha <span class="required">*</span></label>
                  <input type="date" class="form-control" v-model="form.date" required />
                </div>
                <div class="form-group flex-1">
                  <label>Hora <span class="required">*</span></label>
                  <input type="time" class="form-control" v-model="form.time" required />
                </div>
                <div class="form-group flex-1">
                  <label>Duración <span class="required">*</span></label>
                  <select class="form-control" v-model="form.duration" required>
                    <option value="">Seleccionar</option>
                    <option v-for="d in durationOptions" :key="d" :value="d">{{ d }} min</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="form-column">
              <div class="form-group">
                <label>Link de Reunión <span class="required">*</span></label>
                <input type="url" class="form-control" v-model="form.meeting_link" placeholder="https://meet.google.com/..." required />
                <small class="form-hint">Ej: Google Meet, Zoom, Teams</small>
              </div>

              <div class="form-group">
                <label>Correo Electrónico <span class="required">*</span></label>
                <input type="email" class="form-control" v-model="form.email" placeholder="correo@ejemplo.com" required />
              </div>

              <div class="form-group">
                <label>Número de Celular <span class="required">*</span></label>
                <input type="tel" class="form-control" v-model="form.phone" placeholder="+51 999 999 999" required />
              </div>

              <div class="form-group">
                <label>Imagen de portada <span class="required">*</span></label>
                <div class="file-dropzone" @click="triggerImageInput" @dragover.prevent @drop.prevent="handleImageDrop">
                  <Image :size="24" class="dropzone-icon" />
                  <span v-if="!form.image">Arrastra o haz clic para subir imagen (JPG, PNG, WEBP)</span>
                  <span v-else class="file-selected">{{ form.image.name }}</span>
                  <input ref="imageInput" type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden-input" @change="e => form.image = e.target.files[0]" />
                </div>
                <div v-if="imagePreview" class="image-preview">
                  <img :src="imagePreview" alt="Preview" />
                  <button type="button" class="remove-image" @click="removeImage"><X :size="14" /></button>
                </div>
              </div>

              <div class="form-group">
                <label>Documentos adicionales (opcional)</label>
                <div class="file-dropzone" @click="triggerDocInput" @dragover.prevent @drop.prevent="handleDocDrop">
                  <FileText :size="24" class="dropzone-icon" />
                  <span v-if="form.documents.length === 0">Arrastra o haz clic para subir documentos (PDF, DOC, XLS)</span>
                  <span v-else class="file-selected">{{ form.documents.length }} archivo(s) seleccionado(s)</span>
                  <input ref="docInput" type="file" multiple accept=".doc,.docx,.pdf,.xls,.xlsx,.txt" class="hidden-input" @change="e => form.documents = [...e.target.files]" />
                </div>
                <div v-if="form.documents.length > 0" class="file-list">
                  <div v-for="(doc, idx) in form.documents" :key="idx" class="file-item">
                    <FileText :size="14" />
                    <span>{{ doc.name }}</span>
                    <button type="button" @click="removeDoc(idx)" class="remove-file"><X :size="12" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error display -->
          <div v-if="errors.length > 0" class="error-banner">
            <AlertCircle :size="16" />
            <ul><li v-for="(err, i) in errors" :key="i">{{ err }}</li></ul>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <router-link to="/marketing/herramientas" class="btn-cancel">Cancelar</router-link>
            <button type="submit" class="btn-primary-custom" :disabled="isSubmitting">
              <Loader2 v-if="isSubmitting" :size="16" class="spinner-inline" />
              {{ isSubmitting ? 'Creando...' : 'Crear Masterclass' }}
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
import { createMasterclass, getCategories } from '../services/marketingService'
import { ArrowLeft, Image, FileText, X, AlertCircle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const categories = ref([])
const isSubmitting = ref(false)
const errors = ref([])

const form = ref({
  title: '',
  category_id: '',
  description: '',
  objective: '',
  date: '',
  time: '',
  duration: '',
  meeting_link: '',
  email: '',
  phone: '',
  image: null,
  documents: [],
})

const imagePreview = ref(null)
const imageInput = ref(null)
const docInput = ref(null)

const durationOptions = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300]

function triggerImageInput() { imageInput.value?.click() }
function triggerDocInput() { docInput.value?.click() }

function handleImageDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file) {
    form.value.image = file
    const reader = new FileReader()
    reader.onload = (ev) => { imagePreview.value = ev.target.result }
    reader.readAsDataURL(file)
  }
}

function handleDocDrop(e) {
  form.value.documents = [...e.dataTransfer.files]
}

function removeImage() { form.value.image = null; imagePreview.value = null; if (imageInput.value) imageInput.value.value = '' }
function removeDoc(idx) { form.value.documents.splice(idx, 1) }

// Watch image for preview
watch(() => form.value.image, (file) => {
  if (!file) { imagePreview.value = null; return }
  const reader = new FileReader()
  reader.onload = (ev) => { imagePreview.value = ev.target.result }
  reader.readAsDataURL(file)
})

function validateForm() {
  errors.value = []
  const f = form.value
  if (!f.title.trim()) errors.value.push('El nombre es requerido')
  if (!f.category_id) errors.value.push('La categoría es requerida')
  if (!f.description.trim()) errors.value.push('La descripción es requerida')
  if (!f.objective.trim()) errors.value.push('El objetivo es requerido')
  if (!f.date) errors.value.push('La fecha es requerida')
  if (!f.time) errors.value.push('La hora es requerida')
  if (!f.duration) errors.value.push('La duración es requerida')
  if (!f.meeting_link.trim()) errors.value.push('El link de reunión es requerido')
  else if (!/^https?:\/\//.test(f.meeting_link)) errors.value.push('El link debe ser una URL válida (https://...)')
  if (!f.email.trim()) errors.value.push('El correo es requerido')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errors.value.push('El correo no tiene un formato válido')
  if (!f.phone.trim()) errors.value.push('El celular es requerido')
  else if (f.phone.replace(/\D/g, '').length < 10) errors.value.push('El celular debe tener al menos 10 dígitos')
  if (!f.image) errors.value.push('La imagen de portada es requerida')
  return errors.value.length === 0
}

async function submitForm() {
  if (!validateForm()) return
  isSubmitting.value = true
  try {
    const fd = new FormData()
    fd.append('title', form.value.title)
    fd.append('category_id', form.value.category_id)
    fd.append('description', form.value.description)
    fd.append('objective', form.value.objective)
    fd.append('date', form.value.date)
    fd.append('time', form.value.time)
    fd.append('duration', form.value.duration)
    fd.append('meeting_link', form.value.meeting_link)
    fd.append('email', form.value.email)
    fd.append('phone', form.value.phone.replace(/\D/g, ''))
    fd.append('image', form.value.image)
    form.value.documents.forEach(doc => fd.append('documents[]', doc))
    await createMasterclass(fd)
    router.push('/marketing/herramientas')
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al crear la masterclass'
    errors.value = [msg]
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
.create-masterclass-view { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.card-meta { font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px; }
.required { color: var(--danger-color); }

.stats-tab-btn {
  display: inline-flex; align-items: center; gap: 5px;
  background: transparent; border: 1px solid var(--border-color);
  padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
  color: var(--text-muted); text-decoration: none; cursor: pointer; transition: all 0.2s;
}
.stats-tab-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(24,214,0,0.04); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: var(--text-bold); }
.form-control {
  width: 100%; padding: 9px 12px; border: 1px solid var(--border-color);
  border-radius: 8px; font-size: 13px; background: var(--card-bg);
  color: var(--text-main); transition: border-color 0.2s; font-family: inherit;
}
.form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24,214,0,0.08); }
.form-hint { font-size: 11px; color: var(--text-light); margin-top: 4px; display: block; }

.form-row { display: flex; gap: 12px; }
.flex-1 { flex: 1; }

/* File dropzone */
.file-dropzone {
  border: 2px dashed var(--border-color); border-radius: 8px;
  padding: 24px; text-align: center; cursor: pointer;
  transition: all 0.2s; color: var(--text-light); font-size: 12px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.file-dropzone:hover { border-color: var(--primary-color); background: rgba(24,214,0,0.03); }
.dropzone-icon { color: var(--text-light); }
.file-selected { font-weight: 600; color: var(--text-main); }
.hidden-input { display: none; }

.image-preview { position: relative; margin-top: 8px; display: inline-block; }
.image-preview img { width: 120px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color); }
.remove-image {
  position: absolute; top: -6px; right: -6px; background: var(--danger-color);
  color: white; border: none; border-radius: 50%; width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}

.file-list { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
.file-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 10px;
  background: var(--bg-main); border-radius: 6px; font-size: 12px; color: var(--text-main);
}
.remove-file { background: none; border: none; color: var(--text-light); cursor: pointer; margin-left: auto; padding: 2px; }
.remove-file:hover { color: var(--danger-color); }

/* Error banner */
.error-banner {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 16px; background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2); border-radius: 8px;
  color: var(--danger-color); font-size: 13px; margin-bottom: 16px;
}
.error-banner ul { margin: 0; padding-left: 16px; }
.error-banner li { margin-bottom: 2px; }

/* Actions */
.form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--border-color); }
.btn-cancel {
  background: transparent; border: 1px solid var(--border-color);
  padding: 9px 20px; border-radius: 8px; font-size: 13px;
  font-weight: 500; color: var(--text-main); cursor: pointer; text-decoration: none;
  transition: all 0.2s; display: inline-flex; align-items: center;
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
