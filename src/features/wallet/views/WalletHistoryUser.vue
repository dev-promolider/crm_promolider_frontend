<template>
  <div class="wallet-container">
    <!-- Top Header Card -->
    <div class="wallet-header-card">
      <div class="header-overlay"></div>
      <div class="header-content">
        <div class="balance-info">
          <span class="balance-label"><WalletIcon :size="18" /> Saldo Disponible</span>
          <h1 class="balance-amount">{{ formatMoney(walletBalance) }}</h1>
          <div class="balance-breakdown">
            <span class="breakdown-item text-success-light">
              <CheckCircle :size="14" /> Aprobado: {{ formatMoney(walletApproved) }}
            </span>
            <span class="breakdown-item text-warning-light">
              <Clock :size="14" /> Pendiente: {{ formatMoney(walletPending) }}
            </span>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn btn-premium btn-icon" @click="openModal('solicitud')">
            <ArrowUpRight :size="16" /> Solicitar Retiro
          </button>
          <button class="btn btn-secondary btn-icon" @click="openModal('transferencia')">
            <RefreshCw :size="16" /> Trasladar Fondos
          </button>
          <button class="btn btn-accent btn-icon" @click="openModal('recarga')">
            <Plus :size="16" /> Recargar
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="wallet-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'movements' }" 
        @click="activeTab = 'movements'"
      >
        <ListTodo :size="16" /> Movimientos
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'binary' }" 
        @click="activeTab = 'binary'"
      >
        <TrendingUp :size="16" /> Historial Binario
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'sales' }" 
        @click="activeTab = 'sales'"
      >
        <DollarSign :size="16" /> Reporte de Ventas
      </button>
      <button 
        v-if="isAdmin"
        class="tab-btn admin-tab" 
        :class="{ active: activeTab === 'requests' }" 
        @click="activeTab = 'requests'"
      >
        <ShieldAlert :size="16" /> Solicitudes de Socios
      </button>
    </div>

    <!-- Tab Contents -->
    <div class="tab-content-wrapper">
      
      <!-- 1. MOVEMENTS TAB -->
      <div v-if="activeTab === 'movements'" class="tab-pane">
        <div class="table-header">
          <h3>Historial de Transacciones</h3>
          <Loader2 v-if="loadingMovements" :size="18" class="spinner" />
        </div>
        
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Concepto / Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="movement in movements" :key="movement.id">
                <td>{{ formatDateString(movement.created_at) }}</td>
                <td class="font-weight-bolder" :class="getMovementClass(movement)">
                  {{ getMovementPrefix(movement) }}{{ formatMoney(movement.amount) }}
                </td>
                <td>{{ movement.reason }}</td>
                <td>
                  <span class="badge-status" :class="getStatusBadgeClass(movement.status)">
                    {{ getStatusLabel(movement.status) }}
                  </span>
                </td>
                <td>
                  <button 
                    v-if="movement.support_image || movement.message" 
                    class="btn-table-action" 
                    @click="viewSupport(movement)"
                  >
                    <Eye :size="14" /> Ver Soporte
                  </button>
                  <span v-else class="text-muted text-xs">-</span>
                </td>
              </tr>
              <tr v-if="movements.length === 0 && !loadingMovements">
                <td colspan="5" class="empty-row">
                  <Inbox :size="24" />
                  <p>No se encontraron movimientos registrados.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. BINARY HISTORY TAB -->
      <div v-if="activeTab === 'binary'" class="tab-pane">
        <div class="table-header">
          <h3>Historial de Cortes Binarios</h3>
          <div class="search-bar">
            <Search :size="16" class="search-icon" />
            <input 
              type="text" 
              v-model="binarySearch" 
              placeholder="Buscar por rango o fecha..." 
              @input="debouncedFetchBinary"
            />
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Fecha de Corte</th>
                <th>Puntos Izq</th>
                <th>Puntos Der</th>
                <th>Rango Alcanzado</th>
                <th>Bono Recibido</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cut in binaryHistory" :key="cut.id">
                <td>{{ formatDateString(cut.created_at) }}</td>
                <td>{{ cut.left_points || 0 }}</td>
                <td>{{ cut.right_points || 0 }}</td>
                <td>
                  <span class="rank-tag" v-if="cut.rank">
                    {{ cut.rank.name }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="font-weight-bolder text-success">
                  {{ formatMoney(cut.amount || 0) }}
                </td>
              </tr>
              <tr v-if="binaryHistory.length === 0 && !loadingBinary">
                <td colspan="5" class="empty-row">
                  <TrendingUp :size="24" />
                  <p>No hay cortes binarios registrados.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-footer" v-if="binaryTotalPages > 1">
          <button 
            :disabled="binaryPage === 1" 
            @click="changeBinaryPage(binaryPage - 1)"
            class="btn-page"
          >
            &laquo; Anterior
          </button>
          <span>Página {{ binaryPage }} de {{ binaryTotalPages }}</span>
          <button 
            :disabled="binaryPage === binaryTotalPages" 
            @click="changeBinaryPage(binaryPage + 1)"
            class="btn-page"
          >
            Siguiente &raquo;
          </button>
        </div>
      </div>

      <!-- 3. SALES TAB -->
      <div v-if="activeTab === 'sales'" class="tab-pane">
        <div class="table-header">
          <h3>Reporte de Ventas y Comisiones</h3>
          <Loader2 v-if="loadingSales" :size="18" class="spinner" />
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Socio Asociado</th>
                <th>Concepto / Tipo de Bono</th>
                <th>Monto de Comisión</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sale, idx) in sales" :key="idx">
                <td>{{ formatDateString(sale.created_at) }}</td>
                <td>{{ sale.name }} {{ sale.last_name }}</td>
                <td>
                  <span class="bonus-tag" :class="getBonusTagClass(sale.bonus_type_id)">
                    {{ getBonusLabel(sale.bonus_type_id) }}
                  </span>
                  <div class="text-muted text-xs mt-1">{{ sale.reason }}</div>
                </td>
                <td class="font-weight-bolder text-success">
                  {{ formatMoney(sale.amount) }}
                </td>
              </tr>
              <tr v-if="sales.length === 0 && !loadingSales">
                <td colspan="4" class="empty-row">
                  <DollarSign :size="24" />
                  <p>No hay comisiones de ventas registradas en el período actual.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. ADMIN REQUESTS TAB -->
      <div v-if="activeTab === 'requests' && isAdmin" class="tab-pane">
        <div class="table-header">
          <h3>Solicitudes de Retiro Pendientes</h3>
          <Loader2 v-if="loadingRequests" :size="18" class="spinner" />
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Monto Solicitado</th>
                <th>Detalles de Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in pendingRequests" :key="req.id">
                <td>
                  <div class="user-cell">
                    <span class="user-name">{{ req.wallet?.user?.name }} {{ req.wallet?.user?.last_name }}</span>
                    <span class="user-username">@{{ req.wallet?.user?.username }}</span>
                  </div>
                </td>
                <td class="font-weight-bolder text-warning">
                  {{ formatMoney(req.amount) }}
                </td>
                <td>
                  <div class="payment-details">
                    <span class="method-badge">{{ req.account_type }}</span>
                    <span class="account-num">{{ req.account_number }}</span>
                  </div>
                </td>
                <td>
                  <div class="admin-actions">
                    <button class="btn-approve" @click="openApproveModal(req)">
                      <Check :size="14" /> Aprobar
                    </button>
                    <button class="btn-reject" @click="handleRejectRequest(req.id)">
                      <X :size="14" /> Rechazar
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="pendingRequests.length === 0 && !loadingRequests">
                <td colspan="4" class="empty-row">
                  <ShieldCheck :size="24" class="text-success" />
                  <p>¡Buen trabajo! No hay solicitudes pendientes de aprobación.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- MODALS -->

    <!-- Modal: Solicitud de Retiro -->
    <div v-if="activeModal === 'solicitud'" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h5>Solicitud de Retiro de Fondos</h5>
          <button class="close-btn" @click="closeModal"><X :size="18" /></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Monto a Retirar (USD)</label>
            <input 
              type="number" 
              v-model.number="formRequest.amount" 
              placeholder="Min $20" 
              class="form-control"
              min="20"
            />
            <small class="text-muted">Monto mínimo de retiro: $20.00</small>
          </div>

          <div class="form-group">
            <label>Tipo de Cuenta / Billetera</label>
            <select v-model="formRequest.account_type" class="form-control" @change="onAccountTypeChange">
              <option value="">Seleccione opción</option>
              <option value="paypal">PayPal</option>
              <option value="binance">Binance (USDT)</option>
            </select>
          </div>

          <!-- Dynamic account listing or manual entry -->
          <div class="form-group" v-if="formRequest.account_type">
            <label>Cuenta de Destino</label>
            
            <select 
              v-if="availableAccounts.length > 0" 
              v-model="formRequest.account_number" 
              class="form-control"
            >
              <option value="">Seleccione cuenta configurada</option>
              <option 
                v-for="acc in availableAccounts" 
                :key="acc.id" 
                :value="getAccountVal(acc)"
              >
                {{ getAccountDisplay(acc) }}
              </option>
            </select>

            <!-- Manual input input fallback -->
            <div v-else class="manual-input-box">
              <input 
                type="text" 
                v-model="formRequest.account_number" 
                :placeholder="getPlaceholderText(formRequest.account_type)" 
                class="form-control"
              />
              <small class="text-warning-light mt-1 d-block">
                No tienes cuentas configuradas. Ingresa los datos manualmente.
              </small>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button 
            class="btn btn-premium" 
            :disabled="!isRequestFormValid || loadingAction" 
            @click="handleRequestFunds"
          >
            <Loader2 v-if="loadingAction" class="spinner" :size="14" />
            Enviar Solicitud
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Traslado de Fondos -->
    <div v-if="activeModal === 'transferencia'" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h5>Trasladar Fondos a Referido Directo</h5>
          <button class="close-btn" @click="closeModal"><X :size="18" /></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Monto a Trasladar (USD)</label>
            <input 
              type="number" 
              v-model.number="formTransfer.amount" 
              placeholder="Min $20" 
              class="form-control"
              min="20"
            />
            <small class="text-muted">Monto mínimo a transferir: $20.00</small>
          </div>

          <div class="form-group">
            <label>Socio Referido Directo</label>
            <select v-model="formTransfer.direct" class="form-control">
              <option value="">Seleccione socio</option>
              <option 
                v-for="dir in myDirects" 
                :key="dir.id" 
                :value="dir.id"
              >
                {{ dir.name }} {{ dir.last_name }} (@{{ dir.username }})
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button 
            class="btn btn-premium" 
            :disabled="!isTransferFormValid || loadingAction" 
            @click="handleTransferFunds"
          >
            <Loader2 v-if="loadingAction" class="spinner" :size="14" />
            Realizar Traslado
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Recargar Fondos -->
    <div v-if="activeModal === 'recarga'" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h5>Recargar Fondos</h5>
          <button class="close-btn" @click="closeModal"><X :size="18" /></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Monto a Recargar (USD)</label>
            <input 
              type="number" 
              v-model.number="formRecharge.amount" 
              placeholder="Monto" 
              class="form-control"
              min="1"
            />
          </div>
          <div class="form-group">
            <label>Método de Pago</label>
            <select v-model="formRecharge.type_payment" class="form-control">
              <option :value="1">Tarjeta de Crédito / Débito</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button 
            class="btn btn-premium" 
            :disabled="formRecharge.amount <= 0" 
            @click="handleRecharge"
          >
            Ir a Pagar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Ver Soporte de Transacción -->
    <div v-if="activeModal === 'support'" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h5>Detalles de Soporte</h5>
          <button class="close-btn" @click="closeModal"><X :size="18" /></button>
        </div>
        <div class="modal-body text-center">
          <p class="support-text mb-4" v-if="selectedMovement.message">
            <strong>Mensaje de Administración:</strong><br />
            {{ selectedMovement.message }}
          </p>
          <div v-if="selectedMovement.support_image" class="support-img-wrapper">
            <img :src="selectedMovement.support_image" alt="Comprobante" class="support-image" />
          </div>
          <div v-else class="no-support-placeholder">
            <ImageOff :size="32" class="text-muted mb-2" />
            <p>No se subió comprobante digital para esta operación.</p>
          </div>
        </div>
        <div class="modal-footer">
          <a 
            v-if="selectedMovement.support_image" 
            :href="selectedMovement.support_image" 
            download 
            target="_blank" 
            class="btn btn-premium"
          >
            <Download :size="14" /> Descargar Comprobante
          </a>
          <button class="btn btn-secondary" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Aprobar Solicitud con Soporte (Admin) -->
    <div v-if="activeModal === 'approve'" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h5>Aprobar Solicitud de Retiro</h5>
          <button class="close-btn" @click="closeModal"><X :size="18" /></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Mensaje o Nota de Aprobación</label>
            <textarea 
              v-model="formApprove.message" 
              placeholder="Escribe detalles del depósito o transacción..." 
              class="form-control"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>Subir Comprobante (Imagen)</label>
            <input 
              type="file" 
              @change="handleFileChange" 
              accept="image/*" 
              class="form-control"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button 
            class="btn btn-premium" 
            :disabled="loadingAction" 
            @click="handleApproveRequest"
          >
            <Loader2 v-if="loadingAction" class="spinner" :size="14" />
            Confirmar Aprobación
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Component -->
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
import { useAuthStore } from '@/features/auth/stores/authStore';
import walletService from '../services/walletService';
import apiClient from '@/services/apiClient';
import { formatDate } from '@/utils/formatDate';
import {
  Wallet as WalletIcon, CheckCircle, Clock, ArrowUpRight, RefreshCw, Plus, 
  ListTodo, TrendingUp, DollarSign, ShieldAlert, Eye, Inbox, Search, 
  ShieldCheck, X, Check, ImageOff, Download, Loader2, AlertTriangle
} from 'lucide-vue-next';

