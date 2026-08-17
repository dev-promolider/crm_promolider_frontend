<template>
  <div class="dashboard-page">
    <header class="page-header">
      <div>
        <h1>Contenido del Curso</h1>
        <p v-if="course">
          {{ course.title }}
        </p>
      </div>

      <div class="page-actions">
        <RouterLink :to="{ name: 'infoproducts' }" class="btn-link">
          Volver a Cursos
        </RouterLink>
      </div>
    </header>

    <div v-if="isLoading" class="loading-box">
      Cargando módulos...
    </div>

    <div v-else-if="course" class="curriculum-builder-layout">
      <!-- Módulos (Editor) -->
      <div class="curriculum-builder">
        <draggable 
          v-model="modules" 
          item-key="id" 
          handle=".drag-handle-module" 
          @end="onModuleReorder"
        >
          <template #item="{ element: module, index }">
            <div class="module-card">
              
              <!-- Header Módulo Edición -->
              <div v-if="editingModuleId === module.id" class="module-header edit-mode">
                <input type="text" v-model="editingModuleTitle" class="edit-input" @keyup.enter="updateModule(module)" />
                <div class="edit-actions">
                  <button class="btn-icon text-success" @click="updateModule(module)" title="Guardar"><Save :size="14" /></button>
                  <button class="btn-icon text-danger" @click="editingModuleId = null" title="Cancelar"><X :size="14" /></button>
                </div>
              </div>
              
              <!-- Header Módulo Normal -->
              <div v-else class="module-header" @click.self="toggleModule(module.id)">
                <div class="module-title" @click="toggleModule(module.id)">
                  <GripVertical class="drag-handle-module" title="Arrastrar para reordenar" @click.stop :size="16" />
                  <BookOpen class="module-icon" :size="16" />
                  <strong>Módulo {{ index + 1 }}:</strong> {{ module.name }}
                </div>
                <div class="module-actions">
                  <button class="btn-icon" @click="startEditModule(module)" title="Editar Módulo"><Edit :size="14" /></button>
                  <button class="btn-icon text-danger" @click.stop="requestDeleteModule(module)" title="Eliminar Módulo"><Trash2 :size="14" /></button>
                  <ChevronDown class="chevron" :class="{ 'open': openModules.includes(module.id) }" @click="toggleModule(module.id)" :size="16" />
                </div>
              </div>
              
              <!-- Clases del Módulo (Acordeón) -->
              <div v-if="openModules.includes(module.id)" class="module-content">
                <div v-if="!module.classes || module.classes.length === 0" class="empty-classes">
                  No hay clases en este módulo.
                </div>
                
                <draggable 
                  v-model="module.classes" 
                  item-key="id" 
                  handle=".drag-handle-class"
                  @end="onClassReorder(module)"
                  tag="ul"
                  class="class-list"
                >
                  <template #item="{ element: cls, index: cIndex }">
                    <li class="class-item">
                      
                      <!-- Edición de Clase -->
                      <div v-if="editingClassId === cls.id" class="edit-class-form w-100">
                        <div class="form-group">
                          <label>Título de la clase</label>
                          <input type="text" v-model="editingClassForm.title" />
                        </div>
                        <div class="form-group">
                          <label>Descripción</label>
                          <textarea v-model="editingClassForm.description" rows="2"></textarea>
                        </div>
                        <div class="form-group" v-if="cls.video_url">
                          <label>Video Actual</label>
                          <video controls style="max-width: 100%; max-height: 300px; display: block; border-radius: 8px; margin-bottom: 15px;">
                            <source :src="cls.video_url" type="video/mp4" />
                            Tu navegador no soporta el elemento de video.
                          </video>
                        </div>
                        <div class="form-group">
                          <label>Cambiar Video (Opcional - S3) <span v-if="cls.has_video" class="text-success">(Video actual guardado)</span></label>
                          <input type="file" @change="handleEditVideoUpload" accept="video/*" />
                          <div v-if="editUploadProgress > 0" class="progress-bar-container">
                            <div class="progress-bar" :style="{ width: editUploadProgress + '%' }"></div>
                            <span class="progress-text">{{ editUploadProgress }}%</span>
                          </div>
                        </div>
                        <div class="form-actions">
                          <button class="btn-cancel" @click="editingClassId = null">Cancelar</button>
                          <button class="btn-save" @click="updateClass(cls)" :disabled="isSavingClass">Guardar</button>
                        </div>
                      </div>

                      <!-- Vista de Clase -->
                      <div v-else class="class-view w-100 d-flex justify-content-between align-items-center">
                        <div class="class-info flex items-center">
                          <GripVertical class="drag-handle-class mr-2 text-gray-400 cursor-grab" title="Arrastrar para reordenar" :size="16" />
                          <PlayCircle class="class-icon mr-2 text-green-500" :size="16" />
                          <span class="class-title">{{ cls.name }}</span>
                        </div>
                        <div class="class-actions">
                          <button class="btn-icon" @click="startEditClass(cls)" title="Editar Clase"><Edit :size="14" /></button>
                          <button class="btn-icon text-danger" @click="requestDeleteClass(module.id, cls)" title="Eliminar Clase"><Trash2 :size="14" /></button>
                        </div>
                      </div>
                    </li>
                  </template>
                </draggable>

                <!-- Botón para abrir formulario de clase -->
                <div v-if="!activeClassForm[module.id]" class="add-class-btn" @click="openClassForm(module.id)">
                  + Añadir clase
                </div>

                <!-- Formulario de Clase -->
                <div v-if="activeClassForm[module.id]" class="class-form card">
                  <h4>Nueva Clase</h4>
                  <div class="form-group">
                    <label>Título de la clase *</label>
                    <input type="text" v-model="newClassForm.title" placeholder="Ej: Introducción" required />
                  </div>
                  <div class="form-group">
                    <label>Descripción</label>
                    <textarea v-model="newClassForm.description" rows="2"></textarea>
                  </div>
                  <div class="form-group">
                    <label>Video de la clase (AWS S3) *</label>
                    <input type="file" @change="handleVideoUpload" accept="video/*" required />
                    
                    <!-- Barra de Progreso -->
                    <div v-if="uploadProgress > 0" class="progress-bar-container">
                      <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
                      <span class="progress-text">{{ uploadProgress }}% Completado</span>
                    </div>
                  </div>
                  <div class="form-actions">
                    <button class="btn-cancel" @click="closeClassForm(module.id)">Cancelar</button>
                    <button class="btn-save" @click="saveClass(module.id)" :disabled="isSavingClass">Guardar Clase</button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <!-- Añadir Módulo -->
        <div v-if="!isAddingModule" class="add-module-btn" @click="isAddingModule = true">
          + Añadir nuevo módulo
        </div>

        <!-- Formulario de Módulo -->
        <div v-if="isAddingModule" class="module-form card">
          <h4>Nuevo Módulo</h4>
          <div class="form-group">
            <label>Título del módulo *</label>
            <input type="text" v-model="newModuleTitle" placeholder="Ej: Módulo 1: Fundamentos" @keyup.enter="saveModule" />
          </div>
          <div class="form-actions">
            <button class="btn-cancel" @click="isAddingModule = false">Cancelar</button>
            <button class="btn-save" @click="saveModule" :disabled="!newModuleTitle">Guardar Módulo</button>
          </div>
        </div>
      </div>

      <!-- Resumen (Sidebar Derecha) -->
      <div class="curriculum-summary">
        <h3 class="summary-title">Estructura del Curso</h3>
        <div class="summary-list">
          <div v-for="(module, mIndex) in modules" :key="'sum-'+module.id" class="summary-module">
            <div class="summary-module-header" @click="toggleSummaryModule(module.id)">
              <div class="summary-module-info">
                <span class="summary-module-name">Módulo {{ mIndex + 1 }}: {{ module.name }}</span>
                <span class="summary-module-meta" v-if="module.classes">{{ module.classes.length }} clases</span>
              </div>
              <ChevronDown class="chevron" :class="{ 'open': openSummaryModules.includes(module.id) }" :size="16" />
            </div>
            <div v-if="openSummaryModules.includes(module.id)" class="summary-module-body">
              <div v-if="!module.classes || module.classes.length === 0" class="summary-empty">
                Sin clases o cargando...
              </div>
              <ul v-else class="summary-class-list">
                <li v-for="(cls, cIndex) in module.classes" :key="'sum-cls-'+cls.id" class="summary-class-item">
                  <PlayCircle :size="14" class="mr-2" style="color: var(--primary-color); opacity: 0.8;" />
                  <span class="summary-class-name">{{ cls.name }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Modal de Confirmación de Eliminación -->
    <ModalComponent v-model="isDeleteModalOpen" color="warning" size="small">
      <template #title>
        <div class="flex items-center text-amber-500">
          <AlertTriangle :size="20" class="mr-2" />
          <span>Advertencia</span>
        </div>
      </template>
      <template #body>
        <p class="text-base text-gray-700">
          <span v-if="deleteModalType === 'module'">
            ¿Estás seguro de eliminar el módulo <strong>"{{ itemToDelete?.name }}"</strong> y TODAS sus clases? Esta acción no se puede deshacer.
          </span>
          <span v-else-if="deleteModalType === 'class'">
            ¿Estás seguro de eliminar la clase <strong>"{{ itemToDelete?.cls?.name }}"</strong>? Esta acción no se puede deshacer.
          </span>
        </p>
      </template>
      <template #footer>
        <button class="btn-cancel" @click="isDeleteModalOpen = false">Cancelar</button>
        <button class="btn-save !bg-red-600 hover:!bg-red-700 !border-red-600" @click="confirmDelete">Eliminar</button>
      </template>
    </ModalComponent>
  </div>
</template>


<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { courseModuleService } from '@/features/infoproducts/services/course/courseModuleService';
import apiClient from '@/services/apiClient';
import axios from 'axios';
import draggable from 'vuedraggable';
import { ElMessage } from 'element-plus';
import ModalComponent from '@/components/common/ModalComponent.vue';
import { BookOpen, GripVertical, Edit, Trash2, ChevronDown, Save, X, PlayCircle, UploadCloud, AlertTriangle } from 'lucide-vue-next';

const route = useRoute();
const courseId = route.params.courseId;

const isLoading = ref(false);
const course = ref(null);
const modules = ref([]);
const openModules = ref([]);
const openSummaryModules = ref([]);

// Module Form
const isAddingModule = ref(false);
const newModuleTitle = ref('');

// Edit Module
const editingModuleId = ref(null);
const editingModuleTitle = ref('');

// Edit Class
const editingClassId = ref(null);
const editingClassForm = ref({ title: '', description: '', file: null });

const showAlert = (title, message, type) => {
  ElMessage({ message, type, duration: 3000 });
};

// Delete Modal State
const isDeleteModalOpen = ref(false);
const deleteModalType = ref(''); // 'module' | 'class'
const itemToDelete = ref(null);

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  isDeleteModalOpen.value = false;
  
  if (deleteModalType.value === 'module') {
    try {
      await apiClient.delete(`/course/module/${itemToDelete.value.id}/delete`);
      modules.value = modules.value.filter(m => m.id !== itemToDelete.value.id);
      showAlert('Éxito', 'Módulo eliminado', 'success');
    } catch (error) {
      console.error('Error deleting module', error);
      showAlert('Error', 'No se pudo eliminar el módulo', 'error');
    }
  } else if (deleteModalType.value === 'class') {
    try {
      await apiClient.delete(`/course/module/class/${itemToDelete.value.cls.id}/delete`);
      const module = modules.value.find(m => m.id === itemToDelete.value.moduleId);
      if (module) {
        module.classes = module.classes.filter(c => c.id !== itemToDelete.value.cls.id);
      }
      showAlert('Éxito', 'Clase eliminada', 'success');
    } catch (error) {
      console.error('Error deleting class', error);
      showAlert('Error', 'No se pudo eliminar la clase', 'error');
    }
  }
  itemToDelete.value = null;
};
const editUploadProgress = ref(0);

