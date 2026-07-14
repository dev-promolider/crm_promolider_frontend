<template>
  <div class="dinamica-view">
    <div class="card">
      <div class="card-body">
        <div class="card-header">
          <div>
            <h4 class="card-title">Dinámicas</h4>
            <span class="card-meta">Crea y gestiona ruletas y trivias interactivas</span>
          </div>
          <router-link to="/marketing/herramientas" class="nav-back">
            <ArrowLeft :size="15" /> Volver
          </router-link>
        </div>

        <div class="type-selector">
          <div class="dinamica-type-card" @click="openRouletteModal">
            <div class="type-icon"><Shuffle :size="40" /></div>
            <h5>Ruleta Interactiva</h5>
            <p>Crea una ruleta de premios para tus usuarios.</p>
          </div>
          <div class="dinamica-type-card" @click="openTriviaModal()">
            <div class="type-icon"><HelpCircle :size="40" /></div>
            <h5>Trivia interactiva</h5>
            <p>Crea preguntas y respuestas para evaluar el conocimiento de tus usuarios.</p>
          </div>
        </div>
        <div class="dinamicas-table-section mt-4">
          <h5 class="section-subtitle">
            <ListFilter :size="18" /> Últimas dinámicas
            <small class="text-muted">Listado paginado (10 por página)</small>
          </h5>
          <div v-if="loadingDinamicas" class="loading-state">
            <Loader2 class="spinner" :size="24" />
            <span>Cargando dinámicas...</span>
          </div>
          <div v-else-if="dinamicas.length === 0" class="empty-state">
            Aún no has creado dinámicas.
          </div>
          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Premio</th>
                    <th>Activación</th>
                    <th class="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(d, idx) in paginatedDinamicas" :key="d.id">
                    <td class="cell-name">{{ d.nombre || d.title || '-' }}</td>
                    <td>
                      <span class="badge" :class="d.tipo_dinamica === 'trivia' ? 'badge-info' : 'badge-secondary'">
                        {{ d.tipo_dinamica === 'trivia' ? 'Trivia' : 'Ruleta' }}
                      </span>
                    </td>
                    <td>{{ d.tipo_premio || '-' }}</td>
                    <td>
                      <span class="badge" :class="activacionClass(d)">{{ activacionLabel(d) }}</span>
                    </td>
                    <td class="text-right">
                      <div class="btn-group dropdown">
                        <button type="button" class="btn btn-sm btn-light dropdown-toggle font-weight-bold border-0" @click.stop="toggleDropdown(d.id)">...</button>
                        <div class="dropdown-menu dropdown-menu-right" :class="{ show: openDropdownId === d.id }">
                          <button class="dropdown-item" @click.stop="editFromDropdown(d)">Editar</button>
                          <a v-if="d.slug" class="dropdown-item" :href="getPublicUrl(d.slug)" target="_blank">Ver enlace público</a>
                          <a v-if="d.slug" class="dropdown-item" href="#" @click.prevent="copiarEnlacePublico(getPublicUrl(d.slug))">Compartir enlace</a>
                          <div v-if="d.slug" class="dropdown-divider"></div>
                          <button class="dropdown-item" @click.stop="toggleStatusDinamica(d)">{{ activacionLabel(d) === 'Activa' ? 'Desactivar' : 'Activar' }}</button>
                          <div class="dropdown-divider"></div>
                          <button class="dropdown-item text-danger" @click.stop="confirmDeleteDinamica(d)">Eliminar</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="table-footer">
              <small class="text-muted">Mostrando {{ filteredDinamicas.length }} dinámicas</small>
              <nav>
                <ul class="pagination-custom">
                  <li :class="{ disabled: currentPage <= 1 }"><a href="#" @click.prevent="currentPage > 1 && currentPage--">&laquo;</a></li>
                  <li v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }"><a href="#" @click.prevent="currentPage = page">{{ page }}</a></li>
                  <li :class="{ disabled: currentPage >= totalPages }"><a href="#" @click.prevent="currentPage < totalPages && currentPage++">&raquo;</a></li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         MODAL: Nueva Ruleta (formulario completo + vista previa)
         ══════════════════════════════════════════════════════════════ -->
    <div v-if="showRouletteModal" class="modal-overlay" @click.self="closeRouletteModal">
      <div class="roulette-modal">
        <!-- ── Header ── -->
        <div class="rm-header">
          <div class="rm-header-group">
            <Shuffle :size="20" class="rm-header-icon" />
            <h4 class="rm-title">{{ editingId ? 'Editar Ruleta' : 'Nueva Ruleta Interactiva' }}</h4>
          </div>
          <button class="rm-close" @click="closeRouletteModal" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="rm-body">
          <!-- ─═─═─═─═─ Left: Formulario completo ─═─═─═─═ -->
          <div class="rm-form-col">
            <!-- 1. Información General -->
            <div class="rm-section">
              <div class="rm-section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>Información General</span>
              </div>
              <div class="rm-section-body">
                <div class="rm-field">
                  <label class="rm-label">Nombre de la ruleta <span class="rm-required">*</span></label>
                  <div class="rm-input-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rm-input-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <input v-model="rouletteForm.nombre" type="text" class="rm-input" placeholder="Ej: Ruleta de Navidad" maxlength="120" />
                  </div>
                </div>
                <div class="rm-field">
                  <label class="rm-label">Descripción</label>
                  <textarea v-model="rouletteForm.descripcion" class="rm-textarea" rows="3" placeholder="Describe de qué trata tu ruleta..." maxlength="255"></textarea>
                </div>
              </div>
            </div>

            <!-- 2. Configuración de Inscripción -->
            <div class="rm-section">
              <div class="rm-section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>Configuración de Inscripción</span>
              </div>
              <div class="rm-section-body">
                <div class="rm-row">
                  <div class="rm-field">
                    <label class="rm-label">Modo de cierre</label>
                    <div class="rm-locked-field">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span>Por tiempo</span>
                    </div>
                  </div>
                  <div class="rm-field">
                    <label class="rm-label">Tiempo (minutos) <span class="rm-required">*</span></label>
                    <input v-model.number="rouletteForm.tiempoInscripcion" type="number" class="rm-input rm-input--no-icon" min="1" placeholder="Ej: 60" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Configuración de Premios -->
            <div class="rm-section">
              <div class="rm-section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Configuración de Premios</span>
              </div>
              <div class="rm-section-body">
                <div class="rm-row">
                  <div class="rm-field">
                    <label class="rm-label">Tipo de premio</label>
                    <div class="rm-locked-field">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span>Premio único</span>
                    </div>
                  </div>
                  <div class="rm-field">
                    <label class="rm-label">Ganadores máx.</label>
                    <div class="rm-locked-field">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. Gestión de Premios -->
            <div class="rm-section">
              <div class="rm-section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <span>Gestión de Premios</span>
                <span class="rm-section-count">{{ rouletteForm.premios.length }} / 1</span>
              </div>
              <div class="rm-section-body">
                <!-- Lista de premios -->
                <div v-if="rouletteForm.premios.length > 0" class="rm-prize-list">
                  <div v-for="(premio, idx) in rouletteForm.premios" :key="idx" class="rm-prize-item">
                    <div class="rm-prize-item-header">
                      <div class="rm-prize-info">
                        <span class="rm-prize-name">{{ premio.nombre }}</span>
                        <span class="rm-prize-badge" :class="'rm-badge--' + premio.probabilidad">{{ probLabel(premio.probabilidad) }}</span>
                      </div>
                      <div class="rm-prize-actions">
                        <button class="rm-prize-edit" @click="editPrize(idx)" type="button" title="Editar premio">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="rm-prize-remove" @click="removePrize(idx)" type="button" title="Eliminar premio">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                    <div class="rm-prize-item-meta">
                      <span>Tipo: {{ premio.tipo }}</span>
                    </div>
                  </div>
                </div>

                <p v-if="rouletteForm.premios.length === 0 && !showPrizeForm" class="rm-prizes-empty">
                  Aún no has agregado premios. Agrega al menos uno.
                </p>

                <!-- Botón agregar -->
                <div v-if="!showPrizeForm && rouletteForm.premios.length < 1" class="rm-add-btn" @click="openPrizeForm(null)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Agregar premio
                </div>

                <!-- Formulario de premio (agregar/editar) -->
                <div v-if="showPrizeForm" class="rm-prize-form">
                  <div class="rm-prize-form-grid">
                    <div class="rm-field">
                      <label class="rm-label-sm">Nombre <span class="rm-required">*</span></label>
                      <input v-model="newPrize.nombre" type="text" class="rm-input rm-input--no-icon" placeholder="Ej: Cupón de descuento" />
                    </div>
                    <div class="rm-field">
                      <label class="rm-label-sm">Tipo <span class="rm-required">*</span></label>
                      <select v-model="newPrize.tipo" class="rm-select">
                        <option value="">Seleccionar</option>
                        <option value="pdf">PDF</option>
                        <option value="imagen">Imagen</option>
                        <option value="enlace">Enlace</option>
                        <option value="texto">Texto</option>
                        <option value="codigo">Código</option>
                        <option value="cupon">Cupón / código único</option>
                        <option value="saldo">Saldo / monedas</option>
                      </select>
                    </div>
                    <div class="rm-field">
                      <label class="rm-label-sm">Probabilidad <span class="rm-required">*</span></label>
                      <select v-model="newPrize.probabilidad" class="rm-select">
                        <option value="">Seleccionar</option>
                        <option value="alta">Alta (50%)</option>
                        <option value="media">Media (30%)</option>
                        <option value="baja">Baja (20%)</option>
                      </select>
                    </div>
                  </div>
                  <div class="rm-prize-form-actions">
                    <button class="rm-prize-add-btn" @click="confirmPrize" type="button" :disabled="!canAddPrize">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {{ editingPrizeIndex !== null ? 'Guardar cambios' : 'Agregar' }}
                    </button>
                    <button class="rm-prize-cancel-btn" type="button" @click="cancelPrizeForm">Cancelar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ─═─═─═─═─ Right: Vista previa ─═─═─═─═ -->
          <div class="rm-preview-col">
            <h5 class="rm-preview-title">Vista previa</h5>
            <div class="rm-preview-container">
              <RuletaWheel
                v-if="previewPremios.length > 0"
                :premios="previewPremios"
              />
              <div v-else class="rm-preview-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="rm-preview-empty-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <p>Agrega premios para ver la vista previa de la ruleta</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Footer ── -->
        <div class="rm-footer">
          <button class="btn-secondary" type="button" @click="closeRouletteModal">Cancelar</button>
          <button class="btn-primary" @click="saveRoulette" :disabled="isSaving || !rouletteForm.nombre.trim() || rouletteForm.premios.length === 0">
            <div v-if="isSaving" class="spinner-inline"></div>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {{ editingId ? 'Guardar cambios' : 'Guardar ruleta' }}
            </template>
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         MODAL: Trivia (formulario completo + preview)
         ══════════════════════════════════════════════════════════════ -->
    <div v-if="showTriviaModal" class="modal-overlay" @click.self="closeTriviaModal">
      <div class="trivia-modal">
        <!-- ── Header ── -->
        <div class="rm-header">
          <div class="rm-header-group">
            <HelpCircle :size="20" class="rm-header-icon" />
            <h4 class="rm-title">{{ triviaEditingId ? 'Editar Trivia' : 'Nueva Trivia Interactiva' }}</h4>
          </div>
          <button class="rm-close" @click="closeTriviaModal" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="rm-body">
          <!-- ─═─═─═─═─ Left: Formulario ─═─═─═─═ -->
          <div class="rm-form-col">
            <!-- 1. Información General -->
            <div class="rm-section">
              <div class="rm-section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>Información General</span>
              </div>
              <div class="rm-section-body">
                <div class="rm-field">
                  <label class="rm-label">Nombre de la trivia <span class="rm-required">*</span></label>
                  <div class="rm-input-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rm-input-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <input v-model="triviaForm.name" type="text" class="rm-input" placeholder="Ej: Trivia Bienestar Corporativo" maxlength="120" />
                  </div>
                </div>
                <div class="rm-field">
                  <label class="rm-label">Descripción</label>
                  <textarea v-model="triviaForm.description" class="rm-textarea" rows="3" placeholder="Describe el objetivo o los premios..." maxlength="255"></textarea>
                </div>
                <div class="rm-field">
                  <label class="rm-label">Slug (opcional)</label>
                  <div class="rm-input-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rm-input-icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    <input v-model="triviaForm.slug" type="text" class="rm-input" placeholder="bienestar-2026" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Configuración de Inscripción -->
            <div class="rm-section">
              <div class="rm-section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>Configuración de Inscripción</span>
              </div>
              <div class="rm-section-body">
                <div class="rm-row">
                  <div class="rm-field">
                    <label class="rm-label">Límite de participantes</label>
                    <input v-model.number="triviaForm.participantsLimit" type="number" class="rm-input rm-input--no-icon" min="1" placeholder="Ej: 150" />
                  </div>
                  <div class="rm-field">
                    <label class="rm-label">Cierre del registro</label>
                    <input v-model="triviaForm.closingTime" type="time" class="rm-input rm-input--no-icon" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Puntuación -->
            <div class="rm-section">
              <div class="rm-section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Puntuación</span>
              </div>
              <div class="rm-section-body">
                <div class="rm-row">
                  <div class="rm-field">
                    <label class="rm-label">Puntos mínimos</label>
                    <input v-model.number="triviaForm.pointsMin" type="number" class="rm-input rm-input--no-icon" min="1" placeholder="Mín" />
                  </div>
                  <div class="rm-field">
                    <label class="rm-label">Puntos máximos</label>
                    <input v-model.number="triviaForm.pointsMax" type="number" :min="triviaForm.pointsMin" class="rm-input rm-input--no-icon" placeholder="Máx" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. Bloques y Categorías -->
            <div class="rm-section">
              <div class="rm-section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <span>Bloques y Categorías</span>
                <span class="rm-section-count">{{ triviaForm.gameBlocks.length }} bloques</span>
              </div>
              <div class="rm-section-body">
                <div class="rm-field">
                  <label class="rm-label-sm">Categorías activas disponibles</label>
                  <div class="trivia-cat-tags">
                    <span v-for="cat in activeCategories" :key="cat.id" class="trivia-cat-pill">
                      {{ cat.name }}
                    </span>
                    <span v-if="activeCategories.length === 0" class="text-light" style="font-size:12px;">No hay categorías activas.</span>
                  </div>
                  <div class="trivia-cat-actions">
                    <button type="button" class="trivia-cat-btn" @click="goToCategoriesList">Ver categorías</button>
                    <button type="button" class="trivia-cat-btn primary" @click="goToCategoriesCreate">Nueva categoría</button>
                  </div>
                </div>

                <!-- Add block -->
                <div class="trivia-add-block-wrap">
                  <div class="rm-field">
                    <label class="rm-label-sm">Agregar bloque por categoría</label>
                    <div class="trivia-avail-cats">
                      <button
                        v-for="opt in availableCategoryOptions"
                        :key="opt.id"
                        type="button"
                        class="trivia-cat-add-btn"
                        @click="addTriviaBlock(opt)"
                      >
                        + {{ opt.name }}
                      </button>
                      <span v-if="availableCategoryOptions.length === 0" class="text-light" style="font-size:12px;">Todas las categorías están en uso.</span>
                    </div>
                  </div>
                </div>

                <!-- Block list -->
                <div v-if="triviaForm.gameBlocks.length > 0" class="trivia-block-list">
                  <div v-for="(block, idx) in sortedTriviaBlocks" :key="block.id" class="trivia-block-item">
                    <div class="trivia-block-head">
                      <div class="trivia-block-info">
                        <span class="trivia-block-label">Bloque {{ idx + 1 }}</span>
                        <input v-model="block.title" type="text" class="trivia-block-input" placeholder="Nombre del bloque" />
                      </div>
                      <div class="trivia-block-controls">
                        <label class="toggle-switch">
                          <input type="checkbox" v-model="block.isActive" />
                          <span class="toggle-slider"></span>
                        </label>
                        <button type="button" class="trivia-block-remove" @click="removeTriviaBlock(block.id)" title="Eliminar bloque">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                    <div class="trivia-block-cat-select">
                      <label class="rm-label-sm">Categoría</label>
                      <select v-model="block.categoryId" class="rm-select">
                        <option value="">Seleccionar</option>
                        <option v-for="opt in allCategoryOptions" :key="opt.id" :value="opt.id" :disabled="isCatUsed(opt.id, block.id)">
                          {{ opt.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <p v-else class="rm-prizes-empty">Aún no has agregado bloques de juego.</p>
              </div>
            </div>
          </div>

          <!-- ─═─═─═─═─ Right: Preview ─═─═─═─═ -->
          <div class="rm-preview-col">
            <h5 class="rm-preview-title">Resumen de la trivia</h5>
            <div class="rm-preview-container trivia-preview-container">
              <div v-if="triviaForm.name || triviaForm.gameBlocks.length > 0" class="trivia-summary">
                <div class="trivia-summary-header">
                  <HelpCircle :size="24" class="trivia-summary-icon" />
                  <div>
                    <strong>{{ triviaForm.name || 'Sin nombre' }}</strong>
                    <span class="trivia-summary-slug" v-if="triviaForm.slug">/{{ triviaForm.slug }}</span>
                  </div>
                </div>
                <p class="trivia-summary-desc" v-if="triviaForm.description">{{ triviaForm.description }}</p>
                <div class="trivia-summary-stats">
                  <div class="trivia-stat">
                    <span class="trivia-stat-value">{{ trivialPointsRange }}</span>
                    <span class="trivia-stat-label">Rango de puntos</span>
                  </div>
                  <div class="trivia-stat">
                    <span class="trivia-stat-value">{{ triviaForm.gameBlocks.length }}</span>
                    <span class="trivia-stat-label">Bloques</span>
                  </div>
                  <div class="trivia-stat">
                    <span class="trivia-stat-value">{{ activeCategories.length }}</span>
                    <span class="trivia-stat-label">Categorías</span>
                  </div>
                </div>
                <div v-if="triviaForm.gameBlocks.length > 0" class="trivia-summary-blocks">
                  <div v-for="(block, idx) in sortedTriviaBlocks" :key="block.id" class="trivia-summary-block" :class="{ inactive: !block.isActive }">
                    <span class="trivia-summary-block-idx">{{ idx + 1 }}</span>
                    <div class="trivia-summary-block-info">
                      <span class="trivia-summary-block-title">{{ block.title || 'Bloque' }}</span>
                      <span class="trivia-summary-block-cat" v-if="block.categoryId">
                        {{ categoryName(block.categoryId) }}
                      </span>
                    </div>
                    <span class="trivia-summary-block-status" :class="block.isActive ? 'active' : 'paused'">
                      {{ block.isActive ? 'Activo' : 'Pausado' }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="rm-preview-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="rm-preview-empty-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <p>Completa la información para ver el resumen de la trivia</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Footer ── -->
        <div class="rm-footer">
          <button class="btn-secondary" type="button" @click="closeTriviaModal">Cancelar</button>
          <button class="btn-primary" @click="submitTrivia" :disabled="triviaSaving || !triviaForm.name.trim() || triviaForm.gameBlocks.length === 0">
            <div v-if="triviaSaving" class="spinner-inline"></div>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {{ triviaEditingId ? 'Guardar cambios' : 'Crear trivia' }}
            </template>
          </button>
        </div>
      </div>
    </div>
    <!-- ══════════════════════════════════════════════════
         Confirm Modal & Toast
         ══════════════════════════════════════════════════ -->
    <ConfirmModal
      :visible="confirm.showConfirm.value"
      :title="confirm.confirmData.value.title"
      :message="confirm.confirmData.value.message"
      :confirm-text="confirm.confirmData.value.confirmText"
      :type="confirm.confirmData.value.type"
      :loading="confirm.confirmLoading.value"
      @confirm="confirm.onConfirm"
      @cancel="confirm.onCancel"
    />
    <ToastNotification
      :toast="toastAlert.toast.value"
      @close="toastAlert.dismiss"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDinamicas, createDinamica, storeDinamicaSpecifications } from '../services/marketingService'
import apiClient from '@/services/apiClient'
import RuletaWheel from '../components/RuletaWheel.vue'
import { getDinamica, updateDinamica } from '../services/dinamicaService'
import { saveTrivia } from '../services/marketingService'
import { getQuestionCategories } from '../services/questionCategoriesService'
import ConfirmModal from '../components/ConfirmModal.vue'
import ToastNotification from '../components/ToastNotification.vue'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'
import {
  ArrowLeft, Shuffle, HelpCircle, AlertCircle, Loader2,
  ListFilter
} from 'lucide-vue-next'

const router = useRouter()

const openDropdownId = ref(null)

function handleClickOutside(e) {
  if (!e.target.closest('.btn-group.dropdown')) {
    openDropdownId.value = null
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

function toggleDropdown(id) {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

function getPublicUrl(slug) {
  return window.location.origin + "/d/" + slug
}



const dinamicas = ref([])
const loadingDinamicas = ref(false)
const currentPage = ref(1)
const perPage = 10

const filteredDinamicas = computed(() => {
  return [...dinamicas.value]
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredDinamicas.value.length / perPage)))

const paginatedDinamicas = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredDinamicas.value.slice(start, start + perPage)
})



function activacionClass(d) {
  if (d.has_winner) return 'badge-primary'
  if (d.is_active) return 'badge-success'
  return 'badge-warning'
}

function activacionLabel(d) {
  if (d.has_winner) return 'Finalizada'
  if (d.is_active) return 'Activa'
  return 'Pendiente'
}

async function loadDinamicas() {
  loadingDinamicas.value = true
  try {
    var res = await getDinamicas()
    var data = res?.data || res || []
    dinamicas.value = Array.isArray(data) ? data : []
  } catch (err) {
    dinamicas.value = []
  } finally {
    loadingDinamicas.value = false
  }
}

onMounted(async () => {
  await loadDinamicas()
  try {
    const res = await getQuestionCategories()
    const raw = res?.data || res || []
    categories.value = Array.isArray(raw) ? raw : (raw.data || [])
  } catch { categories.value = [] }
})

// ═══════════════════════════════════════════════════
// Confirm & Toast
// ═══════════════════════════════════════════════════
const confirm = useConfirm()
const toastAlert = useToast()

function copiarEnlacePublico(url) {
  if (!url) return
  const input = document.createElement('input')
  input.value = url
  document.body.appendChild(input)
  input.select()
  input.setSelectionRange(0, 99999)
  try {
    document.execCommand('copy')
    toastAlert.show('Enlace copiado', 'Enlace copiado al portapapeles', 'success')
  } catch (e) {
    toastAlert.show('Error', 'No se pudo copiar el enlace', 'error')
  }
  document.body.removeChild(input)
}

async function toggleStatusDinamica(d) {
  var msg = activacionLabel(d) === 'Activa' ? 'Desactivar' : 'Activar'
  const ok = await confirm.show({
    title: msg + ' dinámica',
    message: msg + ' la dinámica ' + (d.nombre || d.title || '') + '?',
    confirmText: msg,
    type: 'warning',
  })
  if (!ok) return
  try {
    await apiClient.post('/marketing/dinamicas/' + d.id + '/toggle-status')
    openDropdownId.value = null
    await loadDinamicas()
    toastAlert.show('Estado actualizado', 'La dinámica se ' + (msg === 'Activar' ? 'activó' : 'desactivó') + ' correctamente', 'success')
  } catch (error) {
    toastAlert.show('Error', 'No se pudo cambiar el estado', 'error')
  }
}

async function confirmDeleteDinamica(d) {
  const ok = await confirm.show({
    title: 'Eliminar dinámica',
    message: 'Eliminar la dinámica ' + (d.nombre || d.title || '') + '? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    type: 'danger',
  })
  if (!ok) return
  try {
    await apiClient.delete('/marketing/dinamicas/' + d.id)
    openDropdownId.value = null
    await loadDinamicas()
    toastAlert.show('Eliminada', 'La dinámica se eliminó correctamente', 'success')
  } catch (error) {
    toastAlert.show('Error', 'No se pudo eliminar la dinámica', 'error')
  }
}

// ═══════════════════════════════════════════════════
// Modal Ruleta
// ═══════════════════════════════════════════════════
const showRouletteModal = ref(false)
const isSaving = ref(false)
const showPrizeForm = ref(false)
const editingPrizeIndex = ref(null)
const editingId = ref(null)

const defaultPrize = () => ({
  nombre: '',
  tipo: '',
  probabilidad: '',
})

const rouletteForm = ref({
  nombre: '',
  descripcion: '',
  tiempoInscripcion: 60,
  premios: [],
})

const newPrize = ref(defaultPrize())

const canAddPrize = computed(() =>
  newPrize.value.nombre.trim() && newPrize.value.tipo && newPrize.value.probabilidad
)

const previewPremios = computed(() => {
  return rouletteForm.value.premios.map(p => ({
    nombre: p.nombre,
    tipo: p.tipo === 'cupon' ? 'codigo' : p.tipo,
    peso: p.probabilidad === 'alta' ? 50 : p.probabilidad === 'media' ? 30 : 20,
  }))
})

function probLabel(prob) {
  const labels = { alta: 'Alta 50%', media: 'Media 30%', baja: 'Baja 20%' }
  return labels[prob] || prob
}

function openRouletteModal(data) {
  showRouletteModal.value = true
  if (data) {
    editingId.value = data.id
    rouletteForm.value = {
      nombre: data.nombre || '',
      descripcion: data.descripcion || '',
      tiempoInscripcion: data.tiempoInscripcion || data.tiempo_inscripcion || 60,
      premios: (data.premios || []).map(p => ({
        nombre: p.nombre,
        tipo: p.tipo,
        probabilidad: p.probabilidad || (p.peso >= 50 ? 'alta' : p.peso >= 30 ? 'media' : 'baja'),
      })),
    }
  } else {
    editingId.value = null
    rouletteForm.value = { nombre: '', descripcion: '', tiempoInscripcion: 60, premios: [] }
  }
  newPrize.value = defaultPrize()
  showPrizeForm.value = false
  editingPrizeIndex.value = null
}

function closeRouletteModal() {
  showRouletteModal.value = false
  editingId.value = null
}

function openPrizeForm(index) {
  if (index !== null) {
    newPrize.value = { ...rouletteForm.value.premios[index] }
    editingPrizeIndex.value = index
  } else {
    newPrize.value = defaultPrize()
    editingPrizeIndex.value = null
  }
  showPrizeForm.value = true
}

function confirmPrize() {
  if (!canAddPrize.value) return
  const prizeData = {
    nombre: newPrize.value.nombre.trim(),
    tipo: newPrize.value.tipo,
    probabilidad: newPrize.value.probabilidad,
  }
  if (editingPrizeIndex.value !== null) {
    rouletteForm.value.premios.splice(editingPrizeIndex.value, 1, prizeData)
  } else {
    rouletteForm.value.premios.push(prizeData)
  }
  newPrize.value = defaultPrize()
  showPrizeForm.value = false
  editingPrizeIndex.value = null
}

function cancelPrizeForm() {
  newPrize.value = defaultPrize()
  showPrizeForm.value = false
  editingPrizeIndex.value = null
}

function editPrize(index) {
  openPrizeForm(index)
}

function editFromDropdown(d) {
  openDropdownId.value = null
  const type = d.tipo_dinamica || ''
  if (type === 'ruleta') {
    editRoulette(d)
  } else {
    editTrivia(d)
  }
}

async function editRoulette(d) {
  try {
    const res = await getDinamica(d.id)
    const data = res?.data || res || {}
    const dinamica = data.dinamica || data
    const premios = data.premios || dinamica.premios || []
    openRouletteModal({
      id: dinamica.id || d.id,
      nombre: dinamica.nombre || d.nombre,
      descripcion: dinamica.descripcion || d.descripcion,
      tiempoInscripcion: dinamica.tiempo_inscripcion || dinamica.tiempoInscripcion,
      premios: premios,
    })
  } catch (error) {
    console.error('Error loading roulette:', error)
    toastAlert.show('Error', 'Error al cargar la ruleta', 'error')
  }
}

function removePrize(index) {
  rouletteForm.value.premios.splice(index, 1)
  if (editingPrizeIndex.value === index) {
    cancelPrizeForm()
  }
}

async function saveRoulette() {
  if (!rouletteForm.value.nombre.trim() || rouletteForm.value.premios.length === 0) return
  isSaving.value = true
  try {
    const pesos = { alta: 50, media: 30, baja: 20 }
    const specsPayload = {
      nombre: rouletteForm.value.nombre.trim(),
      descripcion: rouletteForm.value.descripcion.trim() || '',
      modoInscripcion: 'tiempo',
      tiempoInscripcion: rouletteForm.value.tiempoInscripcion || 60,
      maxParticipantes: null,
      mostrarInscritos: true,
      tipoPremio: 'Premio único',
      maxGanadores: 1,
      premios: rouletteForm.value.premios.map(p => ({
        nombre: p.nombre,
        tipo: p.tipo,
        stock: 1,
        peso: pesos[p.probabilidad] || 20,
      })),
    }

    if (editingId.value) {
      // Update existing
      await updateDinamica(editingId.value, {
        nombre: rouletteForm.value.nombre.trim(),
        descripcion: rouletteForm.value.descripcion.trim() || '',
      })
      await storeDinamicaSpecifications(editingId.value, specsPayload)
    } else {
      // Create new
      const payload = {
        tipo_dinamica: 'ruleta',
        nombre: rouletteForm.value.nombre.trim(),
        descripcion: rouletteForm.value.descripcion.trim() || '',
        is_public: false,
      }
      const res = await createDinamica(payload)
      const data = res?.data || res || {}
      const dinamicaId = data.dinamica_id || data.id
      if (dinamicaId) {
        await storeDinamicaSpecifications(dinamicaId, specsPayload)
      }
    }
    closeRouletteModal()
    await loadDinamicas()
    toastAlert.show(editingId.value ? 'Actualizada' : 'Creada', 'Ruleta ' + (editingId.value ? 'actualizada' : 'creada') + ' correctamente', 'success')
  } catch (error) {
    console.error('Error saving roulette:', error)
    toastAlert.show('Error', error.response?.data?.message || 'Error al guardar la ruleta', 'error')
  } finally {
    isSaving.value = false
  }
}

// ═══════════════════════════════════════════════════
// Modal Trivia
// ═══════════════════════════════════════════════════
const showTriviaModal = ref(false)
const triviaSaving = ref(false)
const triviaEditingId = ref(null)

const triviaForm = ref({
  name: '',
  description: '',
  slug: '',
  pointsMin: 1,
  pointsMax: 10,
  participantsLimit: null,
  closingTime: '',
  gameBlocks: [],
})

const categories = ref([])
let blockIdCounter = 0
function genBlockId() { return 'tb_' + (++blockIdCounter) + '_' + Date.now() }

const activeCategories = computed(() =>
  categories.value.filter(c => c.status === 'active' || c.activo === true || c.is_active === true)
)

const allCategoryOptions = computed(() =>
  activeCategories.value.map(c => ({ id: c.id, name: c.name }))
)

const usedCatIds = computed(() =>
  triviaForm.value.gameBlocks.map(b => String(b.categoryId)).filter(Boolean)
)

const availableCategoryOptions = computed(() =>
  allCategoryOptions.value.filter(cat => !usedCatIds.value.includes(String(cat.id)))
)

const sortedTriviaBlocks = computed(() =>
  [...triviaForm.value.gameBlocks].sort((a, b) => (a.order || 0) - (b.order || 0))
)

const trivialPointsRange = computed(() =>
  triviaForm.value.pointsMin + ' – ' + triviaForm.value.pointsMax + ' pts'
)

function categoryName(id) {
  const found = allCategoryOptions.value.find(c => String(c.id) === String(id))
  return found ? found.name : 'Categoría #' + id
}

function isCatUsed(catId, excludeId) {
  return triviaForm.value.gameBlocks.some(b => b.id !== excludeId && String(b.categoryId) === String(catId))
}

function syncTriviaOrder() {
  triviaForm.value.gameBlocks.forEach((b, i) => { b.order = i + 1 })
}

function addTriviaBlock(cat) {
  const block = {
    id: genBlockId(),
    title: cat.name,
    categoryId: cat.id,
    order: triviaForm.value.gameBlocks.length + 1,
    isActive: true,
  }
  triviaForm.value.gameBlocks.push(block)
  syncTriviaOrder()
}

function removeTriviaBlock(blockId) {
  triviaForm.value.gameBlocks = triviaForm.value.gameBlocks.filter(b => b.id !== blockId)
  syncTriviaOrder()
}

function goToCategoriesList() {
  router.push('/marketing/categorias-preguntas')
}

function goToCategoriesCreate() {
  router.push('/marketing/categorias-preguntas/crear')
}

function openTriviaModal(data) {
  showTriviaModal.value = true
  if (data) {
    triviaEditingId.value = data.id
    triviaForm.value = {
      name: data.nombre || data.name || '',
      description: data.descripcion || data.description || '',
      slug: data.slug || '',
      pointsMin: data.pointsMin || data.points_min || 1,
      pointsMax: data.pointsMax || data.points_max || 10,
      participantsLimit: data.participantsLimit || data.participants_limit || null,
      closingTime: data.closingTime || data.closing_time || '',
      gameBlocks: (data.gameBlocks || data.game_blocks || []).map(b => ({
        id: genBlockId(),
        title: b.title || '',
        categoryId: b.categoryId || b.category_id || b.id_categories || null,
        order: b.order || b.orden || 0,
        isActive: b.isActive === true || b.isActive === 1 || b.is_active === true || b.is_active === 1,
      })),
    }
    syncTriviaOrder()
  } else {
    triviaEditingId.value = null
    triviaForm.value = { name: '', description: '', slug: '', pointsMin: 1, pointsMax: 10, participantsLimit: null, closingTime: '', gameBlocks: [] }
  }
}

function closeTriviaModal() {
  showTriviaModal.value = false
  triviaEditingId.value = null
}

async function editTrivia(d) {
  try {
    const res = await getDinamica(d.id)
    const data = res?.data || res || {}
    const dinamica = data.dinamica || data
    // Cargar config
    const cfg = data.config || {}
    const blocks = data.game_blocks || data.gameBlocks || dinamica.game_blocks || dinamica.gameBlocks || []
    const tc = data.trivia_config || data.triviaConfig || cfg.trivia || {}
    const rc = data.registration_config || data.registrationConfig || cfg.registration || {}
    openTriviaModal({
      id: dinamica.id || d.id,
      nombre: tc.name || dinamica.nombre || d.nombre,
      descripcion: tc.description || dinamica.descripcion,
      slug: tc.slug || dinamica.slug || '',
      pointsMin: tc.pointsMin || tc.points_min,
      pointsMax: tc.pointsMax || tc.points_max,
      participantsLimit: rc.participantsLimit || rc.participants_limit,
      closingTime: rc.closingTime || rc.closing_time,
      gameBlocks: blocks,
    })
  } catch (error) {
    console.error('Error loading trivia:', error)
    toastAlert.show('Error', 'Error al cargar la trivia', 'error')
  }
}

async function submitTrivia() {
  if (!triviaForm.value.name.trim() || triviaForm.value.gameBlocks.length === 0) return
  triviaSaving.value = true
  try {
    const payload = {
      gameBlocks: triviaForm.value.gameBlocks.map(b => ({
        categoryId: b.categoryId ? Number(b.categoryId) : null,
        title: b.title || 'Bloque',
        order: b.order || 0,
        isActive: b.isActive ? true : false,
      })),
      triviaConfig: {
        name: triviaForm.value.name.trim(),
        description: triviaForm.value.description.trim() || '',
        slug: triviaForm.value.slug || '',
        pointsMin: triviaForm.value.pointsMin || 1,
        pointsMax: triviaForm.value.pointsMax || 10,
      },
      registrationConfig: {
        participantsLimit: triviaForm.value.participantsLimit || null,
        closingTime: triviaForm.value.closingTime || '',
      },
      nombre: triviaForm.value.name.trim(),
      descripcion: triviaForm.value.description.trim() || '',
    }

    if (triviaEditingId.value) {
      await updateDinamica(triviaEditingId.value, {
        nombre: triviaForm.value.name.trim(),
        descripcion: triviaForm.value.description.trim() || '',
      })
      await saveTrivia(triviaEditingId.value, payload)
    } else {
      const createPayload = {
        tipo_dinamica: 'trivia',
        nombre: triviaForm.value.name.trim() || 'Nueva Trivia',
        descripcion: triviaForm.value.description.trim() || '',
        is_public: false,
      }
      const res = await createDinamica(createPayload)
      const createData = res?.data || res || {}
      const id = createData.dinamica_id || createData.id
      if (id) {
        await saveTrivia(id, payload)
      }
    }
    closeTriviaModal()
    await loadDinamicas()
    toastAlert.show(triviaEditingId.value ? 'Actualizada' : 'Creada', 'Trivia ' + (triviaEditingId.value ? 'actualizada' : 'creada') + ' correctamente', 'success')
  } catch (error) {
    console.error('Error saving trivia:', error)
    toastAlert.show('Error', error.response?.data?.message || 'Error al guardar la trivia', 'error')
  } finally {
    triviaSaving.value = false
  }
}
</script>

<style scoped>
.dinamica-view { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.card-meta { font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px; }
.nav-back {
  display: inline-flex; align-items: center; gap: 5px;
  background: transparent; border: 1px solid var(--border-color);
  padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
  color: var(--text-muted); text-decoration: none; transition: all 0.2s;
}
.nav-back:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(24,214,0,0.04); }
.type-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 640px) { .type-selector { grid-template-columns: 1fr; } }
.dinamica-type-card {
  background: var(--card-bg); border: 2px solid var(--border-color);
  border-radius: 12px; padding: 32px 24px; text-align: center;
  cursor: pointer; transition: all 0.25s ease;
}
.dinamica-type-card:hover {
  border-color: var(--primary-color); transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(24,214,0,0.1);
}
.type-icon { color: var(--primary-color); margin-bottom: 12px; }
.dinamica-type-card h5 { font-size: 16px; font-weight: 700; color: var(--text-bold); margin: 0 0 8px 0; }
.dinamica-type-card p { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin: 0; }
.section-subtitle { font-size: 15px; font-weight: 700; color: var(--text-bold); margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.section-subtitle small { font-size: 12px; font-weight: 400; margin-left: 4px; }
.error-banner { display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; color: var(--danger-color); font-size: 13px; margin-bottom: 14px; }
.dinamicas-table-section { border-top: 1px solid var(--border-color); padding-top: 20px; }
.loading-state { display: flex; align-items: center; gap: 10px; padding: 20px; color: var(--text-muted); font-size: 13px; }
.spinner { animation: spin 1s linear infinite; color: var(--primary-color); }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { padding: 24px; color: var(--text-muted); font-size: 13px; text-align: center; border: 1px solid var(--border-color); border-radius: 8px; }
.table-responsive { border-radius: 8px; overflow: visible; border: 1px solid var(--border-color); }
.table { width: 100%; border-collapse: collapse; background: var(--card-bg); }
.table thead.thead-light { background: #f8f9fa; }
.table th { padding: 10px 12px; font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 2px solid var(--border-color); white-space: nowrap; }
.table td { padding: 10px 12px; font-size: 0.85rem; color: var(--text-main); border-bottom: 1px solid var(--border-color); vertical-align: middle; }
.table tbody tr:last-child td { border-bottom: none; }
.table-hover tbody tr:hover { background: rgba(0,0,0,0.03) !important; }
.text-right { text-align: right; }
.text-muted { color: #6c757d; }
.cell-name { font-weight: 600; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; text-transform: uppercase; }
.badge-secondary { background: #e9ecef; color: #6c757d; }
.badge-info { background: #d1ecf1; color: #0c5460; }
.badge-success { background: #d4edda; color: #155724; }
.badge-primary { background: #cce5ff; color: #004085; }
.badge-warning { background: #fff3cd; color: #856404; }
.btn-group.dropdown { position: relative; display: inline-block; }
.btn.btn-sm.btn-light { display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; font-size: 14px; font-weight: 700; line-height: 1.5; cursor: pointer; border: 1px solid var(--border-color); border-radius: 6px; background: #f8f9fa; color: var(--text-main); transition: all 0.2s; }
.btn.btn-sm.btn-light:hover { background: #e9ecef; border-color: var(--primary-color); }
.dropdown-menu { display: none; position: absolute; right: 0; top: 100%; z-index: 1000; min-width: 200px; padding: 8px 0; margin: 4px 0 0; background: #fff; border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.dropdown-menu.show { display: block; }
.dropdown-item { display: flex; align-items: center; gap: 8px; padding: 8px 16px; font-size: 13px; color: #333; text-decoration: none; cursor: pointer; background: none; border: none; width: 100%; text-align: left; transition: background 0.15s; }
.dropdown-item:hover { background: #f8f9fa; color: var(--primary-color); }
.dropdown-item.text-danger:hover { background: #fff5f5; color: #dc3545 !important; }
.dropdown-divider { height: 0; margin: 8px 0; overflow: hidden; border-top: 1px solid var(--border-color); }
.table-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; flex-wrap: wrap; gap: 8px; }
.table-footer small { color: var(--text-muted); font-size: 12px; }
.pagination-custom { display: flex; gap: 4px; list-style: none; padding: 0; margin: 0; }
.pagination-custom li a { display: flex; align-items: center; justify-content: center; min-width: 32px; height: 32px; padding: 0 6px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px; color: var(--text-main); text-decoration: none; transition: all 0.2s; background: var(--card-bg); }
.pagination-custom li a:hover { border-color: var(--primary-color); color: var(--primary-color); }
.pagination-custom li.active a { background: var(--primary-color); border-color: var(--primary-color); color: white; font-weight: 700; }
.pagination-custom li.disabled a { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

/* ═══════════════════════════════════════════════════════════════════
   MODAL: Ruleta
   ═══════════════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
  padding: 16px;
}

.roulette-modal {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 100%;
  max-width: 1100px;
  height: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(24px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.rm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
@media (min-width: 768px) {
  .rm-header { padding: 18px 24px; }
}
.rm-header-group { display: flex; align-items: center; gap: 10px; }
.rm-header-icon { color: var(--primary-color); }
.rm-title { font-size: 1rem; font-weight: 800; color: var(--text-bold); margin: 0; }
@media (min-width: 768px) { .rm-title { font-size: 1.05rem; } }
.rm-close { background: none; border: none; color: var(--text-light); cursor: pointer; padding: 6px; border-radius: 6px; display: flex; transition: all 0.2s; }
.rm-close:hover { background: var(--bg-main); color: var(--danger-color); }

/* ─── Body: flexbox, el form scroll, la preview no ─── */
.rm-body {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 0;
}
@media (max-width: 992px) {
  .rm-body {
    flex-direction: column;
    overflow-y: auto;
  }
}

/* ─── Left: Form (SCROLL SOLO AQUI) ─── */
.rm-form-col {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  min-height: 0;
}
@media (min-width: 768px) { .rm-form-col { padding: 20px; gap: 16px; } }
@media (min-width: 1200px) { .rm-form-col { padding: 24px; } }
@media (max-width: 992px) {
  .rm-form-col {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    overflow: visible;
  }
}

/* Thin scrollbar for the form column */
.rm-form-col::-webkit-scrollbar {
  width: 5px;
}
.rm-form-col::-webkit-scrollbar-track {
  background: transparent;
}
.rm-form-col::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}
.rm-form-col::-webkit-scrollbar-thumb:hover {
  background: var(--text-light);
}

/* ─── Sections ─── */
.rm-section {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  flex-shrink: 0;
}
.rm-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  background: var(--card-bg);
}
@media (min-width: 768px) { .rm-section-header { padding: 10px 14px; font-size: 0.75rem; } }
.rm-section-header svg { color: var(--primary-color); flex-shrink: 0; }
.rm-section-count { margin-left: auto; font-size: 0.65rem; padding: 2px 8px; background: var(--bg-main); border-radius: 20px; }
.rm-section-body { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
@media (min-width: 768px) { .rm-section-body { padding: 14px; gap: 12px; } }

/* ─── Row ─── */
.rm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (min-width: 768px) { .rm-row { gap: 12px; } }
@media (max-width: 480px) { .rm-row { grid-template-columns: 1fr; } }

/* ─── Fields ─── */
.rm-field { display: flex; flex-direction: column; gap: 4px; }
.rm-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); }
@media (min-width: 768px) { .rm-label { font-size: 0.73rem; } }
.rm-label-sm { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-muted); }
@media (min-width: 768px) { .rm-label-sm { font-size: 0.7rem; } }
.rm-required { color: var(--danger-color); }

.rm-input-wrap { position: relative; display: flex; align-items: center; }
.rm-input-icon { position: absolute; left: 10px; color: var(--text-light); pointer-events: none; }
@media (min-width: 768px) { .rm-input-icon { left: 12px; } }

.rm-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: var(--card-bg);
  color: var(--text-main);
  transition: all 0.2s;
  box-sizing: border-box;
}
@media (min-width: 768px) { .rm-input { padding: 9px 14px 9px 40px; font-size: 13px; } }
.rm-input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08); }
.rm-input::placeholder { color: var(--text-light); }
.rm-input--no-icon { padding-left: 12px; }
@media (min-width: 768px) { .rm-input--no-icon { padding-left: 14px; } }

.rm-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: var(--card-bg);
  color: var(--text-main);
  transition: all 0.2s;
  resize: vertical;
  box-sizing: border-box;
}
@media (min-width: 768px) { .rm-textarea { padding: 9px 14px; } }
.rm-textarea:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08); }
.rm-textarea::placeholder { color: var(--text-light); }

.rm-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: var(--card-bg);
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}
@media (min-width: 768px) { .rm-select { padding: 9px 14px; } }
.rm-select:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08); }

/* ─── Locked fields ─── */
.rm-locked-field {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: not-allowed;
}
@media (min-width: 768px) { .rm-locked-field { padding: 9px 14px; } }
.rm-locked-field svg { color: var(--text-light); flex-shrink: 0; }

/* ─── Prizes ─── */
.rm-prizes-empty { font-size: 13px; color: var(--text-light); text-align: center; padding: 10px; margin: 0; }

.rm-prize-list { display: flex; flex-direction: column; gap: 6px; }
.rm-prize-item { padding: 8px 10px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; transition: border-color 0.2s; }
@media (min-width: 768px) { .rm-prize-item { padding: 10px 12px; } }
.rm-prize-item:hover { border-color: rgba(24, 214, 0, 0.25); }
.rm-prize-item-header { display: flex; justify-content: space-between; align-items: center; }
.rm-prize-info { display: flex; align-items: center; gap: 8px; min-width: 0; }
.rm-prize-name { font-size: 13px; font-weight: 600; color: var(--text-main); }
.rm-prize-badge { padding: 2px 8px; border-radius: 12px; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
.rm-badge--alta { background: rgba(24, 214, 0, 0.12); color: #166534; }
.rm-badge--media { background: rgba(245, 158, 11, 0.12); color: #92400e; }
.rm-badge--baja { background: rgba(239, 68, 68, 0.1); color: #991b1b; }
body.dark-theme .rm-badge--alta { background: rgba(24, 214, 0, 0.2); color: #4ade80; }
body.dark-theme .rm-badge--media { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
body.dark-theme .rm-badge--baja { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.rm-prize-item-meta { margin-top: 4px; font-size: 11px; color: var(--text-light); }
.rm-prize-actions { display: flex; gap: 2px; }
.rm-prize-edit, .rm-prize-remove { background: none; border: none; padding: 4px; border-radius: 4px; color: var(--text-light); cursor: pointer; display: flex; transition: all 0.2s; }
.rm-prize-edit:hover { color: var(--primary-color); background: rgba(24, 214, 0, 0.06); }
.rm-prize-remove:hover { color: var(--danger-color); background: rgba(239, 68, 68, 0.08); }

.rm-add-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border: 1px dashed var(--border-color); border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
.rm-add-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(24, 214, 0, 0.04); }

/* ─── Prize Form ─── */
.rm-prize-form { display: flex; flex-direction: column; gap: 10px; padding: 12px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; animation: fadeIn 0.2s ease; }
@media (min-width: 768px) { .rm-prize-form { padding: 14px; gap: 12px; } }
.rm-prize-form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
@media (max-width: 600px) { .rm-prize-form-grid { grid-template-columns: 1fr; } }
.rm-prize-form-actions { display: flex; gap: 8px; }
.rm-prize-add-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; flex: 1; justify-content: center; }
.rm-prize-add-btn:hover:not(:disabled) { background: var(--primary-hover); }
.rm-prize-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.rm-prize-cancel-btn { padding: 8px 16px; background: transparent; border: 1px solid var(--border-color); border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
.rm-prize-cancel-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }

/* ─── Right: Preview (SIN SCROLL) ─── */
.rm-preview-col {
  flex: 1;
  min-width: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
@media (min-width: 768px) { .rm-preview-col { padding: 20px; } }
@media (min-width: 1200px) { .rm-preview-col { padding: 24px; } }
.rm-preview-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
  flex-shrink: 0;
}
@media (min-width: 768px) { .rm-preview-title { font-size: 0.73rem; margin: 0 0 16px 0; } }
.rm-preview-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  min-height: 0;
}
.rm-preview-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 32px 20px; text-align: center; }
.rm-preview-empty-icon { color: var(--text-muted); opacity: 0.3; width: 40px; height: 40px; }
@media (min-width: 768px) { .rm-preview-empty-icon { width: 48px; height: 48px; } }
.rm-preview-empty p { font-size: 13px; color: var(--text-light); margin: 0; max-width: 160px; }
@media (min-width: 768px) { .rm-preview-empty p { max-width: 180px; } }

/* ─── Footer ─── */
.rm-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid var(--border-color); flex-shrink: 0; }
@media (min-width: 768px) { .rm-footer { padding: 16px 24px; } }

/* ─── Buttons ─── */
.btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.btn-primary:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(24, 214, 0, 0.25); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: transparent; color: var(--text-main); border: 1px solid var(--border-color); border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-secondary:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(24, 214, 0, 0.04); }
.spinner-inline { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }

/* ═══════════════════════════════════════════════════════════════════
   MODAL: Trivia (estilos especificos)
   ═══════════════════════════════════════════════════════════════════ */
.trivia-modal {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 100%;
  max-width: 1100px;
  height: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
  animation: slideUp 0.3s ease-out;
}

/* ─── Categories ─── */
.trivia-cat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.trivia-cat-pill {
  padding: 3px 10px;
  background: rgba(24, 214, 0, 0.1);
  color: var(--primary-color, #18d600);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.trivia-cat-actions {
  display: flex;
  gap: 6px;
}
.trivia-cat-btn {
  padding: 4px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: var(--text-muted);
  transition: all 0.2s;
}
.trivia-cat-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }
.trivia-cat-btn.primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
.trivia-cat-btn.primary:hover { background: var(--primary-hover); }

/* ─── Available categories ─── */
.trivia-avail-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.trivia-cat-add-btn {
  padding: 4px 10px;
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: var(--text-muted);
  transition: all 0.2s;
}
.trivia-cat-add-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(24, 214, 0, 0.04); }

/* ─── Block list ─── */
.trivia-block-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.trivia-block-item {
  padding: 10px 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: border-color 0.2s;
}
.trivia-block-item:hover { border-color: rgba(24, 214, 0, 0.25); }
.trivia-block-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}
.trivia-block-info { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.trivia-block-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}
.trivia-block-input {
  padding: 5px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  background: var(--card-bg);
  color: var(--text-main);
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.trivia-block-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08);
}
.trivia-block-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.trivia-block-remove {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  color: var(--text-light);
  cursor: pointer;
  display: flex;
  transition: all 0.2s;
}
.trivia-block-remove:hover { color: var(--danger-color); background: rgba(239, 68, 68, 0.08); }
.trivia-block-cat-select { margin-top: 4px; }