const authStore = useAuthStore();
const userId = computed(() => authStore.user?.id);
const isAdmin = computed(() => {
  const roles = authStore.role || [];
  return roles.map(r => String(r).toLowerCase()).includes('admin') || 
         roles.map(r => String(r).toLowerCase()).includes('super-admin');
});

// State variables
const walletBalance = ref(0);
const walletApproved = ref(0);
const walletPending = ref(0);
const movements = ref([]);
const binaryHistory = ref([]);
const sales = ref([]);
const pendingRequests = ref([]);
const myDirects = ref([]);
const paypalAccounts = ref([]);
const binanceAccounts = ref([]);

const activeTab = ref('movements');
const activeModal = ref(null);
const selectedMovement = ref({});

// Loaders
const loadingMovements = ref(false);
const loadingBinary = ref(false);
const loadingSales = ref(false);
const loadingRequests = ref(false);
const loadingAction = ref(false);

// Forms
const formRequest = ref({ amount: '', account_type: '', account_number: '' });
const formTransfer = ref({ amount: '', direct: '' });
const formRecharge = ref({ amount: '', type_payment: 1 });
const formApprove = ref({ id: null, message: '', support_image: null });

// Search & Pagination
const binarySearch = ref('');
const binaryPage = ref(1);
const binaryTotalPages = ref(1);
const perPage = ref(10);

