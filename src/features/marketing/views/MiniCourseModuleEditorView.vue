<template>
  <div class="mini-course-module-editor">
    <div class="page-header">
      <div>
        <h4 class="page-title">Editor de Módulos y Clases</h4>
        <span class="page-subtitle" v-if="miniCourse">Mini Curso: <strong>{{ miniCourse.title }}</strong></span>
      </div>
      <router-link to="/marketing/herramientas" class="back-btn">
        <ArrowLeft :size="16" /> Volver a Herramientas
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state"><Loader2 class="spinner" :size="36" /><p>Cargando...</p></div>

    <!-- Error -->
    <div v-else-if="error" class="error-banner"><AlertCircle :size="16" /> {{ error }}</div>

    <!-- Content -->
    <div v-else-if="miniCourse" class="editor-content">

      <!-- Add Module Button -->
      <div class="section-header">
        <h5>Módulos del Curso ({{ modules.length }})</h5>
        <button class="btn-primary" @click="openModuleForm()"><Plus :size="14" /> Agregar Módulo</button>
      </div>

      <!-- Module creation/edit form -->
      <div v-if="showModuleForm" class="card form-card">
        <div class="form-card-header">
          <h6>{{ moduleEditIndex !== null ? 'Editar Módulo' : 'Nuevo Módulo' }}</h6>
          <button class="close-btn" @click="closeModuleForm"><X :size="18" /></button>
        </div>
        <form @submit.prevent="saveModule">
          <div class="form-row">
            <div class="form-group flex-2">
              <label>Título del Módulo <span class="required">*</span></label>
              <input type="text" class="form-control" v-model="moduleForm.title" placeholder="Ej: Introducción" required />
            </div>
            <div class="form-group flex-1">
              <label>Duración (min)</label>
              <input type="number" class="form-control" v-model.number="moduleForm.duration" min="1" placeholder="30" />
            </div>
          </div>
          <div class="form-group">
            <label>Contenido</label>
            <textarea class="form-control" v-model="moduleForm.content" rows="3" placeholder="Describe el contenido del módulo"></textarea>
          </div>
          <div class="form-actions-inline">
            <button type="button" class="btn-cancel" @click="closeModuleForm">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="moduleSaving">
              <Loader2 v-if="moduleSaving" :size="14" class="spinner-inline" />
              {{ moduleEditIndex !== null ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Empty state -->
      <div v-if="modules.length === 0 && !showModuleForm" class="empty-state">
        <Package :size="40" />
        <p>No hay módulos registrados. Agrega el primer módulo para empezar.</p>
      </div>

      <!-- Module list -->
      <div v-for="(mod, modIndex) in modules" :key="mod.id" class="module-card">
        <div class="module-header" @click="toggleModuleExpand(modIndex)">
          <div class="module-title-row">
            <BookOpen :size="18" class="module-icon" />
            <div>
              <h6 class="module-title">Módulo {{ modIndex + 1 }}: {{ mod.title }}</h6>
              <span class="module-meta" v-if="mod.duration">{{ mod.duration }} min · {{ mod.classes?.length || 0 }} clases</span>
            </div>
          </div>
          <div class="module-actions" @click.stop>
            <button class="btn-icon" @click="openModuleForm(mod, modIndex)" title="Editar módulo"><Edit3 :size="16" /></button>
            <button class="btn-icon text-danger" @click="confirmDeleteModule(mod.id)" title="Eliminar módulo"><Trash2 :size="16" /></button>
            <button class="btn-icon" @click="toggleModuleExpand(modIndex)" title="Expandir/Colapsar">
              <ChevronDown v-if="expandedModules[modIndex]" :size="16" />
              <ChevronRight v-else :size="16" />
            </button>
          </div>
        </div>

        <div v-if="expandedModules[modIndex]" class="module-body">

          <!-- Module content -->
          <p v-if="mod.content" class="module-content">{{ mod.content }}</p>

          <!-- Module documents -->
          <div class="subsection">
            <div class="subsection-header">
              <h6>Documentos</h6>
              <button class="btn-sm" @click="triggerDocUpload(modIndex)">
                <Upload :size="12" /> Subir documentos
              </button>
              <input ref="docInputs" type="file" multiple accept=".doc,.docx,.pdf,.xls,.xlsx,.txt" class="hidden-input"
                @change="e => handleDocUpload(modIndex, e)" />
            </div>
            <div v-if="mod.documents?.length" class="file-list">
              <div v-for="(doc, dIdx) in mod.documents" :key="dIdx" class="file-item">
                <FileText :size="14" />
                <span class="file-name">{{ doc.name || doc.original_name || `Documento ${dIdx + 1}` }}</span>
                <button class="btn-icon-sm text-danger" @click="removeDoc(mod.id, modIndex, dIdx)"><X :size="12" /></button>
              </div>
            </div>
            <div v-else class="text-muted small">Sin documentos.</div>
          </div>

          <!-- Classes (videos) -->
          <div class="subsection">
            <div class="subsection-header">
              <h6>Clases / Videos</h6>
              <button class="btn-sm" @click="addClass(modIndex)"><Plus :size="12" /> Agregar Clase</button>
            </div>

            <!-- Class form -->
            <div v-if="classFormModuleIndex === modIndex" class="class-form">
              <div class="form-row">
                <div class="form-group flex-2">
                  <label>Título de la clase <span class="required">*</span></label>
                  <input type="text" class="form-control" v-model="classForm.title" placeholder="Ej: Video 1 - Introducción" required />
                </div>
                <div class="form-group flex-1">
                  <label>Duración (min)</label>
                  <input type="number" class="form-control" v-model.number="classForm.duration" min="1" placeholder="15" />
                </div>
              </div>
              <div class="form-group">
                <label>Descripción</label>
                <textarea class="form-control" v-model="classForm.description" rows="2" placeholder="Describe el contenido de la clase"></textarea>
              </div>
              <div class="form-group">
                <label>Video <span v-if="!classForm.file">*</span></label>
                <div class="file-dropzone-sm" @click="triggerVideoUpload" @dragover.prevent @drop.prevent="e => handleVideoDrop(e)">
                  <Video :size="18" />
                  <span v-if="!classForm.file">Arrastra o haz clic para subir video (MP4, WebM)</span>
                  <span v-else class="file-selected">{{ classForm.file.name }}</span>
                  <input :ref="setVideoRef" type="file" accept=".mp4,.mov,.avi,.webm" class="hidden-input" @change="e => classForm.file = e.target.files[0]" />
                </div>
                <div v-if="classForm.previewUrl" class="video-preview">
                  <video :src="classForm.previewUrl" controls class="preview-video"></video>
                </div>
              </div>
              <div class="form-actions-inline">
                <button type="button" class="btn-cancel" @click="cancelClassForm">Cancelar</button>
                <button type="button" class="btn-primary" @click="saveClass(modIndex)" :disabled="classSaving">
                  <Loader2 v-if="classSaving" :size="14" class="spinner-inline" />
                  {{ classEditIndex !== null ? 'Actualizar Clase' : 'Guardar Clase' }}
                </button>
              </div>
            </div>

            <!-- Class list -->
            <div v-if="mod.classes?.length" class="class-list">
              <div v-for="(cls, cIdx) in mod.classes" :key="cls.id" class="class-item">
                <div class="class-info">
                  <Play :size="14" class="class-icon" />
                  <div>
                    <span class="class-title">{{ cls.title }}</span>
                    <span class="class-meta" v-if="cls.duration">{{ cls.duration }} min</span>
                  </div>
                </div>
                <div class="class-actions">
                  <button class="btn-icon-sm" @click="editClass(modIndex, cIdx)" title="Editar"><Edit3 :size="13" /></button>
                  <button class="btn-icon-sm text-danger" @click="confirmDeleteClass(cls.id, modIndex)" title="Eliminar"><Trash2 :size="13" /></button>
                  <a v-if="cls.video_url" :href="'/storage/' + cls.video_url" target="_blank" class="btn-icon-sm" title="Ver video"><ExternalLink :size="13" /></a>
                </div>
              </div>
            </div>
            <div v-else-if="classFormModuleIndex !== modIndex" class="text-muted small">Sin clases registradas.</div>
          </div>

        </div>
      </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/apiClient'
import ConfirmModal from '../components/ConfirmModal.vue'
import ToastNotification from '../components/ToastNotification.vue'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'
import {
  ArrowLeft, Plus, X, Loader2, AlertCircle,
  BookOpen, Edit3, Trash2, ChevronDown, ChevronRight,
  Package, FileText, Upload, Video, Play, ExternalLink
} from 'lucide-vue-next'

const route = useRoute()
const miniCourseId = computed(() => route.params.id)

const miniCourse = ref(null)
const modules = ref([])
const loading = ref(true)
const error = ref('')

const confirm = useConfirm()
const toastAlert = useToast()

// ─── Module form ────────────────────────────────────────────────────

const showModuleForm = ref(false)
const moduleEditIndex = ref(null)
const moduleSaving = ref(false)
const moduleForm = ref({ title: '', content: '', duration: '' })
const expandedModules = ref({})

function openModuleForm(mod = null, index = null) {
  if (mod) {
    moduleForm.value = {
      title: mod.title || '',
      content: mod.content || '',
      duration: mod.duration || '',
    }
    moduleEditIndex.value = index
  } else {
    moduleForm.value = { title: '', content: '', duration: '' }
    moduleEditIndex.value = null
  }
  showModuleForm.value = true
}

function closeModuleForm() {
  showModuleForm.value = false
  moduleForm.value = { title: '', content: '', duration: '' }
  moduleEditIndex.value = null
}

async function saveModule() {
  if (!moduleForm.value.title) return
  moduleSaving.value = true
  try {
    const payload = {
      title: moduleForm.value.title,
      content: moduleForm.value.content,
      duration: moduleForm.value.duration,
      mini_course_id: Number(miniCourse.value.id),
    }
    if (moduleEditIndex.value !== null) {
      const mod = modules.value[moduleEditIndex.value]
      await apiClient.put(`/marketing/mini-course/modules/${mod.id}`, payload)
      toastAlert.show('Actualizado', 'Módulo actualizado correctamente', 'success')
    } else {
      await apiClient.post('/marketing/mini-course/modules', payload)
      toastAlert.show('Creado', 'Módulo creado correctamente', 'success')
    }
    closeModuleForm()
    await loadModules()
  } catch (err) {
    toastAlert.show('Error', 'No se pudo guardar el módulo', 'error')
  } finally {
    moduleSaving.value = false
  }
}

async function confirmDeleteModule(moduleId) {
  const ok = await confirm.show({
    title: 'Eliminar módulo',
    message: '¿Eliminar este módulo y todo su contenido? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    type: 'danger',
  })
  if (!ok) return
  try {
    await apiClient.delete(`/marketing/mini-course/modules/${moduleId}`)
    toastAlert.show('Eliminado', 'Módulo eliminado correctamente', 'success')
    await loadModules()
  } catch {
    toastAlert.show('Error', 'No se pudo eliminar el módulo', 'error')
  }
}

function toggleModuleExpand(index) {
  expandedModules.value = { ...expandedModules.value, [index]: !expandedModules.value[index] }
}

// ─── Documents ──────────────────────────────────────────────────────

const docInputs = ref([])

function triggerDocUpload(modIndex) {
  const input = docInputs.value?.[modIndex]
  if (input) input.click()
}

async function handleDocUpload(modIndex, event) {
  const files = event.target.files
  if (!files?.length) return

  try {
    const fd = new FormData()
    fd.append('_method', 'PUT')
    Array.from(files).forEach((f, i) => fd.append(`documents[${i}]`, f))
    fd.append('title', modules.value[modIndex].title)

    await apiClient.post(`/marketing/mini-course/modules/${modules.value[modIndex].id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    toastAlert.show('Documentos subidos', 'Documentos agregados al módulo', 'success')
    event.target.value = ''
    await loadModules()
  } catch {
    toastAlert.show('Error', 'No se pudieron subir los documentos', 'error')
  }
}

async function removeDoc(moduleId, modIndex, docIndex) {
  const ok = await confirm.show({
    title: 'Eliminar documento',
    message: '¿Eliminar este documento? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    type: 'danger',
  })
  if (!ok) return
  try {
    const doc = modules.value[modIndex]?.documents?.[docIndex]
    if (doc?.id) {
      await apiClient.delete(`/marketing/mini-course/documents/${doc.id}`)
      toastAlert.show('Eliminado', 'Documento eliminado correctamente', 'success')
      await loadModules()
    }
  } catch {
    toastAlert.show('Error', 'No se pudo eliminar el documento', 'error')
  }
}

// ─── Classes ─────────────────────────────────────────────────────────

const classFormModuleIndex = ref(null)
const classEditIndex = ref(null)
const classSaving = ref(false)
const classForm = ref({ title: '', description: '', duration: '', file: null, previewUrl: null })
const videoInputRef = ref(null)

function setVideoRef(el) {
  videoInputRef.value = el
}

function triggerVideoUpload() {
  videoInputRef.value?.click()
}

function handleVideoDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file) {
    classForm.value.file = file
    const url = URL.createObjectURL(file)
    if (classForm.value.previewUrl) URL.revokeObjectURL(classForm.value.previewUrl)
    classForm.value.previewUrl = url
  }
}

function addClass(modIndex) {
  classFormModuleIndex.value = modIndex
  classEditIndex.value = null
  classForm.value = { title: '', description: '', duration: '', file: null, previewUrl: null }
  expandedModules.value = { ...expandedModules.value, [modIndex]: true }
}

function editClass(modIndex, clsIndex) {
  const cls = modules.value[modIndex].classes[clsIndex]
  classFormModuleIndex.value = modIndex
  classEditIndex.value = clsIndex
  classForm.value = {
    title: cls.title || '',
    description: cls.description || '',
    duration: cls.duration || '',
    file: null,
    previewUrl: null,
  }
  expandedModules.value = { ...expandedModules.value, [modIndex]: true }
}

function cancelClassForm() {
  classFormModuleIndex.value = null
  classEditIndex.value = null
  if (classForm.value.previewUrl) URL.revokeObjectURL(classForm.value.previewUrl)
  classForm.value = { title: '', description: '', duration: '', file: null, previewUrl: null }
}

async function saveClass(modIndex) {
  if (!classForm.value.title) return
  classSaving.value = true
  try {
    const mod = modules.value[modIndex]

    if (classForm.value.file) {
      // Upload with file via FormData
      const fd = new FormData()
      fd.append('mini_course_id', Number(miniCourse.value.id))
      fd.append('mini_course_module_id', mod.id)
      fd.append('title', classForm.value.title)
      fd.append('description', classForm.value.description || '')
      fd.append('duration', classForm.value.duration || '')
      fd.append('video', classForm.value.file)

      if (classEditIndex.value !== null) {
        const cls = mod.classes[classEditIndex.value]
        fd.append('_method', 'PUT')
        await apiClient.post(`/marketing/mini-course/classes/${cls.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toastAlert.show('Actualizada', 'Clase actualizada correctamente', 'success')
      } else {
        await apiClient.post('/marketing/mini-course/classes', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toastAlert.show('Creada', 'Clase creada correctamente', 'success')
      }
    } else if (classEditIndex.value !== null) {
      // Edit without file - just text fields
      await apiClient.put(`/marketing/mini-course/classes/${mod.classes[classEditIndex.value].id}`, {
        title: classForm.value.title,
        description: classForm.value.description,
        duration: classForm.value.duration,
        mini_course_id: Number(miniCourse.value.id),
        mini_course_module_id: mod.id,
      })
      toastAlert.show('Actualizada', 'Clase actualizada correctamente', 'success')
    } else {
      toastAlert.show('Error', 'Debes seleccionar un archivo de video', 'error')
      classSaving.value = false
      return
    }

    cancelClassForm()
    await loadClasses(modIndex)
  } catch (err) {
    const msg = err.response?.data?.message || 'No se pudo guardar la clase'
    toastAlert.show('Error', msg, 'error')
  } finally {
    classSaving.value = false
  }
}

async function confirmDeleteClass(classId, modIndex) {
  const ok = await confirm.show({
    title: 'Eliminar clase',
    message: '¿Eliminar esta clase? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    type: 'danger',
  })
  if (!ok) return
  try {
    await apiClient.delete(`/marketing/mini-course/classes/${classId}`)
    toastAlert.show('Eliminada', 'Clase eliminada correctamente', 'success')
    await loadClasses(modIndex)
  } catch {
    toastAlert.show('Error', 'No se pudo eliminar la clase', 'error')
  }
}

// ─── Data loading ────────────────────────────────────────────────────

async function loadMiniCourse() {
  try {
    const res = await apiClient.get(`/marketing/mini-course/${miniCourseId.value}`)
    miniCourse.value = res.data?.data || res.data
  } catch {
    error.value = 'No se pudo cargar el mini curso'
  }
}

async function loadModules() {
  try {
    const res = await apiClient.get(`/marketing/mini-course/${miniCourseId.value}/modules`)
    modules.value = res.data?.data || []
    // Load classes for each module
    await Promise.all(modules.value.map((mod, idx) => loadClasses(idx)))
  } catch {
    toastAlert.show('Error', 'No se pudieron cargar los módulos', 'error')
  }
}

async function loadClasses(modIndex) {
  const mod = modules.value[modIndex]
  if (!mod?.id) return
  try {
    const res = await apiClient.get(`/marketing/mini-course/modules/${mod.id}/classes`)
    modules.value[modIndex].classes = res.data?.data || []
  } catch {
    modules.value[modIndex].classes = []
  }
}

onMounted(async () => {
  loading.value = true
  await loadMiniCourse()
  if (miniCourse.value) {
    await loadModules()
  }
  loading.value = false
})
</script>

<style scoped>
.mini-course-module-editor { animation: fadeIn 0.4s ease; max-width: 1000px; margin: 0 auto; padding: 0 16px; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  flex-wrap: wrap; gap: 12px; margin-bottom: 24px;
}
.page-title { font-size: 1.25rem; font-weight: 700; margin: 0; color: var(--text-bold); }
.page-subtitle { font-size: 13px; color: var(--text-muted); display: block; margin-top: 2px; }
.page-subtitle strong { color: var(--text-main); }

.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent; border: 1px solid var(--border-color);
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  color: var(--text-muted); text-decoration: none; transition: all 0.2s;
}
.back-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(24,214,0,0.04); }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: var(--text-muted); gap: 12px; }
.spinner { animation: spin 1s linear infinite; color: var(--primary-color); }
.spinner-inline { animation: spin 1s linear infinite; display: inline-block; margin-right: 4px; }
@keyframes spin { to { transform: rotate(360deg); } }

