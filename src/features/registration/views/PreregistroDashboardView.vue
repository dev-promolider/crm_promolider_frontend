<template>
  <div class="dashboard-page preregistro-page">
    
    <div class="page-header" style="margin-bottom: 25px;">
      <h2 class="page-title" style="font-size: 24px; font-weight: 700; color: var(--text-bold); margin-bottom: 5px;">Panel de Preregistro</h2>
      <p style="color: var(--text-muted); font-size: 14px; margin: 0;">Configura tu enlace de invitación y administra a tus preregistrados.</p>
    </div>

    <!-- PANELES DE CONTROL -->
    <div class="widgets-grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 25px;">
      
      <!-- Ajuste de pierna -->
      <div class="card">
        <div class="card-header" style="margin-bottom: 15px;">
          <h3 class="card-title">Ajuste de pierna</h3>
          <span class="card-meta">Elige en qué lado de tu binario caerán</span>
        </div>
        
        <div class="btn-group-custom">
          <button 
            class="toggle-btn" 
            :class="{ active: config.lado === 'izquierda' }"
            :disabled="isLoading"
            @click="setLado('izquierda')"
          >
            Izquierda
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: config.lado === 'derecha' }"
            :disabled="isLoading"
            @click="setLado('derecha')"
          >
            Derecha
          </button>
        </div>
      </div>

      <!-- Guardar Config / Generar Link -->
      <div class="card" style="display: flex; flex-direction: column; justify-content: center;">
        <div class="card-header" style="margin-bottom: 15px;">
          <h3 class="card-title">Aplicar Cambios</h3>
          <span class="card-meta">Guarda tu configuración</span>
        </div>
        <button 
          class="primary-btn"
          @click="saveConfig"
          :disabled="isSaving"
        >
          <span v-if="isSaving" class="loader-spinner"></span>
          <span v-else style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            Guardar y Generar Enlace
          </span>
        </button>
      </div>

    </div>

    <!-- ENLACE GENERADO -->
    <div class="card" style="margin-bottom: 25px;">
      <div class="card-header" style="margin-bottom: 15px;">
        <h3 class="card-title" style="color: var(--primary-color);">Tu enlace de invitación (Preregistro)</h3>
        <span class="card-meta">Cópialo y compártelo con tus prospectos</span>
      </div>
      
      <div class="link-input-group">
        <input type="text" class="custom-input" :value="shareLink" readonly ref="linkInput" />
        <button class="outline-btn" @click="copyLink">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copiar
        </button>
        <button class="primary-btn" style="width: auto; padding: 10px 20px;" @click="openLink(shareLink)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          Abrir
        </button>
      </div>
    </div>

    <!-- GALERÍA DE LANDINGS -->
    <div class="card" style="margin-bottom: 25px;">
      <div class="card-header">
        <div>
          <h3 class="card-title">Selecciona el tipo de landing</h3>
          <span class="card-meta">Elige el diseño que verán tus referidos al abrir tu enlace</span>
        </div>
      </div>
      
      <div class="landings-grid">
        <div v-for="landing in landings" :key="landing.tema" 
             class="landing-card" 
             :class="{ 'active': config.landing === landing.tema }"
             @click="setLanding(landing.tema)">
             
          <div class="landing-thumb-wrap">
            <iframe
              :src="`${getBaseUrl()}/preregistro/${user?.username || 'demo'}?lado=${config.lado}&tema=${landing.tema}`"
              class="landing-thumb-iframe"
              scrolling="no"
              tabindex="-1"
            ></iframe>
          </div>
          
          <h4 style="color: var(--text-bold); margin: 15px 0 5px 0;">{{ landing.nombre }}</h4>
          <p style="color: var(--text-muted); font-size: 13px; text-align: center; margin-bottom: 20px;">
            {{ landing.descripcion }}
          </p>
          
          <div style="display: flex; gap: 8px; width: 100%; margin-top: auto;">
            <button class="outline-btn" style="flex: 1; padding: 6px; justify-content: center; font-size: 13px;" @click.stop="openPreview(landing.tema)">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Ver
            </button>
            <button class="primary-btn" style="flex: 2; padding: 6px; font-size: 13px; background-color: var(--primary-color) !important;" @click.stop="setLanding(landing.tema)">
              {{ config.landing === landing.tema ? 'Seleccionado' : 'Elegir' }}
            </button>
          </div>
          
          <div v-if="config.landing === landing.tema" class="check-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLA DE PREREGISTROS PENDIENTES -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">Mis Preregistros</h3>
          <span class="card-meta">Usuarios registrados que aún no han completado el pago</span>
        </div>
        <button class="icon-text-btn" @click="loadReferrals" :disabled="isLoadingReferrals">
          <svg :class="{'spin': isLoadingReferrals}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          <span>Actualizar</span>
        </button>
      </div>
      
      <div v-if="isLoadingReferrals" class="empty-state">
        <div class="loader-spinner primary"></div>
        <p>Cargando preregistros...</p>
      </div>
      
      <div v-else-if="referrals.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-light); margin-bottom: 15px; opacity: 0.5;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <h4 style="color: var(--text-bold); margin-bottom: 5px;">No tienes preregistros pendientes</h4>
        <p style="color: var(--text-muted); font-size: 14px;">Comparte tu enlace de invitación para empezar a registrar usuarios.</p>
      </div>

      <div v-else class="custom-table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Contacto</th>
              <th>Pierna</th>
              <th>Fecha de Registro</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ref in referrals" :key="ref.id">
              <td>
                <div class="user-cell">
                  <div class="avatar-initials">
                    {{ getInitials(ref.nombre) }}
                  </div>
                  <span class="user-name">{{ ref.nombre }}</span>
                </div>
              </td>
              <td>
                <div class="contact-cell">
                  <a v-if="ref.correo" :href="`mailto:${ref.correo}`" class="contact-link mail">
                    {{ ref.correo }}
                  </a>
                  <a v-if="ref.whatsapp" :href="`https://wa.me/${ref.whatsapp.replace(/\D/g,'')}`" target="_blank" class="contact-link whatsapp">
                    {{ ref.whatsapp }}
                  </a>
                </div>
              </td>
              <td>
                <span class="badge" :class="ref.lado === 'izquierda' ? 'badge-green' : (ref.lado === 'derecha' ? 'badge-blue' : 'badge-gray')">
                  {{ ref.lado ? ref.lado.charAt(0).toUpperCase() + ref.lado.slice(1) : '—' }}
                </span>
              </td>
              <td style="color: var(--text-muted); font-size: 13px;">
                {{ formatDate(ref.fecha_registro) }}
              </td>
              <td>
                <span class="badge" :class="ref.pago_estado === 'pendiente' ? 'badge-orange' : 'badge-gray'">
                  {{ ref.pago_estado === 'pendiente' ? 'Pago Pendiente' : 'Sin Pago' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL PREVIEW LANDING -->
    <Teleport to="body">
      <div v-if="mostrarPreviewModal" class="preview-overlay" @click.self="cerrarPreviewLanding">
        <div class="preview-container">
          <div class="preview-header">
            <span style="font-weight: 600; color: var(--text-bold);">Vista previa — Landing <strong style="text-transform: capitalize; color: var(--primary-color);">{{ tipoPreviewActual }}</strong></span>
            <button class="icon-text-btn" @click="cerrarPreviewLanding">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Cerrar
            </button>
          </div>
          <iframe :src="previewLandingUrl" style="flex: 1; width: 100%; border: none;"></iframe>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { savePreregistroConfig, getPreregistroReferrals } from '@/features/registration/services/registrationService';
import apiClient from '@/services/apiClient';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const config = ref({
  lado: 'izquierda',
  landing: 'oscuro'
});

const isLoading = ref(false);
const isSaving = ref(false);
const isLoadingReferrals = ref(false);
const referrals = ref([]);

const landings = [
  {
    tema: 'oscuro',
    nombre: 'Landing Oscuro',
    descripcion: 'Diseño moderno con fondo negro y acentos verdes. Ideal para un look premium.',
  },
  {
    tema: 'claro',
    nombre: 'Landing Claro',
    descripcion: 'Diseño limpio con fondo blanco y tonos verdes. Ideal para una apariencia corporativa.',
  }
];

const shareLink = computed(() => {
  if (!user.value?.username) return '';
  return `${window.location.origin}/preregistro/${user.value.username}?lado=${config.value.lado}&tema=${config.value.landing}`;
});

const getBaseUrl = () => window.location.origin;

const mostrarPreviewModal = ref(false);
const previewLandingUrl = ref('');
const tipoPreviewActual = ref('');

const openPreview = (tema) => {
  tipoPreviewActual.value = tema;
  previewLandingUrl.value = `${getBaseUrl()}/preregistro/${user.value?.username || 'demo'}?lado=${config.value.lado}&tema=${tema}`;
  mostrarPreviewModal.value = true;
  document.body.style.overflow = 'hidden';
};

const cerrarPreviewLanding = () => {
  mostrarPreviewModal.value = false;
  previewLandingUrl.value = '';
  document.body.style.overflow = '';
};

const openLink = (linkUrl) => {
  window.open(linkUrl, '_blank');
};

const scaleIframes = () => {
  nextTick(() => {
    const wraps = document.querySelectorAll('.landing-thumb-wrap');
    wraps.forEach(wrap => {
      const iframe = wrap.querySelector('.landing-thumb-iframe');
      if (!iframe) return;
      const wrapW = wrap.offsetWidth;
      // The iframe renders a 1280px wide viewport
      const scale = wrapW / 1280;
      iframe.style.transform = `scale(${scale})`;
      iframe.style.height = Math.ceil(180 / scale) + 'px';
    });
  });
};

const loadConfig = async () => {
  isLoading.value = true;
  try {
    const res = await apiClient.get(`registration/preregistro/config/${user.value.username}`);
    if (res.data && res.data.data) {
      config.value.lado = res.data.data.lado || 'izquierda';
      config.value.landing = res.data.data.landing || 'oscuro';
    }
  } catch (error) {
    console.error('Error loading config:', error);
  } finally {
    isLoading.value = false;
    scaleIframes();
  }
};

const saveConfig = async () => {
  isSaving.value = true;
  try {
    await savePreregistroConfig(config.value);
    alert('Configuración guardada y enlace actualizado exitosamente.');
  } catch (error) {
    console.error('Error saving config:', error);
    alert('Error al guardar la configuración.');
  } finally {
    isSaving.value = false;
    scaleIframes();
  }
};

const setLado = (lado) => {
  config.value.lado = lado;
  scaleIframes();
};

const setLanding = (tema) => {
  config.value.landing = tema;
};

const copyLink = () => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(shareLink.value)
      .then(() => alert('Enlace copiado al portapapeles'))
      .catch(() => fallbackCopy(shareLink.value));
  } else {
    fallbackCopy(shareLink.value);
  }
};

