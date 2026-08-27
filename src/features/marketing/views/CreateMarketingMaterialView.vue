<template>
  <div class="marketing-material-view dashboard-page layout-split">
    <!-- GESTIÓN PANEL (LEFT) -->
    <div class="editor-panel">
      <div class="page-header mb-4">
        <button class="btn-back" @click="$router.push('/marketing/herramientas')">&larr; Volver a herramientas</button>
        <h4 class="page-title mt-2">Material Publicitario</h4>
        <span class="page-meta text-muted" v-if="course">Gestiona descripciones, banners y videos para promocionar <strong>{{ course.name || course.title }}</strong>.</span>
      </div>
        
      <div class="material-form">
            
        <!-- Seccion Descripciones -->
        <div class="form-section">
          <div class="section-header">
            <h5><i class="fas fa-align-left text-primary"></i> Descripciones Publicitarias</h5>
            <button type="button" class="btn-ia-magic" @click.prevent>
              <span class="magic-circle"></span>
              <span class="magic-svg-left">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487"><path fill-opacity=".1" fill-rule="nonzero" fill="#FFF" d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"></path></svg>
              </span>
              <span class="magic-svg-right">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487"><path fill-opacity=".1" fill-rule="nonzero" fill="#FFF" d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"></path></svg>
              </span>
              <span class="magic-overlay"></span>
              <span class="magic-text-container">
                <span class="text-default"><i class="fas fa-magic"></i> Generar con IA</span>
                <span class="text-hover">Próximamente</span>
              </span>
            </button>
          </div>
          <p class="text-muted small mb-3">Escribe los textos persuasivos (copywriting) para redes sociales, emails o páginas de venta.</p>
          
          <div v-if="descriptions.length > 0" class="material-list mb-3">
            <div v-for="desc in descriptions" :key="desc.id" class="material-item">
              <div class="material-content text-content">{{ desc.content }}</div>
              <button class="btn-delete" @click="deleteMaterial(desc.id)" title="Eliminar"><Trash2 :size="18" /></button>
            </div>
          </div>

          <form @submit.prevent="saveDescription" class="add-form">
            <div class="form-group mb-2">
              <textarea v-model="newDescription" class="form-control" rows="3" placeholder="Añadir una nueva descripción promocional..." required></textarea>
            </div>
            <div class="text-right">
              <button type="submit" class="btn-primary-sm" :disabled="isSaving.description">
                <i class="fas fa-spinner fa-spin" v-if="isSaving.description"></i>
                <span v-else>Guardar Descripción</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Seccion Banners / Flyers -->
        <div class="form-section mt-4">
          <div class="section-header">
            <h5><i class="fas fa-image text-primary"></i> Banners y Flyers</h5>
            <button type="button" class="btn-ia-magic" @click.prevent>
              <span class="magic-circle"></span>
              <span class="magic-svg-left">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487"><path fill-opacity=".1" fill-rule="nonzero" fill="#FFF" d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"></path></svg>
              </span>
              <span class="magic-svg-right">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487"><path fill-opacity=".1" fill-rule="nonzero" fill="#FFF" d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"></path></svg>
              </span>
              <span class="magic-overlay"></span>
              <span class="magic-text-container">
                <span class="text-default"><i class="fas fa-magic"></i> Diseñar con IA</span>
                <span class="text-hover">Próximamente</span>
              </span>
            </button>
          </div>
          <p class="text-muted small mb-3">Sube imágenes atractivas para tus campañas publicitarias.</p>
          
          <div v-if="banners.length > 0" class="material-grid mb-3">
            <div v-for="banner in banners" :key="banner.id" class="grid-item">
              <img :src="getS3Url(banner.file_path)" alt="Banner" />
              <button class="btn-delete grid-delete" @click="deleteMaterial(banner.id)" title="Eliminar"><Trash2 :size="16" /></button>
            </div>
          </div>

          <div class="form-group">
            <label for="bannerFile" class="custom-file-upload" :class="{ 'has-file': newBannerFile, 'uploading': isSaving.banner }">
              <div class="upload-icon-wrapper">
                <i class="fas fa-spinner fa-spin" v-if="isSaving.banner"></i>
                <ImageIcon v-else-if="!newBannerFile" class="upload-icon" />
                <CheckCircle2 v-else class="upload-icon success" />
              </div>
              <div class="upload-text">
                <span v-if="isSaving.banner">Subiendo imagen...</span>
                <span v-else-if="!newBannerFile"><strong>Haz clic para subir</strong> o arrastra una imagen</span>
                <span v-else class="file-name">{{ newBannerFile.name }}</span>
              </div>
              <input type="file" id="bannerFile" @change="uploadFile($event, 'banner')" accept="image/*" class="hidden-input" :disabled="isSaving.banner" />
            </label>
          </div>
        </div>

        <!-- Seccion Videos -->
        <div class="form-section mt-4">
          <div class="section-header">
            <h5><i class="fas fa-video text-primary"></i> Videos Promocionales</h5>
            <button type="button" class="btn-ia-magic" @click.prevent>
              <span class="magic-circle"></span>
              <span class="magic-svg-left">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487"><path fill-opacity=".1" fill-rule="nonzero" fill="#FFF" d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"></path></svg>
              </span>
              <span class="magic-svg-right">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487"><path fill-opacity=".1" fill-rule="nonzero" fill="#FFF" d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"></path></svg>
              </span>
              <span class="magic-overlay"></span>
              <span class="magic-text-container">
                <span class="text-default"><i class="fas fa-magic"></i> Crear guión con IA</span>
                <span class="text-hover">Próximamente</span>
              </span>
            </button>
          </div>
          <p class="text-muted small mb-3">Sube videos cortos en formato MP4 preparados para que tus distribuidores los descarguen y usen.</p>
          
          <div v-if="videos.length > 0" class="video-grid mb-3">
            <div v-for="video in videos" :key="video.id" class="video-item">
              <video :src="getS3Url(video.file_path)" controls preload="metadata" class="video-player"></video>
              <button class="btn-delete grid-delete" @click="deleteMaterial(video.id)" title="Eliminar"><Trash2 :size="16" /></button>
            </div>
          </div>

          <div class="form-group">
            <label for="videoFile" class="custom-file-upload" :class="{ 'has-file': newVideoFile, 'uploading': isSaving.video }">
              <div class="upload-icon-wrapper">
                <i class="fas fa-spinner fa-spin" v-if="isSaving.video"></i>
                <Film v-else-if="!newVideoFile" class="upload-icon" />
                <CheckCircle2 v-else class="upload-icon success" />
              </div>
              <div class="upload-text">
                <span v-if="isSaving.video">Subiendo video... ({{ uploadProgress }}%)</span>
                <span v-else-if="!newVideoFile"><strong>Haz clic para subir</strong> o arrastra un video MP4</span>
                <span v-else class="file-name">{{ newVideoFile.name }}</span>
              </div>
              <input type="file" id="videoFile" @change="uploadFile($event, 'video')" accept="video/mp4,video/x-m4v,video/*" class="hidden-input" :disabled="isSaving.video" />
            </label>
          </div>
        </div>

      </div>
    </div>

    <!-- PREVIEW PANEL (RIGHT) -->
    <div class="preview-panel">
      <div class="preview-header">
        <h3>Vista Previa del Curso</h3>
        <p>Así se ve el curso que estás promocionando.</p>
      </div>

      <div class="preview-card" v-if="course">
        <div class="preview-image">
          <img :src="getS3Url(course.url_portada || course.path_url) || '/img_mantenimiento.png'" alt="Course Preview" @error="handleImageError" />
          <div class="preview-badge" v-if="course.id_categories">{{ course.category_name || 'Categoría' }}</div>
        </div>
        
        <div class="preview-content">
          <h2 class="preview-title">{{ course.name || course.title || 'Título del curso' }}</h2>
          <p class="preview-description">{{ course.description || 'Descripción breve del curso...' }}</p>
          
          <div class="preview-meta">
            <span class="meta-item"><i class="fas fa-signal"></i> {{ course.course_level_id ? 'Nivel Asignado' : 'Todos los niveles' }}</span>
            <span class="meta-item"><i class="fas fa-globe"></i> {{ course.language || 'Español' }}</span>
          </div>

          <div class="preview-price-box">
            <div class="price-current">
              S/ {{ Number(course.price || 0).toFixed(2) }}
            </div>
          </div>
          
          <button class="btn-preview-action" disabled>Inscribirse Ahora</button>
        </div>
      </div>
      <div v-else-if="loadingCourse" class="text-center p-5">
        <i class="fas fa-spinner fa-spin text-primary" style="font-size: 2rem;"></i>
        <p class="mt-2 text-muted">Cargando detalles del curso...</p>
      </div>
    </div>

    <!-- TOAST COMPONENT -->
    <Transition name="toast-slide">
      <div class="toast-notification" v-if="toast">
        <div class="toast-icon">
          <CheckCircle2 v-if="toast.type === 'success'" :size="20" class="text-green" />
          <AlertCircle v-else :size="20" class="text-red" />
        </div>
        <div class="toast-content">
          <h4>{{ toast.title }}</h4>
          <p>{{ toast.message }}</p>
        </div>
        <button class="toast-close" @click="toast = null"><X :size="16" /></button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Image as ImageIcon, Film, CheckCircle2, AlertCircle, X, Trash2 } from 'lucide-vue-next'
