<template>
  <div class="public-trivia">
    <div v-if="store.loading" class="loading">Cargando...</div>

    <div v-else-if="store.error" class="error">
      <p>{{ store.error }}</p>
      <button @click="startTrivia">Reintentar</button>
    </div>

    <!-- Start screen -->
    <div v-else-if="!started" class="trivia-start">
      <h1>{{ store.dinamica?.nombre || 'Trivia' }}</h1>
      <div class="form-group">
        <label>Tu email para identificar tu participación</label>
        <input v-model="email" type="email" required placeholder="tu@email.com" />
      </div>
      <button @click="startTrivia" :disabled="!email">Comenzar Trivia</button>
    </div>

    <!-- Question screen -->
    <div v-else-if="currentQuestion && !finished" class="question-section">
      <div class="progress">
        Pregunta {{ currentNumber }} de {{ totalQuestions }}
      </div>
      <h2>{{ currentQuestion.pregunta }}</h2>

      <div class="options">
        <button
          v-for="(opt, idx) in currentQuestion.opciones"
          :key="idx"
          class="option-btn"
          :disabled="answered"
          @click="handleAnswer(opt)"
        >
          {{ opt }}
        </button>
      </div>

      <div v-if="answerResult" class="answer-feedback" :class="answerResult.is_correct ? 'correct' : 'incorrect'">
        <p v-if="answerResult.is_correct">✅ ¡Correcto! Ganaste {{ answerResult.puntos_obtenidos }} puntos</p>
        <p v-else>❌ Incorrecto. La respuesta era: {{ answerResult.correct_answer }}</p>
        <button v-if="currentNumber < totalQuestions" @click="nextQuestion">Siguiente pregunta</button>
        <button v-else @click="finishTrivia">Ver resultados</button>
      </div>
    </div>

    <!-- Finished screen -->
    <div v-else-if="finished" class="results-section">
      <h2>¡Trivia completada!</h2>
      <p>Gracias por participar.</p>
      <button @click="goToResults">Ver resultados</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDinamicaPublicStore } from '../stores/dinamicaPublicStore'

const route = useRoute()
const router = useRouter()
const store = useDinamicaPublicStore()
const slug = route.params.slug

const email = ref(store.email)
const started = ref(false)
const currentNumber = ref(1)
const answered = ref(false)
const answerResult = ref(null)
const currentQuestion = ref(null)
const finished = ref(false)

const totalQuestions = computed(() => store.triviaConfig?.questions?.length || 0)

onMounted(async () => {
  await store.loadDinamica(slug)
})

async function startTrivia() {
  if (!email.value) return
  store.setEmail(email.value)
  started.value = true
  await loadQuestion()
}

async function loadQuestion() {
  answered.value = false
  answerResult.value = null
  try {
    const q = await store.loadQuestion(slug, currentNumber.value)
    currentQuestion.value = q
  } catch (err) {
    store.error = 'Error al cargar pregunta'
  }
}

async function handleAnswer(opt) {
  if (answered.value) return
  answered.value = true
  try {
    const result = await store.submitAnswer(slug, currentNumber.value, opt)
    answerResult.value = result
  } catch (err) {
    answered.value = false
  }
}

function nextQuestion() {
  currentNumber.value++
  loadQuestion()
}

function finishTrivia() {
  finished.value = true
}

function goToResults() {
  router.push(`/d/${slug}/resultados`)
}
</script>

<style scoped>
.public-trivia { max-width: 700px; margin: 0 auto; padding: 2rem; }
.loading, .error { text-align: center; padding: 2rem; }
.trivia-start { text-align: center; padding: 3rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input { padding: 0.5rem; width: 100%; max-width: 300px; border: 1px solid #ccc; border-radius: 4px; }
.progress { text-align: center; margin-bottom: 1rem; color: #666; }
.question-section h2 { text-align: center; margin-bottom: 2rem; font-size: 1.3rem; }
.options { display: flex; flex-direction: column; gap: 0.75rem; max-width: 400px; margin: 0 auto; }
.option-btn { padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; font-size: 1rem; }
.option-btn:hover:not(:disabled) { border-color: #4f46e5; }
.option-btn:disabled { opacity: 0.5; }
.answer-feedback { text-align: center; padding: 1rem; margin-top: 1rem; border-radius: 8px; }
.answer-feedback.correct { background: #d1fae5; }
.answer-feedback.incorrect { background: #fee2e2; }
.answer-feedback button { margin-top: 0.75rem; background: #4f46e5; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.results-section { text-align: center; padding: 3rem; }
.results-section button { margin-top: 1rem; background: #4f46e5; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; }
button { cursor: pointer; }
</style>
