<template>
  <div class="vertical-layout vertical-menu-modern 2-columns navbar-floating footer-static menu-expanded"
       data-menu="vertical-menu-modern" data-col="2-columns">
    
    <!-- Sidebar / Menú Principal -->
    <div class="main-menu menu-fixed menu-dark menu-accordion menu-shadow" data-scroll-to-active="true">
      <div class="navbar-header">
        <ul class="nav navbar-nav flex-row">
          <li class="nav-item mr-auto">
            <a class="navbar-brand" href="/">
               <span class="brand-logo">
                 <img src="/images/logo/promolider_logo.png" style="margin-left: 40px; min-width: 130px; width: 100%;">
               </span>
            </a>
          </li>
          <li class="nav-item nav-toggle">
            <a class="nav-link modern-nav-toggle pr-0" @click.prevent="toggleMenu">
              <i class="d-none d-xl-block collapse-toggle-icon font-medium-4 text-primary" data-feather="sidebar"></i>
              <i class="d-block d-xl-none text-primary toggle-icon font-medium-4" data-feather="x"></i>
            </a>
          </li>
        </ul>
      </div>
      <div class="shadow-bottom"></div>
      <div class="main-menu-content">
        <ul class="navigation navigation-main" id="main-menu-navigation" data-menu="menu-navigation">
          
          <li class="nav-item" :class="{ active: $route.path === '/dashboard' }">
             <router-link to="/dashboard" class="d-flex align-items-center">
                 <i data-feather="home"></i>
                 <span class="menu-title text-truncate">Dashboard</span>
             </router-link>
          </li>
          
          <li class="nav-item">
             <a href="#" class="d-flex align-items-center">
                 <i data-feather="book"></i>
                 <span class="menu-title text-truncate">Cursos</span>
             </a>
          </li>

          <li class="nav-item">
             <a href="#" class="d-flex align-items-center">
                 <i data-feather="users"></i>
                 <span class="menu-title text-truncate">Marketing</span>
             </a>
          </li>

          <li class="nav-item">
             <a href="#" class="d-flex align-items-center">
                 <i data-feather="credit-card"></i>
                 <span class="menu-title text-truncate">Billetera</span>
             </a>
          </li>

          <li class="nav-item">
             <a href="#" class="d-flex align-items-center">
                 <i data-feather="settings"></i>
                 <span class="menu-title text-truncate">Configuración</span>
             </a>
          </li>

        </ul>
      </div>
    </div>

    <!-- Navbar Superior -->
    <nav class="header-navbar navbar navbar-expand-lg align-items-center floating-nav navbar-light navbar-shadow">
      <div class="navbar-container d-flex content">
        <div class="bookmark-wrapper d-flex align-items-center">
          <ul class="nav navbar-nav d-xl-none">
             <li class="nav-item"><a class="nav-link menu-toggle" @click.prevent="toggleMenu"><i class="ficon" data-feather="menu"></i></a></li>
          </ul>
        </div>
        
        <ul class="nav navbar-nav align-items-center ml-auto">
          <li class="nav-item dropdown dropdown-user">
             <a class="nav-link dropdown-toggle dropdown-user-link" id="dropdown-user" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <div class="user-nav d-sm-flex d-none">
                   <span class="user-name font-weight-bolder">{{ user?.name || 'Usuario' }} {{ user?.last_name || '' }}</span>
                   <span class="user-status">Socio</span>
                </div>
                <span class="avatar">
                   <img class="round" :src="user?.photo || 'https://cdn-icons-png.flaticon.com/512/625/625288.png'" alt="avatar" height="40" width="40">
                   <span class="avatar-status-online"></span>
                </span>
             </a>
             <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdown-user">
                <a class="dropdown-item" href="#" @click.prevent="logout">
                   <i class="mr-50" data-feather="power"></i> Cerrar Sesión
                </a>
             </div>
          </li>
        </ul>
      </div>
    </nav>

    <!-- BEGIN: Content-->
    <div class="app-content content ">
      <div class="content-overlay"></div>
      <div class="header-navbar-shadow"></div>
      <div class="content-wrapper container-xxl p-0">
        <div class="content-header row">
        </div>
        <div class="content-body">
           <router-view></router-view>
        </div>
      </div>
    </div>
    <!-- END: Content-->

    <div class="sidenav-overlay" @click="toggleMenu" :class="{'show': isMenuOpen}"></div>
    <div class="drag-target"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const user = ref(authStore.user);

const isMenuOpen = ref(false);
const isMenuCollapsed = ref(false);

const toggleMenu = () => {
    isMenuCollapsed.value = !isMenuCollapsed.value;
    const body = document.body;
    
    // Si estamos en movil (ancho < 1200)
    if (window.innerWidth < 1200) {
        isMenuOpen.value = !isMenuOpen.value;
        const menu = document.querySelector('.main-menu');
        if (isMenuOpen.value) {
            menu?.classList.add('menu-open');
            body.classList.add('menu-open');
        } else {
            menu?.classList.remove('menu-open');
            body.classList.remove('menu-open');
        }
    } else {
        if (isMenuCollapsed.value) {
            body.classList.add('menu-collapsed');
            body.classList.remove('menu-expanded');
        } else {
            body.classList.remove('menu-collapsed');
            body.classList.add('menu-expanded');
        }
    }
};

onMounted(() => {
    document.body.className = 'vertical-layout vertical-menu-modern 2-columns navbar-floating footer-static menu-expanded';
    nextTick(() => {
        if (typeof window.feather !== 'undefined') {
            window.feather.replace({
                width: 14,
                height: 14
            });
        }
    });
});

watch(route, () => {
    nextTick(() => {
        if (typeof window.feather !== 'undefined') {
            window.feather.replace({
                width: 14,
                height: 14
            });
        }
    });
});

onUnmounted(() => {
    document.body.className = '';
});

const logout = () => {
    authStore.logout();
    router.push('/login');
};
</script>

<style>
/* Los estilos globales del layout se manejan en Vuexy */
</style>
