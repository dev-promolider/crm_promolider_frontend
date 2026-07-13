<template>
  <div class="trivia-dynamic-designer">
    <section class="card mb-4">
      <div class="card-header header-with-actions">
        <div>
          <small>Modulo 1</small>
          <h4>Categorias de preguntas</h4>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-sm btn-outline-primary" @click="goToCategoriesList">
            Ver categorias
          </button>
          <button type="button" class="btn btn-sm btn-primary" @click="goToCategoriesCreate">
            Nueva categoria
          </button>
        </div>
      </div>
      <div class="card-body">
        <div v-if="activeCategories.length" class="active-categories">
          <p>Categorias activas disponibles</p>
          <div class="flex-row flex-wrap">
            <span v-for="category in activeCategories" :key="category.id" class="badge badge-primary">
              {{ category.name }}
            </span>
          </div>
        </div>
        <p v-else class="text-muted">Aun no hay categorias activas.</p>
      </div>
    </section>

    <section class="card mb-4">
      <div class="card-header">
        <small>Modulo 1.5</small>
        <h4>Configuracion de inscripcion</h4>
      </div>
      <div class="card-body">
        <div class="flex-row">
          <div class="flex-6">
            <div class="form-group">
              <label>Limite de participantes</label>
              <input type="number" class="form-control" min="1" v-model.number="registrationConfig.participantsLimit" placeholder="Ej: 150" />
            </div>
          </div>
          <div class="flex-6">
            <div class="form-group">
              <label>Cierre del registro (hora exacta)</label>
              <input type="time" class="form-control" v-model="registrationConfig.closingTime" />
              <small class="form-hint">Puedes modificarlo en cualquier momento.</small>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <small>Modulo 2</small>
        <h4>Dinamica de trivia</h4>
      </div>
      <div class="card-body">
        <div class="flex-row">
          <div class="flex-7">
            <div class="config-card">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5>Configuracion principal</h5>
                  <p class="text-muted small">Define lo que veran los jugadores antes de jugar.</p>
                </div>
              </div>
              <div class="form-group">
                <label>Nombre publico</label>
                <input type="text" class="form-control" v-model="triviaConfig.name" placeholder="Ej: Trivia Bienestar Corporativo" />
              </div>
              <div class="form-group">
                <label>Descripcion</label>
                <textarea class="form-control" rows="3" v-model="triviaConfig.description" placeholder="Describe el objetivo o los premios"></textarea>
              </div>
              <div class="form-group">
                <label>Slug (opcional)</label>
                <div class="input-prefix">
                  <span class="input-prefix-text">marketing/trivia/</span>
                  <input type="text" class="form-control" v-model="triviaConfig.slug" placeholder="bienestar-2026" />
                </div>
              </div>
              <div class="form-group">
                <label>Rango de puntos</label>
                <div class="flex-row align-items-center">
                  <div class="flex-6">
                    <input type="number" class="form-control" min="1" v-model.number="triviaConfig.pointsMin" placeholder="Min" />
                  </div>
                  <div class="flex-auto text-center">—</div>
                  <div class="flex-6">
                    <input type="number" class="form-control" :min="triviaConfig.pointsMin" v-model.number="triviaConfig.pointsMax" placeholder="Max" />
                  </div>
                </div>
              </div>
              <div class="game-blocks">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6>Bloques y categorias en juego</h6>
                    <p class="text-muted small">Define el orden exacto de las categorias.</p>
                  </div>
                  <button type="button" class="btn-outline-primary btn-sm" @click="toggleCategoryPicker" :disabled="!availableCategoryOptions.length">
                    {{ categoryPickerLabel }}
                  </button>
                </div>
                <div v-if="isCategoryPickerOpen" class="category-picker">
                  <p>Selecciona una categoria activa para crear un bloque:</p>
                  <div class="flex-row flex-wrap">
                    <button v-for="option in availableCategoryOptions" :key="option.id" type="button" class="btn-light btn-sm" @click="addBlockFromCategory(option)">
                      {{ option.name }}
                    </button>
                  </div>
                </div>
                <div v-if="gameBlocks.length" class="game-block-list">
                  <div v-for="(block, index) in sortedBlocks" :key="block.id" class="game-block-card">
                    <div class="game-block-head">
                      <div>
                        <p class="game-block-label">Bloque {{ index + 1 }}</p>
                        <input type="text" class="form-control form-control-sm" v-model="block.title" placeholder="Ej: Juego base" />
                      </div>
                      <div class="game-block-controls">
                        <label class="toggle-switch">
                          <input type="checkbox" v-model="block.isActive" />
                          <span class="toggle-slider"></span>
                        </label>
                        <button type="button" class="game-block-remove" @click="removeGameBlock(block.id)">X</button>
                      </div>
                    </div>
                    <div class="flex-row">
                      <div class="flex-8">
                        <div class="form-group">
                          <label>Categoria principal *</label>
                          <select class="form-control" v-model="block.categoryId">
                            <option value="">Selecciona una categoria</option>
                            <option v-for="option in categoryOptions" :key="option.id" :value="option.id" :disabled="isCategoryAlreadyUsed(option.id, block.id)">
                              {{ option.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="flex-4">
                        <div class="form-group">
                          <label>Orden</label>
                          <input type="number" min="1" class="form-control" v-model.number="block.order" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="game-block-empty">
                  Aun no defines bloques de juego.
                </div>
              </div>
            </div>
          </div>
          <div class="flex-5">
            <div class="insight-panel">
              <p>Estado y checklist</p>
              <ul class="status-summary">
                <li class="status-pill-success">Activa</li>
              </ul>
              <ul class="status-checklist">
                <li>Categorias conectadas</li>
                <li>Preguntas activas disponibles</li>
              </ul>
              <hr />
              <p>Como se juega</p>
              <ol class="how-it-works">
                <li>El jugador se registra una sola vez.</li>
                <li>Al entrar ve casillas de preguntas.</li>
                <li>Antes de revelar la pregunta apuesta entre {{ triviaConfig.pointsMin }} y {{ triviaConfig.pointsMax }} puntos.</li>
                <li>Gana quien alcanza el objetivo antes de agotar las casillas.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="text-center mt-4">
      <router-link :to="'/marketing/dinamica/crear'" class="btn-cancel">Cancelar</router-link>
      <button type="button" class="btn-primary btn-lg" @click="submitTrivia" :disabled="isSubmitting || gameBlocks.length === 0">
        {{ isSubmitting ? 'Guardando...' : 'Crear trivia' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createDinamica, saveTrivia } from '../services/marketingService'
import { getQuestionCategories } from '../services/questionCategoriesService'
import apiClient from '@/services/apiClient'

const router = useRouter()
const route = useRoute()

function goToCategoriesList() {
  router.push('/marketing/categorias-preguntas')
}

function goToCategoriesCreate() {
  router.push('/marketing/categorias-preguntas/crear')
}
const dinamicaId = computed(() => route.params.id)

const categories = ref([])
const isSubmitting = ref(false)
const isCategoryPickerOpen = ref(false)

const registrationConfig = ref({
  participantsLimit: null, timeLimitMinutes: null,
  closingDateTime: null, closingTime: ''
})

const triviaConfig = ref({
  name: '', description: '', slug: '',
  pointsMin: 1, pointsMax: 10
})

let idCounter = 0
function generateId() { return 'block_' + (++idCounter) + '_' + Date.now() }

const gameBlocks = ref([])

const activeCategories = computed(() =>
  categories.value.filter(c => c.status === 'active' || c.activo === true || c.is_active === true)
)

const categoryOptions = computed(() =>
  activeCategories.value.map(c => ({ id: c.id, name: c.name }))
)

const usedCategoryIds = computed(() =>
  gameBlocks.value.map(b => String(b.categoryId)).filter(Boolean)
)

const availableCategoryOptions = computed(() =>
  categoryOptions.value.filter(cat => !usedCategoryIds.value.includes(String(cat.id)))
)

const categoryPickerLabel = computed(() =>
  availableCategoryOptions.value.length ? 'Agregar bloque' : 'Sin categorias'
)

const sortedBlocks = computed(() =>
  [...gameBlocks.value].sort((a, b) => (a.order || 0) - (b.order || 0))
)

function toggleCategoryPicker() { isCategoryPickerOpen.value = !isCategoryPickerOpen.value }

function addBlockFromCategory(cat) {
  const block = {
    id: generateId(), title: cat.name, categoryId: cat.id,
    order: gameBlocks.value.length + 1, isActive: true
  }
  gameBlocks.value.push(block)
  isCategoryPickerOpen.value = false
  syncOrder()
}

function removeGameBlock(blockId) {
  gameBlocks.value = gameBlocks.value.filter(b => b.id !== blockId)
  syncOrder()
}

function syncOrder() {
  gameBlocks.value.forEach((b, i) => { b.order = i + 1 })
}

function isCategoryAlreadyUsed(catId, excludeId) {
  return gameBlocks.value.some(b => b.id !== excludeId && String(b.categoryId) === String(catId))
}

function serializeGameBlocks() {
  return gameBlocks.value.map((block) => ({
    categoryId: block.categoryId ? Number(block.categoryId) : null,
    title: block.title || 'Bloque',
    order: block.order,
    isActive: block.isActive ? true : false
  }))
}

async function submitTrivia() {
  if (!gameBlocks.value.length) return
  isSubmitting.value = true
  try {
    let id = dinamicaId.value

    // Create mode: create the record first if id is 'new'
    if (id === 'new') {
      const createPayload = {
        tipo_dinamica: 'trivia',
        nombre: triviaConfig.value.name || 'Nueva Trivia',
        descripcion: triviaConfig.value.description || '',
        is_public: false,
      }
      const createRes = await createDinamica(createPayload)
      const createData = createRes?.data || createRes || {}
      id = createData.dinamica_id || createData.id
      if (!id) {
        throw new Error('No se pudo crear la dinámica')
      }
    }

    const payload = {
      gameBlocks: serializeGameBlocks(),
      triviaConfig: {
        name: triviaConfig.value.name,
        description: triviaConfig.value.description,
        slug: triviaConfig.value.slug,
        pointsMin: triviaConfig.value.pointsMin,
        pointsMax: triviaConfig.value.pointsMax
      },
      registrationConfig: {
        participantsLimit: registrationConfig.value.participantsLimit,
        closingTime: registrationConfig.value.closingTime
      },
      nombre: triviaConfig.value.name,
      descripcion: triviaConfig.value.description
    }
    await saveTrivia(id, payload)
    router.push('/marketing/dinamica/crear')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const res = await getQuestionCategories()
    const raw = res?.data || res || []
    categories.value = Array.isArray(raw) ? raw : (raw.data || [])
  } catch { categories.value = [] }

  if (dinamicaId.value === 'new') return

  try {
    const res = await apiClient.get('/marketing/dinamicas/' + dinamicaId.value)
    const data = res.data?.data || res.data
    if (data) {
      const d = data.dinamica || data
      if (d.nombre) triviaConfig.value.name = d.nombre
      if (d.descripcion) triviaConfig.value.description = d.descripcion
      if (d.slug) triviaConfig.value.slug = d.slug
      if (data.config && typeof data.config === 'object') {
        const cfg = data.config
        if (cfg.registration) {
          registrationConfig.value.participantsLimit = cfg.registration.participants_limit || null
          registrationConfig.value.closingTime = cfg.registration.closing_time || ''
        }
        if (cfg.trivia) {
          triviaConfig.value.name = cfg.trivia.name || triviaConfig.value.name
          triviaConfig.value.description = cfg.trivia.description || triviaConfig.value.description
          triviaConfig.value.slug = cfg.trivia.slug || triviaConfig.value.slug
          triviaConfig.value.pointsMin = cfg.trivia.points_min || triviaConfig.value.pointsMin
          triviaConfig.value.pointsMax = cfg.trivia.points_max || triviaConfig.value.pointsMax
        }
      }
      // Intentar cargar gameBlocks del nuevo formato, luego del legacy
      let blocks = data.game_blocks || data.gameBlocks || data.questions || []
      if (blocks.length > 0 && !Array.isArray(blocks)) blocks = []
      if (blocks.length > 0) {
        gameBlocks.value = blocks.map((block, idx) => ({
          id: generateId(), title: block.title || '',
          categoryId: block.categoryId || block.id_categories || block.category_id || null,
          order: block.order || block.orden || (idx + 1),
          isActive: block.isActive === true || block.isActive === 1 || block.is_active === true || block.is_active === 1
        }))
      }
      // Cargar triviaConfig del nuevo formato
      const tc = data.trivia_config || data.triviaConfig || data.config?.trivia
      if (tc) {
        if (tc.name) triviaConfig.value.name = tc.name
        if (tc.description) triviaConfig.value.description = tc.description
        if (tc.slug) triviaConfig.value.slug = tc.slug
        if (tc.pointsMin || tc.points_min) triviaConfig.value.pointsMin = tc.pointsMin || tc.points_min
        if (tc.pointsMax || tc.points_max) triviaConfig.value.pointsMax = tc.pointsMax || tc.points_max
      }
      // Cargar registrationConfig del nuevo formato
      const rc = data.registration_config || data.registrationConfig || data.config?.registration
      if (rc) {
        if (rc.participantsLimit || rc.participants_limit) registrationConfig.value.participantsLimit = rc.participantsLimit || rc.participants_limit
        if (rc.closingTime || rc.closing_time) registrationConfig.value.closingTime = rc.closingTime || rc.closing_time
      }
    }
  } catch { /* silent */ }
})
</script>

<style scoped>
.trivia-dynamic-designer { max-width: 1000px; margin: 0 auto; }

/* ─── Cards ─── */
.card {
  border: 1px solid var(--border-color, #d0d0d0);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  background: var(--card-bg, rgba(255,255,255,0.7));
  backdrop-filter: blur(4px);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  background: var(--bg-main, #e2e8f0);
  border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.6));
}
.card-header small { text-transform: uppercase; color: var(--text-muted, #64748b); font-size: 11px; }
.card-header h4 { margin: 0; font-size: 16px; color: var(--text-bold, #0f172a); }
.card-body { padding: 18px; }

/* ─── Form Controls ─── */
.form-group { margin-bottom: 14px; }
.form-group label {
  display: block; margin-bottom: 5px;
  font-weight: 600; font-size: 13px;
  color: var(--text-main, #334155);
}
.form-control {
  width: 100%; padding: 9px 12px;
  border: 1px solid var(--border-color, rgba(255,255,255,0.6));
  border-radius: 8px; font-size: 13px;
  background: var(--card-bg, rgba(255,255,255,0.7));
  color: var(--text-main, #334155);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-control:focus {
  outline: none;
  border-color: var(--primary-color, #18d600);
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.15);
}
.form-control::placeholder { color: var(--text-light, #94a3b8); }
.form-hint { font-size: 11px; color: var(--text-light, #94a3b8); margin-top: 4px; display: block; }

/* ─── Layout Helpers ─── */
.flex-row { display: flex; gap: 16px; flex-wrap: wrap; }
.flex-4 { width: calc(33.33% - 11px); }
.flex-5 { width: calc(41.66% - 10px); }
.flex-6 { width: calc(50% - 8px); }
.flex-7 { width: calc(58.33% - 8px); }
.flex-8 { width: calc(66.66% - 6px); }
.flex-auto { flex: 0 0 auto; padding: 0 8px; }
.flex-wrap { flex-wrap: wrap; }
.align-items-center { align-items: center; }
.text-center { text-align: center; }
.text-muted { color: var(--text-muted, #64748b); }
.small { font-size: 12px; }
.mb-3 { margin-bottom: 12px; }
.mt-4 { margin-top: 16px; }
.mb-0 { margin-bottom: 0; }
.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.align-items-start { align-items: flex-start; }

/* ─── Badge ─── */
.badge {
  padding: 4px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 600;
}
.badge-primary {
  background: rgba(24, 214, 0, 0.12);
  color: var(--primary-color, #18d600);
}

/* ─── Config & Insight Panels ─── */
.config-card {
  border: 1px solid var(--border-color, rgba(255,255,255,0.6));
  border-radius: 12px; padding: 18px;
  background: var(--card-bg, rgba(255,255,255,0.7));
}
.insight-panel {
  border: 1px solid var(--border-color, rgba(255,255,255,0.6));
  border-radius: 12px; padding: 18px;
  background: var(--card-bg, rgba(255,255,255,0.5));
}
.insight-panel p {
  font-size: 12px; text-transform: uppercase;
  color: var(--text-muted, #64748b); font-weight: 600;
}

/* ─── Status ─── */
.status-summary, .status-checklist { list-style: none; padding: 0; margin: 0 0 12px 0; }
.status-summary li, .status-checklist li { padding: 4px 0; font-size: 13px; }
.status-pill-success {
  background: rgba(24, 214, 0, 0.12);
  color: var(--primary-color, #18d600);
  border-radius: 20px; padding: 2px 10px;
  display: inline-block; font-size: 12px;
}
.how-it-works { padding-left: 16px; }
.how-it-works li { margin-bottom: 4px; font-size: 12px; color: var(--text-muted, #64748b); }

/* ─── Game Blocks ─── */
.game-blocks { border-top: 1px solid var(--border-color, rgba(255,255,255,0.6)); padding-top: 16px; margin-top: 16px; }
.game-block-list { display: flex; flex-direction: column; gap: 10px; }
.game-block-card {
  border: 1px solid var(--border-color, rgba(255,255,255,0.6));
  border-radius: 12px; padding: 14px;
  background: var(--card-bg, rgba(255,255,255,0.7));
}
.game-block-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.game-block-label { text-transform: uppercase; font-size: 11px; color: var(--text-muted, #64748b); margin-bottom: 4px; }
.game-block-controls { display: flex; align-items: center; gap: 8px; }
.game-block-remove { border: none; background: transparent; color: var(--text-light, #94a3b8); font-size: 18px; cursor: pointer; padding: 0 4px; }
.game-block-remove:hover { color: var(--danger-color, #ef4444); }
.game-block-empty {
  border: 1px dashed var(--border-color, rgba(255,255,255,0.6));
  border-radius: 12px; padding: 16px;
  text-align: center; color: var(--text-muted, #64748b); font-size: 13px;
}

/* ─── Category Picker ─── */
.category-picker {
  border: 1px solid var(--primary-color, #18d600);
  border-radius: 12px; padding: 12px; margin-bottom: 12px;
  background: rgba(24, 214, 0, 0.04);
}

/* ─── Toggle Switch ─── */
.toggle-switch { position: relative; display: inline-block; width: 36px; height: 20px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute; cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--border-color, rgba(255,255,255,0.6));
  border-radius: 20px; transition: 0.3s;
}
.toggle-slider::before {
  content: ''; position: absolute;
  height: 14px; width: 14px;
  left: 3px; bottom: 3px;
  background-color: white; border-radius: 50%;
  transition: 0.3s;
}
.toggle-switch input:checked + .toggle-slider { background-color: var(--primary-color, #18d600); }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(16px); }

/* ─── Buttons ─── */
.btn-primary, .btn-outline-primary, .btn-cancel, .btn-sm, .btn-light {
  padding: 8px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 600;
  cursor: pointer; border: none;
}
.btn-primary {
  background: var(--primary-color, #18d600);
  color: white;
  transition: background 0.2s, transform 0.15s;
}
.btn-primary:hover:not(:disabled) { background: var(--primary-hover, #119e00); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline-primary {
  background: transparent;
  border: 1px solid var(--primary-color, #18d600);
  color: var(--primary-color, #18d600);
  transition: all 0.2s;
}
.btn-outline-primary:hover:not(:disabled) { background: var(--primary-color, #18d600); color: white; }
.btn-outline-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel {
  background: transparent;
  border: 1px solid var(--border-color, rgba(255,255,255,0.6));
  color: var(--text-main, #334155);
  text-decoration: none;
}
.btn-cancel:hover { background: var(--bg-main, #e2e8f0); }
.btn-light {
  background: var(--bg-main, #e2e8f0);
  border: 1px solid var(--border-color, rgba(255,255,255,0.6));
  color: var(--text-main, #334155);
  cursor: pointer;
  transition: all 0.2s;
}
.btn-light:hover { background: var(--border-color, rgba(255,255,255,0.6)); }
.btn-sm { padding: 4px 10px; font-size: 12px; }
.btn-lg { padding: 10px 24px; font-size: 14px; }

/* ─── Input Prefix (slug) ─── */
.input-prefix { display: flex; align-items: center; }
.input-prefix-text {
  padding: 9px 10px;
  background: var(--bg-main, #e2e8f0);
  border: 1px solid var(--border-color, rgba(255,255,255,0.6));
  border-right: none;
  border-radius: 8px 0 0 8px;
  font-size: 12px; color: var(--text-muted, #64748b);
  white-space: nowrap;
}
.input-prefix .form-control { border-radius: 0 8px 8px 0; }

/* ─── Misc ─── */
hr { border: none; border-top: 1px solid var(--border-color, rgba(255,255,255,0.6)); margin: 12px 0; }

/* ─── Header with actions ─── */
.header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.header-actions .btn {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.header-actions .btn-outline-primary {
  background: transparent;
  border-color: var(--primary-color, #18d600);
  color: var(--primary-color, #18d600);
}
.header-actions .btn-outline-primary:hover {
  background: var(--primary-color, #18d600);
  color: white;
}
.header-actions .btn-primary {
  background: var(--primary-color, #18d600);
  border-color: var(--primary-color, #18d600);
  color: white;
}
.header-actions .btn-primary:hover {
  background: var(--primary-hover, #119e00);
}
</style>