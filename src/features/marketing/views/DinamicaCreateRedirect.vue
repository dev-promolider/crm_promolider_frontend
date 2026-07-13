<template>
  <div class="dinamica-create-redirect">
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Creando {{ tipoLabel }}...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createDinamica } from '../services/marketingService'

const router = useRouter()
const route = useRoute()

const tipo = computed(() => route.params.tipo)
const tipoLabel = computed(() => tipo.value === 'ruleta' ? 'ruleta interactiva' : 'trivia interactiva')

onMounted(async () => {
  try {
    const payload = {
      tipo_dinamica: tipo.value,
      nombre: tipo.value === 'ruleta' ? 'Nueva Ruleta' : 'Nueva Trivia',
      descripcion: '',
      is_public: false,
    }
    const res = await createDinamica(payload)
    const data = res?.data || res || {}
    const dinamicaId = data.dinamica_id || data.id

    if (dinamicaId) {
      const routePath = tipo.value === 'ruleta'
        ? `/marketing/dinamica/${dinamicaId}/specifications`
        : `/marketing/dinamica/${dinamicaId}/trivia`
      router.replace(routePath)
    } else {
      router.replace('/marketing/herramientas')
    }
  } catch {
    router.replace('/marketing/herramientas')
  }
})
</script>

<style scoped>
.dinamica-create-redirect {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
.loading-state {
  text-align: center;
  color: var(--text-muted, #6b7280);
}
.loading-state p {
  margin-top: 16px;
  font-size: 14px;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-color, #e5e7eb);
  border-top-color: var(--primary-color, #18d600);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
