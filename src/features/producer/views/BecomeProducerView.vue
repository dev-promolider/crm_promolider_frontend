<template>
  <div class="become-producer-container">
    <div class="hero-section">
      <div class="hero-image-wrapper">
        <img src="@/assets/images/producer_banner.png" alt="Conviértete en Creador" class="hero-image" />
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-title">¿Quieres ganar dinero generando tus propios infoproductos?</h1>
          <p class="hero-subtitle">
            Convierte tu conocimiento en ingresos pasivos. Únete a nuestro programa de Creadores y publica tus cursos en nuestra plataforma global, sin preocuparte por la logística de pagos y marketing.
          </p>
          
          <div class="cta-container">
            <div v-if="loading" class="state-box loading-state">
              <Loader2 :size="28" class="spinner mr-3" />
              <span>Procesando tu solicitud...</span>
            </div>
            
            <div v-else-if="alreadyRequested" class="state-box success-state">
              <CheckCircle2 :size="32" class="success-icon mr-3" />
              <div>
                <h3 class="success-title">¡Solicitud en revisión!</h3>
                <p class="success-desc">Nuestro equipo administrativo está evaluando tu perfil.</p>
              </div>
            </div>
            
            <button v-else class="btn-primary-large" @click="applyForRole">
              Solicitar ser Productor
              <ArrowRight :size="20" class="ml-2 inline-block" />
            </button>
            
            <div v-if="errorMsg" class="error-msg mt-3">{{ errorMsg }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-vue-next';
import apiClient from '@/services/apiClient';

const loading = ref(false);
const alreadyRequested = ref(false);
const errorMsg = ref('');

const applyForRole = async () => {
  loading.value = true;
  errorMsg.value = '';
  
  try {
    await apiClient.post('/profile/role-requests/courses/apply');
    alreadyRequested.value = true;
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.message) {
      if (error.response.data.message.includes('Ya tienes una solicitud')) {
        alreadyRequested.value = true;
      } else {
        errorMsg.value = error.response.data.message;
      }
    } else {
      errorMsg.value = 'Ocurrió un error al enviar la solicitud. Por favor intenta de nuevo.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.become-producer-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  align-items: stretch;
  justify-content: center;
  z-index: 10;
}

.hero-section {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.hero-image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(15, 17, 26, 0.95) 0%, rgba(15, 17, 26, 0.7) 50%, rgba(15, 17, 26, 0.2) 100%);
}

.hero-content {
  position: absolute;
  top: 50%;
  left: 5%;
  transform: translateY(-50%);
  max-width: 600px;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  margin-bottom: 3rem;
}

.cta-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.btn-primary-large {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 1.25rem;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
}

.btn-primary-large:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 35px rgba(34, 197, 94, 0.4);
}

.btn-primary-large:active {
  transform: translateY(0) scale(0.98);
}

.state-box {
  display: flex;
  align-items: center;
  background: rgba(15, 17, 26, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem 2rem;
}

.loading-state {
  color: #22c55e;
  font-weight: 600;
  font-size: 1.25rem;
}

.success-state {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.1);
}

.success-icon {
  color: #22c55e;
}

.success-title {
  color: #22c55e;
  font-weight: 700;
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.success-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.error-msg {
  color: #ef4444;
  font-size: 0.95rem;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .hero-title {
    font-size: 2.75rem;
  }
}

@media (max-width: 768px) {
  .hero-overlay {
    background: linear-gradient(to bottom, rgba(15, 17, 26, 0.4) 0%, rgba(15, 17, 26, 0.95) 100%);
  }
  
  .hero-content {
    top: auto;
    bottom: 2rem;
    left: 1.5rem;
    right: 1.5rem;
    transform: none;
    text-align: center;
    max-width: none;
  }
  
  .hero-title {
    font-size: 2.25rem;
  }
  
  .cta-container {
    align-items: center;
  }
}
</style>
