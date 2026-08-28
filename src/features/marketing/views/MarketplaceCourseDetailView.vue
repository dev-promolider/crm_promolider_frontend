<template>
  <div class="course-detail-view">
    <!-- Botón Volver -->
    <div class="mb-4">
      <button class="btn-back-marketplace d-inline-flex align-items-center" @click="router.push('/marketing/marketplace')">
        <ArrowLeft :size="18" class="mr-2" /> Regresar al Marketplace
      </button>
    </div>

    <!-- Header Premium: Detalles del Curso -->
    <div class="premium-hero-header mb-4" v-if="course">
      <div class="hero-backdrop"></div>
      <div class="hero-content">
        <div class="hero-image-wrapper">
          <img
            v-if="course.url_portada || course.portada"
            :src="getS3Url(course.url_portada || course.portada)"
            class="hero-image"
            :alt="course.title"
            @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex';"
          />
          <div class="hero-image-placeholder" :style="(course.url_portada || course.portada) ? 'display:none;' : 'display:flex;'">
            <div class="placeholder-gradient"></div>
            <Monitor :size="64" class="placeholder-icon" />
          </div>
        </div>
        <div class="hero-info">
          <div class="hero-badges mb-2">
            <span class="premium-badge"><Monitor :size="12" class="mr-1" style="position:relative; top:-1px;"/> CURSO DE FORMACIÓN</span>
          </div>
          <h1 class="hero-title">{{ course.title }}</h1>
          <p class="hero-description">{{ course.description || 'Desbloquea tus habilidades paso a paso con este curso. Acceso inmediato a recursos, masterclasses y herramientas de alta calidad.' }}</p>
          <div class="hero-meta mt-4">
            <div class="price-tag" v-if="course.price">
              <span class="currency">USD</span>
              <span class="amount">${{ course.price }}</span>
            </div>
            <div class="price-tag free-tag" v-else>
              <span class="amount">GRATIS</span>
            </div>
            <div class="stats-fake">
              <span class="stat-item">⭐ 4.9 (Valoración)</span>
              <span class="stat-item">👥 Contenido Premium</span>
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
            <div v-else class="resources-grid">
              <div v-for="item in store.courseResources.masterclasses" :key="item.id" class="card c-card">
                <div class="c-card-img-wrapper">
                  <img v-if="item.image" :src="getS3Url(item.image)" class="c-card-img" />
                  <div v-else class="c-card-img-placeholder"><PlayCircle :size="48" style="color:#ccc"/></div>
                </div>
                <div class="c-card-body">
                  <h5 class="c-card-title">{{ item.title }}</h5>
                  <p class="c-card-text">Fecha: {{ item.date }} {{ item.hour }}</p>
                  <button class="btn-ia-magic mt-2 w-100" @click="createLandingPage('masterclass', item)">
                    <span class="magic-circle"></span>
                    <span class="magic-svg-left"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487"><path fill-opacity=".1" fill-rule="nonzero" fill="#FFF" d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"></path></svg></span>
                    <span class="magic-svg-right"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487"><path fill-opacity=".1" fill-rule="nonzero" fill="#FFF" d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"></path></svg></span>
                    <span class="magic-overlay"></span>
                    <span class="magic-text-container">
                      <span class="text-default"><Layout :size="14" class="mr-1"/> Generar Página Embudo</span>
                    </span>
                  </button>
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
            <div v-else class="resources-grid">
              <div v-for="item in store.courseResources.ebooks" :key="item.id" class="card c-card">
                <div class="c-card-img-wrapper">
                  <img v-if="item.image" :src="getS3Url(item.image)" class="c-card-img" />
                  <div v-else class="c-card-img-placeholder"><BookOpen :size="48" style="color:#ccc"/></div>
                </div>
                <div class="c-card-body">
                  <h5 class="c-card-title">{{ item.title }}</h5>
                  <p class="c-card-text">Páginas: {{ item.pages || 'N/A' }}</p>
                  <button class="btn-ia-magic mt-2 w-100" @click="createLandingPage('ebook', item)">
                    <span class="magic-circle"></span>
                    <span class="magic-svg-left"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487"><path fill-opacity=".1" fill-rule="nonzero" fill="#FFF" d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"></path></svg></span>
                    <span class="magic-svg-right"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487"><path fill-opacity=".1" fill-rule="nonzero" fill="#FFF" d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"></path></svg></span>
                    <span class="magic-overlay"></span>
                    <span class="magic-text-container">
                      <span class="text-default"><Layout :size="14" class="mr-1"/> Generar Página Embudo</span>
                    </span>
                  </button>
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
            <div v-else class="resources-grid">
              <div v-for="item in store.courseResources.minicourses" :key="item.id" class="card c-card">
                <div class="c-card-img-wrapper">
                  <img v-if="item.image" :src="getS3Url(item.image)" class="c-card-img" />
                  <div v-else class="c-card-img-placeholder"><Film :size="48" style="color:#ccc"/></div>
                </div>
                <div class="c-card-body">
                  <h5 class="c-card-title">{{ item.title }}</h5>
                  <p class="c-card-text">Instructor: {{ item.instructor_name || 'Promolider' }}</p>
                  <button class="btn-ia-magic mt-2 w-100" @click="createLandingPage('minicourse', item)">
                    <span class="magic-circle"></span>
                    <span class="magic-svg-left"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487"><path fill-opacity=".1" fill-rule="nonzero" fill="#FFF" d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"></path></svg></span>
                    <span class="magic-svg-right"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487"><path fill-opacity=".1" fill-rule="nonzero" fill="#FFF" d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"></path></svg></span>
                    <span class="magic-overlay"></span>
                    <span class="magic-text-container">
                      <span class="text-default"><Layout :size="14" class="mr-1"/> Generar Página Embudo</span>
                    </span>
                  </button>
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
            
            <div v-else class="promotional-sections">
              
              <!-- Seccion de Descripciones -->
              <div v-if="descripciones.length > 0" class="promo-section mb-5">
                <h4 class="promo-section-title"><FileText :size="20" class="mr-2" style="position:relative; top:-2px;"/> Textos Persuasivos (Copy)</h4>
                <div class="promotional-grid text-grid mt-3">
                  <div v-for="item in descripciones" :key="item.id" class="card p-4 copy-card h-100 d-flex flex-column">
                    <h6 class="font-weight-bold mb-3">{{ item.title || 'Texto Promocional' }}</h6>
                    <div class="copy-text mb-4 flex-grow-1">
                      {{ item.content }}
                    </div>
                    <button class="btn-promo-action" @click="copyToClipboard(item.content)">
                      <Copy :size="14" class="mr-1"/> Copiar texto
                    </button>
                  </div>
                </div>
              </div>

              <!-- Seccion de Imagenes -->
              <div v-if="imagenes.length > 0" class="promo-section mb-5">
                <h4 class="promo-section-title"><Image :size="20" class="mr-2" style="position:relative; top:-2px;"/> Flyers y Banners</h4>
                <div class="promotional-grid media-grid mt-3">
                  <div v-for="item in imagenes" :key="item.id" class="card media-card p-2 h-100 d-flex flex-column">
                    <div class="media-wrapper flex-grow-1 mb-2" style="cursor: pointer;" @click="previewMedia = item">
                      <img :src="getS3Url(item.file_path)" class="media-img" />
                    </div>
                    <div class="promo-action-buttons w-100 mt-auto">
                      <button class="btn-promo-action btn-promo-secondary flex-grow-1" @click="previewMedia = item">
                        <Eye :size="14" class="mr-1"/> Ver
                      </button>
                      <a :href="getS3Url(item.file_path)" target="_blank" class="btn-promo-action btn-promo-primary flex-grow-1 text-center">
                        <Download :size="14" class="mr-1"/> Descargar
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Seccion de Videos -->
              <div v-if="videos.length > 0" class="promo-section mb-4">
                <h4 class="promo-section-title"><Film :size="20" class="mr-2" style="position:relative; top:-2px;"/> Videos Promocionales</h4>
                <div class="promotional-grid video-grid mt-3">
                  <div v-for="item in videos" :key="item.id" class="card video-card p-3 h-100 d-flex flex-column">
                    <h6 class="font-weight-bold mb-2">{{ item.title || 'Video' }}</h6>
                    <div class="video-wrapper flex-grow-1 mb-3" style="cursor: pointer;" @click="previewMedia = item">
                      <!-- El video no tiene controls por defecto si lo usan para preview clickeable, pero lo mantenemos por usabilidad. Usamos div overlay invisible para clickear -->
                      <div class="video-click-overlay" style="position:absolute; inset:0; z-index:1;" @click="previewMedia = item"></div>
                      <video :src="getS3Url(item.file_path)" class="video-player" controls preload="metadata"></video>
                    </div>
                    <div class="promo-action-buttons w-100">
                      <button class="btn-promo-action btn-promo-secondary flex-grow-1" @click="previewMedia = item">
                        <Eye :size="14" class="mr-1"/> Ver
                      </button>
                      <a :href="getS3Url(item.file_path)" target="_blank" class="btn-promo-action btn-promo-primary flex-grow-1 text-center">
                        <Download :size="14" class="mr-1"/> Descargar
                      </a>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Previsualización Full Screen -->
    <div v-if="previewMedia" class="media-preview-overlay" @click="previewMedia = null">
      <button class="close-preview" @click.stop="previewMedia = null"><X :size="24" /></button>
      <img v-if="previewMedia.type === 'image' || previewMedia.type === 'banner'" :src="getS3Url(previewMedia.file_path)" class="preview-img" @click.stop />
      <video v-if="previewMedia.type === 'video'" :src="getS3Url(previewMedia.file_path)" class="preview-video" controls autoplay @click.stop></video>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarketplaceStore } from '../stores/marketplaceStore'
