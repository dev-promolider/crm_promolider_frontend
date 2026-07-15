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
        <Settings :size="16" /> Configuración de Billetera
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'redemption' }" 
        @click="activeTab = 'redemption'"
      >
        <Award :size="16" /> Canje de Premios
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
        <!-- Filter Bar -->
        <div class="movements-filter-bar">
          <div class="filter-bar-top">
            <h3 class="filter-title">Historial de Transacciones</h3>
            <Loader2 v-if="loadingMovements" :size="18" class="spinner" />
          </div>

          <div class="filter-controls">
            <!-- Fecha desde -->
            <div class="filter-group">
              <label class="filter-label">Desde</label>
              <div class="filter-input-wrapper">
                <input
                  type="date"
                  v-model="movFilterFrom"
                  class="filter-input"
                  @change="changeMovPage(1)"
                />
              </div>
            </div>

            <!-- Fecha hasta -->
            <div class="filter-group">
              <label class="filter-label">Hasta</label>
              <div class="filter-input-wrapper">
                <input
                  type="date"
                  v-model="movFilterTo"
                  class="filter-input"
                  @change="changeMovPage(1)"
                />
              </div>
            </div>

            <!-- Estado -->
            <div class="filter-group">
              <label class="filter-label">Estado</label>
              <div class="filter-input-wrapper">
                <select
                  v-model="movFilterStatus"
                  class="filter-input filter-select"
                  @change="changeMovPage(1)"
                >
                  <option value="">Todos</option>
                  <option value="approved">Aprobado</option>
                  <option value="pending">Pendiente</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>
            </div>

            <!-- Buscar concepto -->
            <div class="filter-group filter-group--wide">
              <label class="filter-label">Concepto / Motivo</label>
              <div class="filter-input-wrapper filter-search-wrapper">
                <Search :size="14" class="filter-search-icon" />
                <input
                  type="text"
                  v-model="movFilterSearch"
                  placeholder="Buscar por concepto..."
                  class="filter-input filter-input--search"
                  @input="debouncedFetchMovements"
                  @keyup.enter="changeMovPage(1)"
                />
              </div>
            </div>

            <!-- Por página -->
            <div class="filter-group">
              <label class="filter-label">Por página</label>
              <div class="filter-input-wrapper">
                <select
                  v-model="movPerPage"
                  class="filter-input filter-select"
                  @change="changeMovPage(1)"
                >
                  <option :value="10">10</option>
                  <option :value="15">15</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                </select>
              </div>
            </div>

            <!-- Limpiar filtros -->
            <div class="filter-group filter-group--action">
              <button
                class="btn-clear-filters"
                @click="clearMovFilters"
                :disabled="!movFilterFrom && !movFilterTo && !movFilterStatus && !movFilterSearch"
              >
                <X :size="14" /> Limpiar
              </button>
            </div>
          </div>

          <!-- Results summary -->
          <div class="filter-summary" v-if="movTotal > 0">
            <span class="filter-badge">
              Mostrando {{ movFrom }}–{{ movTo }} de {{ movTotal }} movimientos
            </span>
          </div>
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

        <!-- Pagination footer -->
        <div class="pagination-footer" v-if="movTotalPages > 1">
          <span class="pag-info">
            Página {{ movPage }} de {{ movTotalPages }}
          </span>
          <div class="pag-controls">
            <button
              class="btn-page"
              :disabled="movPage === 1"
              @click="changeMovPage(1)"
              title="Primera página"
            >&laquo;</button>
            <button
              class="btn-page"
              :disabled="movPage === 1"
              @click="changeMovPage(movPage - 1)"
            >&lsaquo; Anterior</button>

            <button
              v-for="p in movTotalPages"
              :key="p"
              class="btn-page btn-page-num"
              :class="{ active: p === movPage }"
              @click="changeMovPage(p)"
              v-show="Math.abs(p - movPage) <= 2"
            >{{ p }}</button>

            <button
              class="btn-page"
              :disabled="movPage === movTotalPages"
              @click="changeMovPage(movPage + 1)"
            >Siguiente &rsaquo;</button>
            <button
              class="btn-page"
              :disabled="movPage === movTotalPages"
              @click="changeMovPage(movTotalPages)"
              title="Última página"
            >&raquo;</button>
          </div>
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

      <!-- 5. CONFIG TAB -->
      <div v-if="activeTab === 'config'" class="tab-pane">
        <div class="wallet-config-grid">
          
          <!-- Left Column: Form to Add/Edit Payment Method -->
          <div class="config-card form-section">
            <div class="card-header-clean">
              <Coins :size="20" class="text-premium" />
              <h3>{{ isEditingAccount ? 'Editar Cuenta de Pago' : 'Agregar Método de Pago' }}</h3>
            </div>
            
            <div class="form-group mt-4" v-if="!isEditingAccount">
              <label>Método de Pago</label>
              <select v-model="selectedMethod" class="form-control" @change="handleConfigSelectChange">
                <option value="">Selecciona un método</option>
                <option v-for="method in listMethods" :key="method.id" :value="method.id">
                  {{ method.name }}
                </option>
              </select>
            </div>

            <div v-if="selectedMethod === 'binance' || (isEditingAccount && editingAccountType === 'binance')" class="method-form-fields mt-3">
              <div class="form-group">
                <label>Nombre del Titular</label>
                <input type="text" v-model="configForm.account_name" class="form-control" placeholder="Solo letras" :class="{ 'error-border': configErrors.account_name }">
                <small v-if="configErrors.account_name" class="error-msg">Por favor ingrese un nombre válido (solo letras).</small>
              </div>

              <div class="form-group">
                <label>Correo Electrónico (Binance)</label>
                <input type="email" v-model="configForm.email" class="form-control" placeholder="correo@ejemplo.com" :class="{ 'error-border': configErrors.email }">
                <small v-if="configErrors.email" class="error-msg">Ingrese un correo electrónico válido.</small>
              </div>

              <div class="form-group">
                <label>Binance ID / Dirección USDT</label>
                <input type="text" v-model="configForm.binance_id" class="form-control" placeholder="Binance ID o Wallet Address" :class="{ 'error-border': configErrors.binance_id }">
                <small v-if="configErrors.binance_id" class="error-msg">Este campo es requerido.</small>
              </div>

              <div class="form-group">
                <label>Red</label>
                <select v-model="configForm.network" class="form-control">
                  <option value="BSC">BSC (BEP20)</option>
                  <option value="ETH">ETH (ERC20)</option>
                  <option value="TRX">TRX (TRC20)</option>
                  <option value="BTC">BTC</option>
                </select>
              </div>

              <div class="form-group">
                <label>Teléfono (Opcional)</label>
                <input type="text" v-model="configForm.phone" class="form-control" placeholder="+51 999 999 999">
              </div>
            </div>

            <div v-if="selectedMethod === 'paypal' || (isEditingAccount && editingAccountType === 'paypal')" class="method-form-fields mt-3">
              <div class="form-group">
                <label>Nombre del Titular</label>
                <input type="text" v-model="configForm.account_name" class="form-control" placeholder="Solo letras" :class="{ 'error-border': configErrors.account_name }">
                <small v-if="configErrors.account_name" class="error-msg">Por favor ingrese un nombre válido (solo letras).</small>
              </div>

              <div class="form-group">
                <label>Correo Electrónico PayPal</label>
                <input type="email" v-model="configForm.email" class="form-control" placeholder="correo@paypal.com" :class="{ 'error-border': configErrors.email }">
                <small v-if="configErrors.email" class="error-msg">Ingrese un correo electrónico válido.</small>
              </div>

              <div class="form-group">
                <label>País</label>
                <select v-model="configForm.country_code" class="form-control">
                  <option value="PE">Perú</option>
                  <option value="US">Estados Unidos</option>
                  <option value="MX">México</option>
                  <option value="CO">Colombia</option>
                  <option value="AR">Argentina</option>
                </select>
              </div>

              <div class="form-group">
                <label>Moneda</label>
                <select v-model="configForm.currency" class="form-control">
                  <option value="USD">USD - Dólar Estadounidense</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="PEN">PEN - Sol Peruano</option>
                </select>
              </div>

              <div class="form-group">
                <label>Tipo de Cuenta</label>
                <select v-model="configForm.account_type" class="form-control">
                  <option value="personal">Personal</option>
                  <option value="business">Negocios (Business)</option>
                </select>
              </div>
            </div>

            <div class="form-actions mt-4" v-if="selectedMethod || isEditingAccount">
              <button class="btn btn-premium btn-block" :disabled="loadingConfigSave" @click="savePaymentAccount">
                <Loader2 v-if="loadingConfigSave" class="spinner" :size="16" />
                {{ isEditingAccount ? 'Actualizar Cuenta' : 'Guardar Cuenta' }}
              </button>
              <button v-if="isEditingAccount" class="btn btn-secondary btn-block mt-2" @click="resetConfigForm">
                Cancelar Edición
              </button>
            </div>
          </div>

          <!-- Right Column: List of Saved Payment Methods -->
          <div class="config-card list-section">
            <div class="card-header-clean">
              <ListTodo :size="20" class="text-premium" />
              <h3>Mis Cuentas de Pago</h3>
            </div>

            <div v-if="loadingAccounts" class="empty-loader mt-5">
              <Loader2 class="spinner text-primary" :size="30" />
              <p class="mt-2 text-muted">Cargando métodos de pago...</p>
            </div>

            <div v-else class="payment-accounts-list mt-4">
              <div v-for="account in paymentAccounts" :key="`${account.type}-${account.id}`" class="payment-account-item">
                <div class="item-header">
                  <div class="method-badge-premium" :class="account.type">
                    <Globe v-if="account.type === 'paypal'" :size="14" />
                    <Coins v-else :size="14" />
                    <span>{{ account.method }}</span>
                  </div>
                  <div class="item-actions">
                    <button class="action-icon-btn edit" @click="startEditAccount(account)" title="Editar">
                      <Edit3 :size="14" />
                    </button>
                    <button class="action-icon-btn delete" @click="deletePaymentAccount(account)" title="Eliminar">
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </div>

                <div class="item-body mt-3">
                  <div class="detail-row">
                    <span class="label">Titular:</span>
                    <span class="val">{{ account.account_name }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Correo:</span>
                    <span class="val">{{ account.email }}</span>
                  </div>
                  <div class="detail-row" v-if="account.type === 'binance'">
                    <span class="label">Binance ID:</span>
                    <span class="val font-mono">{{ account.account_number }}</span>
                  </div>
                  <div class="detail-row" v-if="account.type === 'binance'">
                    <span class="label">Red:</span>
                    <span class="val badge-network">{{ account.extra_info.network }}</span>
                  </div>
                  <div class="detail-row" v-if="account.type === 'paypal'">
                    <span class="label">País/Moneda:</span>
                    <span class="val">{{ account.extra_info.country_code }} ({{ account.extra_info.currency }})</span>
                  </div>
                  <div class="detail-row" v-if="account.type === 'paypal'">
                    <span class="label">Tipo:</span>
                    <span class="val capitalize">{{ account.extra_info.account_type }}</span>
                  </div>
                </div>
              </div>

              <div v-if="paymentAccounts.length === 0" class="empty-list">
                <Inbox :size="32" class="text-muted" />
                <p class="mt-2 text-muted">No tienes métodos de pago registrados.</p>
                <span class="text-xs text-muted-light">Agrega uno a la izquierda para poder solicitar retiros de fondos.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. REDEMPTION TAB -->
      <div v-if="activeTab === 'redemption'" class="tab-pane">
        
        <!-- Credits Summary Banner Card -->
        <div class="redemption-credits-banner">
          <div class="banner-overlay"></div>
          <div class="banner-content">
            <div class="credits-info">
              <span class="banner-label"><Coins :size="20" /> Créditos Disponibles</span>
              <h2 class="credits-amount">{{ formatMoney(availableCredits) }}</h2>
              <p class="credits-desc">¡Canjea tus créditos acumulados por fabulosos cursos, membresías y premios!</p>
            </div>
            <div class="banner-icon-bg">
              <Award :size="80" />
            </div>
          </div>
        </div>

        <div class="rewards-section mt-4">
          <div class="section-header">
            <h3>Premios y Membresías Disponibles</h3>
            <Loader2 v-if="loadingRewards" :size="18" class="spinner" />
          </div>

          <div v-if="loadingRewards" class="empty-loader mt-5">
            <Loader2 class="spinner text-primary" :size="32" />
            <p class="mt-2 text-muted">Cargando catálogo de premios...</p>
          </div>

          <div v-else class="rewards-grid mt-3">
            <div v-for="reward in rewardsList" :key="reward.id" class="reward-card-premium">
              <div class="reward-img-wrapper">
                <img 
                  :src="reward.image" 
                  :alt="reward.name" 
                  class="reward-img"
                  @error="(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Premio'"
                />
                <div v-if="availableCredits < reward.cost" class="insufficient-badge">
                  <span>Créditos Insuficientes</span>
                </div>
              </div>

              <div class="reward-body">
                <h4>{{ reward.name }}</h4>
                <p class="reward-desc">{{ reward.description }}</p>

                <div class="reward-stats mt-3">
                  <div class="stat-item">
                    <span class="label">Costo:</span>
                    <span class="val cost-val">{{ formatMoney(reward.cost) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Stock:</span>
                    <span class="val badge-stock" :class="reward.stock > 0 ? 'instock' : 'outstock'">
                      {{ reward.stock > 0 ? `${reward.stock} Disp.` : 'Agotado' }}
                    </span>
                  </div>
                </div>

                <div class="reward-action-btn-wrapper mt-4">
                  <button 
                    class="btn btn-premium btn-block"
                    :disabled="!canRedeem(reward)"
                    @click="openRedeemConfirmation(reward)"
                  >
                    {{ getButtonText(reward) }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="rewardsList.length === 0" class="empty-list">
              <Inbox :size="32" class="text-muted" />
              <p class="mt-2 text-muted">No hay premios disponibles para canjear en este momento.</p>
              <span class="text-xs text-muted-light">Vuelve más tarde para ver nuevos lanzamientos.</span>
            </div>
          </div>
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

    <!-- Modal: Confirmar Canje de Premio -->
    <div v-if="showConfirmRedeem" class="modal-overlay" @click.self="closeRedeemConfirmation">
      <div class="modal-card">
        <div class="modal-header">
          <h5>Confirmar Canje de Premio</h5>
          <button class="close-btn" @click="closeRedeemConfirmation"><X :size="18" /></button>
        </div>
        <div class="modal-body" v-if="selectedReward">
          <div class="text-center mb-3">
            <img 
              :src="selectedReward.image" 
              :alt="selectedReward.name"
              class="img-fluid rounded reward-confirm-img"
              @error="(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Premio'"
              style="max-height: 180px; object-fit: contain; width: 100%; border-radius: 8px;"
            />
          </div>
          <h4 class="text-center font-weight-bold mb-1">{{ selectedReward.name }}</h4>
          <p class="text-center text-muted text-sm mb-4">{{ selectedReward.description }}</p>
          
          <div class="confirm-summary-box">
            <div class="summary-row">
              <span>Costo del premio:</span>
              <strong class="text-premium">{{ formatMoney(selectedReward.cost) }}</strong>
            </div>
            <div class="summary-row">
              <span>Créditos disponibles:</span>
              <strong>{{ formatMoney(availableCredits) }}</strong>
            </div>
            <hr class="my-2 border-dashed">
            <div class="summary-row total">
              <span>Saldo restante estimado:</span>
              <strong :class="availableCredits - selectedReward.cost >= 0 ? 'text-success' : 'text-danger'">
                {{ formatMoney(availableCredits - selectedReward.cost) }}
              </strong>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRedeemConfirmation">Cancelar</button>
          <button 
            class="btn btn-premium" 
            :disabled="redeemingRewardId !== null" 
            @click="confirmRedeemReward"
          >
            <Loader2 v-if="redeemingRewardId !== null" class="spinner" :size="14" />
            Confirmar Canje
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
  ShieldCheck, X, Check, ImageOff, Download, Loader2, AlertTriangle,
  Settings, Award, Trash2, Edit3, Globe, Coins
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

// Config & Redemption state variables
const selectedMethod = ref('');
const listMethods = ref([{ id: 'binance', name: 'Binance' }, { id: 'paypal', name: 'PayPal' }]);
const paymentAccounts = ref([]);
const loadingAccounts = ref(false);
const loadingConfigSave = ref(false);
const configErrors = ref({});
const isEditingAccount = ref(false);
const editingAccountId = ref(null);
const editingAccountType = ref('');

const configForm = ref({
  email: '',
  account_name: '',
  binance_id: '',
  network: 'BSC',
  phone: '',
  country_code: 'PE',
  currency: 'USD',
  account_type: 'personal'
});

const availableCredits = ref(0);
const rewardsList = ref([]);
const loadingRewards = ref(false);
const redeemingRewardId = ref(null);
const selectedReward = ref(null);
const showConfirmRedeem = ref(false);

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

// Movements Filters & Pagination (server-side)
const movFilterFrom   = ref('');
const movFilterTo     = ref('');
const movFilterStatus = ref('');
const movFilterSearch = ref('');
const movPage         = ref(1);
const movPerPage      = ref(15);
const movTotalPages   = ref(1);
const movTotal        = ref(0);
const movFrom         = ref(0);
const movTo           = ref(0);

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

function clearMovFilters() {
  movFilterFrom.value   = '';
  movFilterTo.value     = '';
  movFilterStatus.value = '';
  movFilterSearch.value = '';
  movPage.value = 1;
  loadMovements();
}

function changeMovPage(p) {
  movPage.value = p;
  loadMovements();
}

// Initialization
onMounted(() => {
  loadBalance();
  loadMovements();
  loadBinaryHistory();
  loadSales();
  loadDirects();
  loadPaymentAccounts();
  loadCredits();
  loadRewards();
  
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
    const params = {
      page:     movPage.value,
      per_page: movPerPage.value,
    };
    if (movFilterFrom.value)   params.date_from = movFilterFrom.value;
    if (movFilterTo.value)     params.date_to   = movFilterTo.value;
    if (movFilterStatus.value) params.status     = movFilterStatus.value;
    if (movFilterSearch.value) params.search     = movFilterSearch.value;

    const response = await walletService.getAllMovements(userId.value, params);
    movements.value   = response.data?.data         || [];
    movTotalPages.value = response.data?.last_page  ?? 1;
    movTotal.value      = response.data?.total      ?? 0;
    movFrom.value       = response.data?.from       ?? 0;
    movTo.value         = response.data?.to         ?? 0;
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
    const response = await apiClient.get('/marketing/reports/movements/my-directs');
    myDirects.value = response.data || [];
  } catch (error) {
    console.error('Error loading directs:', error);
  }
}

// Wallet Configuration methods
async function loadPaymentAccounts() {
  loadingAccounts.value = true;
  try {
    const [binanceResponse, paypalResponse] = await Promise.all([
      apiClient.get('/marketing/payment/binance-accounts'),
      apiClient.get('/marketing/payment/paypal-accounts')
    ]);
    
    // Refresh the accounts lists used in withdrawal forms
    binanceAccounts.value = binanceResponse.data?.data || binanceResponse.data || [];
    paypalAccounts.value = paypalResponse.data?.data || paypalResponse.data || [];

    const parsedBinance = binanceAccounts.value.map(account => ({
      id: account.id,
      type: 'binance',
      method: 'Binance',
      email: account.email,
      account_name: account.account_name,
      account_number: account.binance_id,
      extra_info: {
        network: account.network,
        phone: account.phone
      }
    }));

    const parsedPaypal = paypalAccounts.value.map(account => ({
      id: account.id,
      type: 'paypal',
      method: 'PayPal',
      email: account.email,
      account_name: account.account_name,
      account_number: account.email,
      extra_info: {
        country_code: account.country_code,
        currency: account.currency,
        account_type: account.account_type,
        is_verified: account.is_verified
      }
    }));

    paymentAccounts.value = [...parsedBinance, ...parsedPaypal];
  } catch (error) {
    console.error("Error loading payment accounts:", error);
  } finally {
    loadingAccounts.value = false;
  }
}

function resetConfigForm() {
  configForm.value = {
    email: '',
    account_name: '',
    binance_id: '',
    network: 'BSC',
    phone: '',
    country_code: 'PE',
    currency: 'USD',
    account_type: 'personal'
  };
  configErrors.value = {};
  isEditingAccount.value = false;
  editingAccountId.value = null;
  editingAccountType.value = '';
}

function handleConfigSelectChange() {
  configErrors.value = {};
}

async function savePaymentAccount() {
  configErrors.value = {};
  if (!configForm.value.email || !configForm.value.email.includes('@')) {
    configErrors.value.email = true;
  }
  if (!configForm.value.account_name || /[^a-zA-Z\s]/.test(configForm.value.account_name)) {
    configErrors.value.account_name = true;
  }
  if (selectedMethod.value === 'binance' && !configForm.value.binance_id) {
    configErrors.value.binance_id = true;
  }

  if (Object.keys(configErrors.value).length > 0) {
    showToast('Por favor, corrija los campos requeridos.', 'error');
    return;
  }

  loadingConfigSave.value = true;
  try {
    let response;
    const isEditing = isEditingAccount.value;
    const type = isEditing ? editingAccountType.value : selectedMethod.value;
    const id = editingAccountId.value;
    
    let payload = {
      email: configForm.value.email,
      account_name: configForm.value.account_name,
    };

    if (type === 'binance') {
      payload.binance_id = configForm.value.binance_id;
      payload.network = configForm.value.network;
      if (configForm.value.phone) payload.phone = configForm.value.phone;
      
      if (isEditing) {
        response = await apiClient.put(`/marketing/payment/binance-accounts/${id}`, payload);
      } else {
        response = await apiClient.post('/marketing/payment/binance-accounts', payload);
      }
    } else {
      payload.country_code = configForm.value.country_code;
      payload.currency = configForm.value.currency;
      payload.account_type = configForm.value.account_type;
      
      if (isEditing) {
        response = await apiClient.put(`/marketing/payment/paypal-accounts/${id}`, payload);
      } else {
        response = await apiClient.post('/marketing/payment/paypal-accounts', payload);
      }
    }

    if (response.data.success) {
      showToast(isEditing ? 'Cuenta actualizada exitosamente' : 'Cuenta registrada exitosamente', 'success');
      resetConfigForm();
      selectedMethod.value = '';
      await loadPaymentAccounts();
    }
  } catch (error) {
    console.error("Error saving account:", error);
    const msg = error.response?.data?.message || 'Error al guardar la cuenta de pago';
    showToast(msg, 'error');
  } finally {
    loadingConfigSave.value = false;
  }
}

function startEditAccount(account) {
  isEditingAccount.value = true;
  editingAccountId.value = account.id;
  editingAccountType.value = account.type;
  selectedMethod.value = account.type;
  
  configForm.value.email = account.email;
  configForm.value.account_name = account.account_name;
  
  if (account.type === 'binance') {
    configForm.value.binance_id = account.account_number;
    configForm.value.network = account.extra_info.network;
    configForm.value.phone = account.extra_info.phone || '';
  } else {
    configForm.value.country_code = account.extra_info.country_code;
    configForm.value.currency = account.extra_info.currency;
    configForm.value.account_type = account.extra_info.account_type;
  }
}

async function deletePaymentAccount(account) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta cuenta?')) return;
  
  try {
    const endpoint = account.type === 'binance' 
      ? `/marketing/payment/binance-accounts/${account.id}` 
      : `/marketing/payment/paypal-accounts/${account.id}`;
      
    const response = await apiClient.delete(endpoint);
    if (response.data.success) {
      showToast('Cuenta eliminada exitosamente', 'success');
      await loadPaymentAccounts();
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    showToast('Error al eliminar la cuenta de pago', 'error');
  }
}

// Rewards Redemption methods
async function loadCredits() {
  try {
    const response = await apiClient.get('/marketing/gamification/my-credits');
    if (response.data.success) {
      availableCredits.value = response.data.data?.credits || 0;
    }
  } catch (error) {
    console.error("Error loading credits:", error);
  }
}

async function loadRewards() {
  loadingRewards.value = true;
  try {
    const response = await apiClient.get('/marketing/gamification/available-rewards');
    if (response.data.success) {
      rewardsList.value = response.data.data || [];
    }
  } catch (error) {
    console.error("Error loading rewards:", error);
  } finally {
    loadingRewards.value = false;
  }
}

function getButtonText(reward) {
  if (reward.stock !== null && reward.stock === 0) {
    return 'Agotado';
  }
  if (availableCredits.value < reward.cost) {
    return 'Créditos insuficientes';
  }
  return 'Canjear Premio';
}

function canRedeem(reward) {
  return availableCredits.value >= reward.cost && (reward.stock === null || reward.stock > 0);
}

function openRedeemConfirmation(reward) {
  selectedReward.value = reward;
  showConfirmRedeem.value = true;
}

function closeRedeemConfirmation() {
  selectedReward.value = null;
  showConfirmRedeem.value = false;
}

async function confirmRedeemReward() {
  if (!selectedReward.value) return;
  
  redeemingRewardId.value = selectedReward.value.id;
  try {
    const response = await apiClient.post('/marketing/gamification/redeem', {
      reward_id: selectedReward.value.id
    });
    
    if (response.data.success) {
      showToast('¡Premio canjeado exitosamente!', 'success');
      closeRedeemConfirmation();
      await loadCredits();
      await loadRewards();
      await loadBalance(); // Refresh balance too
    } else {
      showToast(response.data.message || 'Error al canjear el premio', 'error');
    }
  } catch (error) {
    console.error("Error redeeming reward:", error);
    const msg = error.response?.data?.message || 'Error al procesar el canje';
    showToast(msg, 'error');
  } finally {
    redeemingRewardId.value = null;
  }
}

// Payment accounts API fallbacks
async function onAccountTypeChange() {
  formRequest.value.account_number = '';
  if (formRequest.value.account_type === 'paypal') {
    try {
      const res = await apiClient.get('/marketing/payment/paypal-accounts');
      paypalAccounts.value = res.data?.data || res.data || [];
    } catch {
      paypalAccounts.value = [];
    }
  } else if (formRequest.value.account_type === 'binance') {
    try {
      const res = await apiClient.get('/marketing/payment/binance-accounts');
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

let searchMovTimeout;
function debouncedFetchMovements() {
  clearTimeout(searchMovTimeout);
  searchMovTimeout = setTimeout(() => {
    movPage.value = 1;
    loadMovements();
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
  color: #86efac;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.balance-amount {
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -1px;
  background: linear-gradient(to right, #ffffff, #bbf7d0);
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
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(22, 163, 74, 0.35);
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.45);
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

/* Tab Panels */
.tab-content-wrapper {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid var(--border-color);
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
  color: var(--text-bold);
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
  color: var(--text-muted);
  font-weight: 700;
  border-bottom: 2px solid var(--border-color);
}

.table-custom td {
  padding: 16px;
  font-size: 14px;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.table-custom tbody tr:hover {
  background: rgba(0,0,0,0.025);
}

.empty-row {
  text-align: center;
  padding: 48px 16px !important;
  color: var(--text-muted);
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

.badge-warning { background: var(--indicator-orange);  color: var(--indicator-orange-text); }
.badge-success { background: var(--indicator-green);   color: var(--indicator-green-text);  }
.badge-danger  { background: var(--indicator-red);     color: var(--indicator-red-text);    }

.rank-tag {
  background: var(--indicator-green);
  color: var(--indicator-green-text);
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  border: 1px solid var(--border-color);
}

.bonus-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.tag-primary { background: var(--indicator-blue);   color: var(--indicator-blue-text);  }
.tag-purple  { background: var(--indicator-green);  color: var(--indicator-green-text); }
.tag-gray    { background: rgba(0,0,0,0.06);         color: var(--text-main);            }

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
  border: 1px solid #bbf7d0;
  color: #16a34a;
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
  background: #f0fdf4;
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

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
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
  color: var(--text-main);
  display: block;
  margin-bottom: 6px;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-bold);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.form-control:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(22, 197, 94, 0.12);
}

.manual-input-box {
  background: var(--card-bg);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
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
  border-color: #22c55e;
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

/* Wallet Config Styles */
.wallet-config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 768px) {
  .wallet-config-grid {
    grid-template-columns: 1fr;
  }
}

.config-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header-clean {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 14px;
}

.card-header-clean h3 {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.text-premium {
  color: #10b10b;
}

.error-border {
  border-color: #ef4444 !important;
}

.error-msg {
  color: #ef4444;
  font-size: 11px;
  margin-top: 4px;
  display: block;
}

.payment-accounts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payment-account-item {
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  transition: all 0.2s ease;
}

.payment-account-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.method-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.method-badge-premium.paypal {
  background: #eff6ff;
  color: #1d4ed8;
}

.method-badge-premium.binance {
  background: #fffbeb;
  color: #d97706;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.action-icon-btn {
  background: white;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-icon-btn:hover {
  background: #f3f4f6;
}

.action-icon-btn.delete:hover {
  border-color: #fee2e2;
  color: #ef4444;
  background: #fef2f2;
}

.item-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.detail-row .label {
  color: #6b7280;
}

.detail-row .val {
  font-weight: 600;
  color: #1f2937;
}

.badge-network {
  background: #e0f2fe;
  color: #0369a1;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
}

.text-xs {
  font-size: 12px;
}

.text-muted-light {
  color: #9ca3af;
}

.empty-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

/* Redemption Banner */
.redemption-credits-banner {
  position: relative;
  background: linear-gradient(135deg, #10b10b 0%, #0c8c0c 100%);
  border-radius: 12px;
  padding: 30px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(16, 177, 11, 0.15);
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
  pointer-events: none;
}

.banner-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
  color: white;
}

.credits-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.banner-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
}

.credits-amount {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
}

.credits-desc {
  font-size: 13px;
  opacity: 0.85;
  margin: 0;
  max-width: 450px;
}

.banner-icon-bg {
  opacity: 0.2;
}

/* Rewards Catalog */
.rewards-section .section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rewards-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.reward-card-premium {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
}

.reward-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
  border-color: #d1d5db;
}

.reward-img-wrapper {
  position: relative;
  height: 180px;
  background: #f3f4f6;
  overflow: hidden;
}

.reward-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.reward-card-premium:hover .reward-img {
  transform: scale(1.05);
}

.insufficient-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  backdrop-filter: blur(4px);
}

.reward-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.reward-body h4 {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px 0;
}

.reward-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
  flex-grow: 1;
}

.reward-stats {
  display: flex;
  justify-content: space-between;
  border-top: 1px dashed #f3f4f6;
  padding-top: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-item .label {
  font-size: 11px;
  color: #9ca3af;
}

.stat-item .val {
  font-size: 14px;
  font-weight: 700;
}

.cost-val {
  color: #10b10b;
}

.badge-stock {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.badge-stock.instock {
  background: #dcfce7;
  color: #15803d;
}

.badge-stock.outstock {
  background: #fee2e2;
  color: #b91c1c;
}

/* Confirmation Summary Box */
.confirm-summary-box {
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  padding: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row.total {
  font-size: 14px;
  font-weight: 700;
}

.border-dashed {
  border-style: dashed;
}

/* ── Movements Filter Bar ─────────────────────────────────── */
.movements-filter-bar {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.filter-bar-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.filter-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-bold);
  margin: 0;
  flex: 1;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 130px;
}

.filter-group--wide {
  flex: 1;
  min-width: 200px;
}

.filter-group--action {
  min-width: auto;
  justify-content: flex-end;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.filter-input-wrapper {
  position: relative;
}

.filter-search-wrapper {
  display: flex;
  align-items: center;
}

.filter-search-icon {
  position: absolute;
  left: 10px;
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
}

.filter-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-bold);
  background: var(--card-bg);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
  appearance: none;
  -webkit-appearance: none;
}

.filter-input:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(22, 197, 94, 0.10);
  background: var(--card-bg);
}

.filter-input--search {
  padding-left: 32px;
}

.filter-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}

.btn-clear-filters {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}

.btn-clear-filters:hover:not(:disabled) {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

.btn-clear-filters:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.filter-summary {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #dcfce7;
  color: #15803d;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .filter-controls {
    flex-direction: column;
  }

  .filter-group,
  .filter-group--wide {
    min-width: 100%;
  }
}

/* ── Movements Pagination Footer ──────────────────────────── */
.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 4px 4px;
  gap: 12px;
  flex-wrap: wrap;
}

.pag-info {
  font-size: 13px;
  color: #6b7280;
}

.pag-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 36px;
}

.btn-page:hover:not(:disabled) {
  border-color: #16a34a;
  color: #16a34a;
  background: #f0fdf4;
}

.btn-page:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-page-num.active {
  background: #16a34a;
  border-color: #16a34a;
  color: white;
  font-weight: 700;
}
</style>