// Class Form
const activeClassForm = ref({});
const isSavingClass = ref(false);
const uploadProgress = ref(0);
const newClassForm = ref({
  title: '',
  description: '',
  file: null
});

const toggleModule = async (moduleId) => {
  if (openModules.value.includes(moduleId)) {
    openModules.value = openModules.value.filter(id => id !== moduleId);
  } else {
    openModules.value.push(moduleId);
    await loadClasses(moduleId);
  }
};

const toggleSummaryModule = async (moduleId) => {
  if (openSummaryModules.value.includes(moduleId)) {
    openSummaryModules.value = openSummaryModules.value.filter(id => id !== moduleId);
  } else {
    openSummaryModules.value.push(moduleId);
    // Asegurar que las clases están cargadas para el resumen
    const module = modules.value.find(m => m.id === moduleId);
    if (!module.classes || module.classes.length === 0) {
      await loadClasses(moduleId);
    }
  }
};

const loadModulePage = async () => {
    isLoading.value = true;
    try {
        const response = await courseModuleService.getModulePageData(courseId);
        course.value = response.data.course || response.data || null;
        
        const modRes = await apiClient.get(`/course/${courseId}/modulesList`);
        modules.value = modRes.data.data || modRes.data || [];
        modules.value.forEach(m => {
          m.classes = m.classes || [];
          // Carga diferida silenciosa para que el resumen muestre la cantidad correcta rápido
          loadClasses(m.id);
        });
    } catch (error) {
        console.error('Error loading module page:', error);
    } finally {
        isLoading.value = false;
    }
};

