<template>
  <div class="payment-links">
    <div class="page-header">
      <h1>Enlaces de Pago</h1>
      <button class="btn-primary" @click="openCreate">+ Nuevo Enlace</button>
    </div>

    <div v-if="store.loading" class="loading">Cargando...</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>

    <div v-else class="links-grid">
      <div v-for="link in store.links" :key="link.id" class="link-card">
        <div class="card-header">
          <h3>{{ link.name }}</h3>
          <span :class="link.active ? 'badge-active' : 'badge-inactive'">
            {{ link.active ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
        <p v-if="link.description" class="description">{{ link.description }}</p>
        <div class="card-meta">
          <span class="amount">S/ {{ formatAmount(link.amount) }}</span>
          <span v-if="link.product_type" class="product-type">{{ link.product_type }}</span>
          <span class="usage">{{ link.usage_count || 0 }} usos</span>
        </div>
        <div v-if="link.slug" class="link-url">
          <code>/pay/{{ link.slug }}</code>
        </div>
        <div class="card-actions">
          <button class="btn-sm" @click="editLink(link)">Editar</button>
          <button class="btn-sm" :class="link.active ? 'btn-warning' : 'btn-success'" @click="toggleStatus(link.id)">
            {{ link.active ? 'Desactivar' : 'Activar' }}
          </button>
          <button class="btn-sm btn-danger" @click="confirmDelete(link)">Eliminar</button>
        </div>
      </div>

      <div v-if="!store.links.length" class="empty">
        No hay enlaces de pago. Crea el primero.
      </div>
    </div>

    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal">
        <h3>Eliminar {{ deleteTarget.name }}?</h3>
        <p>Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="deleteTarget = null">Cancelar</button>
          <button class="btn-danger" @click="deleteLink">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentLinksStore } from '../stores/paymentLinksStore'

export default {
  name: 'PaymentLinksView',
  setup() {
    const store = usePaymentLinksStore()
    const router = useRouter()
    const deleteTarget = ref(null)

    onMounted(() => { store.fetchLinks() })

    function openCreate() { router.push({ name: 'marketing-payment-links-create' }) }
    function editLink(link) { router.push({ name: 'marketing-payment-links-edit', params: { id: link.id } }) }
    async function toggleStatus(id) { await store.toggleLinkStatus(id) }
    function confirmDelete(link) { deleteTarget.value = link }
    async function deleteLink() {
      if (!deleteTarget.value) return
      await store.removeLink(deleteTarget.value.id)
      deleteTarget.value = null
    }
    function formatAmount(val) { return parseFloat(val || 0).toFixed(2) }

    return { store, deleteTarget, openCreate, editLink, toggleStatus, confirmDelete, deleteLink, formatAmount }
  }
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.links-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); }
.link-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; transition: box-shadow 0.2s; }
.link-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.card-header h3 { margin: 0; font-size: 1.1rem; }
.description { color: #64748b; font-size: 0.875rem; margin: 0 0 0.75rem; }
.card-meta { display: flex; gap: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
.amount { font-weight: 600; color: #059669; font-size: 1.1rem; }
.product-type { background: #f1f5f9; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.75rem; color: #475569; }
.usage { color: #94a3b8; font-size: 0.8rem; }
.link-url { margin-bottom: 0.75rem; }
.link-url code { background: #f8fafc; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; color: #6366f1; }
.card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.badge-active { background: #dcfce7; color: #166534; padding: 0.15rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
.badge-inactive { background: #fef2f2; color: #991b1b; padding: 0.15rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
.btn-primary { background: #2563eb; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-sm { padding: 0.35rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 4px; cursor: pointer; font-size: 0.8rem; background: #fff; }
.btn-secondary { background: #f1f5f9; }
.btn-success { background: #22c55e; color: #fff; border-color: #22c55e; }
.btn-warning { background: #f59e0b; color: #fff; border-color: #f59e0b; }
.btn-danger { background: #ef4444; color: #fff; border-color: #ef4444; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; padding: 2rem; border-radius: 8px; max-width: 400px; width: 90%; }
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
.loading, .empty, .error { padding: 2rem; text-align: center; color: #64748b; }
.error { color: #ef4444; }
</style>
