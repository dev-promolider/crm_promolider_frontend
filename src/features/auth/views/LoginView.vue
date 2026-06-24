<template>
  <div class="login-wrapper">
    
    <!-- Panel Izquierdo: Formulario -->
    <div class="login-form-panel">
      <div class="form-container">
        
        <div class="mobile-logo-wrapper">
          <img src="/images/logo/promolider_logo.png" alt="Promolider Logo" class="mobile-logo" />
        </div>

        <h2 class="login-title">Inicia sesión</h2>
        <p class="login-subtitle">Bienvenido de vuelta a la plataforma <strong>Promolíder</strong>.</p>

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
              <span>Recuérdame</span>
            </label>
            <a href="#" class="forgot-pwd">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <!-- ReCaptcha Real -->
          <div class="recaptcha-wrapper">
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
            {{ loading ? 'Validando...' : 'Entrar a mi cuenta' }}
          </button>
        </form>

      </div>
    </div>

    <!-- Panel Derecho: Brand / Decorativo -->
    <div class="login-brand-panel">
      <div class="brand-content">
        <img src="/images/logo/promolider_logo.png" alt="Promolider Logo" class="brand-logo" />
        <h1 class="brand-title">El ecosistema líder<br>para emprendedores.</h1>
        <p class="brand-desc">Accede a tus cursos, automatiza tu marketing y gestiona tu billetera desde un solo lugar.</p>
        
        <!-- Elementos decorativos (Glassmorphism) -->
        <div class="glass-card">
          <div class="glass-icon"><Key :size="24" color="#18d600" /></div>
          <div>
            <h4>Acceso Seguro</h4>
            <p>Protegido con tecnología avanzada</p>
          </div>
        </div>
      </div>
      
      <!-- Círculos decorativos en el fondo -->
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/stores/authStore';
import VueRecaptcha from 'vue3-recaptcha2';
import { Eye, EyeOff, Key } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  username: '',
  password: '',
  remember: false
});

const showPassword = ref(false);
const loading = ref(false);

const recaptchaToken = ref('');
const recaptchaError = ref(false);

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

const handleLogin = async () => {
  if (!recaptchaToken.value) {
    recaptchaError.value = true;
    return;
  }

  loading.value = true;
  try {
    // Conectamos a la API real pasando usuario y contraseña
    await authStore.login({
      username: form.value.username,
      password: form.value.password
    });
    
    // Redirigir al dashboard tras el éxito
    router.push({ name: 'dashboard' });
  } catch (error) {
    console.error("Error capturado en login:", error);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      alert('Credenciales incorrectas o usuario no autorizado.');
    } else {
      alert('Ha ocurrido un error en el servidor al iniciar sesión.');
    }
  } finally {
    loading.value = false;
  }
};
</script>

