<template>
  <div class="mlm-tree-wrapper">
    
    <!-- Barra superior -->
    <div class="mlm-tree-header">
      <h2 class="mlm-tree-title">Mi Red Binaria</h2>
    </div>

    <!-- Controles de Zoom -->
    <div class="mlm-zoom-controls">
      <button @click="zoomIn" class="mlm-btn-zoom" title="Acercar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </button>
      <div class="mlm-divider"></div>
      <button @click="zoomOut" class="mlm-btn-zoom" title="Alejar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
      </button>
      <div class="mlm-divider"></div>
      <button @click="resetZoom" class="mlm-btn-zoom" title="Centrar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
    </div>

    <!-- Área de Dibujo (Scrollable & Zoomable) -->
    <div class="mlm-canvas-area mlm-custom-scrollbar" ref="canvas">
      
      <!-- Estados de Carga / Error -->
      <div v-if="loading" class="mlm-state-box">
        <div class="mlm-spinner"></div>
        <p>Cargando la red velozmente...</p>
      </div>

      <div v-else-if="error" class="mlm-state-box mlm-error">
        {{ error }}
      </div>
      
      <!-- Renderizado del Árbol -->
      <div 
        v-else-if="treeData" 
        class="mlm-tree-scale-box"
        :style="{ transform: `scale(${scale})` }"
      >
        <BinaryTreeNode :node="treeData" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/apiClient';
import BinaryTreeNode from './BinaryTreeNode.vue';

const scale = ref(1);
const loading = ref(true);
const error = ref(null);
const treeData = ref(null);

const zoomIn = () => {
  if (scale.value < 2) scale.value += 0.1;
};

const zoomOut = () => {
  if (scale.value > 0.3) scale.value -= 0.1;
};

const resetZoom = () => {
  scale.value = 1;
};

const fetchTree = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await api.get('/mlm/tree');
    treeData.value = response.data.data;
  } catch (err) {
    console.error('Error al cargar el árbol MLM:', err);
    error.value = 'No se pudo cargar la red. Inténtalo de nuevo más tarde.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTree();
});
</script>

<style scoped>
.mlm-tree-wrapper {
  width: 100%;
  position: relative;
  background: #0f172a; /* Dark background matching the theme */
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #334155;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
}

.mlm-tree-header {
  position: absolute;
  top: 16px;
  left: 20px;
  z-index: 20;
}

.mlm-tree-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.mlm-zoom-controls {
  position: absolute;
  bottom: 24px;
  right: 24px;
  z-index: 20;
  display: flex;
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 4px;
  border: 1px solid #334155;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.mlm-btn-zoom {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.mlm-btn-zoom:hover {
  background: #334155;
  color: #f8fafc;
}

.mlm-divider {
  width: 1px;
  background: #334155;
  margin: 4px 2px;
}

.mlm-canvas-area {
  width: 100%;
  height: 800px; /* Fixed height for scroll area */
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 80px;
  position: relative;
}

.mlm-state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 120px;
  color: #94a3b8;
  font-weight: 500;
}

.mlm-error {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 16px 24px;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.mlm-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: mlm-spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes mlm-spin {
  to { transform: rotate(360deg); }
}

.mlm-tree-scale-box {
  transition: transform 0.3s ease-out;
  transform-origin: top center;
  padding-bottom: 120px;
}

/* Custom Scrollbar */
.mlm-custom-scrollbar::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
.mlm-custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.mlm-custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(71, 85, 105, 0.5); 
  border-radius: 10px;
}
.mlm-custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(71, 85, 105, 0.8); 
}
</style>