.error-banner {
  display: flex; gap: 10px; align-items: center; padding: 12px 16px;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px; color: var(--danger-color); font-size: 13px; margin-bottom: 16px;
}

.section-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
}
.section-header h5 { font-size: 15px; font-weight: 700; margin: 0; color: var(--text-bold); }

.form-card {
  background: var(--card-bg); border: 1px solid var(--border-color);
  border-radius: 10px; padding: 16px; margin-bottom: 16px;
}
.form-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.form-card-header h6 { margin: 0; font-size: 14px; font-weight: 700; }
.close-btn { background: none; border: none; color: var(--text-light); cursor: pointer; padding: 4px; border-radius: 4px; }
.close-btn:hover { background: var(--bg-main); color: var(--danger-color); }

.form-row { display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
.flex-1 { flex: 1; min-width: 120px; }
.flex-2 { flex: 2; min-width: 200px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 12px; color: var(--text-main); }
.required { color: var(--danger-color); }
.form-control {
  width: 100%; padding: 8px 12px; border: 1px solid var(--border-color);
  border-radius: 8px; font-size: 13px; background: var(--card-bg);
  color: var(--text-main); transition: border-color 0.2s; font-family: inherit; box-sizing: border-box;
}
.form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24,214,0,0.08); }
textarea.form-control { resize: vertical; }

