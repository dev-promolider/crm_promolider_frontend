<template>
  <div class="create-ebook-view">
    <div class="view-card">
      <div class="view-card-body">
        <div class="view-header">
          <div>
            <h4 class="view-title">Crear E-book</h4>
            <span class="view-meta">Completa los datos para crear un nuevo e-book</span>
          </div>
          <router-link to="/marketing/herramientas" class="nav-back">
            <ArrowLeft :size="15" /> Volver
          </router-link>
        </div>

        <form @submit.prevent="submitForm" class="create-form">
          <div class="form-grid">
            <div class="form-column">
              <div class="field-group">
                <label>Título del E-book <span class="required-mark">*</span></label>
                <input type="text" class="field-input" v-model="form.title" placeholder="Ej: Guía completa de Marketing" required />
              </div>

              <div class="field-row">
                <div class="form-group flex-1">
                  <label>Autor <span class="required-mark">*</span></label>
                  <input type="text" class="field-input" v-model="form.author" placeholder="Nombre del autor" required />
                </div>
                <div class="form-group flex-1">
                  <label>Precio <span class="required-mark">*</span></label>
                  <input type="number" step="0.01" min="0" class="field-input" v-model.number="form.price" placeholder="0.00" required />
                </div>
              </div>

              <div class="field-row">
                <div class="form-group flex-1">
                  <label>N° de Páginas <span class="required-mark">*</span></label>
                  <input type="number" class="field-input" v-model.number="form.pages" min="1" placeholder="50" required />
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
                <textarea class="field-input" v-model="form.description" rows="4" placeholder="Describe el contenido del e-book..." required></textarea>
              </div>
            </div>

            <div class="form-column">
              <div class="field-group">
                <label>Portada del E-book <span class="required-mark">*</span></label>
                <div class="file-dropzone" @click="coverInput?.click()" @dragover.prevent @drop.prevent="e => { const file = e.dataTransfer.files[0]; if (file && isValidImageFile(file)) form.cover = file }">
                  <Image :size="28" class="dropzone-icon" />
                  <span v-if="!form.cover">Arrastra o haz clic para subir portada</span>
                  <span v-else class="file-selected">{{ form.cover.name }}</span>
                  <input ref="coverInput" type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden-input" @change="e => form.cover = e.target.files[0]" />
                </div>
                <div v-if="coverPreview" class="image-preview">
                  <img :src="coverPreview" alt="Preview" />
                  <button type="button" class="remove-image" @click="removeCover"><X :size="14" /></button>
                </div>
              </div>

              <div class="field-group">
                <label>Archivo PDF <span class="required-mark">*</span></label>
                <div class="file-dropzone" @click="pdfInput?.click()" @dragover.prevent @drop.prevent="e => { const f = e.dataTransfer.files[0]; if (f) form.pdf = f }">
                  <FileText :size="28" class="dropzone-icon" />
                  <span v-if="!form.pdf">Arrastra o haz clic para subir el PDF</span>
                  <span v-else class="file-selected">{{ form.pdf.name }}</span>
                  <input ref="pdfInput" type="file" accept=".pdf" class="hidden-input" @change="e => form.pdf = e.target.files[0]" />
                </div>
              </div>

              <!-- Dynamic Chapters -->
              <div class="field-group">
                <div class="chapters-header">
                  <label>Capítulos</label>
                  <button type="button" class="add-chapter-btn" @click="addChapter">
                    <Plus :size="14" /> Agregar Capítulo
                  </button>
                </div>
                <div v-for="(chap, idx) in form.chapters" :key="idx" class="chapter-card">
                  <div class="chapter-header">
                    <span class="chapter-number">Capítulo {{ idx + 1 }}</span>
                    <button type="button" class="remove-chapter" @click="removeChapter(idx)"><X :size="14" /></button>
                  </div>
                  <div class="field-row">
                    <div class="form-group flex-2">
                      <input type="text" class="field-input" v-model="chap.title" placeholder="Título del capítulo" />
                    </div>
                    <div class="form-group flex-1">
                      <input type="number" class="field-input" v-model.number="chap.pages" min="1" placeholder="Págs" />
                    </div>
                  </div>
                  <div class="form-group mb-0">
                    <textarea class="field-input" v-model="chap.content" rows="2" placeholder="Contenido del capítulo..."></textarea>
                  </div>
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
              {{ isSubmitting ? 'Creando...' : 'Crear E-book' }}
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
import { createEbook, getCategories } from '../services/marketingService'
import { ArrowLeft, Image, FileText, Plus, X, AlertCircle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const categories = ref([])
const isSubmitting = ref(false)
const errors = ref([])

const form = ref({
  title: '', author: '', price: '', pages: '', category_id: '', description: '',
  cover: null, pdf: null,
  chapters: [],
})

const coverPreview = ref(null)
const coverInput = ref(null)
const pdfInput = ref(null)

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp']

function getFileExtension(filename) {
  return filename ? '.' + filename.split('.').pop().toLowerCase() : ''
}

function isValidImageFile(file) {
  if (!file) return false
  return ALLOWED_IMAGE_TYPES.includes(file.type) && ALLOWED_IMAGE_EXT.includes(getFileExtension(file.name))
}

watch(() => form.value.cover, (file) => {
  if (!file) { coverPreview.value = null; return }
  const r = new FileReader(); r.onload = e => coverPreview.value = e.target.result; r.readAsDataURL(file)
})

function removeCover() { form.value.cover = null; coverPreview.value = null; if (coverInput.value) coverInput.value.value = '' }

function addChapter() { form.value.chapters.push({ title: '', pages: '', content: '' }) }
function removeChapter(idx) { form.value.chapters.splice(idx, 1) }

function validateForm() {
  errors.value = []
  const f = form.value
  if (!f.title?.trim()) errors.value.push('El título es requerido')
  if (!f.author?.trim()) errors.value.push('El autor es requerido')
  if (f.price === '' || f.price === null) errors.value.push('El precio es requerido')
  if (!f.pages) errors.value.push('El número de páginas es requerido')
  if (!f.category_id) errors.value.push('La categoría es requerida')
  if (!f.description?.trim()) errors.value.push('La descripción es requerida')
  if (!f.cover) errors.value.push('La portada es requerida')
  else if (!isValidImageFile(f.cover)) {
    errors.value.push('Formato de portada no válido. Usa JPG, PNG o WEBP')
  }
  if (!f.pdf) errors.value.push('El archivo PDF es requerido')
  else if (f.pdf.type !== 'application/pdf' && !f.pdf.name.toLowerCase().endsWith('.pdf')) {
    errors.value.push('El archivo debe ser PDF')
  }
  return errors.value.length === 0
}

async function submitForm() {
  if (!validateForm()) return
  isSubmitting.value = true
  try {
    const fd = new FormData()
    fd.append('title', form.value.title)
    fd.append('author', form.value.author)
    fd.append('price', form.value.price || 0)
    fd.append('pages', form.value.pages)
    fd.append('category_id', form.value.category_id)
    fd.append('description', form.value.description)
    fd.append('cover', form.value.cover)
    fd.append('pdf', form.value.pdf)
    form.value.chapters.forEach((ch, i) => {
      fd.append(`chapters[${i}][title]`, ch.title)
      fd.append(`chapters[${i}][pages]`, ch.pages)
      fd.append(`chapters[${i}][content]`, ch.content)
    })
    await createEbook(fd)
    router.push('/marketing/herramientas')
  } catch (error) {
    errors.value = [error.response?.data?.message || 'Error al crear el e-book']
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
.create-ebook-view { animation: fadeIn 0.4s ease; }
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
.flex-2 { flex: 2; }

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
.image-preview img { width: 140px; height: 180px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.remove-image {
  position: absolute; top: -6px; right: -6px; background: var(--danger-color);
  color: white; border: none; border-radius: 50%; width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}

/* Chapters */
.chapters-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.add-chapter-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: transparent; border: 1px dashed var(--border-color);
  padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.add-chapter-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }

.chapter-card {
  background: var(--bg-main); border: 1px solid var(--border-color);
  border-radius: 8px; padding: 12px; margin-bottom: 8px;
}
.chapter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.chapter-number { font-size: 12px; font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.3px; }
.remove-chapter { background: none; border: none; color: var(--text-light); cursor: pointer; padding: 2px; }
.remove-chapter:hover { color: var(--danger-color); }

.error-banner {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 16px; background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2); border-radius: 8px;
  color: var(--danger-color); font-size: 13px; margin-bottom: 16px;
}
.error-banner ul { margin: 0; padding-left: 16px; }

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