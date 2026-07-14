<template>
  <div class="trivia-results">
    <div v-if="store.loading" class="loading">Cargando resultados...</div>

    <div v-else class="results-content">
      <h1>{{ store.dinamica?.nombre || 'Resultados' }}</h1>
      <h2>Leaderboard</h2>

      <div v-if="store.triviaResults.length" class="leaderboard">
        <div
          v-for="(player, idx) in store.triviaResults"
          :key="idx"
          class="player-row"
          :class="{ 'gold': idx === 0, 'silver': idx === 1, 'bronze': idx === 2 }"
        >
          <span class="position">#{{ idx + 1 }}</span>
          <span class="name">{{ player.nombre }}</span>
          <span class="score">{{ player.total_puntos }} pts</span>
          <span class="correct">{{ player.correctas }}/{{ player.total_respondidas }} correctas</span>
        </div>
      </div>
      <p v-else>No hay resultados disponibles.</p>

      <button @click="goBack" class="back-btn">Volver a la dinámica</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDinamicaPublicStore } from '../stores/dinamicaPublicStore'

const route = useRoute()
const router = useRouter()
const store = useDinamicaPublicStore()
const slug = route.params.slug

onMounted(async () => {
  await store.loadDinamica(slug)
  await store.loadResults(slug)
})

function goBack() {
  router.push(`/d/${slug}`)
}
</script>

<style scoped>
.trivia-results { max-width: 700px; margin: 0 auto; padding: 2rem; }
.loading { text-align: center; padding: 2rem; }
h1 { text-align: center; margin-bottom: 0.5rem; }
h2 { text-align: center; color: #666; margin-bottom: 2rem; }
.leaderboard { display: flex; flex-direction: column; gap: 0.5rem; }
.player-row {
  display: flex; align-items: center; gap: 1rem;
  padding: 1rem; border-radius: 8px; background: #f9fafb;
}
.player-row.gold { background: #fef3c7; border: 2px solid #f59e0b; }
.player-row.silver { background: #f1f5f9; border: 2px solid #94a3b8; }
.player-row.bronze { background: #fff7ed; border: 2px solid #d97706; }
.position { font-weight: bold; font-size: 1.2rem; min-width: 40px; }
.name { flex: 1; font-weight: 500; }
.score { font-weight: bold; color: #4f46e5; }
.correct { color: #666; font-size: 0.9rem; }
.back-btn {
  display: block; margin: 2rem auto 0;
  background: #4f46e5; color: white;
  padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer;
}
</style>
