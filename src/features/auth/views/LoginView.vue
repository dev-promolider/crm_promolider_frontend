<template>
  <div class="login-wrapper">
    <!-- Panel Izquierdo: Formulario -->
    <div class="login-form-panel">
      <div class="form-container">
        <div class="mobile-logo-wrapper">
          <img src="/images/logo/promolider_logo.png" alt="Promolider Logo" class="mobile-logo" @error="onImgError" />
        </div>

        <h2 class="login-title">Inicia sesión</h2>
        <p class="login-subtitle">Bienvenido de vuelta a la plataforma <strong>Promolíder</strong>.</p>

        <!-- ALERTA DE ERROR PERSONALIZADA -->
        <div class="notifications-container" :style="{ display: showErrorAlert ? 'flex' : 'none' }">
          <div class="error-alert">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="error-svg">
                  <path clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" fill-rule="evenodd"></path>
                </svg>
              </div>
              <div class="error-prompt-container">
                <p class="error-prompt-heading">{{ errorTitle }}</p>
                <div class="error-prompt-wrap">
                  <p>{{ errorMessage }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Usuario o Correo</label>
            <div class="input-wrapper">
              <input 
                type="text" 
                id="username" 
                v-model="form.username" 
                required 
                placeholder="ejemplo@correo.com" 
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-wrapper password-input-wrapper">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="form.password" 
                required 
                placeholder="••••••••••••" 
              />
              <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                <EyeOff v-if="!showPassword" :size="20" />
                <Eye v-else :size="20" />
              </button>
            </div>
          </div>

          <div class="options-row">
            <label class="remember-me">
              <input type="checkbox" v-model="form.remember" />
              <div class="checkmark"></div>
              <span>Recuérdame</span>
            </label>
            <a href="#" class="forgot-pwd">¿Olvidaste tu contraseña?</a>
          </div>

          <!-- ReCaptcha Real -->
          <div class="recaptcha-wrapper" v-if="isProduction">
            <vue-recaptcha
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              theme="dark"
              @verify="onRecaptchaVerify"
              @expired="onRecaptchaExpired"
              @fail="onRecaptchaFailed"
            />
            <p v-if="recaptchaError" class="recaptcha-error-text">Por favor completa el captcha para continuar.</p>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <div class="text-wrapper" :data-text="loading ? 'Validando...' : 'Ingresar a mi cuenta'">
              <span class="actual-text">{{ loading ? 'Validando...' : 'Ingresar a mi cuenta' }}</span>
              <span aria-hidden="true" class="hover-text">{{ loading ? 'Validando...' : 'Ingresar a mi cuenta' }}</span>
            </div>
          </button>
        </form>
      </div>
    </div>

    <!-- Panel Derecho: Brand / Decorativo -->
    <div class="login-brand-panel" id="brandSlider">
      <!-- Background Slides -->
      <div 
        class="slide-bg" 
        :class="{ active: currentSlide === 0 }" 
        style="background-image: linear-gradient(rgba(18, 19, 23, 0.4), rgba(18, 19, 23, 0.7)), url('/images/login-bg.webp')"
      ></div>
      <div 
        class="slide-bg" 
        :class="{ active: currentSlide === 1 }" 
        style="background-image: linear-gradient(rgba(18, 19, 23, 0.4), rgba(18, 19, 23, 0.7)), url('/images/login2-bg.png')"
      ></div>

      <div class="brand-content">
        <img src="/images/logo/promolider_logo.png" alt="Promolider Logo" class="brand-logo" @error="onImgError" />
        <h1 class="brand-title">El ecosistema líder<br>para emprendedores.</h1>
        <p class="brand-desc">Accede a tus cursos, automatiza tu marketing y gestiona tu billetera desde un solo lugar.</p>
        
        <!-- Elementos decorativos (Glassmorphism) -->
        <div class="glass-card">
          <div class="glass-icon">
            <Key :size="24" />
          </div>
          <div>
            <h4>Acceso Seguro</h4>
            <p>Protegido con tecnología avanzada</p>
          </div>
        </div>
      </div>
      
      <!-- Indicators -->
      <div class="slider-indicators">
        <div 
          class="indicator" 
          :class="{ active: currentSlide === 0 }" 
          @click="goToSlide(0)"
        >
          <div class="progress"></div>
        </div>
        <div 
          class="indicator" 
          :class="{ active: currentSlide === 1 }" 
          @click="goToSlide(1)"
        >
          <div class="progress"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/stores/authStore';
import VueRecaptcha from 'vue3-recaptcha2';
import { Eye, EyeOff, Key } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const isProduction = process.env.NODE_ENV === 'production';

const form = ref({
  username: '',
  password: '',
  remember: false
});

const showPassword = ref(false);
const loading = ref(false);

const recaptchaToken = ref('');
const recaptchaError = ref(false);

const showErrorAlert = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');

const currentSlide = ref(0);
let slideInterval = null;

const onImgError = (e) => {
  e.target.src = 'https://via.placeholder.com/220x60?text=Promolider';
};

const goToSlide = (index) => {
  currentSlide.value = index;
  resetInterval();
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % 2;
};

const resetInterval = () => {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 3000);
};

