<template>
  <div class="dashboard-wrapper">

    <!-- Dashboard body -->
    <div class="dashboard-body">

      <!-- Left panel -->
      <div class="left-panel">

        <!-- Condición -->
        <div class="card">
          <h3 class="card-title">Condición</h3>
          <div class="condition-list">
            <div class="condition-item">
              <span class="condition-label">Membresía activa:</span>
              <span class="check-icon">✕</span>
            </div>
            <div class="condition-item">
              <span class="condition-label">Activos de OPC:</span>
              <span class="check-icon">✕</span>
            </div>
            <div class="condition-item">
              <span class="condition-label">Calificado:</span>
              <span class="check-icon">✕</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Right panel -->
      <div class="right-panel">

        <!-- Indicadores -->
        <div class="card indicators-card">
          <div class="indicators-header-row">
            <div>
              <h4 class="indicators-title">Indicadores de resumen mensual</h4>
            </div>
            <span class="updated-badge">Actualizado este mes</span>
          </div>
          <div class="indicators-grid">
            <div class="indicator-item">
              <div class="indicator-icon pink"><i data-feather="trending-up"></i></div>
              <div class="indicator-text">
                <div class="indicator-val">$ 0.00</div>
                <div class="indicator-name">Bono de expansión</div>
              </div>
            </div>
            <div class="indicator-item">
              <div class="indicator-icon blue"><i data-feather="refresh-cw"></i></div>
              <div class="indicator-text">
                <div class="indicator-val">0.00</div>
                <div class="indicator-name">Bono binario</div>
              </div>
            </div>
            <div class="indicator-item">
              <div class="indicator-icon teal"><i data-feather="users"></i></div>
              <div class="indicator-text">
                <div class="indicator-val">$ 0.00</div>
                <div class="indicator-name">Bono generacional</div>
              </div>
            </div>
          </div>
          <div class="indicators-header-row mt-1">
            <div>
              <h4 class="indicators-title">Indicadores acumulativos</h4>
            </div>
            <span class="updated-badge">Actualizado desde el último corte binario</span>
          </div>
          <div class="indicators-grid">
            <div class="indicator-item">
              <div class="indicator-icon green"><i data-feather="user-plus"></i></div>
              <div class="indicator-text">
                <div class="indicator-val">$ 196.00</div>
                <div class="indicator-name">Bono de efectivo rápido</div>
              </div>
            </div>
            <div class="indicator-item">
              <div class="indicator-icon orange"><i data-feather="video"></i></div>
              <div class="indicator-text">
                <div class="indicator-val">$ 0.00</div>
                <div class="indicator-name">Bono de productor</div>
              </div>
            </div>
            <div class="indicator-item">
              <div class="indicator-icon mint"><i data-feather="play-circle"></i></div>
              <div class="indicator-text">
                <div class="indicator-val">$ 0.00</div>
                <div class="indicator-name">Bono por venta de curso</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tree section -->
        <div class="tree-section">
          <div class="tree-tabs">
            <button
              v-for="tab in tabs"
              :key="tab"
              class="tree-tab"
              :class="{ 'tree-tab--active': activeTab === tab }"
              @click="activeTab = tab"
            >{{ tab }}</button>
          </div>

          <div class="tree-canvas">
            <!-- Árbol Binario -->
            <div v-if="activeTab === 'Árbol Binario'" class="tree-img-wrapper">
              <img
                src="/images/logo/promolider_logo.png"
                alt="Árbol Binario"
                class="tree-img"
                style="opacity:0.15;max-height:260px;"
              />
            </div>
            <!-- Árbol Uninivel -->
            <div v-else class="tree-img-wrapper">
              <img
                src="/images/logo/promolider_logo.png"
                alt="Árbol Uninivel"
                class="tree-img"
                style="opacity:0.15;max-height:260px;"
              />
            </div>
          </div>

          <div class="volume-row">
            <button class="volume-btn">Volumen Izquierdo</button>
            <button class="volume-btn">Volumen Derecho</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const activeTab = ref('Árbol Binario')
