<template>
  <div class="dinamica-specifications">
    <form @submit.prevent="submitForm">
      <!-- SECCIÓN 1: INFORMACIÓN GENERAL -->
      <div class="card mb-4">
        <div class="card-header">
          Información General
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>Nombre de la dinámica *</label>
            <input type="text" class="form-control" v-model="form.nombre" placeholder="Ej: Ruleta de Navidad..." required />
          </div>
          <div class="form-group">
            <label>Descripción (opcional)</label>
            <textarea class="form-control" v-model="form.descripcion" rows="4" placeholder="Describe la dinámica..."></textarea>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 2: CONFIGURACIÓN DE INSCRIPCIÓN -->
      <div class="card mb-4">
        <div class="card-header">
          Configuración de Inscripción
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>Modo de cierre de inscripción *</label>
            <select class="form-control form-control--locked" disabled>
              <option value="tiempo" selected>Por tiempo</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tiempo máximo de inscripción (minutos) *</label>
            <input type="number" class="form-control" v-model.number="form.tiempoInscripcion" min="1" placeholder="Ej: 60" required />
          </div>
        </div>
      </div>

      <!-- SECCIÓN 3: CONFIGURACIÓN DE PREMIOS -->
      <div class="card mb-4">
        <div class="card-header">
          Configuración de Premios
        </div>
        <div class="card-body">
          <div class="flex-row">
            <div class="flex-col">
              <div class="form-group">
                <label>Tipo de premio en la ruleta *</label>
                <input type="text" class="form-control form-control--locked" value="Premio único" disabled />
              </div>
            </div>
            <div class="flex-col">
              <div class="form-group">
                <label>Cantidad máxima de ganadores *</label>
                <input type="number" class="form-control form-control--locked" value="1" disabled />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 4: GESTIÓN DE PREMIOS -->
      <div class="card mb-4">
        <div class="card-header">
          Gestión de Premios
        </div>
        <div class="card-body">
          <div class="flex-row mb-3">
            <div class="flex-6">
              <div class="form-group">
                <label>Nombre del premio *</label>
                <input type="text" class="form-control" v-model="nuevoPremio.nombre" placeholder="Ej: Cupón de descuento..." />
              </div>
            </div>
            <div class="flex-3">
              <div class="form-group">
                <label>Tipo *</label>
                <select class="form-control" v-model="nuevoPremio.tipo">
                  <option value="">Seleccione</option>
                  <option value="pdf">PDF</option>
                  <option value="imagen">Imagen</option>
                  <option value="enlace">Enlace</option>
                  <option value="texto">Texto</option>
                  <option value="codigo">Código</option>
                  <option value="cupon">Cupón / código único</option>
                  <option value="saldo">Saldo / monedas</option>
                </select>
              </div>
            </div>
            <div class="flex-3">
              <div class="form-group">
                <label>Probabilidad de ganar *</label>
                <select class="form-control" v-model="nuevoPremio.probabilidad">
                  <option value="">Seleccione</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
                <small class="form-hint">Alta: 50% | Media: 30% | Baja: 20%</small>
              </div>
            </div>
          </div>
          <div class="flex-row">
            <div class="flex-12">
              <button type="button" class="btn-primary" @click="agregarPremio" :disabled="premioLimiteAlcanzado || !nuevoPremio.nombre || !nuevoPremio.tipo || !nuevoPremio.probabilidad">
                {{ editandoIndex !== null ? 'Guardar cambios' : 'Agregar premio' }}
              </button>
              <button v-if="editandoIndex !== null" type="button" class="btn-secondary" @click="resetPremioForm">
                Cancelar edición
              </button>
            </div>
          </div>

          <!-- Tabla de premios -->
          <div v-if="form.premios.length > 0" class="mt-4">
            <table class="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th class="text-center">Probabilidad</th>
                  <th class="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(premio, index) in form.premios" :key="index">
                  <td>{{ premio.nombre }}</td>
                  <td><span class="badge badge-info">{{ premio.tipo }}</span></td>
                  <td class="text-center">
                    <span class="badge" :class="{
                      'badge-success': premio.probabilidad === 'alta',
                      'badge-warning': premio.probabilidad === 'media',
                      'badge-danger': premio.probabilidad === 'baja'
                    }">{{ premio.probabilidad }}</span>
                  </td>
                  <td class="text-center">
                    <button type="button" @click="editarPremio(index)">Editar</button>
                    <button type="button" @click="eliminarPremio(index)">Eliminar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="form.premios.length === 0" class="mt-4">
            <div class="alert-warning">
              Aún no has agregado premios. Agrega al menos uno para continuar.
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 5: ACCIONES -->
      <div class="card">
        <div class="card-body">
          <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>
          <div class="form-actions">
            <router-link :to="'/marketing/dinamica/crear'" class="btn-cancel">
              Cancelar
            </router-link>
            <button type="submit" class="btn-success" :disabled="isSubmitting || form.premios.length === 0">
              {{ isSubmitting ? 'Guardando...' : 'Guardar dinámica' }}
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createDinamica, storeDinamicaSpecifications } from '../services/marketingService'
import apiClient from '@/services/apiClient'

