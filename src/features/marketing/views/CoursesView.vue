<template>
  <div class="courses">
    <div class="page-header">
      <h1>Cursos</h1>
      <div class="tabs">
        <button :class="{ active: tab === 'list' }" @click="tab = 'list'">Lista</button>
        <button :class="{ active: tab === 'modules' }" @click="tab = 'modules'" :disabled="!store.currentCourse">Módulos</button>
        <button :class="{ active: tab === 'progress' }" @click="tab = 'progress'" :disabled="!store.currentCourse">Progreso</button>
        <button :class="{ active: tab === 'games' }" @click="tab = 'games'" :disabled="!store.currentCourse">Juegos</button>
        <button :class="{ active: tab === 'certificates' }" @click="tab = 'certificates'">Certificados</button>
      </div>
    </div>

    <!-- LIST -->
    <div v-if="tab === 'list'" class="tab-content">
      <button class="btn-primary" @click="showForm = true">+ Nuevo Curso</button>
      <div v-if="showForm" class="card form-card">
        <h3>Nuevo Curso</h3>
        <form @submit.prevent="saveCourse">
          <div class="form-group"><label>Título *</label><input v-model="form.title" type="text" required /></div>
          <div class="form-group"><label>Descripción *</label><textarea v-model="form.description" required></textarea></div>
          <div class="form-group"><label>Precio (S/)</label><input v-model.number="form.price" type="number" step="0.01" min="0" /></div>
          <button type="submit" class="btn-primary">Guardar</button>
          <button type="button" class="btn-secondary" @click="showForm = false">Cancelar</button>
        </form>
      </div>

      <div class="card" v-if="store.loading">Cargando...</div>
      <div v-for="course in store.courses" :key="course.id" class="course-card" @click="selectCourse(course.id)">
        <h3>{{ course.title }}</h3>
        <p>{{ course.description?.slice(0, 100) }}...</p>
        <span>S/ {{ course.price || 0 }} | Módulos: {{ course.modules_count || 0 }}</span>
      </div>
    </div>

    <!-- MODULES -->
    <div v-if="tab === 'modules'" class="tab-content">
      <h2>{{ store.currentCourse?.title }} - Módulos</h2>
      <button class="btn-primary" @click="showModuleForm = true">+ Módulo</button>
      <div v-if="showModuleForm" class="card">
        <form @submit.prevent="saveModule">
          <div class="form-group"><label>Nombre *</label><input v-model="moduleForm.name" type="text" required /></div>
          <button type="submit" class="btn-primary">Guardar</button>
          <button type="button" class="btn-secondary" @click="showModuleForm = false">Cancelar</button>
        </form>
      </div>
      <div v-for="mod in store.modules" :key="mod.id" class="module-card">
        <h4 @click="selectModule(mod.id)">{{ mod.name }} ({{ mod.classes_count || 0 }} clases)</h4>
        <button class="btn-sm" @click="editModule(mod)">Editar</button>
        <button class="btn-sm btn-danger" @click="showDeleteConfirm('module', mod.id)">Eliminar</button>
      </div>
    </div>

    <!-- PROGRESS -->
    <div v-if="tab === 'progress'" class="tab-content">
      <h2>Progreso: {{ store.currentCourse?.title }}</h2>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: store.progress.progress + '%' }"></div>
        <span class="progress-text">{{ Math.round(store.progress.progress) }}%</span>
      </div>
      <p>Lecciones completadas: {{ store.completedCount }}</p>
    </div>

    <!-- GAMES -->
    <div v-if="tab === 'games'" class="tab-content">
      <h2>Juegos del Curso</h2>
      <button class="btn-primary" @click="showGameForm = true">+ Juego</button>
      <div v-if="showGameForm" class="card">
        <form @submit.prevent="saveGame">
          <div class="form-group"><label>Nombre *</label><input v-model="gameForm.name" type="text" required /></div>
          <button type="submit" class="btn-primary">Guardar</button>
          <button type="button" class="btn-secondary" @click="showGameForm = false">Cancelar</button>
        </form>
      </div>
      <div v-for="game in store.games" :key="game.id" class="game-card">
        <h4>{{ game.name }}</h4>
        <p>Detalles: {{ game.details_count || 0 }}</p>
        <button class="btn-sm btn-danger" @click="showDeleteConfirm('game', game.id)">Eliminar</button>
      </div>
    </div>

    <!-- CERTIFICATES -->
    <div v-if="tab === 'certificates'" class="tab-content">
      <h2>Certificados</h2>
      <div v-for="cert in store.certificates" :key="cert.id" class="cert-card">
        <p><strong>{{ cert.course?.title }}</strong> - {{ cert.status }}</p>
      </div>
    </div>

    <!-- Confirm Modal & Toast -->
    <ConfirmModal
      :visible="confirm.showConfirm.value"
      :title="confirm.confirmData.value.title"
      :message="confirm.confirmData.value.message"
      :confirm-text="confirm.confirmData.value.confirmText"
      :type="confirm.confirmData.value.type"
      :loading="confirm.confirmLoading.value"
      @confirm="confirm.onConfirm"
      @cancel="confirm.onCancel"
    />
    <ToastNotification
      :toast="toastAlert.toast.value"
      @close="toastAlert.dismiss"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCoursesStore } from '../stores/coursesStore'
