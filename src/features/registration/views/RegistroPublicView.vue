<template>
  <div class="registro-public-page">
    <div v-if="loading" class="loading-state">
      <div class="loader-spinner primary"></div>
      <p>Validando enlace de invitación...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <XCircle :size="48" class="error-icon" />
      <h2>Enlace inválido o expirado</h2>
      <p>{{ error }}</p>
      <router-link to="/login" class="back-link">Ir al inicio</router-link>
    </div>

    <div v-else class="registration-container">
      <div class="sponsor-banner">
        <UserCheck :size="20" />
        <span>Has sido invitado por</span>
        <strong>{{ sponsor.name || sponsor.username }}</strong>
      </div>

      <div class="form-card">
        <header class="card-head">
          <h2>Crear tu cuenta Promolíder</h2>
          <p class="subtitle">Completa tus datos y elige cómo quieres empezar. Es un solo paso.</p>
        </header>

        <form @submit.prevent="submitForm" novalidate>

          <!-- Datos de acceso -->
          <section class="form-section">
            <div class="section-head">
              <span class="section-number">1</span>
              <div>
                <h3>Datos de acceso</h3>
                <p>Con esto entrarás a la plataforma.</p>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="username">Nombre de usuario <span class="req">*</span></label>
                <input
                  id="username" type="text" v-model.trim="form.username" class="custom-input"
                  :class="{ invalid: errors.username }" autocomplete="username"
                  @blur="validateField('username', form.username)"
                />
                <span class="error-text" v-if="errors.username">{{ errors.username }}</span>
              </div>

              <div class="form-group">
                <label for="email">Correo electrónico <span class="req">*</span></label>
                <input
                  id="email" type="email" v-model.trim="form.email" class="custom-input"
                  :class="{ invalid: errors.email }" autocomplete="email"
                  @blur="validateField('email', form.email)"
                />
                <span class="error-text" v-if="errors.email">{{ errors.email }}</span>
              </div>

              <div class="form-group">
                <label for="password">Contraseña <span class="req">*</span></label>
                <div class="input-with-action">
                  <input
                    id="password" :type="showPassword ? 'text' : 'password'" v-model="form.password"
                    class="custom-input" :class="{ invalid: errors.password }" autocomplete="new-password"
                  />
                  <button
                    type="button" class="input-action" @click="showPassword = !showPassword"
                    :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  >
                    <EyeOff v-if="showPassword" :size="18" />
                    <Eye v-else :size="18" />
                  </button>
                </div>
                <span class="hint" v-if="!errors.password">Mínimo 6 caracteres.</span>
                <span class="error-text" v-if="errors.password">{{ errors.password }}</span>
              </div>

              <div class="form-group">
                <label for="repassword">Confirmar contraseña <span class="req">*</span></label>
                <input
                  id="repassword" :type="showPassword ? 'text' : 'password'" v-model="repassword"
                  class="custom-input" :class="{ invalid: errors.repassword }" autocomplete="new-password"
                />
                <span class="error-text" v-if="errors.repassword">{{ errors.repassword }}</span>
              </div>
            </div>
          </section>

          <!-- Datos personales -->
          <section class="form-section">
            <div class="section-head">
              <span class="section-number">2</span>
              <div>
                <h3>Tus datos personales</h3>
                <p>Los necesitamos para verificar tu identidad y emitir tus pagos.</p>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="name">Nombres <span class="req">*</span></label>
                <input
                  id="name" type="text" v-model.trim="form.name" class="custom-input"
                  :class="{ invalid: errors.name }" autocomplete="given-name"
                />
                <span class="error-text" v-if="errors.name">{{ errors.name }}</span>
              </div>

              <div class="form-group">
                <label for="last_name">Apellidos <span class="req">*</span></label>
                <input
                  id="last_name" type="text" v-model.trim="form.last_name" class="custom-input"
                  :class="{ invalid: errors.last_name }" autocomplete="family-name"
                />
                <span class="error-text" v-if="errors.last_name">{{ errors.last_name }}</span>
              </div>

              <div class="form-group">
                <label for="phone">Teléfono <span class="req">*</span></label>
                <input
                  id="phone" type="tel" v-model.trim="form.phone" class="custom-input"
                  :class="{ invalid: errors.phone }" autocomplete="tel"
                />
                <span class="error-text" v-if="errors.phone">{{ errors.phone }}</span>
              </div>

              <div class="form-group">
                <label for="date_birth">Fecha de nacimiento <span class="req">*</span></label>
                <input
                  id="date_birth" type="date" v-model="form.date_birth" class="custom-input"
                  :class="{ invalid: errors.date_birth }" :max="maxBirthDate"
                />
                <span class="error-text" v-if="errors.date_birth">{{ errors.date_birth }}</span>
              </div>

              <div class="form-group">
                <label for="id_country">País <span class="req">*</span></label>
                <select
                  id="id_country" v-model="form.id_country" class="custom-input"
                  :class="{ invalid: errors.id_country }"
                >
                  <option value="" disabled>Seleccione...</option>
                  <option v-for="country in formDataLists.countries" :key="country.id" :value="country.id">
                    {{ country.name }}
                  </option>
                </select>
                <span class="error-text" v-if="errors.id_country">{{ errors.id_country }}</span>
              </div>

              <div class="form-group">
                <label for="id_document_type">Tipo de documento <span class="req">*</span></label>
                <select
                  id="id_document_type" v-model="form.id_document_type" class="custom-input"
                  :class="{ invalid: errors.id_document_type }"
                >
                  <option value="" disabled>Seleccione...</option>
                  <option v-for="doc in formDataLists.document_types" :key="doc.id" :value="doc.id">
                    {{ doc.document }}
                  </option>
                </select>
                <span class="error-text" v-if="errors.id_document_type">{{ errors.id_document_type }}</span>
              </div>

              <div class="form-group">
                <label for="nro_document">Número de documento <span class="req">*</span></label>
                <input
                  id="nro_document" type="text" v-model.trim="form.nro_document" class="custom-input"
                  :class="{ invalid: errors.nro_document }"
                  @blur="validateField('nro_document', form.nro_document, form.id_document_type)"
                />
                <span class="error-text" v-if="errors.nro_document">{{ errors.nro_document }}</span>
              </div>

              <div class="form-group full">
                <label for="biography">Biografía <span class="optional">(opcional)</span></label>
                <textarea
                  id="biography" v-model.trim="form.biography" rows="2" class="custom-input"
                  placeholder="Cuéntanos brevemente sobre ti"
                ></textarea>
              </div>
            </div>
          </section>

          <!-- Perfil -->
          <section class="form-section">
            <div class="section-head">
              <span class="section-number">3</span>
              <div>
                <h3>¿Cómo quieres empezar?</h3>
                <p>Puedes elegir los dos. Un productor también puede ser distribuidor, y al revés.</p>
              </div>
            </div>

            <div class="profile-grid" role="group" aria-label="Perfil inicial">
              <div
                v-for="profile in availableProfiles" :key="profile.value"
                class="profile-card" :class="{ selected: profiles.includes(profile.value) }"
                role="checkbox" :aria-checked="profiles.includes(profile.value)" :tabindex="0"
                @click="toggleProfile(profile.value)"
                @keydown.enter.prevent="toggleProfile(profile.value)"
                @keydown.space.prevent="toggleProfile(profile.value)"
              >
                <div class="profile-icon">
                  <component :is="profile.icon" :size="22" />
                </div>
                <div class="profile-body">
                  <h4>{{ profile.label }}</h4>
                  <p>{{ profile.description }}</p>
                  <span class="profile-tag">{{ profile.tag }}</span>
                </div>
                <div class="profile-check">
                  <Check v-if="profiles.includes(profile.value)" :size="14" stroke-width="3" />
                </div>
              </div>
            </div>
            <span class="error-text" v-if="errors.profiles">{{ errors.profiles }}</span>

            <p class="section-note" v-if="isProducer && !isDistributor">
              <Info :size="16" />
              Como productor no pagas membresía: publicas y vendes tus infoproductos sin coste.
            </p>
          </section>

          <!-- Membresía: solo para el perfil de distribuidor -->
          <section class="form-section" v-if="showPlans">
            <div class="section-head">
              <span class="section-number">4</span>
              <div>
                <h3>Elige tu membresía</h3>
                <p>La membresía aplica a tu perfil de distribuidor y define tus comisiones.</p>
              </div>
            </div>

            <div class="plans-grid" role="radiogroup" aria-label="Membresía">
              <MembershipPlanCard
                v-for="plan in visiblePlans" :key="plan.id"
                :plan="plan"
                :selected="form.id_account_type === plan.id"
                :badge="planBadge(plan)"
                @select="selectPlan"
              />
            </div>
            <span class="error-text" v-if="errors.id_account_type">{{ errors.id_account_type }}</span>
          </section>

          <!-- Pago: solo si hay algo que cobrar -->
          <section class="form-section" v-if="totalCost > 0">
            <div class="section-head">
              <span class="section-number">5</span>
              <div>
                <h3>Método de pago</h3>
                <p>Elige cómo quieres pagar tu membresía {{ selectedAccountName }}.</p>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="id_payment_method">Método de pago <span class="req">*</span></label>
                <select
                  id="id_payment_method" v-model="form.id_payment_method" class="custom-input"
                  :class="{ invalid: errors.id_payment_method }"
                >
                  <option value="" disabled>Seleccione...</option>
                  <option v-for="pm in formDataLists.payment_methods" :key="pm.id" :value="pm.id">
                    {{ pm.name }}
                  </option>
                </select>
                <span class="error-text" v-if="errors.id_payment_method">{{ errors.id_payment_method }}</span>
              </div>

              <div class="form-group" v-if="isOfflinePayment">
                <label for="operation_number">Número de operación <span class="req">*</span></label>
                <input
                  id="operation_number" type="text" v-model.trim="form.operation_number"
                  class="custom-input" :class="{ invalid: errors.operation_number }"
                />
                <span class="hint" v-if="!errors.operation_number">El código de la transferencia que ya realizaste.</span>
                <span class="error-text" v-if="errors.operation_number">{{ errors.operation_number }}</span>
              </div>
            </div>
          </section>

          <!-- Resumen y envío -->
          <footer class="form-footer">
            <div class="summary">
              <div class="summary-row">
                <span>Perfil</span>
                <strong>{{ profilesSummary }}</strong>
              </div>
              <div class="summary-row" v-if="isDistributor">
                <span>Membresía</span>
                <strong>{{ selectedAccountName || 'Sin elegir' }}</strong>
              </div>
              <div class="summary-row" v-if="totalCost > 0">
                <span>IVA ({{ accountIvaPercentage.toFixed(2) }}%)</span>
                <strong>${{ accountIva.toFixed(2) }}</strong>
              </div>
              <div class="summary-row total">
                <span>Total a pagar</span>
                <strong>${{ totalCost.toFixed(2) }}</strong>
              </div>
            </div>

            <button type="submit" class="btn-submit" :disabled="submitting">
              <span v-if="submitting" class="loader-spinner"></span>
              <template v-else>
                {{ totalCost > 0 ? 'Continuar al pago' : 'Crear mi cuenta' }}
                <ArrowRight :size="18" />
              </template>
            </button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  ArrowRight, Check, Eye, EyeOff, Info, Megaphone, PenTool, UserCheck, XCircle
} from 'lucide-vue-next';
import MembershipPlanCard from '../components/MembershipPlanCard.vue';
import {
  validateSponsorLink, getFormData, submitRegistration,
  submitMainRegistrationOpenpay, checkAvailability
} from '../services/registrationService';

