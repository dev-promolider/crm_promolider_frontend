<template>
  <div class="ranks-and-bonuses-container">
    <!-- Header -->
    <div class="header-section">
      <div>
        <h1 class="page-title">Rangos y Bonos</h1>
        <p class="page-subtitle">Progreso dinámico hacia el siguiente rango y desglose de ganancias generacionales</p>
      </div>
      <div class="header-actions">
        <button class="btn-refresh" :disabled="loading" @click="loadData">
          <Loader2 v-if="loading" class="animate-spin" :size="16" />
          <RefreshCw v-else :size="16" />
          <span>{{ loading ? 'Cargando...' : 'Actualizar' }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container card">
      <Loader2 class="animate-spin" :size="36" style="color: var(--primary-color);" />
      <p class="loading-text">Cargando información del plan de compensación...</p>
    </div>

    <template v-else>
      <!-- Navigation Tabs -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" :size="16" />
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- ════════════════════ TAB 1: MI PROGRESO ════════════════════ -->
      <div v-if="activeTab === 'progress'" class="tab-content">
        <!-- Top Stats Summary -->
        <div class="stats-grid">
          <!-- Current Rank Card -->
          <div class="card current-rank-card clickable" @click="selectRankModal(currentRankInfo)">
            <div class="rank-badge-wrapper">
              <img
                :src="getS3Url(currentRankInfo?.icon)"
                :alt="currentRankInfo?.name"
                class="rank-icon-lg"
                @error="$event.target.src = '/img_mantenimiento.png'"
              />
            </div>
            <div class="rank-details">
              <span class="card-kicker">Rango Actual</span>
              <h2 class="rank-name">{{ currentRankInfo?.name || 'Aprendiz' }}</h2>
              <p class="rank-sub">Nivel {{ currentRankInfo?.level || 1 }} · {{ currentPoints.toLocaleString() }} pts acumulados</p>
            </div>
          </div>

          <!-- Next Rank Card -->
          <div class="card next-rank-card clickable" v-if="nextRank" @click="selectRankModal(nextRank)">
            <div class="rank-badge-wrapper next-badge">
              <img
                :src="getS3Url(nextRank.icon)"
                :alt="nextRank.name"
                class="rank-icon-lg"
                @error="$event.target.src = '/img_mantenimiento.png'"
              />
            </div>
            <div class="rank-details">
              <span class="card-kicker">Siguiente Meta</span>
              <h2 class="rank-name">{{ nextRank.name }}</h2>
              <p class="rank-sub">
                Meta: {{ nextRank.vol_min.toLocaleString() }} pts · {{ nextRank.active_direct }} directos activos
              </p>
            </div>
          </div>
        </div>

        <!-- Progress Card -->
        <div class="card content-card progress-card" v-if="nextRank">
          <div class="card-header-flex">
            <div>
              <h3 class="card-title">Avance al Rango {{ nextRank.name }}</h3>
              <p class="card-subtitle">Volumen binario acumulado y directos activos calificados en tiempo real</p>
            </div>
            <div class="pct-badge">
              <span>{{ progressPercentage }}%</span>
            </div>
          </div>

          <!-- Bar -->
          <div class="progress-bar-track">
            <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>

          <!-- Metrics Row -->
          <div class="metrics-row">
            <div class="metric-item">
              <span class="metric-label">Puntos Actuales</span>
              <span class="metric-value primary">{{ currentPoints.toLocaleString() }} pts</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Puntos Requeridos</span>
              <span class="metric-value">{{ nextRank.vol_min.toLocaleString() }} pts</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Puntos Faltantes</span>
              <span class="metric-value" :class="missingPoints === 0 ? 'success' : 'warning'">
                {{ missingPoints === 0 ? '0 pts' : `${missingPoints.toLocaleString()} pts` }}
              </span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Directos Activos</span>
              <span class="metric-value" :class="activeDirects >= nextRank.active_direct ? 'success' : 'warning'">
                {{ activeDirects }} / {{ nextRank.active_direct }}
              </span>
            </div>
          </div>
        </div>

        <!-- Interactive Ranks Roadmap -->
        <div class="card content-card">
          <div class="card-header-flex mb-4">
            <div>
              <h3 class="card-title">Escalera de Rangos Interactiva</h3>
              <p class="card-subtitle">Haz clic en cualquier rango para inspeccionar sus requisitos y beneficios</p>
            </div>
          </div>
          <div class="ranks-roadmap">
            <div
              v-for="rank in sortedRanks"
              :key="rank.id"
              class="roadmap-card clickable"
              :class="{
                'is-current': rank.name.toLowerCase() === (currentRankInfo?.name || '').toLowerCase(),
                'is-achieved': isRankAchieved(rank),
                'is-next': nextRank && rank.name.toLowerCase() === nextRank.name.toLowerCase()
              }"
              @click="selectRankModal(rank)"
            >
              <!-- Top Right Pills properly positioned inside the card -->
              <span v-if="rank.name.toLowerCase() === (currentRankInfo?.name || '').toLowerCase()" class="current-pill">
                Actual
              </span>
              <span v-else-if="nextRank && rank.name.toLowerCase() === nextRank.name.toLowerCase()" class="next-pill">
                Meta
              </span>

              <div class="roadmap-icon">
                <img
                  :src="getS3Url(rank.icon)"
                  :alt="rank.name"
                  class="rank-icon-sm"
                  @error="$event.target.src = '/img_mantenimiento.png'"
                />
              </div>
              <div class="roadmap-meta">
                <span class="roadmap-name">{{ rank.name }}</span>
                <span class="roadmap-pts">{{ rank.vol_min.toLocaleString() }} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════ TAB 2: RANGOS Y REQUISITOS ════════════════════ -->
      <div v-if="activeTab === 'ranks'" class="tab-content">
        <div class="card content-card">
          <div class="card-header-flex mb-4">
            <div>
              <h3 class="card-title">Matriz de Rangos y Requisitos</h3>
              <p class="card-subtitle">Plan de compensación dinámico consumido directamente del servidor</p>
            </div>
            <div class="search-input-wrapper sm">
              <Search :size="14" class="search-icon" />
              <input v-model="ranksSearch" type="text" class="filter-input" placeholder="Buscar rango..." />
            </div>
          </div>

          <div class="table-container">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Rango</th>
                  <th>Vol. Mínimo (pts)</th>
                  <th>Directos Activos</th>
                  <th>Pago Máximo</th>
                  <th>Bono Mensual</th>
                  <th>Lím. Generacional</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="rank in filteredRanks"
                  :key="rank.id"
                  class="clickable-row"
                  :class="{ 'highlight-row': rank.name.toLowerCase() === (currentRankInfo?.name || '').toLowerCase() }"
                  @click="selectRankModal(rank)"
                >
                  <td class="rank-td">
                    <img
                      :src="getS3Url(rank.icon)"
                      :alt="rank.name"
                      class="rank-icon-table"
                      @error="$event.target.src = '/img_mantenimiento.png'"
                    />
                    <div>
                      <strong class="rank-td-title">{{ rank.name }}</strong>
                      <span v-if="rank.name.toLowerCase() === (currentRankInfo?.name || '').toLowerCase()" class="user-badge">
                        Tu Rango
                      </span>
                    </div>
                  </td>
                  <td><strong>{{ rank.vol_min.toLocaleString() }}</strong></td>
                  <td>{{ rank.active_direct }} directos</td>
                  <td>${{ (rank.max_pay || 0).toLocaleString() }}</td>
                  <td class="bonus-cell">${{ (rank.monthly_bonus || 0).toLocaleString() }}</td>
                  <td>{{ rank.limit_generation }} gen.</td>
                </tr>
                <tr v-if="filteredRanks.length === 0">
                  <td colspan="6" class="empty-cell">
                    <Inbox :size="32" class="empty-icon" />
                    <p>No se encontraron rangos que coincidan con la búsqueda.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ════════════════════ TAB 3: BONOS GENERACIONALES ════════════════════ -->
      <div v-if="activeTab === 'generational'" class="tab-content">
        <!-- Monthly & Cumulative Summary -->
        <div class="bonus-summary-grid space-separated-grid mb-6">
          <!-- Monthly Bonuses -->
          <div class="card summary-box">
            <h4 class="box-title">Bonos Mensuales</h4>
            <div class="bonus-items">
              <div class="b-item">
                <span class="b-label">Bono Expansión</span>
                <strong class="b-val">${{ (widgets?.monthly_bonuses?.expansion || 0).toLocaleString() }}</strong>
              </div>
              <div class="b-item">
                <span class="b-label">Bono Binario</span>
                <strong class="b-val">${{ (widgets?.monthly_bonuses?.binary || 0).toLocaleString() }}</strong>
              </div>
              <div class="b-item">
                <span class="b-label">Bono Generacional</span>
                <strong class="b-val primary-text">${{ (widgets?.monthly_bonuses?.generational || 0).toLocaleString() }}</strong>
              </div>
            </div>
          </div>

          <!-- Cumulative Bonuses -->
          <div class="card summary-box">
            <h4 class="box-title">Bonos Acumulativos</h4>
            <div class="bonus-items">
              <div class="b-item">
                <span class="b-label">Fast Cash</span>
                <strong class="b-val">${{ (widgets?.cumulative_bonuses?.fast_cash || 0).toLocaleString() }}</strong>
              </div>
              <div class="b-item">
                <span class="b-label">Productor</span>
                <strong class="b-val">${{ (widgets?.cumulative_bonuses?.producer || 0).toLocaleString() }}</strong>
              </div>
              <div class="b-item">
                <span class="b-label">Venta de Curso</span>
                <strong class="b-val">${{ (widgets?.cumulative_bonuses?.course_sale || 0).toLocaleString() }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Generational Matrix Table -->
        <div class="card content-card mt-6">
          <div class="card-header-flex mb-4">
            <div>
              <h3 class="card-title">Porcentajes de Ganancias Generacionales por Rango</h3>
              <p class="card-subtitle">Porcentaje percibido sobre las comisiones generadas por tu equipo (G1 a G8)</p>
            </div>
            <div class="search-input-wrapper sm">
              <Search :size="14" class="search-icon" />
              <input v-model="genSearch" type="text" class="filter-input" placeholder="Filtrar por rango..." />
            </div>
          </div>

          <div class="table-container">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Rango</th>
                  <th>G1</th>
                  <th>G2</th>
                  <th>G3</th>
                  <th>G4</th>
                  <th>G5</th>
                  <th>G6</th>
                  <th>G7</th>
                  <th>G8</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="gen in filteredGenerational"
                  :key="gen.id"
                  :class="{ 'highlight-row': gen.rank_name?.toLowerCase() === (currentRankInfo?.name || '').toLowerCase() }"
                >
                  <td><strong>{{ gen.rank_name }}</strong></td>
                  <td><span class="pct-cell">{{ gen.g_1 }}%</span></td>
                  <td><span class="pct-cell">{{ gen.g_2 }}%</span></td>
                  <td><span class="pct-cell">{{ gen.g_3 }}%</span></td>
                  <td><span class="pct-cell">{{ gen.g_4 }}%</span></td>
                  <td><span class="pct-cell">{{ gen.g_5 }}%</span></td>
                  <td><span class="pct-cell">{{ gen.g_6 }}%</span></td>
                  <td><span class="pct-cell">{{ gen.g_7 }}%</span></td>
                  <td><span class="pct-cell">{{ gen.g_8 }}%</span></td>
                </tr>
                <tr v-if="filteredGenerational.length === 0">
                  <td colspan="9" class="empty-cell">
                    <Inbox :size="32" class="empty-icon" />
                    <p>No hay datos generacionales disponibles.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ════════════════════ TAB 4: PUNTOS ACTIVOS ════════════════════ -->
      <div v-if="activeTab === 'points'" class="tab-content">
        <!-- Interactive Leg Buttons / Cards -->
        <div class="stats-grid leg-cards-grid mb-6">
          <!-- Left Leg Button Card -->
          <div
            class="card leg-stat-card left-border clickable"
            :class="{ 'active-leg-left': selectedLeg === 'left' }"
            @click="selectedLeg = 'left'"
          >
            <div class="leg-stat-header">
              <Users :size="20" style="color: #3b82f6;" />
              <span class="leg-stat-title">Pierna Izquierda</span>
              <span class="badge-count">{{ activeBinaryPoints.left_leg?.length || 0 }} registros</span>
            </div>
            <div class="leg-stat-value" style="color: #3b82f6;">
              {{ (activeBinaryPoints.total_left || 0).toFixed(2) }} <span class="pts-unit">PTS</span>
            </div>
            <div class="card-action-hint">
              <span>{{ selectedLeg === 'left' ? '✓ Mostrando registros de esta pierna' : 'Haz clic para ver registros de esta pierna' }}</span>
            </div>
          </div>

          <!-- Right Leg Button Card -->
          <div
            class="card leg-stat-card right-border clickable"
            :class="{ 'active-leg-right': selectedLeg === 'right' }"
            @click="selectedLeg = 'right'"
          >
            <div class="leg-stat-header">
              <Users :size="20" style="color: #10b981;" />
              <span class="leg-stat-title">Pierna Derecha</span>
              <span class="badge-count">{{ activeBinaryPoints.right_leg?.length || 0 }} registros</span>
            </div>
            <div class="leg-stat-value" style="color: #10b981;">
              {{ (activeBinaryPoints.total_right || 0).toFixed(2) }} <span class="pts-unit">PTS</span>
            </div>
            <div class="card-action-hint">
              <span>{{ selectedLeg === 'right' ? '✓ Mostrando registros de esta pierna' : 'Haz clic para ver registros de esta pierna' }}</span>
            </div>
          </div>
        </div>

        <!-- Filter Controls Bar for Active Points -->
        <div class="card content-card leg-controls-card mb-6">
          <div class="filters-bar flex-between gap-4">
            <!-- Leg Selection Buttons (Left vs Right) -->
            <div class="leg-filter-buttons">
              <button
                class="leg-toggle-btn left"
                :class="{ active: selectedLeg === 'left' }"
                @click="selectedLeg = 'left'"
              >
                Pierna Izquierda ({{ activeBinaryPoints.left_leg?.length || 0 }})
              </button>
              <button
                class="leg-toggle-btn right"
                :class="{ active: selectedLeg === 'right' }"
                @click="selectedLeg = 'right'"
              >
                Pierna Derecha ({{ activeBinaryPoints.right_leg?.length || 0 }})
              </button>
            </div>

            <!-- Search input for points records -->
            <div class="search-input-wrapper">
              <Search :size="16" class="search-icon" />
              <input
                v-model="pointsSearch"
                type="text"
                class="filter-input"
                placeholder="Buscar en registros de esta pierna..."
              />
            </div>
          </div>
        </div>

        <!-- Selected Leg Table (Left) -->
        <div
          class="card content-card leg-table-card mb-6"
          v-if="selectedLeg === 'left'"
        >
          <div class="card-header-flex mb-4">
            <div>
              <h3 class="card-title">Pierna Izquierda ({{ filteredLeftLeg.length }} de {{ activeBinaryPoints.left_leg?.length || 0 }} registros)</h3>
              <p class="card-subtitle">Registros de puntos activos acumulados en la rama izquierda</p>
            </div>
          </div>

          <div class="table-container">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Generado por</th>
                  <th>Relación</th>
                  <th>Motivo</th>
                  <th>Puntos</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredLeftLeg" :key="item.id">
                  <td>
                    <div class="user-cell">
                      <img :src="getS3Url(item.sponsor?.photo)" class="avatar-sm" @error="$event.target.src = '/img_mantenimiento.png'" />
                      <span>{{ item.sponsor?.name || '—' }}</span>
                    </div>
                  </td>
                  <td><span class="gen-badge">{{ formatGeneration(item.generation) }}</span></td>
                  <td>{{ item.reason }}</td>
                  <td><strong style="color: #3b82f6;">+{{ item.points }} pts</strong></td>
                  <td class="date-col">{{ formatDate(item.created_at) }}</td>
                </tr>
                <tr v-if="filteredLeftLeg.length === 0">
                  <td colspan="5" class="empty-cell">
                    <Inbox :size="32" class="empty-icon" />
                    <p>No hay registros que coincidan con la búsqueda en la pierna izquierda.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Selected Leg Table (Right) -->
        <div
          class="card content-card leg-table-card mb-6"
          v-if="selectedLeg === 'right'"
        >
          <div class="card-header-flex mb-4">
            <div>
              <h3 class="card-title">Pierna Derecha ({{ filteredRightLeg.length }} de {{ activeBinaryPoints.right_leg?.length || 0 }} registros)</h3>
              <p class="card-subtitle">Registros de puntos activos acumulados en la rama derecha</p>
            </div>
          </div>

          <div class="table-container">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Generado por</th>
                  <th>Relación</th>
                  <th>Motivo</th>
                  <th>Puntos</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredRightLeg" :key="item.id">
                  <td>
                    <div class="user-cell">
                      <img :src="getS3Url(item.sponsor?.photo)" class="avatar-sm" @error="$event.target.src = '/img_mantenimiento.png'" />
                      <span>{{ item.sponsor?.name || '—' }}</span>
                    </div>
                  </td>
                  <td><span class="gen-badge">{{ formatGeneration(item.generation) }}</span></td>
                  <td>{{ item.reason }}</td>
                  <td><strong style="color: #10b981;">+{{ item.points }} pts</strong></td>
                  <td class="date-col">{{ formatDate(item.created_at) }}</td>
                </tr>
                <tr v-if="filteredRightLeg.length === 0">
                  <td colspan="5" class="empty-cell">
                    <Inbox :size="32" class="empty-icon" />
                    <p>No hay registros que coincidan con la búsqueda en la pierna derecha.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="!activeBinaryPoints.left_leg?.length && !activeBinaryPoints.right_leg?.length" class="card content-card empty-card">
          <Inbox :size="48" class="empty-icon" />
          <p>No hay puntos binarios activos en este momento.</p>
        </div>
      </div>

      <!-- ════════════════════ TAB 5: HISTORIAL DE MOVIMIENTOS ════════════════════ -->
      <div v-if="activeTab === 'movements'" class="tab-content">
        <div class="card content-card movements-card">
          <div class="card-header-flex mb-6">
            <div>
              <h3 class="card-title">Historial de Movimientos de Billetera</h3>
              <p class="card-subtitle">Transacciones y comisiones registradas en tu cuenta</p>
            </div>
          </div>

          <!-- Filters -->
          <div class="filters-bar mb-6">
            <div class="search-input-wrapper">
              <Search :size="16" class="search-icon" />
              <input
                v-model="movSearch"
                type="text"
                class="filter-input"
                placeholder="Buscar por concepto o razón..."
                @input="debouncedFetchMovements"
              />
            </div>

            <select v-model="movStatusFilter" class="filter-select" @change="fetchMovements(1)">
              <option value="all">Todos los estados</option>
              <option value="approved">Aprobado</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>

          <!-- Movements Loading -->
          <div v-if="movLoading" class="loading-inline">
            <Loader2 class="animate-spin" :size="24" style="color: var(--primary-color);" />
            <span>Cargando movimientos...</span>
          </div>

          <template v-else>
            <div class="table-container">
              <table class="premium-table spacious-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto / Razón</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="mov in movements" :key="mov.id">
                    <td class="date-col">{{ formatDate(mov.created_at) }}</td>
                    <td><strong>{{ mov.reason || mov.concept || 'Movimiento de Billetera' }}</strong></td>
                    <td><span class="type-pill">{{ mov.type || 'Comisión' }}</span></td>
                    <td>
                      <strong :class="mov.amount >= 0 ? 'amount-positive' : 'amount-negative'">
                        {{ mov.amount >= 0 ? '+' : '' }}${{ Math.abs(mov.amount).toFixed(2) }}
                      </strong>
                    </td>
                    <td>
                      <span class="status-pill" :class="'status-' + (mov.status || 'approved')">
                        {{ formatStatus(mov.status) }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="movements.length === 0">
                    <td colspan="5" class="empty-cell">
                      <Inbox :size="32" class="empty-icon" />
                      <p>No se encontraron movimientos registrados.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="pagination-footer mt-6" v-if="movTotalPages > 1">
              <span class="pagination-info">
                Página {{ movCurrentPage }} de {{ movTotalPages }} ({{ movTotalRecords }} registros)
              </span>
              <div class="pagination-controls">
                <button
                  class="page-btn"
                  :disabled="movCurrentPage <= 1"
                  @click="fetchMovements(movCurrentPage - 1)"
                >
                  Anterior
                </button>
                <button
                  v-for="p in paginationPages"
                  :key="p"
                  class="page-btn"
                  :class="{ active: movCurrentPage === p }"
                  @click="fetchMovements(p)"
                >
                  {{ p }}
                </button>
                <button
                  class="page-btn"
                  :disabled="movCurrentPage >= movTotalPages"
                  @click="fetchMovements(movCurrentPage + 1)"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- Rank Detail Modal -->
    <div v-if="selectedModalRank" class="modal-overlay" @click.self="selectedModalRank = null">
      <div class="modal-card">
        <button class="modal-close" @click="selectedModalRank = null">✕</button>
        <div class="modal-header">
          <img
            :src="getS3Url(selectedModalRank.icon)"
            :alt="selectedModalRank.name"
            class="modal-icon"
            @error="$event.target.src = '/img_mantenimiento.png'"
          />
          <div>
            <h3 class="modal-title">{{ selectedModalRank.name }}</h3>
            <span class="modal-subtitle">Detalles y Requisitos del Plan de Compensación</span>
          </div>
        </div>

        <div class="modal-body">
          <div class="modal-grid">
            <div class="modal-stat">
              <span class="m-label">Volumen Mínimo</span>
              <strong class="m-val">{{ (selectedModalRank.vol_min || 0).toLocaleString() }} pts</strong>
            </div>
            <div class="modal-stat">
              <span class="m-label">Directos Activos</span>
              <strong class="m-val">{{ selectedModalRank.active_direct }} directos</strong>
            </div>
            <div class="modal-stat">
              <span class="m-label">Pago Máximo</span>
              <strong class="m-val">${{ (selectedModalRank.max_pay || 0).toLocaleString() }}</strong>
            </div>
            <div class="modal-stat">
              <span class="m-label">Bono Mensual</span>
              <strong class="m-val primary-text">${{ (selectedModalRank.monthly_bonus || 0).toLocaleString() }}</strong>
            </div>
            <div class="modal-stat">
              <span class="m-label">Límite Generacional</span>
              <strong class="m-val">{{ selectedModalRank.limit_generation }} generaciones</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/features/auth/stores/authStore';
import compensationService from '@/features/wallet/services/compensationService';
import walletService from '@/features/wallet/services/walletService';
import { getMyGamificationInfo } from '@/features/marketing/services/gamificationService';
import apiClient from '@/services/apiClient';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';

import {
  Trophy,
  Award,
  Layers,
  Activity,
  History,
  Loader2,
  RefreshCw,
  Inbox,
  Users,
  Search,
} from 'lucide-vue-next';

// ── Auth Store ──
const authStore = useAuthStore();
const userId = computed(() => authStore.user?.id);

// ── State ──
const loading = ref(true);
const activeTab = ref('progress');

const topbarStats = ref(null);
const widgets = ref(null);
const ranksList = ref([]);
const generationalList = ref([]);
const activeBinaryPoints = ref({ total_left: 0, total_right: 0, left_leg: [], right_leg: [] });
const gamificationInfo = ref(null);

// Interactive Searches & Filters
const ranksSearch = ref('');
const genSearch = ref('');
const selectedLeg = ref('left'); // 'left' | 'right'
const pointsSearch = ref('');
const selectedModalRank = ref(null);

// Movements State
const movements = ref([]);
const movLoading = ref(false);
const movSearch = ref('');
const movStatusFilter = ref('all');
const movCurrentPage = ref(1);
const movTotalPages = ref(1);
const movTotalRecords = ref(0);

// ── Tabs Definition ──
const tabs = [
  { id: 'progress', label: 'Mi Progreso', icon: Trophy },
  { id: 'ranks', label: 'Rangos y Requisitos', icon: Award },
  { id: 'generational', label: 'Bonos Generacionales', icon: Layers },
  { id: 'points', label: 'Puntos Activos', icon: Activity },
  { id: 'movements', label: 'Historial de Movimientos', icon: History },
];

// ── Image Helper ──
const getS3Url = (path) => {
  if (!path) return '/img_mantenimiento.png';
  if (path.startsWith('http')) return path;
  return `https://promolider-storage-user.s3.amazonaws.com/${path}`;
};

// ── Data Computeds ──
const sortedRanks = computed(() => {
  return [...ranksList.value].sort((a, b) => (a.vol_min || 0) - (b.vol_min || 0));
});

const filteredRanks = computed(() => {
  if (!ranksSearch.value.trim()) return sortedRanks.value;
  const q = ranksSearch.value.toLowerCase().trim();
  return sortedRanks.value.filter(
    (r) =>
      r.name?.toLowerCase().includes(q) ||
      String(r.vol_min).includes(q) ||
      String(r.active_direct).includes(q)
  );
});

const filteredGenerational = computed(() => {
  if (!genSearch.value.trim()) return generationalList.value;
  const q = genSearch.value.toLowerCase().trim();
  return generationalList.value.filter((g) => g.rank_name?.toLowerCase().includes(q));
});

const currentRankInfo = computed(() => {
  if (topbarStats.value?.rank) {
    return topbarStats.value.rank;
  }
  return { name: 'Aprendiz', level: 1, icon: null };
});

const currentPoints = computed(() => {
  const left = Number(activeBinaryPoints.value?.total_left || 0);
  const right = Number(activeBinaryPoints.value?.total_right || 0);
  const totalBinary = left + right;
  if (totalBinary > 0) return totalBinary;
  return Number(topbarStats.value?.points?.total || 0);
});

const nextRank = computed(() => {
  if (!sortedRanks.value.length) return null;
  const currentVol = currentRankInfo.value?.vol_min || 0;
  const currentIndex = sortedRanks.value.findIndex(
    (r) => r.name?.toLowerCase() === (currentRankInfo.value?.name || '').toLowerCase()
  );
  if (currentIndex >= 0 && currentIndex < sortedRanks.value.length - 1) {
    return sortedRanks.value[currentIndex + 1];
  }
  return sortedRanks.value.find((r) => (r.vol_min || 0) > currentVol) || sortedRanks.value[1] || null;
});

const progressPercentage = computed(() => {
  if (!nextRank.value || !nextRank.value.vol_min) return 100;
  const pct = (currentPoints.value / nextRank.value.vol_min) * 100;
  return Math.min(100, Math.round(pct));
});

const missingPoints = computed(() => {
  if (!nextRank.value) return 0;
  return Math.max(0, (nextRank.value.vol_min || 0) - currentPoints.value);
});

const activeDirects = computed(() => {
  if (widgets.value?.conditions?.active_direct !== undefined) {
    return widgets.value.conditions.active_direct;
  }
  return widgets.value?.conditions?.active ? 1 : 0;
});

// Points Filtering by Leg and Search
const filteredLeftLeg = computed(() => {
  const list = activeBinaryPoints.value?.left_leg || [];
  if (!pointsSearch.value.trim()) return list;
  const q = pointsSearch.value.toLowerCase().trim();
  return list.filter(
    (item) =>
      item.sponsor?.name?.toLowerCase().includes(q) ||
      item.reason?.toLowerCase().includes(q) ||
      String(item.points).includes(q) ||
      formatGeneration(item.generation).toLowerCase().includes(q)
  );
});

const filteredRightLeg = computed(() => {
  const list = activeBinaryPoints.value?.right_leg || [];
  if (!pointsSearch.value.trim()) return list;
  const q = pointsSearch.value.toLowerCase().trim();
  return list.filter(
    (item) =>
      item.sponsor?.name?.toLowerCase().includes(q) ||
      item.reason?.toLowerCase().includes(q) ||
      String(item.points).includes(q) ||
      formatGeneration(item.generation).toLowerCase().includes(q)
  );
});

const paginationPages = computed(() => {
  const pages = [];
  const start = Math.max(1, movCurrentPage.value - 2);
  const end = Math.min(movTotalPages.value, movCurrentPage.value + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// ── Helpers & Interactions ──
const toggleLeg = (leg) => {
  selectedLeg.value = leg;
};

const selectRankModal = (rank) => {
  if (rank) {
    selectedModalRank.value = rank;
  }
};

const isRankAchieved = (rank) => {
  if (!currentRankInfo.value) return false;
  return (rank.vol_min || 0) <= currentPoints.value || (rank.vol_min || 0) <= (currentRankInfo.value?.vol_min || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return dayjs(dateString).format('DD MMM YYYY, HH:mm');
};

const formatGeneration = (gen) => {
  if (gen === 0) return 'Compra Propia';
  if (gen === -1) return 'Derrame';
  return `Generación ${gen}`;
};

const formatStatus = (status) => {
  const map = {
    approved: 'Aprobado',
    pending: 'Pendiente',
    rejected: 'Rechazado',
  };
  return map[status] || status || 'Aprobado';
};

// ── Data Fetching ──
const loadData = async () => {
  loading.value = true;
  try {
    const [topbarRes, widgetsRes, ranksRes, genRes, pointsRes, gamificationRes] = await Promise.all([
      apiClient.get('/dashboard/topbar-stats').catch(() => null),
      apiClient.get('/dashboard/widgets?timeframe=normal').catch(() => null),
      compensationService.getRanks().catch(() => null),
      compensationService.getGenerationalBonuses().catch(() => null),
      walletService.getActiveBinaryPoints().catch(() => null),
      getMyGamificationInfo().catch(() => null),
    ]);

    if (topbarRes?.data) topbarStats.value = topbarRes.data.data || topbarRes.data;
    if (widgetsRes?.data) widgets.value = widgetsRes.data.data || widgetsRes.data;
    if (ranksRes?.data) ranksList.value = ranksRes.data.data || ranksRes.data;
    if (genRes?.data) generationalList.value = genRes.data.data || genRes.data;
    if (pointsRes?.data) activeBinaryPoints.value = pointsRes.data.data || pointsRes.data;
    if (gamificationRes) gamificationInfo.value = gamificationRes.data || gamificationRes;

    // Load initial movements
    await fetchMovements(1);
  } catch (error) {
    console.error('Error al cargar datos de rangos y bonos:', error);
    if (ElMessage) ElMessage.error('Error al cargar los datos de rangos y bonos');
  } finally {
    loading.value = false;
  }
};

let searchDebounce = null;
const debouncedFetchMovements = () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    fetchMovements(1);
  }, 400);
};

const fetchMovements = async (page = 1) => {
  movLoading.value = true;
  movCurrentPage.value = page;
  try {
    const params = {
      page,
      per_page: 10,
      search: movSearch.value || undefined,
      status: movStatusFilter.value !== 'all' ? movStatusFilter.value : undefined,
    };
    const res = await walletService.getAllMovements(userId.value || 0, params);
    const data = res.data?.data || res.data || [];
    movements.value = Array.isArray(data) ? data : data.data || [];
    movTotalPages.value = data.last_page || res.data?.last_page || 1;
    movTotalRecords.value = data.total || res.data?.total || movements.value.length;
  } catch (error) {
    console.error('Error al cargar movimientos:', error);
  } finally {
    movLoading.value = false;
  }
};

// ── Lifecycle ──
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.ranks-and-bonuses-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-bold);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: var(--text-muted);
  margin: 0;
  font-size: 1rem;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-text {
  margin-top: 1rem;
  color: var(--text-muted);
}

/* Tabs */
.tabs-container {
  margin-bottom: 2rem;
}

.tabs-header {
  display: flex;
  gap: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
  overflow-x: auto;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text-bold);
  background: rgba(255, 255, 255, 0.4);
}

.tab-btn.active {
  background: var(--card-bg);
  color: var(--primary-color);
  border-color: var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Tab Content Layout */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Utility Spacing */
.mb-4 { margin-bottom: 1rem !important; }
.mb-6 { margin-bottom: 2rem !important; }
.mt-6 { margin-top: 2rem !important; }
.gap-4 { gap: 1rem !important; }

/* Content Cards */
.card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.clickable {
  cursor: pointer;
  transition: all 0.2s;
}

.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.15);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.current-rank-card,
.next-rank-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.current-rank-card {
  border-left: 4px solid var(--primary-color);
}

.next-rank-card {
  border-left: 4px solid #3b82f6;
}

.rank-badge-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: rgba(24, 214, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.next-badge {
  background: rgba(59, 130, 246, 0.1);
}

.rank-icon-lg {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.card-kicker {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
}

.rank-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-bold);
  margin: 0.2rem 0;
}

.rank-sub {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
}

/* Progress Card */
.progress-card {
  margin-bottom: 2rem;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-bold);
  margin: 0 0 0.25rem 0;
}

