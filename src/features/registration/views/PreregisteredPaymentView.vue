<template>
  <div class="pago-container">
    <!-- Top Header -->
    <div class="top-header">
      <h2 class="top-header-title">Crear nueva cuenta</h2>
      <span class="top-header-referred">Referido por: <strong>{{ sponsorName || 'Promolider' }}</strong></span>
    </div>

    <!-- Progress Steps -->
    <div class="steps-bar">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step-item"
        :class="{ 'step-active': currentStep === index, 'step-completed': currentStep > index }"
        @click="goToStep(index)"
      >
        <div class="step-circle">{{ currentStep > index ? '✓' : index + 1 }}</div>
        <span class="step-label">{{ step }}</span>
      </div>
    </div>

    <!-- Step 1: Cuenta -->
    <div v-if="currentStep === 0" class="step-content">
      <h2 class="step-title">Crear tu cuenta</h2>
      <div class="form-grid">
        <!-- Usuario -->
        <div class="form-group">
          <label>Usuario</label>
          <input
            v-model="form.usuario"
            type="text"
            placeholder="Nombre de usuario"
            maxlength="50"
            :class="{ 'input-error': touched.usuario && errors.usuario }"
            @blur="touch('usuario'); validateField('usuario'); checkDuplicate('usuario')"
            @input="validateField('usuario')"
          />
          <span v-if="touched.usuario && errors.usuario" class="field-error">{{ errors.usuario }}</span>
          <span v-else-if="touched.usuario && checking.usuario" class="field-hint">Verificando disponibilidad...</span>
          <span v-else class="field-hint">Solo letras, números y guion bajo (_). Mínimo 4 caracteres.</span>
        </div>

        <!-- Correo (editable) -->
        <div class="form-group">
          <label>Correo</label>
          <input
            v-model="form.correo"
            type="email"
            placeholder="Correo electrónico"
            :class="{ 'input-error': touched.correo && errors.correo }"
            @blur="touch('correo'); validateField('correo'); checkDuplicate('correo')"
            @input="validateField('correo')"
          />
          <span v-if="touched.correo && errors.correo" class="field-error">{{ errors.correo }}</span>
          <span v-else-if="touched.correo && checking.correo" class="field-hint">Verificando correo...</span>
          <span v-else class="field-hint">Recibirás notificaciones importantes en este correo.</span>
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label>Contraseña</label>
          <div class="password-wrapper">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Contraseña"
              :class="{ 'input-error': touched.password && errors.password }"
              @blur="touch('password')"
              @input="validateField('password'); validateField('password_confirm')"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁' }}
            </button>
          </div>
          <span v-if="touched.password && errors.password" class="field-error">{{ errors.password }}</span>
          <span v-else class="field-hint">Mínimo 6 caracteres. Combina mayúsculas, minúsculas y números.</span>
        </div>

        <!-- Confirmar Contraseña -->
        <div class="form-group">
          <label>Confirmar Contraseña</label>
          <div class="password-wrapper">
            <input
              v-model="form.password_confirm"
              :type="showPasswordConfirm ? 'text' : 'password'"
              placeholder="Confirmar contraseña"
              :class="{ 'input-error': touched.password_confirm && errors.password_confirm }"
              @blur="touch('password_confirm'); validateField('password_confirm')"
              @input="validateField('password_confirm')"
            />
            <button type="button" class="toggle-password" @click="showPasswordConfirm = !showPasswordConfirm">
              {{ showPasswordConfirm ? '🙈' : '👁' }}
            </button>
          </div>
          <span v-if="touched.password_confirm && errors.password_confirm" class="field-error">{{ errors.password_confirm }}</span>
        </div>

        <!-- Tipo de Usuario -->
        <div class="form-group">
          <label>Tipo de Cuenta</label>
          <select
            v-model="form.tipo_usuario"
            :class="{ 'input-error': touched.tipo_usuario && errors.tipo_usuario }"
            @blur="touch('tipo_usuario'); validateField('tipo_usuario')"
            @change="validateField('tipo_usuario')"
          >
            <option value="" disabled>Selecciona una opción</option>
            <option value="Producer">Productor Universitario</option>
            <option value="Distributor">Distribuidor</option>
          </select>
          <span v-if="touched.tipo_usuario && errors.tipo_usuario" class="field-error">{{ errors.tipo_usuario }}</span>
        </div>
      </div>

      <div class="step-actions">
        <div></div>
        <button class="primary-btn next-btn" @click="goToStep(1)">
          Continuar
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>
      </div>
    </div>

    <!-- Step 2: Perfil -->
    <div v-if="currentStep === 1" class="step-content">
      <h2 class="step-title">Datos Personales</h2>
      <div class="form-grid">
        <div class="form-group">
          <label>Nombre(s)</label>
          <input
            v-model="form.nombre"
            type="text"
            placeholder="Tus nombres"
            :class="{ 'input-error': touched.nombre && errors.nombre }"
            @blur="touch('nombre'); validateField('nombre')"
            @input="validateField('nombre')"
          />
          <span v-if="touched.nombre && errors.nombre" class="field-error">{{ errors.nombre }}</span>
        </div>

        <div class="form-group">
          <label>Apellido(s)</label>
          <input
            v-model="form.apellido"
            type="text"
            placeholder="Tus apellidos"
            :class="{ 'input-error': touched.apellido && errors.apellido }"
            @blur="touch('apellido'); validateField('apellido')"
            @input="validateField('apellido')"
          />
          <span v-if="touched.apellido && errors.apellido" class="field-error">{{ errors.apellido }}</span>
        </div>

        <div class="form-group">
          <label>Fecha de nacimiento</label>
          <input
            v-model="form.fecha_nacimiento"
            type="date"
            :max="maxBirthDate"
            :class="{ 'input-error': touched.fecha_nacimiento && errors.fecha_nacimiento }"
            @blur="touch('fecha_nacimiento'); validateField('fecha_nacimiento')"
            @input="validateField('fecha_nacimiento')"
          />
          <span v-if="touched.fecha_nacimiento && errors.fecha_nacimiento" class="field-error">{{ errors.fecha_nacimiento }}</span>
        </div>

        <div class="form-group">
          <label>Teléfono (WhatsApp)</label>
          <input
            v-model="form.telefono"
            type="text"
            placeholder="Ej: +51 987654321"
            :class="{ 'input-error': touched.telefono && errors.telefono }"
            @blur="touch('telefono'); validateField('telefono')"
            @input="validateField('telefono')"
          />
          <span v-if="touched.telefono && errors.telefono" class="field-error">{{ errors.telefono }}</span>
        </div>

        <div class="form-group">
          <label>Tipo de Documento</label>
          <select
            v-model="form.tipo_documento"
            :class="{ 'input-error': touched.tipo_documento && errors.tipo_documento }"
            @blur="touch('tipo_documento'); validateField('tipo_documento'); validateField('numero_documento')"
            @change="validateField('tipo_documento'); validateField('numero_documento'); form.numero_documento = ''"
          >
            <option value="" disabled>Selecciona el tipo</option>
            <option value="dni">Cédula de Identidad / DNI</option>
            <option value="pasaporte">Pasaporte</option>
            <option value="carnet_extranjeria">Carnet de Extranjería</option>
          </select>
          <span v-if="touched.tipo_documento && errors.tipo_documento" class="field-error">{{ errors.tipo_documento }}</span>
        </div>

        <div class="form-group">
          <label>Número de Documento</label>
          <input
            v-model="form.numero_documento"
            type="text"
            :placeholder="documentPlaceholder"
            :maxlength="documentMaxLength"
            :disabled="!form.tipo_documento"
            :class="{ 'input-error': touched.numero_documento && errors.numero_documento }"
            @blur="touch('numero_documento'); validateField('numero_documento'); checkDuplicate('numero_documento')"
            @input="validateField('numero_documento')"
          />
          <span v-if="touched.numero_documento && errors.numero_documento" class="field-error">{{ errors.numero_documento }}</span>
          <span v-else-if="touched.numero_documento && checking.numero_documento" class="field-hint">Verificando documento...</span>
          <span v-else class="field-hint">{{ documentHint }}</span>
        </div>
      </div>

      <div class="step-actions">
        <button class="outline-btn" @click="goToStep(0)">Volver</button>
        <button class="primary-btn next-btn" @click="goToStep(2)">
          Continuar
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>
      </div>
    </div>

    <!-- Step 3: Pago -->
    <div v-if="currentStep === 2" class="step-content">
      <h2 class="step-title">Opciones de Pago</h2>
      
      <div v-if="paymentError" class="payment-error-alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        {{ paymentError }}
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>Tipo de cuenta</label>
          <select v-model="form.tipo_cuenta" disabled>
            <option value="pre_registro">Pre registro</option>
          </select>
        </div>
        <div class="form-group">
          <label>Precio</label>
          <input type="text" value="$ 45.00" readonly />
        </div>
        <div class="form-group">
          <label>IVA</label>
          <input type="text" value="18%" readonly />
        </div>
        <div class="form-group">
          <label>Costo total de la membresía</label>
          <input type="text" value="$ 53.10" readonly />
        </div>
        <div class="form-group" style="grid-column: 1 / -1; max-width: 50%;">
          <label>Método de Pago</label>
          <select v-model="form.metodo_pago" class="select-green-border">
            <option value="tarjeta">Tarjeta crédito / débito</option>
          </select>
        </div>
      </div>

      <div class="step-actions">
        <button class="outline-btn" @click="goToStep(1)" :disabled="isPaying">Volver</button>
        <button class="pay-btn" @click="handleSubmit" :disabled="isPaying">
          <span v-if="isPaying" class="loader-spinner"></span>
          <span v-else style="display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Pagar e iniciar sesión
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/services/apiClient'

