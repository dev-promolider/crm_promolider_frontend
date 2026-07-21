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
      <!-- Conector SVG para la división izquierda/derecha -->
      <svg class="mlm-connector-svg" preserveAspectRatio="none">
        <path d="M 100 0 L 100 24 M 300 0 L 300 24 M 100 0 L 300 0 M 200 -24 L 200 0" 
              stroke="#4b5563" stroke-width="2" fill="none" />
      </svg>
      
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
  background: rgba(30, 41, 59, 0.85); /* Dark Glass */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 12px;
  transition: all 0.3s ease;
  z-index: 10;
  cursor: pointer;
}

.mlm-node-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.2);
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
  background: linear-gradient(135deg, #1f2937, #111827);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
  border: 2px solid rgba(255, 255, 255, 0.05);
}

.mlm-avatar span {
  color: #10b981;
  font-weight: 700;
  font-size: 1.1rem;
}

.mlm-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #f3f4f6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
  margin: 0 0 2px 0;
}

.mlm-rank {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 500;
  margin: 0 0 12px 0;
}

.mlm-points-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  text-align: center;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.mlm-point-box {
  display: flex;
  flex-direction: column;
}

.mlm-point-label {
  font-size: 0.6rem;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.mlm-point-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e2e8f0;
}

.mlm-children-area {
  display: flex;
  align-items: flex-start;
  margin-top: 24px;
  position: relative;
  width: 400px;
}

.mlm-connector-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 24px;
  margin-top: -24px;
  pointer-events: none;
}

.mlm-leg {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
