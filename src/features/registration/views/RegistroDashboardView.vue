<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRegistroDashboardStore } from '../stores/registroDashboardStore';
const store = useRegistroDashboardStore();

const notification = ref({ show: false, message: '', type: 'success' });
const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type };
  setTimeout(() => { notification.value.show = false; }, 3000);
};

const selectedLeg = ref('izquierda');
const timeRemaining = ref(0);
let timerInterval = null;

onMounted(async () => {
  await loadData();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const loadData = async () => {
  try {
    await store.fetchActiveLink();
    await store.fetchDirects();
    startTimer();
  } catch (error) {
    showNotification('No se pudo cargar la información', 'error');
  }
};

const hasActiveLink = computed(() => {
  return !!store.activeLink?.link?.url;
});

const generatedLinkUrl = computed(() => {
  return store.activeLink?.link?.url || '';
});

const formattedTime = computed(() => {
  if (timeRemaining.value <= 0) return '00:00:00';
  const h = Math.floor(timeRemaining.value / 3600);
  const m = Math.floor((timeRemaining.value % 3600) / 60);
  const s = timeRemaining.value % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  
  if (store.activeLink?.tiempoRestanteEnSegundos > 0) {
    timeRemaining.value = store.activeLink.tiempoRestanteEnSegundos;
    timerInterval = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--;
      } else {
        clearInterval(timerInterval);
        store.fetchActiveLink(); // Refresh when expired
      }
    }, 1000);
  } else {
    timeRemaining.value = 0;
  }
};

const generateLink = async () => {
  try {
    await store.generateLink();
    startTimer();
    showNotification('Enlace generado', 'success');
  } catch (error) {
    showNotification('No se pudo generar el enlace', 'error');
  }
};

const suspendLink = async () => {
  if (!store.activeLink?.link?.id) return;
  if (!confirm('¿Suspender este enlace?')) return;
  
  try {
    await store.suspendLink(store.activeLink.link.id);
    if (timerInterval) clearInterval(timerInterval);
    timeRemaining.value = 0;
    showNotification('Enlace suspendido', 'success');
  } catch (error) {
    showNotification('No se pudo suspender el enlace', 'error');
  }
};

const copyLink = () => {
  if (!generatedLinkUrl.value) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(generatedLinkUrl.value).then(() => {
      showNotification('Enlace copiado', 'success');
    });
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleString();
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
};
</script>