const loadClasses = async (moduleId) => {
  try {
    const res = await apiClient.get(`/course/module/class/${moduleId}/classList`);
    const clsData = res.data.data || res.data || [];
    const module = modules.value.find(m => m.id === moduleId);
    if (module) {
      module.classes = clsData;
    }
  } catch (error) {
    console.error('Error loading classes', error);
  }
};

const saveModule = async () => {
  if (!newModuleTitle.value) return;
  try {
    await apiClient.post('/course/module/store', {
      course_id: courseId,
      name: newModuleTitle.value
    });
    
    const modRes = await apiClient.get(`/course/${courseId}/modulesList`);
    modules.value = modRes.data.data || modRes.data || [];
    modules.value.forEach(m => m.classes = m.classes || []);
    
    isAddingModule.value = false;
    newModuleTitle.value = '';
    showAlert('Éxito', 'Módulo creado', 'success');
  } catch (error) {
    console.error('Error saving module', error);
  }
};

const startEditModule = (module) => {
  editingModuleId.value = module.id;
  editingModuleTitle.value = module.name;
};

const updateModule = async (module) => {
  try {
    await apiClient.post(`/course/module/${module.id}/update`, {
      name: editingModuleTitle.value
    });
    module.name = editingModuleTitle.value;
    editingModuleId.value = null;
    showAlert('Éxito', 'Módulo actualizado', 'success');
  } catch (error) {
    console.error('Error updating module', error);
    showAlert('Error', 'No se pudo actualizar el módulo', 'error');
  }
};

