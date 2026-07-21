<template>
  <div class="mlm-empty-node" :title="`Añadir a ${position}`">
    <svg xmlns="http://www.w3.org/2000/svg" class="mlm-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
    <span class="mlm-empty-text">Nuevo</span>
  </div>
</template>

<script setup>
defineProps({
  position: {
    type: String,
    default: 'Nuevo'
  }
});
</script>

<style scoped>
.mlm-empty-node {
  width: 100px;
  height: 80px;
  border: 2px dashed #4b5563;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.3s ease;
  cursor: pointer;
  background: rgba(15, 23, 42, 0.4);
}

.mlm-empty-node:hover {
  border-color: #10b981;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  transform: scale(1.05);
}

.mlm-empty-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
  transition: transform 0.3s ease;
}

.mlm-empty-node:hover .mlm-empty-icon {
  transform: scale(1.2);
}

.mlm-empty-text {
  font-size: 0.7rem;
  font-weight: 500;
}
</style>