<template>
  <div class="dashboard-page registro-page">
    
    <!-- Notificación -->
    <div v-if="notification.show" class="realtime-toast" style="display: block; position: fixed; top: 20px; right: 20px; z-index: 1000; padding: 15px 20px; background-color: var(--primary-color); color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      {{ notification.message }}
    </div>

    <div class="page-header" style="margin-bottom: 25px;">
      <h2 class="page-title" style="font-size: 24px; font-weight: 700; color: var(--text-bold); margin-bottom: 5px;">Panel de Registro</h2>
      <p style="color: var(--text-muted); font-size: 14px; margin: 0;">Genera tu enlace de patrocinador y administra a tus referidos directos.</p>
    </div>

    <!-- PANELES DE CONTROL -->
    <div class="widgets-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); margin-bottom: 25px;">
      
      <!-- Tipo de enlace -->
      <div class="card" style="display: flex; flex-direction: column; justify-content: center;">
        <div class="card-header" style="margin-bottom: 15px;">
          <h3 class="card-title">Tipo de enlace</h3>
          <span class="card-meta">El enlace generado será para</span>
        </div>
        <button class="primary-btn" disabled style="opacity: 0.7; cursor: not-allowed; background-color: var(--indicator-blue);">
          Registro
        </button>
      </div>

      <!-- Ajuste de pierna -->
      <div class="card">
        <div class="card-header" style="margin-bottom: 15px;">
          <h3 class="card-title">Ajuste de pierna</h3>
          <span class="card-meta">Lado en tu estructura binaria</span>
        </div>
        <div class="btn-group-custom">
          <button 
            class="toggle-btn" 
            :class="{ active: selectedLeg === 'izquierda' }"
            :disabled="hasActiveLink"
            @click="selectedLeg = 'izquierda'"
          >
            Izquierda
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: selectedLeg === 'derecha' }"
            :disabled="hasActiveLink"
            @click="selectedLeg = 'derecha'"
          >
            Derecha
          </button>
        </div>
      </div>

      <!-- Acciones -->
      <div class="card" style="display: flex; flex-direction: column; justify-content: center;">
        <div class="card-header" style="margin-bottom: 15px;">
          <h3 class="card-title">Generación</h3>
          <span class="card-meta">Duración máxima: 5 horas</span>
        </div>
        
        <button 
          v-if="!hasActiveLink"
          class="primary-btn"
          @click="generateLink"
          :disabled="store.isGenerating"
        >
          <span v-if="store.isGenerating" class="loader-spinner"></span>
          <span v-else style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            Generar enlace
          </span>
        </button>
        
        <button 
          v-else
          class="primary-btn"
          style="background-color: #ef4444;"
          @click="suspendLink"
        >
          <span style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Suspender enlace
          </span>
        </button>
      </div>

    </div>

    <!-- ENLACE GENERADO -->
    <div v-if="hasActiveLink" class="card" style="margin-bottom: 25px;">
      <div class="card-header" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 class="card-title" style="color: var(--primary-color);">Tu enlace de invitación (Registro)</h3>
          <span class="card-meta">Cópialo y compártelo con tus prospectos</span>
        </div>
        <span class="badge badge-orange" style="font-family: monospace; font-size: 14px;">
          Expira en: {{ formattedTime }}
        </span>
      </div>
      
      <div class="link-input-group">
        <input type="text" class="custom-input" :value="generatedLinkUrl" readonly />
        <button class="outline-btn" @click="copyLink">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copiar
        </button>
      </div>
    </div>

    <!-- TABLA DE DIRECTOS -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">Mis Directos</h3>
          <span class="card-meta">En la siguiente tabla encontrará los datos de sus directivos registrados</span>
        </div>
      </div>
      
      <div v-if="store.isLoading" class="empty-state">
        <div class="loader-spinner primary"></div>
        <p>Cargando directivos...</p>
      </div>
      
      <div v-else-if="store.directs.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-light); margin-bottom: 15px; opacity: 0.5;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <h4 style="color: var(--text-bold); margin-bottom: 5px;">No tienes referidos directos registrados aún.</h4>
        <p style="color: var(--text-muted); font-size: 14px;">Genera un enlace y compártelo para empezar.</p>
      </div>

      <div v-else class="custom-table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Posición</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Inscripción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in store.directs" :key="row.id">
              <td>
                <div class="user-cell">
                  <div class="avatar-initials">
                    {{ getInitials(row.nombre) }}
                  </div>
                  <span class="user-name">{{ row.nombre || '—' }}</span>
                </div>
              </td>
              <td>
                <span class="badge" :class="row.lado === 'izquierda' ? 'badge-green' : (row.lado === 'derecha' ? 'badge-blue' : 'badge-gray')">
                  {{ row.lado === 'izquierda' ? 'Izquierda' : (row.lado === 'derecha' ? 'Derecha' : '—') }}
                </span>
              </td>
              <td>
                <div class="contact-cell">
                  <span class="contact-link whatsapp" v-if="row.whatsapp">{{ row.whatsapp }}</span>
                  <span v-else>—</span>
                </div>
              </td>
              <td>
                <div class="contact-cell">
                  <span class="contact-link mail" v-if="row.correo">{{ row.correo }}</span>
                  <span v-else>—</span>
                </div>
              </td>
              <td style="color: var(--text-muted); font-size: 13px;">
                {{ formatDate(row.fecha_registro) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
.registro-page {
  animation: fadeIn 0.4s ease;
  max-width: 1200px;
  margin: 0 auto;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

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
}
.contact-link.mail { color: var(--text-muted); }
.contact-link.whatsapp { color: #25D366; }

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
</style>