.form-actions-inline { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }

.empty-state {
  text-align: center; padding: 40px 20px; color: var(--text-muted);
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}

.module-card {
  background: var(--card-bg); border: 1px solid var(--border-color);
  border-radius: 10px; margin-bottom: 12px; overflow: hidden;
  transition: box-shadow 0.2s;
}
.module-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.module-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; cursor: pointer;
  transition: background 0.15s;
}
.module-header:hover { background: var(--bg-main); }
.module-title-row { display: flex; align-items: center; gap: 10px; }
.module-icon { color: var(--primary-color); flex-shrink: 0; }
.module-title { margin: 0; font-size: 14px; font-weight: 700; color: var(--text-bold); }
.module-meta { font-size: 11px; color: var(--text-light); }
.module-actions { display: flex; gap: 4px; flex-shrink: 0; }
.module-body { padding: 16px; border-top: 1px solid var(--border-color); }
.module-content { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px; }

.btn-icon {
  background: none; border: 1px solid transparent; cursor: pointer;
  padding: 6px; border-radius: 6px; color: var(--text-muted);
  display: inline-flex; align-items: center; transition: all 0.2s;
}
.btn-icon:hover { background: var(--bg-main); color: var(--text-main); border-color: var(--border-color); }
.btn-icon-sm {
  background: none; border: none; cursor: pointer;
  padding: 4px; border-radius: 4px; color: var(--text-light);
  display: inline-flex; align-items: center; transition: all 0.15s;
}
.btn-icon-sm:hover { background: var(--bg-main); color: var(--text-main); }
.text-danger { color: var(--danger-color); }
.text-danger:hover { color: #dc2626 !important; background: rgba(239,68,68,0.08) !important; }

.subsection { margin-bottom: 16px; padding-top: 12px; border-top: 1px solid var(--border-color); }
.subsection-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
}
.subsection-header h6 { margin: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; color: var(--text-muted); }

