<template>
  <div class="dashboard-page">

    <!-- TOP WIDGETS ROW -->
    <div class="widgets-grid">

      <!-- Condición Card -->
      <div class="card condition-card">
        <div class="card-header" style="align-items: flex-start; margin-bottom: 15px; z-index: 10; position: relative;">
          <h3 class="card-title">Condición</h3>
          <div class="info-tooltip-wrapper">
              <Info :size="18" class="text-light" />
              <div class="info-tooltip">
              <h5>Membresía activa</h5>
              <p>Tu paquete o suscripción a Promolíder está vigente y no ha caducado.</p>
              <h5>OPC Activo</h5>
              <p>Tu cuenta cumple con los requisitos de volumen o compras necesarias para poder operar y cobrar.</p>
              <h5>Calificado</h5>
              <p>Significa que tienes al menos <strong>un colaborador directo en tu izquierda y uno en tu derecha, y
                  ambos tienen su membresía activa</strong>. Si ellos están inactivos, vencidos o en cuenta gratuita, no
                te contarán para esta calificación. ¡Es el requisito principal para cobrar el Bono Binario!</p>
              </div>
            </div>
          </div>
        <ul class="condition-list">
          <li>
            <span class="cond-label">Membresía activa:</span>
            <XCircle class="text-red" :size="20" />
          </li>
          <li>
            <span class="cond-label">OPC activos:</span>
            <XCircle class="text-red" :size="20" />
          </li>
          <li>
            <span class="cond-label">Calificado:</span>
            <XCircle class="text-red" :size="20" />
          </li>
        </ul>
        
        <div class="condition-banner banner-warning">
          <AlertCircle :size="18" class="banner-icon" />
          <span>Bloquea tu posición para habilitar tus beneficios.</span>
        </div>
      </div>

      <!-- Countdown Card -->
      <div class="card countdown-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 30px;">
        <p class="countdown-greeting" style="font-size: 18px; color: var(--text-muted); margin-bottom: 10px;">
          <strong>¡Felicitaciones {{ userName }}!</strong> Tu posición Temporal Gratuito en el ecosistema ha sido reservada
        </p>
        <p class="countdown-text" style="font-size: 16px; color: var(--text-bold); margin-bottom: 20px;">
          Conserva tu ubicación antes del <strong style="color: var(--primary-color);">CIERRE DE 5 DÍAS</strong>
        </p>
        
        <div class="countdown-grid" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 25px;">
          <div class="time-block" v-for="unit in timeUnits" :key="unit.label" style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
            <div class="time-digits" style="display: flex; gap: 5px;">
              <span v-for="(d, i) in unit.digits" :key="i" class="digit" style="width: 35px; height: 45px; background: var(--primary-color); color: #fff; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800;">{{ d }}</span>
            </div>
            <span class="time-label" style="font-size: 12px; font-weight: bold; color: var(--text-bold);">{{ unit.label }}</span>
          </div>
        </div>
        
        <button class="lock-btn" @click="navigateToPago" style="padding: 12px 30px; background: var(--primary-color); color: #fff; border: none; border-radius: 50px; font-size: 14px; font-weight: bold; cursor: pointer; text-transform: uppercase; box-shadow: 0 4px 15px rgba(24,214,0,.3); transition: transform 0.2s;">
          Bloqueo mi posición ahora
        </button>
      </div>

    </div>

    <!-- TREE SECTION -->
    <div class="tree-section mt-5">
      <div class="tree-tabs">
        <div class="tabs-group">
          <button class="tree-tab" :class="{ active: activeTab === 'unilevel' }" @click="activeTab = 'unilevel'">Árbol Uninivel</button>
          <button class="tree-tab" :class="{ active: activeTab === 'binary' }" @click="activeTab = 'binary'">Árbol Binario</button>
        </div>
        <div class="info-tooltip-wrapper">
          <Info :size="18" class="text-light" />
          <div class="info-tooltip">
            <h5>Árbol Uninivel</h5>
            <p>Muestra a <strong>todos tus invitados directos</strong> (sin límite). Úsalo para ver a quién invitaste
              personalmente a la plataforma con tu enlace.</p>
            <h5>Árbol Binario</h5>
            <p>Es tu estructura de red enfocada en volumen de equipo. Muestra únicamente a <strong>tus líderes
                directos</strong> posicionados en tus piernas Izquierda y Derecha (se salta visualmente al derrame de
              tus patrocinadores superiores para mostrarte solo tus resultados reales).</p>
          </div>
        </div>
      </div>

      <div class="tree-container" style="min-height: 300px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
        <div class="tree-img-wrapper" style="padding: 20px; width: 100%; max-width: 500px;">
          <img
            src="/images/tree_placeholder.png"
            :alt="activeTab"
            class="tree-img"
            style="width: 100%; height: auto; border-radius: 8px; opacity: 0.5;"
          />
        </div>
        <p style="text-align: center; color: var(--text-muted); font-weight: 500; margin-bottom: 20px;">
          Aún no tienes red. ¡Bloquea tu posición y empieza a construir tu equipo!
        </p>
      </div>

      <div class="tree-footer">
        <button class="vol-btn">Volumen Izquierdo: 0 pts</button>
        <button class="vol-btn">Volumen Derecho: 0 pts</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { XCircle, Info, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const activeTab = ref('binary');

const userName = computed(() => localStorage.getItem('preregistro_nombre') || 'Invitado');

const totalSeconds = ref(5 * 24 * 60 * 60 - 1);

function navigateToPago() {
  const token = route.query.token || '';
  router.push(`/mi-dashboard/pago?token=${token}`);
}

const timeUnits = ref([
  { label: 'DÍAS',     digits: ['0', '4'] },
  { label: 'HORAS',    digits: ['1', '2'] },
  { label: 'MINUTOS',  digits: ['5', '9'] },
  { label: 'SEGUNDOS', digits: ['3', '1'] },
]);

function pad(n) {
  return String(n).padStart(2, '0').split('');
}

function updateCountdown() {
  const s = totalSeconds.value;
  timeUnits.value = [
    { label: 'DÍAS',     digits: pad(Math.floor(s / 86400)) },
    { label: 'HORAS',    digits: pad(Math.floor((s % 86400) / 3600)) },
    { label: 'MINUTOS',  digits: pad(Math.floor((s % 3600) / 60)) },
    { label: 'SEGUNDOS', digits: pad(s % 60) },
  ];
  if (totalSeconds.value > 0) totalSeconds.value--;
}

let timer;
onMounted(() => { 
  updateCountdown(); 
  timer = setInterval(updateCountdown, 1000);
});
onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
/* Scoped styles specific to Countdown card to complement global dashboard.css */
.countdown-greeting strong {
  display: block;
  font-size: 28px;
  font-weight: 900;
  color: var(--primary-color, #18d600);
  margin-bottom: 8px;
  line-height: 1.2;
}

.lock-btn:hover { 
  transform: translateY(-2px) !important; 
  box-shadow: 0 6px 18px rgba(24,214,0,.4) !important; 
}
</style>

