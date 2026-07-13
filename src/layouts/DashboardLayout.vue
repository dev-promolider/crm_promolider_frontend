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
          <RouterLink to="/" class="nav-item" active-class="active">
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

          <RouterLink to="/cursos" class="nav-item" active-class="active">
            <MonitorPlay :size="20" />
            <span v-if="!isSidebarCollapsed">Aula virtual</span>
            <ChevronRight v-if="!isSidebarCollapsed" :size="16" class="ml-auto opacity-50" />
          </RouterLink>

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

          <RouterLink to="/reportes" class="nav-item" active-class="active">
            <PieChart :size="20" />
            <span v-if="!isSidebarCollapsed">Reportes</span>
            <ChevronRight v-if="!isSidebarCollapsed" :size="16" class="ml-auto opacity-50" />
          </RouterLink>
        </nav>
      </div>

      <div class="sidebar-bottom" v-if="!isSidebarCollapsed">
        <button class="recomprar-btn">Recomprar OPC</button>
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
              <img v-if="topbarStats.rank.icon" :src="topbarStats.rank.icon" alt="Rango" style="width:20px; height:20px; object-fit:contain;" />
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

          <!-- User Profile & Dropdown -->
          <div class="user-dropdown-container" @click="toggleDropdown">
            <div class="user-info">
              <div class="user-text text-right">
                <span class="user-name">{{ user?.name || user?.nombre || 'Cargando...' }} {{ user?.last_name || user?.apellido || '' }}</span>
                <span class="user-role">{{ user?.account_type?.name || user?.role || 'University' }}</span>
              </div>
              <div class="user-avatar">
                <img v-if="user?.photo || user?.avatar" :src="user.photo || user.avatar" alt="Avatar" />
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
        <RouterView />
      </div>

      <!-- FOOTER -->
      <footer class="app-footer">
        COPYRIGHT © 2026 <strong>Promolider</strong>, Todos los Derechos Reservados
      </footer>
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/features/auth/stores/authStore';
import api from '@/services/apiClient';
import { 
  LayoutDashboard, UserPlus, Database, MonitorPlay, Star, Send, PieChart, ChevronRight, ChevronDown, Menu, 
  Search, Bell, Moon, Sun, Award, Apple, User, Medal, Settings, LogOut, Loader2
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const isSidebarCollapsed = ref(false);
const isDropdownOpen = ref(false);
const marketingExpanded = ref(route.path.startsWith('/marketing'));

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

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDarkTheme.value = true;
    document.body.classList.add('dark-theme');
  }
  
  // Si no hay datos del usuario (ej. al hacer F5), recargarlos
  if (!user.value) {
    authStore.fetchUser();
  }

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
</style>