const requestDeleteModule = (module) => {
  deleteModalType.value = 'module';
  itemToDelete.value = module;
  isDeleteModalOpen.value = true;
};

const onModuleReorder = async () => {
  try {
    const orderedIds = modules.value.map(m => m.id);
    await apiClient.post('/course/module/reorder', { ordered_ids: orderedIds });
  } catch (error) {
    console.error('Error reordering modules', error);
  }
};

// Classes
const openClassForm = (moduleId) => {
  activeClassForm.value = { [moduleId]: true };
  newClassForm.value = { title: '', description: '', file: null };
  uploadProgress.value = 0;
};

const closeClassForm = (moduleId) => {
  activeClassForm.value[moduleId] = false;
};

const handleVideoUpload = (e) => {
  if (e.target.files.length > 0) {
    newClassForm.value.file = e.target.files[0];
  }
};

const handleEditVideoUpload = (e) => {
  if (e.target.files.length > 0) {
    editingClassForm.value.file = e.target.files[0];
  }
};

const saveClass = async (moduleId) => {
  if (!newClassForm.value.title || !newClassForm.value.file) {
    showAlert('Atención', 'El título y el video son requeridos.', 'warning');
    return;
  }
  
  isSavingClass.value = true;
  uploadProgress.value = 0;
  
  const formData = new FormData();
  formData.append('module_id', moduleId);
  formData.append('title', newClassForm.value.title);
  formData.append('description', newClassForm.value.description);

  try {
    // 1. Crear clase en DB
    const saveResponse = await apiClient.post('/course/module/class/store', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      hideLoader: true
    });
    
    const classId = saveResponse.data.data?.data?.id || saveResponse.data.data?.id;

    if (newClassForm.value.file && classId) {
      // 2. Obtener Presigned URL
      const urlResponse = await apiClient.post('/course/module/class/generate-upload-url', {
        class_id: classId,
        file_name: newClassForm.value.file.name,
        file_type: newClassForm.value.file.type
      }, { hideLoader: true });

      const presignedUrl = urlResponse.data.presigned_url;
      const uploadPath = urlResponse.data.path;

      // 3. Subida Directa a S3
      await axios.put(presignedUrl, newClassForm.value.file, {
        headers: {
          'Content-Type': newClassForm.value.file.type,
          'x-amz-acl': 'public-read'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          uploadProgress.value = percentCompleted;
        }
      });

      // 4. Confirmar subida
      await apiClient.post('/course/module/class/confirm-upload', {
        class_id: classId,
        path: uploadPath
      }, { hideLoader: true });
    }
    
    showAlert('Éxito', 'Clase creada correctamente', 'success');
    await loadClasses(moduleId);
    closeClassForm(moduleId);
  } catch (error) {
    console.error('Error saving class', error);
    showAlert('Error', 'Hubo un error al guardar la clase.', 'error');
  } finally {
    isSavingClass.value = false;
    uploadProgress.value = 0;
  }
};

