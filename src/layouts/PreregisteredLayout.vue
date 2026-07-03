<template>
  <div :class="['app-layout', { 'dark-theme': isDarkTheme }]">
    
    <!-- Watermark Logo -->
    <div class="watermark-bg">
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
          <RouterLink to="/mi-dashboard" class="nav-item" exact-active-class="active">
            <LayoutDashboard :size="20" />
            <span v-if="!isSidebarCollapsed">Paneles de control</span>
          </RouterLink>

          <RouterLink to="/mi-dashboard/liderbot" class="nav-item" active-class="active">
            <Bot :size="20" />
            <span v-if="!isSidebarCollapsed">Liderbot</span>
          </RouterLink>

          <RouterLink to="/mi-dashboard/leadboost" class="nav-item" active-class="active">
            <TrendingUp :size="20" />
            <span v-if="!isSidebarCollapsed">LeadBoost</span>
          </RouterLink>

          <RouterLink to="/mi-dashboard/smartfunnel" class="nav-item" active-class="active">
            <Filter :size="20" />
            <span v-if="!isSidebarCollapsed">Smart Funnel con IA</span>
          </RouterLink>

          <RouterLink to="/mi-dashboard/ecomercademico" class="nav-item" active-class="active">
            <GraduationCap :size="20" />
            <span v-if="!isSidebarCollapsed">App E-comer Académico</span>
          </RouterLink>

          <RouterLink to="/mi-dashboard/reportes" class="nav-item" active-class="active">
            <PieChart :size="20" />
            <span v-if="!isSidebarCollapsed">Reportes</span>
          </RouterLink>
        </nav>
      </div>

      <div class="sidebar-bottom" v-if="!isSidebarCollapsed">
        <button class="recomprar-btn">Bloqueo mi posición ahora</button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
      <!-- NAVBAR -->
      <header class="topbar">
        <div class="topbar-left">
          <!-- Search input (Disabled for pre-registration) -->
          <div class="search-box opacity-50">
            <Search :size="18" />
            <input type="text" placeholder="Buscar..." disabled />
          </div>
        </div>
        
        <div class="topbar-right">
          <!-- Dark Mode Toggle -->
          <button class="icon-btn" @click="toggleTheme" title="Cambiar Tema">
            <Moon v-if="!isDarkTheme" :size="20" />
            <Sun v-else :size="20" />
          </button>

          <!-- User Profile (Static for Pre-registration) -->
          <div class="user-dropdown-container">
            <div class="user-info">
              <div class="user-text text-right">
                <span class="user-name">{{ userName }}</span>
                <span class="user-role">{{ userEmail || 'Pre-registrado' }}</span>
              </div>
              <div class="user-avatar">
                <div class="initials-avatar">{{ userInitials }}</div>
              </div>
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
import { ref, onMounted, computed } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { 
  LayoutDashboard, Bot, TrendingUp, Filter, GraduationCap, PieChart, Menu, 
  Search, Moon, Sun
} from 'lucide-vue-next';

const isSidebarCollapsed = ref(false);
const isDarkTheme = ref(false);

const userName = ref('');
const userEmail = ref('');

const userInitials = computed(() => {
  const name = userName.value;
  if (!name || name === 'Invitado') return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

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

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDarkTheme.value = true;
    document.body.classList.add('dark-theme');
  }

  // Hydration logic from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('pr_nombres')) {
    localStorage.setItem('preregistro_nombre', urlParams.get('pr_nombres'));
    if (urlParams.has('pr_correo')) {
       localStorage.setItem('preregistro_correo', urlParams.get('pr_correo'));
    }
  }

  userName.value = localStorage.getItem('preregistro_nombre') || 'Invitado';
  userEmail.value = localStorage.getItem('preregistro_correo') || '';
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
.recomprar-btn {
  width: 100%;
  padding: 10px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
}
.recomprar-btn:hover {
  opacity: 0.9;
}
</style>