import { useAuthStore } from '@/features/auth/stores/authStore'
import {
  Monitor, PlayCircle, BookOpen, Film, Image, Loader2, Layout, Download, FileText, Copy, Eye, X, ArrowLeft
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
const activeTab = ref('promotional')
const previewMedia = ref(null)

const course = computed(() => store.currentCourse)

const tabs = [
  { key: 'promotional', label: 'Material Promocional', icon: Image },
  { key: 'masterclass', label: 'Masterclasses', icon: PlayCircle },
  { key: 'ebook', label: 'E-books', icon: BookOpen },
  { key: 'minicourse', label: 'Mini Cursos', icon: Film },
]

// Promotional Materials Splitting
const descripciones = computed(() => store.courseResources.promotional_materials.filter(m => m.type === 'description'))
const imagenes = computed(() => store.courseResources.promotional_materials.filter(m => m.type === 'image' || m.type === 'banner' || m.type === 'flyer'))
const videos = computed(() => store.courseResources.promotional_materials.filter(m => m.type === 'video'))

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Texto copiado al portapapeles con éxito')
  }).catch(err => {
    console.error('Error al copiar: ', err)
  })
}

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
  if (store.courseResources.promotional_materials && store.courseResources.promotional_materials.length > 0) activeTab.value = 'promotional'
  else if (store.courseResources.masterclasses && store.courseResources.masterclasses.length > 0) activeTab.value = 'masterclass'
  else if (store.courseResources.ebooks && store.courseResources.ebooks.length > 0) activeTab.value = 'ebook'
  else if (store.courseResources.minicourses && store.courseResources.minicourses.length > 0) activeTab.value = 'minicourse'
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

