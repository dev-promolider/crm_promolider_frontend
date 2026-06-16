<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="/images/logo/promolider_logo.png" alt="Promolider" class="sidebar-logo-img" />
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/" class="nav-item" active-class="active">
          <span>Dashboard</span>
        </RouterLink>
        <RouterLink to="/cursos" class="nav-item" active-class="active">
          <span>Cursos</span>
        </RouterLink>
        <RouterLink to="/marketing" class="nav-item" active-class="active">
          <span>Marketing</span>
        </RouterLink>
        <RouterLink to="/billetera" class="nav-item" active-class="active">
          <span>Billetera</span>
        </RouterLink>
        <RouterLink to="/configuracion" class="nav-item" active-class="active">
          <span>Configuración</span>
        </RouterLink>
      </nav>

      <div class="sidebar-bottom">
        <button class="recomprar-btn">Recomprar OPC</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="topbar-left"></div>
        <div class="topbar-right">
          <div class="user-info">
            <div class="user-text">
              <span class="user-name">Usuario</span>
              <span class="user-role">Socio</span>
            </div>
            <div class="user-avatar">US</div>
          </div>
        </div>
      </header>

      <div class="router-view-container">
        <!-- AQUÍ SE CARGAN TODAS LAS VISTAS SEGÚN LA URL -->
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>


