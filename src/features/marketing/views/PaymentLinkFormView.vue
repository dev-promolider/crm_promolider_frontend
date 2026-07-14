<template>
  <div class="link-form">
    <h1>{{ isEdit ? 'Editar Enlace de Pago' : 'Nuevo Enlace de Pago' }}</h1>

    <div v-if="store.error" class="error">{{ store.error }}</div>

    <form @submit.prevent="submit" class="form">
      <div class="form-row">
        <div class="form-group flex-2">
          <label>Nombre *</label>
          <input v-model="form.name" type="text" required maxlength="255" placeholder="Ej: Curso de Marketing Digital" />
        </div>
        <div class="form-group">
          <label>Monto (S/) *</label>
          <input v-model.number="form.amount" type="number" step="0.01" min="0" required placeholder="49.90" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Slug (URL)</label>
          <input v-model="form.slug" type="text" maxlength="160" placeholder="curso-marketing-digital" />
        </div>
        <div class="form-group">
          <label>Tipo de Producto</label>
          <select v-model="form.product_type">
            <option value="">Seleccionar...</option>
            <option value="membership">Membresía</option>
            <option value="course">Curso</option>
            <option value="opc">OPC</option>
            <option value="recharge">Recarga</option>
          </select>
        </div>
        <div class="form-group">
          <label>Producto ID</label>
          <input v-model.number="form.product_id" type="number" placeholder="ID del producto" />
        </div>
      </div>

      <div class="form-group">
        <label>Descripción</label>
        <textarea v-model="form.description" maxlength="500" placeholder="Descripción del producto/servicio" rows="3"></textarea>
      </div>

      <div class="form-group checkbox">
        <label>
          <input v-model="form.active" type="checkbox" />
          Activo
        </label>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="cancel">Cancelar</button>
        <button type="submit" class="btn-primary" :disabled="store.loading">
          {{ store.loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePaymentLinksStore } from '../stores/paymentLinksStore'

export default {
  name: 'PaymentLinkFormView',
  setup() {
    const store = usePaymentLinksStore()
    const route = useRoute()
    const router = useRouter()

    const isEdit = computed(() => !!route.params.id)
    const form = ref({
      name: '', slug: '', product_type: '', product_id: null,
      amount: null, description: '', active: true,
    })

    onMounted(async () => {
      if (isEdit.value) {
        await store.fetchLink(route.params.id)
        if (store.currentLink) {
          form.value = {
            name: store.currentLink.name || '',
            slug: store.currentLink.slug || '',
            product_type: store.currentLink.product_type || '',
            product_id: store.currentLink.product_id || null,
            amount: store.currentLink.amount || null,
            description: store.currentLink.description || '',
            active: store.currentLink.active ?? true,
          }
        }
      }
    })

    async function submit() {
      try {
        if (isEdit.value) {
          await store.updateLink(route.params.id, form.value)
        } else {
          await store.createLink(form.value)
        }
        router.push({ name: 'marketing-payment-links' })
      } catch { /* handled by store */ }
    }

    function cancel() { router.push({ name: 'marketing-payment-links' }) }

    return { form, isEdit, store, submit, cancel }
  }
}
</script>

<style scoped>
.link-form { max-width: 700px; margin: 0 auto; padding: 1.5rem; }
.form { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; }
.form-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
.form-group { margin-bottom: 1rem; flex: 1; }
.form-group label { display: block; font-weight: 500; margin-bottom: 0.35rem; color: #334155; }
.form-group input, .form-group select, .form-group textarea {
  width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box;
}
.form-group textarea { resize: vertical; }
.form-group.checkbox label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
.flex-2 { flex: 2; }
.form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
.btn-primary { background: #2563eb; color: #fff; border: none; padding: 0.5rem 1.25rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 0.5rem 1.25rem; border-radius: 6px; cursor: pointer; }
.error { color: #ef4444; padding: 0.75rem; background: #fef2f2; border-radius: 6px; margin-bottom: 1rem; }
</style>