import apiClient from '@/services/apiClient'
import axios from 'axios'
import { getCourse } from '@/features/marketing/services/coursesService'

const route = useRoute()
const router = useRouter()
const courseId = route.query.course_id

const materials = ref([])
const course = ref(null)
const loadingCourse = ref(true)

const newDescription = ref('')
const newBannerFile = ref(null)
const newVideoFile = ref(null)
const uploadProgress = ref(0)

const isSaving = ref({
  description: false,
  banner: false,
  video: false
})

const toast = ref(null)

const descriptions = computed(() => materials.value.filter(m => m.type === 'description'))
const banners = computed(() => materials.value.filter(m => m.type === 'banner'))
const videos = computed(() => materials.value.filter(m => m.type === 'video'))

onMounted(() => {
  if (!courseId) {
    showToast('Error', 'No se ha seleccionado un curso válido.', 'error')
    setTimeout(() => router.push('/marketing/herramientas'), 2000)
    return
  }
  loadCourseDetails()
  loadMaterials()
})

const loadCourseDetails = async () => {
  loadingCourse.value = true
  try {
    const response = await getCourse(courseId)
    course.value = response.data || response
  } catch (error) {
    console.error("Error loading course details", error)
  } finally {
    loadingCourse.value = false
  }
}

const loadMaterials = async () => {
  try {
    const response = await apiClient.get(`/marketing/marketing-materials/course/${courseId}`)
    if (response.data && response.data.data) {
      materials.value = response.data.data
    }
  } catch (error) {
    console.error("Error loading materials", error)
  }
}