const startEditClass = (cls) => {
  editingClassId.value = cls.id;
  editingClassForm.value = { title: cls.name, description: cls.description, file: null };
  editUploadProgress.value = 0;
};

const updateClass = async (cls) => {
  isSavingClass.value = true;
  editUploadProgress.value = 0;
  
  const formData = new FormData();
  formData.append('title', editingClassForm.value.title);
  formData.append('description', editingClassForm.value.description);

  try {
    // 1. Actualizar DB
    console.log('1. Actualizando DB...');
    await apiClient.post(`/course/module/class/${cls.id}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      hideLoader: true
    });

    // Si hay nuevo archivo, se sube
    if (editingClassForm.value.file) {
      console.log('2. Generando Presigned URL...');
      // 2. Obtener URL
      const urlResponse = await apiClient.post('/course/module/class/generate-upload-url', {
        class_id: cls.id,
        file_name: editingClassForm.value.file.name,
        file_type: editingClassForm.value.file.type
      }, { hideLoader: true });

      const presignedUrl = urlResponse.data.presigned_url;
      const uploadPath = urlResponse.data.path;

      console.log('3. Subiendo directo a S3...');
      // 3. Subir directo
      await axios.put(presignedUrl, editingClassForm.value.file, {
        headers: {
          'Content-Type': editingClassForm.value.file.type,
          'x-amz-acl': 'public-read'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          editUploadProgress.value = percentCompleted;
        }
      });

      console.log('4. Confirmando subida...');
      // 4. Confirmar subida
      await apiClient.post('/course/module/class/confirm-upload', {
        class_id: cls.id,
        path: uploadPath
      }, { hideLoader: true });
    }
    
    console.log('¡Actualización terminada con éxito!');
    showAlert('Éxito', 'Clase actualizada correctamente!', 'success');
    cls.name = editingClassForm.value.title;
    cls.description = editingClassForm.value.description;
    editingClassId.value = null;
    
    // Recargar la data completa para que se reflejen los videos subidos a S3
    await loadModulePage();
  } catch (error) {
    console.error('Error updating class en el paso actual', error);
    if (error.response) {
      console.error('Respuesta de error:', error.response.data);
    } else {
      console.error('Network Error / CORS Issue');
    }
    showAlert('Error', 'Hubo un error al actualizar la clase.', 'error');
  } finally {
    isSavingClass.value = false;
    editUploadProgress.value = 0;
  }
};

const requestDeleteClass = (moduleId, cls) => {
  deleteModalType.value = 'class';
  itemToDelete.value = { moduleId, cls };
  isDeleteModalOpen.value = true;
};

const onClassReorder = async (module) => {
  try {
    const orderedIds = module.classes.map(c => c.id);
    await apiClient.post('/course/module/class/reorder', { ordered_ids: orderedIds });
  } catch (error) {
    console.error('Error reordering classes', error);
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
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
}

.page-header p {
  color: var(--text-muted);
  margin-top: 6px;
}

.btn-link {
  color: var(--primary-color);
  font-weight: 700;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
}

.btn-link:hover {
  background: rgba(0, 0, 0, 0.05);
}

.curriculum-builder-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .curriculum-builder-layout {
    flex-direction: row;
    align-items: flex-start;
  }
}

.curriculum-builder {
  flex: 1;
  width: 100%;
}

.curriculum-summary {
  width: 100%;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  padding: 20px;
  position: sticky;
  top: 90px;
}

@media (min-width: 1024px) {
  .curriculum-summary {
    width: 380px;
    flex-shrink: 0;
  }
}

.summary-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-main, #333);
}

.summary-list {
  display: flex;
  flex-direction: column;
}

.summary-module {
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}
.summary-module:last-child {
  border-bottom: none;
}

.summary-module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  user-select: none;
}
.summary-module-header:hover .summary-module-name {
  color: var(--primary-color);
}

.summary-module-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-module-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main, #333);
  transition: color 0.2s;
}

.summary-module-meta {
  font-size: 12px;
  color: var(--text-muted, #64748b);
}

.summary-module-body {
  padding-bottom: 12px;
}

.summary-empty {
  font-size: 12px;
  color: var(--text-muted, #64748b);
  font-style: italic;
  padding-left: 8px;
}

.summary-class-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.summary-class-item {
  display: flex;
  align-items: center;
  padding: 8px;
  font-size: 13px;
  color: var(--text-main, #333);
  background: var(--bg-main, #f8fafc);
  border-radius: 6px;
  margin-bottom: 6px;
}
.summary-class-item:last-child {
  margin-bottom: 0;
}

.summary-class-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.module-header {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-main, #f8fafc);
  cursor: pointer;
  user-select: none;
}

.module-header.edit-mode {
  background: var(--card-bg, #fff);
  cursor: default;
}

.module-title {
  font-size: 16px;
  display: flex;
  align-items: center;
}

.module-icon {
  margin-right: 8px;
}

.drag-handle-module, .drag-handle-class {
  cursor: grab;
  margin-right: 12px;
  opacity: 0.5;
  font-size: 14px;
}

.drag-handle-module:hover, .drag-handle-class:hover {
  opacity: 1;
}

.chevron {
  transition: transform 0.3s;
  margin-left: 12px;
}

.chevron.open {
  transform: rotate(180deg);
}

.module-content {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color, #e2e8f0);
}

.empty-classes {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 12px;
}

.class-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
}

.class-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 6px;
  margin-bottom: 8px;
  background: var(--card-bg, #fff);
}

.class-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-icon {
  margin-right: 12px;
  color: var(--primary-color);
  font-size: 12px;
}

.class-title {
  font-weight: 500;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  font-size: 14px;
  transition: opacity 0.2s;
  margin-left: 8px;
  color: var(--text-main, inherit);
}

.btn-icon:hover {
  opacity: 1;
}

.text-danger {
  color: #ef4444;
}

.text-success {
  color: #10b981;
}

.add-module-btn, .add-class-btn {
  padding: 12px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.add-module-btn:hover, .add-class-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--bg-main, #f8fafc);
}

.card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 20px;
  border-radius: 8px;
  margin-top: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input, .form-group textarea, .edit-input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 6px;
  background: var(--bg-main, #fff);
  color: var(--text-main, #333);
  outline: none;
}

/* Styled file input */
.form-group input[type="file"] {
  padding: 6px;
}

.form-group input[type="file"]::file-selector-button {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #cbd5e1);
  color: var(--text-main, #333);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 12px;
  font-weight: 500;
  transition: all 0.2s;
}

.form-group input[type="file"]::file-selector-button:hover {
  background: var(--bg-main, #f8fafc);
}

.edit-input {
  padding: 6px 10px;
  margin-right: 10px;
}

.form-actions, .edit-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.btn-cancel {
  padding: 8px 16px;
  background: var(--card-bg, #fff);
  color: var(--text-main, #333);
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-save {
  padding: 8px 16px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Progress bar */
.progress-bar-container {
  margin-top: 10px;
  background-color: var(--border-color, #e2e8f0);
  border-radius: 4px;
  height: 20px;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  background-color: var(--primary-color);
  height: 100%;
  transition: width 0.2s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  color: #fff;
  font-weight: bold;
}
</style>