const router = useRouter()
const route = useRoute()
const dinamicaId = computed(() => route.params.id)

const maxPremiosPermitidos = 1
const isSubmitting = ref(false)
const editandoIndex = ref(null)
const errorMsg = ref('')

const form = ref({
  id: null, nombre: '', descripcion: '', modoInscripcion: 'tiempo',
  tiempoInscripcion: null, maxParticipantes: null, tipoPremio: "Premio único",
  maxGanadores: 1, premios: []
})

const nuevoPremio = ref({
  nombre: '', tipo: '', probabilidad: '', limiteUsuario: 0,
  vigenciaInicio: null, vigenciaFin: null, claimUrl: ''
})

const premioLimiteAlcanzado = computed(() =>
  form.value.premios.length >= maxPremiosPermitidos && editandoIndex.value === null
)

function resetPremioForm() {
  nuevoPremio.value = { nombre: '', tipo: '', probabilidad: '', limiteUsuario: 0, vigenciaInicio: null, vigenciaFin: null, claimUrl: '' }
  editandoIndex.value = null
}

function agregarPremio() {
  if (premioLimiteAlcanzado.value) return
  if (!nuevoPremio.value.nombre || !nuevoPremio.value.tipo || !nuevoPremio.value.probabilidad) return
  const pesos = { alta: 50, media: 30, baja: 20 }
  const premioData = {
    nombre: nuevoPremio.value.nombre, tipo: nuevoPremio.value.tipo,
    probabilidad: nuevoPremio.value.probabilidad, peso: pesos[nuevoPremio.value.probabilidad],
    limiteUsuario: nuevoPremio.value.limiteUsuario || 0,
    vigenciaInicio: nuevoPremio.value.vigenciaInicio, vigenciaFin: nuevoPremio.value.vigenciaFin,
    claimUrl: nuevoPremio.value.claimUrl
  }
  if (editandoIndex.value !== null) {
    form.value.premios.splice(editandoIndex.value, 1, premioData)
  } else {
    form.value.premios.push(premioData)
  }
  resetPremioForm()
}

function editarPremio(index) {
  const p = form.value.premios[index]
  if (!p) return
  nuevoPremio.value = {
    nombre: p.nombre, tipo: p.tipo, probabilidad: p.probabilidad,
    limiteUsuario: p.limiteUsuario || 0, vigenciaInicio: p.vigenciaInicio,
    vigenciaFin: p.vigenciaFin, claimUrl: p.claimUrl || ''
  }
  editandoIndex.value = index
}

function eliminarPremio(index) {
  form.value.premios.splice(index, 1)
}

