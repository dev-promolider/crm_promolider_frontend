<template>
    <div class="dashboard-page">
        <header class="page-header">
            <div>
                <h1>Infoproductos</h1>
                <p>Administra tus cursos, libros y contenido digital.</p>
            </div>

            <div v-if="hasPermission" class="page-actions">
                <RouterLink
                    :to="{ name: 'courses.create' }"
                    class="btn-primary"
                >
                    Crear curso
                </RouterLink>

                <RouterLink
                    :to="{ name: 'books.create' }"
                    class="btn-primary"
                >
                    Crear libro
                </RouterLink>
            </div>
        </header>

        <InfoproductsTable
            v-if="hasPermission && user"
            :user="user"
        />

        <InfoproductRequest v-else-if="!hasPermission && !isCheckingPermission" />

        <div v-else class="loading-box">
            Cargando información...
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/features/auth/stores/authStore';

import InfoproductsTable from '../components/InfoproductsTable.vue';
import InfoproductRequest from '../components/InfoproductRequest.vue';

const authStore = useAuthStore();

const isCheckingPermission = ref(true);

const user = computed(() => authStore.user);
console.log('user', user.value);

/* const hasPermission = computed(() => {
  if (!user.value) return false;

  if (user.value.course_permission === true) return true;
  if (user.value.can_manage_courses === true) return true;
  if (user.value.can_create_infoproducts === true) return true;

  const permissions = user.value.permissions || [];

  return permissions.some((permission) => {
    const value = permission.slug || permission.name || permission;

    return [
      'courses.index',
      'courses.create',
      'courses.manage',
    ].includes(value);
  });
}); */

const hasPermission = true; // Temporal, para que no se bloquee la vista mientras ajustas la validación de permisos.

onMounted(async () => {
  if (!user.value) {
    await authStore.fetchUser();
  }

  isCheckingPermission.value = false;
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
  margin-top: 6px;
  color: var(--text-muted);
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  background: var(--primary-color);
  color: white;
  font-weight: 700;
  text-decoration: none;
  border: none;
  cursor: pointer;
}

.loading-box {
  padding: 30px;
  border-radius: 14px;
  background: var(--card-bg);
  color: var(--text-muted);
}
</style>