<template>
  <div class="dashboard-page layout-split">
    <!-- EDITOR PANEL (LEFT) -->
    <div class="editor-panel">
      <header class="page-header">
        <div>
          <h1>Crear nuevo curso</h1>
          <p>Configura los detalles y previsualiza en vivo.</p>
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
              <label for="title">Título del curso *</label>
              <input type="text" id="title" v-model="form.title" required placeholder="Ej: Curso Avanzado de Marketing" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="id_categories">Categoría *</label>
                <select id="id_categories" v-model="form.id_categories" required>
                  <option value="">Selecciona una categoría</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="language">Idioma *</label>
                <select id="language" v-model="form.language" required>
                  <option value="Español">Español</option>
                  <option value="Inglés">Inglés</option>
                  <option value="Portugués">Portugués</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="description">Descripción breve *</label>
              <textarea id="description" v-model="form.description" rows="2" required placeholder="Una descripción corta que aparecerá en las tarjetas..."></textarea>
            </div>
          </div>

          <div class="form-section">
            <h3>Precios y Detalles</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="price_base">Precio Original (Base sin IGV/IVA) *</label>
                <input type="number" id="price_base" v-model="form.price_base" step="0.01" min="0" required />
              </div>
              <div class="form-group">
                <label for="price">Precio de Venta <small>(Calculado automático +18% IVA)</small></label>
                <input type="number" id="price" :value="calculatedPrice" readonly disabled class="readonly-input" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="old_price">Precio Promocional Tachado <small>(Opcional)</small></label>
                <input type="number" id="old_price" v-model="form.old_price" step="0.01" min="0" placeholder="Ej: 199.99" />
              </div>
              <div class="form-group">
                <label for="course_level_id">Nivel *</label>
                <select id="course_level_id" v-model="form.course_level_id" required>
                  <option value="">Selecciona un nivel</option>
                  <option v-for="level in levels" :key="level.id" :value="level.id">{{ level.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Contenido del curso</h3>
            <div class="form-group">
              <label for="course_about">Acerca del curso *</label>
              <textarea id="course_about" v-model="form.course_about" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label for="will_learn">¿Qué aprenderán? * <small>(Saltos de línea para separar checks)</small></label>
              <textarea id="will_learn" v-model="form.will_learn" rows="4" placeholder="- Punto 1&#10;- Punto 2" required></textarea>
            </div>
            <div class="form-group">
              <label for="prev_knowledge">Conocimientos previos * <small>(Saltos de línea para separar)</small></label>
              <textarea id="prev_knowledge" v-model="form.prev_knowledge" rows="3" placeholder="- Ninguno&#10;- Internet" required></textarea>
            </div>
            <div class="form-group">
              <label for="course_for">¿Para quién es este curso? *</label>
              <textarea id="course_for" v-model="form.course_for" rows="2" required></textarea>
            </div>
          </div>

          <div class="form-section">
            <h3>Este curso incluye (Selecciona lo que aplique)</h3>
            <div class="checkbox-grid">
              <label class="check-label">
                <input type="checkbox" checked disabled /> Video bajo demanda
              </label>
              <label class="check-label">
                <input type="checkbox" :checked="form.includes.includes('resources')" @change="toggleInclude('resources')" /> Recursos descargables
              </label>
              <label class="check-label">
                <input type="checkbox" :checked="form.includes.includes('mobile')" @change="toggleInclude('mobile')" /> Acceso en dispositivos móviles
              </label>
              <label class="check-label">
                <input type="checkbox" v-model="form.certificate" /> Certificado de finalización
              </label>
            </div>
          </div>

          <div class="form-section">
            <h3>Multimedia</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Portada (Imagen) *</label>
                <label for="coverFile" class="custom-file-upload" :class="{ 'has-file': coverFile || coverPreviewUrl }">
                  <div class="upload-icon-wrapper">
                    <ImageIcon v-if="!coverFile && !coverPreviewUrl" class="upload-icon" />
                    <CheckCircle2 v-else class="upload-icon success" />
                  </div>
                  <div class="upload-text">
                    <span v-if="!coverFile && !coverPreviewUrl"><strong>Haz clic para subir</strong> o arrastra una imagen</span>
                    <span v-else-if="!coverFile && coverPreviewUrl">Imagen actual ya cargada (haz clic para cambiar)</span>
                    <span v-else class="file-name">{{ coverFile.name }}</span>
                  </div>
                  <input type="file" id="coverFile" @change="handleCoverUpload" accept="image/*" :required="!isEditing" class="hidden-input" />
                </label>
              </div>
              <div class="form-group">
                <label>Video Promocional</label>
                <label for="promoFile" class="custom-file-upload" :class="{ 'has-file': promoFile || promoPreviewUrl }">
                  <div class="upload-icon-wrapper">
                    <Film v-if="!promoFile && !promoPreviewUrl" class="upload-icon" />
                    <CheckCircle2 v-else class="upload-icon success" />
                  </div>
                  <div class="upload-text">
                    <span v-if="!promoFile && !promoPreviewUrl"><strong>Haz clic para subir</strong> o arrastra un video</span>
                    <span v-else-if="!promoFile && promoPreviewUrl">Video actual ya cargado (haz clic para cambiar)</span>
                    <span v-else class="file-name">{{ promoFile.name }}</span>
                  </div>
                  <input type="file" id="promoFile" @change="handlePromoUpload" accept="video/*, image/*" class="hidden-input" />
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <div v-if="uploadProgress > 0" class="progress-bar-container" style="flex: 1; margin-right: 20px;">
              <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
              <span class="progress-text">{{ uploadProgress }}% Completado</span>
            </div>
            <button type="submit" class="btn-submit btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Curso') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- PREVIEW PANEL (RIGHT) -->
    <div class="preview-panel">
      <div class="preview-header">
        <span class="preview-badge">VISTA PREVIA EN VIVO</span>
      </div>
      <div class="vcr-preview">
        
        <!-- VCR Header Banner -->
        <div class="vcr-banner">
          <div class="vcr-banner-content">
            <h1 class="vcr-title">{{ form.title || 'Título del Curso' }}</h1>
            <p class="vcr-subtitle">{{ form.description || 'Descripción breve...' }}</p>
            <div class="vcr-meta">
              <span class="vcr-bestseller">LO MÁS VENDIDO</span>
              <span class="vcr-rating">5.0 ★★★★★ <small>(0 valoraciones)</small></span>
              <span class="vcr-students">0 estudiantes</span>
            </div>
            <div class="vcr-meta-bottom">
              <p>Creado por <strong>Instructor</strong></p>
              <p>Última actualización: Reciente &bull; {{ form.language }}</p>
            </div>
          </div>
        </div>

        <!-- VCR Body -->
        <div class="vcr-body-wrapper">
          <div class="vcr-body">
            
            <div class="vcr-box" v-if="form.will_learn">
              <h2>Lo que aprenderás</h2>
              <ul class="vcr-checklist">
                <li v-for="(item, index) in parseList(form.will_learn)" :key="index">
                  <CheckCircle2 class="check-icon" size="18" /> <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <div class="vcr-section">
              <h2>Este curso incluye:</h2>
              <ul class="vcr-includes">
                <li><MonitorPlay size="18" /> Video bajo demanda de nivel {{ selectedLevelName }}</li>
                <li v-if="form.includes.includes('resources')"><Download size="18" /> Recursos descargables</li>
                <li v-if="form.includes.includes('mobile')"><Smartphone size="18" /> Acceso en dispositivos móviles</li>
                <li v-if="form.certificate"><Award size="18" /> Certificado de finalización</li>
              </ul>
            </div>

            <div class="vcr-section" v-if="form.prev_knowledge">
              <h2>Requisitos</h2>
              <ul class="vcr-bullets">
                <li v-for="(item, index) in parseList(form.prev_knowledge)" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>
            
            <div class="vcr-section vcr-description-section" v-if="form.description || form.course_about">
              <h2>Descripción</h2>
              <p v-if="form.description">{{ form.description }}</p>
              <br v-if="form.description && form.course_about" />
              <h3 v-if="form.course_about" style="font-size: 15px; margin-bottom: 8px;">Acerca de este curso:</h3>
              <p v-if="form.course_about">{{ form.course_about }}</p>
            </div>

            <div class="vcr-section" v-if="form.course_for">
              <h2>¿A quién está dirigido?</h2>
              <p>{{ form.course_for }}</p>
            </div>

          </div>

          <!-- Floating Buy Card -->
          <div class="vcr-sidebar">
            <div class="vcr-buy-card">
              <div class="vcr-buy-img">
                <template v-if="isPlayingPromo">
                  <video :src="promoPreviewUrl" controls autoplay class="vcr-promo-video" referrerpolicy="no-referrer"></video>
                </template>
                <template v-else>
                  <img v-if="coverPreviewUrl" :src="coverPreviewUrl" alt="Portada" referrerpolicy="no-referrer" />
                  <div v-else class="img-placeholder">Sube una portada</div>
                  
                  <div v-if="promoPreviewUrl" class="play-overlay" @click="isPlayingPromo = true">
                    <PlayCircle class="play-icon" />
                    <span class="play-text">Vista previa de este curso</span>
                  </div>
                </template>
              </div>
              <div class="vcr-buy-body">
                <h2 class="vcr-price">
                  <span v-if="calculatedPrice > 0">${{ calculatedPrice }}</span>
                  <span v-else class="text-success">GRATIS</span>
                  <small v-if="form.old_price > 0" class="old-price">${{ form.old_price }}</small>
                </h2>
                <button class="vcr-btn-primary">Inscribirse ahora</button>
                <ul class="vcr-buy-perks">
                  <li><Zap size="14" /> <strong>Acceso inmediato</strong></li>
                  <li v-if="form.certificate"><Award size="14" /> <strong>Certificado Oficial</strong></li>
                  <li><Lock size="14" /> <strong>Pago Seguro</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { infoproductService } from '../services/infoproductService';
import apiClient from '@/services/apiClient';
import { ElNotification } from 'element-plus';
import { MonitorPlay, Download, Smartphone, Award, Lock, Zap, CheckCircle2, PlayCircle, UploadCloud, ImageIcon, Film } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

const categories = ref([]);
const levels = ref([]);
const isSubmitting = ref(false);
const isEditing = computed(() => !!route.params.id);
const currentCourseId = computed(() => route.params.id);

const form = ref({
  product_type_id: '1', // 1 para Curso
  title: '',
  id_categories: '',
  description: '',
  price_base: 0,
  old_price: '',
  course_level_id: '',
  language: 'Español',
  course_about: '',
  will_learn: '',
  prev_knowledge: 'Ninguno',
  course_for: '',
  includes: ['mobile'],
  certificate: false,
});

const calculatedPrice = computed(() => {
  const base = parseFloat(form.value.price_base) || 0;
  return parseFloat((base * 1.18).toFixed(2));
});

const selectedLevelName = computed(() => {
  if (!form.value.course_level_id) return '...';
  const level = levels.value.find(l => l.id == form.value.course_level_id);
  return level ? level.name : '...';
});

const toggleInclude = (val) => {
  if (form.value.includes.includes(val)) {
    form.value.includes = form.value.includes.filter(i => i !== val);
  } else {
    form.value.includes.push(val);
  }
};

const coverFile = ref(null);
const coverPreviewUrl = ref(null);
const promoFile = ref(null);
const promoPreviewUrl = ref(null);
const isPlayingPromo = ref(false);
const uploadProgress = ref(0);

onMounted(async () => {
  try {
    const catRes = await infoproductService.getCategories();
    categories.value = catRes.data?.data || catRes.data || [];
    
    levels.value = [
      { id: 1, name: 'Principiante' },
      { id: 2, name: 'Intermedio' },
      { id: 3, name: 'Avanzado' },
      { id: 4, name: 'Todos los niveles' }
    ];

    if (isEditing.value) {
      const courseRes = await apiClient.get(`/course/${currentCourseId.value}`);
      const courseData = courseRes.data?.data || courseRes.data;
      if (courseData) {
        form.value = {
          product_type_id: courseData.product_type_id?.toString() || '1',
          title: courseData.title || '',
          id_categories: courseData.id_categories || '',
          description: courseData.description || '',
          price_base: courseData.price_base || 0,
          old_price: courseData.old_price || '',
          course_level_id: courseData.course_level_id || '',
          language: courseData.language || 'Español',
          course_about: courseData.course_about || '',
          will_learn: courseData.will_learn || '',
          prev_knowledge: courseData.prev_knowledge || 'Ninguno',
          course_for: courseData.course_for || '',
          includes: courseData.includes || ['mobile'],
          certificate: courseData.certificate === 1 || courseData.certificate === true,
        };
        if (courseData.url_portada) {
            coverPreviewUrl.value = courseData.url_portada.startsWith('http') 
                ? courseData.url_portada 
                : 'https://promolider-storage-user.s3.amazonaws.com/' + courseData.url_portada;
            console.log('Cover preview URL set to:', coverPreviewUrl.value);
        }
        if (courseData.path_url) {
            promoPreviewUrl.value = courseData.path_url.startsWith('http')
                ? courseData.path_url
                : 'https://promolider-storage-user.s3.amazonaws.com/' + courseData.path_url;
            console.log('Promo preview URL set to:', promoPreviewUrl.value);
        }
      }
    }
  } catch (error) {
    console.error('Error loading options or course data', error);
  }
});

const handleCoverUpload = (event) => {
  if (event.target.files.length > 0) {
    coverFile.value = event.target.files[0];
    coverPreviewUrl.value = URL.createObjectURL(coverFile.value);
  }
};

const handlePromoUpload = (event) => {
  if (event.target.files.length > 0) {
    promoFile.value = event.target.files[0];
    promoPreviewUrl.value = URL.createObjectURL(promoFile.value);
    isPlayingPromo.value = false;
  }
};

const parseList = (text) => {
  if (!text) return [];
  return text.split('\n').map(t => t.replace(/^- /, '').trim()).filter(t => t.length > 0);
};

const submitForm = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  uploadProgress.value = 0;

  const formData = new FormData();
  
  for (const key in form.value) {
    if (key === 'includes') {
      formData.append(key, JSON.stringify(form.value[key]));
    } else {
      formData.append(key, form.value[key]);
    }
  }
  // Append calculated price
  formData.append('price', calculatedPrice.value);
  
  if (coverFile.value) {
    formData.append('file', coverFile.value);
  }
  if (promoFile.value) {
    formData.append('file_video', promoFile.value);
  }

  try {
    const url = isEditing.value ? `/me/infoproducts/${currentCourseId.value}` : '/me/infoproducts';
    const response = await apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      }
    });

    if (response.data?.data?.status === 'ok' || response.data?.status === 'ok' || response.data?.data?.message) {
      ElNotification({
        title: 'Éxito',
        message: isEditing.value ? 'Curso actualizado con éxito.' : 'Curso pre-registrado con éxito. Ahora puedes configurar sus módulos.',
        type: 'success',
      });
      router.push({ name: 'infoproducts' });
    }
  } catch (error) {
    console.error('Error creating course', error);
    const msg = error.response?.data?.message || 'Hubo un error al crear el curso';
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
.layout-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
  padding: 24px;
  height: calc(100vh - 64px);
  overflow: hidden;
}