import ConfirmModal from '../components/ConfirmModal.vue'
import ToastNotification from '../components/ToastNotification.vue'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'

const store = useCoursesStore()
const tab = ref('list')
const showForm = ref(false)
const form = ref({ title: '', description: '', price: 0 })
const showModuleForm = ref(false)
const moduleForm = ref({ name: '', id_courses: null })
const showGameForm = ref(false)
const gameForm = ref({ name: '', id_courses: null, description: '' })

const confirm = useConfirm()
const toastAlert = useToast()
const deleteTarget = ref({ type: '', id: null })

async function saveCourse() {
  await store.createCourse(form.value)
  showForm.value = false
  form.value = { title: '', description: '', price: 0 }
}

async function selectCourse(id) {
  const res = await store.fetchCourse(id)
  if (res?.success) {
    await store.fetchModules(id)
    await store.fetchProgress(id)
    await store.fetchGames(id)
    await store.fetchRatings(id)
    moduleForm.value.id_courses = id
    gameForm.value.id_courses = id
    tab.value = 'modules'
  }
}

async function saveModule() {
  await store.createModule(moduleForm.value)
  showModuleForm.value = false
  moduleForm.value.name = ''
}

function editModule(mod) {
  moduleForm.value.name = mod.name
  moduleForm.value.id_courses = mod.id_courses
  showModuleForm.value = true
}

async function showDeleteConfirm(type, id) {
  const label = type === 'module' ? 'módulo' : 'juego'
  const ok = await confirm.show({
    title: 'Eliminar ' + label,
    message: '¿Eliminar ' + label + '? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    type: 'danger',
  })
  if (!ok) return
  if (type === 'module') {
    await store.deleteModule(id, store.currentCourse?.id)
    toastAlert.show('Eliminado', 'Módulo eliminado correctamente', 'success')
  } else {
    await store.deleteGame(id, store.currentCourse?.id)
    toastAlert.show('Eliminado', 'Juego eliminado correctamente', 'success')
  }
}

async function saveGame() {
  await store.createGame(gameForm.value)
  showGameForm.value = false
  gameForm.value.name = ''
}

onMounted(() => {
  store.fetchCourses()
  store.fetchCertificates()
  store.fetchTemplates()
})
</script>

<style scoped>
.courses { max-width: 1000px; margin: 0 auto; padding: 1.5rem; }
.page-header h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
.tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.tabs button { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 0.875rem; background: #fff; }
.tabs button.active { background: #2563eb; color: #fff; border-color: #2563eb; }
.tabs button:disabled { opacity: 0.5; cursor: not-allowed; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
.course-card, .module-card, .game-card, .cert-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; cursor: pointer; transition: border-color .15s; }
.course-card:hover { border-color: #2563eb; }
.module-card { cursor: default; display: flex; align-items: center; gap: 1rem; }
.module-card h4 { flex: 1; margin: 0; cursor: pointer; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: .875rem; font-weight: 500; margin-bottom: .375rem; color: #374151; }
.form-group input, .form-group textarea { width: 100%; padding: .5rem .75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: .875rem; box-sizing: border-box; }
.btn-primary, .btn-secondary, .btn-sm, .btn-danger { padding: .5rem 1rem; border: none; border-radius: 6px; font-size: .8125rem; cursor: pointer; margin-right: .5rem; margin-bottom: .5rem; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-secondary { background: #e2e8f0; color: #334155; }
.btn-sm { background: #e2e8f0; color: #334155; padding: .25rem .5rem; }
.btn-danger { background: #dc2626; color: #fff; }
</style>