const saveDescription = async () => {
  if (!newDescription.value.trim()) return
  
  isSaving.value.description = true
  try {
    await apiClient.post(`/marketing/marketing-materials/course/${courseId}/description`, {
      content: newDescription.value
    })
    newDescription.value = ''
    await loadMaterials()
    showToast('¡Éxito!', 'Descripción guardada correctamente.')
  } catch (error) {
    showToast('Error', 'No se pudo guardar la descripción.', 'error')
  } finally {
    isSaving.value.description = false
  }
}

const uploadFile = async (event, type) => {
  const file = event.target.files[0]
  if (!file) return

  if (type === 'banner') newBannerFile.value = file
  if (type === 'video') newVideoFile.value = file
  
  isSaving.value[type] = true
  uploadProgress.value = 0

  try {
    // 1. Obtener URL pre-firmada del backend
    const presignRes = await apiClient.post(`/marketing/marketing-materials/course/${courseId}/presigned-url`, {
      file_name: file.name,
      file_type: file.type,
      type: type
    })

    const presignedUrl = presignRes.data.presigned_url
    const s3Key = presignRes.data.s3_key

    // 2. Subir directamente a S3
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        uploadProgress.value = percentCompleted
      }
    })

    // 3. Confirmar subida al backend
    await apiClient.post(`/marketing/marketing-materials/course/${courseId}/confirm-upload`, {
      s3_key: s3Key,
      file_name: file.name,
      type: type
    })

    await loadMaterials()
    showToast('¡Éxito!', `${type === 'banner' ? 'Imagen' : 'Video'} subido correctamente.`)
    
  } catch (error) {
    console.error("Upload error", error)
    showToast('Error', `Hubo un problema subiendo el ${type === 'banner' ? 'banner' : 'video'}.`, 'error')
  } finally {
    isSaving.value[type] = false
    if (type === 'banner') {
      newBannerFile.value = null
      document.getElementById('bannerFile').value = ''
    }
    if (type === 'video') {
      newVideoFile.value = null
      document.getElementById('videoFile').value = ''
    }
  }
}

