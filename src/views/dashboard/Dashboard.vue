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
              <span class="check-icon check-green">✔</span>
            </div>
            <div class="condition-item">
              <span class="condition-label">Activos de OPC:</span>
              <span class="check-icon check-green">✔</span>
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
              <div class="indicator-icon pink">UP</div>
              <div class="indicator-text">
                <div class="indicator-val">$ 0.00</div>
                <div class="indicator-name">Bono de expansión</div>
              </div>
            </div>
            <div class="indicator-item">
              <div class="indicator-icon blue">RE</div>
              <div class="indicator-text">
                <div class="indicator-val">0.00</div>
                <div class="indicator-name">Bono binario</div>
              </div>
            </div>
            <div class="indicator-item">
              <div class="indicator-icon teal">US</div>
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
              <div class="indicator-icon green">+U</div>
              <div class="indicator-text">
                <div class="indicator-val">$ 196.00</div>
                <div class="indicator-name">Bono de efectivo rápido</div>
              </div>
            </div>
            <div class="indicator-item">
              <div class="indicator-icon orange">VI</div>
              <div class="indicator-text">
                <div class="indicator-val">$ 0.00</div>
                <div class="indicator-name">Bono de productor</div>
              </div>
            </div>
            <div class="indicator-item">
              <div class="indicator-icon mint">PL</div>
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
            <div class="tree-img-wrapper">
              <!-- Reemplazando imagen rota por el logo de Promolíder -->
              <img
                src="/images/logo/promolider_logo.png"
                alt="Árbol"
                class="tree-img"
                style="opacity:0.1; max-height:220px;"
              />
              <div style="position: absolute; color: #9ca3af; font-weight: bold;">
                Árbol {{ activeTab }}
              </div>
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
import { ref } from 'vue'

const activeTab = ref('Árbol Binario')
const tabs = ['Árbol Uninivel', 'Árbol Binario']
</script>


