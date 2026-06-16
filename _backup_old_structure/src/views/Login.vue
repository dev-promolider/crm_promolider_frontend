<template>
  <div class="app-content content blank-page">
    <div class="content-wrapper">
      <div class="content-body">
        <div class="auth-wrapper auth-v1 px-2" style="background: #0b0f12ee">
          <div class="auth-inner py-2 back-gris" style="background: #35424a">
            <!-- Tarjeta de Inicio de Sesión -->
            <div class="card mb-0 back-gris">
              <div class="card-body">
                <span class="brand-logo">
                    <img src="/images/logo/dark_logo.png" style="min-width: 130px;width:50%">
                </span>

                <h4 class="card-title mb-1 color-text-green">¡Bienvenido a Promolíder! 👋</h4>
                <p class="card-text mb-2 color-text-white">Inicia sesión con tu cuenta y comienza la aventura</p>

                <form class="auth-login-form mt-2" @submit.prevent="handleLogin">
                  <div class="form-group">
                      <label for="login-user" class="form-label color-text-green">Usuario</label>
                      <input type="text" autocomplete="off"
                          class="form-control input-back" id="login-user"
                          v-model="username" tabindex="1" autofocus
                          placeholder="Ingrese su nombre de usuario" required />
                  </div>

                  <div class="form-group password-container">
                      <label for="login-password" class="form-label color-text-green">Contraseña</label>
                      <input :type="showPassword ? 'text' : 'password'" class="form-control input-back"
                          id="login-password" v-model="password" tabindex="2"
                          placeholder="Ingrese su contraseña" required />
                      <span class="toggle-password" @click="showPassword = !showPassword">
                          <i class="fas" :class="showPassword ? 'fa-eye' : 'fa-eye-slash'"></i>
                      </span>
                  </div>

                  <div class="form-group">
                      <div class="d-flex justify-content-between">
                          <div class="custom-control custom-checkbox">
                              <input class="custom-control-input input-back" type="checkbox" id="remember-me" tabindex="3" v-model="rememberMe" />
                              <label class="custom-control-label color-text-white" for="remember-me"> Recuérdame </label>
                          </div>
                          <div>
                              <a href="#" @click.prevent="showModal = true" class="color-text-green" style="text-decoration: none; font-size: 14px;">
                                  <i class="fas fa-key mr-1"></i>¿Olvidaste tu contraseña?
                              </a>
                          </div>
                      </div>
                  </div>

                  <!-- TODO: reCAPTCHA -->
                  <div class="form-group" v-if="authStore.error">
                    <span class="invalid-feedback text-center" role="alert" style="display: block">
                        <strong>{{ authStore.error }}</strong>
                    </span>
                  </div>

                  <button type="submit" :disabled="authStore.isLoading" class="btn back-green btn-block color-text-white" tabindex="4">
                    {{ authStore.isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Modal de Recuperar Contraseña -->
          <div id="forgotPasswordModal" class="v-dialog" :class="{ 'v-dialog--active': showModal, 'v-dialog--closing': isClosingModal }" @click="handleModalBackdropClick" :style="{ display: showModal || isClosingModal ? 'flex' : 'none' }">
              <div class="modal-content" @click.stop>
                  <div class="modal-header">
                      <h3 class="modal-title">
                          <svg style="margin-right:8px; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2zM2.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>
                          Recuperar Contraseña
                      </h3>
                      <button type="button" class="modal-close" @click="closeModal">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                  </div>
                  
                  <div class="modal-body">
                      <div v-if="recoverySuccess" class="modal-success" style="display: block;">
                          <i class="fas fa-check-circle mr-2"></i>
                          <span>Se ha enviado un enlace de recuperación a tu correo electrónico.</span>
                      </div>
                      
                      <div v-if="recoveryError" class="modal-error" style="display: block;">
                          <i class="fas fa-exclamation-circle mr-2"></i>
                          <span>{{ recoveryErrorMsg }}</span>
                      </div>
                      
                      <p class="modal-text">
                          Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                      </p>
                      
                      <form @submit.prevent="sendRecoveryEmail">
                          <div class="modal-form-group">
                              <label for="forgot-email" class="modal-label">Correo electrónico</label>
                              <input 
                                  type="email" 
                                  id="forgot-email" 
                                  v-model="recoveryEmail"
                                  class="modal-input" 
                                  placeholder="Ingresa tu correo electrónico"
                                  required
                              />
                          </div>
                      </form>
                  </div>
                  
                  <div class="modal-footer">
                      <button type="button" class="modal-btn modal-btn-cancel" @click="closeModal">
                          Cancelar
                      </button>
                      <button type="button" class="modal-btn modal-btn-primary" @click="sendRecoveryEmail" :disabled="isRecovering">
                          {{ isRecovering ? 'Enviando...' : 'Enviar enlace' }}
                      </button>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import axios from 'axios';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);

const showModal = ref(false);
const isClosingModal = ref(false);
const recoveryEmail = ref('');
const isRecovering = ref(false);
const recoverySuccess = ref(false);
const recoveryError = ref(false);
const recoveryErrorMsg = ref('');

const handleLogin = async () => {
  const success = await authStore.login(username.value, password.value);
  if (success) {
    router.push('/dashboard');
  }
};

const closeModal = () => {
  isClosingModal.value = true;
  setTimeout(() => {
    showModal.value = false;
    isClosingModal.value = false;
    recoveryEmail.value = '';
    recoverySuccess.value = false;
    recoveryError.value = false;
  }, 500);
};

const handleModalBackdropClick = () => {
  closeModal();
};

const handleKeydown = (e) => {
  if (e.key === 'Escape' && showModal.value) {
    closeModal();
  }
};

const bodyClasses = ['vertical-layout', 'vertical-menu-modern', 'blank-page', 'dark-layout', 'navbar-floating', 'footer-static'];

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.body.classList.add(...bodyClasses);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.classList.remove(...bodyClasses);
});

