<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { ChevronLeft, ChevronRight, Search } from 'lucide-vue-next';
import { useRegistroDashboardStore } from '../stores/registroDashboardStore';

const store = useRegistroDashboardStore();

/**
 * Los dos perfiles que se pueden invitar. `rol` es el nombre del rol en la base (Spatie),
 * y `param` viaja en el enlace para que el formulario público sepa qué pedir.
 */
const PERFILES = {
  productor: {
    id: 'productor',
    rol: 'Producer',
    param: 'productor',
    titulo: 'Productor',
    resumen: 'Crea y vende sus propios cursos, libros y masterclasses.',
    registro: 'Registro gratuito, sin pasarela de pago',
    gancho: 'Invita creadores y gana con lo que publiquen',
    beneficios: [
      'Tu invitado publica sus infoproductos sin pagar membresía, así que el registro no le frena.',
      'Cada venta suya te genera bono de productor según el nivel de tu membresía.',
      'Su catálogo entra al marketplace donde tú también vendes.'
    ]
  },
  distribuidor: {
    id: 'distribuidor',
    rol: 'Distributor',
    param: 'distribuidor',
    titulo: 'Distribuidor',
    resumen: 'Promociona la red, arma su equipo y gana comisiones.',
    registro: 'Elige membresía y paga al registrarse',
    gancho: 'Suma distribuidores y haz crecer tu binario',
    beneficios: [
      'Se coloca en la pierna que elijas y empieza a construir tu estructura.',
      'Su membresía te deja comisión directa desde el primer día.',
      'Lo que compren él y su equipo alimenta tu corte binario.'
    ]
  }
};

const PERFIL_GUARDADO = 'registro:perfil';

const perfil = ref(null);
const selectedLeg = ref('izquierda');
const timeRemaining = ref(0);
let timerInterval = null;

const notification = ref({ show: false, message: '', type: 'success' });
const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type };
  setTimeout(() => { notification.value.show = false; }, 3000);
};

const perfilActual = computed(() => (perfil.value ? PERFILES[perfil.value] : null));

onMounted(async () => {
  const guardado = localStorage.getItem(PERFIL_GUARDADO);
  if (guardado && PERFILES[guardado]) perfil.value = guardado;

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

const elegirPerfil = (id) => {
  perfil.value = id;
  localStorage.setItem(PERFIL_GUARDADO, id);
};

const cambiarPerfil = () => {
  perfil.value = null;
  localStorage.removeItem(PERFIL_GUARDADO);
};

/* ── Enlace ───────────────────────────────────────────────── */

const hasActiveLink = computed(() => !!store.activeLink?.link?.url);

/**
 * El backend arma la URL sin saber a quién se invita, así que el perfil se añade aquí como
 * parámetro. No afecta a la validación del enlace, que solo mira el id y el código de la ruta.
 */
const generatedLinkUrl = computed(() => {
  const base = store.activeLink?.link?.url || '';
  if (!base || !perfilActual.value) return base;
  return `${base}${base.includes('?') ? '&' : '?'}perfil=${perfilActual.value.param}`;
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
        store.fetchActiveLink();
      }
    }, 1000);
  } else {
    timeRemaining.value = 0;
  }
};

const generateLink = async () => {
  try {
    const position = selectedLeg.value === 'derecha' ? 1 : 0;
    await store.generateLink(position);
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

/* ── Listado de directos ──────────────────────────────────── */

// Los enlaces generados antes de este cambio devuelven filas sin `roles`; en ese caso no se
// filtra nada, para no dejar la tabla vacía sin explicación.
const backendEnviaRoles = computed(() =>
  store.directs.some(row => Array.isArray(row.roles))
);

const directosDelPerfil = computed(() => {
  if (!perfilActual.value || !backendEnviaRoles.value) return store.directs;
  return store.directs.filter(row => (row.roles || []).includes(perfilActual.value.rol));
});

const busqueda = ref('');
const pagina = ref(1);
const POR_PAGINA = 10;

const directosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();
  if (!texto) return directosDelPerfil.value;

  return directosDelPerfil.value.filter(row => {
    const campos = [row.nombres || row.nombre, row.apellidos, row.correo, row.whatsapp];
    return campos.some(campo => String(campo || '').toLowerCase().includes(texto));
  });
});

const totalPaginas = computed(() =>
  Math.max(1, Math.ceil(directosFiltrados.value.length / POR_PAGINA))
);

