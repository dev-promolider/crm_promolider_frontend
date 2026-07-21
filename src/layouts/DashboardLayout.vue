<template>
  <div :class="['app-layout', { 'dark-theme': isDarkTheme }]">
    
    <!-- Floating WebSocket Toast -->
    <transition name="toast-slide">
      <div v-if="showToast" class="realtime-toast" @click="showToast = false">
        <div class="toast-avatar" v-if="toastImage">
          <img :src="toastImage" alt="Emisor" />
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toastTitle }}</div>
          <div class="toast-body">{{ toastBody }}</div>
        </div>
      </div>
    </transition>

    <!-- Watermark Logo -->
    <div class="watermark-bg">
      <!-- Un truco CSS para mostrar solo el ícono de Promolíder o la imagen difuminada -->
      <img src="/images/logo/promolider_logo.png" alt="watermark" />
    </div>

    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ 'collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="/images/logo/promolider_logo.png" alt="Promolider" class="sidebar-logo-img" />
        </div>
        <button class="collapse-btn" @click="isSidebarCollapsed = !isSidebarCollapsed">
          <Menu :size="20" />
        </button>
      </div>

      <div class="sidebar-scroll">
        <nav class="sidebar-nav">
          <RouterLink to="/dashboard" class="nav-item" exact-active-class="active">
            <LayoutDashboard :size="20" />
            <span v-if="!isSidebarCollapsed">Dashboards</span>
          </RouterLink>

          <RouterLink to="/dashboard/preregistro" class="nav-item" active-class="active">
            <UserPlus :size="20" />
            <span v-if="!isSidebarCollapsed">Preregistro</span>
          </RouterLink>

          <RouterLink to="/registro" class="nav-item" active-class="active">
            <Database :size="20" />
            <span v-if="!isSidebarCollapsed">Registro</span>
          </RouterLink>


          <div class="nav-group" :class="{ active: isAulaActive, open: isAulaOpen }">
            <button type="button" class="nav-item nav-parent" @click="toggleAula">
              <MonitorPlay :size="20" />

              <span v-if="!isSidebarCollapsed">Aula virtual</span>

              <ChevronRight
                v-if="!isSidebarCollapsed"
                :size="16"
                class="ml-auto opacity-50 nav-chevron"
              />
            </button>

            <transition name="submenu">
              <div v-if="isAulaOpen && !isSidebarCollapsed" class="submenu">
                <RouterLink
                  v-for="item in aulaVirtualItems"
                  :key="item.slug"
                  :to="item.to"
                  class="submenu-item"
                  :class="{ active: isSubItemActive(item.to) }"
                >
                  <component :is="item.icon" :size="17" />
                  <span>{{ item.label }}</span>
                </RouterLink>
              </div>
            </transition>
          </div>

          <!-- Marketing - Expandable Section -->
          <div class="nav-section">
            <button
              class="nav-item nav-section-toggle"
              :class="{ expanded: marketingExpanded }"
              @click="marketingExpanded = !marketingExpanded"
            >
              <Star :size="20" />
              <span v-if="!isSidebarCollapsed" class="nav-label">Marketing</span>
              <ChevronDown
                v-if="!isSidebarCollapsed"
                :size="16"
                class="nav-arrow"
                :class="{ rotated: marketingExpanded }"
              />
            </button>

            <transition name="submenu-slide">
              <div v-if="marketingExpanded && !isSidebarCollapsed" class="nav-submenu">
                <RouterLink to="/marketing/herramientas" class="nav-subitem" active-class="active">
                  <span class="submenu-dot"></span>
                  <span>Herramientas</span>
                </RouterLink>
                <RouterLink to="/marketing/marketplace" class="nav-subitem" active-class="active">
                  <span class="submenu-dot"></span>
                  <span>Marketplace</span>
                </RouterLink>
                <RouterLink to="/marketing/calendario" class="nav-subitem" active-class="active">
                  <span class="submenu-dot"></span>
                  <span>Calendario</span>
                </RouterLink>
                <RouterLink to="/marketing/pages" class="nav-subitem" active-class="active">
                  <span class="submenu-dot"></span>
                  <span>Páginas</span>
                </RouterLink>
                <RouterLink to="/marketing/reportes" class="nav-subitem" active-class="active">
                  <span class="submenu-dot"></span>
                  <span>Reportes</span>
                </RouterLink>
              </div>
            </transition>
          </div>

          <RouterLink to="/solicitudes" class="nav-item" active-class="active">
            <Send :size="20" />
            <span v-if="!isSidebarCollapsed">Solicitudes</span>
            <ChevronRight v-if="!isSidebarCollapsed" :size="16" class="ml-auto opacity-50" />
          </RouterLink>

          <!-- Reportes - Collapsible Menu Section -->
          <div class="nav-section">
            <button
              class="nav-item nav-section-toggle"
              :class="{ expanded: reportesExpanded }"
              @click="reportesExpanded = !reportesExpanded"
            >
              <PieChart :size="20" />
              <span v-if="!isSidebarCollapsed" class="nav-label">Reportes</span>
              <ChevronDown
                v-if="!isSidebarCollapsed"
                :size="16"
                class="nav-arrow"
                :class="{ rotated: reportesExpanded }"
              />
            </button>

            <transition name="submenu-slide">
              <div v-if="reportesExpanded && !isSidebarCollapsed" class="nav-submenu">
                
                <!-- Mi Cartera - Collapsible Sub-section -->
                <div class="nav-subsection">
                  <button
                    class="nav-subitem nav-subsection-toggle"
                    :class="{ expanded: carteraExpanded }"
                    @click="carteraExpanded = !carteraExpanded"
                  >
                    <Wallet :size="16" />
                    <span class="nav-label">Mi Cartera</span>
                    <ChevronDown
                      :size="12"
                      class="nav-arrow"
                      :class="{ rotated: carteraExpanded }"
                    />
                  </button>

                  <transition name="submenu-slide">
                    <div v-if="carteraExpanded" class="nav-sub-submenu">
                      <RouterLink to="/dashboard/billetera" class="nav-subitem-deep" active-class="active">
                        <span class="submenu-dot"></span>
                        <span>Mi Billetera</span>
                      </RouterLink>
                      <RouterLink to="/dashboard/mis-compras" class="nav-subitem-deep" active-class="active">
                        <span class="submenu-dot"></span>
                        <span>Mis Compras</span>
                      </RouterLink>
                      <RouterLink to="/dashboard/mis-ventas" class="nav-subitem-deep" active-class="active">
                        <span class="submenu-dot"></span>
                        <span>Mis Ventas</span>
                      </RouterLink>
                    </div>
                  </transition>
                </div>

                <!-- Bono Rango - Collapsible Sub-section -->
                <div class="nav-subsection mt-1">
                  <button
                    class="nav-subitem nav-subsection-toggle"
                    :class="{ expanded: bonoRangoExpanded }"
                    @click="bonoRangoExpanded = !bonoRangoExpanded"
                  >
                    <Award :size="16" />
                    <span class="nav-label">Bono Rango</span>
                    <ChevronDown
                      :size="12"
                      class="nav-arrow"
                      :class="{ rotated: bonoRangoExpanded }"
                    />
                  </button>

                  <transition name="submenu-slide">
                    <div v-if="bonoRangoExpanded" class="nav-sub-submenu">
                      <RouterLink to="/dashboard/bono-rango/historial" class="nav-subitem-deep" active-class="active">
                        <span class="submenu-dot"></span>
                        <span>Historial</span>
                      </RouterLink>
                    </div>
                  </transition>
                </div>

              </div>
            </transition>
          </div>
        </nav>
      </div>

      <div class="sidebar-bottom" v-if="!isSidebarCollapsed">
        <div v-if="user" class="opc-status-container">
          <span class="status-indicator" :class="{ 'is-active': isOpcActive, 'is-inactive': !isOpcActive }">
            <span class="status-dot"></span>
            {{ isOpcActive ? 'OPC Activo' : 'OPC Inactivo' }}
          </span>
        </div>
        <AnimatedButton style="width: 100%;" @click="openOpcModal">
          Recomprar OPC
        </AnimatedButton>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
      <!-- NAVBAR -->
      <header class="topbar">
        <div class="topbar-left">
          <!-- Search input -->
          <div class="search-box">
            <Search :size="18" />
            <input type="text" placeholder="Buscar..." />
          </div>
        </div>
        
        <div class="topbar-right">
          <!-- Dark Mode Toggle -->
          <button class="icon-btn" @click="toggleTheme" title="Cambiar Tema">
            <Moon v-if="!isDarkTheme" :size="20" />
            <Sun v-else :size="20" />
          </button>

          <!-- Créditos -->
          <div class="topbar-item" title="Créditos">
            <div class="badge green-badge">{{ topbarStats.credits }}</div>
          </div>
          
          <!-- Rango -->
          <div class="topbar-item" :title="'Rango: ' + topbarStats.rank.name">
            <button class="icon-btn">
              <img v-if="topbarStats.rank.icon" :src="getAvatarUrl(topbarStats.rank.icon)" alt="Rango" style="width:20px; height:20px; object-fit:contain;" @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;" />
              <Award v-else :size="20" />
            </button>
          </div>
          
          <!-- Puntos -->
          <div class="topbar-item" :title="'Puntos: ' + topbarStats.points.total">
            <button class="icon-btn relative">
              <Apple :size="20" class="text-blue-400" />
              <!-- Si quieres mostrar el porcentaje podrías usar un badge o barra -->
            </button>
          </div>

          <!-- Notificaciones -->
          <div class="topbar-item" title="Notificaciones" style="position: relative;">
            <button class="icon-btn relative" @click="toggleNotifications">
              <Bell :size="20" />
              <span v-if="topbarStats.notifications.unread > 0" class="notification-dot"></span>
              <span v-if="topbarStats.notifications.unread > 0" class="notification-badge">{{ topbarStats.notifications.unread }}</span>
            </button>
            
            <!-- Notifications Dropdown -->
            <div class="notifications-dropdown" :class="{ 'show': isNotificationsOpen }" @click.stop>
              <div class="notifications-header">
                <span class="font-bold">Notificaciones</span>
              </div>
              <div class="notifications-body">
                <div v-if="isLoadingNotifications" class="p-8 flex flex-col items-center justify-center gap-2" style="color: var(--text-muted);">
                  <Loader2 class="animate-spin" :size="24" />
                  <span class="text-sm">Cargando notificaciones...</span>
                </div>
                <div v-else-if="notificationsList.length === 0" class="p-4 text-center text-gray-400">
                  No tienes notificaciones
                </div>
                <div v-else class="notification-list">
                  <div v-for="notif in notificationsList" :key="notif.id" class="notification-item">
                    <img v-if="notif.photo" :src="notif.photo" alt="Avatar" class="notification-item-avatar" />
                    <div class="notification-item-content">
                      <div class="notification-item-title">{{ notif.title }}</div>
                      <div class="notification-item-body">{{ notif.body }}</div>
                      <div class="notification-item-time">{{ new Date(notif.created_at).toLocaleString() }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

            <div class="user-dropdown-container" @click="toggleDropdown">
              <div class="user-info">
                <div class="user-text text-right">
                  <span class="user-name">{{ user?.name || user?.nombre || 'Cargando...' }} {{ user?.last_name || user?.apellido || '' }}</span>
                  <span class="user-role">{{ user?.account_type?.name || user?.role || 'University' }}</span>
                </div>
                <div class="user-avatar">
                  <img v-if="user?.photo || user?.avatar" :src="getAvatarUrl(user.photo || user.avatar)" alt="Avatar" @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;" />
                  <div v-else class="initials-avatar">{{ (user?.name || user?.nombre) ? (user.name || user.nombre).charAt(0).toUpperCase() : 'U' }}</div>
                  <div class="status-dot"></div>
                </div>
              </div>

            <!-- Dropdown Menu -->
            <div class="dropdown-menu" :class="{ 'show': isDropdownOpen }">
              <RouterLink to="/perfil" class="dropdown-item">
                <User :size="18" />
                <span>Perfil</span>
              </RouterLink>
              <RouterLink to="/logros" class="dropdown-item">
                <Medal :size="18" />
                <span>Logros</span>
              </RouterLink>
              <RouterLink to="/configuracion" class="dropdown-item">
                <Settings :size="18" />
                <span>Ajustes</span>
              </RouterLink>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item text-danger" @click="handleLogout">
                <LogOut :size="18" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- CONTENT AREA -->
      <div class="router-view-container">
        <PageLoader :loading="isLoading" />
        <RouterView v-slot="{ Component }">
          <transition name="fade-page" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>

      <!-- FOOTER -->
      <footer class="app-footer">
        COPYRIGHT © 2026 <strong>Promolider</strong>, Todos los Derechos Reservados
      </footer>
    </main>

    <!-- OPC Modal -->
    <div v-if="isOpcModalOpen" class="opc-modal-overlay">
      <div class="opc-modal-container">
        <div class="opc-modal-header">
          <h2>Recomprar OPC</h2>
          <button @click="closeOpcModal" class="opc-modal-close">
            <X :size="24" />
          </button>
        </div>
        
        <div class="opc-modal-body">
          <p class="opc-modal-description">
            Selecciona la cantidad de cuotas (meses) que deseas pagar por adelantado para el mantenimiento de tu plataforma.
          </p>
          <div class="opc-countdown-container" v-if="timeLeft">
            <h3 class="countdown-title">Tiempo restante para la expiración de su estado activo</h3>
            <div class="countdown-boxes">
              <div class="countdown-box">
                <span class="countdown-value">{{ timeLeft.days }}</span>
                <span class="countdown-label">Días</span>
              </div>
              <span class="countdown-separator">:</span>
              <div class="countdown-box">
                <span class="countdown-value">{{ timeLeft.hours }}</span>
                <span class="countdown-label">Horas</span>
              </div>
              <span class="countdown-separator">:</span>
              <div class="countdown-box">
                <span class="countdown-value">{{ timeLeft.minutes }}</span>
                <span class="countdown-label">Minutos</span>
              </div>
              <span class="countdown-separator">:</span>
              <div class="countdown-box">
                <span class="countdown-value">{{ timeLeft.seconds }}</span>
                <span class="countdown-label">Segundos</span>
              </div>
            </div>
          </div>
          
          <div class="opc-counter-section">
            <label>Cantidad de Cuotas</label>
              <div class="opc-counter">
                <button @click="cuotasToPay = Math.max(1, cuotasToPay - 1)" class="counter-btn" :disabled="cuotasToPay <= 1">
                  <Minus :size="18" />
                </button>
                <div class="counter-display">
                  {{ cuotasToPay }}
                </div>
                <button @click="cuotasToPay = Math.min(maxOpcCuotas, cuotasToPay + 1)" class="counter-btn" :disabled="cuotasToPay >= maxOpcCuotas">
                  <Plus :size="18" />
                </button>
              </div>
              <small class="text-muted d-block mt-2" v-if="maxOpcCuotas > 0">
                Puedes pagar un máximo de {{ maxOpcCuotas }} cuotas.
              </small>
              <small class="text-warning d-block mt-2" v-else>
                Has alcanzado el límite máximo de cuotas permitidas para tu membresía actual.
              </small>
            </div>
            
            <div class="opc-payment-method mt-4">
              <label>Método de Pago</label>
              <select v-model="opcPaymentMethod" class="form-control">
                <option value="openpay">Tarjeta de crédito / débito</option>
                <option value="wallet">Mi Billetera</option>
              </select>
            </div>
          
          <div v-if="opcError" class="opc-error">
            {{ opcError }}
          </div>
        </div>

          <div class="opc-modal-footer">
            <button @click="closeOpcModal" class="opc-btn-cancel">
              Cancelar
            </button>
            <button @click="handleOpcPayment" :disabled="isOpcLoading || maxOpcCuotas === 0" class="opc-btn-submit">
              <Loader2 v-if="isOpcLoading" class="animate-spin opc-loader" :size="18" />
              <span>{{ isOpcLoading ? 'Procesando...' : (opcPaymentMethod === 'wallet' ? 'Pagar con Billetera' : 'Pagar con Tarjeta') }}</span>
            </button>
          </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/features/auth/stores/authStore';
import api from '@/services/apiClient';
import PageLoader from '@/components/PageLoader.vue';
import AnimatedButton from '@/components/AnimatedButton.vue';
import { globalLoading } from '@/utils/loaderState';
import { ElMessage } from 'element-plus';
import 'element-plus/theme-chalk/el-message.css';


const isLoading = computed(() => globalLoading.value > 0);
import { 
  LayoutDashboard, UserPlus, Database, MonitorPlay, Star, Send, PieChart, ChevronRight, ChevronDown, Menu, 
  Search, Bell, Moon, Sun, Award, Apple, User, Medal, Settings, LogOut, Loader2,
  BookOpen, Store, Users, Bot, Wallet, X, Minus, Plus
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const getAvatarUrl = (photoPath) => {
  if (!photoPath) return '';
  if (photoPath.startsWith('http')) return photoPath;
  return `https://promolider-storage-user.s3.sa-east-1.amazonaws.com/${photoPath}`;
};

const isSidebarCollapsed = ref(false);
const isDropdownOpen = ref(false);
const marketingExpanded = ref(route.path.startsWith('/marketing'));
const reportesExpanded = ref(route.path.includes('billetera') || route.path.includes('mis-compras') || route.path.includes('mis-ventas') || route.path.includes('bono-rango'));
const carteraExpanded = ref(route.path.includes('billetera') || route.path.includes('mis-compras') || route.path.includes('mis-ventas'));
const bonoRangoExpanded = ref(route.path.includes('bono-rango'));

const topbarStats = ref({
  credits: 0,
  rank: { name: 'Cargando...', icon: null, level: 0 },
  points: { total: 0, percentage: 0 },
  notifications: { unread: 0 }
});

// Real-time Toast State
const showToast = ref(false);
const toastTitle = ref('');
const toastBody = ref('');
const toastImage = ref('');

const loadTopbarStats = async () => {
  try {
    const response = await api.get('/dashboard/topbar-stats');
    if (response.data && response.data.data) {
      topbarStats.value = response.data.data;
    }
  } catch (error) {
    console.error("Error cargando stats del topbar:", error);
  }
};

const toggleDropdown = (e) => {
  e.stopPropagation();
  isDropdownOpen.value = !isDropdownOpen.value;
  isNotificationsOpen.value = false; // Close notifications if open
};

// --- Aula Virtual Dropdown State ---
const isAulaOpen = ref(false);

// --- Aula Virtual Navigation Items ---
const aulaVirtualItems = [
  {
    to: '/infoproducts',
    label: 'Infoproductos',
    icon: BookOpen,
    slug: 'infoproducts.index'
  },
  {
    to: '/marketplace',
    label: 'Marketplace',
    icon: Store,
    slug: 'marketplace.toggle'
  },
  {
    to: '/course/subscriber',
    label: 'Suscriptores',
    icon: Users,
    slug: 'courses.subs'
  },
  {
    to: '/chatgpt',
    label: 'ChatGPT',
    icon: Bot,
    slug: 'chatgpt.index'
  }
];

const isAulaActive = computed(() => {
  return aulaVirtualItems.some(item => {
    return route.path === item.to || route.path.startsWith(`${item.to}/`);
  });
});

const toggleAula = () => {
  if (isSidebarCollapsed.value) {
    isSidebarCollapsed.value = false;
    isAulaOpen.value = true;
    return;
  }

  isAulaOpen.value = !isAulaOpen.value;
};

const isSubItemActive = (path) => {
  if (path === '/course') {
    return route.path === '/course';
  }

  return route.path === path || route.path.startsWith(`${path}/`);
};

// --- Notifications Dropdown State ---
const isNotificationsOpen = ref(false);
const notificationsList = ref([]);
const isLoadingNotifications = ref(false);

const fetchNotifications = async () => {
  if (notificationsList.value.length > 0) return; // Ya cargadas (puedes optar por siempre recargar)
  isLoadingNotifications.value = true;
  try {
    const response = await api.get('/notifications/list');
    notificationsList.value = response.data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
  } finally {
    isLoadingNotifications.value = false;
  }
};

const toggleNotifications = async (e) => {
  e.stopPropagation();
  isNotificationsOpen.value = !isNotificationsOpen.value;
  isDropdownOpen.value = false; // Close user dropdown if open
  
  if (isNotificationsOpen.value) {
    await fetchNotifications();
    // Opcional: marcar como leídas llamando a /notifications/update
    if (topbarStats.value.notifications.unread > 0) {
       topbarStats.value.notifications.unread = 0;
       api.put('/notifications/update').catch(err => console.log(err));
    }
  }
};

// Cerrar dropdown si se hace clic fuera
const closeDropdown = () => {
  isDropdownOpen.value = false;
  isNotificationsOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};

// Tema Oscuro / Claro
const isDarkTheme = ref(false);

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  if (isDarkTheme.value) {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  }
};

const listenNotifications = () => {
  // Listo para implementar con Echo cuando se requieran notificaciones en tiempo real
  // La inicialización de Echo ya está en main.js
};

const isOpcActive = computed(() => {
  if (!user.value) return false;
  
  if (user.value.expiration_date) {
    let dateStr = user.value.expiration_date;
    if (!dateStr.includes('T')) dateStr = dateStr.replace(' ', 'T');
    if (!dateStr.endsWith('Z')) dateStr += 'Z';
    const expiration = new Date(dateStr).getTime();
    if (expiration > new Date().getTime()) {
      return true;
    }
  }
  
  return false; // Fallback
});

  // --- OPC Modal State ---
  const isOpcModalOpen = ref(false);
  const cuotasToPay = ref(1);
  const isOpcLoading = ref(false);
  const opcError = ref('');
  const opcPaymentMethod = ref('openpay');
  
  // Calcular tope maximo de cuotas
  const maxOpcCuotas = computed(() => {
    if (!user.value || !user.value.expiration_membership_date || !user.value.expiration_date) return 12;
    
    let mStr = user.value.expiration_membership_date;
      if (!mStr.includes('T')) mStr = mStr.replace(' ', 'T');
      if (!mStr.endsWith('Z')) mStr += 'Z';
    const mEnd = new Date(mStr);
    let oStr = user.value.expiration_date;
      if (!oStr.includes('T')) oStr = oStr.replace(' ', 'T');
      if (!oStr.endsWith('Z')) oStr += 'Z';
    const oEnd = new Date(oStr);
    
    if (oEnd >= mEnd) return 0;
    
    let months = (mEnd.getFullYear() - oEnd.getFullYear()) * 12;
    months -= oEnd.getMonth();
    months += mEnd.getMonth();
    
    return Math.max(0, months);
  });

// --- OPC Countdown Timer ---
const timeLeft = ref(null);
let countdownInterval = null;

const calculateTimeLeft = () => {
  if (!user.value || !user.value.expiration_date) return null;
  
  let dateStr = user.value.expiration_date;
      if (!dateStr.includes('T')) dateStr = dateStr.replace(' ', 'T');
      if (!dateStr.endsWith('Z')) dateStr += 'Z';
    const expiration = new Date(dateStr).getTime();
  const now = new Date().getTime();
  const distance = expiration - now;
  
  if (distance < 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00', expired: true };
  }
  
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
  return {
    days: days.toString().padStart(2, '0'),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
    expired: false
  };
};

const updateCountdown = () => {
  timeLeft.value = calculateTimeLeft();
};

const openOpcModal = () => {
  cuotasToPay.value = Math.min(1, maxOpcCuotas.value);
  opcError.value = '';
  opcPaymentMethod.value = 'openpay';
  isOpcModalOpen.value = true;
  updateCountdown();
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(updateCountdown, 1000);
};

const closeOpcModal = () => {
  isOpcModalOpen.value = false;
  if (countdownInterval) clearInterval(countdownInterval);
};

const handleOpcPayment = async () => {
  if (maxOpcCuotas.value === 0) {
      opcError.value = "No puedes pagar más cuotas porque ya alcanzaste el límite de tu membresía.";
      return;
  }

  isOpcLoading.value = true;
  opcError.value = '';
  
  try {
    if (opcPaymentMethod.value === 'wallet') {
      const response = await api.post('/opc/purchase-wallet', { cuotas: cuotasToPay.value });
      if (response.data && response.data.success) {
          ElMessage.success(response.data.message || 'Mantenimiento OPC pagado exitosamente');
          await authStore.fetchUser();
          
          // Re-evaluar limite
          if (maxOpcCuotas.value === 0) {
              closeOpcModal();
          } else {
              cuotasToPay.value = 1;
              updateCountdown();
          }
      } else {
          throw new Error('Respuesta inválida del servidor');
      }
    } else {
      const response = await api.post('/opc/init-payment', { cuotas: cuotasToPay.value });
      
      if (response.data && response.data.data && response.data.data.payment_url) {
        window.location.href = response.data.data.payment_url;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    }
  } catch (error) {
    console.error('Error iniciando pago OPC:', error);
    opcError.value = error.response?.data?.message || 'Hubo un error al iniciar el pago. Inténtalo de nuevo.';
  } finally {
    isOpcLoading.value = false;
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDarkTheme.value = true;
    document.body.classList.add('dark-theme');
  }
  
  // Siempre recargar datos del usuario para mantener actualizada la info
  authStore.fetchUser();

  listenNotifications();

  // Auto-expand sección Marketing al navegar dentro de /marketing
  watch(() => route.path, (path) => {
    marketingExpanded.value = path.startsWith('/marketing');
  }, { immediate: true });

  // Cargar estadísticas
  loadTopbarStats();

  // Event listener para el dropdown
  window.addEventListener('click', closeDropdown);
});

onBeforeUnmount(() => {
  if (countdownInterval) clearInterval(countdownInterval);
  window.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
.initials-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  font-weight: 700;
  border-radius: 50%;
  font-size: 1rem;
}

.nav-parent {
  width: 100%;
  border: none;
  background: transparent;
  font: inherit;
  cursor: pointer;
  text-align: left;
}

.nav-chevron {
  transition: transform 0.2s ease;
}

.nav-group.open .nav-chevron {
  transform: rotate(90deg);
}

.nav-group.active > .nav-parent {
  color: var(--primary-color);
}

.submenu {
  margin-left: 34px;
  margin-top: 4px;
  margin-bottom: 6px;
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.68);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.submenu-item:hover {
  color: #ffffff;
  background: rgba(0, 255, 0, 0.08);
}

.submenu-item.active {
  color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
}

.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.nav-section {
  display: flex;
  flex-direction: column;
}

.nav-section-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  color: var(--sidebar-link);
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-section-toggle:hover {
  background-color: var(--sidebar-hover-bg);
  color: var(--white);
}

.nav-section-toggle.expanded {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--white);
}

.nav-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-arrow {
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.nav-arrow.rotated {
  transform: rotate(180deg);
}

.nav-submenu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 14px;
  margin: 2px 0 4px 14px;
  border-left: 2px solid rgba(255, 255, 255, 0.08);
}

.nav-subitem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  color: var(--sidebar-link);
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
  border-radius: 6px;
  transition: all 0.2s ease;
  opacity: 0.85;
}

