<template>
  <div class="course-detail-view">
    <!-- Header: Detalles del Curso -->
    <div class="card mb-4" v-if="course">
      <div class="card-body">
        <div class="course-header">
          <div class="course-image-wrapper">
            <img
              v-if="course.url_portada || course.portada"
              :src="getS3Url(course.url_portada || course.portada)"
              class="course-image"
              :alt="course.title"
              @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;"
            />
            <div v-else class="course-image-placeholder">
              <Monitor :size="48" style="color:#ccc" />
            </div>
          </div>
          <div class="course-info">
            <h2 class="course-title">{{ course.title }}</h2>
            <p class="course-description">{{ course.description || 'Sin descripción' }}</p>
            <div class="course-meta mt-2">
              <span class="badge">Curso</span>
              <span v-if="course.price" class="text-muted ml-2">Precio: {{ course.currency }} {{ course.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <Loader2 class="spinner" :size="36" />
      <p>Cargando recursos...</p>
    </div>

    <!-- Pestañas de Recursos -->
    <div class="card" v-else-if="course">
      <div class="card-body">
        <div class="marketplace-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="stats-tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <component :is="tab.icon" :size="15" />
            {{ tab.label }}
            <span class="count-badge" v-if="getResourceCount(tab.key) > 0">
              {{ getResourceCount(tab.key) }}
            </span>
          </button>
        </div>

        <div class="tab-content mt-3">
          <!-- Masterclasses -->
          <div v-show="activeTab === 'masterclass'">
            <div v-if="store.courseResources.masterclasses.length === 0" class="empty-state">
              <PlayCircle :size="40" class="empty-icon" />
              <p>No hay Masterclasses para este curso</p>
            </div>
            <div v-else class="row">
              <div v-for="item in store.courseResources.masterclasses" :key="item.id" class="col-md-4 mb-4">
                <div class="card c-card">
                  <div class="c-card-img-wrapper">
                    <img v-if="item.image" :src="getS3Url(item.image)" class="c-card-img" />
                    <div v-else class="c-card-img-placeholder"><PlayCircle :size="48" style="color:#ccc"/></div>
                  </div>
                  <div class="c-card-body">
                    <h5 class="c-card-title">{{ item.title }}</h5>
                    <p class="c-card-text">Fecha: {{ item.date }} {{ item.hour }}</p>
                    <button class="btn btn-primary btn-sm mt-2 w-100" @click="createLandingPage('masterclass', item)">
                      <Layout :size="14" class="mr-1"/> Crear Landing Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ebooks -->
          <div v-show="activeTab === 'ebook'">
            <div v-if="store.courseResources.ebooks.length === 0" class="empty-state">
              <BookOpen :size="40" class="empty-icon" />
              <p>No hay E-books para este curso</p>
            </div>
            <div v-else class="row">
              <div v-for="item in store.courseResources.ebooks" :key="item.id" class="col-md-4 mb-4">
                <div class="card c-card">
                  <div class="c-card-img-wrapper">
                    <img v-if="item.image" :src="getS3Url(item.image)" class="c-card-img" />
                    <div v-else class="c-card-img-placeholder"><BookOpen :size="48" style="color:#ccc"/></div>
                  </div>
                  <div class="c-card-body">
                    <h5 class="c-card-title">{{ item.title }}</h5>
                    <p class="c-card-text">Páginas: {{ item.pages || 'N/A' }}</p>
                    <button class="btn btn-info btn-sm mt-2 w-100 text-white" @click="createLandingPage('ebook', item)">
                      <Layout :size="14" class="mr-1"/> Crear Landing Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Minicursos -->
          <div v-show="activeTab === 'minicourse'">
            <div v-if="store.courseResources.minicourses.length === 0" class="empty-state">
              <Film :size="40" class="empty-icon" />
              <p>No hay Mini Cursos para este curso</p>
            </div>
            <div v-else class="row">
              <div v-for="item in store.courseResources.minicourses" :key="item.id" class="col-md-4 mb-4">
                <div class="card c-card">
                  <div class="c-card-img-wrapper">
                    <img v-if="item.image" :src="getS3Url(item.image)" class="c-card-img" />
                    <div v-else class="c-card-img-placeholder"><Film :size="48" style="color:#ccc"/></div>
                  </div>
                  <div class="c-card-body">
                    <h5 class="c-card-title">{{ item.title }}</h5>
                    <p class="c-card-text">Instructor: {{ item.instructor_name || 'Promolider' }}</p>
                    <button class="btn btn-warning btn-sm mt-2 w-100 text-white" @click="createLandingPage('minicourse', item)">
                      <Layout :size="14" class="mr-1"/> Crear Landing Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Material Promocional -->
          <div v-show="activeTab === 'promotional'">
            <div v-if="store.courseResources.promotional_materials.length === 0" class="empty-state">
              <Image :size="40" class="empty-icon" />
              <p>No hay materiales promocionales disponibles aún. Se subirán desde "Mis Herramientas" en el Aula Virtual.</p>
            </div>
            <div v-else class="row">
              <div v-for="item in store.courseResources.promotional_materials" :key="item.id" class="col-md-4 mb-4">
                <!-- Se implementará después cuando haya backend para esto -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarketplaceStore } from '../stores/marketplaceStore'
import { useAuthStore } from '@/features/auth/stores/authStore'
import {
  Monitor, PlayCircle, BookOpen, Film, Image, Loader2, Layout
} from 'lucide-vue-next'

const S3_BASE = 'https://promolider-storage-user.s3-accelerate.amazonaws.com'

function getS3Url(path) {
  if (!path) return ''
  if (path.includes('api.promolider.email')) {
    path = path.replace(/https?:\/\/api\.promolider\.email/g, '');
  }
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const cleanPath = path.startsWith('/') ? path : '/' + path
  return S3_BASE + cleanPath
}

const route = useRoute()
const router = useRouter()
const store = useMarketplaceStore()
const authStore = useAuthStore()

const loading = ref(false)
const activeTab = ref('masterclass')

const course = computed(() => store.currentCourse)

const tabs = [
  { key: 'masterclass', label: 'Masterclasses', icon: PlayCircle },
  { key: 'ebook', label: 'E-books', icon: BookOpen },
  { key: 'minicourse', label: 'Mini Cursos', icon: Film },
  { key: 'promotional', label: 'Material Promocional', icon: Image },
]

function getResourceCount(type) {
  switch (type) {
    case 'masterclass': return store.courseResources.masterclasses.length
    case 'ebook': return store.courseResources.ebooks.length
    case 'minicourse': return store.courseResources.minicourses.length
    case 'promotional': return store.courseResources.promotional_materials.length
    default: return 0
  }
}

async function loadData() {
  const id = route.params.id
  if (!id) return
  loading.value = true
  await store.fetchCourseResources(id)
  loading.value = false
  
  // Auto-select tab with items
  if (store.courseResources.masterclasses.length > 0) activeTab.value = 'masterclass'
  else if (store.courseResources.ebooks.length > 0) activeTab.value = 'ebook'
  else if (store.courseResources.minicourses.length > 0) activeTab.value = 'minicourse'
}

function createLandingPage(type, resource) {
  // Elegir plantilla base por defecto según tipo
  let defaultTemplate = 'demo-dark-pro'
  if (type === 'ebook') defaultTemplate = 'demo-light-clean'
  if (type === 'minicourse') defaultTemplate = 'demo-minimal-impact'
  
  router.push({
    name: 'marketing-pages-editor',
    query: {
      template: defaultTemplate,
      course_id: resource.id,
      course_type: type,
      userId: authStore.user?.id
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.course-detail-view {
  animation: fadeIn 0.4s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.course-header {
  display: flex;
  gap: 24px;
}
.course-image-wrapper {
  width: 250px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-main);
  flex-shrink: 0;
}
.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.course-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.course-info {
  flex: 1;
}
.course-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-bold);
  margin-bottom: 8px;
}
.course-description {
  color: var(--text-muted);
  line-height: 1.5;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .course-header {
    flex-direction: column;
  }
  .course-image-wrapper {
    width: 100%;
    height: 200px;
  }
}

/* Tabs */
.marketplace-tabs {
  display: flex; gap: 8px; flex-wrap: wrap; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;
}
.stats-tab-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent; border: none;
  padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600;
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.stats-tab-btn:hover { color: var(--primary-color); background: rgba(24,214,0,0.04); }
.stats-tab-btn.active { background: var(--primary-color); color: white; box-shadow: 0 4px 10px rgba(24,214,0,0.25); }
.count-badge {
  background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 12px; font-size: 11px;
}
.stats-tab-btn.active .count-badge { background: rgba(255,255,255,0.2); }

/* Loading / Empty */
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 12px; color: var(--text-muted); }
.spinner { animation: spin 1s linear infinite; color: var(--primary-color); }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; color: var(--text-muted); gap: 12px; text-align: center; }
.empty-icon { opacity: 0.4; }

/* Cards (reused styles) */
.c-card {
  border-radius: 12px; display: flex; flex-direction: column; height: 100%; overflow: hidden;
  border: 1px solid var(--border-color); background: var(--card-bg);
}
.c-card-img-wrapper { height: 180px; overflow: hidden; background: var(--bg-main); display: flex; align-items: center; justify-content: center; }
.c-card-img { width: 100%; height: 100%; object-fit: cover; }
.c-card-body { padding: 1.25rem; display: flex; flex-direction: column; flex: 1; gap: 6px; }
.c-card-title { font-size: 1rem; font-weight: 700; margin: 0; line-height: 1.3; }
.c-card-text { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
</style>
