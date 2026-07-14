<template>
  <div class="invitation-links">
    <div class="page-header">
      <h1>Enlaces de Invitación</h1>
    </div>

    <div v-if="store.loading" class="loading">Cargando...</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>

    <!-- Sección: Enlace de Patrocinio -->
    <div class="card sponsor-card">
      <div class="card-header">
        <h2>Enlace de Patrocinio</h2>
        <span class="badge-info">Comparte este enlace para invitar personas</span>
      </div>
      <div class="card-body">
        <p class="remaining-time">
          <strong>Tiempo restante:</strong>
          <span :class="store.sponsorRemainingTime > 0 ? 'text-success' : 'text-danger'">
            {{ store.formattedRemainingTime }}
          </span>
        </p>
        <button class="btn-secondary" @click="refreshSponsorTime" :disabled="store.loading">
          Actualizar tiempo
        </button>
      </div>
    </div>

    <!-- Sección: Buscar enlace por tipo de producto -->
    <div class="card">
      <div class="card-header">
        <h2>Enlaces de Producto</h2>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group">
            <label>Tipo de producto</label>
            <select v-model="selectedType" class="form-select">
              <option value="">Seleccionar...</option>
              <option value="masterclass">Masterclass</option>
              <option value="ebook">Ebook</option>
              <option value="mini-course">Mini Curso</option>
            </select>
          </div>
          <div class="form-group">
            <label>ID del producto</label>
            <input v-model.number="selectedProductId" type="number" min="1" placeholder="ID" />
          </div>
        </div>

        <div class="actions">
          <button class="btn-primary" @click="checkInvitation" :disabled="!canSearch || store.loading">
            Verificar enlace
          </button>
          <button class="btn-success" @click="createInvitation" :disabled="!canSearch || store.generating">
            {{ store.generating ? 'Generando...' : 'Generar nuevo enlace' }}
          </button>
        </div>

        <!-- Resultado -->
        <div v-if="store.invitationLink" class="invitation-result">
          <div v-if="store.hasActiveLink" class="alert alert-success">
            <p><strong>Enlace activo:</strong></p>
            <p class="link-display">
              <code>{{ store.invitationLink.invitation_link || store.invitationLink.data?.invitation_link }}</code>
            </p>
            <p v-if="store.invitationLink.data?.expires_at">
              Expira: {{ formatDate(store.invitationLink.data.expires_at) }}
            </p>
          </div>
          <div v-else class="alert alert-info">
            No hay un enlace activo para este producto. Genera uno nuevo.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInvitationLinksStore } from '../stores/invitationLinksStore'

const store = useInvitationLinksStore()

const selectedType = ref('')
const selectedProductId = ref(null)

const canSearch = computed(() => selectedType.value && selectedProductId.value > 0)

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}

async function checkInvitation() {
  await store.checkInvitation(selectedType.value, selectedProductId.value)
}

async function createInvitation() {
  await store.createInvitationLink(selectedType.value, selectedProductId.value)
}

async function refreshSponsorTime() {
  await store.fetchSponsorRemainingTime()
}

onMounted(() => {
  store.fetchSponsorRemainingTime()
})
</script>

<style scoped>
.invitation-links {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
}

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

.badge-info {
  font-size: 0.75rem;
  color: #64748b;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.375rem;
  color: #374151;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.btn-primary,
.btn-secondary,
.btn-success {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }

.btn-success { background: #16a34a; color: #fff; }
.btn-success:hover { background: #15803d; }
.btn-success:disabled { background: #86efac; cursor: not-allowed; }

.btn-secondary { background: #e2e8f0; color: #334155; }
.btn-secondary:hover { background: #cbd5e1; }

.remaining-time {
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;
}

.text-success { color: #16a34a; font-weight: 600; }
.text-danger { color: #dc2626; font-weight: 600; }

.invitation-result {
  margin-top: 1rem;
}

.alert {
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.alert-info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}

.link-display {
  margin-top: 0.5rem;
  word-break: break-all;
}

.link-display code {
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8125rem;
}

.loading,
.error {
  padding: 1rem;
  text-align: center;
  color: #64748b;
}

.error { color: #dc2626; }
</style>
