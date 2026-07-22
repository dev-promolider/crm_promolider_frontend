<template>
  <div class="dashboard-page">
    <header class="page-header">
      <div>
        <h1>Módulos</h1>
        <p v-if="course">
          {{ course.title }}
        </p>
      </div>

      <div class="page-actions">
        <RouterLink
          :to="{ name: 'infoproducts' }"
          class="btn-link"
        >
          Volver a Cursos
        </RouterLink>

        <RouterLink
          v-if="course"
          :to="`/course/exam/${course.id}/create`"
          class="btn-link"
        >
          Crear examen
        </RouterLink>

        <RouterLink
          v-if="course"
          :to="`/course/exam-module/${course.id}/create`"
          class="btn-link"
        >
          Crear examen de módulo
        </RouterLink>

        <RouterLink
          v-if="course"
          :to="`/course/exam-lesson/${course.id}/create`"
          class="btn-link"
        >
          Crear examen de clase
        </RouterLink>
      </div>
    </header>

    <div v-if="isLoading" class="loading-box">
      Cargando módulos...
    </div>

    <!-- <CourseModuleList
      v-else-if="course"
      :course="course"
      :modules="modules"
      @modules-updated="modules = $event"
      @reload="loadModulePage"
    /> -->

    <div v-else class="empty-box">
      No se encontró el curso.
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import CourseModuleList from '@/features/infoproducts/components/course/modules/CourseModuleList.vue';
import { courseModuleService } from '@/features/infoproducts/services/course/courseModuleService';

const route = useRoute();
const courseId = route.params.courseId;

const isLoading = ref(false);
const course = ref(null);
const modules = ref([]);

const loadModulePage = async () => {
    isLoading.value = true;

    try {
        const response = await courseModuleService.getModulePageData(courseId);

        course.value = response.data.course || null;
        modules.value = response.data.modules || [];
    } catch (error) {
        console.error('Error loading module page:', error);
        alert('Error al cargar los módulos del curso.');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadModulePage();
});
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.page-header p {
  margin: 6px 0 0;
  color: var(--text-muted);
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.btn-link {
  padding: 9px 12px;
  border-radius: 10px;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 700;
}

.btn-link:hover {
  background: rgba(0, 255, 0, 0.08);
}

.loading-box,
.empty-box {
  padding: 28px;
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}
</style>