.nav-subitem:hover {
  background-color: var(--sidebar-hover-bg);
  color: var(--white);
  opacity: 1;
}

.nav-subitem.active {
  color: var(--primary-color);
  font-weight: 600;
  opacity: 1;
  background-color: rgba(24, 214, 0, 0.08);
}

.submenu-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.5;
  flex-shrink: 0;
  transition: all 0.2s;
}

.nav-subitem.active .submenu-dot {
  opacity: 1;
  box-shadow: 0 0 6px var(--primary-color);
}

/* OPC Status Badge */
.opc-status-container {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.status-indicator.is-active {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
}

.status-indicator.is-active .status-dot {
  background-color: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.status-indicator.is-inactive {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.status-indicator.is-inactive .status-dot {
  background-color: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

/* Animations */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

/* Submenu animation */
.submenu-slide-enter-active {
  transition: all 0.25s ease-out;
  overflow: hidden;
}
.submenu-slide-leave-active {
  transition: all 0.2s ease-in;
  overflow: hidden;
}
.submenu-slide-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
}
.submenu-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
}
.submenu-slide-enter-to,
.submenu-slide-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

.nav-subsection {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.nav-subsection-toggle {
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
}

.nav-subsection-toggle .nav-label {
  flex: 1;
  text-align: left;
  margin-left: 10px;
}

.nav-subsection-toggle .nav-arrow {
  margin-left: auto;
}

.nav-sub-submenu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-left: 1px dashed rgba(255, 255, 255, 0.08);
  margin-left: 20px;
  padding-left: 10px;
}

.nav-subitem-deep {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  color: var(--sidebar-link);
  text-decoration: none;
  font-size: 12.5px;
  font-weight: 400;
  border-radius: 6px;
  transition: all 0.2s ease;
  opacity: 0.8;
}

.nav-subitem-deep:hover {
  background-color: var(--sidebar-hover-bg);
  color: var(--white);
  opacity: 1;
}

.nav-subitem-deep.active {
  color: var(--primary-color);
  font-weight: 600;
  opacity: 1;
  background-color: rgba(24, 214, 0, 0.05);
}

.nav-subitem-deep.active .submenu-dot {
  opacity: 1;
  box-shadow: 0 0 6px var(--primary-color);
}

/* Page Transitions */
.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* OPC Modal Styles */
.opc-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.opc-modal-container {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

@keyframes modal-pop {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.opc-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.opc-modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-bold);
}

.opc-modal-close {
  background: transparent;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  padding: 0;
  display: flex;
  transition: color 0.2s;
}

.opc-modal-close:hover {
  color: var(--primary-color);
}

.opc-modal-body {
  padding: 1.5rem;
}

.opc-modal-description {
  margin: 0 0 1.25rem 0;
  font-size: 0.9rem;
  color: var(--text-main);
  line-height: 1.5;
}

.opc-countdown-container {
  margin-bottom: 1.5rem;
  text-align: center;
}

.countdown-title {
  font-size: 0.85rem;
  color: var(--text-main);
  margin-bottom: 0.75rem;
}

.countdown-boxes {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.countdown-box {
  background-color: var(--main-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem 0.5rem;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.countdown-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-bold);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.countdown-label {
  font-size: 0.65rem;
  color: var(--text-main);
  text-transform: uppercase;
}

.countdown-separator {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-bold);
  padding-bottom: 1rem;
}

.opc-counter-section label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-bold);
  margin-bottom: 0.75rem;
}

.opc-counter {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.counter-btn {
  background-color: var(--main-bg);
  border: 1px solid var(--border-color);
  color: var(--text-bold);
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.counter-btn:hover {
  background-color: var(--border-color);
  color: var(--primary-color);
}

.counter-display {
  flex: 1;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-bold);
  background-color: var(--main-bg);
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  border-radius: 12px;
}

.opc-error {
  margin-top: 1.5rem;
  padding: 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
}

.opc-modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--main-bg);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.opc-btn-cancel {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.opc-btn-cancel:hover {
  color: var(--text-bold);
  background-color: var(--border-color);
}

.opc-btn-submit {
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.opc-btn-submit:hover:not(:disabled) {
  background-color: #0c9b6b; /* Lighter shade based on Promolider green */
}

.opc-btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.opc-loader {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.opc-payment-method select { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--main-bg); color: var(--text-main); font-size: 1rem; }
</style>