const directosPaginados = computed(() => {
  const desde = (pagina.value - 1) * POR_PAGINA;
  return directosFiltrados.value.slice(desde, desde + POR_PAGINA);
});

const rangoMostrado = computed(() => {
  if (!directosFiltrados.value.length) return '0';
  const desde = (pagina.value - 1) * POR_PAGINA + 1;
  const hasta = Math.min(pagina.value * POR_PAGINA, directosFiltrados.value.length);
  return `${desde}–${hasta}`;
});

// Al cambiar de perfil o de búsqueda, la página actual puede quedar fuera de rango.
watch([busqueda, perfil], () => { pagina.value = 1; });
watch(totalPaginas, (total) => {
  if (pagina.value > total) pagina.value = total;
});

const irA = (destino) => {
  pagina.value = Math.min(Math.max(1, destino), totalPaginas.value);
};

const esProductor = computed(() => perfil.value === 'productor');

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getInitials = (nombres, apellidos) => {
  const inicial = (texto) => (texto || '').trim().charAt(0).toUpperCase();
  const iniciales = `${inicial(nombres)}${inicial(apellidos)}`;
  return iniciales || '?';
};
</script>

<template>
  <div class="dashboard-page registro-page">

    <div v-if="notification.show" class="realtime-toast">
      {{ notification.message }}
    </div>

    <div class="page-header">
      <h2 class="page-title">Panel de Registro</h2>
      <p class="page-subtitle">Genera tu enlace de patrocinador y administra a tus referidos directos.</p>
    </div>

    <!-- ── Paso 1: a quién se invita ──────────────────────── -->
    <div v-if="!perfilActual" class="card perfil-gate">
      <div class="card-header">
        <div>
          <h3 class="card-title">¿A quién vas a invitar?</h3>
          <span class="card-meta">Elige un perfil para generar el enlace. El formulario que verá tu invitado cambia según lo que elijas.</span>
        </div>
      </div>

      <div class="perfil-grid">
        <button
          v-for="opcion in Object.values(PERFILES)" :key="opcion.id"
          type="button" class="perfil-card" @click="elegirPerfil(opcion.id)"
        >
          <span class="perfil-nombre">{{ opcion.titulo }}</span>
          <span class="perfil-resumen">{{ opcion.resumen }}</span>
          <span class="perfil-registro">{{ opcion.registro }}</span>
          <span class="perfil-cta">Invitar {{ opcion.titulo.toLowerCase() }} →</span>
        </button>
      </div>
    </div>

    <!-- ── Paso 2: todo lo demás ──────────────────────────── -->
    <template v-else>

      <div class="perfil-activo card">
        <div class="perfil-activo-info">
          <span class="badge badge-green">{{ perfilActual.titulo }}</span>
          <span class="perfil-activo-texto">{{ perfilActual.registro }}</span>
        </div>
        <button
          type="button" class="link-btn" @click="cambiarPerfil"
          :disabled="hasActiveLink"
          :title="hasActiveLink ? 'Suspende el enlace activo para cambiar de perfil' : ''"
        >
          Cambiar perfil
        </button>
      </div>

      <!-- Incentivo -->
      <div class="incentivo">
        <h3 class="incentivo-titulo">{{ perfilActual.gancho }}</h3>
        <ul class="incentivo-lista">
          <li v-for="(beneficio, i) in perfilActual.beneficios" :key="i">{{ beneficio }}</li>
        </ul>
        <p class="incentivo-pie">
          Tus ganancias dependen del nivel de tu membresía. Cuanto antes entren, antes empiezan a producir.
        </p>
      </div>

      <div class="widgets-grid">

        <div class="card control-card">
          <div class="card-header">
            <h3 class="card-title">Tipo de enlace</h3>
            <span class="card-meta">El enlace generado será para</span>
          </div>
          <div class="tipo-enlace">{{ perfilActual.titulo }}</div>
        </div>

        <div class="card control-card">
          <div class="card-header">
            <h3 class="card-title">Ajuste de pierna</h3>
            <span class="card-meta">Lado en tu estructura binaria</span>
          </div>
          <div class="btn-group-custom">
            <button
              class="toggle-btn" :class="{ active: selectedLeg === 'izquierda' }"
              :disabled="hasActiveLink" @click="selectedLeg = 'izquierda'"
            >
              Izquierda
            </button>
            <button
              class="toggle-btn" :class="{ active: selectedLeg === 'derecha' }"
              :disabled="hasActiveLink" @click="selectedLeg = 'derecha'"
            >
              Derecha
            </button>
          </div>
        </div>

        <div class="card control-card">
          <div class="card-header">
            <h3 class="card-title">Generación</h3>
            <span class="card-meta">Duración máxima: 5 horas</span>
          </div>

          <button
            v-if="!hasActiveLink" class="primary-btn" @click="generateLink"
            :disabled="store.isGenerating"
          >
            <span v-if="store.isGenerating" class="loader-spinner"></span>
            <span v-else class="btn-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              Generar enlace
            </span>
          </button>

          <button v-else class="primary-btn danger" @click="suspendLink">
            <span class="btn-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Suspender enlace
            </span>
          </button>
        </div>

      </div>

      <!-- Enlace generado -->
      <div v-if="hasActiveLink" class="card">
        <div class="card-header link-header">
          <div>
            <h3 class="card-title accent">Tu enlace para invitar {{ perfilActual.titulo.toLowerCase() }}es</h3>
            <span class="card-meta">Cópialo y compártelo con tus prospectos</span>
          </div>
          <span class="badge badge-orange mono">Expira en: {{ formattedTime }}</span>
        </div>

        <div class="link-input-group">
          <input type="text" class="custom-input" :value="generatedLinkUrl" readonly />
          <button class="outline-btn" @click="copyLink">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copiar
          </button>
        </div>
      </div>

      <!-- Listado -->
      <div class="card">
        <div class="card-header tabla-header">
          <div>
            <h3 class="card-title">Mis {{ perfilActual.titulo.toLowerCase() }}es directos</h3>
            <span class="card-meta">
              {{ directosFiltrados.length }}
              {{ directosFiltrados.length === 1 ? 'persona registrada' : 'personas registradas' }} con tu enlace
            </span>
          </div>

          <div class="buscador">
            <Search :size="17" />
            <input
              type="search" v-model="busqueda" class="buscador-input"
              placeholder="Buscar por nombre, apellido, correo o teléfono"
              aria-label="Buscar en el listado"
            />
          </div>
        </div>

        <div v-if="store.isLoading" class="empty-state">
          <div class="loader-spinner primary"></div>
          <p>Cargando directos...</p>
        </div>

        <div v-else-if="directosFiltrados.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <template v-if="busqueda.trim()">
            <h4>Ningún resultado para «{{ busqueda }}».</h4>
            <p>Prueba con otro nombre, apellido, correo o teléfono.</p>
          </template>
          <template v-else>
            <h4>Todavía no tienes {{ perfilActual.titulo.toLowerCase() }}es directos.</h4>
            <p>Genera un enlace y compártelo para empezar.</p>
          </template>
        </div>

        <div v-else class="custom-table-wrapper">
          <table class="custom-table" :class="esProductor ? 'tabla-productor' : 'tabla-distribuidor'">
            <colgroup>
              <col class="col-persona" />
              <col class="col-apellidos" />
              <col v-if="!esProductor" class="col-posicion" />
              <col class="col-telefono" />
              <col class="col-correo" />
              <col v-if="!esProductor" class="col-invitados" />
              <col v-if="esProductor" class="col-cursos" />
              <col v-if="esProductor" class="col-vendido" />
              <col class="col-fecha" />
            </colgroup>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th v-if="!esProductor" class="center">Posición</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th v-if="!esProductor" class="center">Invitados</th>
                <th v-if="esProductor" class="center">Cursos</th>
                <th v-if="esProductor">Más vendido</th>
                <th class="center">Registro</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in directosPaginados" :key="row.id">
                <td>
                  <div class="user-cell">
                    <div class="avatar-initials">{{ getInitials(row.nombres ?? row.nombre, row.apellidos) }}</div>
                    <span class="user-name">{{ row.nombres || row.nombre || '—' }}</span>
                  </div>
                </td>
                <td class="celda-texto">{{ row.apellidos || '—' }}</td>
                <td v-if="!esProductor" class="center">
                  <span class="badge" :class="row.lado === 'derecha' ? 'badge-blue' : 'badge-green'">
                    {{ row.lado === 'derecha' ? 'Derecha' : 'Izquierda' }}
                  </span>
                </td>
                <td>
                  <span v-if="row.whatsapp" class="contact-link whatsapp">{{ row.whatsapp }}</span>
                  <span v-else class="vacio">—</span>
                </td>
                <td>
                  <span v-if="row.correo" class="contact-link mail" :title="row.correo">{{ row.correo }}</span>
                  <span v-else class="vacio">—</span>
                </td>
                <td v-if="!esProductor" class="center">
                  <span class="conteo" :class="{ cero: !row.invitados }">{{ row.invitados ?? 0 }}</span>
                </td>
                <td v-if="esProductor" class="center">
                  <span class="conteo" :class="{ cero: !row.cursos_publicados }">{{ row.cursos_publicados ?? 0 }}</span>
                </td>
                <td v-if="esProductor">
                  <div v-if="row.curso_mas_vendido" class="vendido">
                    <span class="vendido-titulo" :title="row.curso_mas_vendido.titulo">{{ row.curso_mas_vendido.titulo }}</span>
                    <span class="vendido-ventas">
                      {{ row.curso_mas_vendido.ventas }}
                      {{ row.curso_mas_vendido.ventas === 1 ? 'venta' : 'ventas' }}
                    </span>
                  </div>
                  <span v-else class="vacio">Sin ventas</span>
                </td>
                <td class="center fecha">{{ formatDate(row.fecha_registro) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="directosFiltrados.length" class="paginacion">
          <span class="paginacion-info">
            Mostrando {{ rangoMostrado }} de {{ directosFiltrados.length }}
          </span>

          <div v-if="totalPaginas > 1" class="paginacion-controles">
            <button
              type="button" class="pagina-btn" :disabled="pagina === 1"
              @click="irA(pagina - 1)" aria-label="Página anterior"
            >
              <ChevronLeft :size="16" />
            </button>
            <span class="pagina-actual">{{ pagina }} de {{ totalPaginas }}</span>
            <button
              type="button" class="pagina-btn" :disabled="pagina === totalPaginas"
              @click="irA(pagina + 1)" aria-label="Página siguiente"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>

    </template>

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

.realtime-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 15px 20px;
  background-color: var(--primary-color);
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.page-header { margin-bottom: 25px; }
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-bold);
  margin-bottom: 5px;
}
.page-subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

