<template>
  <div class="requests-container">
    <!-- Header -->
    <div class="requests-header-card">
      <div class="header-overlay"></div>
      <div class="header-content">
        <div class="header-info">
          <span class="header-label"><Send :size="18" /> Solicitudes de Fondos</span>
          <h1 class="header-title">Gestiona tus retiros</h1>
          <p class="header-desc">
            Solicita el retiro de tus fondos, revisa el estado de tus solicitudes
            <template v-if="isAdmin">y procesa las solicitudes pendientes de los socios</template>.
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="requests-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'request' }"
        @click="activeTab = 'request'"
      >
        <ArrowUpRight :size="16" /> Solicitar Retiro
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        <ListTodo :size="16" /> Historial
      </button>
      <button
        v-if="isAdmin"
        class="tab-btn admin-tab"
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        <ShieldAlert :size="16" /> Pendientes
        <span v-if="store.pendingCount > 0" class="pending-badge">{{ store.pendingCount }}</span>
      </button>
    </div>

    <!-- Tab Contents -->
    <div class="tab-content-wrapper">
      <RequestForm
        v-if="activeTab === 'request'"
        @submitted="handleRequestSubmitted"
        @error="handleRequestError"
      />

      <RequestsHistory
        v-if="activeTab === 'history'"
        :requests="store.myRequests"
        :loading="store.loading"
        @view-support="openSupportModal"
      />

      <PendingRequestsTable
        v-if="activeTab === 'pending' && isAdmin"
        :requests="store.pendingRequests"
        :loading="store.loading"
        @approve="openApproveModal"
        @reject="handleReject"
      />
    </div>

    <!-- Modal: Aprobar Solicitud (Admin) -->
    <ApproveRequestModal
      v-if="showApproveModal"
      :request="selectedRequest"
      :loading="store.actionLoading"
      @close="closeApproveModal"
      @confirm="handleApprove"
    />

    <!-- Modal: Ver Soporte -->
    <div v-if="showSupportModal" class="modal-overlay" @click.self="closeSupportModal">
      <div class="modal-card">
        <div class="modal-header">
          <h5>Detalles de Soporte</h5>
          <button class="close-btn" @click="closeSupportModal"><X :size="18" /></button>
        </div>
        <div class="modal-body text-center">
          <p class="support-text mb-4" v-if="selectedMovement?.message">
            <strong>Mensaje de Administración:</strong><br />
            {{ selectedMovement.message }}
          </p>
          <div v-if="selectedMovement?.support_image" class="support-img-wrapper">
            <img :src="selectedMovement.support_image" alt="Comprobante" class="support-image" />
          </div>
          <div v-else class="no-support-placeholder">
            <ImageOff :size="32" class="text-muted-icon" />
            <p class="text-muted-icon">No se subió comprobante digital para esta operación.</p>
          </div>
        </div>
        <div class="modal-footer">
          <a
            v-if="selectedMovement?.support_image"
            :href="selectedMovement.support_image"
            download
            target="_blank"
            class="btn btn-premium"
          >
            <Download :size="14" /> Descargar Comprobante
          </a>
          <button class="btn btn-secondary" @click="closeSupportModal">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="toast-notification" :class="toast.type">
      <div class="toast-content">
        <CheckCircle v-if="toast.type === 'success'" :size="18" />
        <AlertTriangle v-else :size="18" />
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Send, ArrowUpRight, ListTodo, ShieldAlert, X, ImageOff,
  Download, CheckCircle, AlertTriangle
} from 'lucide-vue-next';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useRequestsStore } from '../stores/requestsStore';
import RequestForm from '../components/RequestForm.vue';
import RequestsHistory from '../components/RequestsHistory.vue';
import PendingRequestsTable from '../components/PendingRequestsTable.vue';
import ApproveRequestModal from '../components/ApproveRequestModal.vue';

const authStore = useAuthStore();
const store = useRequestsStore();

const userId = computed(() => authStore.user?.id);
const isAdmin = computed(() => {
  const roles = authStore.role || [];
  const normalized = roles.map((r) => String(r).toLowerCase());
  return normalized.includes('admin') || normalized.includes('super-admin');
});

