<template>
  <div class="cmc-flip-card-wrapper">
    <div class="cmc-flip-card-inner">
      <!-- Frente de la Tarjeta -->
      <div class="cmc-flip-card-front">
        <div class="vip-card-bg-circle"></div>
        <div class="vip-card-bg-circle" style="bottom: -80px; left: -40px; top: auto; right: auto; width: 250px; height: 250px;"></div>
        
        <div class="vip-card-top">
          <img src="/images/logo/promolider_logo.png" alt="Promolíder" class="vip-logo-img" />
          <div class="vip-chip"></div>
        </div>
        
        <div class="vip-card-middle">
          <div class="vip-tier-name">
            <Crown :size="38" /> {{ membershipName }}
          </div>
        </div>
        
        <div class="vip-card-bottom">
          <div class="vip-info-group">
            <span class="vip-info-label">Miembro</span>
            <span class="vip-info-value">{{ userName }}</span>
          </div>
          <div class="vip-info-group" style="text-align: right;">
            <span class="vip-info-label">Valor</span>
            <span class="vip-info-value" style="color: #4ade80;">${{ membershipPrice }}/año</span>
          </div>
        </div>
      </div>

      <!-- Dorso de la Tarjeta -->
      <div class="cmc-flip-card-back">
        <div class="vip-card-strip"></div>
        <div class="vip-card-back-content">
          <h4 class="vip-back-title">Beneficios Activos</h4>
          <div class="vip-back-grid">
            <div class="vip-back-item">
              <div class="vip-back-icon"><Percent :size="16" /></div>
              <div class="vip-back-text"><span class="vip-back-label">IVA</span><span class="vip-back-value">{{ formatBenefit(membership?.iva) }}</span></div>
            </div>
            <div class="vip-back-item">
              <div class="vip-back-icon"><Activity :size="16" /></div>
              <div class="vip-back-text"><span class="vip-back-label">Desc Cursos</span><span class="vip-back-value">{{ formatBenefit(membership?.disc_purchases_course) }}</span></div>
            </div>
            <div class="vip-back-item">
              <div class="vip-back-icon"><TrendingUp :size="16" /></div>
              <div class="vip-back-text"><span class="vip-back-label">Corte Binario</span><span class="vip-back-value">{{ formatBenefit(membership?.pay_in_binary) }}</span></div>
            </div>
            <div class="vip-back-item">
              <div class="vip-back-icon"><Zap :size="16" /></div>
              <div class="vip-back-text"><span class="vip-back-label">Bono Rápido</span><span class="vip-back-value">{{ formatBenefit(membership?.fast_cash_bonus) }}</span></div>
            </div>
            <div class="vip-back-item">
              <div class="vip-back-icon"><DollarSign :size="16" /></div>
              <div class="vip-back-text"><span class="vip-back-label">Comisión Dir</span><span class="vip-back-value">{{ formatBenefit(membership?.comission) }}</span></div>
            </div>
            <div class="vip-back-item">
              <div class="vip-back-icon"><Settings :size="16" /></div>
              <div class="vip-back-text"><span class="vip-back-label">Venta Cursos</span><span class="vip-back-value">{{ formatBenefit(membership?.course_selling_bonus) }}</span></div>
            </div>
            <div class="vip-back-item">
              <div class="vip-back-icon"><Award :size="16" /></div>
              <div class="vip-back-text"><span class="vip-back-label">Bono Productor</span><span class="vip-back-value">{{ formatBenefit(membership?.productor_bonus) }}</span></div>
            </div>
          </div>
        </div>
        <img src="/images/logo/promolider_logo.png" alt="Promolíder" class="vip-logo-back" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Crown, Percent, Activity, TrendingUp, Zap, DollarSign, Settings, Award } from 'lucide-vue-next';

const props = defineProps({
  membership: {
    type: Object,
    default: () => ({})
  },
  user: {
    type: Object,
    required: true
  }
});

const membershipName = computed(() => props.membership?.account || 'Gratis');
const membershipPrice = computed(() => props.membership?.price || '0.00');
const userName = computed(() => {
  return props.user?.name ? `${props.user.name} ${props.user.last_name || ''}`.trim() : 'Usuario';
});

const formatBenefit = (val) => {
  if (val === undefined || val === null) return '0%';
  if (String(val).includes('%')) return val;
  return `${val}%`;
};
</script>

<style scoped>
/* Tarjeta Premium Flip 3D */
.cmc-flip-card-wrapper {
  perspective: 1500px;
  width: 100%;
  max-width: 640px;
  height: 400px;
  margin: 0 auto 40px auto;
}

.cmc-flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: left;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  cursor: pointer;
}

.cmc-flip-card-wrapper:hover .cmc-flip-card-inner {
  transform: rotateY(180deg);
}

.cmc-flip-card-front, .cmc-flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 16px;
  box-shadow: 0 20px 40px -10px rgba(34, 197, 94, 0.4);
  overflow: hidden;
}

.cmc-flip-card-front {
  background: linear-gradient(135deg, #22c55e 0%, #064e3b 100%);
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  z-index: 2;
  transform: rotateY(0deg);
}

.cmc-flip-card-front::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%);
  pointer-events: none;
}

.vip-card-bg-circle {
  position: absolute;
  width: 250px; height: 250px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  top: -80px; right: -40px;
}

.vip-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.vip-logo-img {
  height: 32px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.vip-chip {
  width: 52px;
  height: 38px;
  background: linear-gradient(135deg, #fde047 0%, #ca8a04 100%);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}
.vip-chip::after {
  content: '';
  position: absolute;
  top: 50%; left: 0; right: 0;
  height: 1px;
  background: rgba(0,0,0,0.2);
}

.vip-card-middle {
  position: relative;
  z-index: 2;
}

.vip-tier-name {
  font-size: 38px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 16px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.vip-card-bottom {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.vip-info-group {
  display: flex;
  flex-direction: column;
}
.vip-info-label {
  font-size: 13px;
  text-transform: uppercase;
  opacity: 0.8;
  letter-spacing: 1px;
}
.vip-info-value {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* BACK STYLES */
.cmc-flip-card-back {
  background: linear-gradient(135deg, #22c55e 0%, #064e3b 100%);
  transform: rotateY(180deg);
  border: 1px solid rgba(255,255,255,0.1);
  z-index: 1;
}

.vip-card-strip {
  width: 100%;
  height: 60px;
  background: rgba(0,0,0,0.8);
  margin-top: 32px;
}

.vip-card-back-content {
  padding: 24px 32px;
}

.vip-back-title {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px 0;
}

.vip-back-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.vip-back-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vip-back-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #064e3b;
  color: #4ade80;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.vip-back-text {
  display: flex;
  flex-direction: column;
}
.vip-back-label {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
  text-transform: uppercase;
  line-height: 1.2;
}
.vip-back-value {
  font-size: 16px;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.vip-logo-back {
  position: absolute;
  bottom: 32px;
  right: 32px;
  height: 28px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
</style>
