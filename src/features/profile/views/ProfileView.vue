<template>
  <div class="profile-page">
    <h1 class="page-title">Ajustes de Perfil</h1>
    
    <div class="profile-layout">
      <!-- Left Column: User Details -->
      <div class="profile-sidebar">
        <div class="profile-card text-center">
          <div class="avatar-container">
            <img v-if="user.photo" :src="getAvatarUrl(user.photo)" alt="Avatar" class="avatar-image" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="avatar-fallback" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 class="user-name">{{ user.name }} {{ user.last_name }}</h2>
          
          <div class="roles-container">
            <span v-for="role in roles" :key="role" class="role-badge">
              {{ role }}
            </span>
          </div>

          <div class="details-section">
            <h3 class="details-title">Detalles</h3>
            <div class="details-list">
              <div class="detail-item">
                <span class="detail-label">Usuario:</span>
                <span class="detail-value">{{ user.username }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Correo:</span>
                <span class="detail-value">{{ user.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Estado:</span>
                <span class="detail-value text-green">Activo</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Rol:</span>
                <span class="detail-value">{{ roles.join(', ') || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Numero de documento:</span>
                <span class="detail-value">{{ user.nro_document || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Contacto:</span>
                <span class="detail-value">{{ user.phone || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">País:</span>
                <span class="detail-value">{{ getCountryName(user.id_country) || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Creación:</span>
                <span class="detail-value">{{ formatDate(user.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Tabs and Forms -->
      <div class="profile-content">
        <!-- Tabs -->
        <div class="tabs-header">
          <button @click="activeTab = 'cuenta'" class="tab-btn" :class="{ active: activeTab === 'cuenta' }">
            <User :size="18" /> Cuenta
          </button>
          <button @click="activeTab = 'seguridad'" class="tab-btn" :class="{ active: activeTab === 'seguridad' }">
            <Lock :size="18" /> Seguridad
          </button>
          <button @click="activeTab = 'membresias'" class="tab-btn" :class="{ active: activeTab === 'membresias' }">
            <Bookmark :size="18" /> Membresias
          </button>
        </div>

        <!-- Transiciones Suaves (Framer Motion style) -->
        <transition name="fade-slide" mode="out-in">
          
          <!-- Tab Content: Cuenta -->
          <div v-if="activeTab === 'cuenta'" key="cuenta" class="tab-content account-tab">
            <div class="tab-top-border"></div>
            <h3 class="form-title">Editar Perfil</h3>
            
            <form @submit.prevent="saveProfile" class="profile-form">
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre:</label>
                  <input type="text" v-model="formData.name" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Apellido:</label>
                  <input type="text" v-model="formData.last_name" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Correo:</label>
                  <input type="email" v-model="formData.email" class="form-control" />
                </div>
                <div class="form-group">
                  <label>N° Celular:</label>
                  <input type="text" v-model="formData.phone" class="form-control" />
                </div>
              </div>

              <div class="form-group full-width">
                <label>Biografia:</label>
                <textarea v-model="formData.biography" rows="4" class="form-control"></textarea>
              </div>

              <div class="form-grid-3">
                <div class="form-group">
                  <label>Día de cumpleaños:</label>
                  <input type="date" v-model="formData.date_birth" class="form-control" />
                </div>
                <div class="form-group">
                  <label>País:</label>
                  <select v-model="formData.id_country" class="form-control">
                    <option value="" disabled>Seleccione un país</option>
                    <option v-for="country in countries" :key="country.id" :value="country.id">
                      {{ country.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Ciudad:</label>
                  <input type="text" v-model="formData.city" class="form-control" />
                </div>
              </div>

              <div class="form-actions">
                <CustomAlert :message="profileAlert.message" :type="profileAlert.type" />
                <button type="submit" class="btn-save">Guardar Cambios</button>
              </div>
            </form>
          </div>

          <!-- Tab Content: Seguridad -->
          <div v-else-if="activeTab === 'seguridad'" key="seguridad" class="tab-content">
            <div class="tab-top-border"></div>
            <h3 class="form-title">Cambiar Contraseña</h3>
            
            <CustomAlert :message="securityAlert.message" :type="securityAlert.type" />
            
            <form @submit.prevent="changePassword" class="profile-form">
              <div class="form-grid">
                <div class="form-group relative">
                  <label>Nueva Contraseña</label>
                  <div class="input-with-icon">
                    <input :type="showPassword ? 'text' : 'password'" v-model="securityData.password" class="form-control" />
                    <button type="button" class="icon-btn" @click="showPassword = !showPassword">
                      <EyeOff v-if="showPassword" :size="16" />
                      <Eye v-else :size="16" />
                    </button>
                  </div>
                </div>
                <div class="form-group relative">
                  <label>Confirmar Nueva Contraseña</label>
                  <div class="input-with-icon">
                    <input :type="showConfirmPassword ? 'text' : 'password'" v-model="securityData.password_confirmation" class="form-control" />
                    <button type="button" class="icon-btn" @click="showConfirmPassword = !showConfirmPassword">
                      <EyeOff v-if="showConfirmPassword" :size="16" />
                      <Eye v-else :size="16" />
                    </button>
                  </div>
                </div>
              </div>
              
              <p class="text-muted" style="font-size: 13px; margin-top: 8px;">Mínimo 8 caracteres de largo, mayúsculas y símbolos</p>

              <div class="form-actions">
                <button type="submit" class="btn-save" style="margin-top: 8px;">Cambiar Contraseña</button>
              </div>
            </form>
          </div>

          <!-- Tab Content: Membresias -->
          <div v-else-if="activeTab === 'membresias'" key="membresias" class="tab-content membership-tab">
            <div class="tab-top-border"></div>
            
            <VipMembershipCard :membership="activeMembership" :user="user" />
            
            <div class="membership-progress-container">
              <div class="progress-labels">
                <span>Días</span>
                <span>Expirado</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: 100%;"></div>
              </div>
              <p class="text-muted" style="font-size: 13px; margin-top: 8px;">Su membresía ha expirado</p>
            </div>
            
            <div class="membership-actions">
              <AnimatedButton>Plan de actualización</AnimatedButton>
              <AnimatedButton>Historial de membresía</AnimatedButton>
            </div>
            
            <div class="all-memberships-section">
              <div class="am-header-row">
                <h4 class="form-title" style="margin: 0;">Ver Todas las Membresías</h4>
                
                <!-- Tooltip Custom (Pure CSS) -->
                <div class="custom-tooltip-wrapper">
                  <button class="custom-tooltip-btn">
                    <div class="custom-tooltip-btn-bg"></div>
                    <span class="custom-tooltip-btn-text">
                      <Info :size="16" style="margin-right: 6px;" />
                      Glosario de Beneficios
                    </span>
                  </button>

                  <div class="custom-tooltip-content">
                    <div class="custom-tooltip-card">
                      <div class="custom-tooltip-header">
                        <div class="custom-tooltip-icon-container">
                          <Info :size="20" color="#4ade80" />
                        </div>
                        <h3 class="custom-tooltip-title">¿Qué significa cada uno?</h3>
                      </div>

                      <div class="custom-tooltip-body">
                        <ul class="custom-tooltip-list">
                          <li><strong style="color: #4ade80;">IVA:</strong> Impuesto aplicado en transacciones.</li>
                          <li><strong style="color: #4ade80;">Descuento Cursos:</strong> Ahorro al comprar cursos para ti.</li>
                          <li><strong style="color: #4ade80;">Corte Binario:</strong> Comisión sobre el volumen de tu pierna menor.</li>
                          <li><strong style="color: #4ade80;">Bono Efectivo Rápido:</strong> Comisión por invitar a comprar membresía.</li>
                          <li><strong style="color: #4ade80;">Comisión Directa:</strong> Ganancia sobre compras de referidos.</li>
                          <li><strong style="color: #4ade80;">Venta Cursos:</strong> Comisión asignada si tus invitados compran cursos.</li>
                          <li><strong style="color: #4ade80;">Bono Productor:</strong> Ganancia por venta de tus propios cursos subidos.</li>
                        </ul>
                      </div>

                      <div class="custom-tooltip-glow"></div>
                      <div class="custom-tooltip-arrow"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="memberships-grid">
                <div v-for="plan in availableMemberships" :key="plan.id" class="membership-card">
                  <div class="mc-header">
                    <h5>{{ plan.account }}</h5>
                    <div class="mc-price">
                      <span class="mc-currency">$</span>{{ plan.price }}
                    </div>
                  </div>
                  <ul class="mc-features">
                    <li><CheckCircle2 :size="16" class="text-primary-color" /> IVA: {{ plan.iva }}%</li>
                    <li><CheckCircle2 :size="16" class="text-primary-color" /> Descuento Cursos: {{ plan.disc_purchases_course }}%</li>
                    <li><CheckCircle2 :size="16" class="text-primary-color" /> Corte Binario: {{ plan.pay_in_binary }}%</li>
                    <li><CheckCircle2 :size="16" class="text-primary-color" /> Bono Efectivo Rápido: {{ plan.fast_cash_bonus }}%</li>
                    <li><CheckCircle2 :size="16" class="text-primary-color" /> Comisión Directa: {{ plan.comission }}%</li>
                    <li v-if="plan.course_selling_bonus"><CheckCircle2 :size="16" class="text-primary-color" /> Venta Cursos: {{ plan.course_selling_bonus }}%</li>
                    <li v-if="plan.productor_bonus"><CheckCircle2 :size="16" class="text-primary-color" /> Bono Productor: {{ plan.productor_bonus }}%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/features/auth/stores/authStore';
import api from '@/services/apiClient';
import { User, Lock, Bookmark, Info, CheckCircle2, Eye, EyeOff } from 'lucide-vue-next';
import VipMembershipCard from '@/components/VipMembershipCard.vue';
import AnimatedButton from '@/components/AnimatedButton.vue';
import CustomAlert from '@/components/CustomAlert.vue';

const authStore = useAuthStore();
const activeTab = ref('cuenta');

const user = computed(() => authStore.user || {});
const roles = computed(() => authStore.userRoles || []);

const formData = ref({
  name: '',
  last_name: '',
  email: '',
  phone: '',
  biography: '',
  date_birth: '',
  id_country: '',
  city: ''
});

const securityData = ref({
  password: '',
  password_confirmation: ''
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showHelpInfo = ref(false);
const countries = ref([]);
const availableMemberships = ref([]);

const securityAlert = ref({ message: '', type: 'error' });
const profileAlert = ref({ message: '', type: 'error' });

const showSecurityAlert = (msg, type = 'error') => {
  securityAlert.value = { message: msg, type };
  setTimeout(() => { securityAlert.value.message = ''; }, 6000);
};

const showProfileAlert = (msg, type = 'error') => {
  profileAlert.value = { message: msg, type };
  setTimeout(() => { profileAlert.value.message = ''; }, 6000);
};

const activeMembership = computed(() => {
  if (!availableMemberships.value.length || !user.value) return null;
  return availableMemberships.value.find(m => m.id === user.value.id_account_type) || null;
});

const loadCountries = async () => {
  try {
    const res = await api.get('/countries');
    countries.value = res.data;
  } catch (error) {
    console.error("Error cargando países:", error);
  }
};

const loadMemberships = async () => {
  try {
    const res = await api.get('/memberships');
    availableMemberships.value = res.data;
  } catch (error) {
    console.error("Error cargando membresías:", error);
  }
};

const getCountryName = (id) => {
  if (!id) return '';
  const c = countries.value.find(c => c.id == id);
  return c ? c.name : id;
};

onMounted(async () => {
  await loadCountries();
  await loadMemberships();
  if (user.value) {
    formData.value = {
      name: user.value.name || '',
      last_name: user.value.last_name || '',
      email: user.value.email || '',
      phone: user.value.phone || '',
      biography: user.value.biography || '',
      date_birth: user.value.date_birth || '',
      id_country: user.value.id_country || '',
      city: user.value.city || ''
    };
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const getAvatarUrl = (photoPath) => {
  if (!photoPath) return '';
  if (photoPath.startsWith('http')) return photoPath;
  return `https://promolider-storage-user.s3.sa-east-1.amazonaws.com/${photoPath}`;
};

const saveProfile = async () => {
  profileAlert.value.message = '';
  try {
    const response = await api.put('/profile/update', formData.value);
    showProfileAlert('Perfil actualizado exitosamente', 'success');
    if (response.data && response.data.user) {
      authStore.user = response.data.user;
    }
  } catch (error) {
    console.error(error);
    showProfileAlert('Error al actualizar el perfil', 'error');
  }
};

const changePassword = async () => {
  securityAlert.value.message = '';
  try {
    await api.put('/profile/password', securityData.value);
    showSecurityAlert('Contraseña actualizada exitosamente', 'success');
    securityData.value.password = '';
    securityData.value.password_confirmation = '';
  } catch (error) {
    console.error(error);
    if (error.response && error.response.data && error.response.data.errors) {
      const firstError = Object.values(error.response.data.errors)[0][0];
      showSecurityAlert(firstError, 'error');
    } else if (error.response && error.response.data && error.response.data.message) {
      showSecurityAlert(error.response.data.message, 'error');
    } else {
      showSecurityAlert('Error al actualizar contraseña. Verifica los datos.', 'error');
    }
  }
};
</script>

<style scoped>
.profile-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-bold);
  margin-bottom: 24px;
}
.profile-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 992px) {
  .profile-layout {
    flex-direction: row;
  }
}
.profile-sidebar {
  width: 100%;
}
@media (min-width: 992px) {
  .profile-sidebar {
    width: 33.333%;
  }
}
.profile-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
}
.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--node-bg);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: white;
}
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  width: 64px;
  height: 64px;
}
.user-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-bold);
  margin-bottom: 8px;
}
.roles-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.role-badge {
  background-color: var(--border-color);
  color: var(--text-main);
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 9999px;
}
.details-section {
  width: 100%;
  margin-top: 24px;
  text-align: left;
}
.details-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 16px;
}
.details-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
}
.detail-item {
  display: flex;
  flex-direction: column;
}
.detail-label {
  color: var(--text-muted);
  font-weight: 600;
}
.detail-value {
  color: var(--text-bold);
}
.text-green {
  color: var(--primary-color);
  font-weight: bold;
}
.profile-content {
  width: 100%;
}
@media (min-width: 992px) {
  .profile-content {
    width: 66.666%;
  }
}
.tabs-header {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.tab-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--text-muted);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
}
.tab-btn.active {
  background: var(--primary-color);
  color: white;
}
.tab-content {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}
.tab-top-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--primary-color);
}
.form-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-bold);
  margin-bottom: 24px;
}
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.form-grid-3 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .form-grid-3 {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.form-control {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: transparent;
  color: var(--text-main);
  transition: border-color 0.2s;
  box-sizing: border-box;
  width: 100%;
}
.form-control:focus {
  border-color: var(--primary-color);
}
.form-control option {
  background: var(--bg-main);
  color: var(--text-main);
}
.btn-save {
  background: var(--primary-color);
  color: white;
  font-weight: 500;
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 16px;
}
.btn-save:hover {
  background: var(--primary-hover);
}
.text-muted {
  color: var(--text-muted);
}
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}
.input-with-icon .form-control {
  padding-right: 40px;
}
.icon-btn {
  position: absolute;
  right: 8px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.icon-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
}
.membership-tab {
  padding: 32px;
}
/* Tarjeta Premium Flip 3D */
.cmc-flip-card-wrapper {
  perspective: 1500px;
  width: 100%;
  max-width: 640px;
  height: 400px;
  margin: 0 auto 40px auto;
}

.cmc-flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: left;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  cursor: pointer;
}

.cmc-flip-card-wrapper:hover .cmc-flip-card-inner {
  transform: rotateY(180deg);
}

.cmc-flip-card-front, .cmc-flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 16px;
  box-shadow: 0 20px 40px -10px rgba(34, 197, 94, 0.4);
  overflow: hidden;
}

.cmc-flip-card-front {
  background: linear-gradient(135deg, #22c55e 0%, #064e3b 100%);
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  z-index: 2;
  transform: rotateY(0deg);
}

.cmc-flip-card-front::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%);
  pointer-events: none;
}

.vip-card-bg-circle {
  position: absolute;
  width: 250px; height: 250px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  top: -80px; right: -40px;
}

.vip-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.vip-logo-img {
  height: 32px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.vip-chip {
  width: 52px;
  height: 38px;
  background: linear-gradient(135deg, #fde047 0%, #ca8a04 100%);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}
.vip-chip::after {
  content: '';
  position: absolute;
  top: 50%; left: 0; right: 0;
  height: 1px;
  background: rgba(0,0,0,0.2);
}

.vip-card-middle {
  position: relative;
  z-index: 2;
}

.vip-tier-name {
  font-size: 38px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 16px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.vip-card-bottom {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.vip-info-group {
  display: flex;
  flex-direction: column;
}
.vip-info-label {
  font-size: 13px;
  text-transform: uppercase;
  opacity: 0.8;
  letter-spacing: 1px;
}
.vip-info-value {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* BACK STYLES */
.cmc-flip-card-back {
  background: linear-gradient(135deg, #22c55e 0%, #064e3b 100%);
  transform: rotateY(180deg);
  border: 1px solid rgba(255,255,255,0.1);
  z-index: 1;
}

.vip-card-strip {
  width: 100%;
  height: 60px;
  background: rgba(0,0,0,0.8);
  margin-top: 32px;
}

.vip-card-back-content {
  padding: 24px 32px;
}

.vip-back-title {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px 0;
}

.vip-back-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.vip-back-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vip-back-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.vip-back-text {
  display: flex;
  flex-direction: column;
}
.vip-back-label {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
  text-transform: uppercase;
  line-height: 1.2;
}
.vip-back-value {
  font-size: 16px;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.vip-logo-back {
  position: absolute;
  bottom: 32px;
  right: 32px;
  height: 28px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: 0.5;
}

.bg-blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.bg-purple { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
.bg-green { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
.bg-orange { background: rgba(249, 115, 22, 0.2); color: #fb923c; }
.bg-pink { background: rgba(236, 72, 153, 0.2); color: #f472b6; }
.bg-yellow { background: rgba(234, 179, 8, 0.2); color: #facc15; }
.membership-progress-container {
  margin-bottom: 24px;
}
.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.progress-bar-bg {
  width: 100%;
  height: 8px;
  background-color: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 4px;
}
.membership-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.all-memberships-section {
  border-top: 1px solid var(--border-color);
  padding-top: 24px;
}

.am-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.memberships-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .memberships-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

.membership-card {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.membership-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.mc-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  margin-bottom: 16px;
  text-align: center;
}

.mc-header h5 {
  font-size: 18px;
  color: var(--text-bold);
  margin-bottom: 8px;
  margin-top: 0;
}

.mc-price {
  font-size: 28px;
  font-weight: bold;
  color: var(--primary-color);
}

.mc-currency {
  font-size: 16px;
  vertical-align: top;
  margin-right: 2px;
}

.mc-features {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 13px;
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mc-features li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mc-features li .text-primary-color {
  color: var(--primary-color);
}

/* Animaciones de Transición (fade-slide) */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Tooltip Custom Classes (Reemplazo de Tailwind) */
.custom-tooltip-wrapper {
  position: relative;
  display: inline-block;
  z-index: 50;
}

.custom-tooltip-btn {
  position: relative;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background-color: rgba(34, 197, 94, 0.9);
  border-radius: 12px;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.custom-tooltip-btn:hover {
  background-color: rgba(22, 163, 74, 0.9);
}

.custom-tooltip-btn-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, rgba(74, 222, 128, 0.2), rgba(16, 185, 129, 0.2));
  filter: blur(12px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.custom-tooltip-wrapper:hover .custom-tooltip-btn-bg {
  opacity: 0.75;
}

.custom-tooltip-btn-text {
  position: relative;
  display: flex;
  align-items: center;
}

.custom-tooltip-content {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 12px;
  width: 320px;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-8px);
  transition: all 0.3s ease-out;
  z-index: 50;
}

.custom-tooltip-wrapper:hover .custom-tooltip-content {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

.custom-tooltip-card {
  position: relative;
  padding: 20px;
  background: linear-gradient(to bottom right, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.15);
  text-align: left;
}

.custom-tooltip-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.custom-tooltip-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(34, 197, 94, 0.2);
}

.custom-tooltip-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.custom-tooltip-body {
  margin-top: 8px;
}

.custom-tooltip-list {
  font-size: 12px;
  color: #d1d5db;
  list-style-type: disc;
  padding-left: 16px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.custom-tooltip-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  background: linear-gradient(to right, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1));
  filter: blur(16px);
  opacity: 0.5;
  pointer-events: none;
}

.custom-tooltip-arrow {
  position: absolute;
  top: -6px;
  right: 48px;
  width: 12px;
  height: 12px;
  background: linear-gradient(to bottom right, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
  transform: rotate(45deg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

/* --- Custom Alert --- */
.custom-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  animation: slideInDown 0.3s ease-out forwards;
}

@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-alert.error {
  background-color: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
}

.custom-alert.error .alert-icon {
  color: #ef4444;
}

.custom-alert.error .alert-title {
  color: #ef4444;
}

.custom-alert.success {
  background-color: rgba(74, 222, 128, 0.1);
  border-left: 4px solid #4ade80;
}

.custom-alert.success .alert-icon {
  color: #4ade80;
}

.custom-alert.success .alert-title {
  color: #4ade80;
}

.alert-content {
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 4px;
}

.alert-desc {
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.4;
}
</style>