@media (max-width: 1200px) {
  .layout-split {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }
  .preview-panel {
    display: none;
  }
}

.editor-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;
}

.editor-panel::-webkit-scrollbar { width: 6px; }
.editor-panel::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--text-color);
}
.page-header p {
  margin-top: 6px;
  font-size: 14px;
  color: var(--text-muted);
}

.card {
  background: var(--card-bg, #fff);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid var(--border-color);
}

.form-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color, #eee);
}

.form-section h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
}

.form-row {
  display: flex;
  gap: 16px;
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
  font-size: 13px;
  color: var(--text-color);
}
.form-group small {
  color: var(--text-muted);
  font-weight: 400;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background-color: var(--bg-main);
  color: var(--text-main);
  transition: all 0.2s;
  appearance: auto; /* Fixes blank combo box in some webkit scenarios */
}

/* Specific fix for select options being unreadable */
.form-group select option {
  background-color: var(--bg-main);
  color: var(--text-main);
}

.readonly-input {
  background-color: var(--sidebar-logo-bg) !important;
  cursor: not-allowed;
  opacity: 0.8;
  font-weight: 700;
}

.form-group input:focus:not(:disabled),
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.1);
}

.checkbox-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.custom-file-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-main);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.custom-file-upload:hover {
  border-color: var(--primary-color);
  background-color: rgba(24, 214, 0, 0.02);
}