const deleteMaterial = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este material?')) return
  
  try {
    await apiClient.delete(`/marketing/marketing-materials/${id}`)
    materials.value = materials.value.filter(m => m.id !== id)
    showToast('¡Eliminado!', 'El material fue eliminado.')
  } catch (error) {
    showToast('Error', 'No se pudo eliminar el material.', 'error')
  }
}

const showToast = (title, message, type = 'success') => {
  toast.value = { title, message, type }
  setTimeout(() => { toast.value = null }, 3500)
}

const getS3Url = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path.replace('s3.sa-east-1', 's3-accelerate')
  return `https://promolider-storage-user.s3-accelerate.amazonaws.com/${path}`
}

const handleImageError = (e) => {
  e.target.src = '/img_mantenimiento.png'
}
</script>

<style scoped>
.layout-split {
  display: flex;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: flex-start;
}

.editor-panel {
  flex: 1;
  min-width: 0;
}

.preview-panel {
  width: 380px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
}

.marketing-material-view {
  padding: 20px 0;
}

.page-header {
  margin-bottom: 30px;
}

.btn-back {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  cursor: pointer;
  margin-bottom: 10px;
  transition: opacity 0.2s;
  opacity: 0.9;
}

.btn-back:hover {
  color: var(--primary-color);
}

.page-title {
  color: var(--text-main);
  font-weight: 700;
  margin: 0;
}

.page-meta {
  font-size: 14px;
}

.material-form {
  display: flex;
  flex-direction: column;
}

.form-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-header h5 {
  margin: 0;
  color: var(--text-main);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Listas y Grids */
.material-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.material-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.material-content.text-content {
  font-size: 14px;
  color: var(--text-color);
  white-space: pre-wrap;
  word-break: break-word;
}

.flex-center {
  display: flex;
  align-items: center;
}

.video-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  word-break: break-all;
}

.btn-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 15px;
}