/**
 * Planes que se ofrecen en el registro público. La tabla `account_type` tiene además
 * filas internas (Consumidor Invitado, Pre registro, Admin...) que el endpoint devuelve
 * por estar activas pero que nadie debería poder elegir aquí.
 */
const PLANES_VISIBLES = ['Start', 'Productor Invitado', 'School', 'Academy', 'University', 'Socio Fundador'];

/**
 * Nombre comercial de cada plan. Hoy no existe ninguna fila llamada «Start» en la base:
 * el único plan gratuito y activo es «Productor Invitado». Cuando el equipo cree la fila
 * definitiva basta con borrar este alias.
 */
const ALIAS_PLANES = { 'Productor Invitado': 'Start' };

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const sponsor = ref(null);
const submitting = ref(false);
const showPassword = ref(false);
const repassword = ref('');
const profiles = ref([]);

const formDataLists = ref({
  user_types: [],
  countries: [],
  document_types: [],
  account_types: [],
  payment_methods: []
});

const form = reactive({
  id_referrer_sponsor: '',
  username: '',
  email: '',
  password: '',
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

const errors = reactive({});

/* Perfiles */

const PERFILES = {
  Producer: {
    value: 'Producer',
    label: 'Productor',
    description: 'Creas y vendes tus propios cursos, libros y masterclasses.',
    tag: 'Sin membresía',
    icon: PenTool
  },
  Distributor: {
    value: 'Distributor',
    label: 'Distribuidor',
    description: 'Promocionas la red, construyes tu equipo y ganas comisiones.',
    tag: 'Requiere membresía',
    icon: Megaphone
  }
};

/**
 * Se cruza con lo que devuelve el backend para no ofrecer un rol que no exista, pero el
 * orden lo manda PERFILES: la API los devuelve por id y ahí Distribuidor va primero.
 */
const availableProfiles = computed(() => {
  const fromApi = (formDataLists.value.user_types || []).map(role => role.name);
  const disponibles = Object.values(PERFILES).filter(profile => fromApi.includes(profile.value));
  return disponibles.length ? disponibles : Object.values(PERFILES);
});

const isProducer = computed(() => profiles.value.includes('Producer'));
const isDistributor = computed(() => profiles.value.includes('Distributor'));

const profilesSummary = computed(() => {
  if (!profiles.value.length) return 'Sin elegir';
  return profiles.value.map(value => PERFILES[value]?.label || value).join(' y ');
});

/**
 * El backend solo acepta un rol (`user_type` se valida como string y se asigna con un
 * único assignRole). Si el usuario elige los dos se manda Distribuidor como principal,
 * porque es el que determina la membresía y el pago; el array completo viaja en
 * `user_types` para cuando la API admita varios.
 */
const primaryProfile = computed(() =>
  profiles.value.includes('Distributor') ? 'Distributor' : (profiles.value[0] || '')
);

/* Planes */

const visiblePlans = computed(() => {
  const plans = (formDataLists.value.account_types || [])
    .filter(plan => PLANES_VISIBLES.includes(plan.account))
    .map(plan => ({ ...plan, account: ALIAS_PLANES[plan.account] || plan.account }));

  return plans.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
});

const freePlan = computed(() => visiblePlans.value.find(plan => parseFloat(plan.price) === 0));

const selectedAccount = computed(() =>
  visiblePlans.value.find(plan => plan.id === form.id_account_type) || null
);

const selectedAccountName = computed(() => selectedAccount.value?.account || '');

const accountPrice = computed(() => parseFloat(selectedAccount.value?.price) || 0);
const accountIvaPercentage = computed(() => parseFloat(selectedAccount.value?.iva) || 0);
const accountIva = computed(() => (accountPrice.value * accountIvaPercentage.value) / 100);
const totalCost = computed(() => accountPrice.value + accountIva.value);

// El backend espera el nombre tal como está en la tabla, no el comercial.
const realAccountName = computed(() => {
  const original = (formDataLists.value.account_types || [])
    .find(plan => plan.id === form.id_account_type);
  return original?.account || '';
});

/**
 * Al productor puro se le asigna el plan gratuito sin preguntarle. Si algún día la tabla
 * deja de tener uno, se le muestran igualmente los planes para que no quede bloqueado:
 * `id_account_type` es obligatorio en la API.
 */
const showPlans = computed(() =>
  isDistributor.value || (profiles.value.length > 0 && !freePlan.value)
);

const planBadge = (plan) => (parseFloat(plan.price) === 0 ? 'Empieza gratis' : '');

const selectPlan = (id) => {
  form.id_account_type = id;
  delete errors.id_account_type;
  if (totalCost.value === 0) {
    form.id_payment_method = '';
    form.operation_number = '';
  }
};

const toggleProfile = (value) => {
  const index = profiles.value.indexOf(value);
  if (index >= 0) profiles.value.splice(index, 1);
  else profiles.value.push(value);

  delete errors.profiles;

  // Un productor puro no elige plan: se le asigna el gratuito.
  if (!isDistributor.value) {
    form.id_account_type = freePlan.value?.id || '';
    form.id_payment_method = '';
    form.operation_number = '';
  } else if (form.id_account_type === freePlan.value?.id) {
    form.id_account_type = '';
  }
};

const isOfflinePayment = computed(() => {
  const method = (formDataLists.value.payment_methods || [])
    .find(pm => pm.id === form.id_payment_method);
  return !!method && method.name.toLowerCase().includes('binance');
});

// Nadie menor de 18 debería registrarse en una red de distribución.
const maxBirthDate = computed(() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split('T')[0];
});

/* Carga inicial */

onMounted(async () => {
  const { id, timestamp } = route.params;

  if (!id || !timestamp) {
    error.value = 'Faltan parámetros en el enlace.';
    loading.value = false;
    return;
  }

  try {
    const linkValidation = await validateSponsorLink(id, timestamp);

    if (linkValidation?.success && linkValidation.data) {
      sponsor.value = linkValidation.data;
      form.id_referrer_sponsor = linkValidation.data.id;

      const data = await getFormData();
      formDataLists.value = data?.success ? data.data : data;
    } else {
      error.value = 'El enlace no es válido o ya expiró.';
    }
  } catch (err) {
    error.value = 'Ocurrió un error al validar el enlace.';
  } finally {
    loading.value = false;
  }
});

/* Validación */

const validateField = async (field, value, documentType = null) => {
  if (!value) {
    delete errors[field];
    return;
  }

  try {
    const payload = { field, value };
    if (documentType) payload.document_type = documentType;

    const res = await checkAvailability(payload);
    if (res?.success && !res.available) {
      const nombres = {
        username: 'Este nombre de usuario',
        email: 'Este correo electrónico',
        nro_document: 'Este número de documento'
      };
      errors[field] = `${nombres[field] || 'Este dato'} ya está en uso.`;
    } else {
      delete errors[field];
    }
  } catch (err) {
    console.error('Error validando el campo', field, err);
  }
};

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key]);

  const requeridos = {
    username: 'Elige un nombre de usuario.',
    email: 'Indica tu correo electrónico.',
    password: 'Elige una contraseña.',
    name: 'Indica tus nombres.',
    last_name: 'Indica tus apellidos.',
    phone: 'Indica tu teléfono.',
    date_birth: 'Indica tu fecha de nacimiento.',
    id_country: 'Selecciona tu país.',
    id_document_type: 'Selecciona el tipo de documento.',
    nro_document: 'Indica tu número de documento.'
  };

  Object.entries(requeridos).forEach(([field, mensaje]) => {
    if (!form[field]) errors[field] = mensaje;
  });

  if (form.username && form.username.length < 3) {
    errors.username = 'El usuario debe tener al menos 3 caracteres.';
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'El correo no tiene un formato válido.';
  }
  if (form.password && form.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (form.password && form.password !== repassword.value) {
    errors.repassword = 'Las contraseñas no coinciden.';
  }
  if (!profiles.value.length) {
    errors.profiles = 'Elige al menos un perfil para continuar.';
  }
  if (showPlans.value && !form.id_account_type) {
    errors.id_account_type = 'Elige una membresía para continuar.';
  }
  if (totalCost.value > 0 && !form.id_payment_method) {
    errors.id_payment_method = 'Selecciona un método de pago.';
  }
  if (totalCost.value > 0 && isOfflinePayment.value && !form.operation_number) {
    errors.operation_number = 'Indica el número de operación.';
  }

  return Object.keys(errors).length === 0;
};

