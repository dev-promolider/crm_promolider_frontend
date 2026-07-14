<template>
  <div class="pages-view">
    <div class="card">
      <div class="card-body">
        <template-gallery :user="authStore.user"></template-gallery>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/features/auth/stores/authStore'
import TemplateGallery from '../components/pages/TemplateGallery.vue'

const authStore = useAuthStore()
</script>