const currentStep = ref(0)
const steps = ['Cuenta', 'Perfil', 'Pago']
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const isPaying = ref(false)
const sponsorName = ref('')
const paymentError = ref('')
const errors = ref({})
const touched = ref({})
const checking = ref({})

const form = ref({
  usuario: '',
  correo: '',
  password: '',
  password_confirm: '',
  tipo_usuario: '',
  nombre: '',
  apellido: '',
  telefono: '',
  fecha_nacimiento: '',
  tipo_documento: '',
  numero_documento: '',
  pais: '',
  metodo_pago: 'tarjeta',
  tipo_cuenta: 'pre_registro',
  referidor: '',
  lado: '',
  preregistro_id: '',
})

const maxBirthDate = computed(() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().split('T')[0]
})

const documentPlaceholder = computed(() => {
  switch (form.value.tipo_documento) {
    case 'dni': return 'Ej: 12345678'
    case 'carnet_extranjeria': return 'Ej: 000123456'
    case 'pasaporte': return 'Ej: AB123456'
    default: return 'Número de documento'
  }
})

const documentMaxLength = computed(() => {
  switch (form.value.tipo_documento) {
    case 'dni': return 8
    case 'pasaporte': return 20
    default: return 20
  }
})

const documentHint = computed(() => {
  switch (form.value.tipo_documento) {
    case 'dni': return 'El DNI debe tener exactamente 8 dígitos numéricos.'
    case 'carnet_extranjeria': return 'Entre 6 y 12 caracteres alfanuméricos.'
    case 'pasaporte': return 'Entre 6 y 20 caracteres alfanuméricos.'
    default: return 'Ingresa el número tal como aparece en tu documento.'
  }
})

