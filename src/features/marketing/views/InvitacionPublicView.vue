<template>
  <div class="public-registration">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando información...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <div class="error-card">
        <h2>Enlace no válido</h2>
        <p>{{ error }}</p>
        <p class="help-text">Si crees que esto es un error, contacta con la persona que te compartió este enlace.</p>
      </div>
    </div>

    <!-- Registration Form -->
    <div v-else class="registration-card">
      <div class="product-header">
        <div v-if="product.image" class="product-image">
          <img :src="product.image" :alt="product.title" />
        </div>
        <div class="product-info">
          <span class="product-type">{{ typeLabel }}</span>
          <h1>{{ product.title }}</h1>
          <p class="product-desc">{{ product.description }}</p>
          <div v-if="type === 'masterclass' && product.date" class="product-detail">
            <strong>Fecha:</strong> {{ formatDate(product.date) }}
          </div>
          <div v-if="product.duration" class="product-detail">
            <strong>Duración:</strong> {{ product.duration }} min
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>Regístrate</h3>
        <p class="form-subtitle">Completa tus datos para acceder a este contenido.</p>

        <form @submit.prevent="submitRegistration">
          <div class="form-row">
            <div class="form-group">
              <label>Nombres *</label>
              <input v-model="form.name" type="text" required placeholder="Tu nombre" />
            </div>
            <div class="form-group">
              <label>Apellidos *</label>
              <input v-model="form.lastname" type="text" required placeholder="Tus apellidos" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Email *</label>
              <input v-model="form.email" type="email" required placeholder="tu@email.com" />
            </div>
            <div class="form-group">
              <label>Teléfono *</label>
              <input v-model="form.phone" type="tel" required placeholder="+51 999 999 999" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>País *</label>
              <input v-model="form.country" type="text" required placeholder="Tu país" />
            </div>
            <div class="form-group">
              <label>Edad *</label>
              <input v-model="form.age" type="number" required min="1" max="120" placeholder="Tu edad" />
            </div>
          </div>

          <div v-if="type === 'masterclass'" class="form-group">
            <label>Tipo de usuario</label>
            <select v-model="form.user_type">
              <option value="Guest">Invitado</option>
              <option value="Affiliate">Afiliado</option>
            </select>
          </div>

          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ submitting ? 'Registrando...' : 'Registrarme' }}
          </button>

          <div v-if="submitError" class="submit-error">{{ submitError }}</div>
        </form>

        <div v-if="registered" class="success-message">
          <div class="success-icon">✓</div>
          <h3>¡Registro exitoso!</h3>
          <p>Te has registrado correctamente. Revisa tu correo electrónico para más información.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/services/apiClient'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const product = ref({})
const type = ref('')
const distributorId = ref(null)
const registered = ref(false)
const submitting = ref(false)
const submitError = ref('')

const form = ref({
  name: '',
  lastname: '',
  email: '',
  phone: '',
  country: '',
  age: '',
  user_type: 'Guest',
})

const typeLabel = computed(() => {
  const labels = { masterclass: 'Masterclass', ebook: 'E-book', 'mini-course': 'Mini Curso' }
  return labels[type.value] || 'Contenido'
})

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(async () => {
  const code = route.query.invitation_code
  if (!code) {
    error.value = 'Código de invitación no proporcionado.'
    loading.value = false
    return
  }
  try {
    const res = await apiClient.get(`/products/invitation/${code}`)
    if (res.data.success) {
      product.value = res.data.product
      type.value = res.data.type
      distributorId.value = res.data.distributor_id
    } else {
      error.value = res.data.message || 'Enlace de invitación no válido.'
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al validar el enlace de invitación.'
  } finally {
    loading.value = false
  }
})

async function submitRegistration() {
  submitting.value = true
  submitError.value = ''
  try {
    const code = route.query.invitation_code
    const res = await apiClient.post('/products/register', {
      code,
      name: form.value.name,
      lastname: form.value.lastname,
      email: form.value.email,
      phone: form.value.phone,
      country: form.value.country,
      age: parseInt(form.value.age),
      user_type: type.value === 'masterclass' ? form.value.user_type : undefined,
    })
    if (res.data.success) {
      registered.value = true
    } else {
      submitError.value = res.data.message || 'Error al registrar.'
    }
  } catch (e) {
    submitError.value = e.response?.data?.message || 'Error al procesar el registro.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.public-registration {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-container, .error-container {
  text-align: center;
  color: white;
}

.spinner {
  width: 48px; height: 48px;
  border: 4px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 16px;
  max-width: 480px;
}
.error-card h2 { color: #ff6b6b; margin-bottom: 12px; }
.error-card p { color: rgba(255,255,255,0.8); }
.help-text { margin-top: 20px; font-size: 0.85rem; opacity: 0.6; }

.registration-card {
  background: white;
  border-radius: 16px;
  max-width: 720px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.product-header {
  display: flex;
  background: #f8f9fa;
}

.product-image {
  width: 200px;
  min-height: 200px;
  flex-shrink: 0;
  background: #e9ecef;
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 24px;
  flex: 1;
}

.product-type {
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.product-info h1 {
  font-size: 1.5rem;
  margin: 0 0 12px;
  color: #1a1a2e;
}

.product-desc {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 12px;
}

.product-detail {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 4px;
}

.form-section {
  padding: 32px;
}

.form-section h3 {
  margin: 0 0 4px;
  color: #1a1a2e;
  font-size: 1.2rem;
}

.form-subtitle {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  flex: 1;
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.btn-submit:hover { background: #0069d9; }
.btn-submit:disabled { background: #93c5fd; cursor: not-allowed; }

.submit-error {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 12px;
  padding: 8px 12px;
  background: #fff5f5;
  border-radius: 6px;
}

.success-message {
  text-align: center;
  padding: 40px;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
}

.success-message h3 {
  color: #28a745;
  margin-bottom: 8px;
}

.success-message p {
  color: #666;
}

@media (max-width: 600px) {
  .product-header { flex-direction: column; }
  .product-image { width: 100%; height: 200px; }
  .form-row { flex-direction: column; gap: 0; }
}
</style>