/* ─── Toggle Switch ─── */
.toggle-switch { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute; cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--border-color);
  border-radius: 20px; transition: 0.3s;
}
.toggle-slider::before {
  content: ''; position: absolute;
  height: 14px; width: 14px;
  left: 3px; bottom: 3px;
  background-color: white; border-radius: 50%;
  transition: 0.3s;
}
.toggle-switch input:checked + .toggle-slider { background-color: var(--primary-color); }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(16px); }

/* ─── Trivia Summary / Preview ─── */
.trivia-preview-container.rm-preview-container {
  overflow-y: auto;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 16px;
}
.trivia-summary { width: 100%; }
.trivia-summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.trivia-summary-icon { color: var(--primary-color); flex-shrink: 0; }
.trivia-summary-header strong { font-size: 15px; color: var(--text-bold); display: block; }
.trivia-summary-slug { font-size: 11px; color: var(--text-light); display: block; margin-top: 1px; }
.trivia-summary-desc { font-size: 12px; color: var(--text-muted); margin: 0 0 12px 0; }
.trivia-summary-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}
.trivia-stat {
  flex: 1;
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}
.trivia-stat-value {
  display: block;
  font-size: 18px;
  font-weight: 800;
  color: var(--primary-color);
}
.trivia-stat-label {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.03em;
}
.trivia-summary-blocks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.trivia-summary-block {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: opacity 0.2s;
}
.trivia-summary-block.inactive { opacity: 0.5; }
.trivia-summary-block-idx {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  flex-shrink: 0;
}
.trivia-summary-block-info { flex: 1; min-width: 0; }
.trivia-summary-block-title { display: block; font-size: 12px; font-weight: 600; color: var(--text-main); }
.trivia-summary-block-cat { display: block; font-size: 11px; color: var(--text-light); margin-top: 1px; }
.trivia-summary-block-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
}
.trivia-summary-block-status.active { background: rgba(24, 214, 0, 0.12); color: #166534; }
.trivia-summary-block-status.paused { background: rgba(245, 158, 11, 0.12); color: #92400e; }
body.dark-theme .trivia-summary-block-status.active { background: rgba(24, 214, 0, 0.2); color: #4ade80; }
body.dark-theme .trivia-summary-block-status.paused { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }

/* ─── Add block wrap ─── */
.trivia-add-block-wrap {
  border-top: 1px solid var(--border-color);
  padding-top: 10px;
}
</style>
