<template>
  <template v-if="loading">
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-info" role="status"></div>
      <p class="text-muted mt-2 small">Cargando e-books...</p>
    </div>
  </template>
  <template v-else-if="items.length === 0">
    <div class="col-12 text-center py-5">
      <p class="text-muted">No se encontraron e-books</p>
    </div>
  </template>
  <div v-for="item in items" :key="item.id" class="col-md-4 mb-4 grid-col">
    <div class="card marketplace-card" @click="$emit('view', item)">
      <div class="card-img-wrapper">
        <img
          v-if="item.image"
          :src="item.image"
          class="card-img-top"
          :alt="item.title"
        />
        <div v-else class="card-img-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#ccc"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </div>
      </div>
      <div class="card-body">
        <h5 class="card-title">{{ item.title || item.titulo }}</h5>
        <p class="card-text">
          <strong>Autor:</strong> {{ item.author || item.autor || '-' }} <br>
          <strong>Categoría:</strong> {{ item.category_name || '-' }} <br>
          <strong>Páginas:</strong> {{ item.pages || item.paginas || '-' }}
        </p>
        <div class="card-footer-info">
          <span class="badge badge-ebook">E-book</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['view'])
</script>

<style scoped>
.grid-col {
  display: flex;
}

.marketplace-card {
  cursor: pointer;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  backdrop-filter: blur(16px);
}

.marketplace-card:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  transform: translateY(-4px);
  border-color: rgba(24, 214, 0, 0.2);
}

.card-img-wrapper {
  position: relative;
  overflow: hidden;
  height: 200px;
  background: var(--bg-main);
}

.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.4s ease;
}

.marketplace-card:hover .card-img-top {
  transform: scale(1.05);
}

.card-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-main);
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  gap: 8px;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-bold);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-text {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.5;
  flex: 1;
}

.card-footer-info {
  margin-top: auto;
  padding-top: 8px;
}

.badge-ebook {
  display: inline-block;
  background: rgba(0, 208, 228, 0.12);
  color: #0e7490;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
}

body.dark-theme .badge-ebook {
  background: rgba(0, 208, 228, 0.2);
  color: #22d3ee;
}
</style>
