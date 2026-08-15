<template>
  <div class="marketplace-view">
    <div class="card">
      <div class="card-body">
        <div class="card-header">
          <div>
            <h4 class="card-title">Marketplace</h4>
            <span class="card-meta">Explora los Cursos del Aula Virtual</span>
          </div>
        </div>

        <!-- Search -->
        <div class="marketplace-search">
          <Search :size="16" class="search-icon" />
          <input type="text" class="search-input" v-model="searchQuery" placeholder="Buscar cursos..." @input="debouncedSearch" />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <Loader2 class="spinner" :size="36" />
          <p>Cargando cursos...</p>
        </div>

        <!-- Content -->
        <div v-else class="tab-content mt-1">
          <div v-if="store.courses.length === 0" class="empty-state">
            <Monitor :size="40" class="empty-icon" />
            <p>No se encontraron cursos activos</p>
          </div>
          <div v-else class="row">
            <div v-for="item in store.courses" :key="item.id" class="col-md-4 mb-4 grid-col">
              <div class="card c-card" @click="goToDetail(item.id)">
                <div class="c-card-img-wrapper">
                  <img
                    v-if="item.url_portada || item.portada"
                    :src="getS3Url(item.url_portada || item.portada)"
                    class="c-card-img"
                    :alt="item.title"
                    @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;"
                  />
                  <div v-else class="c-card-img-placeholder">
                    <Monitor :size="48" style="color:#ccc" />
                  </div>
                </div>
                <div class="c-card-body">
                  <h5 class="c-card-title">{{ item.title }}</h5>
                  <p class="c-card-text">
                    {{ item.description ? item.description.substring(0, 80) + '...' : 'Sin descripción' }}
                  </p>
                  <div class="c-card-footer">
                    <span class="c-badge c-badge--course">
                      Curso
                    </span>
                  </div>
                </div>
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
import { useRouter } from 'vue-router'
import { useMarketplaceStore } from '../stores/marketplaceStore'
import {
  Search, Loader2, Monitor
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

const router = useRouter()
const store = useMarketplaceStore()

const searchQuery = ref('')
const loading = ref(false)

// Normalize campaigns data for uniform rendering
const normalizedCampaigns = computed(() => {
  return filteredCampaigns.value.map(item => ({
    ...item,
    id: item.id,
    image: item.image ||
      (item.images && item.images.length > 0
        ? (item.images[0].image_path || item.images[0].image)
        : null),
    title: item.title || item.nombre,
    category_name: item.category_name,
  }))
})

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadTabData(), 300)
}

async function loadTabData() {
  loading.value = true
  const params = {}
  if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
  try {
    await store.fetchCourses(params)
  } finally {
    loading.value = false
  }
}

function goToDetail(id) {
  router.push({ name: 'marketing-marketplace-course-detail', params: { id } })
}



onMounted(async () => { await loadTabData() })
</script>

<style scoped>
.marketplace-view { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.card-header { margin-bottom: 8px; }
.card-meta { font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px; }

/* Tabs */
.marketplace-tabs,
.campaign-subtabs {
  display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;
}
.stats-tab-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent; border: 1px solid var(--border-color);
  padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.stats-tab-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(24,214,0,0.04); }
.stats-tab-btn.active { background: var(--primary-color); color: white; border-color: var(--primary-color); box-shadow: 0 4px 10px rgba(24,214,0,0.25); }

.campaign-subtabs .stats-tab-btn { font-size: 12px; padding: 5px 12px; }
.campaign-subtabs .stats-tab-btn.active { background: #6c757d; border-color: #6c757d; box-shadow: 0 4px 10px rgba(108,117,125,0.25); }

/* Search */
.marketplace-search {
  position: relative; margin-bottom: 16px; max-width: 360px;
}
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-light); pointer-events: none; }
.search-input {
  width: 100%; padding: 8px 12px 8px 38px;
  border: 1px solid var(--border-color); border-radius: 8px;
  font-size: 13px; background: var(--card-bg); color: var(--text-main);
  transition: border-color 0.2s;
}
.search-input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24,214,0,0.08); }

/* Loading / Empty */
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 12px; color: var(--text-muted); }
.spinner { animation: spin 1s linear infinite; color: var(--primary-color); }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px; color: var(--text-muted); gap: 10px; }
.empty-icon { opacity: 0.4; }

/* Campaign cards (c-card prefix to avoid conflict with outer .card-body) */
.c-card {
  cursor: pointer;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  backdrop-filter: blur(16px);
}
.c-card:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  transform: translateY(-4px);
  border-color: rgba(24, 214, 0, 0.2);
}
.c-card:hover .c-card-img {
  transform: scale(1.05);
}
.c-card-img-wrapper {
  position: relative;
  overflow: hidden;
  height: 200px;
  background: var(--bg-main);
}
.c-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.4s ease;
}
.c-card-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-main);
}
.c-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  gap: 8px;
}
.c-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-bold);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.c-card-text {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.5;
  flex: 1;
}
.c-card-footer {
  margin-top: auto;
  padding-top: 8px;
}
.c-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
}
.c-badge--course {
  background: rgba(40, 167, 69, 0.12);
  color: #166534;
}
body.dark-theme .c-badge--course {
  background: rgba(40, 167, 69, 0.2);
  color: #4ade80;
}
</style>

<!-- Global grid styles - non-scoped so they apply to child component elements -->
<style>
.marketplace-view .row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -12px;
}
.marketplace-view .row > [class*="col-"] {
  padding: 0 12px;
}
.marketplace-view .col-md-4 {
  flex: 0 0 33.333%;
  max-width: 33.333%;
  display: flex;
}

/* Vertical spacing between card rows */
.marketplace-view .mb-4 {
  margin-bottom: 2rem;
}
@media (max-width: 992px) {
  .marketplace-view .col-md-4 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}
@media (max-width: 768px) {
  .marketplace-view .col-md-4 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>
