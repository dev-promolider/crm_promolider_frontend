<template>
  <div>
  <div class="dashboard-page">

    <!-- TOP WIDGETS ROW -->
    <div class="widgets-grid">

      <!-- Condición Card -->
      <div class="card condition-card">
        <div class="card-header" style="align-items: flex-start; margin-bottom: 15px; z-index: 10; position: relative;">
          <h3 class="card-title">Condición</h3>
          <div class="info-tooltip-wrapper">
              <Info :size="18" class="text-light" />
              <div class="info-tooltip">
              <h5>Membresía activa</h5>
              <p>Tu paquete o suscripción a Promolíder está vigente y no ha caducado.</p>
              <h5>OPC Activo</h5>
              <p>Tu cuenta cumple con los requisitos de volumen o compras necesarias para poder operar y cobrar.</p>
              <h5>Calificado</h5>
              <p>Significa que tienes al menos <strong>un colaborador directo en tu izquierda y uno en tu derecha, y
                  ambos tienen su membresía activa</strong>. Si ellos están inactivos, vencidos o en cuenta gratuita, no
                te contarán para esta calificación. ¡Es el requisito principal para cobrar el Bono Binario!</p>
              </div>
            </div>
          </div>
        <ul class="condition-list">
          <li>
            <span class="cond-label">Membresía activa:</span>
            <svg v-if="widgetsData.conditions.membershipActive" class="text-green" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <svg v-else class="text-red" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </li>
          <li>
            <span class="cond-label">OPC activos:</span>
            <svg v-if="widgetsData.conditions.active" class="text-green" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <svg v-else class="text-red" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </li>
          <li>
            <span class="cond-label">Calificado:</span>
            <svg v-if="widgetsData.conditions.qualified" class="text-green" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <svg v-else class="text-red" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </li>
        </ul>
        
        <div class="condition-banner" :class="allConditionsMet ? 'banner-success' : 'banner-warning'">
          <template v-if="allConditionsMet">
            <TrendingUp :size="18" class="banner-icon" />
            <span>¡Excelente! Cumples todas las condiciones para cobrar bonos de red.</span>
          </template>
          <template v-else-if="!widgetsData.conditions.membershipActive">
            <AlertCircle :size="18" class="banner-icon" />
            <span>Renueva tu membresía para habilitar tus beneficios.</span>
          </template>
          <template v-else-if="!widgetsData.conditions.active">
            <AlertCircle :size="18" class="banner-icon" />
            <span>Requiere recomprar OPC para reactivar tu cuenta.</span>
          </template>
          <template v-else-if="!widgetsData.conditions.qualified">
            <AlertCircle :size="18" class="banner-icon" />
            <span>Para calificar al binario necesitas 2 directos activos.</span>
          </template>
        </div>
      </div>

      <!-- Indicadores Card -->
      <div class="card indicators-card">
        <div class="card-header" style="align-items: flex-start; margin-bottom: 5px; z-index: 10; position: relative;">
          <div v-if="activeStatsTab === 'classic'" style="display: flex; align-items: flex-start; gap: 10px;">
            <div>
              <h3 class="card-title">{{ timeframe === 'historical' ? 'Resumen Histórico' : 'Resumen Mensual' }}</h3>
              <span class="card-meta">{{ timeframe === 'historical' ? 'Ganancias históricas totales' : 'Ganancias calculadas este mes' }}</span>
            </div>
            <div class="info-tooltip-wrapper" style="margin-top: 3px;">
              <Info :size="18" class="text-light" />
              <div class="info-tooltip" style="left: 0; right: auto;">
                <h5>Bono de Inicio Rápido</h5>
                <p>Comisiones directas e inmediatas por cada nuevo socio o cliente que afilies directamente al sistema.</p>
                <h5>Bono de Equipo (Binario)</h5>
                <p>Ingresos residuales calculados en base al volumen total de ventas generado por la pierna de pago (equipo menor).</p>
                <h5>Matching Bonus (Generaciones)</h5>
                <p>Un porcentaje de las ganancias obtenidas por los líderes de tu equipo, hasta varias generaciones de profundidad.</p>
              </div>
            </div>
          </div>
          <div v-else>
            <h3 class="card-title">Métricas de Rendimiento</h3>
            <span class="card-meta">Vista analítica global de comisiones</span>
          </div>
          
          <div class="stats-tabs" style="display: flex; gap: 8px; align-items: center;">
            <select v-model="timeframe" @change="loadDashboardWidgets" class="stats-tab-btn" style="background: var(--card-bg); border: 1px solid var(--border-color); color: var(--text-light); outline: none; cursor: pointer; border-radius: 8px; padding: 6px 12px; font-size: 0.85rem; height: 32px;">
              <option value="normal">Vista Normal</option>
              <option value="historical">Vista Histórica</option>
            </select>
            <button class="stats-tab-btn" :style="isSimulated ? 'background-color: rgba(24, 214, 0, 0.12); border: 1px solid var(--primary-color); color: var(--primary-color);' : 'border: 1px dashed var(--text-light); color: var(--text-light);'" @click="isSimulated = !isSimulated">
              {{ isSimulated ? 'Ver Real' : 'Simular Datos' }}
            </button>
            <button class="stats-tab-btn" :class="{ active: activeStatsTab === 'classic' }" @click="activeStatsTab = 'classic'">Clásico</button>
            <button class="stats-tab-btn" :class="{ active: activeStatsTab === 'chart' }" @click="activeStatsTab = 'chart'">Gráfico</button>
          </div>
        </div>

        <Transition name="fade-slide" mode="out-in">
          <div v-if="activeStatsTab === 'classic'" key="classic">
            <div class="stats-row" style="margin-top: 15px;">
              <div class="stat-item">
                <div class="stat-icon icon-green">
                  <TrendingUp :size="18" />
                </div>
                <div class="stat-info">
                  <h4>$ {{ displayMonthly.expansion.toFixed(2) }}</h4>
                  <p>Inicio Rápido</p>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon icon-blue">
                  <Clock :size="18" />
                </div>
                <div class="stat-info">
                  <h4>$ {{ displayMonthly.binary.toFixed(2) }}</h4>
                  <p>Bono Binario</p>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon icon-blue">
                  <Award :size="18" />
                </div>
                <div class="stat-info">
                  <h4>$ {{ displayMonthly.generational.toFixed(2) }}</h4>
                  <p>Matching Bonus</p>
                </div>
              </div>
            </div>

            <div class="card-header mt-4" style="align-items: flex-start; border-top: 1px solid var(--border-color); padding-top: 20px; z-index: 10; position: relative;">
              <div style="display: flex; align-items: flex-start; gap: 10px;">
                <div>
                  <h3 class="card-title">{{ timeframe === 'historical' ? 'Ingresos Totales' : 'Ingresos Acumulativos' }}</h3>
                  <span class="card-meta">
                    <template v-if="timeframe === 'historical'">Desde la creación de la cuenta</template>
                    <template v-else>
                      Desde el último corte o liquidación 
                      <span v-if="widgetsData?.last_cut_date" style="font-weight: 700; color: var(--text-color, #e0e0e0); margin-left: 4px; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
                        ({{ widgetsData.last_cut_date }})
                      </span>
                      <span v-else style="font-weight: 700; color: #ff9800; margin-left: 4px; background: rgba(255, 152, 0, 0.1); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255, 152, 0, 0.2);">
                        (Aún no se ha hecho ningún corte)
                      </span>
                    </template>
                  </span>
                </div>
                <div class="info-tooltip-wrapper" style="margin-top: 3px;">
                  <Info :size="18" class="text-light" />
                  <div class="info-tooltip" style="left: 0; right: auto;">
                  <h5>Comisiones Instantáneas</h5>
                  <p>Premios en efectivo que cobras al instante por alcanzar metas o participar en campañas promocionales (Fast Cash).</p>
                  <h5>Regalías de Autor</h5>
                  <p>Ingresos pasivos que generas cada vez que alguien en la red compra un curso o infoproducto creado por ti (Eres el Productor).</p>
                  <h5>Comisiones de Afiliado</h5>
                  <p>Dinero ganado al recomendar exitosamente los cursos del catálogo general a través de tus enlaces de afiliado.</p>
                </div>
              </div>
            </div>
            </div>

            <div class="stats-row" style="margin-top: 15px;">
              <div class="stat-item">
                <div class="stat-icon icon-red">
                  <Users :size="18" />
                </div>
                <div class="stat-info">
                  <h4>$ {{ displayCumulative.fast_cash.toFixed(2) }}</h4>
                  <p>Comisiones Instantáneas</p>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon icon-red"><Video :size="18" /></div>
                <div class="stat-info">
                  <h4>$ {{ displayCumulative.producer.toFixed(2) }}</h4>
                  <p>Regalías de Autor</p>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon icon-green">
                  <PlayCircle :size="18" />
                </div>
                <div class="stat-info">
                  <h4>$ {{ displayCumulative.course_sale.toFixed(2) }}</h4>
                  <p>Ventas de Afiliado</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else key="chart" class="radar-charts-wrapper" style="display: flex; gap: 20px; justify-content: space-between; margin-top: 20px;">
            <div class="radar-chart-container" style="flex: 1; display: flex; flex-direction: column; align-items: center;">
              <div style="text-align: center; margin-bottom: 15px;">
                <h3 class="card-title" style="font-size: 16px;">Resumen Mensual</h3>
                <span class="card-meta" style="font-size: 12px; display: block;">Ganancias calculadas este mes</span>
              </div>
              <svg viewBox="0 0 100 80" class="radar-svg">
                <polygon points="50,15 80.31,67.5 19.69,67.5" fill="none" stroke="currentColor" class="radar-grid" stroke-width="0.5"/>
                <polygon points="50,32.5 65.15,58.75 34.85,58.75" fill="none" stroke="currentColor" class="radar-grid" stroke-width="0.5"/>
                <polygon points="50,50 50,50 50,50" fill="none" stroke="currentColor" class="radar-grid" stroke-width="0.5"/>
                <line x1="50" y1="50" x2="50" y2="15" stroke="currentColor" class="radar-grid" stroke-width="0.5"/>
                <line x1="50" y1="50" x2="80.31" y2="67.5" stroke="currentColor" class="radar-grid" stroke-width="0.5"/>
                <line x1="50" y1="50" x2="19.69" y2="67.5" stroke="currentColor" class="radar-grid" stroke-width="0.5"/>
                <path :d="radarPoints.path" class="radar-data-polygon" fill="rgba(24, 214, 0, 0.4)" stroke="#18d600" stroke-width="1.5" stroke-linejoin="round" style="transition: d 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);"/>
                <circle :cx="radarPoints.p1.x" :cy="radarPoints.p1.y" r="2" fill="#fff" stroke="#18d600" stroke-width="1" style="transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);" />
                <circle :cx="radarPoints.p2.x" :cy="radarPoints.p2.y" r="2" fill="#fff" stroke="#18d600" stroke-width="1" style="transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);" />
                <circle :cx="radarPoints.p3.x" :cy="radarPoints.p3.y" r="2" fill="#fff" stroke="#18d600" stroke-width="1" style="transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);" />
                <text x="50" y="10" text-anchor="middle" class="radar-label" font-size="4">Expansión ($ {{ displayMonthly.expansion.toFixed(0) }})</text>
                <text x="90" y="73" text-anchor="end" class="radar-label" font-size="4">Binario ($ {{ displayMonthly.binary.toFixed(0) }})</text>
                <text x="10" y="73" text-anchor="start" class="radar-label" font-size="4">Gen. ($ {{ displayMonthly.generational.toFixed(0) }})</text>
              </svg>
            </div>

            <div class="radar-chart-container" style="flex: 1; display: flex; flex-direction: column; align-items: center;">
              <div style="text-align: center; margin-bottom: 15px;">
                <h3 class="card-title" style="font-size: 16px;">Ingresos Acumulativos</h3>
                <span class="card-meta" style="font-size: 12px; display: block;">Desde el último corte o liquidación</span>
              </div>
              <svg viewBox="0 0 100 80" class="radar-svg">
                <polygon points="50,15 80.31,67.5 19.69,67.5" fill="none" stroke="currentColor" class="radar-grid" stroke-width="0.5"/>
                <polygon points="50,32.5 65.15,58.75 34.85,58.75" fill="none" stroke="currentColor" class="radar-grid" stroke-width="0.5"/>
                <polygon points="50,50 50,50 50,50" fill="none" stroke="currentColor" class="radar-grid" stroke-width="0.5"/>
                <line x1="50" y1="50" x2="50" y2="15" stroke="currentColor" class="radar-grid" stroke-width="0.5"/>
                <line x1="50" y1="50" x2="80.31" y2="67.5" stroke="currentColor" class="radar-grid" stroke-width="0.5"/>
                <line x1="50" y1="50" x2="19.69" y2="67.5" stroke="currentColor" class="radar-grid" stroke-width="0.5"/>
                <path :d="radarPointsCumulative.path" class="radar-data-polygon radar-data-polygon-red" fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" stroke-width="1.5" stroke-linejoin="round" style="transition: d 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);"/>
                <circle :cx="radarPointsCumulative.p1.x" :cy="radarPointsCumulative.p1.y" r="2" fill="#fff" stroke="#ef4444" stroke-width="1" style="transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);" />
                <circle :cx="radarPointsCumulative.p2.x" :cy="radarPointsCumulative.p2.y" r="2" fill="#fff" stroke="#ef4444" stroke-width="1" style="transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);" />
                <circle :cx="radarPointsCumulative.p3.x" :cy="radarPointsCumulative.p3.y" r="2" fill="#fff" stroke="#ef4444" stroke-width="1" style="transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);" />
                <text x="50" y="10" text-anchor="middle" class="radar-label" font-size="4">Efectivo ($ {{ displayCumulative.fast_cash.toFixed(0) }})</text>
                <text x="90" y="73" text-anchor="end" class="radar-label" font-size="4">Productor ($ {{ displayCumulative.producer.toFixed(0) }})</text>
                <text x="10" y="73" text-anchor="start" class="radar-label" font-size="4">Venta ($ {{ displayCumulative.course_sale.toFixed(0) }})</text>
              </svg>
            </div>
          </div>
        </Transition>
      </div>

    </div>

    <!-- TREE SECTION -->
    <div class="tree-section mt-5">
      <div class="tree-tabs">
        <div class="tabs-group">
          <button class="tree-tab" :class="{ active: activeTab === 'unilevel' }" @click="activeTab = 'unilevel'">Árbol
            Uninivel</button>
          <button class="tree-tab" :class="{ active: activeTab === 'binary' }" @click="activeTab = 'binary'">Árbol
            Binario</button>
        </div>
        <div class="info-tooltip-wrapper">
          <Info :size="18" class="text-light" />
          <div class="info-tooltip">
            <h5>Árbol Uninivel</h5>
            <p>Muestra a <strong>todos tus invitados directos</strong> (sin límite). Úsalo para ver a quién invitaste
              personalmente a la plataforma con tu enlace.</p>
            <h5>Árbol Binario</h5>
            <p>Es tu estructura de red enfocada en volumen de equipo. Muestra únicamente a <strong>tus líderes
                directos</strong> posicionados en tus piernas Izquierda y Derecha (se salta visualmente al derrame de
              tus patrocinadores superiores para mostrarte solo tus resultados reales).</p>
          </div>
        </div>
        
        <!-- Filtro y Buscador Uninivel -->
        <div v-if="activeTab === 'unilevel'" class="unilevel-filter-wrapper ml-auto" style="margin-left: auto; display: flex; gap: 8px; align-items: center;">
          <input type="text" v-model="unilevelSearch" placeholder="Buscar nombre o usuario..." class="premium-select" style="padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); font-size: 0.85rem; width: 180px;" />
          <select v-model="unilevelFilter" class="premium-select" style="padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); font-size: 0.85rem;">
            <option value="all">Todas las piernas</option>
            <option value="Izquierda">Pierna Izquierda</option>
            <option value="Derecha">Pierna Derecha</option>
          </select>
        </div>
      </div>

      <div class="tree-container">

        <!-- Árbol binario dinámico (NUEVO COMPONENTE) -->
        <div v-if="activeTab === 'binary'" class="mt-4">
          <BinaryTreeView />
        </div>

        <!-- Árbol Uninivel dinámico -->
        <div class="tree unilevel-tree" v-if="activeTab === 'unilevel'">
          
          <div class="unilevel-stats-container" v-if="unilevelTreeData.root">
            <div class="unilevel-stats-card">
              <div class="stat-icon icon-green" style="width: 40px; height: 40px;">
                <Users :size="20" />
              </div>
              <div class="stat-info" style="text-align: left;">
                <h4 style="font-size: 1.2rem; margin: 0; color: var(--text-bold);">{{ unilevelTreeData.directs ? unilevelTreeData.directs.length : 0 }}</h4>
                <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Patrocinados directos</p>
              </div>
            </div>
            
            <div class="unilevel-stats-card">
              <div class="stat-icon icon-purple" style="width: 40px; height: 40px;">
                <UserPlus :size="20" />
              </div>
              <div class="stat-info" style="text-align: left;">
                <h4 style="font-size: 1.2rem; margin: 0; color: var(--text-bold);">{{ totalIndirects }}</h4>
                <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Patrocinados indirectos</p>
              </div>
            </div>
          </div>

          <ul v-if="unilevelTreeData.root">
            <li>
              <div class="mlm-node-card root-card" @click.prevent="openUserModal(unilevelTreeData.root, 'Raíz Uninivel', 'Ninguno')">
                <div class="mlm-top-line"></div>
                <div class="mlm-node-content">
                  <div class="mlm-avatar">
                    <img v-if="unilevelTreeData.root.photo" :src="getAvatarUrl(unilevelTreeData.root.photo)" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;" />
                    <span v-else>{{ unilevelTreeData.root.name?.charAt(0) || 'R' }}</span>
                  </div>
                  <h4 class="mlm-name">{{ unilevelTreeData.root.name }}</h4>
                  <p class="mlm-rank">{{ unilevelTreeData.root.role || 'Patrocinador' }}</p>
                </div>
              </div>

              <ul v-if="filteredDirects && filteredDirects.length > 0">
                <UnilevelTreeNode 
                  v-for="direct in filteredDirects" 
                  :key="direct.id" 
                  :node="direct" 
                  :sponsorName="unilevelTreeData.root.name"
                />
              </ul>
              <div v-else class="mt-4 text-muted text-center" style="font-size: 13px;">
                Aún no tienes invitados directos. ¡Comparte tu enlace de referido!
              </div>
            </li>
          </ul>
          <div v-else class="loading-state">
            <Loader2 class="spinner-icon" :size="40" />
            <p>Cargando árbol uninivel...</p>
          </div>
        </div>

      </div>

    </div>

    <!-- Toast Notification -->
    <div class="toast-notification" v-if="showToast">
      <div class="toast-icon">
        <CheckCircle2 :size="20" class="text-green" />
      </div>
      <div class="toast-content">
        <h4>👋 Bienvenido {{ user?.name || 'Líder' }}!</h4>
        <p>Has iniciado sesión correctamente en Promolider. ¡Ya puedes empezar a explorar!</p>
      </div>
      <button class="toast-close" @click="showToast = false">
        <X :size="16" />
      </button>
    </div>

  </div>

  <!-- Modal Datos de Usuario -->
  <div class="user-modal-overlay" v-if="showUserModal" @click.self="closeUserModal">
    <div class="user-modal">
      <div class="user-modal-header">
        <h3>Datos de usuario</h3>
        <button class="user-modal-close" @click="closeUserModal"><X :size="20" /></button>
      </div>
      <div class="user-modal-body" v-if="selectedUser">
        <!-- Error loading details -->
        <div v-if="detailsError" class="user-info-row" style="color: #ff4d4f; font-size: 13px; margin-bottom: 15px; display: block; text-align: center;">
          <AlertCircle :size="16" style="display: inline-block; vertical-align: middle; margin-right: 5px;" />
          <span>Error al conectar con el servidor: {{ detailsError }}</span>
        </div>

        <div class="user-info-row">
          <span>Usuario</span>
          <strong v-if="loadingDetails" class="text-muted"><Loader2 class="spinner-icon-inline" :size="12" style="display: inline-block; animation: spin 1s linear infinite; margin-right: 4px;" />Cargando...</strong>
          <strong v-else>{{ selectedUser.username || selectedUser.user_name || '-' }}</strong>
        </div>
        <div class="user-info-row">
          <span>Nombre</span>
          <strong>{{ selectedUser.name || '-' }}</strong>
        </div>
        <div class="user-info-row">
          <span>Apellido</span>
          <strong v-if="loadingDetails" class="text-muted"><Loader2 class="spinner-icon-inline" :size="12" style="display: inline-block; animation: spin 1s linear infinite; margin-right: 4px;" />Cargando...</strong>
          <strong v-else>{{ selectedUser.last_name || '-' }}</strong>
        </div>
        <div class="user-info-row">
          <span>Correo electrónico</span>
          <strong v-if="loadingDetails" class="text-muted"><Loader2 class="spinner-icon-inline" :size="12" style="display: inline-block; animation: spin 1s linear infinite; margin-right: 4px;" />Cargando...</strong>
          <strong v-else>{{ selectedUser.email || '-' }}</strong>
        </div>
        <div class="user-info-row">
          <span>Celular</span>
          <strong v-if="loadingDetails" class="text-muted"><Loader2 class="spinner-icon-inline" :size="12" style="display: inline-block; animation: spin 1s linear infinite; margin-right: 4px;" />Cargando...</strong>
          <strong v-else>{{ selectedUser.phone || '-' }}</strong>
        </div>
        <div class="user-info-row">
          <span>Fecha nacimiento</span>
          <strong v-if="loadingDetails" class="text-muted"><Loader2 class="spinner-icon-inline" :size="12" style="display: inline-block; animation: spin 1s linear infinite; margin-right: 4px;" />Cargando...</strong>
          <strong v-else>{{ formatDate(selectedUser.date_birth || selectedUser.dob) || '-' }}</strong>
        </div>
        <div class="user-info-row">
          <span>Fecha de registro</span>
          <strong v-if="loadingDetails" class="text-muted"><Loader2 class="spinner-icon-inline" :size="12" style="display: inline-block; animation: spin 1s linear infinite; margin-right: 4px;" />Cargando...</strong>
          <strong v-else>{{ formatDate(selectedUser.created_at) || '-' }}</strong>
        </div>
        <div class="user-info-row">
          <span>Membresía</span>
          <strong v-if="loadingDetails" class="text-muted"><Loader2 class="spinner-icon-inline" :size="12" style="display: inline-block; animation: spin 1s linear infinite; margin-right: 4px;" />Cargando...</strong>
          <strong v-else>{{ selectedUser.account_type?.account || selectedUser.account_type?.name || selectedUser.membership?.name || selectedUser.role || 'University' }}</strong>
        </div>
        <div class="user-info-row">
          <span>Estado de OPC</span>
          <span class="badge" :class="isTruthy(selectedUser.active) ? 'badge-green' : 'badge-red'">{{ isTruthy(selectedUser.active) ? 'ACTIVO' : 'INACTIVO' }}</span>
        </div>
        <div class="user-info-row">
          <span>Estado de membresía</span>
          <span class="badge" :class="isTruthy(selectedUser.membershipActive) ? 'badge-green' : 'badge-red'">{{ isTruthy(selectedUser.membershipActive) ? 'ACTIVO' : 'INACTIVO' }}</span>
        </div>
        <div class="user-info-row">
          <span>Calificado</span>
          <span class="badge" :class="isQualified(selectedNode, selectedUser) ? 'badge-green' : 'badge-red'">{{ isQualified(selectedNode, selectedUser) ? 'Calificado' : 'No calificado' }}</span>
        </div>
        <div class="user-info-row">
          <span>Volumen izq.</span>
          <strong>{{ selectedNode?.LeftPoints || selectedNode?.left_points || selectedUser?.LeftPoints || 0 }}</strong>
        </div>
        <div class="user-info-row">
          <span>Volumen der.</span>
          <strong>{{ selectedNode?.RightPoints || selectedNode?.right_points || selectedUser?.RightPoints || 0 }}</strong>
        </div>
        
        <!-- Nuevos campos de posición jerárquica -->
        <hr class="modal-divider" />
        
        <div class="user-info-row position-row">
          <span>Posición (Pierna)</span>
          <strong class="text-blue">{{ selectedPosition }}</strong>
        </div>
        <div class="user-info-row position-row">
          <span>Afiliado a (Patrocinador)</span>
          <strong class="text-purple">{{ selectedSponsor }}</strong>
        </div>

      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue';
