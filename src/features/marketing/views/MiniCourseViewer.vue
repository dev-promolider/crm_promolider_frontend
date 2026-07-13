<template>
  <div class="mini-course-viewer">
    <!-- Header del Curso -->
    <div class="course-header mb-6">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <div class="flex-1">
          <h1 class="text-3xl md:text-4xl font-bold mb-4">{{ miniCourse.title }}</h1>
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="badge badge-primary">
              <Clock :size="14" class="inline mr-1" />{{ miniCourse.duration }} minutos
            </span>
            <span class="badge badge-success">
              <Signal :size="14" class="inline mr-1" />{{ formatLevel(miniCourse.level) }}
            </span>
            <span class="badge badge-info">
              <Folder :size="14" class="inline mr-1" />{{ miniCourse.category_name }}
            </span>
          </div>
          <p class="text-white/90 text-lg leading-relaxed">{{ miniCourse.description }}</p>
        </div>
        <div class="flex-shrink-0" v-if="miniCourse.images && miniCourse.images.length > 0">
          <img
            :src="miniCourse.images[0].image"
            alt="Imagen del curso"
            class="w-48 h-32 object-cover rounded-lg shadow-lg border-2 border-white/30"
          />
        </div>
      </div>
    </div>

    <!-- Navegación por pestañas -->
    <div class="tabs-container mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
        v-if="tab.count > 0"
      >
        <component :is="tab.icon" :size="16" />
        {{ tab.label }} ({{ tab.count }})
      </button>
    </div>

    <!-- TAB: Módulos -->
    <div v-if="activeTab === 'modules'" class="tab-content">
      <div v-for="(modulo, index) in miniCourse.modules" :key="'module-' + index"
        class="module-card card mb-4">
        <div class="card-header">
          <div class="flex justify-between items-center">
            <h5 class="font-bold text-lg">
              <span class="module-number">{{ index + 1 }}.</span>
              {{ modulo.title }}
            </h5>
            <span class="badge badge-primary text-sm">
              <Clock :size="12" class="inline mr-1" />{{ modulo.duration }} mins
            </span>
          </div>
        </div>
        <div class="card-body">
          <p class="text-gray-600 leading-relaxed">{{ modulo.content }}</p>
        </div>
      </div>
      <div v-if="!miniCourse.modules || miniCourse.modules.length === 0" class="text-center py-8 text-gray-400">
        <BookOpen :size="48" class="mx-auto mb-2" />
        <p>No hay módulos disponibles</p>
      </div>
    </div>

    <!-- TAB: Videos -->
    <div v-if="activeTab === 'videos'" class="tab-content">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="(video, index) in miniCourse.videos" :key="'video-' + index"
          class="video-card card">
          <div class="video-wrapper">
            <video
              :src="video.video"
              class="w-full video-player"
              controls
              preload="metadata"
              playsinline
            >
              Tu navegador no soporta el elemento video.
            </video>
          </div>
          <div class="p-4">
            <h6 class="font-semibold mb-1">{{ video.title }}</h6>
            <p class="text-sm text-gray-500 mb-2" v-if="video.description">{{ video.description }}</p>
            <div class="flex gap-3 text-xs text-gray-400">
              <span><Clock :size="12" class="inline mr-1" />{{ video.duration }} mins</span>
              <span><ListOrdered :size="12" class="inline mr-1" />Orden: {{ video.order }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!miniCourse.videos || miniCourse.videos.length === 0" class="text-center py-8 text-gray-400">
        <Video :size="48" class="mx-auto mb-2" />
        <p>No hay videos disponibles</p>
      </div>
    </div>

    <!-- TAB: Documentos -->
    <div v-if="activeTab === 'documents'" class="tab-content">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="(doc, index) in miniCourse.documents" :key="'doc-' + index"
          class="document-card card text-center">
          <div class="p-6 flex flex-col items-center gap-3">
            <FileText :size="48" class="text-primary" />
            <h6 class="font-semibold">{{ doc.name || 'Documento ' + (index + 1) }}</h6>
            <a
              :href="doc.document"
              target="_blank"
              class="btn btn-primary btn-sm"
            >
              <Download :size="14" class="inline mr-1" />
              Ver documento
            </a>
          </div>
        </div>
      </div>
      <div v-if="!miniCourse.documents || miniCourse.documents.length === 0" class="text-center py-8 text-gray-400">
        <FileText :size="48" class="mx-auto mb-2" />
        <p>No hay documentos disponibles</p>
      </div>
    </div>

    <!-- TAB: Galería -->
    <div v-if="activeTab === 'gallery'" class="tab-content">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="(image, index) in miniCourse.images" :key="'image-' + index"
          class="image-card" @click="openImageModal(image.image, index)">
          <img
            :src="image.image"
            :alt="'Imagen ' + (index + 1)"
            class="gallery-image"
          />
        </div>
      </div>
      <div v-if="!miniCourse.images || miniCourse.images.length === 0" class="text-center py-8 text-gray-400">
        <Image :size="48" class="mx-auto mb-2" />
        <p>No hay imágenes disponibles</p>
      </div>
    </div>

    <!-- Modal de imágenes -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeImageModal">
        <div class="modal-container max-w-4xl">
          <div class="modal-header-bar">
            <h5 class="font-bold">Imagen {{ currentImageIndex + 1 }}</h5>
            <button @click="closeImageModal" class="btn-close">&times;</button>
          </div>
          <div class="p-4 text-center">
            <img :src="currentImage" alt="Imagen ampliada" class="max-h-[70vh] mx-auto object-contain" />
          </div>
          <div class="modal-footer-row" v-if="miniCourse.images && miniCourse.images.length > 1">
            <button @click="previousImage" :disabled="currentImageIndex === 0"
              class="btn btn-outline btn-sm">
              <ChevronLeft :size="16" class="inline mr-1" /> Anterior
            </button>
            <button @click="nextImage" :disabled="currentImageIndex === miniCourse.images.length - 1"
              class="btn btn-outline btn-sm">
              Siguiente <ChevronRight :size="16" class="inline ml-1" />
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/services/apiClient'
import {
  Clock, Signal, Folder, BookOpen, Video,
  FileText, Download, Image,
  ChevronLeft, ChevronRight, ListOrdered
} from 'lucide-vue-next'

const route = useRoute()
const miniCourse = ref({
  title: '',
  duration: 0,
  level: '',
  category_name: '',
  description: '',
  modules: [],
  videos: [],
  documents: [],
  images: []
})
const activeTab = ref('modules')
const showModal = ref(false)
const currentImage = ref('')
const currentImageIndex = ref(0)

const tabs = computed(() => [
  { key: 'modules', label: 'Módulos', icon: BookOpen, count: miniCourse.value.modules?.length || 0 },
  { key: 'videos', label: 'Videos', icon: Video, count: miniCourse.value.videos?.length || 0 },
  { key: 'documents', label: 'Documentos', icon: FileText, count: miniCourse.value.documents?.length || 0 },
  { key: 'gallery', label: 'Galería', icon: Image, count: (miniCourse.value.images?.length || 0) > 1 ? miniCourse.value.images.length : 0 }
])

function formatLevel(level) {
  const levels = {
    principiante: 'Principiante',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado'
  }
  return levels[level] || level || 'Principiante'
}

function openImageModal(imageSrc, index) {
  currentImage.value = imageSrc
  currentImageIndex.value = index
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeImageModal() {
  showModal.value = false
  document.body.style.overflow = ''
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
    currentImage.value = miniCourse.value.images[currentImageIndex.value].image
  }
}

function nextImage() {
  if (currentImageIndex.value < miniCourse.value.images.length - 1) {
    currentImageIndex.value++
    currentImage.value = miniCourse.value.images[currentImageIndex.value].image
  }
}

onMounted(async () => {
  try {
    const res = await apiClient.get(`/marketing/marketplace/mini-course/${route.params.id}`)
    if (res.data.success && res.data.data) {
      miniCourse.value = {
        ...miniCourse.value,
        ...res.data.data,
        modules: res.data.data.modules || [],
        videos: res.data.data.videos || [],
        documents: res.data.data.documents || [],
        images: res.data.data.images || []
      }
    }
  } catch (e) {
    console.error('Error al cargar mini curso:', e)
  }
})
</script>

<style scoped>
.mini-course-viewer {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

/* Header */
.course-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 15px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
}

.badge-primary { background: rgba(255, 255, 255, 0.2); color: white; }
.badge-success { background: rgba(40, 167, 69, 0.3); color: #a3e6b5; }
.badge-info { background: rgba(23, 162, 184, 0.3); color: #9eeaf9; }

/* Tabs */
.tabs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 25px;
  background: white;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Cards */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.module-card .card-header {
  background: #f9fafb;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 12px 12px 0 0;
}

.module-card .card-body {
  padding: 1.5rem;
}

.module-number {
  color: #667eea;
  font-weight: 700;
  font-size: 1.2rem;
  margin-right: 8px;
}

/* Video */
.video-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.video-player {
  height: 200px;
  object-fit: cover;
  background: #000;
}

/* Document */
.document-card {
  transition: all 0.3s ease;
}

.document-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Gallery */
.image-card {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.image-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.gallery-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 15px;
  max-width: 900px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: fadeInScale 0.3s ease;
}

.modal-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #9ca3af;
  line-height: 1;
  padding: 0 8px;
}

.btn-close:hover { color: #374151; }

.modal-footer-row {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary { background: #667eea; color: white; }
.btn-primary:hover { background: #5a6fd6; }

.btn-outline {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}
.btn-outline:hover { background: #f3f4f6; border-color: #9ca3af; }
.btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-sm { font-size: 0.85rem; padding: 0.4rem 0.8rem; }

/* Animations */
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.tab-content {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .mini-course-viewer { padding: 16px; }
  .course-header { padding: 1.5rem; }
  .tab-btn { padding: 0.5rem 1rem; font-size: 0.85rem; }
}
</style>