.file-list { display: flex; flex-direction: column; gap: 4px; }
.file-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 10px;
  background: var(--bg-main); border-radius: 6px; font-size: 12px; color: var(--text-main);
}
.file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.class-form {
  background: var(--bg-main); border: 1px solid var(--border-color);
  border-radius: 8px; padding: 14px; margin-bottom: 10px;
}
.file-dropzone-sm {
  border: 2px dashed var(--border-color); border-radius: 8px;
  padding: 16px; text-align: center; cursor: pointer;
  transition: all 0.2s; color: var(--text-light); font-size: 12px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.file-dropzone-sm:hover { border-color: var(--primary-color); background: rgba(24,214,0,0.03); }
.file-selected { font-weight: 600; color: var(--text-main); font-size: 12px; }
.hidden-input { display: none; }
.video-preview { margin-top: 8px; }
.preview-video { max-width: 100%; max-height: 200px; border-radius: 6px; }

.class-list { display: flex; flex-direction: column; gap: 6px; }
.class-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; background: var(--bg-main); border-radius: 6px;
}
.class-info { display: flex; align-items: center; gap: 8px; }
.class-icon { color: var(--primary-color); flex-shrink: 0; }
.class-title { font-size: 13px; font-weight: 600; color: var(--text-main); }
.class-meta { font-size: 11px; color: var(--text-light); margin-left: 6px; }
.class-actions { display: flex; gap: 2px; }