import {
  CheckCircle2, XCircle, TrendingUp, Clock, Award, Users, Video, PlayCircle, UserPlus, X, Info, Loader2, AlertCircle
} from 'lucide-vue-next';
import api from '@/services/apiClient';
import { useAuthStore } from '@/features/auth/stores/authStore';
import BinaryTreeView from '@/components/MLM/BinaryTreeView.vue';
import UnilevelTreeNode from '@/features/dashboard/components/UnilevelTreeNode.vue';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const showToast = ref(false);

const activeTab = ref('binary');

// Manejo de URL de S3 para fotos de avatar
const getAvatarUrl = (photoPath) => {
  if (!photoPath) return '';
  if (photoPath.startsWith('http')) return photoPath;
  return `https://promolider-storage-user.s3.sa-east-1.amazonaws.com/${photoPath}`;
};

const allConditionsMet = computed(() => {
  return widgetsData.value.conditions.membershipActive && 
         widgetsData.value.conditions.active && 
         widgetsData.value.conditions.qualified;
});

// Modal state
const showUserModal = ref(false);
const selectedNode = ref(null);
const selectedUser = ref(null);
const selectedPosition = ref('');
const selectedSponsor = ref('');
const loadingDetails = ref(false);
const detailsError = ref(null);

const openUserModal = async (nodeData, position, sponsorName) => {
  if (!nodeData) return;
  
  // Extraemos el usuario (a veces viene anidado en nodeData.user)
  const userData = nodeData.user ? nodeData.user : nodeData;
  
  console.log("=== openUserModal ===");
  console.log("nodeData:", JSON.stringify(nodeData));
  console.log("extracted userData:", JSON.stringify(userData));
  console.log("position:", position);
  console.log("sponsorName:", sponsorName);

  selectedNode.value = nodeData;
  selectedUser.value = userData;
  selectedPosition.value = position;
  selectedSponsor.value = sponsorName || 'Ninguno';
  showUserModal.value = true;
  loadingDetails.value = false;
  detailsError.value = null;

  // Cargar datos detallados del usuario de manera asíncrona solo si no están ya cargados
  const userId = userData.id;
  console.log("Extracted userId:", userId);
  
  // Si ya tiene el email y el username, la data fue cargada de forma eficiente por eager loading.
  if (userData.email && (userData.username || userData.user_name)) {
    console.log("User details already present via eager loading. Skipping API fetch.");
    return;
  } else {
    // Si llegamos aquí, significa que el frontend tiene una versión vieja del caché del árbol.
    detailsError.value = "Por favor, recarga la página (F5) para sincronizar los últimos datos del usuario desde el servidor.";
    console.warn("Faltan datos del usuario. El caché está obsoleto.");
  }
};