const fallbackCopy = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    alert('Enlace copiado al portapapeles');
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
  document.body.removeChild(textArea);
};

const loadReferrals = async () => {
  isLoadingReferrals.value = true;
  try {
    const res = await getPreregistroReferrals();
    referrals.value = res.rows || [];
  } catch (error) {
    console.error('Error loading referrals:', error);
  } finally {
    isLoadingReferrals.value = false;
  }
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

onMounted(async () => {
  if (!user.value) {
    await authStore.fetchUser();
  }
  loadConfig();
  loadReferrals();
  window.addEventListener('resize', scaleIframes);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', scaleIframes);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.preregistro-page {
  animation: fadeIn 0.4s ease;
  max-width: 1200px;
  margin: 0 auto;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom UI Components matching dashboard.css & variables.css */
.primary-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
}
.primary-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
  box-shadow: 0 4px 12px rgba(24, 214, 0, 0.4);
}
.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.outline-btn {
  padding: 10px 20px;
  background-color: transparent;
  color: var(--primary-color);
  font-weight: 600;
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}
.outline-btn:hover {
  background-color: rgba(24, 214, 0, 0.1);
}

.icon-text-btn {
  padding: 8px 16px;
  background-color: transparent;
  color: var(--text-light);
  border: 1px dashed var(--text-light);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  font-size: 13px;
}
.icon-text-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background-color: rgba(24, 214, 0, 0.05);
}

