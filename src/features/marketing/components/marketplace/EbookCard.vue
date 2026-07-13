<template>
  <div v-if="loading" class="col-12 text-center py-5">
    <div class="spinner-border text-info" role="status"></div>
    <p class="text-muted mt-2 small">Cargando e-books...</p>
  </div>
  <div v-else-if="items.length === 0" class="col-12 text-center py-5">
    <p class="text-muted">No se encontraron e-books</p>
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
        <span class="badge badge-ebook">E-book</span>
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
.badge-ebook {
  position: absolute;
  bottom: 12px;
  right: 15px;
  background: #00d0e4;
  color: #212529;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