// Toast
const toast = ref({ show: false, message: '', type: 'success' });

// Form validations
const isRequestFormValid = computed(() => {
  return formRequest.value.amount >= 20 &&
         formRequest.value.account_type &&
         formRequest.value.account_number.trim() !== '';
});

const isTransferFormValid = computed(() => {
  return formTransfer.value.amount >= 20 &&
         formTransfer.value.direct;
});

const availableAccounts = computed(() => {
  if (formRequest.value.account_type === 'paypal') return paypalAccounts.value;
  if (formRequest.value.account_type === 'binance') return binanceAccounts.value;
  return [];
});

// Initialization
onMounted(() => {
  loadBalance();
  loadMovements();
  loadBinaryHistory();
  loadSales();
  loadDirects();
  
  if (isAdmin.value) {
    loadPendingRequests();
  }
});

// Data loaders
async function loadBalance() {
  try {
    const response = await walletService.getWalletBalance();
    walletBalance.value = response.data?.total_balance || 0;
    walletApproved.value = response.data?.breakdown?.approved_amount || 0;
    walletPending.value = response.data?.breakdown?.pending_amount || 0;
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
}

async function loadMovements() {
  if (!userId.value) return;
  loadingMovements.value = true;
  try {
    const response = await walletService.getAllMovements(userId.value);
    movements.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error loading movements:', error);
  } finally {
    loadingMovements.value = false;
  }
}

async function loadBinaryHistory() {
  loadingBinary.value = true;
  try {
    const response = await walletService.getBinaryHistory({
      search: binarySearch.value,
      page: binaryPage.value,
      per_page: perPage.value
    });
    binaryHistory.value = response.data?.data || [];
    binaryTotalPages.value = response.data?.last_page || 1;
  } catch (error) {
    console.error('Error loading binary history:', error);
  } finally {
    loadingBinary.value = false;
  }
}

async function loadSales() {
  if (!userId.value) return;
  loadingSales.value = true;
  try {
    const response = await walletService.getSales(userId.value);
    sales.value = response.data?.data || [];
  } catch (error) {
    console.error('Error loading sales:', error);
  } finally {
    loadingSales.value = false;
  }
}

async function loadPendingRequests() {
  loadingRequests.value = true;
  try {
    const response = await walletService.getRequestFundsList();
    pendingRequests.value = response.data || [];
  } catch (error) {
    console.error('Error loading pending requests:', error);
  } finally {
    loadingRequests.value = false;
  }
}

async function loadDirects() {
  try {
    const response = await apiClient.get('/reports/movements/my-directs');
    myDirects.value = response.data || [];
  } catch (error) {
    console.error('Error loading directs:', error);
  }
}

// Payment accounts API fallbacks
async function onAccountTypeChange() {
  formRequest.value.account_number = '';
  if (formRequest.value.account_type === 'paypal') {
    try {
      const res = await apiClient.get('/payment/paypal-accounts');
      paypalAccounts.value = res.data?.data || res.data || [];
    } catch {
      paypalAccounts.value = [];
    }
  } else if (formRequest.value.account_type === 'binance') {
    try {
      const res = await apiClient.get('/payment/binance-accounts');
      binanceAccounts.value = res.data?.data || res.data || [];
    } catch {
      binanceAccounts.value = [];
    }
  }
}

// Helpers
function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDateString(dateStr) {
  if (!dateStr) return '-';
  return formatDate(dateStr);
}

function getMovementPrefix(m) {
  if (m.type === 0) {
    return m.id_receiver === userId.value ? '+' : '-';
  }
  return '+';
}

function getMovementClass(m) {
  if (m.status === 2) return 'text-danger';
  if (m.status === 0) return 'text-warning';
  if (m.type === 0 && m.id_receiver !== userId.value) return 'text-danger';
  return 'text-success';
}

function getStatusLabel(status) {
  if (status === 0) return 'Pendiente';
  if (status === 1) return 'Aprobado';
  return 'Rechazado';
}

function getStatusBadgeClass(status) {
  if (status === 0) return 'badge-warning';
  if (status === 1) return 'badge-success';
  return 'badge-danger';
}

function getBonusLabel(typeId) {
  if (typeId === 2) return 'Bono Directo';
  if (typeId === 3) return 'Bono Binario';
  return 'Comisión';
}

function getBonusTagClass(typeId) {
  if (typeId === 2) return 'tag-primary';
  if (typeId === 3) return 'tag-purple';
  return 'tag-gray';
}

function getAccountDisplay(acc) {
  if (formRequest.value.account_type === 'paypal') {
    return `${acc.account_name} (${acc.email})`;
  }
  return `${acc.account_name} (${acc.binance_id})`;
}

function getAccountVal(acc) {
  return formRequest.value.account_type === 'paypal' ? acc.email : acc.binance_id;
}

function getPlaceholderText(type) {
  return type === 'paypal' ? 'ejemplo@correo.com' : 'ID de Binance o Billetera USDT';
}

// Actions handlers
async function handleRequestFunds() {
  if (walletBalance.value < formRequest.value.amount) {
    showToast('Saldo insuficiente para retirar.', 'error');
    return;
  }

  loadingAction.value = true;
  try {
    await walletService.requestFunds(
      formRequest.value.amount,
      formRequest.value.account_type,
      formRequest.value.account_number
    );
    showToast('Solicitud de retiro enviada correctamente.', 'success');
    closeModal();
    loadBalance();
    loadMovements();
  } catch (error) {
    showToast(error.response?.data?.error || 'Error al procesar retiro.', 'error');
  } finally {
    loadingAction.value = false;
  }
}

async function handleTransferFunds() {
  loadingAction.value = true;
  try {
    await walletService.transferFunds(
      formTransfer.value.direct,
      formTransfer.value.amount
    );
    showToast('Fondos trasladados exitosamente.', 'success');
    closeModal();
    loadBalance();
    loadMovements();
  } catch (error) {
    showToast(error.response?.data?.error || 'Error al trasladar fondos.', 'error');
  } finally {
    loadingAction.value = false;
  }
}

function handleRecharge() {
  if (formRecharge.value.amount <= 0) return;
  // Redirect to payment system
  window.location.href = `/pay/recharge-openpay/${formRecharge.value.amount}/${formRecharge.value.type_payment}`;
}

async function handleRejectRequest(id) {
  if (!confirm('¿Está seguro de rechazar esta solicitud de retiro?')) return;
  
  try {
    await walletService.rejectRequest(id);
    showToast('Solicitud rechazada correctamente.', 'success');
    loadPendingRequests();
  } catch (error) {
    showToast('Error al rechazar solicitud.', 'error');
  }
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    formApprove.value.support_image = file;
  }
}

