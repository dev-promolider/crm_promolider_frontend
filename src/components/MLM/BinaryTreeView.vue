<template>
  <div class="mlm-tree-wrapper">
    
    <!-- Barra superior -->
    <div class="mlm-tree-header">
      <h2 class="mlm-tree-title">Mi Red Binaria</h2>
    </div>

    <!-- Controles de Zoom -->
    <div class="mlm-zoom-controls">
      <!-- Icono de Pan (solo visual para indicar que se puede arrastrar) -->
      <div class="mlm-btn-zoom" title="Arrastra con el click para moverte" style="cursor: default; opacity: 0.7;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
      </div>
      <div class="mlm-divider"></div>
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
    <div 
      class="mlm-canvas-area mlm-custom-scrollbar" 
      :class="{ 'is-panning': isPanning }"
      ref="canvas"
      @mousedown="startPan"
      @mousemove="pan"
      @mouseup="stopPan"
      @mouseleave="stopPan"
    >
      
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
const canvas = ref(null);

// Lógica de Paneo (Arrastre con la manito)
const isPanning = ref(false);
const startX = ref(0);
const startY = ref(0);
const scrollLeft = ref(0);
const scrollTop = ref(0);

const startPan = (e) => {
  // Solo iniciar el paneo si se hace clic en el fondo, no en una tarjeta
  if (e.target.closest('.mlm-node-card') || e.target.closest('.mlm-empty-node')) return;
  isPanning.value = true;
  startX.value = e.pageX - canvas.value.offsetLeft;
  startY.value = e.pageY - canvas.value.offsetTop;
  scrollLeft.value = canvas.value.scrollLeft;
  scrollTop.value = canvas.value.scrollTop;
};

const pan = (e) => {
  if (!isPanning.value) return;
  e.preventDefault();
  const x = e.pageX - canvas.value.offsetLeft;
  const y = e.pageY - canvas.value.offsetTop;
  const walkX = (x - startX.value) * 1.5; 
  const walkY = (y - startY.value) * 1.5; 
  
  canvas.value.scrollLeft = scrollLeft.value - walkX;
  canvas.value.scrollTop = scrollTop.value - walkY;
};

const stopPan = () => {
  isPanning.value = false;
};

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
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
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
  color: var(--text-bold);
  margin: 0;
}

.mlm-zoom-controls {
  position: absolute;
  top: 16px;
  right: 20px;
  z-index: 20;
  display: flex;
  background: var(--navbar-bg);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 4px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px rgba(0,0,0,0.15);
}

.mlm-btn-zoom {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.mlm-btn-zoom:hover {
  background: var(--border-color);
  color: var(--text-bold);
}

.mlm-divider {
  width: 1px;
  background: var(--border-color);
  margin: 4px 2px;
}

.mlm-canvas-area {
  width: 100%;
  height: 800px;
  overflow: auto;
  text-align: center;
  padding-top: 80px; 
  position: relative;
  cursor: grab;
}

.mlm-canvas-area.is-panning {
  cursor: grabbing;
  user-select: none;
}

.mlm-state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 120px;
  color: var(--text-muted);
  font-weight: 500;
}

.mlm-error {
  color: var(--danger-color);
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
  padding: 80px 100px 120px 100px; /* Buffer lateral y vertical */
  display: inline-flex;
  justify-content: center;
  text-align: left;
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
  background-color: var(--border-color);
  border-radius: 10px;
}
.mlm-custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: var(--text-muted);
}
</style>