function touch(field) {
  touched.value[field] = true
}

function validateField(field) {
  const f = form.value

  switch (field) {
    case 'usuario':
      if (!f.usuario.trim()) errors.value.usuario = 'Ingresa un nombre de usuario.'
      else if (f.usuario.length < 4) errors.value.usuario = 'Mínimo 4 caracteres.'
      else if (f.usuario.length > 50) errors.value.usuario = 'Máximo 50 caracteres.'
      else if (!/^[A-Za-z0-9_]+$/.test(f.usuario)) errors.value.usuario = 'Solo letras, números y guion bajo (_).'
      else delete errors.value.usuario
      break

    case 'correo':
      if (!f.correo.trim()) errors.value.correo = 'Ingresa tu correo electrónico.'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo)) errors.value.correo = 'El correo no tiene un formato válido.'
      else delete errors.value.correo
      break

    case 'password':
      if (!f.password) errors.value.password = 'Ingresa una contraseña.'
      else if (f.password.length < 6) errors.value.password = 'La contraseña debe tener al menos 6 caracteres.'
      else delete errors.value.password
      break

    case 'password_confirm':
      if (!f.password_confirm) errors.value.password_confirm = 'Confirma tu contraseña.'
      else if (f.password !== f.password_confirm) errors.value.password_confirm = 'Las contraseñas no coinciden.'
      else delete errors.value.password_confirm
      break

    case 'tipo_usuario':
      if (!f.tipo_usuario) errors.value.tipo_usuario = 'Selecciona un tipo de usuario.'
      else delete errors.value.tipo_usuario
      break

    case 'nombre':
      if (!f.nombre.trim()) errors.value.nombre = 'Ingresa tu nombre.'
      else delete errors.value.nombre
      break

    case 'apellido':
      if (!f.apellido.trim()) errors.value.apellido = 'Ingresa tu apellido.'
      else delete errors.value.apellido
      break

    case 'telefono':
      if (!f.telefono.trim()) errors.value.telefono = 'Ingresa tu número de teléfono.'
      else delete errors.value.telefono
      break

    case 'fecha_nacimiento':
      if (!f.fecha_nacimiento) {
        errors.value.fecha_nacimiento = 'Selecciona tu fecha de nacimiento.'
      } else {
        const dob = new Date(f.fecha_nacimiento)
        const today = new Date()
        let age = today.getFullYear() - dob.getFullYear()
        if (age < 18) errors.value.fecha_nacimiento = 'Debes tener al menos 18 años.'
        else delete errors.value.fecha_nacimiento
      }
      break

    case 'tipo_documento':
      if (!f.tipo_documento) errors.value.tipo_documento = 'Selecciona un tipo de documento.'
      else delete errors.value.tipo_documento
      break

    case 'numero_documento':
      if (!f.numero_documento.trim()) errors.value.numero_documento = 'Ingresa tu número de documento.'
      else delete errors.value.numero_documento
      break
  }
}

