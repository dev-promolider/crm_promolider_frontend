<template>
  <div class="dashboard-page">
    <header class="page-header">
      <div>
        <h1>Crear nuevo libro (Ebook)</h1>
        <p>Configura los detalles de tu nuevo libro digital.</p>
      </div>

      <div class="page-actions">
        <RouterLink :to="{ name: 'infoproducts' }" class="btn-secondary">
          Cancelar
        </RouterLink>
      </div>
    </header>

    <div class="card form-card">
      <form @submit.prevent="submitForm">
        
        <div class="form-section">
          <h3>Información General</h3>
          
          <div class="form-group">
            <label for="title">Título del libro *</label>
            <input type="text" id="title" v-model="form.title" required placeholder="Ej: Libro de Marketing" />
          </div>

          <div class="form-group">
            <label for="description">Descripción breve *</label>
            <textarea id="description" v-model="form.description" rows="3" required placeholder="Una descripción corta que aparecerá en las tarjetas..."></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3>Precios y Detalles</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="price_base">Precio Original (Base) *</label>
              <input type="number" id="price_base" v-model="form.price_base" step="0.01" required />
            </div>

            <div class="form-group">
              <label for="price">Precio de Venta *</label>
              <input type="number" id="price" v-model="form.price" step="0.01" required />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Contenido del libro</h3>
          
          <div class="form-group">
            <label for="course_about">Acerca del libro *</label>
            <textarea id="course_about" v-model="form.course_about" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label for="will_learn">¿Qué aprenderán? *</label>
            <textarea id="will_learn" v-model="form.will_learn" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label for="prev_knowledge">Conocimientos previos *</label>
            <textarea id="prev_knowledge" v-model="form.prev_knowledge" rows="2" required></textarea>
          </div>
          <div class="form-group">
            <label for="course_for">¿Para quién es este libro? *</label>
            <textarea id="course_for" v-model="form.course_for" rows="2" required></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3>Multimedia y Opciones</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="coverFile">Portada (Imagen) *</label>
              <input type="file" id="coverFile" @change="handleCoverUpload" accept="image/*" required />
            </div>

            <div class="form-group">
              <label for="promoFile">Video/Imagen Promocional</label>
              <input type="file" id="promoFile" @change="handlePromoUpload" accept="video/*, image/*" />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <div v-if="uploadProgress > 0" class="progress-bar-container" style="flex: 1; margin-right: 20px;">
            <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
            <span class="progress-text">{{ uploadProgress }}% Completado</span>
          </div>
          <button type="submit" class="btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Guardando...' : 'Crear Libro' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/apiClient';
import { ElNotification } from 'element-plus';

const router = useRouter();

const isSubmitting = ref(false);

const form = ref({
  product_type_id: '2', // 2 para Libro
  title: '',
  description: '',
  price_base: 0,
  price: 0,
  course_about: '',
  will_learn: '',
  prev_knowledge: 'Ninguno',
  course_for: '',
  certificate: false,
});

const coverFile = ref(null);
const promoFile = ref(null);

const handleCoverUpload = (event) => {
  if (event.target.files.length > 0) {
    coverFile.value = event.target.files[0];
  }
};

const handlePromoUpload = (event) => {
  if (event.target.files.length > 0) {
    promoFile.value = event.target.files[0];
  }
};

const uploadProgress = ref(0);

const submitForm = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  uploadProgress.value = 0;

  const formData = new FormData();
  for (const key in form.value) {
    formData.append(key, form.value[key]);
  }
  
  if (coverFile.value) {
    formData.append('file', coverFile.value);
  }
  
  if (promoFile.value) {
    formData.append('file_video', promoFile.value);
  }

  try {
    const response = await apiClient.post('/me/infoproducts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        uploadProgress.value = percentCompleted;
      }
    });
    
    if (response.data?.data?.status === 'ok') {
      ElNotification({
        title: 'Éxito',
        message: 'Libro pre-registrado con éxito. Pasará a revisión por un administrador.',
        type: 'success',
      });
      router.push({ name: 'infoproducts' });
    }
  } catch (error) {
    console.error('Error creating book', error);
    const msg = error.response?.data?.message || 'Hubo un error al crear el libro';
    ElNotification({
      title: 'Error',
      message: msg,
      type: 'error',
    });
  } finally {
    isSubmitting.value = false;
    uploadProgress.value = 0;
  }
};
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

.card {
  background: var(--card-bg, #fff);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color, #eee);
}

.form-section h3 {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  background-color: var(--bg-input, #fff);
  color: var(--text-color, #333);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  background: var(--primary-color, #4f46e5);
  color: white;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  background: var(--card-bg, #fff);
  color: var(--text-color, #333);
  font-weight: 700;
  border: 1px solid var(--border-color, #ccc);
  cursor: pointer;
  text-decoration: none;
}

/* Progress bar */
.progress-bar-container {
  background-color: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  height: 38px;
  position: relative;
  display: flex;
  align-items: center;
}

.progress-bar {
  background-color: var(--primary-color);
  height: 100%;
  transition: width 0.2s ease;
}

.progress-text {
  position: absolute;
  width: 100%;
  text-align: center;
  font-size: 13px;
  color: #1e293b;
  font-weight: 700;
  mix-blend-mode: overlay;
}
</style>