async function handleApproveRequest() {
  loadingAction.value = true;
  const formData = new FormData();
  formData.append('id', formApprove.value.id);
  formData.append('message', formApprove.value.message);
  if (formApprove.value.support_image) {
    formData.append('support_image', formApprove.value.support_image);
  }

  try {
    await walletService.approveRequest(formData);
    showToast('Solicitud aprobada correctamente.', 'success');
    closeModal();
    loadPendingRequests();
  } catch (error) {
    showToast(error.response?.data?.error || 'Error al aprobar solicitud.', 'error');
  } finally {
    loadingAction.value = false;
  }
}

// Search and paging
let searchTimeout;
function debouncedFetchBinary() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    binaryPage.value = 1;
    loadBinaryHistory();
  }, 400);
}

function changeBinaryPage(page) {
  binaryPage.value = page;
  loadBinaryHistory();
}

// Modal managers
function openModal(modalName) {
  activeModal.value = modalName;
  // reset forms
  formRequest.value = { amount: '', account_type: '', account_number: '' };
  formTransfer.value = { amount: '', direct: '' };
  formRecharge.value = { amount: '', type_payment: 1 };
  formApprove.value = { id: null, message: '', support_image: null };
}

function openApproveModal(req) {
  activeModal.value = 'approve';
  formApprove.value.id = req.id;
  formApprove.value.message = '';
  formApprove.value.support_image = null;
}