.custom-file-upload.has-file {
  border-color: var(--primary-color);
  background-color: rgba(24, 214, 0, 0.05);
  border-style: solid;
}

.upload-icon-wrapper {
  margin-bottom: 12px;
  background: var(--card-bg);
  padding: 10px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  width: 24px;
  height: 24px;
  color: var(--text-muted);
}

.upload-icon.success {
  color: var(--primary-color);
}

.upload-text {
  font-size: 13px;
  color: var(--text-color);
  line-height: 1.5;
}

.upload-text strong {
  color: var(--primary-color);
  font-weight: 700;
}

.file-name {
  font-weight: 600;
  color: var(--text-color);
  word-break: break-all;
}

.hidden-input {
  display: none;
}

.btn-primary {
  padding: 10px 24px;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-secondary {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
}

/* PREVIEW PANEL */
.preview-panel {
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border-radius: 14px;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  height: 100%;
  overflow: hidden;
  position: relative;
}

.preview-header {
  padding: 10px 16px;
  background: var(--bg-main);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
}
.preview-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--primary-color);
  background: rgba(24, 214, 0, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.vcr-preview {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-main);
  color: var(--text-color);
}
.vcr-preview::-webkit-scrollbar { width: 6px; }
.vcr-preview::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }

/* VCR Styles */
.vcr-banner {
  background: var(--bg-sidebar, #1a1a1a);
  color: #fff;
  padding: 40px 30px;
}
.vcr-banner-content { max-width: 600px; }
.vcr-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 10px 0;
}
.vcr-subtitle {
  font-size: 15px;
  opacity: 0.8;
  margin-bottom: 16px;
}
.vcr-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  margin-bottom: 16px;
}
.vcr-bestseller {
  background: #f1c40f;
  color: #000;
  padding: 2px 8px;
  font-weight: 800;
  font-size: 11px;
  border-radius: 4px;
}
.vcr-rating { color: #f1c40f; font-weight: 700; }
.vcr-rating small { color: #ccc; }
.vcr-meta-bottom { font-size: 13px; color: #aaa; }
.vcr-meta-bottom p { margin: 4px 0; }

.vcr-body-wrapper {
  display: flex;
  padding: 30px;
  gap: 30px;
  position: relative;
}

.vcr-body { flex: 1; }
.vcr-box {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}
.vcr-box h2, .vcr-section h2 {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 16px 0;
  color: var(--text-color);
}
.vcr-checklist {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.vcr-checklist li {
  font-size: 13px;
  color: var(--text-color);
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.check-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.vcr-includes {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  font-size: 13px;
  margin-bottom: 24px;
}
.vcr-includes li { display: flex; align-items: center; gap: 8px; color: var(--text-color); }
.vcr-includes li svg { color: var(--text-muted); }

.vcr-bullets {
  padding-left: 20px;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.vcr-section { margin-bottom: 24px; }
.vcr-section p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
}
.vcr-description-section {
  padding-top: 10px;
}

.vcr-sidebar {
  width: 260px;
  flex-shrink: 0;
}
.vcr-buy-card {
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  margin-top: -120px;
  z-index: 10;
}
.vcr-buy-img {
  height: 160px;
  background: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}
.vcr-buy-img img { width: 100%; height: 100%; object-fit: cover; }
.vcr-promo-video { width: 100%; height: 100%; object-fit: contain; background: #000; }
.img-placeholder { color: var(--text-muted); font-size: 12px; }

.play-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 0.2s;
}
.play-overlay:hover {
  background: rgba(0,0,0,0.5);
}
.play-icon {
  width: 50px;
  height: 50px;
  fill: #fff;
  color: #333;
  opacity: 0.9;
  margin-bottom: 10px;
}
.play-text {
  font-weight: 700;
  font-size: 14px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.6);
}

.vcr-buy-body { padding: 20px; }
.vcr-price {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 16px 0;
  color: var(--text-color);
}
.old-price {
  font-size: 14px;
  text-decoration: line-through;
  color: var(--text-muted);
  font-weight: 400;
  margin-left: 8px;
}
.vcr-btn-primary {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 800;
  cursor: pointer;
  margin-bottom: 16px;
}
.vcr-buy-perks {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}
.vcr-buy-perks li { margin-bottom: 8px; display: flex; align-items: center; gap: 6px;}
.vcr-buy-perks li svg { color: var(--primary-color); }
.text-success { color: #28a745 !important; }
</style>