const sendRecoveryEmail = async () => {
  recoverySuccess.value = false;
  recoveryError.value = false;

  if (!recoveryEmail.value) {
    recoveryErrorMsg.value = 'Debes ingresar tu correo electrónico.';
    recoveryError.value = true;
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recoveryEmail.value)) {
    recoveryErrorMsg.value = 'Por favor, ingresa un correo electrónico válido.';
    recoveryError.value = true;
    return;
  }

  isRecovering.value = true;
  
  try {
    // API Call goes here
    await new Promise(resolve => setTimeout(resolve, 1500));
    recoverySuccess.value = true;
    recoveryEmail.value = '';
  } catch (error) {
    recoveryErrorMsg.value = error.response?.data?.message || 'Ha ocurrido un error. Inténtalo de nuevo.';
    recoveryError.value = true;
  } finally {
    isRecovering.value = false;
  }
};
</script>

<style scoped>
@import '../assets/sass/base/pages/page-auth.scss';

.v-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0);
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(0px);
    transition: all 0.5s ease;
    will-change: opacity, backdrop-filter;
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
}

.v-dialog--active {
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(3px);
    animation: backdropFadeIn60fps 0.5s ease-out forwards;
}

.modal-content {
    background: #35424a;
    border-radius: 12px;
    padding: 30px;
    width: 90%;
    max-width: 450px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    transform: scale3d(0.3, 0.3, 1) translate3d(0, -50px, 0);
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid #4a5568;
    will-change: transform, opacity;
    transform-style: preserve-3d;
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.v-dialog--active .modal-content {
    animation: modalFadeIn60fps 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.v-dialog--closing .modal-content {
    animation: modalFadeOut60fps 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
}

@keyframes modalFadeIn60fps {
    0% { opacity: 0; transform: scale3d(0.3, 0.3, 1) translate3d(0, -50px, 0) rotateX(10deg); filter: blur(2px); }
    100% { opacity: 1; transform: scale3d(1, 1, 1) translate3d(0, 0, 0) rotateX(0deg); filter: blur(0px); }
}

@keyframes modalFadeOut60fps {
    0% { opacity: 1; transform: scale3d(1, 1, 1) translate3d(0, 0, 0) rotateX(0deg); filter: blur(0px); }
    100% { opacity: 0; transform: scale3d(0.1, 0.1, 1) translate3d(0, -60px, 0) rotateX(15deg); filter: blur(3px); }
}

@keyframes backdropFadeIn60fps {
    0% { background-color: rgba(0, 0, 0, 0); backdrop-filter: blur(0px); }
    100% { background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(3px); }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #4a5568;
}

.modal-title {
    color: #1a7a3e;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.modal-close:hover {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.1);
}

.modal-body { margin-bottom: 25px; }
.modal-text { color: #d1d5db; margin-bottom: 20px; line-height: 1.5; }
.modal-form-group { margin-bottom: 20px; }
.modal-label { color: #1a7a3e; font-weight: 500; margin-bottom: 8px; display: block; }

.modal-input {
    width: 100%;
    padding: 12px 15px;
    background: #2d3748;
    border: 1px solid #4a5568;
    border-radius: 8px;
    color: #ffffff;
    font-size: 14px;
    transition: all 0.2s ease;
}
.modal-input:focus {
    outline: none;
    border-color: #1a7a3e;
    box-shadow: 0 0 0 3px rgba(26, 122, 62, 0.1);
}

.modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.modal-btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    font-size: 14px;
}
.modal-btn-cancel { background: #6b7280; color: #ffffff; }
.modal-btn-cancel:hover { background: #9ca3af; }
.modal-btn-primary { background: #1a7a3e; color: #ffffff; }
.modal-btn-primary:hover { background: #16a34a; }
.modal-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.modal-success {
    color: #10b981;
    background-color: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 20px;
}

.modal-error {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 20px;
}

.btn.back-green:hover { background: #16a34a !important; }
</style>