.card-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
}

.pct-badge {
  background: var(--indicator-green);
  color: var(--indicator-green-text);
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  font-weight: 800;
  font-size: 1.25rem;
}

.progress-bar-track {
  height: 16px;
  background: var(--bg-main);
  border-radius: 9999px;
  overflow: hidden;
  margin: 1.5rem 0;
  border: 1px solid var(--border-color);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), #4ade80);
  border-radius: 9999px;
  transition: width 0.6s ease;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.metric-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.3rem;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-bold);
}

.metric-value.primary { color: var(--primary-color); }
.metric-value.warning { color: #ea580c; }
.metric-value.success { color: #16a34a; }

/* Roadmap */
.ranks-roadmap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.25rem;
}

.roadmap-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem 1rem 1rem;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  text-align: center;
  opacity: 0.75;
  transition: all 0.2s;
  min-height: 130px;
}

.roadmap-card.is-achieved {
  opacity: 0.95;
  border-color: var(--indicator-green-text);
}

.roadmap-card.is-current {
  opacity: 1;
  border-color: var(--primary-color);
  background: rgba(24, 214, 0, 0.08);
  box-shadow: 0 4px 14px rgba(24, 214, 0, 0.2);
  transform: translateY(-2px);
}

.roadmap-card.is-next {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}