/* ── Elección de perfil ─────────────────────────── */

.perfil-gate { margin-bottom: 25px; }

.perfil-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
  margin-top: 20px;
}

.perfil-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 24px;
  text-align: left;
  font-family: inherit;
  background-color: rgba(24, 214, 0, 0.04);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  cursor: pointer;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.perfil-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary-color);
  box-shadow: 0 10px 24px -12px rgba(24, 214, 0, 0.6);
}
.perfil-card:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 3px;
}

.perfil-nombre {
  font-size: 19px;
  font-weight: 700;
  color: var(--text-bold);
}
.perfil-resumen {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-muted);
}
.perfil-registro {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  background-color: var(--indicator-green);
  color: var(--indicator-green-text);
}
.perfil-cta {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-color);
}

.perfil-activo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.perfil-activo-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.perfil-activo-texto {
  font-size: 13.5px;
  color: var(--text-muted);
}
.link-btn {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  cursor: pointer;
}
.link-btn:disabled {
  color: var(--text-light);
  cursor: not-allowed;
}

/* ── Incentivo ──────────────────────────────────── */

.incentivo {
  padding: 24px 26px;
  margin-bottom: 25px;
  border-radius: 14px;
  border: 1px solid rgba(24, 214, 0, 0.35);
  background: linear-gradient(120deg, rgba(24, 214, 0, 0.12) 0%, rgba(24, 214, 0, 0.03) 100%);
}
.incentivo-titulo {
  margin: 0 0 14px;
  font-size: 19px;
  font-weight: 700;
  color: var(--text-bold);
}
.incentivo-lista {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.incentivo-lista li {
  font-size: 14.5px;
  line-height: 1.5;
  color: var(--text-main);
}
.incentivo-pie {
  margin: 14px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-color);
}