function viewSupport(movement) {
  selectedMovement.value = movement;
  activeModal.value = 'support';
}

function closeModal() {
  activeModal.value = null;
  selectedMovement.value = {};
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 4000);
}
</script>

<style scoped>
.wallet-container {
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
.wallet-header-card {
  position: relative;
  background: linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #4c1d95 100%);
  border-radius: 16px;
  padding: 32px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(76, 29, 149, 0.15);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #f3f4f6;
}

.balance-label {
  font-size: 14px;
  color: #c084fc;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.balance-amount {
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -1px;
  background: linear-gradient(to right, #ffffff, #e9d5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.balance-breakdown {
  display: flex;
  gap: 16px;
  font-size: 13px;
  margin-top: 4px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.text-success-light { color: #86efac; }
.text-warning-light { color: #fde047; }

/* Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-premium {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-accent {
  background: #f43f5e;
  color: white;
  box-shadow: 0 4px 15px rgba(244, 63, 94, 0.2);
}

.btn-accent:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 63, 94, 0.3);
}

/* Tabs */
.wallet-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.tab-btn {
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.tab-btn.active {
  background: #f3f4f6;
  color: #7c3aed;
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

/* Tab Panels */
.tab-content-wrapper {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f3f4f6;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.table-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* Custom Table */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.table-custom {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.table-custom th {
  padding: 12px 16px;
  font-size: 12px;
  text-transform: uppercase;
  color: #6b7280;
  font-weight: 700;
  border-bottom: 2px solid #f3f4f6;
}

.table-custom td {
  padding: 16px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.table-custom tbody tr:hover {
  background: #fafafa;
}

.empty-row {
  text-align: center;
  padding: 48px 16px !important;
  color: #9ca3af;
}

.empty-row p {
  margin: 12px 0 0 0;
  font-size: 14px;
}

/* Badges & Tags */
.badge-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}

.badge-warning { background: #fef3c7; color: #d97706; }
.badge-success { background: #dcfce7; color: #15803d; }
.badge-danger { background: #fee2e2; color: #b91c1c; }

.rank-tag {
  background: #f5f3ff;
  color: #7c3aed;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  border: 1px solid #ddd6fe;
}

.bonus-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.tag-primary { background: #eff6ff; color: #1d4ed8; }
.tag-purple { background: #faf5ff; color: #6b21a8; }
.tag-gray { background: #f3f4f6; color: #374151; }

/* Admin actions */
.admin-actions {
  display: flex;
  gap: 8px;
}

.btn-approve {
  background: #22c55e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-reject {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-table-action {
  background: transparent;
  border: 1px solid #ddd6fe;
  color: #7c3aed;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-table-action:hover {
  background: #f5f3ff;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
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
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h5 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 6px;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.form-control:focus {
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.manual-input-box {
  background: #fbfbfe;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0f0;
}

/* Support Modal Img */
.support-img-wrapper {
  margin: 16px auto 0;
  max-height: 350px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.support-image {
  max-width: 100%;
  max-height: 350px;
  object-fit: contain;
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
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
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

/* Spinner */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* search */
.search-bar {
  position: relative;
  width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-bar input {
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  width: 100%;
}

.search-bar input:focus {
  border-color: #a855f7;
}

.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.btn-page {
  padding: 8px 14px;
  border-radius: 6px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