const tabs = ['Árbol Uninivel', 'Árbol Binario']

onMounted(() => {
  nextTick(() => {
    if (typeof window.feather !== 'undefined') {
      window.feather.replace({ width: 16, height: 16 })
    }
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.dashboard-wrapper {
  background: #f0f4f8;
  min-height: calc(100vh - 70px);
  font-family: 'Nunito', sans-serif;
}

.dashboard-body {
  display: flex;
  gap: 20px;
  padding: 20px 24px;
  align-items: flex-start;
}

/* Cards */
.card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,.07);
}

.card-title {
  font-family: 'Exo 2', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 14px;
}

/* Left panel */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 220px;
  min-width: 200px;
  flex-shrink: 0;
}

.condition-list { display: flex; flex-direction: column; gap: 10px; }
.condition-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.condition-label { font-size: 13px; color: #4b5563; font-weight: 500; }
.check-icon {
  width: 26px; height: 26px;
  border-radius: 6px;
  background: #18d600;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
}

/* Right panel */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

/* Indicators card */
.indicators-card { padding: 18px 20px; }
.indicators-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.mt-1 { margin-top: 18px; }
.indicators-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}
.updated-badge { font-size: 11px; color: #9ca3af; }
.indicators-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 4px;
}
.indicator-item { display: flex; align-items: center; gap: 10px; }
.indicator-icon {
  width: 34px; height: 34px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
}
.indicator-icon :deep(svg) { width: 16px; height: 16px; }
.pink { background: #f472b6; }
.blue { background: #60a5fa; }
.teal { background: #2dd4bf; }
.green { background: #34d399; }
.orange { background: #fb923c; }
.mint { background: #4ade80; }
.indicator-val { font-size: 13px; font-weight: 700; color: #1f2937; }
.indicator-name { font-size: 11px; color: #6b7280; }

/* Tree section */
.tree-section {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,.07);
  overflow: hidden;
}
.tree-tabs { display: flex; padding: 14px 20px 0; gap: 4px; }
.tree-tab {
  padding: 8px 20px;
  border: none;
  background: transparent;
  font-family: 'Nunito', sans-serif;
  font-size: 13px; font-weight: 600; color: #6b7280;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 0.18s;
  border-bottom: 3px solid transparent;
}
.tree-tab--active {
  background: #f0fdf4;
  color: #18d600;
  border-bottom: 3px solid #18d600;
}
.tree-canvas {
  margin: 12px 16px;
  border: 2px dashed #e5e7eb;
  border-radius: 10px;
  min-height: 200px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.tree-img-wrapper {
  width: 100%; padding: 16px;
  display: flex; align-items: center; justify-content: center;
}
.tree-img {
  width: 100%; max-width: 100%; height: auto;
  object-fit: contain; display: block; border-radius: 8px;
}
.volume-row {
  display: flex; justify-content: space-between;
  padding: 14px 20px 18px; gap: 12px;
}
.volume-btn {
  flex: 1; padding: 9px 16px;
  background: #18d600; color: #fff;
  border: none; border-radius: 8px;
  font-family: 'Nunito', sans-serif;
  font-size: 13px; font-weight: 700;
  cursor: pointer; transition: background 0.18s; text-align: center;
}
.volume-btn:hover { background: #14b800; }

/* Responsive */
@media (max-width: 900px) {
  .dashboard-body { flex-direction: column; padding: 16px; gap: 16px; }
  .left-panel { width: 100%; min-width: unset; flex-direction: row; flex-wrap: wrap; }
  .left-panel .card { flex: 1; min-width: 180px; }
  .indicators-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .dashboard-body { padding: 12px; gap: 12px; }
  .left-panel { flex-direction: column; }
  .indicators-grid { grid-template-columns: repeat(1, 1fr); }
  .volume-row { flex-direction: column; gap: 8px; padding: 10px 12px 14px; }
  .volume-btn { width: 100%; }
}
</style>
