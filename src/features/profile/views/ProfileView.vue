<template>
  <div class="profile-page">
    <h1 class="page-title">Ajustes de Perfil</h1>
    
    <div class="profile-layout">
      <!-- Left Column: User Details -->
      <div class="profile-sidebar">
        <div class="profile-card text-center">
          <div class="avatar-container">
            <img v-if="user.photo" :src="getAvatarUrl(user.photo)" alt="Avatar" class="avatar-image" @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="avatar-fallback" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 class="user-name">{{ user.name }} {{ user.last_name }}</h2>
          
          <div class="roles-container">
            <span v-for="role in roles" :key="role" class="role-badge">
              {{ role }}
            </span>
          </div>

          <div class="details-section">
            <h3 class="details-title">Detalles</h3>
            <div class="details-list">
              <div class="detail-item">
                <span class="detail-label">Usuario:</span>
                <span class="detail-value">{{ user.username }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Correo:</span>
                <span class="detail-value">{{ user.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Estado:</span>
                <span class="detail-value text-green">Activo</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Rol:</span>
                <span class="detail-value">{{ roles.join(', ') || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Numero de documento:</span>
                <span class="detail-value">{{ user.nro_document || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Contacto:</span>
                <span class="detail-value">{{ user.phone || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">País:</span>
                <span class="detail-value">{{ getCountryName(user.id_country) || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Creación:</span>
                <span class="detail-value">{{ formatDate(user.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Tabs and Forms -->
      <div class="profile-content">
        <!-- Tabs -->
        <div class="tabs-header">
          <button @click="activeTab = 'cuenta'" class="tab-btn" :class="{ active: activeTab === 'cuenta' }">
            <User :size="18" /> Cuenta
          </button>
          <button @click="activeTab = 'seguridad'" class="tab-btn" :class="{ active: activeTab === 'seguridad' }">
            <Lock :size="18" /> Seguridad
          </button>
          <button @click="activeTab = 'membresias'" class="tab-btn" :class="{ active: activeTab === 'membresias' }">
            <Bookmark :size="18" /> Membresias
          </button>
        </div>

        <!-- Transiciones Suaves (Framer Motion style) -->
        <transition name="fade-slide" mode="out-in">
          
          <!-- Tab Content: Cuenta -->
          <div v-if="activeTab === 'cuenta'" key="cuenta" class="tab-content account-tab">
            <div class="tab-top-border"></div>
            <h3 class="form-title">Editar Perfil</h3>
            
            <form @submit.prevent="saveProfile" class="profile-form">
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre:</label>
                  <input type="text" v-model="formData.name" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Apellido:</label>
                  <input type="text" v-model="formData.last_name" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Correo:</label>
                  <input type="email" v-model="formData.email" class="form-control" />
                </div>
                <div class="form-group">
                  <label>N° Celular:</label>
                  <input type="text" v-model="formData.phone" class="form-control" />
                </div>
              </div>

              <div class="form-group full-width">
                <label>Biografia:</label>
                <textarea v-model="formData.biography" rows="4" class="form-control"></textarea>
              </div>

              <div class="form-grid-3">
                <div class="form-group">
                  <label>Día de cumpleaños:</label>
                  <input type="date" v-model="formData.date_birth" class="form-control" />
                </div>
                <div class="form-group">
                  <label>País:</label>
                  <select v-model="formData.id_country" class="form-control">
                    <option value="" disabled>Seleccione un país</option>
                    <option v-for="country in countries" :key="country.id" :value="country.id">
                      {{ country.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Ciudad:</label>
                  <input type="text" v-model="formData.city" class="form-control" />
                </div>
              </div>

              <div class="form-actions">
                <CustomAlert :message="profileAlert.message" :type="profileAlert.type" />
                <button type="submit" class="btn-save">Guardar Cambios</button>
              </div>
            </form>
          </div>

          <!-- Tab Content: Seguridad -->
          <div v-else-if="activeTab === 'seguridad'" key="seguridad" class="tab-content">
            <div class="tab-top-border"></div>
            <h3 class="form-title">Cambiar Contraseña</h3>
            
            <CustomAlert :message="securityAlert.message" :type="securityAlert.type" />
            
            <form @submit.prevent="changePassword" class="profile-form">
              <div class="form-grid">
                <div class="form-group relative">
                  <label>Nueva Contraseña</label>
                  <div class="input-with-icon">
                    <input :type="showPassword ? 'text' : 'password'" v-model="securityData.password" class="form-control" />
                    <button type="button" class="icon-btn" @click="showPassword = !showPassword">
                      <EyeOff v-if="showPassword" :size="16" />
                      <Eye v-else :size="16" />
                    </button>
                  </div>
                </div>
                <div class="form-group relative">
                  <label>Confirmar Nueva Contraseña</label>
                  <div class="input-with-icon">
                    <input :type="showConfirmPassword ? 'text' : 'password'" v-model="securityData.password_confirmation" class="form-control" />
                    <button type="button" class="icon-btn" @click="showConfirmPassword = !showConfirmPassword">
                      <EyeOff v-if="showConfirmPassword" :size="16" />
                      <Eye v-else :size="16" />
                    </button>
                  </div>
                </div>
              </div>
              
              <p class="text-muted" style="font-size: 13px; margin-top: 8px;">Mínimo 8 caracteres de largo, mayúsculas y símbolos</p>

              <div class="form-actions">
                <button type="submit" class="btn-save" style="margin-top: 8px;">Cambiar Contraseña</button>
              </div>
            </form>
          </div>

          <!-- Tab Content: Membresias -->
          <div v-else-if="activeTab === 'membresias'" key="membresias" class="tab-content membership-tab">
            <div class="tab-top-border"></div>
            
            <CustomAlert :message="profileAlert.message" :type="profileAlert.type" />
            
            <VipMembershipCard :membership="activeMembership" :user="user" />
            
            <div class="membership-progress-container">
              <div class="progress-labels">
                <span>Días</span>
                <span>{{ membershipStatus.labelRight }}</span>
              </div>
              <div class="progress-bar-bg">
                <div 
                  class="progress-bar-fill" 
                  :style="{ 
                    width: membershipStatus.percent + '%', 
                    backgroundColor: membershipStatus.isExpired ? '#ef4444' : 'var(--primary-color)' 
                  }"
                ></div>
              </div>
              <p class="text-muted" style="font-size: 13px; margin-top: 8px;">{{ membershipStatus.text }}</p>
            </div>
            
            <div class="membership-actions">
              <AnimatedButton @click="showUpgradeModal = true">
                {{ membershipStatus.isExpired ? 'Renovar Membresía' : 'Mejorar Membresía' }}
              </AnimatedButton>
              <AnimatedButton @click="openHistoryModal">Historial de membresía</AnimatedButton>
            </div>

            <!-- Upgrade / Renew Modal -->
            <Teleport to="body">
              <div v-if="showUpgradeModal" class="custom-modal-overlay">
              <div class="custom-modal-content fade-in-up">
                <div class="modal-header">
                  <h4>{{ membershipStatus.isExpired ? 'Renueva tu membresía' : 'Adquiere una nueva membresía' }}</h4>
                  <button class="close-btn" @click="showUpgradeModal = false"><X :size="20" /></button>
                </div>
                <div class="modal-body">
                  <p v-if="upgradeableMemberships.length === 0" class="text-muted">
                    No hay planes superiores disponibles en este momento.
                  </p>
                  <div class="table-responsive" v-else>
                    <table class="custom-table">
                      <thead>
                        <tr>
                          <th>Membresía</th>
                          <th>Precio</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="plan in upgradeableMemberships" :key="plan.id">
                          <td>{{ plan.account }}</td>
                          <td>
                            <span v-if="membershipStatus.isExpired || !activeMembership">
                              ${{ parseFloat(plan.price).toFixed(2) }} + IVA ({{ plan.iva }}%)
                            </span>
                            <span v-else>
                              ${{ (parseFloat(plan.price) - parseFloat(activeMembership.price)).toFixed(2) }} 
                              <small class="text-muted" style="display:block; font-size: 11px;">(Diferencia a pagar)</small>
                            </span>
                          </td>
                          <td>
                            <button class="btn-select-plan" @click="selectPlan(plan)">Seleccionar</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              </div>
            </Teleport>

            <!-- Membership History Modal -->
            <Teleport to="body">
              <div v-if="showHistoryModal" class="custom-modal-overlay">
              <div class="custom-modal-content fade-in-up">
                <div class="modal-header">
                  <h4>Historial de Membresías</h4>
                  <button class="close-btn" @click="showHistoryModal = false"><X :size="20" /></button>
                </div>
                <div class="modal-body">
                  <div class="table-responsive">
                    <table class="custom-table">
                      <thead>
                        <tr>
                          <th>Fecha Compra</th>
                          <th>Fecha Expiración</th>
                          <th>Plan</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="loadingHistory">
                          <td colspan="4" class="text-center" style="padding: 24px;">
                            <div class="spinner"></div>
                            <span style="display: block; margin-top: 8px; font-size: 13px; color: var(--text-light);">Cargando historial...</span>
                          </td>
                        </tr>
                        <tr v-else-if="membershipHistory.length === 0">
                          <td colspan="4" class="text-center text-muted" style="padding: 24px;">No se encontraron registros de membresías pasadas.</td>
                        </tr>
                        <tr v-for="record in membershipHistory" :key="record.id" v-else>
                          <td>{{ formatHistoryDate(record.purchase_date) }}</td>
                          <td>{{ formatHistoryDate(record.expiration_date) }}</td>
                          <td>
                            <span class="status-badge plan-badge">
                              {{ record.account_type_name }}
                            </span>
                          </td>
                          <td>
                            <span :class="getHistoryStatus(record).class">
                              {{ getHistoryStatus(record).text }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              </div>
            </Teleport>

            <!-- Payment Modal -->
            <Teleport to="body">
              <div v-if="showPaymentModal" class="custom-modal-overlay">
                <div class="custom-modal-content fade-in-up" style="max-width: 450px;">
                  <div class="modal-header">
                    <h4 style="color: var(--primary-color);">Membresía</h4>
                    <button class="close-btn" @click="showPaymentModal = false"><X :size="20" /></button>
                  </div>
                  <div class="modal-body" style="padding: 24px;">
                    <CustomAlert :message="paymentAlert.message" :type="paymentAlert.type" />
                    <div class="form-group" style="margin-bottom: 24px;">
                      <select v-model="selectedPaymentMethod" class="form-control payment-select" @change="paymentAlert.message = ''">
                        <option value="" disabled>Seleccione método de pago</option>
                        <option value="card">Tarjeta crédito / débito</option>
                        <option value="wallet">Billetera (Saldo: ${{ walletBalance.toFixed(2) }})</option>
                      </select>
                    </div>

                    <p style="margin-bottom: 16px; font-size: 14px; color: var(--text-bold);">
                      Ha seleccionado la membresía <strong>{{ selectedPlanToBuy?.account }}</strong>
                    </p>

                    <!-- Wallet Info Box -->
                    <div v-if="selectedPaymentMethod === 'wallet'" class="wallet-info-box fade-in-up" style="margin-bottom: 24px; padding: 16px; background-color: rgba(24, 214, 0, 0.05); border-left: 4px solid var(--primary-color); border-radius: 6px;">
                      <h5 style="margin-top: 0; margin-bottom: 12px; color: var(--primary-color);">Resumen de Billetera</h5>
                      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                        <span class="text-muted">Saldo actual:</span>
                        <span style="color: var(--text-bold);">${{ walletBalance.toFixed(2) }}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                        <span class="text-muted">Monto a descontar (inc. IVA):</span>
                        <span style="color: #ef4444;">-${{ amountToPay.toFixed(2) }}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-weight: bold; font-size: 15px;">
                        <span>Saldo final:</span>
                        <span :style="{ color: isWalletSufficient ? 'var(--primary-color)' : '#ef4444' }">
                          ${{ (walletBalance - amountToPay).toFixed(2) }}
                        </span>
                      </div>
                      <p v-if="!isWalletSufficient" style="color: #ef4444; font-size: 13px; margin-top: 12px; margin-bottom: 0;">
                        Saldo insuficiente para realizar esta compra.
                      </p>
                    </div>

                    <div class="terms-toggle-wrapper" style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                      <label class="toggle-switch">
                        <input type="checkbox" v-model="acceptTerms" :disabled="isProcessingPayment">
                        <span class="slider round"></span>
                      </label>
                      <span class="terms-text" style="font-size: 13px; color: var(--text-light);">
                        He leído y acepto los 
                        <a href="#" @click.prevent="showTermsModal = true" style="color: var(--primary-color); font-weight: bold; text-decoration: none;">términos y condiciones.</a>
                      </span>
                    </div>

                    <button 
                      class="btn-select-plan" 
                      :disabled="!acceptTerms || (selectedPaymentMethod === 'wallet' && !isWalletSufficient) || isProcessingPayment"
                      :style="{ 
                        opacity: (acceptTerms && (selectedPaymentMethod !== 'wallet' || isWalletSufficient) && !isProcessingPayment) ? '1' : '0.5', 
                        cursor: (acceptTerms && (selectedPaymentMethod !== 'wallet' || isWalletSufficient) && !isProcessingPayment) ? 'pointer' : 'not-allowed',
                        width: '100%', padding: '12px', fontSize: '15px'
                      }" 
                      @click="processPayment"
                    >
                      <span v-if="isProcessingPayment">Procesando...</span>
                      <span v-else>Comprar</span>
                    </button>
                  </div>
                </div>
              </div>
            </Teleport>

            <!-- Terms Modal -->
            <Teleport to="body">
              <div v-if="showTermsModal" class="custom-modal-overlay" style="z-index: 1050;">
                <div class="custom-modal-content fade-in-up" style="max-width: 700px; max-height: 90vh; display: flex; flex-direction: column;">
                  <div class="modal-header">
                    <h4 style="color: var(--primary-color);">Términos y Condiciones</h4>
                    <button class="close-btn" @click="showTermsModal = false"><X :size="20" /></button>
                  </div>
                  <div class="modal-body" style="padding: 24px; overflow-y: auto; flex: 1;">
                    <div class="terms-content text-muted" style="font-size: 14px; line-height: 1.6;">
                      <h5 style="color: var(--text-bold); margin-bottom: 16px;">Términos y condiciones de transacciones Virtuales Promolider org SAC</h5>
                      
                      <p style="margin-bottom: 12px;">Las transacciones que se efectúen a través plataforma educativa de Promolider org SAC, se sujetan a los presentes términos y condiciones (en lo sucesivo, Términos y Condiciones), así como a la legislación peruana vigente, y se entienden celebradas en el distrito La Molina, provincia y departamento de Lima, República del Perú.</p>
                      
                      <p style="margin-bottom: 12px;">Promolider se reserva el derecho de actualizar y/o modificar los Términos y Condiciones que detallamos a continuación en cualquier momento, sin previo aviso. Por esta razón recomendamos revisar los Términos y Condiciones cada vez que utilice la página web.</p>
                      
                      <p style="margin-bottom: 12px;">Es requisito para comprar en el marketplace de Promolider la aceptación de los términos y condiciones descritas a continuación. Cualquier persona que realice una transacción mediante este canal, declara conocer y aceptar todas y cada uno de los términos y condiciones descritos a continuación. Asimismo, el acceso a los servicios de la Tienda Virtual Promolider podría ocasionalmente verse suspendido o restringido por la realización de trabajos de mantenimiento o administración de los productos ofertados.</p>
                      
                      <p style="margin-bottom: 24px;">Tienda Virtual Promolider se compromete a realizar su mejor esfuerzo para asegurar la disponibilidad de sus servicios durante las 24 horas del día así como para asegurar la ausencia de errores en cualquier transmisión de información que pudiera tener lugar en las transacciones; sin embargo, Tienda Virtual Promolider no se hace responsable cuando sus servicios se vean afectados por la naturaleza misma del internet.</p>

                      <strong style="display: block; margin-bottom: 8px; color: var(--text-bold);">1. REGISTRO DEL CLIENTE O USUARIO (CLIENTE)</strong>
                      <p style="margin-bottom: 24px;">El registro del cliente en este sitio, para comprar a través la tienda virtual constituye una condición indispensable. Para el registro, el cliente debe proporcionar sus datos de identificación fidedignos y necesarios (como nombre completo, número de documento oficial de identidad, correo electrónico, teléfonos, entre otros) los cuales podrán ser validados posteriormente.</p>

                      <strong style="display: block; margin-bottom: 8px; color: var(--text-bold);">2. CLAVE SECRETA</strong>
                      <p style="margin-bottom: 24px;">Una vez registrado, el cliente deberá ingresar su número de DNI y clave de acceso para compras en Tienda Virtual Promolider, la que deberá ser de 6 dígitos alfa-numérico y que será solicitada antes de efectuar una transacción. Esta clave de acceso es personal e intransferible y será necesaria de acuerdo al canal de compras elegido por el cliente.</p>

                      <strong style="display: block; margin-bottom: 8px; color: var(--text-bold);">3. MEDIOS DE PAGOS</strong>
                      <p style="margin-bottom: 8px;">Los medios de pago que se pueden utilizar para compras en la Tienda Virtual Promolider son:</p>
                      <ul style="margin-bottom: 12px; padding-left: 20px;">
                        <li>a.- Tarjeta crédito y débito nacionales.</li>
                        <li>b.- Tarjetas de crédito y débito Visa.</li>
                        <li>c.- Tarjetas de crédito MasterCard, American Express y Diners. (Nacionales e internacionales)</li>
                      </ul>
                      <p style="margin-bottom: 12px;">Promolider considerará como no válida la transacción cuando se evidencie o notifique algún tipo de fraude, cuando se produzca un error sistémico que distorsione el precio de las ofertas o cuando concurra alguna otra causa justificada, y procederá a anular la transacción, cancelar el producto y solicitar al banco emisor de la tarjeta para que la devolución del importe comprometido.</p>
                      <p style="margin-bottom: 12px;">Los aspectos relativos al funcionamiento de las tarjetas de crédito aceptadas en la Tienda Virtual Promolider están sujetos al contrato existente entre el cliente y el banco emisor de esta, sin que Promolider tenga responsabilidad alguna sobre los aspectos señalados en dichos contratos. Sin perjuicio de lo antes señalado, para efectos de las transacciones que se realicen a través de la Tienda Virtual Promolider, el cliente declara que las órdenes de pago se emitieron y se ejecutaron en el distrito de La Molina, provincia y departamento de Lima, República del Perú.</p>
                      <p style="margin-bottom: 24px;">La pasarela de pagos usada por Promolider en la tienda Virtual es Openpay.</p>

                      <strong style="display: block; margin-bottom: 8px; color: var(--text-bold);">4. VALIDEZ Y PRECIO</strong>
                      <p style="margin-bottom: 12px;">Los precios exhibidos en www.promolider.org son exclusivos para las compras efectuadas en Tienda Virtual Promolider.</p>
                      <p style="margin-bottom: 24px;">Los precios de los productos consignados en la Tienda Virtual Promolider son en moneda Dólar Americano (USD.), y de igual manera los comprobantes de pago que se emiten.</p>

                      <strong style="display: block; margin-bottom: 8px; color: var(--text-bold);">5. COMPROBANTES DE PAGO</strong>
                      <p style="margin-bottom: 12px;">El cliente deberá decidir correctamente el tipo de documento electrónico que solicitará como comprobante de pago de su compra, ya que de acuerdo al Reglamento de Comprobantes de Pago aprobado por Resolución de Superintendencia N° 007-99/SUNAT (RCP) y al Texto Único Ordenado de la Ley del Impuesto General a las Ventas e Impuesto Selectivo al Consumo, aprobado mediante Decreto Supremo N° 055-99-EF y normas modificatorias, no procederá cambio alguno:</p>
                      <p style="margin-bottom: 12px; font-style: italic;">“No existe ningún procedimiento vigente que permita el canje de boletas de venta por facturas, más aún las notas de crédito no se encuentran previstas para modificar al adquirente o usuario que figura en el comprobante de pago original”.</p>
                      <p style="margin-bottom: 12px;">Al aceptar estos términos y condiciones, el cliente autoriza a Promolider a que envíe el comprobante electrónico al correo electrónico consignado en el proceso de compra.</p>
                    </div>
                  </div>
                  <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;">
                    <button class="btn-select-plan" style="padding: 8px 24px;" @click="acceptAndCloseTerms">Aceptar</button>
                  </div>
                </div>
              </div>
            </Teleport>



            <div class="all-memberships-section">
              <div class="am-header-row">
                <h4 class="form-title" style="margin: 0;">Ver Todas las Membresías</h4>
                
                <!-- Tooltip Custom (Pure CSS) -->
                <div class="custom-tooltip-wrapper">
                  <button class="custom-tooltip-btn">
                    <div class="custom-tooltip-btn-bg"></div>
                    <span class="custom-tooltip-btn-text">
                      <Info :size="16" style="margin-right: 6px;" />
                      Glosario de Beneficios
                    </span>
                  </button>

                  <div class="custom-tooltip-content">
                    <div class="custom-tooltip-card">
                      <div class="custom-tooltip-header">
                        <div class="custom-tooltip-icon-container">
                          <Info :size="20" color="#4ade80" />
                        </div>
                        <h3 class="custom-tooltip-title">¿Qué significa cada uno?</h3>
                      </div>

                      <div class="custom-tooltip-body">
                        <ul class="custom-tooltip-list">
                          <li><strong style="color: #4ade80;">IVA:</strong> Impuesto aplicado en transacciones.</li>
                          <li><strong style="color: #4ade80;">Descuento Cursos:</strong> Ahorro al comprar cursos para ti.</li>
                          <li><strong style="color: #4ade80;">Corte Binario:</strong> Comisión sobre el volumen de tu pierna menor.</li>
                          <li><strong style="color: #4ade80;">Bono Efectivo Rápido:</strong> Comisión por invitar a comprar membresía.</li>
                          <li><strong style="color: #4ade80;">Comisión Directa:</strong> Ganancia sobre compras de referidos.</li>
                          <li><strong style="color: #4ade80;">Venta Cursos:</strong> Comisión asignada si tus invitados compran cursos.</li>
                          <li><strong style="color: #4ade80;">Bono Productor:</strong> Ganancia por venta de tus propios cursos subidos.</li>
                        </ul>
                      </div>

                      <div class="custom-tooltip-glow"></div>
                      <div class="custom-tooltip-arrow"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="memberships-grid">
                <div v-for="plan in availableMemberships" :key="plan.id" class="membership-card">
                  <div class="mc-header">
                    <h5>{{ plan.account }}</h5>
                    <div class="mc-price">
                      <span class="mc-currency">$</span>{{ plan.price }}
                    </div>
                  </div>
                  <ul class="mc-features">
                    <li><CheckCircle2 :size="16" class="text-primary-color" /> IVA: {{ plan.iva }}%</li>
                    <li><CheckCircle2 :size="16" class="text-primary-color" /> Descuento Cursos: {{ plan.disc_purchases_course }}%</li>
                    <li><CheckCircle2 :size="16" class="text-primary-color" /> Corte Binario: {{ plan.pay_in_binary }}%</li>
                    <li><CheckCircle2 :size="16" class="text-primary-color" /> Bono Efectivo Rápido: {{ plan.fast_cash_bonus }}%</li>
                    <li><CheckCircle2 :size="16" class="text-primary-color" /> Comisión Directa: {{ plan.comission }}%</li>
                    <li v-if="plan.course_selling_bonus"><CheckCircle2 :size="16" class="text-primary-color" /> Venta Cursos: {{ plan.course_selling_bonus }}%</li>
                    <li v-if="plan.productor_bonus"><CheckCircle2 :size="16" class="text-primary-color" /> Bono Productor: {{ plan.productor_bonus }}%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/features/auth/stores/authStore';
import api from '@/services/apiClient';
import { User, Lock, Bookmark, Info, CheckCircle2, Eye, EyeOff, X } from 'lucide-vue-next';
import VipMembershipCard from '@/components/VipMembershipCard.vue';
import AnimatedButton from '@/components/AnimatedButton.vue';
import CustomAlert from '@/components/CustomAlert.vue';

const authStore = useAuthStore();
const activeTab = ref('cuenta');
const realWalletBalance = ref(0);

const user = computed(() => authStore.user || {});
const roles = computed(() => authStore.userRoles || []);

const formData = ref({
  name: '',
  last_name: '',
  email: '',
  phone: '',
  biography: '',
  date_birth: '',
  id_country: '',
  city: ''
});

const securityData = ref({
  password: '',
  password_confirmation: ''
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showHelpInfo = ref(false);
const countries = ref([]);
const availableMemberships = ref([]);

const showUpgradeModal = ref(false);
const showPaymentModal = ref(false);
const showTermsModal = ref(false);
const showHistoryModal = ref(false);
const loadingHistory = ref(false);
const acceptTerms = ref(false);
const selectedPlanToBuy = ref(null);
const selectedPaymentMethod = ref('');
const isProcessingPayment = ref(false);
const membershipHistory = ref([]); // Se poblará desde el backend

const selectPlan = (plan) => {
  selectedPlanToBuy.value = plan;
  showUpgradeModal.value = false;
  selectedPaymentMethod.value = '';
  acceptTerms.value = false;
  paymentAlert.value.message = ''; // Reset alert
  showPaymentModal.value = true;
};

const acceptAndCloseTerms = () => {
  acceptTerms.value = true;
  showTermsModal.value = false;
};

const processPayment = async () => {
  paymentAlert.value.message = '';
  if (!acceptTerms.value) {
    showPaymentAlert('Debe aceptar los términos y condiciones antes de comprar.', 'warning');
    return;
  }
  if (!selectedPaymentMethod.value) {
    showPaymentAlert('Por favor seleccione un método de pago', 'warning');
    return;
  }
  
  if (selectedPaymentMethod.value === 'wallet' && !isWalletSufficient.value) {
    showPaymentAlert('No tienes saldo suficiente en tu billetera.', 'error');
    return;
  }
  
  if (selectedPaymentMethod.value === 'wallet') {
    isProcessingPayment.value = true;
    try {
      const response = await api.post('/marketing/membership/purchase-wallet', {
        plan_id: selectedPlanToBuy.value.id
      });
      if(response.data.success) {
        showPaymentAlert('¡Transacción aprobada! Actualizando su membresía...', 'success');
        
        // Simular tiempo de procesamiento tipo banco para mejor UX
        setTimeout(() => {
          authStore.user = response.data.user;
          realWalletBalance.value = response.data.new_balance;
          showPaymentModal.value = false;
          showProfileAlert(response.data.message, 'success');
          isProcessingPayment.value = false;
        }, 2000);
      }
    } catch (e) {
      isProcessingPayment.value = false;
      showPaymentAlert(e.response?.data?.error || 'Ocurrió un error procesando el pago.', 'error');
    }
  } else {
    showProfileAlert(`Procesando pago de $${amountToPay.value.toFixed(2)} para ${selectedPlanToBuy.value?.account} con Tarjeta. (Pronto)`, 'info');
    showPaymentModal.value = false;
  }
};

const openHistoryModal = async () => {
  showHistoryModal.value = true;
  loadingHistory.value = true;
  try { 
    const res = await api.get('/profile/membership-history'); 
    membershipHistory.value = res.data; 
  } catch(e) {
    console.error('Error fetching membership history:', e);
  } finally {
    loadingHistory.value = false;
  }
};

const formatHistoryDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString();
};

const getHistoryStatus = (record) => {
  if (record.status != 1) {
    return { text: 'Fallido/Cancelado', class: 'status-badge danger' };
  }
  const exp = new Date(record.expiration_date);
  if (exp < new Date()) {
    return { text: 'Expirado', class: 'status-badge danger' };
  }
  return { text: 'Activo', class: 'status-badge success' };
};

const securityAlert = ref({ message: '', type: 'error' });
const profileAlert = ref({ message: '', type: 'error' });
const paymentAlert = ref({ message: '', type: 'error' });

const showPaymentAlert = (msg, type = 'error') => {
  paymentAlert.value = { message: msg, type };
  // The modal might stay open, no timeout to hide it immediately so the user can see it
};

const showSecurityAlert = (msg, type = 'error') => {
  securityAlert.value = { message: msg, type };
  setTimeout(() => { securityAlert.value.message = ''; }, 6000);
};

const showProfileAlert = (msg, type = 'error') => {
  profileAlert.value = { message: msg, type };
  setTimeout(() => { profileAlert.value.message = ''; }, 6000);
};

const activeMembership = computed(() => {
  if (!availableMemberships.value.length || !user.value) return null;
  return availableMemberships.value.find(m => m.id === user.value.id_account_type) || null;
});

const membershipStatus = computed(() => {
  if (!user.value || !user.value.expiration_membership_date) {
    return {
      daysLeft: 0,
      percent: 0,
      text: 'Su membresía ha expirado o no tiene fecha límite',
      labelRight: 'Expirado',
      isExpired: true
    };
  }

  const expireDate = new Date(user.value.expiration_membership_date);
  const now = new Date();
  const diffTime = expireDate - now;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return {
      daysLeft: 0,
      percent: 0,
      text: 'Su membresía ha expirado',
      labelRight: 'Expirado',
      isExpired: true
    };
  }

  // Asumir que una membresía dura 365 días como base del progreso.
  const percent = Math.min((daysLeft / 365) * 100, 100);

  return {
    daysLeft,
    percent,
    text: `Le quedan ${daysLeft} días de membresía`,
    labelRight: `${daysLeft} días`,
    isExpired: false
  };
});

const upgradeableMemberships = computed(() => {
  if (!availableMemberships.value) return [];
  
  const isCurrentlyExpired = membershipStatus.value.isExpired;
  
  if (isCurrentlyExpired) {
    // Si está expirado, puede comprar cualquier plan de pago (precio > 0)
    return availableMemberships.value.filter(plan => parseFloat(plan.price) > 0);
  } else {
    // Si está activo, solo puede hacer UPGRADE a planes de mayor precio
    const currentPrice = activeMembership.value ? parseFloat(activeMembership.value.price) : 0;
    return availableMemberships.value.filter(plan => parseFloat(plan.price) > currentPrice);
  }
});

const walletBalance = computed(() => {
  return realWalletBalance.value ? parseFloat(realWalletBalance.value) : 0;
});

const amountToPay = computed(() => {
  if (!selectedPlanToBuy.value) return 0;
  
  let baseAmount = 0;
  if (membershipStatus.value.isExpired || !activeMembership.value) {
    baseAmount = parseFloat(selectedPlanToBuy.value.price);
  } else {
    baseAmount = parseFloat(selectedPlanToBuy.value.price) - parseFloat(activeMembership.value.price);
  }
  
  const ivaPercentage = selectedPlanToBuy.value.iva ? parseFloat(selectedPlanToBuy.value.iva) : 18;
  const total = baseAmount * (1 + (ivaPercentage / 100));
  
  return total > 0 ? total : 0;
});

const isWalletSufficient = computed(() => {
  return walletBalance.value >= amountToPay.value;
});

const loadCountries = async () => {
  try {
    const res = await api.get('/countries');
    countries.value = res.data;
  } catch (error) {
    console.error("Error cargando países:", error);
  }
};

const loadMemberships = async () => {
  try {
    const res = await api.get('/memberships');
    availableMemberships.value = res.data;
  } catch (error) {
    console.error("Error cargando membresías:", error);
  }
};

const getCountryName = (id) => {
  if (!id) return '';
  const c = countries.value.find(c => c.id == id);
  return c ? c.name : id;
};

onMounted(async () => {
  await loadCountries();
  await loadMemberships();
  
  try {
    const response = await api.get('/marketing/reports/wallet/balance');
    realWalletBalance.value = response.data?.total_balance || 0;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
  }
  if (user.value) {
    formData.value = {
      name: user.value.name || '',
      last_name: user.value.last_name || '',
      email: user.value.email || '',
      phone: user.value.phone || '',
      biography: user.value.biography || '',
      date_birth: user.value.date_birth || '',
      id_country: user.value.id_country || '',
      city: user.value.city || ''
    };
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const getAvatarUrl = (photoPath) => {
  if (!photoPath) return '';
  if (photoPath.startsWith('http')) return photoPath;
  return `https://promolider-storage-user.s3.sa-east-1.amazonaws.com/${photoPath}`;
};

const saveProfile = async () => {
  profileAlert.value.message = '';
  try {
    const response = await api.put('/profile/update', formData.value);
    showProfileAlert('Perfil actualizado exitosamente', 'success');
    if (response.data && response.data.user) {
      authStore.user = response.data.user;
    }
  } catch (error) {
    console.error(error);
    showProfileAlert('Error al actualizar el perfil', 'error');
  }
};

const changePassword = async () => {
  securityAlert.value.message = '';
  try {
    await api.put('/profile/password', securityData.value);
    showSecurityAlert('Contraseña actualizada exitosamente', 'success');
    securityData.value.password = '';
    securityData.value.password_confirmation = '';
  } catch (error) {
    console.error(error);
    if (error.response && error.response.data && error.response.data.errors) {
      const firstError = Object.values(error.response.data.errors)[0][0];
      showSecurityAlert(firstError, 'error');
    } else if (error.response && error.response.data && error.response.data.message) {
      showSecurityAlert(error.response.data.message, 'error');
    } else {
      showSecurityAlert('Error al actualizar contraseña. Verifica los datos.', 'error');
    }
  }
};
</script>

<style scoped>
.profile-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-bold);
  margin-bottom: 24px;
}
.profile-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 992px) {
  .profile-layout {
    flex-direction: row;
  }
}
.profile-sidebar {
  width: 100%;
}
@media (min-width: 992px) {
  .profile-sidebar {
    width: 33.333%;
  }
}
.profile-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
}
.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--node-bg);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: white;
}
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  width: 64px;
  height: 64px;
}
.user-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-bold);
  margin-bottom: 8px;
}
.roles-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.role-badge {
  background-color: var(--border-color);
  color: var(--text-main);
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 9999px;
}
.details-section {
  width: 100%;
  margin-top: 24px;
  text-align: left;
}
.details-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 16px;
}
.details-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
}
.detail-item {
  display: flex;
  flex-direction: column;
}
.detail-label {
  color: var(--text-muted);
  font-weight: 600;
}
.detail-value {
  color: var(--text-bold);
}
.text-green {
  color: var(--primary-color);
  font-weight: bold;
}
.profile-content {
  width: 100%;
}
@media (min-width: 992px) {
  .profile-content {
    width: 66.666%;
  }
}
.tabs-header {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.tab-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--text-muted);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
}
.tab-btn.active {
  background: var(--primary-color);
  color: white;
}
.tab-content {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}
.tab-top-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--primary-color);
}
.form-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-bold);
  margin-bottom: 24px;
}
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.form-grid-3 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .form-grid-3 {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.form-control {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: transparent;
  color: var(--text-main);
  transition: border-color 0.2s;
  box-sizing: border-box;
  width: 100%;
}
.form-control:focus {
  border-color: var(--primary-color);
}
.form-control option {
  background: var(--bg-main);
  color: var(--text-main);
}
.btn-save {
  background: var(--primary-color);
  color: white;
  font-weight: 500;
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 16px;
}
.btn-save:hover {
  background: var(--primary-hover);
}
.text-muted {
  color: var(--text-muted);
}
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}
.input-with-icon .form-control {
  padding-right: 40px;
}
.icon-btn {
  position: absolute;
  right: 8px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.icon-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
}
.membership-tab {
  padding: 32px;
}
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
  width: 32px;
  height: 32px;
  border-radius: 8px;
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
  opacity: 0.5;
}

.bg-blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.bg-purple { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
.bg-green { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
.bg-orange { background: rgba(249, 115, 22, 0.2); color: #fb923c; }
.bg-pink { background: rgba(236, 72, 153, 0.2); color: #f472b6; }
.bg-yellow { background: rgba(234, 179, 8, 0.2); color: #facc15; }
.membership-progress-container {
  margin-bottom: 24px;
}
.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.progress-bar-bg {
  width: 100%;
  height: 8px;
  background-color: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 4px;
}
.membership-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.all-memberships-section {
  border-top: 1px solid var(--border-color);
  padding-top: 24px;
}

.am-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.memberships-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .memberships-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

.membership-card {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.membership-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.mc-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  margin-bottom: 16px;
  text-align: center;
}

.mc-header h5 {
  font-size: 18px;
  color: var(--text-bold);
  margin-bottom: 8px;
  margin-top: 0;
}

.mc-price {
  font-size: 28px;
  font-weight: bold;
  color: var(--primary-color);
}

.mc-currency {
  font-size: 16px;
  vertical-align: top;
  margin-right: 2px;
}

.mc-features {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 13px;
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mc-features li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mc-features li .text-primary-color {
  color: var(--primary-color);
}

/* Animaciones de Transición (fade-slide) */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Tooltip Custom Classes (Reemplazo de Tailwind) */
.custom-tooltip-wrapper {
  position: relative;
  display: inline-block;
  z-index: 50;
}

.custom-tooltip-btn {
  position: relative;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background-color: rgba(34, 197, 94, 0.9);
  border-radius: 12px;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.custom-tooltip-btn:hover {
  background-color: rgba(22, 163, 74, 0.9);
}

.custom-tooltip-btn-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, rgba(74, 222, 128, 0.2), rgba(16, 185, 129, 0.2));
  filter: blur(12px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.custom-tooltip-wrapper:hover .custom-tooltip-btn-bg {
  opacity: 0.75;
}

.custom-tooltip-btn-text {
  position: relative;
  display: flex;
  align-items: center;
}

.custom-tooltip-content {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 12px;
  width: 320px;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-8px);
  transition: all 0.3s ease-out;
  z-index: 50;
}

.custom-tooltip-wrapper:hover .custom-tooltip-content {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

.custom-tooltip-card {
  position: relative;
  padding: 20px;
  background: linear-gradient(to bottom right, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.15);
  text-align: left;
}

.custom-tooltip-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.custom-tooltip-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(34, 197, 94, 0.2);
}

.custom-tooltip-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.custom-tooltip-body {
  margin-top: 8px;
}

.custom-tooltip-list {
  font-size: 12px;
  color: #d1d5db;
  list-style-type: disc;
  padding-left: 16px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.custom-tooltip-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  background: linear-gradient(to right, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1));
  filter: blur(16px);
  opacity: 0.5;
  pointer-events: none;
}

.custom-tooltip-arrow {
  position: absolute;
  top: -6px;
  right: 48px;
  width: 12px;
  height: 12px;
  background: linear-gradient(to bottom right, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
  transform: rotate(45deg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

/* --- Custom Alert --- */
.custom-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  animation: slideInDown 0.3s ease-out forwards;
}

@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-alert.error {
  background-color: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
}

.custom-alert.error .alert-icon {
  color: #ef4444;
}

.custom-alert.error .alert-title {
  color: #ef4444;
}

.custom-alert.success {
  background-color: rgba(74, 222, 128, 0.1);
  border-left: 4px solid #4ade80;
}

.custom-alert.success .alert-icon {
  color: #4ade80;
}

.custom-alert.success .alert-title {
  color: #4ade80;
}

.alert-content {
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 4px;
}

.alert-desc {
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.4;
}

/* --- Modal Styles --- */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.custom-modal-content {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h4 {
  margin: 0;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 18px;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.close-btn:hover {
  color: #ef4444;
}

.modal-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.custom-table th {
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  font-weight: 500;
  font-size: 14px;
  border-bottom: 1px solid var(--border-color);
}

.custom-table td {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 14px;
  color: var(--text-bold);
  vertical-align: middle;
}

.btn-select-plan {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.btn-select-plan:hover {
  background-color: #14b800;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 214, 0, 0.3);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.status-badge.success {
  background-color: rgba(74, 222, 128, 0.1);
  color: #4ade80;
}

.status-badge.danger {
  background-color: rgba(248, 113, 113, 0.1);
  color: #f87171;
}

.status-badge.warning {
  background-color: rgba(250, 204, 21, 0.1);
  color: #facc15;
}

.status-badge.plan-badge {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.fade-in-up {
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.payment-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
}

/* --- Toggle Switch Styles --- */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: .4s;
  border-radius: 34px;
}

.toggle-switch .slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + .slider {
  background-color: var(--primary-color);
}

.toggle-switch input:checked + .slider:before {
  transform: translateX(20px);
}
</style>