const activeTab = ref('request');
const showApproveModal = ref(false);
const showSupportModal = ref(false);
const selectedRequest = ref(null);
const selectedMovement = ref(null);
const toast = ref({ show: false, message: '', type: 'success' });

onMounted(() => {
  store.fetchMyRequests(userId.value);
  if (isAdmin.value) {
    store.fetchPendingRequests();
  }
});

// ── Crear solicitud ──
function handleRequestSubmitted() {
  showToast('Solicitud de retiro enviada correctamente.', 'success');
  store.fetchMyRequests(userId.value);
  activeTab.value = 'history';
}

function handleRequestError(message) {
  showToast(message, 'error');
}

// ── Aprobar / Rechazar (admin) ──
function openApproveModal(request) {
  selectedRequest.value = request;
  showApproveModal.value = true;
}

function closeApproveModal() {
  selectedRequest.value = null;
  showApproveModal.value = false;
}

async function handleApprove({ id, message, file }) {
  const formData = new FormData();
  formData.append('id', id);
  if (message) formData.append('message', message);
  if (file) formData.append('support_image', file);

  try {
    await store.approveRequest(formData);
    showToast('Solicitud aprobada correctamente.', 'success');
    closeApproveModal();
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.error || 'Error al aprobar la solicitud.';
    showToast(msg, 'error');
  }
}

async function handleReject(id) {
  try {
    await store.rejectRequest(id);
    showToast('Solicitud rechazada correctamente.', 'success');
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.error || 'Error al rechazar la solicitud.';
    showToast(msg, 'error');
  }
}

// ── Soporte ──
function openSupportModal(movement) {
  selectedMovement.value = movement;
  showSupportModal.value = true;
}

function closeSupportModal() {
  selectedMovement.value = null;
  showSupportModal.value = false;
}

// ── Toast ──
function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 4000);
}
</script>

<style scoped>
.requests-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header Card */
.requests-header-card {
  position: relative;
  background: linear-gradient(135deg, #0a1a12 0%, #0d2118 50%, #14532d 100%);
  border-radius: 16px;
  padding: 32px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(11, 245, 11, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  position: relative;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #f3f4f6;
}

.header-label {
  font-size: 14px;
  color: #86efac;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
}

.header-desc {
  font-size: 14px;
  color: #d1d5db;
  margin: 0;
  max-width: 640px;
}

/* Tabs */
.requests-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-bold);
}

.tab-btn.active {
  background: #f0fdf4;
  color: #16a34a;
}

.admin-tab {
  margin-left: auto;
  border: 1px dashed #f43f5e;
  color: #f43f5e;
}

.admin-tab:hover {
  background: #fff1f2;
  color: #e11d48;
}

.admin-tab.active {
  background: #ffe4e6;
  color: #be123c;
  border-style: solid;
}

.pending-badge {
  background: #f43f5e;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
}

/* Tab Panels */
.tab-content-wrapper {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
}

/* Support Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  animation: fadeInModal 0.2s ease-out;
}

@keyframes fadeInModal {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h5 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  color: var(--text-bold);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
}

.close-btn:hover {
  color: var(--text-bold);
  background: rgba(0, 0, 0, 0.05);
}

.modal-body {
  padding: 20px;
}

.text-center {
  text-align: center;
}

.support-text {
  font-size: 14px;
  color: var(--text-main);
  text-align: left;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 16px;
}

.support-img-wrapper {
  margin: 16px auto 0;
  max-height: 350px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.support-image {
  max-width: 100%;
  max-height: 350px;
  object-fit: contain;
}

.no-support-placeholder {
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.text-muted-icon {
  color: var(--text-muted);
}

.mb-4 {
  margin-bottom: 16px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-premium {
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.2);
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.3);
}

.btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.08);
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 8px;
  color: white;
  z-index: 2000;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.toast-notification.success {
  background: #10b981;
}

.toast-notification.error {
  background: #ef4444;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
}
</style>
