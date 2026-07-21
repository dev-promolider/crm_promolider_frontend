<template>
  <div class="mlm-node-container">
    <!-- User Card (The Node) -->
    <div class="mlm-node-card" @click="handleClick" :class="{ 'is-dimmed': isSearching && !isMatch, 'is-highlighted': isSearching && isMatch }">
      <div class="mlm-top-line"></div>
      
      <div class="mlm-node-content">
        <!-- Avatar -->
        <div class="mlm-avatar">
          <img v-if="node.photoUrl" :src="node.photoUrl" :alt="node.name" class="mlm-avatar-img" @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;" />
          <span v-else>{{ getInitials(node.name) }}</span>
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
import { computed, inject, ref } from 'vue';
import EmptyNode from './EmptyNode.vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
});

const openUserModal = inject('openUserModal');
const searchQuery = inject('searchQuery', ref(''));

const isSearching = computed(() => {
  return searchQuery.value && searchQuery.value.trim() !== '';
});

const isMatch = computed(() => {
  if (!isSearching.value) return true;
  const q = searchQuery.value.trim().toLowerCase();
  const name = props.node.name ? props.node.name.toLowerCase() : '';
  const username = props.node.username ? props.node.username.toLowerCase() : '';
  return name.includes(q) || username.includes(q);
});

const handleClick = () => {
  if (openUserModal) {
    // node tiene los rawUserData gracias a array_merge en BinaryNode
    openUserModal(props.node, 'Árbol Binario', props.node.sponsor_name || 'Ninguno');
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
  width: 90px;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  padding: 6px 4px;
  transition: all 0.3s ease;
  z-index: 10;
  cursor: pointer;
}

.mlm-node-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.mlm-node-card.is-dimmed {
  opacity: 0.25;
  filter: grayscale(100%);
  transform: scale(0.95);
}

.mlm-node-card.is-highlighted {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.7);
  border-color: #10b981;
  z-index: 20;
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
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
  border: 2px solid var(--border-color);
  overflow: hidden;
}

.mlm-avatar span {
  color: #10b981;
  font-weight: 700;
  font-size: 0.65rem;
}

.mlm-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mlm-name {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-bold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
  margin: 0;
}

.mlm-rank {
  font-size: 0.5rem;
  color: var(--text-muted);
  font-weight: 500;
  margin: 0 0 4px 0;
}

.mlm-points-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  text-align: center;
  background: var(--bg-main);
  border-radius: 6px;
  padding: 4px;
  border: 1px solid var(--border-color);
}

.mlm-point-box {
  display: flex;
  flex-direction: column;
}

.mlm-point-label {
  font-size: 0.45rem;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0;
}

.mlm-point-value {
  font-size: 0.6rem;
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

.mlm-children-area::before {
  content: '';
  position: absolute;
  top: -48px;
  left: 50%;
  width: 3px;
  height: 24px;
  background: #64748b; /* Gris más fuerte para contraste */
  transform: translateX(-50%);
}

.mlm-leg {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10px; /* Padding razonable, ya no causará separación extrema */
}

.mlm-leg:first-child::before {
  content: '';
  position: absolute;
  top: -24px;
  right: 0;
  width: 50%;
  height: 3px;
  background: #64748b;
}

.mlm-leg:last-child::before {
  content: '';
  position: absolute;
  top: -24px;
  left: 0;
  width: 50%;
  height: 3px;
  background: #64748b;
}

.mlm-leg::after {
  content: '';
  position: absolute;
  top: -24px;
  left: 50%;
  width: 3px;
  height: 24px;
  background: #64748b;
  transform: translateX(-50%);
}
</style>
