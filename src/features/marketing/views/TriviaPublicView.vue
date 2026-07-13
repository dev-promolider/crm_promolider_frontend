<template>
  <div class="trivia-shell">
    <!-- MODO: RESULTADOS -->
    <template v-if="mode === 'resultados' && results">
      <section class="results-hero">
        <h1>{{ results.dinamica_nombre || 'Trivia' }}</h1>
        <p class="hero-sub">Puntaje máximo {{ results.puntaje_total }} pts</p>
        <div class="hero-stats">
          <div class="stat-card"><span>Participantes</span><strong>{{ results.total_participantes }}</strong></div>
        </div>
      </section>
      <section class="winner-panel" v-if="results.winner">
        <h2>🏆 {{ results.winner.nombre }}</h2>
        <p class="winner-points">{{ results.winner.puntaje }} pts</p>
      </section>
      <section class="leaderboard-section">
        <h3>Tabla de posiciones</h3>
        <div v-for="(p, i) in results.leaderboard" :key="p.id" class="leaderboard-row" :class="{ 'is-winner': p.ha_ganado }">
          <span class="rank">#{{ i + 1 }}</span>
          <div class="participant-meta">
            <strong>{{ p.nombre }}</strong>
            <small>{{ p.email }}</small>
          </div>
          <span class="badge" :class="p.ha_ganado ? 'badge-gold' : p.ha_jugado ? 'badge-gray' : 'badge-blue'">
            {{ p.ha_ganado ? 'Ganó' : p.ha_jugado ? 'Completó' : 'Pendiente' }}
          </span>
          <strong class="points">{{ p.puntaje }} pts</strong>
        </div>
        <p v-if="!results.leaderboard?.length" class="empty-state">Sin participantes aún.</p>
      </section>
    </template>

    <!-- MODO: PREGUNTA -->
    <template v-else-if="mode === 'pregunta' && questionData">
      <section class="question-hero">
        <div class="hero-eyebrow">Trivia · Pregunta #{{ questionData.numero }} de {{ questionData.total }}</div>
        <div class="pregunta-timer" v-if="questionData.tiempo_limite">
          <div class="timer-bar"><div class="timer-fill" :style="{ width: timerPercent + '%' }"></div></div>
          <span class="timer-text">{{ timerRemaining }}s</span>
        </div>
        <h2 class="pregunta-text">{{ questionData.pregunta }}</h2>
      </section>
      <form @submit.prevent="handleSubmit" class="opciones-grid">
        <label v-for="(opt, idx) in questionData.opciones" :key="idx" class="opcion-label"
          :class="{ selected: selectedOption === idx }"
          @click.prevent="selectedOption = idx">
          <span class="opcion-letra">{{ letras[idx] }}</span>
          <span class="opcion-text">{{ opt.text }}</span>
        </label>
        <button type="submit" class="btn-submit" :disabled="submitting || timerRemaining <= 0">
          {{ submitting ? 'Enviando...' : 'Responder' }}
        </button>
      </form>
    </template>

    <!-- MODO: PREVIEW (bloques/preguntas) -->
    <template v-else-if="mode === 'preview' && previewData">
      <section class="trivia-header">
        <div class="hero-eyebrow">Trivia</div>
        <h1>{{ previewData.dinamica_nombre }}</h1>
        <p v-if="previewData.dinamica_descripcion" class="descripcion">{{ previewData.dinamica_descripcion }}</p>
      </section>
      <section class="preview-content">
        <div class="progress-summary">
          <span>Progreso: {{ previewData.preguntas_respondidas }} / {{ previewData.total_preguntas }}</span>
          <span>Puntaje: {{ previewData.puntaje_acumulado }} / {{ previewData.puntaje_total }} pts</span>
        </div>
        <div v-if="previewData.completado" class="alert alert-success">
          ¡Completaste todas las preguntas!
          <button @click="loadResults" class="btn-link">Ver resultados</button>
        </div>
        <div v-for="block in previewData.blocks" :key="block.index" class="block-card">
          <div class="block-header">
            <h3>{{ block.title }}</h3>
            <span>{{ block.answeredCount }} / {{ block.totalQuestions }}</span>
          </div>
          <div class="casillas-grid">
            <button v-for="num in block.questionNumbers" :key="num"
              class="casilla-btn"
              :class="{ answered: previewData.answered_numbers?.includes(num) }"
              :disabled="previewData.completado || previewData.answered_numbers?.includes(num)"
              @click="loadQuestion(num)">
              {{ num }}
            </button>
          </div>
        </div>
        <p v-if="!previewData.blocks?.length" class="empty-state">
          Esta trivia aún no tiene preguntas configuradas.
          <br><small>Vuelve más tarde o contacta al administrador.</small>
        </p>
      </section>
    </template>

    <!-- Cargando -->
    <div v-if="loading" class="loading">Cargando...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useDinamicaPublicStore } from '../stores/dinamicaPublicStore'