async function submitForm() {
  if (form.value.premios.length === 0) return
  isSubmitting.value = true
  errorMsg.value = ''
  try {
    let id = dinamicaId.value

    // Create mode: create the record first if id is 'new'
    if (id === 'new') {
      const createPayload = {
        tipo_dinamica: 'ruleta',
        nombre: form.value.nombre || 'Nueva Ruleta',
        descripcion: form.value.descripcion || '',
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
      nombre: form.value.nombre, descripcion: form.value.descripcion,
      modoInscripcion: form.value.modoInscripcion,
      tiempoInscripcion: form.value.tiempoInscripcion,
      maxParticipantes: form.value.maxParticipantes, mostrarInscritos: true,
      tipoPremio: form.value.tipoPremio, maxGanadores: form.value.maxGanadores,
      premios: form.value.premios.map(p => ({
        nombre: p.nombre, tipo: p.tipo, stock: 1, peso: Number(p.peso),
        limiteUsuario: Number(p.limiteUsuario || 0),
        vigenciaInicio: p.vigenciaInicio || null,
        vigenciaFin: p.vigenciaFin || null, claimUrl: p.claimUrl || null
      }))
    }
    await storeDinamicaSpecifications(id, payload)
    router.push('/marketing/dinamica/crear')
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Error al guardar la dinámica'
  } finally {
    isSubmitting.value = false
  }
}

// Load existing data on mount (skip for new records)
onMounted(async () => {
  if (dinamicaId.value === 'new') return
  try {
    const res = await apiClient.get('/marketing/dinamicas/' + dinamicaId.value)
    const responseData = res.data?.data || res.data
    if (responseData) {
      const d = responseData.dinamica || responseData
      form.value.id = d.id || responseData.id
      form.value.nombre = d.nombre || ''
      form.value.descripcion = d.descripcion || ''
      form.value.tiempoInscripcion = d.tiempo_inscripcion
      form.value.maxParticipantes = d.max_participantes
      const premios = responseData.premios || d.premios || []
      if (premios.length > 0) {
        form.value.premios = premios.map(p => {
          let prob = 'baja'
          if (p.peso >= 50) prob = 'alta'
          else if (p.peso >= 30) prob = 'media'
          return {
            nombre: p.nombre, tipo: p.tipo, probabilidad: prob, peso: p.peso,
            limiteUsuario: p.limite_usuario || 0,
            vigenciaInicio: p.vigencia_inicio, vigenciaFin: p.vigencia_fin,
            claimUrl: p.claim_url
          }
        })
      }
    }
  } catch (e) {
    console.error('Error loading dinamica:', e)
  }
})
</script>

<style scoped>
.dinamica-specifications { max-width: 1000px; margin: 0 auto; }
.card { border: 1px solid #d0d0d0; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
.card-header { padding: 14px 18px; background: #f8f9fa; font-size: 14px; font-weight: 700; color: #2c3e50; border-bottom: 1px solid #d0d0d0; }
.card-body { padding: 18px; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 13px; color: #2c3e50; }
.form-control { width: 100%; padding: 9px 12px; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 13px; }
.form-control:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0,123,255,0.25); }
.form-control--locked { background: #f1f5f9; border-color: #e2e8f0; color: #475569; cursor: not-allowed; font-weight: 600; }
.form-hint { font-size: 11px; color: #6b7280; margin-top: 4px; display: block; }
.flex-row { display: flex; gap: 16px; flex-wrap: wrap; }
.flex-col { flex: 1; min-width: 200px; }
.flex-6 { width: calc(50% - 8px); }
.flex-3 { width: calc(25% - 12px); }
.flex-12 { width: 100%; }
.btn-primary, .btn-secondary, .btn-success, .btn-cancel { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; }
.btn-primary { background: #007bff; color: white; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary:hover:not(:disabled) { background: #0069d9; }
.btn-secondary { background: #6c757d; color: white; }
.btn-secondary:hover { background: #5a6268; }
.btn-success { background: #28a745; color: white; }
.btn-success:hover:not(:disabled) { background: #218838; }
.btn-success:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { background: transparent; border: 1px solid #d0d0d0; color: #2c3e50; text-decoration: none; display: inline-flex; }
.btn-cancel:hover { background: #f8f9fa; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th, .table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eef1f4; }
.table th { background: #f8f9fa; font-weight: 700; color: #2c3e50; }
.badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-info { background: #e7f3ff; color: #004085; }
.badge-success { background: #e4f6ef; color: #166534; }
.badge-warning { background: #fff3cd; color: #856404; }
.badge-danger { background: #fde8e8; color: #b91c1c; }
.alert-warning { padding: 12px 16px; border-radius: 6px; background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; font-size: 13px; }
.error-banner { padding: 12px 16px; border-radius: 6px; background: #fde8e8; border: 1px solid #fecaca; color: #b91c1c; font-size: 13px; margin-bottom: 14px; }
.mb-4 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 12px; }
.mt-4 { margin-top: 16px; }
.text-center { text-align: center; }
</style>