const debounceTimers = {}

async function checkDuplicate(field) {
  if (errors.value[field]) return

  const valueMap = {
    usuario: form.value.usuario,
    correo: form.value.correo,
    numero_documento: form.value.numero_documento,
  }
  const value = valueMap[field]
  if (!value?.trim()) return

  clearTimeout(debounceTimers[field])
  debounceTimers[field] = setTimeout(async () => {
    checking.value[field] = true
    try {
      const res = await api.get(`/registration/preregistro/check-duplicate?field=${field}&value=${value}`)
      if (res.data.taken) {
        errors.value[field] = res.data.message
      }
    } catch {
      // Ignored
    } finally {
      checking.value[field] = false
    }
  }, 400)
}

function touchAndValidateStep(step) {
  const stepFields = {
    0: ['usuario', 'correo', 'password', 'password_confirm', 'tipo_usuario'],
    1: ['nombre', 'apellido', 'telefono', 'fecha_nacimiento', 'tipo_documento', 'numero_documento'],
    2: [],
  }
  for (const f of stepFields[step] || []) {
    touched.value[f] = true
    validateField(f)
  }
  return (stepFields[step] || []).every(f => !errors.value[f])
}

function goToStep(step) {
  paymentError.value = ''
  if (step > currentStep.value) {
    const valid = touchAndValidateStep(currentStep.value)
    if (!valid) return
  }
  currentStep.value = step
}

async function handleSubmit() {
  paymentError.value = ''

  for (let s = 0; s <= 1; s++) {
    const ok = touchAndValidateStep(s)
    if (!ok) {
      currentStep.value = s
      return
    }
  }

  isPaying.value = true

  try {
    const payload = { ...form.value, preregistro_id: form.value.preregistro_id || null }

    if (!payload.referidor) {
      paymentError.value = 'No se encontró el usuario que te invitó. Vuelve al enlace original.'
      isPaying.value = false
      return
    }
    if (!payload.lado) {
      paymentError.value = 'No se detectó el lado de tu registro. Vuelve al enlace original.'
      isPaying.value = false
      return
    }

    const response = await api.post('/registration/preregistro/openpay', payload)

    if (response.data && response.data.payment_url) {
      radarFired = true
      window.location.href = response.data.payment_url
    } else {
      throw new Error('No se pudo iniciar el pago.')
    }
  } catch (error) {
    if (error.response && error.response.status === 422) {
      if (error.response.data && error.response.data.errors) {
        const step0Fields = ['usuario', 'correo', 'password', 'password_confirm', 'tipo_usuario']
        let firstErrorStep = 2
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          errors.value[key] = Array.isArray(value) ? value[0] : String(value)
          touched.value[key] = true
          if (step0Fields.includes(key) && firstErrorStep > 0) firstErrorStep = 0
          else if (!step0Fields.includes(key) && firstErrorStep > 1 && key !== 'referidor' && key !== 'lado') firstErrorStep = 1
        })
        currentStep.value = firstErrorStep
      }
      paymentError.value = 'Algunos datos no son válidos. Revisa los campos marcados.'
    } else {
       paymentError.value = error.message || 'Ocurrió un error inesperado.'
    }
  } finally {
    isPaying.value = false
  }
}

// Radar tracking
const RADAR_BACKEND = '/registration/preregistro/radar'
let inactivityTimer = null
let radarFired = false