onMounted(() => {
  slideInterval = setInterval(nextSlide, 3000);
});

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval);
});

const onRecaptchaVerify = (response) => {
  recaptchaToken.value = response;
  recaptchaError.value = false;
};

const onRecaptchaExpired = () => {
  recaptchaToken.value = '';
};

const onRecaptchaFailed = () => {
  recaptchaToken.value = '';
};

const showError = (title, message) => {
  errorTitle.value = title;
  errorMessage.value = message;
  showErrorAlert.value = true;
};

const handleLogin = async () => {
  showErrorAlert.value = false;

  if (isProduction && !recaptchaToken.value) {
    recaptchaError.value = true;
    return;
  }

  loading.value = true;
  try {
    await authStore.login({
      username: form.value.username,
      password: form.value.password,
      'g-recaptcha-response': recaptchaToken.value
    });
    
    router.push({ name: 'dashboard' });
  } catch (error) {
    console.error("Error capturado en login:", error);
    if (error.response && error.response.status === 401) {
      showError("Credenciales Incorrectas", error.response.data?.message || "La contraseña o el usuario no son válidos.");
    } else if (error.response && error.response.status === 403) {
      showError("Acceso Denegado", error.response.data?.message || "Tu cuenta está inactiva o falta de permisos.");
    } else {
      showError("Error de Conexión", "Ha ocurrido un error en el servidor al intentar iniciar sesión. Por favor intenta de nuevo.");
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  --sidebar-bg: #121317;
  --sidebar-logo-bg: #1a1d24;
  --white: #ffffff;
  --text-muted: #9ca3af;
  --text-light: #d1d5db;
  --sidebar-link: #9ca3af;
  --sidebar-hover-bg: #374151;
  --primary-color: #18d600;
  --primary-hover: #15b800;
  --danger-color: #ef4444;

  display: flex;
  min-height: 100vh;
  background-color: var(--sidebar-bg);
  color: var(--white);
  font-family: 'Inter', sans-serif;
}

/* ── PANEL IZQUIERDO (FORMULARIO) ── */
.login-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--sidebar-logo-bg);
  padding: 40px;
  position: relative;
  z-index: 2;
}

.form-container {
  width: 100%;
  max-width: 420px;
}

.mobile-logo-wrapper {
  display: none;
  margin-bottom: 30px;
}

.mobile-logo {
  max-width: 160px;
}

.login-title {
  color: var(--white);
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.login-subtitle {
  color: var(--text-muted);
  font-size: 15px;
  margin-bottom: 36px;
}

.login-subtitle strong {
  color: var(--primary-color);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: var(--sidebar-link);
  font-size: 14px;
  font-weight: 700;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--sidebar-hover-bg);
  border-radius: 10px;
  background-color: var(--sidebar-bg);
  color: var(--white);
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
}

.input-wrapper input:focus {
  border-color: var(--primary-color);
  background-color: var(--sidebar-logo-bg);
  box-shadow: 0 0 0 4px rgba(24, 214, 0, 0.1);
}

.eye-btn {
  position: absolute;
  right: 14px;
  background: transparent;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  padding: 5px;
}

.eye-btn:hover {
  color: var(--primary-color);
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--sidebar-link);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  user-select: none;
}

.remember-me input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.remember-me .checkmark {
  --clr: var(--primary-color);
  position: relative;
  top: 0;
  left: 0;
  height: 1.4em;
  width: 1.4em;
  background-color: var(--sidebar-hover-bg);
  border-radius: 50%;
  transition: 300ms;
  display: inline-block;
}

.remember-me input:checked ~ .checkmark {
  background-color: var(--clr);
  border-radius: .5rem;
  animation: pulse 500ms ease-in-out;
}