const props = defineProps({
  slug: { type: String, required: true },
})

const store = useDinamicaPublicStore()
const mode = ref('preview')
const previewData = ref(null)
const questionData = ref(null)
const results = ref(null)
const selectedOption = ref(null)
const submitting = ref(false)
const loading = ref(false)
const error = ref('')

// Timer
const timerRemaining = ref(0)
const timerMax = ref(0)
const timerId = ref(null)
const timerPercent = computed(() => timerMax.value > 0 ? (timerRemaining.value / timerMax.value) * 100 : 0)

const letras = ['A', 'B', 'C', 'D', 'E', 'F']

function startTimer(seconds) {
  stopTimer()
  timerMax.value = seconds
  timerRemaining.value = seconds
  timerId.value = setInterval(() => {
    timerRemaining.value--
    if (timerRemaining.value <= 0) {
      stopTimer()
      handleTimeout()
    }
  }, 1000)
}

function stopTimer() {
  if (timerId.value) { clearInterval(timerId.value); timerId.value = null }
}

async function handleTimeout() {
  if (submitting.value) return
  submitting.value = true
  try {
    const result = await store.submitAnswer(props.slug, questionData.value.numero, {
      timeout: true,
      elapsed_ms: timerMax.value * 1000,
    })
    if (result.completado) {
      await loadResults()
    } else {
      await loadPreview()
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al enviar respuesta'
  } finally {
    submitting.value = false
  }
}

async function handleSubmit() {
  if (selectedOption.value === null || submitting.value) return
  submitting.value = true
  stopTimer()
  const elapsed = timerMax.value > 0 ? (timerMax.value - timerRemaining.value) * 1000 : 0
  try {
    const result = await store.submitAnswer(props.slug, questionData.value.numero, {
      opcion_index: selectedOption.value,
      elapsed_ms: Math.max(0, elapsed),
    })
    if (result.completado) {
      await loadResults()
    } else {
      await loadPreview()
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al enviar respuesta'
  } finally {
    submitting.value = false
  }
}

async function loadPreview() {
  mode.value = 'preview'
  loading.value = true
  error.value = ''
  try {
    const data = await store.loadTriviaPreview(props.slug)
    previewData.value = data
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al cargar trivia'
  } finally {
    loading.value = false
  }
}

async function loadQuestion(numero) {
  mode.value = 'pregunta'
  selectedOption.value = null
  loading.value = true
  error.value = ''
  try {
    const data = await store.loadQuestion(props.slug, numero)
    questionData.value = data
    if (data.tiempo_limite) startTimer(data.tiempo_limite)
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al cargar pregunta'
  } finally {
    loading.value = false
  }
}

let resultsPollInterval = null

async function loadResults() {
  mode.value = 'resultados'
  loading.value = true
  error.value = ''
  try {
    const data = await store.loadResults(props.slug)
    results.value = data
    // Iniciar polling para actualizar resultados en tiempo real
    startResultsPolling()
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al cargar resultados'
  } finally {
    loading.value = false
  }
}

function startResultsPolling() {
  stopResultsPolling()
  resultsPollInterval = setInterval(async () => {
    try {
      const data = await store.loadResults(props.slug)
      if (data && data.leaderboard) {
        results.value = data
      }
    } catch (e) {
      // Silently fail - no need to show errors for background polling
    }
  }, 8000)
}

function stopResultsPolling() {
  if (resultsPollInterval) {
    clearInterval(resultsPollInterval)
    resultsPollInterval = null
  }
}

onMounted(() => {
  loadPreview()
})

onUnmounted(() => {
  stopTimer()
  stopResultsPolling()
})
</script>

<style scoped>
.trivia-shell {
  min-height: 100vh;
  padding: 2rem clamp(1rem, 4vw, 3rem);
  background: radial-gradient(circle at top, rgba(94,252,219,0.15), transparent 45%),
    radial-gradient(circle at 20% 20%, rgba(92,107,255,0.18), transparent 40%),
    #05060a;
  color: #f7f8ff;
  font-family: 'Space Grotesk', system-ui, sans-serif;
}
.hero-eyebrow {
  text-transform: uppercase; letter-spacing: 0.3em; font-size: 0.75rem;
  color: #b6c2ff; margin-bottom: 1rem;
}
.trivia-header { text-align: center; padding: 2rem 0; max-width: 800px; margin: 0 auto; }
.trivia-header h1 { font-size: 2.2rem; margin-bottom: 0.5rem; }
.descripcion { color: #98a3d3; }

/* PREVIEW */
.preview-content { max-width: 800px; margin: 0 auto; }
.progress-summary {
  display: flex; justify-content: space-between; padding: 1rem;
  background: rgba(16,18,26,0.8); border-radius: 12px; margin-bottom: 1.5rem;
  border: 1px solid rgba(255,255,255,0.08);
}
.block-card {
  background: rgba(16,18,26,0.8); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 1.25rem; margin-bottom: 1rem;
}
.block-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
.block-header h3 { margin: 0; font-size: 1rem; }
.casillas-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.casilla-btn {
  width: 44px; height: 44px; border-radius: 10px; border: 2px solid #5efcdb;
  background: rgba(94,252,219,0.1); color: #fff; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.casilla-btn:hover:not(:disabled) { background: rgba(94,252,219,0.3); transform: scale(1.1); }
.casilla-btn.answered { background: #5efcdb; color: #222; border-color: #5efcdb; }
.casilla-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* QUESTION */
.question-hero { text-align: center; max-width: 700px; margin: 2rem auto; }
.pregunta-timer { display: flex; align-items: center; gap: 1rem; justify-content: center; margin-bottom: 2rem; }
.timer-bar { flex: 1; max-width: 300px; height: 8px; background: rgba(255,255,255,0.12); border-radius: 999px; overflow: hidden; }
.timer-fill { height: 100%; background: linear-gradient(90deg, #5efcdb, #ff9a62); transition: width 1s linear; }
.timer-text { color: #ffd666; font-weight: 700; font-size: 1.2rem; }
.pregunta-text { font-size: 1.8rem; font-weight: 700; margin: 1rem 0; }
.opciones-grid { max-width: 700px; margin: 0 auto; display: grid; gap: 1rem; }
.opcion-label {
  display: flex; align-items: center; gap: 1rem;
  padding: 1rem 1.5rem; border-radius: 14px;
  background: rgba(18,22,37,0.9); border: 2px solid rgba(94,252,219,0.3);
  cursor: pointer; transition: all 0.2s;
}
.opcion-label:hover, .opcion-label.selected {
  background: linear-gradient(90deg, #5efcdb, #5c6bff); color: #222;
  transform: scale(1.02); border-color: #ffd666;
}
.opcion-letra {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, #5efcdb, #5c6bff); color: #222;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; border: 2px solid #fff;
}
.btn-submit {
  padding: 1rem; background: linear-gradient(135deg, #5efcdb, #5c6bff);
  color: #222; border: none; border-radius: 12px; font-size: 1.2rem;
  font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(94,252,219,0.3); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* RESULTS */
.results-hero { text-align: center; padding: 2rem 0; }
.hero-stats { display: flex; justify-content: center; gap: 2rem; margin-top: 1rem; }
.stat-card { background: rgba(16,18,26,0.8); padding: 1rem 2rem; border-radius: 12px; text-align: center; }
.stat-card span { display: block; font-size: 0.8rem; color: #98a3d3; }
.stat-card strong { font-size: 1.5rem; }
.winner-panel { text-align: center; padding: 2rem; background: rgba(94,252,219,0.1); border-radius: 16px; max-width: 400px; margin: 1rem auto; }
.winner-points { font-size: 2rem; font-weight: 800; color: #ffd666; }
.leaderboard-section { max-width: 700px; margin: 2rem auto; }
.leaderboard-section h3 { margin-bottom: 1rem; }
.leaderboard-row {
  display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem;
  background: rgba(16,18,26,0.8); border-radius: 10px; margin-bottom: 0.5rem;
  border: 1px solid rgba(255,255,255,0.06);
}
.leaderboard-row.is-winner { border-color: #ffd666; background: rgba(251,191,36,0.1); }
.rank { font-weight: 800; font-size: 1.1rem; width: 40px; }
.participant-meta { flex: 1; }
.participant-meta small { display: block; font-size: 0.75rem; color: #64748b; }
.points { color: #ffd666; font-size: 1.1rem; }
.badge-gold { background: rgba(251,191,36,0.15); color: #fbbf24; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.78rem; }
.badge-gray { background: rgba(100,116,139,0.2); color: #94a3b8; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.78rem; }
.badge-blue { background: rgba(59,130,246,0.15); color: #60a5fa; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.78rem; }
.loading, .error { text-align: center; padding: 3rem; }
.error { color: #f87171; }
.empty-state { text-align: center; color: #64748b; padding: 2rem; }
.alert { padding: 1rem; border-radius: 12px; margin-bottom: 1rem; }
.alert-success { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
.btn-link { background: none; border: none; color: #5efcdb; cursor: pointer; text-decoration: underline; margin-left: 0.5rem; }

@media (max-width: 640px) {
  .trivia-shell { padding: 1rem; }
  .pregunta-text { font-size: 1.3rem; }
  .hero-stats { flex-direction: column; align-items: center; }
}
</style>