.roadmap-icon {
  width: 44px;
  height: 44px;
  margin-bottom: 0.5rem;
  margin-top: 0.25rem;
}

.rank-icon-sm {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.roadmap-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-bold);
  display: block;
}

.roadmap-pts {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Badges positioned cleanly inside top right of roadmap cards */
.current-pill {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--primary-color);
  color: #000;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 9999px;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.next-pill {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #3b82f6;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 9999px;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

/* Premium Tables */
.table-container {
  overflow-x: auto;
}

.premium-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.premium-table th {
  background: rgba(0, 0, 0, 0.03);
  padding: 1.1rem 1.25rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  border-bottom: 2px solid var(--border-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.premium-table td {
  padding: 1.1rem 1.25rem;
  font-size: 0.95rem;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
}

.spacious-table td {
  padding: 1.2rem 1.25rem;
}

.clickable-row {
  cursor: pointer;
  transition: background 0.15s;
}

.clickable-row:hover {
  background: rgba(255, 255, 255, 0.6);
}

.premium-table tr.highlight-row {
  background: rgba(24, 214, 0, 0.08);
}

.rank-td {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-icon-table {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.rank-td-title {
  color: var(--text-bold);
  display: block;
}

.user-badge {
  background: var(--primary-color);
  color: #000;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.bonus-cell {
  color: var(--primary-color);
  font-weight: 700;
}

.pct-cell {
  background: var(--indicator-blue);
  color: var(--indicator-blue-text);
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 700;
}

/* Summary Boxes & Spacing */
.bonus-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.25rem !important;
}

.summary-box {
  border-top: 4px solid var(--primary-color);
}

.box-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-bold);
  margin: 0 0 1rem 0;
}

.bonus-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.b-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
}

.b-label {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.b-val {
  color: var(--text-bold);
  font-size: 1.1rem;
}

.primary-text {
  color: var(--primary-color);
}

/* Binary Leg Cards & Controls */
.leg-cards-grid {
  margin-bottom: 2rem !important;
}

.leg-stat-card {
  padding: 1.5rem;
  position: relative;
}

.left-border { border-left: 4px solid #3b82f6; }
.right-border { border-left: 4px solid #10b981; }

.active-leg-left {
  background: rgba(59, 130, 246, 0.08);
  border-color: #3b82f6;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.2);
}

.active-leg-right {
  background: rgba(16, 185, 129, 0.08);
  border-color: #10b981;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.2);
}

.leg-stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.5rem;
}

.leg-stat-title {
  font-weight: 700;
  color: var(--text-bold);
}

.badge-count {
  margin-left: auto;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 8px;
  border-radius: 9999px;
  color: var(--text-muted);
}

.leg-stat-value {
  font-size: 1.75rem;
  font-weight: 800;
}

.pts-unit {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.card-action-hint {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.leg-controls-card {
  margin-bottom: 2rem !important;
}

.leg-table-card {
  margin-bottom: 2rem !important;
}

.movements-card {
  padding: 1.75rem;
}

.leg-filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.leg-toggle-btn {
  padding: 0.6rem 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.leg-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.04);
}

.leg-toggle-btn.left.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.leg-toggle-btn.right.active {
  background: #10b981;
  color: #fff;
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.gen-badge {
  background: var(--indicator-purple);
  color: var(--indicator-purple-text);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.date-col {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* Movements Tab & Filters */
.filters-bar {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1.75rem !important;
}

.flex-between {
  justify-content: space-between;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 240px;
}

.search-input-wrapper.sm {
  min-width: 180px;
  flex: initial;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.filter-input {
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-bold);
  outline: none;
}

.filter-select {
  padding: 0.65rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-bold);
  outline: none;
  cursor: pointer;
}

.loading-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 3rem;
  color: var(--text-muted);
}

.type-pill {
  background: rgba(0, 0, 0, 0.05);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.amount-positive { color: #16a34a; }
.amount-negative { color: #dc2626; }

.status-pill {
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-approved { background: var(--indicator-green); color: var(--indicator-green-text); }
.status-pending { background: var(--indicator-orange); color: var(--indicator-orange-text); }
.status-rejected { background: var(--indicator-red); color: var(--indicator-red-text); }

.empty-cell,
.empty-card {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.empty-icon {
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.75rem !important;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.pagination-controls {
  display: flex;
  gap: 4px;
}

.page-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-main);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.page-btn.active {
  background: var(--primary-color);
  color: #000;
  border-color: var(--primary-color);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  position: relative;
  background: var(--card-bg);
  border-radius: 20px;
  border: 1px solid var(--border-color);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 480px;
  padding: 2rem;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.modal-icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-bold);
  margin: 0;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.modal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.modal-stat {
  display: flex;
  flex-direction: column;
  padding: 0.8rem 1rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
}

.m-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.m-val {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-bold);
}

@media (max-width: 768px) {
  .ranks-and-bonuses-container {
    padding: 1rem;
  }

  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .card-header-flex {
    flex-direction: column;
    gap: 0.5rem;
  }

  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
