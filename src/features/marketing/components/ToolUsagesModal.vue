<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h5 class="modal-title">
          <MousePointerClick :size="18" class="text-primary"/> 
          Usuarios Interactuando
        </h5>
        <button class="close-btn" @click="$emit('close')"><X :size="18" /></button>
      </div>
      <div class="modal-body p-0">
        <div v-if="loading" class="p-5 text-center">
          <Loader2 class="spinner-icon mx-auto" :size="32" />
          <p class="mt-2 text-muted">Cargando usuarios...</p>
        </div>
        <div v-else-if="usages.length === 0" class="p-5 text-center">
          <p class="text-muted mb-0">Nadie ha interactuado con esta herramienta todavía.</p>
        </div>
        <div v-else class="usages-list">
          <div v-for="usage in usages" :key="usage.id" class="usage-item">
            <div class="user-avatar">{{ usage.user.name.charAt(0).toUpperCase() }}</div>
            <div class="user-info">
              <div class="user-name">{{ usage.user.name }}</div>
              <div class="user-email">{{ usage.user.email }}</div>
            </div>
            <div class="usage-date">
              {{ formatDate(usage.created_at) }}
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { X, MousePointerClick, Loader2 } from 'lucide-vue-next'
import api from '@/services/apiClient'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const loading = ref(true)
const usages = ref([])

onMounted(async () => {
  try {
    const { data } = await api.get(`/marketing/tools/${props.item.type}/${props.item.id}/usages`)
    if (data.success) {
      usages.value = data.data
    }
  } catch (error) {
    console.error('Error fetching usages:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.modal-card {
  background: var(--card-bg, #1e1e1e);
  border: 1px solid var(--border-color, #333); border-radius: 12px;
  width: 90%; max-width: 500px;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--border-color, #333);
}
.modal-title {
  font-size: 16px; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 8px;
}
.close-btn {
  background: none; border: none; color: var(--text-muted, #888); cursor: pointer;
}
.usages-list {
  max-height: 400px; overflow-y: auto;
}
.usage-item {
  display: flex; align-items: center; padding: 15px 20px;
  border-bottom: 1px solid var(--border-color, #333);
}
.usage-item:last-child {
  border-bottom: none;
}
.user-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--primary-color, #3b82f6); color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold; font-size: 16px; margin-right: 15px;
}
.user-info {
  flex-grow: 1;
}
.user-name {
  font-weight: 500; font-size: 14px; margin-bottom: 2px;
}
.user-email {
  font-size: 12px; color: var(--text-muted, #888);
}
.usage-date {
  font-size: 12px; color: var(--text-muted, #888);
}
.modal-footer {
  padding: 15px 20px; border-top: 1px solid var(--border-color, #333);
  display: flex; justify-content: flex-end;
}
.btn-cancel {
  background: transparent; border: 1px solid var(--border-color, #333);
  padding: 6px 16px; border-radius: 6px; cursor: pointer; color: white;
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
