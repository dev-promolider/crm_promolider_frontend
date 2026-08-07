<template>
  <div class="admin-requests-container">
    <div class="header-card">
      <div class="header-overlay"></div>
      <div class="header-content">
        <h1 class="header-title">Panel de Solicitudes (Admin)</h1>
        <p class="header-desc">Gestiona todas las solicitudes, verificaciones y roles de la plataforma.</p>
      </div>
    </div>

    <div class="tab-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.admin-requests-container {
  max-width: 1200px;
  margin: 0 auto;
}
.header-card {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  border-radius: 12px;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}
.header-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}
.header-desc {
  margin-top: 0.5rem;
  opacity: 0.8;
}
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}
.tabs button {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-muted);
  border-radius: 6px;
  transition: all 0.2s ease;
}
.tabs button:hover {
  background: var(--main-bg);
  color: var(--text-bold);
}
.tabs button.active {
  background: var(--primary-color, #10b981);
  color: white;
}
.tab-content {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
}
</style>