.btn-group-custom {
  display: flex;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}
body.dark-theme .btn-group-custom {
  background-color: rgba(255, 255, 255, 0.05);
}
.toggle-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--text-muted);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.toggle-btn.active {
  background-color: var(--primary-color);
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 214, 0, 0.3);
}

.link-input-group {
  display: flex;
  gap: 10px;
}
.custom-input {
  flex: 1;
  padding: 12px 16px;
  background-color: rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-main);
  outline: none;
  font-family: monospace;
  font-size: 14px;
}
body.dark-theme .custom-input {
  background-color: rgba(255, 255, 255, 0.03);
}

/* Landings Grid */
.landings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
.landing-card {
  position: relative;
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
body.dark-theme .landing-card {
  background-color: rgba(255, 255, 255, 0.02);
}
.landing-card:hover {
  transform: translateY(-4px);
  border-color: rgba(24, 214, 0, 0.3);
  background-color: rgba(24, 214, 0, 0.02);
}
.landing-card.active {
  border-color: var(--primary-color);
  background-color: rgba(24, 214, 0, 0.05);
  box-shadow: 0 8px 24px rgba(24, 214, 0, 0.15);
}
.landing-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}
.landing-icon.oscuro {
  background-color: #111;
  color: #fff;
  border: 1px solid #333;
}
.landing-icon.claro {
  background-color: #fff;
  color: #111;
  border: 1px solid #ddd;
}
.landing-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--text-light);
  color: var(--text-light);
}
.landing-card.active .landing-status {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background-color: rgba(24, 214, 0, 0.1);
}
.check-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  color: var(--primary-color);
}

