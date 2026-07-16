<template>
  <template v-if="loading">
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2 small">Cargando masterclasses...</p>
    </div>
  </template>
  <template v-else-if="items.length === 0">
    <div class="col-12 text-center py-5">
      <p class="text-muted">No se encontraron masterclasses</p>
    </div>
  </template>
  <div v-for="item in items" :key="item.id" class="grid-col">
    <div class="marketplace-card" @click="$emit('view', item)">
      <div class="card-img-wrapper">
        <img
          v-if="item.image"
          :src="item.image"
          class="card-img-top"
          :alt="item.title"
        />
        <div v-else class="card-img-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#ccc"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
      <div class="marketplace-card-body">
        <h5 class="marketplace-card-title">{{ item.title }}</h5>
        <p class="marketplace-card-text">
          <strong>Categoría:</strong> {{ item.category_name || '-' }} <br>
          <strong>Fecha:</strong> {{ formatDate(item.date || item.event_date) }}
        </p>
        <div class="marketplace-card-footer">
          <span class="marketplace-badge badge-masterclass">Masterclass</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['view'])
</script>

<style scoped>
.grid-col {
  flex: 0 0 33.333%;
  max-width: 33.333%;
  display: flex;
  padding: 0 12px;
  margin-bottom: 2rem;
}

@media (max-width: 992px) {
  .grid-col {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media (max-width: 768px) {
  .grid-col {
    flex: 0 0 100%;
    max-width: 100%;
  }
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

.marketplace-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  gap: 8px;
}

.marketplace-card-title {
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

.marketplace-card-text {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.5;
  flex: 1;
}

.marketplace-card-footer {
  margin-top: auto;
  padding-top: 8px;
}

.badge-masterclass {
  display: inline-block;
  background: rgba(40, 167, 69, 0.12);
  color: #166534;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
}

body.dark-theme .badge-masterclass {
  background: rgba(40, 167, 69, 0.2);
  color: #4ade80;
}
</style>
