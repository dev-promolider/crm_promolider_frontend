<template>
  <div class="turno-timer" :class="{ warning: remaining <= 15, critical: remaining <= 5 }">
    <svg class="timer-ring" width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3" />
      <circle
        cx="22" cy="22" r="18" fill="none"
        :stroke="strokeColor"
        stroke-width="3"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 22 22)"
        class="timer-progress"
      />
    </svg>
    <div class="timer-text">
      <span class="timer-seconds">{{ formattedTime }}</span>
      <span class="timer-unit">seg</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  expiresAt: { type: [String, Number], required: true },
  duration: { type: Number, default: 90 },
})

const emit = defineEmits(['timeout'])

const now = ref(Date.now())
let interval = null

const expiryMs = computed(() => {
  if (!props.expiresAt) return Date.now() + props.duration * 1000
  return new Date(props.expiresAt).getTime()
})

const remaining = computed(() => {
  return Math.max(0, Math.floor((expiryMs.value - now.value) / 1000))
})

const formattedTime = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

const circumference = 2 * Math.PI * 18 // ≈ 113.097

const dashOffset = computed(() => {
  if (props.duration <= 0) return 0
  const progress = remaining.value / props.duration
  return circumference * (1 - progress)
})

const strokeColor = computed(() => {
  if (remaining.value <= 5) return '#ef4444'
  if (remaining.value <= 15) return '#f59e0b'
  return '#22c55e'
})

function tick() {
  now.value = Date.now()
  if (remaining.value <= 0) {
    emit('timeout')
    stop()
  }
}

function start() {
  stop()
  tick()
  interval = setInterval(tick, 1000)
}

function stop() {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
}

watch(() => props.expiresAt, () => { start() })

onMounted(() => { start() })
onUnmounted(() => { stop() })
</script>

<style scoped>
.turno-timer {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem 0.35rem 0.5rem;
  border-radius: 999px;
  background: rgba(15,23,42,0.5);
  border: 1px solid rgba(255,255,255,0.08);
}
.turno-timer.warning { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.1); }
.turno-timer.critical { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.1); animation: timer-pulse 0.5s infinite; }
@keyframes timer-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
.timer-ring { flex-shrink: 0; }
.timer-progress { transition: stroke-dashoffset 1s linear, stroke 0.3s; }
.timer-text { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.1; }
.timer-seconds { font-size: 1rem; font-weight: 700; color: #e2e8f0; font-variant-numeric: tabular-nums; }
.turno-timer.warning .timer-seconds { color: #fbbf24; }
.turno-timer.critical .timer-seconds { color: #f87171; }
.timer-unit { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; }
</style>
