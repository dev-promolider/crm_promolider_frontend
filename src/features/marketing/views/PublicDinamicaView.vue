<template>
  <div class="public-dinamica">
    <!-- WebSocket status indicator -->
    <div v-if="wsConnected" class="ws-indicator" title="Conectado en tiempo real">
      <span class="ws-dot"></span> En vivo
    </div>
    <div v-else class="ws-indicator ws-offline" title="Usando polling periódico">
      <span class="ws-dot"></span> Actualizando cada 8s
    </div>

    <!-- Trivia mode: show the full trivia component -->
    <TriviaPublicView v-if="store.dinamica?.tipo_dinamica === 'trivia' && store.isRegistered && !store.hasWinner" :slug="slug" />

    <!-- Ruleta mode: existing wheel UI -->
    <template v-else>
      <div v-if="store.loading && !store.dinamica" class="loading">Cargando...</div>
      <div v-else-if="store.error && !store.dinamica" class="error"><p>{{ store.error }}</p></div>
      <template v-if="store.dinamica">
        <div class="dinamica-header">
          <div class="hero-eyebrow">{{ store.dinamica.tipo_dinamica === 'ruleta' ? 'Ruleta' : 'Trivia' }}</div>
          <h1>{{ store.dinamica.nombre }}</h1>
          <p v-if="store.dinamica.descripcion" class="descripcion">{{ store.dinamica.descripcion }}</p>
          <div class="dinamica-status">
            <span :class="store.dinamica.is_active ? 'active' : 'inactive'">{{ store.dinamica.is_active ? 'Activa' : 'Inactiva' }}</span>
            <span v-if="store.hasWinner" class="winner-badge">Hay un ganador!</span>
          </div>
        </div>
        <div class="dinamica-content">
          <div v-if="!store.isRegistered && !store.hasWinner && store.dinamica.is_active" class="card-register">
            <h3>Regístrate para participar</h3>
            <form @submit.prevent="handleRegister">
              <div class="form-group"><label>Nombre</label><input v-model="form.nombre" required placeholder="Tu nombre" /></div>
              <div class="form-group"><label>Apellido</label><input v-model="form.apellido" placeholder="Tu apellido" /></div>
              <div class="form-group"><label>Email</label><input v-model="form.email" type="email" required placeholder="tu@email.com" /></div>
              <button type="submit" :disabled="submitting" class="cta-button">{{ submitting ? 'Registrando...' : 'Registrarme ahora' }}</button>
              <p v-if="registerError" class="error-msg">{{ registerError }}</p>
            </form>
          </div>
          <div v-else-if="store.isRegistered && store.dinamica.tipo_dinamica === 'ruleta'" class="section-ruleta">
            <div class="registered-banner">
              <div class="registered-title">Registro completado!</div>
              <div class="registered-sub">Tu turno: <strong>{{ myTurno }}</strong>
                <span v-if="esMiTurno" class="es-tu-turno">Es tu turno!</span>
              </div>
              <!-- Timer indicator when a turn is active -->
              <div v-if="store.turnoExpiresAt" class="timer-info">
                <span class="timer-label">Tiempo restante:</span>
                <TurnoTimerDisplay :expires-at="store.turnoExpiresAt" :duration="store.turnoDurationSeconds" />
              </div>
            </div>
            <RuletaWheel v-if="store.dinamica.premios" :premios="store.dinamica.premios" :puedeGirar="esMiTurno && store.dinamica.is_active && !store.hasWinner" :slug="slug" :email="store.email" />
          </div>
          <div v-if="store.hasWinner" class="winner-section">
            <p>Esta dinámica ya tiene un ganador. Gracias por participar!</p>
          </div>
          <div class="section-participants">
            <h3>Participantes ({{ store.participants?.length || 0 }})</h3>
            <p v-if="!store.participants?.length" class="empty-state">Aún no hay participantes.</p>
            <div v-else class="participants-list">
              <div v-for="p in store.participants" :key="p.id" class="participant-row" :class="{ 'is-active-turn': store.turnoActual && p.id === store.turnoActual.id, 'is-my-record': p.email === store.email }">
                <div><div class="participant-name">{{ p.nombre }} {{ p.apellido }}</div><div class="participant-email">{{ p.email }}</div></div>
                <div class="participant-meta">
                  <span v-if="p.turno && store.dinamica.tipo_dinamica !== 'trivia'">Turno #{{ p.turno }}</span>
                  <span :class="'status-badge ' + statusClass(p)">{{ statusLabel(p) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
    <div v-if="!slug" class="error"><p>URL inválida</p></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDinamicaPublicStore } from '../stores/dinamicaPublicStore'
import { useDinamicaWebSocket } from '../composables/useDinamicaWebSocket'
import RuletaWheel from '../components/RuletaWheel.vue'
import TriviaPublicView from './TriviaPublicView.vue'
import TurnoTimerDisplay from '../components/TurnoTimerDisplay.vue'

const route = useRoute()
const store = useDinamicaPublicStore()
const slug = computed(() => route.params.slug)

// WebSocket setup (auto-cleanup on unmount via composable)
const { wsConnected } = useDinamicaWebSocket(slug)

const submitting = ref(false)
const registerError = ref('')
const pollingInterval = ref(null)
const form = ref({ nombre: '', apellido: '', email: '' })

const myTurno = computed(() => {
  const me = store.participants.find(p => p.email === store.email)
  return me ? me.turno : '-'
})

const esMiTurno = computed(() => {
  if (store.dinamica?.tipo_dinamica === 'trivia') return true
  return store.esMiTurno
})

function statusClass(p) {
  if (p.ha_ganado) return 'badge-gold'
  if (p.ha_jugado) return 'badge-gray'
  if (store.turnoActual && p.id === store.turnoActual.id) return 'badge-green'
  return 'badge-blue'
}

function statusLabel(p) {
  if (p.ha_ganado) return 'Ganador'
  if (p.ha_jugado) return 'Jugó'
  if (store.turnoActual && p.id === store.turnoActual.id) return 'Su turno'
  return 'Esperando'
}

async function handleRegister() {
  submitting.value = true
  registerError.value = ''
  try {
    await store.register(slug.value, { nombre: form.value.nombre, apellido: form.value.apellido, email: form.value.email })
  } catch (err) {
    registerError.value = err.response?.data?.message || 'Error al registrarse'
  } finally {
    submitting.value = false
  }
}

// Polling fallback (only when WebSocket is not connected)
function startPolling() {
  if (pollingInterval.value || wsConnected.value) return
  pollingInterval.value = setInterval(() => {
    if (slug.value) store.loadParticipantsFeed(slug.value)
  }, 8000)
}

function stopPolling() {
  if (pollingInterval.value) { clearInterval(pollingInterval.value); pollingInterval.value = null }
}

onMounted(() => {
  if (slug.value) {
    store.loadDinamica(slug.value)
    // Start polling only if WebSocket is not connected (it loads asynchronously)
    setTimeout(() => {
      if (!wsConnected.value) startPolling()
    }, 2000)
  }
})

onUnmounted(() => { stopPolling() })
</script>

<style scoped>
.public-dinamica { max-width: 900px; margin: 0 auto; padding: 2rem; min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; position: relative; }
.loading { text-align: center; padding: 3rem; color: #94a3b8; }
.error { text-align: center; padding: 3rem; color: #fca5a5; }

/* WebSocket indicator */
.ws-indicator {
  position: absolute; top: 1rem; right: 1rem;
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.72rem; color: #22c55e; padding: 0.25rem 0.65rem;
  border-radius: 999px; background: rgba(34,197,94,0.1);
  border: 1px solid rgba(34,197,94,0.2);
}
.ws-indicator.ws-offline { color: #94a3b8; background: rgba(100,116,139,0.1); border-color: rgba(100,116,139,0.2); }
.ws-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: pulse-dot 2s infinite; }
.ws-offline .ws-dot { animation: none; opacity: 0.5; }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.dinamica-header { text-align: center; padding: 2rem 0 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 2rem; }
.hero-eyebrow { display: inline-block; background: rgba(34,197,94,0.15); color: #4ade80; padding: 0.25rem 1rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
.dinamica-header h1 { font-size: 2.2rem; font-weight: 800; color: #f8fafc; margin: 0.5rem 0; }
.descripcion { color: #94a3b8; max-width: 600px; margin: 0.5rem auto; line-height: 1.6; }
.dinamica-status { display: flex; justify-content: center; gap: 0.75rem; margin-top: 1rem; }
.dinamica-status span { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; }
.active { background: rgba(34,197,94,0.15); color: #4ade80; }
.inactive { background: rgba(239,68,68,0.15); color: #f87171; }
.winner-badge { background: rgba(251,191,36,0.15); color: #fbbf24; }
.dinamica-content { display: flex; flex-direction: column; gap: 2rem; }
.card-register { background: rgba(30,41,59,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 2rem; max-width: 480px; margin: 0 auto; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
.card-register h3 { text-align: center; color: #f1f5f9; font-size: 1.3rem; margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.4rem; }
.form-group input { width: 100%; padding: 0.7rem 0.9rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(15,23,42,0.6); color: #e2e8f0; font-size: 0.95rem; transition: border-color 0.2s; box-sizing: border-box; }
.form-group input:focus { outline: none; border-color: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.2); }
.cta-button { display: block; width: 100%; padding: 0.8rem; margin-top: 1.25rem; background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.cta-button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(34,197,94,0.3); }
.cta-button:disabled { opacity: 0.6; cursor: not-allowed; }
.error-msg { text-align: center; color: #f87171; font-size: 0.85rem; margin-top: 0.75rem; }
.registered-banner { text-align: center; padding: 1.5rem; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); border-radius: 12px; margin-bottom: 1.5rem; }
.registered-title { font-size: 1.5rem; font-weight: 700; color: #4ade80; }
.registered-sub { color: #94a3b8; margin-top: 0.5rem; }
.timer-info { margin-top: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.timer-label { font-size: 0.85rem; color: #94a3b8; }
.es-tu-turno { display: inline-block; margin-left: 0.5rem; padding: 0.15rem 0.6rem; background: rgba(251,191,36,0.2); color: #fbbf24; border-radius: 9999px; font-size: 0.8rem; font-weight: 700; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
.winner-section { text-align: center; padding: 2rem; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); border-radius: 12px; color: #fbbf24; }
.section-participants { background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1.5rem; }
.section-participants h3 { font-size: 1rem; color: #94a3b8; margin-bottom: 1rem; }
.participants-list { display: flex; flex-direction: column; gap: 0.5rem; }
.participant-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: rgba(15,23,42,0.4); border-radius: 8px; transition: background 0.2s; }
.participant-row:hover { background: rgba(15,23,42,0.6); }
.participant-row.is-active-turn { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.2); }
.participant-row.is-my-record { border-left: 3px solid #22c55e; }
.participant-name { font-weight: 600; color: #e2e8f0; }
.participant-email { font-size: 0.8rem; color: #64748b; margin-top: 0.15rem; }
.participant-meta { display: flex; align-items: center; gap: 0.5rem; }
.participant-meta span { font-size: 0.78rem; padding: 0.2rem 0.6rem; border-radius: 9999px; font-weight: 600; }
.badge-green { background: rgba(34,197,94,0.15); color: #4ade80; }
.badge-blue { background: rgba(59,130,246,0.15); color: #60a5fa; }
.badge-gray { background: rgba(100,116,139,0.2); color: #94a3b8; }
.badge-gold { background: rgba(251,191,36,0.15); color: #fbbf24; }
.empty-state { text-align: center; color: #64748b; padding: 1rem; font-size: 0.9rem; }
@media (max-width: 640px) { .public-dinamica { padding: 1rem; } .dinamica-header h1 { font-size: 1.6rem; } .card-register { padding: 1.25rem; } .participant-row { flex-direction: column; align-items: flex-start; gap: 0.4rem; } }
</style>