.btn-delete:hover {
  background: #ef4444;
  color: white;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.grid-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grid-delete {
  position: absolute;
  top: 5px;
  right: 5px;
  margin: 0;
  width: 28px;
  height: 28px;
  opacity: 0;
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.grid-item:hover .grid-delete,
.video-item:hover .grid-delete {
  opacity: 1;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
}

.video-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16/9;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Upload zone */
.custom-file-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-main);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.custom-file-upload:hover:not(.uploading) {
  border-color: var(--primary-color);
  background-color: rgba(24, 214, 0, 0.02);
}

.custom-file-upload.has-file {
  border-color: var(--primary-color);
  background-color: rgba(24, 214, 0, 0.05);
  border-style: solid;
}

.custom-file-upload.uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-icon-wrapper {
  margin: 0 auto 12px;
  background: var(--card-bg);
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  width: 24px;
  height: 24px;
  color: var(--text-muted);
}

.upload-icon.success {
  color: var(--primary-color);
}

.upload-text {
  font-size: 13px;
  color: var(--text-color);
  line-height: 1.5;
}

.upload-text strong {
  color: var(--primary-color);
  font-weight: 700;
}

.file-name {
  font-weight: 600;
  color: var(--text-color);
  word-break: break-all;
}

.hidden-input {
  display: none;
}

.text-right {
  text-align: right;
}

.btn-primary-sm {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary-sm:hover:not(:disabled) {
  opacity: 0.9;
}
.btn-primary-sm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


/* Preview Panel */
.preview-header {
  margin-bottom: 20px;
}
.preview-header h3 {
  font-size: 18px;
  margin: 0 0 5px 0;
  color: var(--text-main);
}
.preview-header p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.preview-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  position: relative;
}

.preview-image {
  width: 100%;
  aspect-ratio: 16/9;
  background: var(--bg-main);
  position: relative;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: var(--primary-color);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.preview-content {
  padding: 24px;
}

.preview-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.preview-description {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0 0 20px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.preview-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.meta-item {
  font-size: 12px;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item i {
  color: var(--text-muted);
}

.preview-price-box {
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
  margin-bottom: 20px;
}

.price-current {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-main);
}

.btn-preview-action {
  width: 100%;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: not-allowed;
  opacity: 0.9;
}

/* Magic Button (Mantiene el diseño solicitado) */
.btn-ia-magic {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 32px;
  overflow: hidden;
  letter-spacing: -0.05em;
  color: white;
  background-color: #1f2937;
  border-radius: 6px;
  border: none;
  cursor: not-allowed;
  font-family: inherit;
  font-size: 14px;
}
.btn-ia-magic .magic-circle {
  position: absolute;
  width: 0;
  height: 0;
  transition: all 0.5s ease-out;
  background-color: var(--primary-color);
  border-radius: 50%;
}
.btn-ia-magic:hover .magic-circle {
  width: 224px;
  height: 224px;
}
.btn-ia-magic .magic-svg-left {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  margin-left: -8px;
}
.btn-ia-magic .magic-svg-left svg {
  width: auto;
  height: 100%;
  opacity: 1;
}
.btn-ia-magic .magic-svg-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 48px;
  height: 100%;
  margin-right: -12px;
}
.btn-ia-magic .magic-svg-right svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.btn-ia-magic .magic-overlay {
  position: absolute;
  top: -4px; right: 0; bottom: 0; left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  opacity: 0.3;
  background: linear-gradient(to bottom, transparent, transparent, #e5e7eb);
}
.btn-ia-magic .magic-text-container {
  position: relative;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-ia-magic .text-default {
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.3s ease;
  opacity: 1;
}
.btn-ia-magic .text-hover {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  white-space: nowrap;
}
.btn-ia-magic:hover .text-default {
  opacity: 0;
}
.btn-ia-magic:hover .text-hover {
  opacity: 1;
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  z-index: 9999;
  min-width: 300px;
}

.toast-icon {
  margin-top: 2px;
}

.text-green { color: #10b981; }
.text-red { color: #ef4444; }

.toast-content h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.toast-content p {
  margin: 0;
  font-size: 13px;
  color: var(--text-color);
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  margin-left: auto;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Forms general */
.form-control {
  width: 100%;
  padding: 12px 15px;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.1);
}

@media (max-width: 992px) {
  .layout-split {
    flex-direction: column;
  }
  .preview-panel {
    width: 100%;
    position: static;
  }
}
</style>