/* Botón Regresar */
.btn-back-marketplace {
  display: inline-flex;
  align-items: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  cursor: pointer;
}
.btn-back-marketplace:hover {
  background: var(--bg-main);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  color: var(--primary-color);
}

/* Premium Hero Header */
.premium-hero-header {
  position: relative;
  border-radius: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}
.hero-backdrop {
  position: absolute;
  top: -50%; left: -50%; right: -50%; bottom: -50%;
  background: radial-gradient(circle at top right, rgba(0, 208, 228, 0.15) 0%, transparent 40%),
              radial-gradient(circle at bottom left, rgba(32, 226, 5, 0.15) 0%, transparent 40%);
  z-index: 0;
  pointer-events: none;
}
.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  padding: 40px;
  gap: 40px;
  align-items: center;
}
.hero-image-wrapper {
  flex-shrink: 0;
  width: 300px;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 15px 35px rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.05);
  background: #111;
}
.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.hero-image-wrapper:hover .hero-image {
  transform: scale(1.08);
}
.hero-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.placeholder-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #18181b, #27272a);
}
.placeholder-gradient::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(32, 226, 5, 0.15), rgba(0, 208, 228, 0.15));
  backdrop-filter: blur(20px);
}
.placeholder-icon {
  position: relative;
  z-index: 2;
  color: rgba(255,255,255,0.7);
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
}
.hero-info {
  flex: 1;
}
.premium-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(90deg, var(--primary-color), #00d0e4);
  color: #fff;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(32, 226, 5, 0.3);
}
.hero-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 15px;
  line-height: 1.25;
  text-wrap: balance;
}
.hero-description {
  color: var(--text-muted);
  font-size: 1.05rem;
  line-height: 1.6;
  max-width: 95%;
  margin-bottom: 0;
}
.hero-meta {
  display: flex;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
}
.price-tag {
  display: flex;
  align-items: baseline;
  background: rgba(255,255,255,0.03);
  padding: 10px 24px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}
.price-tag .currency {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-right: 6px;
  font-weight: 600;
}
.price-tag .amount {
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--text-color);
  line-height: 1;
}
.free-tag .amount {
  color: var(--primary-color);
}
.stats-fake {
  display: flex;
  gap: 24px;
}
.stat-item {
  font-size: 0.95rem;
  color: var(--text-muted);
  font-weight: 500;
  display: flex;
  align-items: center;
}

