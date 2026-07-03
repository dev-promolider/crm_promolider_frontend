<template>
  <div class="registro-public-page">
    <div v-if="loading" class="loading-state">
      <div class="loader-spinner primary"></div>
      <p>Validando enlace de invitación...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="error-icon"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
      <h2>Enlace Inválido o Expirado</h2>
      <p>{{ error }}</p>
      <router-link to="/login" class="back-link">Ir al inicio</router-link>
    </div>

    <div v-else class="registration-container">
      <div class="sponsor-banner">
        <span>Has sido invitado por:</span>
        <strong>{{ sponsor.name || sponsor.username }}</strong>
      </div>
      
      <div class="form-card">
        <h2>Crear tu cuenta Promolider</h2>
        <p class="subtitle">Completa tus datos para finalizar tu inscripción</p>
        
        <!-- Stepper Indicator -->
        <div class="stepper-indicator">
          <div class="step" :class="{ active: currentStep >= 1 }">
            <div class="step-circle">1</div>
            <span>Cuenta</span>
          </div>
          <div class="stepper-line" :class="{ active: currentStep >= 2 }"></div>
          <div class="step" :class="{ active: currentStep >= 2 }">
            <div class="step-circle">2</div>
            <span>Datos Personales</span>
          </div>
          <div class="stepper-line" :class="{ active: currentStep >= 3 }"></div>
          <div class="step" :class="{ active: currentStep >= 3 }">
            <div class="step-circle">3</div>
            <span>Membresía y Pago</span>
          </div>
        </div>

        <form @submit.prevent="submitForm">
          
          <!-- PASO 1 -->
          <div v-show="currentStep === 1" class="step-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Nombre de Usuario *</label>
                <input type="text" v-model="form.username" class="custom-input" minlength="3" />
              </div>

              <div class="form-group">
                <label>Correo Electrónico *</label>
                <input type="email" v-model="form.email" class="custom-input" />
              </div>

              <div class="form-group">
                <label>Contraseña *</label>
                <input type="password" v-model="form.password" class="custom-input" minlength="6" />
              </div>

              <div class="form-group">
                <label>Confirmar Contraseña *</label>
                <input type="password" v-model="repassword" class="custom-input" minlength="6" />
              </div>

              <div class="form-group">
                <label>Tipo de Usuario *</label>
                <select v-model="form.user_type" class="custom-input">
                  <option value="" disabled>Seleccione...</option>
                  <option v-for="type in formDataLists.user_types" :key="type.id" :value="type.name">
                    {{ type.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-actions right">
              <button type="button" class="btn-primary" @click="nextStep(1)">Siguiente ➔</button>
            </div>
          </div>

          <!-- PASO 2 -->
          <div v-show="currentStep === 2" class="step-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Nombres *</label>
                <input type="text" v-model="form.name" class="custom-input" />
              </div>
              
              <div class="form-group">
                <label>Apellidos *</label>
                <input type="text" v-model="form.last_name" class="custom-input" />
              </div>

              <div class="form-group">
                <label>Biografía (Opcional)</label>
                <textarea v-model="form.biography" rows="2" class="custom-input"></textarea>
              </div>

              <div class="form-group">
                <label>Teléfono *</label>
                <input type="tel" v-model="form.phone" class="custom-input" />
              </div>

              <div class="form-group">
                <label>Fecha de Nacimiento *</label>
                <input type="date" v-model="form.date_birth" class="custom-input" />
              </div>

              <div class="form-group">
                <label>País *</label>
                <select v-model="form.id_country" class="custom-input">
                  <option value="" disabled>Seleccione...</option>
                  <option v-for="country in formDataLists.countries" :key="country.id" :value="country.id">
                    {{ country.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Tipo de Documento *</label>
                <select v-model="form.id_document_type" class="custom-input">
                  <option value="" disabled>Seleccione...</option>
                  <option v-for="doc in formDataLists.document_types" :key="doc.id" :value="doc.id">
                    {{ doc.document }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Número de Documento *</label>
                <input type="text" v-model="form.nro_document" class="custom-input" />
              </div>
            </div>

            <div class="form-actions space-between">
              <button type="button" class="btn-secondary" @click="prevStep">🡠 Anterior</button>
              <button type="button" class="btn-primary" @click="nextStep(2)">Siguiente ➔</button>
            </div>
          </div>

          <!-- PASO 3 -->
          <div v-show="currentStep === 3" class="step-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Tipo de Membresía / Cuenta *</label>
                <select v-model="form.id_account_type" class="custom-input">
                  <option value="" disabled>Seleccione...</option>
                  <option v-for="acc in formDataLists.account_types" :key="acc.id" :value="acc.id">
                    {{ acc.account }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Precio</label>
                <input type="text" :value="accountPrice.toFixed(2)" class="custom-input" disabled />
              </div>

              <div class="form-group">
                <label>IVA / Impuesto</label>
                <input type="text" :value="accountIva.toFixed(2)" class="custom-input" disabled />
              </div>

              <div class="form-group">
                <label>Costo Total de Membresía</label>
                <input type="text" :value="totalCost.toFixed(2)" class="custom-input highlight" readonly />
              </div>

              <div class="form-group" v-if="totalCost > 0">
                <label>Método de Pago *</label>
                <select v-model="form.id_payment_method" class="custom-input">
                  <option value="" disabled>Seleccione...</option>
                  <option v-for="pm in formDataLists.payment_methods" :key="pm.id" :value="pm.id">
                    {{ pm.name }}
                  </option>
                </select>
              </div>

              <div class="form-group" v-if="totalCost > 0 && form.id_payment_method && isOfflinePayment">
                <label>Número de Operación *</label>
                <input type="text" v-model="form.operation_number" class="custom-input" />
              </div>
            </div>

            <div class="form-actions space-between">
              <button type="button" class="btn-secondary" @click="prevStep">🡠 Anterior</button>
              <button type="submit" class="btn-success" :disabled="submitting">
                <span v-if="submitting" class="loader-spinner"></span>
                <span v-else>Finalizar Registro ✔</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { validateSponsorLink, getFormData, submitRegistration, submitOpenpayPayment } from '../services/registrationService';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const sponsor = ref(null);
const formDataLists = ref({
  user_types: [],
  countries: [],
  document_types: [],
  account_types: [],
  payment_methods: []
});
const submitting = ref(false);

const currentStep = ref(1);
const repassword = ref('');

const form = ref({
  id_referrer_sponsor: '',
  username: '',
  email: '',
  password: '',
  user_type: '',
  name: '',
  last_name: '',
  biography: '',
  phone: '',
  date_birth: '',
  id_country: '', 
  id_document_type: '',
  nro_document: '',
  id_account_type: '',
  id_payment_method: '',
  operation_number: '',
  amount: 0
});

const selectedAccount = computed(() => {
  if (!formDataLists.value.account_types) return null;
  return formDataLists.value.account_types.find(a => a.id == form.value.id_account_type);
});

const accountPrice = computed(() => selectedAccount.value ? parseFloat(selectedAccount.value.price) : 0);
const accountIva = computed(() => selectedAccount.value ? parseFloat(selectedAccount.value.iva) : 0);
const totalCost = computed(() => accountPrice.value + accountIva.value);

const isOfflinePayment = computed(() => {
  if (!form.value.id_payment_method || !formDataLists.value.payment_methods) return false;
  const pm = formDataLists.value.payment_methods.find(p => p.id == form.value.id_payment_method);
  return pm && pm.name.toLowerCase().includes('binance');
});

onMounted(async () => {
  const { id, timestamp } = route.params;
  
  if (!id || !timestamp) {
    error.value = "Faltan parámetros en el enlace.";
    loading.value = false;
    return;
  }

  try {
    const linkValidation = await validateSponsorLink(id, timestamp);
    
    if (linkValidation && linkValidation.success && linkValidation.data) {
      sponsor.value = linkValidation.data;
      form.value.id_referrer_sponsor = linkValidation.data.id;
      
      const data = await getFormData();
      if (data && data.success) {
        formDataLists.value = data.data;
      } else {
        formDataLists.value = data; 
      }
    } else {
      error.value = "El enlace no es válido o ya expiró.";
    }
  } catch (err) {
    error.value = "Ocurrió un error al validar el enlace.";
  } finally {
    loading.value = false;
  }
});

const nextStep = (step) => {
  if (step === 1) {
    if (!form.value.username || !form.value.email || !form.value.password || !form.value.user_type) {
      alert("Por favor completa todos los campos requeridos del Paso 1");
      return;
    }
    if (form.value.password !== repassword.value) {
      alert("Las contraseñas no coinciden");
      return;
    }
  }
  if (step === 2) {
    if (!form.value.name || !form.value.last_name || !form.value.phone || !form.value.date_birth || !form.value.id_country || !form.value.id_document_type || !form.value.nro_document) {
      alert("Por favor completa todos los campos requeridos del Paso 2");
      return;
    }
  }
  currentStep.value++;
};

const prevStep = () => {
  currentStep.value--;
};

const submitForm = async () => {
  if (totalCost.value > 0) {
    if (!form.value.id_payment_method) {
      alert("Debes seleccionar un método de pago");
      return;
    }
    if (isOfflinePayment.value && !form.value.operation_number) {
      alert("Debes ingresar el número de operación");
      return;
    }
  } else {
    // Es registro gratuito, limpiar campos de pago
    form.value.id_payment_method = 1; // Backend defaults
    form.value.operation_number = '0';
  }

  form.value.amount = totalCost.value;

  submitting.value = true;
  try {
    // Si eligen Openpay (id_payment_method == 1 y el precio es mayor a 0)
    if (totalCost.value > 0 && form.value.id_payment_method == 1) {
      const openpayPayload = {
        usuario: form.value.username,
        correo: form.value.email,
        password: form.value.password,
        password_confirm: repassword.value,
        tipo_usuario: form.value.user_type,
        nombre: form.value.name,
        apellido: form.value.last_name,
        telefono: form.value.phone,
        fecha_nacimiento: form.value.date_birth,
        tipo_documento: formDataLists.value.document_types.find(d => d.id == form.value.id_document_type)?.document || '',
        numero_documento: form.value.nro_document,
        pais: formDataLists.value.countries.find(c => c.id == form.value.id_country)?.name || '',
        tipo_cuenta: formDataLists.value.account_types.find(a => a.id == form.value.id_account_type)?.account || '',
        metodo_pago: formDataLists.value.payment_methods.find(p => p.id == form.value.id_payment_method)?.name || 'openpay',
        referidor: sponsor.value.username,
        lado: 'izquierda' // Default para registro
      };
      
      const response = await submitOpenpayPayment(openpayPayload);
      if (response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        alert("No se pudo generar el link de pago seguro de Openpay.");
      }
      return; // Detenemos aquí para que redirija
    }

    // Registro normal (Offline o Gratuito)
    const response = await submitRegistration(form.value);
    alert("¡Registro exitoso! Serás redirigido al login.");
    router.push('/login');
  } catch (err) {
    console.error(err.response?.data);
    const backendMessage = err.response?.data?.message || err.response?.data?.error;
    
    // Si hay errores de validación de Laravel (validation errors en .errors)
    const validationErrors = err.response?.data?.errors;
    if (validationErrors) {
      const firstError = Object.values(validationErrors)[0][0];
      alert("Error de validación: " + firstError);
    } else {
      alert(backendMessage ? "Error: " + backendMessage : "Ocurrió un error al registrarse. Revisa los datos.");
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* Page Background */
.registro-public-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Deep, rich modern background */
  background: #0b0f19; 
  position: relative;
  overflow: hidden;
  color: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
  padding: 40px 20px;
}

/* Glowing orbs for premium feel */
.registro-public-page::before,
.registro-public-page::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  pointer-events: none;
}
.registro-public-page::before {
  top: -10%;
  left: -10%;
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, rgba(24, 214, 0, 0.15) 0%, rgba(24, 214, 0, 0) 70%);
}
.registro-public-page::after {
  bottom: -10%;
  right: -10%;
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%);
}

.registration-container {
  width: 100%;
  max-width: 850px;
  z-index: 1; /* Above the orbs */
  position: relative;
}

/* Glassmorphism Card */
.form-card {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 50px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.form-card h2 {
  margin: 0 0 10px 0;
  color: #ffffff;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.subtitle {
  color: #94a3b8;
  margin-bottom: 40px;
  font-size: 16px;
  line-height: 1.5;
}

/* Sponsor Banner */
.sponsor-banner {
  background: linear-gradient(90deg, rgba(24, 214, 0, 0.15) 0%, rgba(24, 214, 0, 0.05) 100%);
  border: 1px solid rgba(24, 214, 0, 0.3);
  padding: 16px 24px;
  border-radius: 16px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #e2e8f0;
  font-size: 15px;
  box-shadow: 0 4px 20px rgba(24, 214, 0, 0.1);
}
.sponsor-banner strong {
  color: #22c55e;
  font-size: 17px;
  font-weight: 700;
}

/* Stepper styles */
.stepper-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 45px;
  padding: 0 15px;
}
.stepper-indicator .step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  opacity: 0.5;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.stepper-indicator .step.active {
  opacity: 1;
}
.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.15);
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.step.active .step-circle {
  background: rgba(24, 214, 0, 0.15);
  border-color: #22c55e;
  color: #22c55e;
  box-shadow: 0 0 25px rgba(34, 197, 94, 0.25);
  transform: scale(1.15);
}
.stepper-line {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 25px;
  transform: translateY(-16px);
  position: relative;
  border-radius: 3px;
  overflow: hidden;
}
.stepper-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #22c55e, #10b981);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.stepper-line.active::after {
  width: 100%;
}
.stepper-indicator span {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  transition: color 0.5s;
}
.step.active span {
  color: #f8fafc;
}

/* Animations */
.step-content {
  animation: slideUpFade 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}

@media(max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .stepper-indicator span { display: none; }
  .form-card { padding: 30px 20px; }
  .stepper-line { margin: 0 10px; }
}

/* Inputs Label */
.form-group label {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
  letter-spacing: 0.2px;
}

/* Premium Inputs */
.custom-input {
  width: 100%;
  padding: 16px 20px;
  background-color: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}
.custom-input:hover:not(:disabled) {
  background-color: rgba(15, 23, 42, 1);
  border-color: rgba(255, 255, 255, 0.3);
}
.custom-input:focus {
  background-color: rgba(15, 23, 42, 1);
  border-color: #22c55e;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(34, 197, 94, 0.15);
}
.custom-input::placeholder {
  color: #64748b;
}

/* Fix browser autofill completely so it looks native */
.custom-input:-webkit-autofill,
.custom-input:-webkit-autofill:hover, 
.custom-input:-webkit-autofill:focus, 
.custom-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 40px #0f172a inset !important;
  -webkit-text-fill-color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  transition: background-color 5000s ease-in-out 0s;
}

.custom-input:disabled, .custom-input[readonly] {
  background-color: rgba(0, 0, 0, 0.4);
  color: #64748b;
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.05);
  box-shadow: none;
}
.custom-input.highlight {
  border-color: #22c55e;
  color: #22c55e;
  font-weight: 700;
  font-size: 20px;
  background-color: rgba(34, 197, 94, 0.05);
}

/* Custom Select Dropdown - make it legible */
select.custom-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23cbd5e1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 20px;
  padding-right: 48px;
}
select.custom-input option {
  background-color: #1e293b;
  color: #ffffff;
  padding: 12px;
  font-size: 16px;
}

/* Actions */
.form-actions {
  margin-top: 45px;
  display: flex;
  gap: 20px;
}
.form-actions.right {
  justify-content: flex-end;
}
.form-actions.space-between {
  justify-content: space-between;
}

/* Buttons */
.btn-primary, .btn-secondary, .btn-success {
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
}
.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(59, 130, 246, 0.4);
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}
.btn-success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  min-width: 240px;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
}
.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(34, 197, 94, 0.4);
}
.btn-success:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Loading & States */
.loading-state, .error-state {
  text-align: center;
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 60px;
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
}
.loader-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255,255,255,0.2);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  display: inline-block;
}
.loader-spinner.primary {
  border-color: rgba(34, 197, 94, 0.2);
  border-top-color: #22c55e;
  width: 40px;
  height: 40px;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #22c55e;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s;
}
.back-link:hover {
  color: #4ade80;
  text-decoration: underline;
}
</style>