.remember-me .checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.remember-me input:checked ~ .checkmark:after {
  display: block;
}

.remember-me .checkmark:after {
  left: 0.45em;
  top: 0.2em;
  width: 0.25em;
  height: 0.5em;
  border: solid var(--sidebar-logo-bg);
  border-width: 0 0.15em 0.15em 0;
  transform: rotate(45deg);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 rgba(24, 214, 0, 0.5);
    rotate: 20deg;
  }
  50% {
    rotate: -20deg;
  }
  75% {
    box-shadow: 0 0 0 10px rgba(24, 214, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 0 13px rgba(24, 214, 0, 0.1);
    rotate: 0;
  }
}

.forgot-pwd {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  transition: opacity 0.2s;
}

.forgot-pwd:hover {
  opacity: 0.8;
}

/* ReCaptcha */
.recaptcha-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
}

.recaptcha-error-text {
  color: var(--danger-color);
  font-size: 13px;
  margin-top: 8px;
  font-weight: 600;
}

.submit-btn {
  position: relative;
  background: #1a1d24;
  border: 1px solid var(--sidebar-hover-bg);
  border-radius: 10px;
  cursor: pointer;
  z-index: 1;
  padding: 16px;
  margin-top: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #1e2129;
  border-color: var(--primary-color);
  box-shadow: 0 0 15px rgba(24, 214, 0, 0.15);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.text-wrapper {
  position: relative;
  --border-right: 4px;
  --animation-color: var(--primary-color);
  --fs-size: 16px;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: var(--fs-size);
  font-weight: 800;
  color: #ffffff;
  z-index: 2;
}

.text-wrapper .hover-text {
  position: absolute;
  box-sizing: border-box;
  content: attr(data-text);
  color: var(--animation-color);
  width: 0%;
  inset: 0;
  border-right: var(--border-right) solid var(--animation-color);
  overflow: hidden;
  transition: 0.5s;
  white-space: nowrap;
}

.submit-btn:hover:not(:disabled) .text-wrapper .hover-text {
  width: 100%;
  filter: drop-shadow(0 0 15px var(--animation-color));
}

/* ── PANEL DERECHO (BRANDING VISUAL) ── */
.login-brand-panel {
  flex: 1.2;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: var(--sidebar-bg); /* Fallback */
}

.slide-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  z-index: 1;
}

.slide-bg.active {
  opacity: 1;
}

.slider-indicators {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 20;
}

.indicator {
  width: 48px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.indicator .progress {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 0%;
  background: var(--white);
  border-radius: 4px;
}

.indicator.active .progress {
  animation: slideProgress 3s linear forwards;
}

@keyframes slideProgress {
  0% { width: 0%; }
  100% { width: 100%; }
}

.brand-content {
  position: relative;
  z-index: 10;
  max-width: 500px;
  color: var(--white);
}

.brand-logo {
  max-width: 220px;
  margin-bottom: 40px;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
}

.brand-title {
  font-size: 48px;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 20px;
  letter-spacing: -1px;
}

.brand-desc {
  font-size: 18px;
  color: var(--sidebar-link);
  line-height: 1.6;
  margin-bottom: 40px;
}

/* Glassmorphism Card */
.glass-card {
  background: #16181d;
  border-radius: 30px;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 350px;
  border: none;
  box-shadow: 12px 12px 30px rgba(0, 0, 0, 0.6),
             -12px -12px 30px rgba(255, 255, 255, 0.03);
}

.glass-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(24, 214, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.glass-card h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.glass-card p {
  font-size: 13px;
  color: var(--text-light);
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .login-brand-panel {
      display: none;
  }
  .mobile-logo-wrapper {
      display: flex;
  }
  .login-form-panel {
      padding: 20px;
  }
}

/* --- Uiverse.io Error Alert CSS --- */ 
.notifications-container {
  width: 100%;
  height: auto;
  font-size: 0.875rem;
  line-height: 1.25rem;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 20px;
}
.flex { display: flex; }
.flex-shrink-0 { flex-shrink: 0; }
.error-alert {
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: rgb(254 242 242);
  border-left: 4px solid #F87171;
}
.error-svg {
  color: #F87171;
  width: 1.25rem;
  height: 1.25rem;
}
.error-prompt-heading {
  color: #991B1B;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: bold;
}
.error-prompt-container {
  display: flex;
  flex-direction: column;
  margin-left: 1.25rem;
}
.error-prompt-wrap {
  margin-top: 0.5rem;
  color: #B91C1C;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