const closeUserModal = () => {
  showUserModal.value = false;
  selectedUser.value = null;
  selectedNode.value = null;
  detailsError.value = null;
};

// Proveer la función a los componentes hijos
provide('openUserModal', openUserModal);

// Utils para el modal
const isTruthy = (val) => val === true || val === 1 || val === '1';

const formatDate = (dateString) => {
  if (!dateString) return null;
  
  // Prevenir que Javascript reste un día por culpa de la zona horaria (Timezone offset)
  // Extraemos puramente el YYYY-MM-DD ya sea que venga con tiempo (T o espacio) o solo.
  const datePart = String(dateString).split('T')[0].split(' ')[0];
  const parts = datePart.split('-');
  
  if (parts.length === 3) {
    // parts[0] = Año, parts[1] = Mes, parts[2] = Día
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // Fallback si el string no tiene formato estándar
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const isOpcActive = (user) => {
  if (!user) return false;
  // Considerar varios posibles nombres de variable en el API
  return user.opc_active || user.is_opc_active || user.opc_status || false;
};

const isQualified = (node, user) => {
  if (!node && !user) return false;
  return node?.qualified || user?.qualified || node?.is_qualified || user?.is_qualified || false;
};

const widgetsData = ref(JSON.parse(sessionStorage.getItem('dashboard_widgets')) || {
  conditions: {
    membershipActive: false,
    active: false,
    qualified: false
  },
  monthly_bonuses: {
    expansion: 0,
    binary: 0,
    generational: 0
  },
  cumulative_bonuses: {
    fast_cash: 0,
    producer: 0,
    course_sale: 0
  }
});

const binaryTreeData = ref(JSON.parse(sessionStorage.getItem('dashboard_binary')) || {});
const unilevelTreeData = ref(JSON.parse(sessionStorage.getItem('dashboard_unilevel')) || {});

const unilevelFilter = ref('all'); // 'all', 'Izquierda', 'Derecha'
const unilevelSearch = ref('');

provide('openUserModal', openUserModal);
provide('unilevelSearch', unilevelSearch);
provide('unilevelFilter', unilevelFilter);

const totalIndirects = computed(() => {
  if (!unilevelTreeData.value.directs) return 0;
  
  let count = 0;
  const countDescendants = (nodes) => {
    for (const node of nodes) {
      if (node.directs && node.directs.length > 0) {
        count += node.directs.length;
        countDescendants(node.directs);
      }
    }
  };
  
  countDescendants(unilevelTreeData.value.directs);
  return count;
});

const filteredDirects = computed(() => {
  if (!unilevelTreeData.value.directs) return [];
  
  let result = unilevelTreeData.value.directs;
  
  if (unilevelFilter.value !== 'all') {
    result = result.filter(direct => direct.leg === unilevelFilter.value);
  }
  
  if (unilevelSearch.value.trim() !== '') {
    const q = unilevelSearch.value.trim().toLowerCase();
    result = result.filter(direct => 
      (direct.name && direct.name.toLowerCase().includes(q)) || 
      (direct.username && direct.username.toLowerCase().includes(q))
    );
  }
  
  return result;
});

const activeStatsTab = ref('classic');
const isSimulated = ref(false);
const timeframe = ref('normal');

const displayMonthly = computed(() => {
  if (isSimulated.value) {
    return {
      expansion: 1250,
      binary: 850,
      generational: 450
    };
  }
  return widgetsData.value.monthly_bonuses || { expansion: 0, binary: 0, generational: 0 };
});

const displayCumulative = computed(() => {
  if (isSimulated.value) {
    return {
      fast_cash: 620,
      producer: 1100,
      course_sale: 350
    };
  }
  return widgetsData.value.cumulative_bonuses || { fast_cash: 0, producer: 0, course_sale: 0 };
});

const radarPoints = computed(() => {
  const b = displayMonthly.value;
  const max = Math.max(b.expansion, b.binary, b.generational, 1); // evitamos dividir por cero
  
  // Ratios
  // Un valor mínimo de 0.08 asegura que en cero se dibuje un pequeño triángulo circular
  const r1 = Math.max(0.08, b.expansion / max);
  const r2 = Math.max(0.08, b.binary / max);
  const r3 = Math.max(0.08, b.generational / max);

  // Centro: 50,50. Radio máximo: 35
  const y1 = 50 - 35 * r1;
  const x2 = 50 + 30.31 * r2;
  const y2 = 50 + 17.5 * r2;
  const x3 = 50 - 30.31 * r3;
  const y3 = 50 + 17.5 * r3;
  
  return {
    path: `M 50,${y1} L ${x2},${y2} L ${x3},${y3} Z`,
    p1: { x: 50, y: y1 },
    p2: { x: x2, y: y2 },
    p3: { x: x3, y: y3 }
  };
});

const radarPointsCumulative = computed(() => {
  const b = displayCumulative.value;
  const max = Math.max(b.fast_cash, b.producer, b.course_sale, 1);
  
  const r1 = Math.max(0.08, b.fast_cash / max);
  const r2 = Math.max(0.08, b.producer / max);
  const r3 = Math.max(0.08, b.course_sale / max);

  // Centro: 50,50. Radio máximo: 35
  const y1 = 50 - 35 * r1;
  const x2 = 50 + 30.31 * r2;
  const y2 = 50 + 17.5 * r2;
  const x3 = 50 - 30.31 * r3;
  const y3 = 50 + 17.5 * r3;
  
  return {
    path: `M 50,${y1} L ${x2},${y2} L ${x3},${y3} Z`,
    p1: { x: 50, y: y1 },
    p2: { x: x2, y: y2 },
    p3: { x: x3, y: y3 }
  };
});

const loadDashboardWidgets = async () => {
  try {
    const response = await api.get('/dashboard/widgets?timeframe=' + timeframe.value);
    if (response.data && response.data.data) {
      widgetsData.value = response.data.data;
      if (timeframe.value === 'normal') {
        sessionStorage.setItem('dashboard_widgets', JSON.stringify(response.data.data));
      }
    }
  } catch (error) {
    console.error("Error cargando widgets del dashboard:", error);
  }
};

const loadBinaryTree = async () => {
  try {
    const response = await api.get('/dashboard/binary-tree');
    if (response.data && response.data.data) {
      const data = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
      if (data) {
        binaryTreeData.value = data;
        sessionStorage.setItem('dashboard_binary', JSON.stringify(data));
      }
    }
  } catch (error) {
    console.error("Error cargando árbol binario:", error);
  }
};

const loadUnilevelTree = async () => {
  try {
    const response = await api.get('/dashboard/unilevel-tree');
    if (response.data && response.data.data) {
      unilevelTreeData.value = response.data.data;
      sessionStorage.setItem('dashboard_unilevel', JSON.stringify(response.data.data));
    }
  } catch (error) {
    console.error("Error cargando árbol uninivel:", error);
  }
};

onMounted(() => {
  loadDashboardWidgets();
  loadBinaryTree();
  loadUnilevelTree();

  // Mostrar el toast de bienvenida solo una vez por sesión
  if (!sessionStorage.getItem('dashboard_toast_shown')) {
    setTimeout(() => {
      showToast.value = true;
      sessionStorage.setItem('dashboard_toast_shown', 'true');

      // Ocultar el toast después de 6 segundos
      setTimeout(() => {
        showToast.value = false;
      }, 6000);
    }, 500);
  }
});
</script>

<style scoped>
.text-green { color: #10b981 !important; }
.text-red { color: #ef4444 !important; }
.text-blue { color: #3b82f6 !important; }
.text-purple { color: #a855f7 !important; }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #8c9bb1;
  font-weight: 500;
  font-size: 1.1rem;
}

.spinner-icon {
  animation: spin 1s linear infinite;
  color: #1ed760;
  /* Verde Promolider */
  margin-bottom: 15px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* ESTILOS REUTILIZADOS DEL ARBOL BINARIO (mlm-node-card) */
.mlm-node-card {
  position: relative;
  width: 90px;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  padding: 6px 4px;
  transition: all 0.3s ease;
  z-index: 10;
  cursor: pointer;
  margin: 0 auto; /* Para centrar la raíz si es necesario */
}

.mlm-node-card.root-card {
  width: 110px;
  padding: 8px 6px;
  border-color: var(--primary-color);
  box-shadow: 0 4px 15px rgba(24, 214, 0, 0.2);
}

.mlm-node-card.root-card .mlm-avatar {
  width: 36px;
  height: 36px;
}
.mlm-node-card.root-card .mlm-name {
  font-size: 0.75rem;
}

.mlm-node-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.mlm-top-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.mlm-node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mlm-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
  border: 2px solid var(--border-color);
}

.mlm-avatar span {
  color: #10b981;
  font-weight: 700;
  font-size: 0.65rem;
}

.mlm-name {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-bold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
  margin: 0;
}

.mlm-rank {
  font-size: 0.5rem;
  color: var(--text-muted);
  font-weight: 500;
  margin: 0 0 4px 0;
}

.mlm-points-grid {
  width: 100%;
  display: grid;
  gap: 4px;
  text-align: center;
  background: var(--bg-main);
  border-radius: 6px;
  padding: 4px;
  border: 1px solid var(--border-color);
}

.mlm-point-box {
  display: flex;
  flex-direction: column;
}

.mlm-point-label {
  font-size: 0.45rem;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0;
}

.mlm-point-value {
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--text-bold);
}

.unilevel-stats-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.unilevel-stats-card {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: var(--card-bg);
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
</style>