/* ── Controles ──────────────────────────────────── */

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}
.control-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 15px;
}
.control-card .card-header { margin-bottom: 0; }

.tipo-enlace {
  padding: 12px;
  text-align: center;
  font-weight: 700;
  border-radius: 8px;
  background-color: var(--indicator-blue);
  color: var(--indicator-blue-text);
}

.primary-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: #fff;
  font-weight: 700;
  font-family: inherit;
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
.primary-btn.danger { background-color: #ef4444; }
.primary-btn.danger:hover { background-color: #dc2626; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); }

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.outline-btn {
  padding: 10px 20px;
  background-color: transparent;
  color: var(--primary-color);
  font-weight: 600;
  font-family: inherit;
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.outline-btn:hover { background-color: rgba(24, 214, 0, 0.1); }

.btn-group-custom {
  display: flex;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}
body.dark-theme .btn-group-custom { background-color: rgba(255, 255, 255, 0.05); }
.toggle-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--text-muted);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s;
}
.toggle-btn.active {
  background-color: var(--primary-color);
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 214, 0, 0.3);
}
.toggle-btn:disabled { cursor: not-allowed; opacity: 0.6; }

.link-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}
.card-title.accent { color: var(--primary-color); }
.badge.mono { font-family: monospace; font-size: 14px; }

