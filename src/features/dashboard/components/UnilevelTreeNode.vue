<template>
  <li>
    <div class="mlm-node-card" @click.prevent="openUserModal(node, `Generación ${node.generation}`, sponsorName)">
      <div class="mlm-top-line"></div>
      <div class="mlm-node-content">
        <div class="mlm-avatar">
          <img v-if="node.photo" :src="getAvatarUrl(node.photo)" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;" />
          <span v-else>{{ node.name?.charAt(0) || 'U' }}</span>
        </div>
        <h4 class="mlm-name">{{ node.name }}</h4>
        <p class="mlm-rank">{{ node.role || 'Afiliado' }}</p>
        
        <div class="mlm-points-grid" style="grid-template-columns: 1fr;">
          <div class="mlm-point-box">
            <span class="mlm-point-label">Estado</span>
            <span class="mlm-point-value" :class="node.active ? 'text-green' : 'text-red'">
              {{ node.active ? 'ACTIVO' : 'INACTIVO' }}
            </span>
          </div>
        </div>

        <!-- Toggle Button for Children -->
        <div 
          v-if="hasChildren" 
          class="toggle-children-btn" 
          @click.stop="toggleExpand"
        >
          {{ isExpanded ? '-' : '+' }}
        </div>
      </div>
    </div>

    <!-- Children list -->
    <ul v-if="isExpanded && hasChildren">
      <UnilevelTreeNode 
        v-for="child in filteredDirects" 
        :key="child.id" 
        :node="child" 
        :sponsorName="node.name"
      />
    </ul>
  </li>
</template>

<script setup>
import { ref, computed, inject } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  sponsorName: {
    type: String,
    default: 'Ninguno'
  }
});

const isExpanded = ref(false);
const openUserModal = inject('openUserModal');
const unilevelSearch = inject('unilevelSearch', ref(''));
const unilevelFilter = inject('unilevelFilter', ref('all'));

const hasChildren = computed(() => {
  return props.node.directs && props.node.directs.length > 0;
});

const filteredDirects = computed(() => {
  let result = props.node.directs || [];
  
  if (unilevelFilter.value !== 'all') {
    result = result.filter(direct => direct.leg === unilevelFilter.value);
  }
  
  if (unilevelSearch.value.trim() !== '') {
    const q = unilevelSearch.value.trim().toLowerCase();
    // Helper function to recursively check if any descendant matches the search
    const matchesSearch = (n) => {
      if (n.name.toLowerCase().includes(q) || (n.username && n.username.toLowerCase().includes(q))) {
        return true;
      }
      if (n.directs && n.directs.length > 0) {
        return n.directs.some(child => matchesSearch(child));
      }
      return false;
    };
    
    result = result.filter(direct => matchesSearch(direct));
  }
  
  return result;
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const getAvatarUrl = (path) => {
  if (!path) return '/img_mantenimiento.png';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_S3_URL}/${path}`;
};
</script>

<style scoped>
.toggle-children-btn {
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--card-bg);
  border: 2px solid #3b82f6;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toggle-children-btn:hover {
  background: #3b82f6;
  color: #fff;
  transform: translateX(-50%) scale(1.1);
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
  margin: 0 auto;
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
  background: linear-gradient(90deg, #10b981, #3b82f6);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
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
}

.mlm-avatar span {
  color: #10b981;
  font-weight: 700;
  font-size: 0.65rem;
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
  gap: 2px;
}

.mlm-point-box {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mlm-point-label {
  font-size: 0.4rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.mlm-point-value {
  font-size: 0.5rem;
  font-weight: 700;
  color: var(--text-main);
}
.text-green { color: #10b981 !important; }
.text-red { color: #ef4444 !important; }
</style>