function sendRadarSignal(evento) {
  const payload = {
    evento,
    correo: form.value.correo || localStorage.getItem('preregistro_correo') || '',
    nombres: localStorage.getItem('preregistro_nombre') || '',
    apellidos: localStorage.getItem('preregistro_apellido') || '',
    preregistro_id: form.value.preregistro_id || localStorage.getItem('preregistro_id') || '',
    timestamp: new Date().toISOString(),
  }
  if (!payload.correo) return
  api.post(RADAR_BACKEND, payload).catch(() => {})
}

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => {
    sendRadarSignal('inactivo_3min')
  }, 3 * 60 * 1000)
}

onMounted(() => {
  form.value.usuario        = localStorage.getItem('preregistro_usuario') || ''
  form.value.correo         = localStorage.getItem('preregistro_correo') || ''
  form.value.tipo_usuario   = localStorage.getItem('preregistro_tipo_usuario') || ''
  form.value.nombre         = localStorage.getItem('preregistro_nombre') || ''
  form.value.apellido       = localStorage.getItem('preregistro_apellido') || ''
  form.value.telefono       = localStorage.getItem('preregistro_whatsapp') || ''
  form.value.referidor      = localStorage.getItem('preregistro_referidor') || ''
  form.value.lado           = localStorage.getItem('preregistro_lado') || ''
  form.value.preregistro_id = localStorage.getItem('preregistro_id') || ''
  sponsorName.value         = form.value.referidor

  resetInactivityTimer()
  window.addEventListener('beforeunload', () => {
    if (!radarFired) {
      radarFired = true
      sendRadarSignal('salio_sin_pagar')
    }
  })
})

onUnmounted(() => {
  if (inactivityTimer) clearTimeout(inactivityTimer)
})
</script>

<style scoped>
.pago-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
  font-family: 'Nunito', sans-serif;
}
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.top-header-title { font-size: 24px; font-weight: 700; color: var(--text-bold, #1f2937); }
.top-header-referred { font-size: 14px; color: var(--text-muted, #6b7280); }
.steps-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}
.step-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-card, #fff);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  opacity: 0.5;
}
.step-active { opacity: 1; box-shadow: 0 2px 10px rgba(0,0,0,.05); border: 1px solid var(--primary-color, #18d600); }
.step-completed { opacity: 1; background: var(--bg-body, #f0fdf4); }
.step-circle {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: var(--text-muted, #d1d5db);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}
.step-active .step-circle { background: var(--primary-color, #18d600); }
.step-completed .step-circle { background: var(--primary-color, #18d600); }
.step-label { font-size: 14px; font-weight: 600; color: var(--text-bold, #374151); }
.step-content {
  background: var(--bg-card, #fff);
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,.05);
}
.step-title { font-size: 20px; font-weight: 700; margin-bottom: 24px; color: var(--text-bold, #1f2937); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 600; color: var(--text-bold, #4b5563); }
.form-group input, .form-group select {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.form-group input:focus, .form-group select:focus { border-color: var(--primary-color, #18d600); }
.input-error { border-color: #ef4444 !important; background-color: #fef2f2; }
.field-error { font-size: 12px; color: #ef4444; margin-top: 2px; }
.field-hint { font-size: 12px; color: var(--text-muted, #9ca3af); margin-top: 2px; }
.password-wrapper { position: relative; display: flex; }
.password-wrapper input { width: 100%; padding-right: 40px; }
.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
}
.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}
.primary-btn, .pay-btn {
  padding: 12px 24px;
  background: var(--primary-color, #18d600);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;
}
.primary-btn:hover, .pay-btn:hover { opacity: 0.9; }
.outline-btn {
  padding: 12px 24px;
  background: transparent;
  color: var(--text-muted, #6b7280);
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.outline-btn:hover { background: #f9fafb; color: var(--text-bold, #374151); }
.payment-error-alert {
  display: flex; align-items: center; gap: 12px;
  background: #fef2f2; border: 1px solid #fee2e2;
  color: #ef4444; padding: 16px; border-radius: 8px; margin-bottom: 24px;
}
.payment-card {
  border: 2px solid var(--primary-color, #18d600);
  background: var(--bg-body, #f0fdf4);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
}
.payment-card-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
}
.payment-title { font-weight: 700; color: var(--text-bold, #1f2937); font-size: 16px; }
.payment-price { font-weight: 800; color: var(--primary-color, #18d600); font-size: 20px; }
.payment-desc { color: var(--text-muted, #4b5563); font-size: 14px; margin: 0; }
.loader-spinner {
  width: 20px; height: 20px; border: 2px solid #fff; border-bottom-color: transparent;
  border-radius: 50%; display: inline-block; animation: spin 1s linear infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .steps-bar { flex-direction: column; }
}
</style>