.link-input-group {
  display: flex;
  gap: 10px;
}
.custom-input {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  background-color: rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-main);
  outline: none;
  font-family: monospace;
  font-size: 14px;
}
body.dark-theme .custom-input { background-color: rgba(255, 255, 255, 0.03); }

/* ── Tabla ──────────────────────────────────────── */

.custom-table-wrapper { overflow-x: auto; }

/*
 * Anchos fijos por columna: sin esto el navegador reparte el espacio según el contenido y
 * las cabeceras dejan de coincidir con sus celdas, que era el descuadre del listado.
 */
.custom-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.tabla-productor { min-width: 940px; }
.tabla-distribuidor { min-width: 820px; }

.col-persona  { width: 18%; }
.col-apellidos { width: 14%; }
.col-posicion { width: 10%; }
.col-telefono { width: 13%; }
.col-correo   { width: 21%; }
.col-invitados { width: 9%; }
.col-cursos   { width: 8%; }
.col-vendido  { width: 18%; }
.col-fecha    { width: 11%; }

/* Buscador */
.tabla-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}
.buscador {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 14px;
  min-width: 320px;
  flex: 1;
  max-width: 420px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.03);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
body.dark-theme .buscador { background-color: rgba(255, 255, 255, 0.03); }
.buscador:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.15);
}
.buscador svg {
  color: var(--text-light);
  flex-shrink: 0;
}
.buscador-input {
  flex: 1;
  min-width: 0;
  padding: 11px 0;
  border: none;
  background: transparent;
  outline: none;
  color: var(--text-main);
  font-family: inherit;
  font-size: 14px;
}
.buscador-input::placeholder { color: var(--text-light); }

/* Paginación */
.paginacion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 18px;
  margin-top: 4px;
  border-top: 1px solid var(--border-color);
}
.paginacion-info {
  font-size: 13.5px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.paginacion-controles {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pagina-btn {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: transparent;
  color: var(--text-main);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}
.pagina-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.pagina-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pagina-actual {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-bold);
  font-variant-numeric: tabular-nums;
  min-width: 68px;
  text-align: center;
}

.custom-table th {
  text-align: left;
  padding: 14px 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.custom-table td {
  padding: 14px 12px;
  vertical-align: middle;
  border-bottom: 1px solid var(--border-color);
  font-size: 13.5px;
}
.custom-table th.center,
.custom-table td.center { text-align: center; }

.custom-table tr:hover td { background-color: rgba(24, 214, 0, 0.04); }

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.avatar-initials {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--indicator-green);
  color: var(--indicator-green-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12.5px;
}
.user-name,
.celda-texto {
  font-weight: 600;
  color: var(--text-bold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-link {
  font-size: 13px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.contact-link.mail { color: var(--text-muted); }
.contact-link.whatsapp { color: #25D366; }
.vacio { color: var(--text-light); }

.conteo {
  display: inline-block;
  min-width: 30px;
  padding: 3px 9px;
  border-radius: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  background-color: var(--indicator-green);
  color: var(--indicator-green-text);
}
.conteo.cero {
  background-color: rgba(100, 116, 139, 0.12);
  color: var(--text-muted);
}

.vendido {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.vendido-titulo {
  font-weight: 600;
  color: var(--text-bold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vendido-ventas {
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 600;
}

.fecha {
  color: var(--text-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  white-space: nowrap;
}
.badge-green { background-color: var(--indicator-green); color: var(--indicator-green-text); }
.badge-blue { background-color: var(--indicator-blue); color: var(--indicator-blue-text); }
.badge-orange { background-color: var(--indicator-orange); color: var(--indicator-orange-text); }

.loader-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
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
.empty-state h4 {
  color: var(--text-bold);
  margin-bottom: 5px;
}
.empty-state p {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}
.empty-icon {
  color: var(--text-light);
  margin-bottom: 15px;
  opacity: 0.5;
}

@media (max-width: 640px) {
  .link-input-group { flex-direction: column; }
  .outline-btn { justify-content: center; }
}
</style>