.text-muted { color: var(--text-muted); }
.small { font-size: 12px; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 5px;
  background: var(--primary-color); color: white; border: none;
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel {
  display: inline-flex; align-items: center;
  background: transparent; border: 1px solid var(--border-color);
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
  color: var(--text-main); cursor: pointer; transition: all 0.2s;
}
.btn-cancel:hover { background: var(--bg-main); }
.btn-sm {
  display: inline-flex; align-items: center; gap: 4px;
  background: transparent; border: 1px solid var(--border-color);
  padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.btn-sm:hover { border-color: var(--primary-color); color: var(--primary-color); }

.toast-notification {
  position: fixed; bottom: 30px; right: 30px;
  background: var(--card-bg); backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 14px 18px; border-radius: 12px;
  display: flex; align-items: flex-start; gap: 12px;
  z-index: 99999; max-width: 360px;
}
.toast-icon { flex-shrink: 0; display: flex; margin-top: 2px; }
.text-green { color: var(--primary-color); }
.text-red { color: var(--danger-color); }
.toast-content h4 { font-size: 14px; font-weight: 700; color: var(--text-bold); margin-bottom: 2px; }
.toast-content p { font-size: 12px; color: var(--text-muted); line-height: 1.4; }
.toast-close { background: none; border: none; color: var(--text-light); cursor: pointer; padding: 2px; flex-shrink: 0; }
.toast-close:hover { color: var(--text-bold); }
.toast-slide-enter-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from { transform: translateX(100%); opacity: 0; }
.toast-slide-leave-to { transform: scale(0.9); opacity: 0; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; }
  .form-row { flex-direction: column; }
  .flex-1, .flex-2 { min-width: 100%; }
  .module-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .module-actions { align-self: flex-end; }
  .toast-notification { bottom: 16px; right: 16px; left: 16px; max-width: none; }
}
</style>
