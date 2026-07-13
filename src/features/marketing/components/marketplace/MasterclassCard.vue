<template>
  <div v-if="loading" class="col-12 text-center py-5">
    <div class="spinner-border text-primary" role="status"></div>
    <p class="text-muted mt-2 small">Cargando masterclasses...</p>
  </div>
  <div v-else-if="items.length === 0" class="col-12 text-center py-5">
    <p class="text-muted">No se encontraron masterclasses</p>
  </div>
  <div v-for="item in items" :key="item.id" class="col-md-4 mb-4">
    <div class="card marketplace-card" @click="$emit('view', item)">
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
      <div class="card-body">
        <h5 class="card-title">{{ item.title }}</h5>
        <p class="card-text">
          <strong>Categoría:</strong> {{ item.category_name || '-' }} <br>
          <strong>Fecha:</strong> {{ formatDate(item.date || item.event_date) }}
        </p>
        <span class="badge badge-masterclass">Masterclass</span>
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
.marketplace-card {
  cursor: pointer;
  border-radius: 10px;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  border: 1px solid #e3e8ef;
}
.marketplace-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  transform: translateY(-3px);
}
.card-img-wrapper {
  padding: 16px;
  background: transparent;
}
.card-img-top {
  height: 320px !important;
  object-fit: cover;
  width: 100%;
  border: 20px solid #fff;
  box-shadow: 0 0 8px rgba(0,0,0,0.08);
  border-radius: 10px 10px 0 0;
}
.card-img-placeholder {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 20px solid #fff;
  box-shadow: 0 0 8px rgba(0,0,0,0.08);
  border-radius: 10px 10px 0 0;
}
.card-body {
  flex-grow: 1;
  background: #fff;
  padding: 1.25rem;
  position: relative;
}
.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.3;
}
.card-text {
  font-size: 0.9rem;
  color: #555;
}
.badge-masterclass {
  position: absolute;
  bottom: 12px;
  right: 15px;
  background: #28a745;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