const scrollToFirstError = () => {
  const field = Object.keys(errors)[0];
  const element = document.getElementById(field);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.focus({ preventScroll: true });
  } else {
    document.querySelector('.error-text')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

/* Envío */

const submitForm = async () => {
  if (!validateForm()) {
    ElMessage.warning('Revisa los campos marcados en rojo.');
    scrollToFirstError();
    return;
  }

  // Un productor sin perfil de distribuidor entra con el plan gratuito.
  if (!isDistributor.value && freePlan.value) {
    form.id_account_type = freePlan.value.id;
  }

  if (totalCost.value === 0) {
    form.id_payment_method = 1;
    form.operation_number = '0';
  }

  form.amount = totalCost.value;
  submitting.value = true;

  try {
    // Openpay se cobra con su propia pasarela: devuelve una URL a la que hay que redirigir.
    if (totalCost.value > 0 && form.id_payment_method === 1) {
      const response = await submitMainRegistrationOpenpay({
        usuario: form.username,
        correo: form.email,
        password: form.password,
        password_confirm: repassword.value,
        tipo_usuario: primaryProfile.value,
        tipos_usuario: profiles.value,
        nombre: form.name,
        apellido: form.last_name,
        telefono: form.phone,
        fecha_nacimiento: form.date_birth,
        tipo_documento: formDataLists.value.document_types.find(d => d.id === form.id_document_type)?.document || '',
        numero_documento: form.nro_document,
        pais: formDataLists.value.countries.find(c => c.id === form.id_country)?.name || '',
        tipo_cuenta: realAccountName.value,
        metodo_pago: formDataLists.value.payment_methods.find(p => p.id === form.id_payment_method)?.name || 'openpay',
        referidor: sponsor.value.username,
        lado: 'izquierda'
      });

      if (response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        ElMessage.error('No se pudo generar el enlace de pago seguro de Openpay.');
      }
      return;
    }

    const payload = {
      ...form,
      user_type: primaryProfile.value,
      user_types: profiles.value
    };

    // Laravel convierte los strings vacíos en null (ConvertEmptyStringsToNull) y el
    // constructor de RegistrationUser exige un string, así que una biografía vacía
    // tumba el registro con un TypeError. Se omite el campo para que el backend use
    // su valor por defecto.
    if (!payload.biography) delete payload.biography;

    await submitRegistration(payload);

    ElMessage.success('¡Registro exitoso! Te llevamos al inicio de sesión.');
    router.push('/login');
  } catch (err) {
    const validationErrors = err.response?.data?.errors;
    if (validationErrors) {
      ElMessage.error(Object.values(validationErrors)[0][0]);
    } else {
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      ElMessage.error(backendMessage || 'Ocurrió un error al registrarte. Revisa los datos.');
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.registro-public-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b0f19;
  position: relative;
  overflow: hidden;
  color: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
  padding: 40px 20px;
}

/* Halos de color de fondo */
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
  max-width: 920px;
  z-index: 1;
  position: relative;
}

/* Estados de carga y error */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  z-index: 1;
  color: #cbd5e1;
}
.error-state h2 {
  margin: 0;
  font-size: 24px;
  color: #ffffff;
}
.error-icon {
  color: #ef4444;
}
.back-link {
  margin-top: 8px;
  padding: 12px 26px;
  border-radius: 12px;
  background: rgba(24, 214, 0, 0.15);
  border: 1px solid rgba(24, 214, 0, 0.4);
  color: #4ade80;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s ease;
}
.back-link:hover {
  background: rgba(24, 214, 0, 0.25);
}

/* Cabecera del patrocinador */
.sponsor-banner {
  background: linear-gradient(90deg, rgba(24, 214, 0, 0.15) 0%, rgba(24, 214, 0, 0.05) 100%);
  border: 1px solid rgba(24, 214, 0, 0.3);
  padding: 16px 24px;
  border-radius: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #e2e8f0;
  font-size: 15px;
  box-shadow: 0 4px 20px rgba(24, 214, 0, 0.1);
}
.sponsor-banner svg {
  color: #4ade80;
  flex-shrink: 0;
}
.sponsor-banner strong {
  color: #22c55e;
  font-size: 17px;
  font-weight: 700;
}

/* Tarjeta de cristal */
.form-card {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 44px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.card-head {
  margin-bottom: 12px;
}
.card-head h2 {
  margin: 0 0 8px 0;
  color: #ffffff;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.subtitle {
  color: #94a3b8;
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
}

/* Secciones */
.form-section {
  padding: 30px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
.form-section:last-of-type {
  border-bottom: none;
}

.section-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 22px;
}
.section-number {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(24, 214, 0, 0.15);
  border: 1px solid rgba(24, 214, 0, 0.4);
  color: #4ade80;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.section-head h3 {
  margin: 0 0 3px 0;
  font-size: 18px;
  font-weight: 700;
  color: #f1f5f9;
}
.section-head p {
  margin: 0;
  font-size: 14px;
  color: #94a3b8;
}

.section-note {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 0 0;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: #bfdbfe;
  font-size: 13.5px;
}
.section-note svg {
  flex-shrink: 0;
  color: #60a5fa;
}

/* Campos */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-group.full {
  grid-column: 1 / -1;
}
.form-group label {
  font-size: 13.5px;
  font-weight: 600;
  color: #cbd5e1;
}
.req {
  color: #4ade80;
}
.optional {
  color: #64748b;
  font-weight: 400;
}

.custom-input {
  width: 100%;
  padding: 13px 16px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  font-size: 14.5px;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.custom-input::placeholder {
  color: #64748b;
}
.custom-input:focus {
  outline: none;
  border-color: #18d600;
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.15);
}
.custom-input.invalid {
  border-color: #ef4444;
}
.custom-input:disabled {
  opacity: 0.6;
}
select.custom-input option {
  background: #0f172a;
  color: #f8fafc;
}
textarea.custom-input {
  resize: vertical;
  min-height: 62px;
}

.input-with-action {
  position: relative;
  display: flex;
}
.input-with-action .custom-input {
  padding-right: 46px;
}
.input-action {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}
.input-action:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.07);
}