@media (max-width: 992px) {
  .hero-title { font-size: 1.8rem; }
  .hero-image-wrapper { width: 240px; height: 160px; }
  .hero-content { padding: 30px; gap: 30px; }
}
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
    gap: 20px;
  }
  .hero-image-wrapper {
    width: 100%;
    max-width: 320px;
    height: 180px;
  }
  .hero-description {
    max-width: 100%;
  }
  .hero-meta {
    justify-content: center;
    gap: 20px;
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
.c-card-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(32, 226, 5, 0.1) 0%, rgba(0, 208, 228, 0.1) 100%); border-bottom: 1px solid rgba(255,255,255,0.05); }

/* Grid de Recursos */
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Material Promocional Scroll Horizontal */
.promotional-grid { 
  display: grid; 
  gap: 20px; 
  grid-auto-flow: column; 
  overflow-x: auto;
  padding-bottom: 15px; /* Espacio para la barra de scroll */
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
/* Ocultar scrollbar en algunos navegadores para que se vea más limpio pero mantener funcionalidad */
.promotional-grid::-webkit-scrollbar { height: 6px; }
.promotional-grid::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }
.promotional-grid::-webkit-scrollbar-track { background: transparent; }

.text-grid { grid-auto-columns: minmax(320px, 350px); }
.media-grid { grid-auto-columns: minmax(180px, 220px); }
.video-grid { grid-auto-columns: minmax(280px, 320px); }
.promotional-grid > * { scroll-snap-align: start; }

.promo-section-title { font-size: 1.15rem; font-weight: 700; color: var(--text-color); border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px; }

/* Tarjetas */
.copy-card { background: var(--card-bg); border: 1px solid var(--border-color); transition: transform 0.2s, box-shadow 0.2s; }
.copy-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.copy-text { 
  font-size: 0.9rem; 
  color: var(--text-color); 
  white-space: pre-wrap; 
  line-height: 1.5; 
  background: var(--bg-main); 
  padding: 15px; 
  border-radius: 8px; 
  border: 1px solid var(--border-color); 
  height: 200px;
  overflow-y: auto;
}
.copy-text::-webkit-scrollbar { width: 6px; }
.copy-text::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 10px; }
.copy-text::-webkit-scrollbar-track { background: transparent; }

.media-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; transition: transform 0.2s; }
.media-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.media-wrapper { width: 100%; border-radius: 8px; overflow: hidden; background: var(--bg-main); display: flex; align-items: center; justify-content: center; aspect-ratio: 1 / 1; }
.media-img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.3s; }
.media-wrapper:hover .media-img { transform: scale(1.05); }

.video-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; transition: transform 0.2s; }
.video-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.video-wrapper { position: relative; width: 100%; border-radius: 8px; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; aspect-ratio: 16 / 9; }
.video-player { width: 100%; height: 100%; object-fit: contain; position: relative; z-index: 0; }
.video-click-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 10; cursor: pointer; background: transparent; }

/* Magic Button / Premium Button para Landing Pages */
.btn-ia-magic {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 32px;
  overflow: hidden;
  letter-spacing: -0.02em;
  color: white;
  background-color: #1f2937;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.3s ease;
}
.btn-ia-magic:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}
.btn-ia-magic .magic-circle {
  position: absolute;
  width: 0;
  height: 0;
  transition: all 0.5s ease-out;
  background: linear-gradient(135deg, var(--primary-color), #00d0e4);
  border-radius: 50%;
  opacity: 0.8;
}
.btn-ia-magic:hover .magic-circle {
  width: 400px;
  height: 400px;
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
  background: linear-gradient(to bottom, transparent, transparent, rgba(255,255,255,0.4));
}
.btn-ia-magic .magic-text-container {
  position: relative;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.btn-ia-magic .text-default {
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  opacity: 1;
}

/* Botones Personalizados */
.btn-promo-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-main);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}
.btn-promo-action:hover {
  background: var(--border-color);
}
.btn-promo-primary {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}
.btn-promo-primary:hover {
  filter: brightness(1.1);
  color: #fff;
}
.btn-promo-secondary {
  background: rgba(128,128,128,0.1);
}
.btn-promo-secondary:hover {
  background: rgba(128,128,128,0.2);
}
.promo-action-buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 8px;
}
.promo-action-buttons > * {
  flex: 1;
}

/* Media Preview Modal */
.media-preview-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.95);
  z-index: 1050; /* Por encima del header y sidebar */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.preview-img, .preview-video {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  object-fit: contain;
}
.close-preview {
  position: absolute;
  top: 25px; right: 25px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  width: 44px; height: 44px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1060;
}
.close-preview:hover { 
  background: rgba(255,255,255,0.2);
  transform: scale(1.05);
}
</style>
