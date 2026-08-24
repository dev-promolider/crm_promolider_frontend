<template>
  <div
    class="plan-card"
    :class="{ selected, free: isFree }"
    role="radio"
    :aria-checked="selected"
    :tabindex="0"
    @click="$emit('select', plan.id)"
    @keydown.enter.prevent="$emit('select', plan.id)"
    @keydown.space.prevent="$emit('select', plan.id)"
  >
    <span v-if="badge" class="plan-badge">{{ badge }}</span>

    <div class="plan-head">
      <div class="plan-icon">
        <component :is="icon" :size="20" />
      </div>
      <h4 class="plan-name">{{ plan.account }}</h4>
    </div>

    <div class="plan-price">
      <template v-if="isFree">
        <span class="plan-free">Gratis</span>
      </template>
      <template v-else>
        <span class="plan-currency">$</span>
        <span class="plan-amount">{{ formatMoney(price) }}</span>
        <span class="plan-period">/año</span>
      </template>
    </div>

    <ul class="plan-detail">
      <li v-if="!isFree">
        <span>IVA ({{ formatMoney(ivaPercentage) }}%)</span>
        <strong>${{ formatMoney(iva) }}</strong>
      </li>
      <li v-if="!isFree" class="total">
        <span>Total a pagar</span>
        <strong>${{ formatMoney(total) }}</strong>
      </li>
      <li v-else class="total">
        <span>Total a pagar</span>
        <strong>$0.00</strong>
      </li>
    </ul>

    <div class="plan-check">
      <Check v-if="selected" :size="14" stroke-width="3" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Check, Crown, GraduationCap, Rocket, School, Sparkles } from 'lucide-vue-next';

const props = defineProps({
  plan: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  badge: { type: String, default: '' }
});

defineEmits(['select']);

const price = computed(() => parseFloat(props.plan.price) || 0);
const ivaPercentage = computed(() => parseFloat(props.plan.iva) || 0);
const iva = computed(() => (price.value * ivaPercentage.value) / 100);
const total = computed(() => price.value + iva.value);
const isFree = computed(() => price.value === 0);

// El icono se elige por el precio y no por el nombre: si mañana renombran un plan
// en la tabla account_type, la tarjeta sigue mostrando algo coherente.
const icon = computed(() => {
  if (isFree.value) return Rocket;
  if (price.value >= 1000) return Crown;
  if (price.value >= 500) return GraduationCap;
  if (price.value >= 250) return School;
  return Sparkles;
});

const formatMoney = (value) => Number(value).toFixed(2);
</script>

<style scoped>
.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 20px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}
.plan-card:hover {
  transform: translateY(-4px);
  border-color: rgba(24, 214, 0, 0.45);
}
.plan-card:focus-visible {
  outline: 2px solid #18d600;
  outline-offset: 3px;
}
.plan-card.selected {
  background: linear-gradient(150deg, rgba(24, 214, 0, 0.22) 0%, rgba(6, 78, 59, 0.5) 100%);
  border-color: #18d600;
  box-shadow: 0 18px 36px -14px rgba(24, 214, 0, 0.5);
}

.plan-badge {
  position: absolute;
  top: -10px;
  left: 20px;
  padding: 4px 12px;
  border-radius: 999px;
  background: #18d600;
  color: #052e16;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.plan-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.plan-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(24, 214, 0, 0.15);
  color: #4ade80;
  flex-shrink: 0;
}
.plan-name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.2;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 3px;
  color: #ffffff;
}
.plan-currency {
  font-size: 17px;
  font-weight: 700;
  color: #94a3b8;
}
.plan-amount {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -1px;
}
.plan-period {
  font-size: 13px;
  color: #94a3b8;
}
.plan-free {
  font-size: 28px;
  font-weight: 800;
  color: #4ade80;
  letter-spacing: -0.5px;
}

.plan-detail {
  list-style: none;
  margin: 0;
  padding: 14px 0 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: #94a3b8;
}
.plan-detail li {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.plan-detail strong {
  color: #e2e8f0;
  font-weight: 600;
}
.plan-detail li.total strong {
  color: #4ade80;
  font-weight: 700;
}

.plan-check {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.25);
  display: grid;
  place-items: center;
  color: #052e16;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.plan-card.selected .plan-check {
  background: #18d600;
  border-color: #18d600;
}

@media (max-width: 560px) {
  .plan-card { padding: 18px 16px; }
  .plan-amount { font-size: 26px; }
}
</style>
