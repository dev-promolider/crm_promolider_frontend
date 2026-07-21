<template>
  <div class="mlm-node-container">
    <!-- User Card (The Node) -->
    <div class="mlm-node-card" @click="handleClick">
      <div class="mlm-top-line"></div>
      
      <div class="mlm-node-content">
        <!-- Avatar -->
        <div class="mlm-avatar">
          <span>{{ getInitials(node.name) }}</span>
        </div>
        
        <!-- Info -->
        <h3 class="mlm-name" :title="node.name">
          {{ node.name || 'Usuario' }}
        </h3>
        <p class="mlm-rank">
          {{ node.rank || 'Distribuidor' }}
        </p>

        <!-- Binary Points -->
        <div class="mlm-points-grid">
          <div class="mlm-point-box">
            <span class="mlm-point-label">Izq</span>
            <span class="mlm-point-value">{{ node.LeftPoints || node.left_points || 0 }}</span>
          </div>
          <div class="mlm-point-box">
            <span class="mlm-point-label">Der</span>
            <span class="mlm-point-value">{{ node.RightPoints || node.right_points || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Children Connection Area -->
    <div class="mlm-children-area">
      <!-- Left Leg -->
      <div class="mlm-leg">
        <BinaryTreeNode v-if="node.left" :node="node.left" />
        <EmptyNode v-else position="Izquierda" />
      </div>

      <!-- Right Leg -->
      <div class="mlm-leg">
        <BinaryTreeNode v-if="node.right" :node="node.right" />
        <EmptyNode v-else position="Derecha" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import EmptyNode from './EmptyNode.vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
});

const openUserModal = inject('openUserModal');

const handleClick = () => {
  if (openUserModal) {
    // node tiene los rawUserData gracias a array_merge en BinaryNode
    openUserModal(props.node, 'Árbol Binario', 'Ver en Red');
  }
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};
</script>

<script>
export default {
  name: 'BinaryTreeNode'
}
</script>

<style scoped>
.mlm-node-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mlm-node-card {
  position: relative;
  width: 160px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  padding: 16px 12px;
  transition: all 0.3s ease;
  z-index: 10;
  cursor: pointer;
}

.mlm-node-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.mlm-top-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #10b981, #3b82f6); /* Promolider Green to Blue */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.mlm-node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mlm-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
  border: 2px solid var(--border-color);
}

.mlm-avatar span {
  color: #10b981;
  font-weight: 700;
  font-size: 1.1rem;
}

.mlm-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-bold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
  margin: 0 0 2px 0;
}

.mlm-rank {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 500;
  margin: 0 0 12px 0;
}

.mlm-points-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  text-align: center;
  background: var(--bg-main);
  border-radius: 8px;
  padding: 6px;
  border: 1px solid var(--border-color);
}

.mlm-point-box {
  display: flex;
  flex-direction: column;
}

.mlm-point-label {
  font-size: 0.6rem;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 2px;
}

.mlm-point-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-bold);
}

.mlm-children-area {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 48px; /* Espacio para las líneas de conexión */
  position: relative;
}

/* Línea vertical desde el padre */
.mlm-children-area::before {
  content: '';
  position: absolute;
  top: -48px;
  left: 50%;
  width: 2px;
  height: 24px;
  background: var(--border-color);
  transform: translateX(-50%);
}

.mlm-leg {
  flex: 1 1 50%;
  width: 50%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 8px;
}

/* Línea horizontal para la pata izquierda */
.mlm-leg:first-child::before {
  content: '';
  position: absolute;
  top: -24px;
  right: 0;
  width: 50%;
  height: 2px;
  background: var(--border-color);
}

/* Línea horizontal para la pata derecha */
.mlm-leg:last-child::before {
  content: '';
  position: absolute;
  top: -24px;
  left: 0;
  width: 50%;
  height: 2px;
  background: var(--border-color);
}

/* Línea vertical hacia el nodo hijo */
.mlm-leg::after {
  content: '';
  position: absolute;
  top: -24px;
  left: 50%;
  width: 2px;
  height: 24px;
  background: var(--border-color);
  transform: translateX(-50%);
}
</style>