/* Custom Table */
.custom-table-wrapper {
  overflow-x: auto;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
}
.custom-table th {
  text-align: left;
  padding: 15px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.custom-table td {
  padding: 15px;
  vertical-align: middle;
  border-bottom: 1px solid var(--border-color);
}
.custom-table tr:hover td {
  background-color: rgba(255, 255, 255, 0.02);
}

/* Table Cells */
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar-initials {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--indicator-green);
  color: var(--indicator-green-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}
.user-name {
  font-weight: 600;
  color: var(--text-bold);
  font-size: 14px;
}
.contact-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.contact-link {
  font-size: 13px;
  text-decoration: none;
  transition: opacity 0.2s;
}
.contact-link:hover {
  opacity: 0.8;
}
.contact-link.mail { color: var(--text-muted); }
.contact-link.whatsapp { color: #25D366; }

/* Badges */
.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}
.badge-green { background-color: var(--indicator-green); color: var(--indicator-green-text); }
.badge-blue { background-color: var(--indicator-blue); color: var(--indicator-blue-text); }
.badge-orange { background-color: var(--indicator-orange); color: var(--indicator-orange-text); }
.badge-gray { background-color: rgba(100, 116, 139, 0.1); color: var(--text-muted); }

/* Loaders and Empty State */
.loader-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  display: inline-block;
}
.loader-spinner.primary {
  border-color: rgba(24, 214, 0, 0.2);
  border-top-color: var(--primary-color);
  width: 30px;
  height: 30px;
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}

.empty-state {
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Landing Iframe Thumbnails */
.landing-thumb-wrap {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background-color: var(--card-bg);
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid var(--border-color);
}
.landing-thumb-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 1280px;
  height: 800px;
  border: none;
  pointer-events: none;
  transform-origin: top left;
  transition: transform 0.2s ease;
}

/* Preview Modal Overlay */
.preview-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.preview-container {
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  background-color: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0,0,0,0.4);
  border: 1px solid var(--border-color);
  animation: fadeIn 0.3s ease;
}
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--border-color);
}
body.dark-theme .preview-header {
  background-color: rgba(255, 255, 255, 0.05);
}
@media (max-width: 576px) {
  .preview-container { height: 95vh; }
}
.icon-text-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-main, #333);
  border: 1px solid rgba(150, 150, 150, 0.3);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
body.dark-theme .icon-text-btn {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}
.icon-text-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
body.dark-theme .icon-text-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}
</style>