.hint {
  font-size: 12.5px;
  color: #64748b;
}
.error-text {
  font-size: 12.5px;
  color: #f87171;
  font-weight: 500;
}

/* Perfiles */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.profile-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
}
.profile-card:hover {
  transform: translateY(-3px);
  border-color: rgba(24, 214, 0, 0.45);
}
.profile-card:focus-visible {
  outline: 2px solid #18d600;
  outline-offset: 3px;
}
.profile-card.selected {
  background: linear-gradient(150deg, rgba(24, 214, 0, 0.18) 0%, rgba(6, 78, 59, 0.45) 100%);
  border-color: #18d600;
  box-shadow: 0 16px 32px -14px rgba(24, 214, 0, 0.45);
}
.profile-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: rgba(24, 214, 0, 0.15);
  color: #4ade80;
  flex-shrink: 0;
}
.profile-body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-right: 26px;
}
.profile-body h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
}
.profile-body p {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: #94a3b8;
}
.profile-tag {
  align-self: flex-start;
  margin-top: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  font-size: 11.5px;
  font-weight: 600;
}
.profile-check {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.25);
  display: grid;
  place-items: center;
  color: #052e16;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.profile-card.selected .profile-check {
  background: #18d600;
  border-color: #18d600;
}

/* Planes */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(196px, 1fr));
  gap: 16px;
}

/* Resumen y envío */
.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 30px;
  padding: 24px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 240px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 28px;
  font-size: 14px;
  color: #94a3b8;
}
.summary-row strong {
  color: #e2e8f0;
  font-weight: 600;
}
.summary-row.total {
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 15px;
}
.summary-row.total strong {
  color: #4ade80;
  font-size: 19px;
  font-weight: 800;
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 220px;
  padding: 15px 30px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #18d600 0%, #119e00 100%);
  color: #052e16;
  font-size: 15.5px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  box-shadow: 0 14px 28px -12px rgba(24, 214, 0, 0.7);
}
.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px -12px rgba(24, 214, 0, 0.8);
}
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.loader-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.25);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loader-spinner.primary {
  width: 42px;
  height: 42px;
  border-width: 3px;
  border-top-color: #18d600;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 720px) {
  .form-card { padding: 28px 20px; }
  .card-head h2 { font-size: 24px; }
  .form-grid,
  .profile-grid { grid-template-columns: 1fr; }
  .form-footer { flex-direction: column; align-items: stretch; }
  .btn-submit { width: 100%; }
}
</style>
