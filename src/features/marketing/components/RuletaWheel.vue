<template>
  <div class="ruleta-container">
    <div v-if="!premios || premios.length === 0" class="info-box info-info">
      Cargando ruleta...
    </div>
    <div v-else class="ruleta-wrapper">
      <div class="ruleta-pointer"></div>
      <div class="ruleta-wheel" :style="wheelStyle">
        <canvas ref="ruletaCanvas" class="ruleta-canvas" width="400" height="400"></canvas>
      </div>
    </div>
    <button
      v-if="premios && premios.length > 0"
      v-show="!premioGanador || (premioGanador && premioGanador.tipo === 'vacio')"
      @click="girar"
      class="btn-girar"
      :disabled="isSpinning || !puedeGirar || !!premioGanador"
    >
      {{ isSpinning ? 'Girando...' : 'Girar Ruleta' }}
    </button>
    <div v-if="premioGanador" class="resultado-alert" :class="resultadoClase">
      <strong>{{ resultadoTitulo }}</strong>
      <span>{{ resultadoDetalle }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import apiClient from '@/services/apiClient'

const props = defineProps({
  premios: { type: Array, default: () => [] },
  puedeGirar: { type: Boolean, default: false },
  slug: { type: String, default: '' },
  email: { type: String, default: '' }
})

const emit = defineEmits(['spinComplete', 'winnerRegistered', 'playedRegistered'])

const isSpinning = ref(false)
const rotation = ref(0)
const premioGanador = ref(null)
const ruletaCanvas = ref(null)

const wheelStyle = computed(() => ({
  transform: 'rotate(' + rotation.value + 'deg)'
}))

const resultadoTitulo = computed(() => {
  if (!premioGanador.value) return ''
  if (premioGanador.value.tipo === 'vacio') return 'Sin premio esta vez'
  return 'Ganaste!'
})

const resultadoDetalle = computed(() => {
  if (!premioGanador.value) return ''
  if (premioGanador.value.tipo === 'vacio') return 'La flecha cayó en un espacio vacío.'
  return premioGanador.value.nombre || 'Premio asignado'
})

const resultadoClase = computed(() => {
  if (!premioGanador.value) return 'info-info'
  if (premioGanador.value.tipo === 'vacio') return 'info-warning'
  return 'info-success'
})

watch(() => props.premios, () => {
  nextTick(() => dibujarRuleta())
}, { deep: true })

onMounted(() => {
  nextTick(() => dibujarRuleta())
})

/** Segmentos calculados con peso proporcional */
let segmentosPonderados = []

function calcularSegmentos() {
  if (!props.premios || props.premios.length === 0) {
    segmentosPonderados = []
    return
  }
  const lista = [...props.premios]
  
  // Si solo hay 1 premio, alternar con segmentos vacíos
  if (lista.length === 1) {
    const original = lista[0]
    const vacio = { nombre: 'Sin premio', tipo: 'vacio', peso: 20 }
    const resultado = []
    for (let i = 0; i < 16; i++) {
      resultado.push(i % 2 === 0 ? { ...original } : { ...vacio })
    }
    segmentosPonderados = resultado
    return
  }
  
  // Usar los premios directamente con sus pesos
  // Si algún premio no tiene peso, asignar peso 1 por defecto
  const conPeso = lista.map(p => ({
    ...p,
    peso: (p.peso && p.peso > 0) ? p.peso : 1
  }))
  
  // Calcular el total de peso y asegurar que sume al menos algo
  const totalPeso = conPeso.reduce((sum, p) => sum + p.peso, 0)
  if (totalPeso <= 0) {
    segmentosPonderados = conPeso
    return
  }
  
  segmentosPonderados = conPeso.map(p => ({
    ...p,
    anguloProporcional: (p.peso / totalPeso) * (Math.PI * 2)
  }))
}

function dibujarRuleta() {
  const canvas = ruletaCanvas.value
  if (!canvas || !props.premios || props.premios.length === 0) return
  calcularSegmentos()
  const segmentos = segmentosPonderados
  if (segmentos.length === 0) return
  const ctx = canvas.getContext('2d')
  const cx = canvas.width / 2
  const cy = canvas.height / 2
  const radius = Math.min(cx, cy) - 20
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const palette = ['#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399']
  const vacioPalette = ['#bbf7d0', '#86efac', '#4ade80', '#16a34a']
  let currentAngle = 0
  segmentos.forEach((premio, idx) => {
    const anguloSeg = premio.anguloProporcional || ((Math.PI * 2) / segmentos.length)
    const start = currentAngle
    const end = currentAngle + anguloSeg
    ctx.beginPath()
    ctx.arc(cx, cy, radius, start, end)
    ctx.lineTo(cx, cy)
    ctx.fillStyle = premio.tipo === 'vacio' ? vacioPalette[idx % vacioPalette.length] : palette[idx % palette.length]
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.stroke()
    if (premio.nombre) {
      const textAngle = start + anguloSeg / 2
      const textR = radius * 0.65
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(textAngle)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px Arial'
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'
      ctx.lineWidth = 2
      const nombre = premio.nombre.length > 12 ? premio.nombre.slice(0, 12) + '...' : premio.nombre
      ctx.strokeText(nombre, textR, 0)
      ctx.fillText(nombre, textR, 0)
      ctx.restore()
    }
    currentAngle = end
  })
  ctx.beginPath()
  ctx.arc(cx, cy, 30, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, 15, 0, Math.PI * 2)
  ctx.fillStyle = '#333'
  ctx.fill()
}

async function girar() {
  if (isSpinning.value || !props.premios || !props.premios.length || !props.puedeGirar) return
  isSpinning.value = true
  premioGanador.value = null
  try {
    const response = await apiClient.post('/d/' + props.slug + '/spin', { email: props.email })
    const data = response.data
    if (data.angle !== undefined) {
      const normalizedAngle = ((data.angle % 360) + 360) % 360
      const extraTurns = 720
      const currentBase = ((rotation.value % 360) + 360) % 360
      rotation.value = currentBase + extraTurns + normalizedAngle
      setTimeout(() => {
        isSpinning.value = false
        determinarGanador()
      }, 2100)
    }
  } catch (error) {
    isSpinning.value = false
    alert(error.response?.data?.message || 'No se pudo girar la ruleta.')
  }
}

function determinarGanador() {
  const segmentos = segmentosPonderados
  if (!segmentos || segmentos.length === 0) return
  const rotationRad = (((rotation.value % 360) + 360) % 360) * (Math.PI / 180)
  const pointerAngle = Math.PI * 1.5
  const premioAngle = (pointerAngle - rotationRad + Math.PI * 2) % (Math.PI * 2)
  // Encontrar en qué segmento cayó usando ángulos acumulativos
  let anguloAcumulado = 0
  let premioIndex = -1
  for (let i = 0; i < segmentos.length; i++) {
    const anguloSeg = segmentos[i].anguloProporcional || ((Math.PI * 2) / segmentos.length)
    if (premioAngle >= anguloAcumulado && premioAngle < anguloAcumulado + anguloSeg) {
      premioIndex = i
      break
    }
    anguloAcumulado += anguloSeg
  }
  if (premioIndex === -1) premioIndex = segmentos.length - 1
  premioGanador.value = segmentos[premioIndex]
  const esVacio = premioGanador.value && premioGanador.value.tipo === 'vacio'
  if (props.puedeGirar) {
    if (esVacio) {
      apiClient.post('/d/' + props.slug + '/marcar-jugado', { email: props.email })
        .then(function() {
          setTimeout(function() { window.location.reload() }, 8000)
        })
        .catch(function(e) { console.error(e) })
    } else {
      apiClient.post('/d/' + props.slug + '/registrar-ganador', { email: props.email, premio: premioGanador.value.nombre })
        .then(function() {
          setTimeout(function() { window.location.reload() }, 8000)
        })
        .catch(function(e) { console.error(e) })
    }
  }
}
</script>

<style scoped>
.ruleta-container { display: flex; flex-direction: column; align-items: center; padding: 20px 0; }
.ruleta-wrapper { position: relative; width: 400px; height: 400px; margin: 0 auto; display: flex; justify-content: center; align-items: center; }
.ruleta-canvas { width: 100%; height: 100%; display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1)); }
.ruleta-pointer {
  position: absolute; top: -15px; left: 50%; transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 15px solid transparent; border-right: 15px solid transparent;
  border-top: 20px solid #15803d; z-index: 10;
}
.ruleta-wheel {
  width: 100%; height: 100%; border-radius: 50%;
  transition: transform 2s cubic-bezier(.17,.67,.45,1.32);
}
.btn-girar {
  margin-top: 20px; padding: 12px 32px; font-size: 16px; font-weight: 700;
  border: none; border-radius: 8px; background: #15803d; color: #fff;
  cursor: pointer; transition: all 0.2s;
}
.btn-girar:hover:not(:disabled) { background: #166534; transform: translateY(-2px); }
.btn-girar:disabled { opacity: 0.6; cursor: not-allowed; }
.resultado-alert {
  margin-top: 16px; padding: 12px 20px; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 14px;
}
.resultado-alert.info-info { background: var(--indicator-blue); border-color: var(--indicator-blue-text); color: var(--indicator-blue-text); }
.resultado-alert.info-warning { background: var(--indicator-orange); border-color: var(--indicator-orange-text); color: var(--indicator-orange-text); }
.resultado-alert.info-success { background: var(--indicator-green); border-color: var(--indicator-green-text); color: var(--indicator-green-text); }

.info-box {
  margin-top: 16px; padding: 12px 20px; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 14px;
}
.info-box.info-info { background: var(--indicator-blue); color: var(--indicator-blue-text); }
.info-box.info-warning { background: var(--indicator-orange); color: var(--indicator-orange-text); }
.info-box.info-success { background: var(--indicator-green); color: var(--indicator-green-text); }
</style>
