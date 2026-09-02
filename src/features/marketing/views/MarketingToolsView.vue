<template>
  <div class="marketing-tools-view">
    <div class="card" v-show="!isEditingTool">
      <div class="card-body">
        <!-- Seleccionar Curso -->
        <div v-if="!selectedCourseId" class="course-selection-view">
          <div class="card-header mb-4">
            <div>
              <h4 class="card-title">Selecciona un curso o libro</h4>
              <span class="card-meta">Elige el curso o libro para el cual deseas gestionar o crear herramientas de marketing.</span>
            </div>
          </div>
          <div v-if="loadingCourses" class="loading-state"><Loader2 class="spinner" :size="36" /><p>Cargando tus cursos y libros...</p></div>
          <div v-else-if="courses.length === 0" class="no-courses">
            <p>Aún no tienes cursos o libros creados.</p>
            <router-link to="/courses/create" class="btn-primary-custom">Crear mi primer curso</router-link>
          </div>
          <div v-else class="courses-grid">
            <div class="course-card" v-for="course in courses" :key="course.id" @click="selectCourse(course)">
              <img :src="getCourseImage(course)" alt="Curso" class="course-card-img" @error="$event.target.src = '/img_mantenimiento.png'; $event.target.onerror = null;" />
              <div class="course-card-body">
                <h5 class="course-title">{{ course.title || course.titulo }}</h5>
                <p class="course-desc">Gestionar herramientas de marketing para este curso o libro.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista de Herramientas -->
        <div v-else>
          <div class="card-header">
            <div>
              <button class="btn-back" @click="clearCourseSelection">&larr; Volver a cursos/libros</button>
              <h4 class="card-title">Herramientas: {{ selectedCourse?.title || selectedCourse?.titulo }}</h4>
              <span class="card-meta">Crea y gestiona tus herramientas promocionales para este curso o libro</span>
            </div>
            <div class="create-buttons">
              <button class="stats-tab-btn" @click="createTool('Masterclass')">
                <Plus :size="14" /> Masterclass
              </button>
              <button class="stats-tab-btn" @click="createTool('Mini-Curso')">
                <Plus :size="14" /> Mini-Curso
              </button>
              <button class="stats-tab-btn" @click="createTool('E-book')">
                <Plus :size="14" /> E-book
              </button>
              <!--<button class="stats-tab-btn" @click="createTool('Dinámica')">
                <Zap :size="14" /> Dinámica
              </button>-->
              <button class="stats-tab-btn" style="color: var(--primary-color); border-color: var(--primary-color); background: rgba(24, 214, 0, 0.08);" @click="createTool('Material Publicitario')">
                <Megaphone :size="14" /> Material Publicitario
              </button>
            </div>
          </div>

          <!-- Loading Tools -->
          <div v-if="loading" class="loading-state"><Loader2 class="spinner" :size="36" /><p>Cargando herramientas...</p></div>

        <!-- DataTable -->
        <div v-else>
          <!-- Toolbar Superior -->
          <div class="dashboard-toolbar">
            <div class="search-wrapper modern-search">
              <Search :size="18" class="search-icon" />
              <input type="text" v-model="searchQuery" placeholder="Buscar por nombre o categoría..." />
            </div>
            
            <div class="view-controls">
              <span class="results-text">Mostrando {{ filteredTools.length }} herramientas</span>
            </div>
          </div>

          <!-- Estado Vacío -->
          <div v-if="filteredTools.length === 0" class="empty-state-modern">
            <div class="empty-state-icon">🚀</div>
            <h3>¡Es hora de impulsar tus ventas!</h3>
            <p>Aún no tienes herramientas promocionales para este curso. Empieza creando tu primera masterclass, mini-curso o material publicitario.</p>
          </div>

          <!-- Grid de Tarjetas -->
          <div v-else class="tools-grid-modern">
            <div v-for="item in filteredTools" :key="item.id" class="tool-card-modern">
              <div class="tool-card-header">
                <div class="tool-badge" :class="getTipoClass(item)" :style="getTipoStyle(item)">
                  {{ getTipoLabel(item) }}
                </div>
                <div class="tool-status-badge" :class="getEstadoClass(item)">
                  {{ getEstadoLabel(item) }}
                </div>
              </div>
              
              <div class="tool-card-body">
                <h5 class="tool-title">{{ item.nombre || item.title }}</h5>
                <div class="tool-meta">
                  <span class="meta-item"><Tag :size="14" /> {{ item.category_name || item.category?.name || 'Sin Categoría' }}</span>
                  <span class="meta-item"><Calendar :size="14" /> {{ formatDate(item.fecha || item.created_at) }}</span>
                </div>
              </div>

              <div class="tool-card-footer">
                <div class="tool-stats">
                  <div class="stat-item" title="Distribuidores">
                    <Users :size="16" class="stat-icon" /> <span>{{ item.distribuidores || item.distributors_count || 0 }}</span>
                  </div>
                  <div class="stat-item interactive-stat" title="Usuarios interactuando con herramienta" @click="showToolUsages(item)">
                    <MousePointerClick :size="16" class="stat-icon text-primary" /> 
                    <span class="text-primary">{{ item.usages_count || 0 }}</span>
                  </div>
                </div>
                
                <div class="tool-actions">
                  <button class="action-btn-icon" @click="handleAction(item, 'edit')" title="Editar">
                    <Edit3 :size="16" />
                  </button>
                  <button v-if="getTipoSlug(item) === 'minicourse' || getTipoSlug(item) === 'mini-course'" class="action-btn-icon" @click="handleAction(item, 'modules')" title="Módulos y Clases">
                    <Layers :size="16" />
                  </button>
                  <button class="action-btn-icon" @click="handleAction(item, 'status')" title="Cambiar Estado">
                    <ToggleLeft :size="16" />
                  </button>
                  <button class="action-btn-icon text-danger" @click="handleAction(item, 'delete')" title="Eliminar">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        <!-- Fin vista herramientas -->
      </div>
    </div>

    <!-- ===================== EDIT VIEWS (Full Page) ===================== -->
    <div v-if="showEditMasterclassModal" class="edit-page-container">
      <div class="card w-100 border-0 shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center bg-dark text-white p-3 border-bottom border-secondary">
          <div class="d-flex align-items-center gap-3">
            <button class="btn-back m-0 d-flex align-items-center gap-2" @click="closeEditModals">
              <ArrowLeft :size="16" /> Volver
            </button>
            <h5 class="m-0 fw-bold d-flex align-items-center gap-2"><Edit3 :size="18" class="text-primary"/> Editar Masterclass: <span class="text-gray-300 fw-normal ms-1">{{ editTarget?.nombre || editTarget?.title }}</span></h5>
          </div>
        </div>
        <div class="card-body p-0 bg-black">
          <form @submit.prevent="submitEditMasterclass" class="m-0">
            <div style="display: flex; flex-wrap: wrap; width: 100%;">
              <!-- IZQUIERDA: Formulario -->
              <div class="p-4 border-end edit-form-scroll" style="flex: 1 1 55%; min-width: 350px;">
                
                <h4 class="fw-bolder text-success mt-5 mb-4 border-bottom border-success pb-3 d-flex align-items-center form-section-title" style="letter-spacing: 0.5px; font-size: 1.25rem;"><Layers :size="22" class="me-2"/> Información Básica</h4>
                <div class="row">
                  <div class="col-md-8">
                    <div class="form-group">
                      <label>Título <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="editForm.title" required />
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label>Categoría <span class="text-danger">*</span></label>
                      <select class="form-control" v-model="editForm.id_categories" required>
                        <option value="">Seleccionar</option>
                        <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Descripción</label>
                  <textarea class="form-control" rows="3" v-model="editForm.description"></textarea>
                </div>
                <div class="form-group">
                  <label>Objetivos</label>
                  <textarea class="form-control" rows="2" v-model="editForm.objectives"></textarea>
                </div>

                <h4 class="fw-bolder text-success mt-5 mb-4 border-bottom border-success pb-3 d-flex align-items-center form-section-title" style="letter-spacing: 0.5px; font-size: 1.25rem;"><Calendar :size="22" class="me-2"/> Detalles del Evento</h4>
                <div class="row">
                  <div class="col-md-4">
                    <div class="form-group">
                      <label>Fecha</label>
                      <input type="date" class="form-control" v-model="editForm.date" />
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label>Email de contacto</label>
                      <input type="email" class="form-control" v-model="editForm.email_contact" />
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label>Teléfono</label>
                      <input type="text" class="form-control" v-model="editForm.phone_contact" />
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Meeting Link</label>
                  <input type="url" class="form-control" v-model="editForm.meeting_link" placeholder="https://zoom.us/j/..." />
                </div>

                <h4 class="fw-bolder text-success mt-5 mb-4 border-bottom border-success pb-3 d-flex align-items-center form-section-title" style="letter-spacing: 0.5px; font-size: 1.25rem;"><ImageIcon :size="22" class="me-2"/> Archivos Multimedia</h4>
                <div class="row">
                  <div class="col-md-12">
                    <div class="form-group">
                      <label>Nueva imagen (Solo 1)</label>
                      <label for="mcImage" class="custom-file-upload" :class="{ 'has-file': editFiles.images?.[0] }">
                        <div class="upload-icon-wrapper">
                          <ImageIcon v-if="!editFiles.images?.[0]" class="upload-icon" />
                          <CheckCircle2 v-else class="upload-icon success" />
                        </div>
                        <div class="upload-text">
                          <span v-if="!editFiles.images?.[0]"><strong>Haz clic para subir</strong> imagen</span>
                          <span v-else class="file-name">{{ editFiles.images[0].name }}</span>
                        </div>
                      </label>
                      <input type="file" id="mcImage" class="d-none" accept="image/jpeg,image/png,image/jpg" @change="e => { editFiles.images = e.target.files; generatePreviews(e.target.files, 'images') }" />
                      
                      <!-- Imágenes actuales / Vista previa -->
                      <div class="mt-2" v-if="localPreviews.images?.length || (editImages && editImages.length)">
                        <small class="text-muted">Vista previa:</small>
                        <div class="d-flex flex-wrap gap-2 mt-1">
                          <div v-if="localPreviews.images?.length" v-for="(url, i) in localPreviews.images" :key="'new'+i" class="img-preview-wrapper">
                            <img :src="url" class="img-thumbnail-sm border-primary" />
                          </div>
                          <div v-else-if="editImages && editImages.length" class="img-preview-wrapper">
                            <img :src="getS3ImageUrl(editImages[0]?.image || editImages[0]?.url).replace(/([^:]\/)\/+/g, '$1')" class="img-thumbnail-sm" referrerpolicy="no-referrer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-12 mt-3">
                    <div class="form-group">
                      <label>Banner para Landing Page <span class="text-danger">*</span></label>
                      <label for="mcBanner" class="custom-file-upload" :class="{ 'has-file': editFiles.landing_banner }">
                        <div class="upload-icon-wrapper">
                          <ImageIcon v-if="!editFiles.landing_banner" class="upload-icon" />
                          <CheckCircle2 v-else class="upload-icon success" />
                        </div>
                        <div class="upload-text">
                          <span v-if="!editFiles.landing_banner"><strong>Haz clic para subir</strong> banner panorámico (16:9)</span>
                          <span v-else class="file-name">{{ editFiles.landing_banner.name }}</span>
                        </div>
                      </label>
                      <input type="file" id="mcBanner" class="d-none" accept="image/jpeg,image/png,image/jpg" @change="e => { editFiles.landing_banner = e.target.files[0]; generatePreviews([e.target.files[0]], 'landing_banner') }" />
                      
                      <div class="mt-2" v-if="localPreviews.landing_banner?.length || editTarget?.landing_banner">
                        <small class="text-muted">Vista previa:</small>
                        <div class="d-flex flex-wrap gap-2 mt-1">
                          <div class="img-preview-wrapper" style="width: 160px; height: 90px;">
                            <img :src="localPreviews.landing_banner?.[0] || getS3ImageUrl(editTarget.landing_banner)" class="img-thumbnail-sm border-primary" style="object-fit: cover; width: 100%; height: 100%;" referrerpolicy="no-referrer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <h4 class="fw-bolder text-success mt-5 mb-4 border-bottom border-success pb-3 d-flex align-items-center form-section-title" style="letter-spacing: 0.5px; font-size: 1.25rem;"><MessageSquare :size="22" class="me-2"/> Prueba Social & FAQs</h4>
                
                <!-- Testimonios Collapsible -->
                <details class="custom-accordion mb-3">
                  <summary class="accordion-header rounded bg-dark p-2 border border-secondary" style="cursor: pointer;">
                    <span class="fw-semibold">Testimonios <span class="text-danger">*</span> <small class="text-muted fw-normal">(mínimo 2)</small></span>
                  </summary>
                  <div class="accordion-body p-3 border border-top-0 border-secondary rounded-bottom" style="background: var(--card-bg, #1a1a1a);">
                    <div v-for="(t, i) in editForm.testimonials" :key="'t-mc-'+i" class="border rounded p-2 mb-2" style="background: rgba(0,0,0,0.2);">
                      <small class="text-muted">Testimonio {{ i + 1 }}</small>
                      <input type="text" class="form-control mb-1 mt-1" :placeholder="'Nombre del autor ' + (i+1)" v-model="t.author_name" />
                      <textarea class="form-control" rows="2" :placeholder="'¿Qué dijo sobre tu producto?'" v-model="t.content"></textarea>
                    </div>
                    <div class="d-flex mt-2">
                      <button type="button" class="btn-primary-custom" @click="editForm.testimonials.push({ author_name: '', content: '' })"><Plus :size="22" class="me-2"/> Añadir testimonio</button>
                      <button type="button" class="btn-danger-custom ms-2" v-if="editForm.testimonials?.length > 2" @click="editForm.testimonials.pop()"><X :size="22" class="me-2"/> Quitar último</button>
                    </div>
                  </div>
                </details>

                <!-- FAQ Collapsible -->
                <details class="custom-accordion mb-2">
                  <summary class="accordion-header rounded bg-dark p-2 border border-secondary" style="cursor: pointer;">
                    <span class="fw-semibold">Preguntas Frecuentes (FAQ) <span class="text-danger">*</span> <small class="text-muted fw-normal">(mínimo 3)</small></span>
                  </summary>
                  <div class="accordion-body p-3 border border-top-0 border-secondary rounded-bottom" style="background: var(--card-bg, #1a1a1a);">
                    <div v-for="(f, i) in editForm.faqs" :key="'faq-mc-'+i" class="border rounded p-2 mb-2" style="background: rgba(0,0,0,0.2);">
                      <small class="text-muted">Pregunta {{ i + 1 }}</small>
                      <input type="text" class="form-control mb-1 mt-1" :placeholder="'Pregunta ' + (i + 1)" v-model="f.question" />
                      <textarea class="form-control" rows="2" placeholder="Respuesta" v-model="f.answer"></textarea>
                    </div>
                    <div class="d-flex mt-2">
                      <button type="button" class="btn-primary-custom" @click="editForm.faqs.push({ question: '', answer: '' })"><Plus :size="22" class="me-2"/> Añadir FAQ</button>
                      <button type="button" class="btn-danger-custom ms-2" v-if="editForm.faqs?.length > 3" @click="editForm.faqs.pop()"><X :size="22" class="me-2"/> Quitar último</button>
                    </div>
                  </div>
                </details>

              </div>
              
              <!-- DERECHA: Vista Previa en Vivo -->
              <div class="p-4" style="flex: 1 1 40%; min-width: 350px; background-color: var(--card-bg, #141414); display: flex; flex-direction: column;">
                <h4 class="text-uppercase text-success mt-5 mb-4 form-section-title"><Monitor :size="22" class="me-2"/> Vista Previa en Vivo</h4>
                <div style="flex-grow: 1; display: flex; flex-direction: column;">
                  <div style="border: 1px solid var(--border-color, #333); border-radius: 8px; overflow: hidden; background: #000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); flex-grow: 1; display: flex; flex-direction: column;">
                    <!-- Browser Header -->
                    <div style="background: #1a1a1a; padding: 10px 15px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #333;">
                      <span style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56;"></span>
                      <span style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e;"></span>
                      <span style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f;"></span>
                      <div style="flex-grow: 1; text-align: center;">
                        <div style="display: inline-block; background: #0a0a0a; color: #888; font-size: 11px; padding: 2px 20px; border-radius: 12px; letter-spacing: 0.5px;">preview.promolider.org</div>
                      </div>
                    </div>
                    <!-- Iframe Content -->
                    <iframe :srcdoc="livePreviewHtml" frameborder="0" style="width: 100%; flex-grow: 1; min-height: 500px; background: white; display: block;"></iframe>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
        <div class="card-footer bg-dark border-top border-secondary p-3 d-flex justify-content-end gap-3">
          <button type="button" class="btn-cancel" @click="closeEditModals">Cancelar</button>
          <button type="submit" class="btn-primary-custom" @click="submitEditMasterclass" :disabled="editLoading">
            <Loader2 v-if="editLoading" :size="16" class="spinner-inline me-2" /> 
            <Save v-else :size="16" class="me-2" />
            Actualizar Masterclass
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Ebook Modal -->
    <div v-if="showEditEbookModal" class="edit-page-container">
      <div class="card w-100 border-0 shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center bg-dark text-white p-3 border-bottom border-secondary">
          <div class="d-flex align-items-center gap-3">
            <button class="btn-back m-0 d-flex align-items-center gap-2" @click="closeEditModals">
              <ArrowLeft :size="16" /> Volver
            </button>
            <h5 class="m-0 fw-bold d-flex align-items-center gap-2"><Edit3 :size="18" class="text-primary"/> Editar E-book: <span class="text-gray-300 fw-normal ms-1">{{ editTarget?.nombre || editTarget?.title }}</span></h5>
          </div>
        </div>
        <div class="card-body p-0 bg-black">
          <form @submit.prevent="submitEditEbook" class="m-0">
            <div style="display: flex; flex-wrap: wrap; width: 100%;">
              <!-- IZQUIERDA: Formulario -->
              <div class="p-4 border-end edit-form-scroll" style="flex: 1 1 55%; min-width: 350px;">
                
                <h4 class="fw-bolder text-success mt-5 mb-4 border-bottom border-success pb-3 d-flex align-items-center form-section-title" style="letter-spacing: 0.5px; font-size: 1.25rem;"><Book :size="22" class="me-2"/> Información del E-book</h4>
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Título <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="editForm.titulo" required />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Autor <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="editForm.autor" required />
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Categoría <span class="text-danger">*</span></label>
                      <select class="form-control" v-model="editForm.categoria" required>
                        <option value="">Seleccionar</option>
                        <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-group">
                      <label>Precio</label>
                      <input type="number" step="0.01" min="0" class="form-control" v-model="editForm.precio" />
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-group">
                      <label>Páginas</label>
                      <input type="number" min="1" class="form-control" v-model="editForm.paginas" required />
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Descripción</label>
                  <textarea class="form-control" rows="3" v-model="editForm.descripcion" required></textarea>
                </div>

                <h4 class="fw-bolder text-success mt-5 mb-4 border-bottom border-success pb-3 d-flex align-items-center form-section-title" style="letter-spacing: 0.5px; font-size: 1.25rem;"><Layers :size="22" class="me-2"/> Estructura (Capítulos)</h4>
                <div class="form-group">
                  <div class="border rounded p-3 bg-dark border-secondary">
                    <div v-for="(cap, i) in editForm.capitulos" :key="i" class="mb-2 p-3 border rounded border-secondary" style="background: rgba(0,0,0,0.2);">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong class="text-white">Capítulo {{ i + 1 }}</strong>
                        <button type="button" class="btn-sm-icon text-danger" @click="removeChapter(i)" v-if="editForm.capitulos.length > 1"><X :size="14" /></button>
                      </div>
                      <div class="row">
                        <div class="col-md-8">
                          <input type="text" class="form-control form-control-sm mb-2" v-model="cap.titulo" placeholder="Título del capítulo" />
                        </div>
                        <div class="col-md-4">
                          <input type="number" min="1" class="form-control form-control-sm mb-2" v-model="cap.paginas" placeholder="Páginas" />
                        </div>
                      </div>
                      <textarea class="form-control form-control-sm" rows="2" v-model="cap.contenido" placeholder="Breve resumen o contenido..."></textarea>
                    </div>
                    <button type="button" class="btn-primary-custom btn-sm mt-1" @click="addChapter">
                      <Plus :size="22" class="me-2"/> Agregar Capítulo
                    </button>
                  </div>
                </div>

                <h4 class="fw-bolder text-success mt-5 mb-4 border-bottom border-success pb-3 d-flex align-items-center form-section-title" style="letter-spacing: 0.5px; font-size: 1.25rem;"><ImageIcon :size="22" class="me-2"/> Archivos del E-book</h4>
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Nueva portada</label>
                      <label for="ebCover" class="custom-file-upload" :class="{ 'has-file': editFiles.portada }">
                        <div class="upload-icon-wrapper">
                          <ImageIcon v-if="!editFiles.portada" class="upload-icon" />
                          <CheckCircle2 v-else class="upload-icon success" />
                        </div>
                        <div class="upload-text">
                          <span v-if="!editFiles.portada"><strong>Haz clic para subir</strong> portada</span>
                          <span v-else class="file-name">{{ editFiles.portada.name }}</span>
                        </div>
                      </label>
                      <input type="file" id="ebCover" class="d-none" accept="image/jpeg,image/png,image/jpg,image/webp" @change="e => { editFiles.portada = e.target.files?.[0]; generatePreviews(e.target.files, 'portada') }" />
                      <div v-if="localPreviews.portada?.length" class="mt-2"><small class="text-muted text-primary">Vista previa (nueva):</small><img :src="localPreviews.portada[0]" class="img-thumbnail-sm d-block mt-1 border-primary" /></div>
                      <div v-if="editImages?.length" class="mt-1"><small class="text-muted">Portada actual:</small><img :src="getS3ImageUrl(editImages[0]?.image || editImages[0]?.url).replace(/([^:]\/)\/+/g, '$1')" class="img-thumbnail-sm d-block mt-1" referrerpolicy="no-referrer" /></div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Nuevo archivo PDF</label>
                      <label for="ebPdf" class="custom-file-upload" :class="{ 'has-file': editFiles.archivo_pdf }">
                        <div class="upload-icon-wrapper">
                          <FileText v-if="!editFiles.archivo_pdf" class="upload-icon" />
                          <CheckCircle2 v-else class="upload-icon success" />
                        </div>
                        <div class="upload-text">
                          <span v-if="!editFiles.archivo_pdf"><strong>Haz clic para subir</strong> archivo PDF</span>
                          <span v-else class="file-name">{{ editFiles.archivo_pdf.name }}</span>
                        </div>
                      </label>
                      <input type="file" id="ebPdf" class="d-none" accept=".pdf" @change="e => editFiles.archivo_pdf = e.target.files?.[0]" />
                    </div>
                  </div>
                  
                  <div class="col-md-12 mt-3">
                    <div class="form-group">
                      <label>Banner para Landing Page <span class="text-danger">*</span></label>
                      <label for="ebBanner" class="custom-file-upload" :class="{ 'has-file': editFiles.landing_banner }">
                        <div class="upload-icon-wrapper">
                          <ImageIcon v-if="!editFiles.landing_banner" class="upload-icon" />
                          <CheckCircle2 v-else class="upload-icon success" />
                        </div>
                        <div class="upload-text">
                          <span v-if="!editFiles.landing_banner"><strong>Haz clic para subir</strong> banner panorámico (16:9)</span>
                          <span v-else class="file-name">{{ editFiles.landing_banner.name }}</span>
                        </div>
                      </label>
                      <input type="file" id="ebBanner" class="d-none" accept="image/jpeg,image/png,image/jpg" @change="e => { editFiles.landing_banner = e.target.files[0]; generatePreviews([e.target.files[0]], 'landing_banner') }" />
                      
                      <div class="mt-2" v-if="localPreviews.landing_banner?.length || editTarget?.landing_banner">
                        <small class="text-muted">Vista previa:</small>
                        <div class="d-flex flex-wrap gap-2 mt-1">
                          <div class="img-preview-wrapper" style="width: 160px; height: 90px;">
                            <img :src="localPreviews.landing_banner?.[0] || getS3ImageUrl(editTarget.landing_banner)" class="img-thumbnail-sm border-primary" style="object-fit: cover; width: 100%; height: 100%;" referrerpolicy="no-referrer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <h4 class="fw-bolder text-success mt-5 mb-4 border-bottom border-success pb-3 d-flex align-items-center form-section-title" style="letter-spacing: 0.5px; font-size: 1.25rem;"><MessageSquare :size="22" class="me-2"/> Prueba Social & FAQs</h4>
                
                <details class="custom-accordion mb-3">
                  <summary class="accordion-header rounded bg-dark p-2 border border-secondary" style="cursor: pointer;">
                    <span class="fw-semibold">Testimonios <span class="text-danger">*</span> <small class="text-muted fw-normal">(mínimo 2)</small></span>
                  </summary>
                  <div class="accordion-body p-3 border border-top-0 border-secondary rounded-bottom" style="background: var(--card-bg, #1a1a1a);">
                    <div v-for="(t, i) in editForm.testimonials" :key="'t-eb-'+i" class="border rounded p-2 mb-2" style="background: rgba(0,0,0,0.2);">
                      <small class="text-muted">Testimonio {{ i + 1 }}</small>
                      <input type="text" class="form-control mb-1 mt-1" :placeholder="'Nombre del autor ' + (i+1)" v-model="t.author_name" />
                      <textarea class="form-control" rows="2" placeholder="¿Qué dijo sobre tu ebook?" v-model="t.content"></textarea>
                    </div>
                    <div class="d-flex mt-2">
                      <button type="button" class="btn-primary-custom" @click="editForm.testimonials.push({ author_name: '', content: '' })"><Plus :size="22" class="me-2"/> Añadir testimonio</button>
                      <button type="button" class="btn-danger-custom ms-2" v-if="editForm.testimonials?.length > 2" @click="editForm.testimonials.pop()"><X :size="22" class="me-2"/> Quitar último</button>
                    </div>
                  </div>
                </details>

                <details class="custom-accordion mb-2">
                  <summary class="accordion-header rounded bg-dark p-2 border border-secondary" style="cursor: pointer;">
                    <span class="fw-semibold">Preguntas Frecuentes (FAQ) <span class="text-danger">*</span> <small class="text-muted fw-normal">(mínimo 3)</small></span>
                  </summary>
                  <div class="accordion-body p-3 border border-top-0 border-secondary rounded-bottom" style="background: var(--card-bg, #1a1a1a);">
                    <div v-for="(f, i) in editForm.faqs" :key="'faq-eb-'+i" class="border rounded p-2 mb-2" style="background: rgba(0,0,0,0.2);">
                      <small class="text-muted">Pregunta {{ i + 1 }}</small>
                      <input type="text" class="form-control mb-1 mt-1" :placeholder="'Pregunta ' + (i + 1)" v-model="f.question" />
                      <textarea class="form-control" rows="2" placeholder="Respuesta" v-model="f.answer"></textarea>
                    </div>
                    <div class="d-flex mt-2">
                      <button type="button" class="btn-primary-custom" @click="editForm.faqs.push({ question: '', answer: '' })"><Plus :size="22" class="me-2"/> Añadir FAQ</button>
                      <button type="button" class="btn-danger-custom ms-2" v-if="editForm.faqs?.length > 3" @click="editForm.faqs.pop()"><X :size="22" class="me-2"/> Quitar último</button>
                    </div>
                  </div>
                </details>

              </div>
              
              <!-- DERECHA: Vista Previa en Vivo -->
              <div class="p-4" style="flex: 1 1 40%; min-width: 350px; background-color: var(--card-bg, #141414); display: flex; flex-direction: column;">
                <h4 class="text-uppercase text-success mt-5 mb-4 form-section-title"><Monitor :size="22" class="me-2"/> Vista Previa en Vivo</h4>
                <div style="flex-grow: 1; display: flex; flex-direction: column;">
                  <div style="border: 1px solid var(--border-color, #333); border-radius: 8px; overflow: hidden; background: #000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); flex-grow: 1; display: flex; flex-direction: column;">
                    <!-- Browser Header -->
                    <div style="background: #1a1a1a; padding: 10px 15px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #333;">
                      <span style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56;"></span>
                      <span style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e;"></span>
                      <span style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f;"></span>
                      <div style="flex-grow: 1; text-align: center;">
                        <div style="display: inline-block; background: #0a0a0a; color: #888; font-size: 11px; padding: 2px 20px; border-radius: 12px; letter-spacing: 0.5px;">preview.promolider.org</div>
                      </div>
                    </div>
                    <!-- Iframe Content -->
                    <iframe :srcdoc="livePreviewHtml" frameborder="0" style="width: 100%; flex-grow: 1; min-height: 500px; background: white; display: block;"></iframe>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
        <div class="card-footer bg-dark border-top border-secondary p-3 d-flex justify-content-end gap-3">
          <button type="button" class="btn-cancel" @click="closeEditModals">Cancelar</button>
          <button type="submit" class="btn-primary-custom" @click="submitEditEbook" :disabled="editLoading">
            <Loader2 v-if="editLoading" :size="16" class="spinner-inline me-2" /> 
            <Save v-else :size="16" class="me-2" />
            Actualizar E-book
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Mini Curso Modal -->
    <div v-if="showEditMiniModal" class="edit-page-container">
      <div class="card w-100 border-0 shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center bg-dark text-white p-3 border-bottom border-secondary">
          <div class="d-flex align-items-center gap-3">
            <button class="btn-back m-0 d-flex align-items-center gap-2" @click="closeEditModals">
              <ArrowLeft :size="16" /> Volver
            </button>
            <h5 class="m-0 fw-bold d-flex align-items-center gap-2"><Edit3 :size="18" class="text-primary"/> Editar Mini Curso: <span class="text-gray-300 fw-normal ms-1">{{ editTarget?.nombre || editTarget?.title }}</span></h5>
          </div>
        </div>
        <div class="card-body p-0 bg-black">
          <form @submit.prevent="submitEditMiniCurso" class="m-0">
            <div style="display: flex; flex-wrap: wrap; width: 100%;">
              <!-- IZQUIERDA: Formulario -->
              <div class="p-4 border-end edit-form-scroll" style="flex: 1 1 55%; min-width: 350px;">
                
                <h4 class="fw-bolder text-success mt-5 mb-4 border-bottom border-success pb-3 d-flex align-items-center form-section-title" style="letter-spacing: 0.5px; font-size: 1.25rem;"><MonitorPlay :size="22" class="me-2"/> Información del Mini Curso</h4>
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Título <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="editForm.titulo" required />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Nivel <span class="text-danger">*</span></label>
                      <select class="form-control" v-model="editForm.nivel" required>
                        <option value="">Seleccionar</option>
                        <option value="principiante">Principiante</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Categoría <span class="text-danger">*</span></label>
                      <select class="form-control" v-model="editForm.categoria" required>
                        <option value="">Seleccionar</option>
                        <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Duración (min) <span class="text-danger">*</span></label>
                      <input type="number" min="1" class="form-control" v-model="editForm.duracion" required />
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Descripción</label>
                  <textarea class="form-control" rows="3" v-model="editForm.descripcion" required></textarea>
                </div>

                <h4 class="fw-bolder text-success mt-5 mb-4 border-bottom border-success pb-3 d-flex align-items-center form-section-title" style="letter-spacing: 0.5px; font-size: 1.25rem;"><ImageIcon :size="22" class="me-2"/> Portada / Imagen</h4>
                <div class="form-group">
                  <label>Nueva imagen (Opcional)</label>
                  <label for="mcimg" class="custom-file-upload" :class="{ 'has-file': editFiles.imagen }">
                    <div class="upload-icon-wrapper">
                      <ImageIcon v-if="!editFiles.imagen" class="upload-icon" />
                      <CheckCircle2 v-else class="upload-icon success" />
                    </div>
                    <div class="upload-text">
                      <span v-if="!editFiles.imagen"><strong>Haz clic para subir</strong> imagen</span>
                      <span v-else class="file-name">{{ editFiles.imagen.name }}</span>
                    </div>
                  </label>
                  <input type="file" id="mcimg" class="d-none" accept="image/jpeg,image/png,image/jpg,image/webp" @change="e => { editFiles.imagen = e.target.files?.[0]; generatePreviews(e.target.files, 'imagen') }" />
                  
                  <div class="mt-2" v-if="localPreviews.imagen?.length || (editImages && editImages.length)">
                    <small class="text-muted">Vista previa:</small>
                    <div class="d-flex flex-wrap gap-2 mt-1">
                      <div v-if="localPreviews.imagen?.length" class="img-preview-wrapper">
                        <img :src="localPreviews.imagen[0]" class="img-thumbnail-sm border-primary" />
                      </div>
                      <div v-else-if="editImages?.length" class="img-preview-wrapper">
                        <img :src="getS3ImageUrl(editImages[0]?.image || editImages[0]?.url).replace(/([^:]\/)\/+/g, '$1')" class="img-thumbnail-sm" referrerpolicy="no-referrer" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group mt-3">
                  <label>Banner para Landing Page <span class="text-danger">*</span></label>
                  <label for="mc2Banner" class="custom-file-upload" :class="{ 'has-file': editFiles.landing_banner }">
                    <div class="upload-icon-wrapper">
                      <ImageIcon v-if="!editFiles.landing_banner" class="upload-icon" />
                      <CheckCircle2 v-else class="upload-icon success" />
                    </div>
                    <div class="upload-text">
                      <span v-if="!editFiles.landing_banner"><strong>Haz clic para subir</strong> banner panorámico (16:9)</span>
                      <span v-else class="file-name">{{ editFiles.landing_banner.name }}</span>
                    </div>
                  </label>
                  <input type="file" id="mc2Banner" class="d-none" accept="image/jpeg,image/png,image/jpg" @change="e => { editFiles.landing_banner = e.target.files[0]; generatePreviews([e.target.files[0]], 'landing_banner') }" />
                  
                  <div class="mt-2" v-if="localPreviews.landing_banner?.length || editTarget?.landing_banner">
                    <small class="text-muted">Vista previa:</small>
                    <div class="d-flex flex-wrap gap-2 mt-1">
                      <div class="img-preview-wrapper" style="width: 160px; height: 90px;">
                        <img :src="localPreviews.landing_banner?.[0] || getS3ImageUrl(editTarget.landing_banner)" class="img-thumbnail-sm border-primary" style="object-fit: cover; width: 100%; height: 100%;" referrerpolicy="no-referrer" />
                      </div>
                    </div>
                  </div>
                </div>

                <h4 class="fw-bolder text-success mt-5 mb-4 border-bottom border-success pb-3 d-flex align-items-center form-section-title" style="letter-spacing: 0.5px; font-size: 1.25rem;"><MessageSquare :size="22" class="me-2"/> Prueba Social & FAQs</h4>
                
                <details class="custom-accordion mb-3">
                  <summary class="accordion-header rounded bg-dark p-2 border border-secondary" style="cursor: pointer;">
                    <span class="fw-semibold">Testimonios <span class="text-danger">*</span> <small class="text-muted fw-normal">(mínimo 2)</small></span>
                  </summary>
                  <div class="accordion-body p-3 border border-top-0 border-secondary rounded-bottom" style="background: var(--card-bg, #1a1a1a);">
                    <div v-for="(t, i) in editForm.testimonials" :key="'t-mc2-'+i" class="border rounded p-2 mb-2" style="background: rgba(0,0,0,0.2);">
                      <small class="text-muted">Testimonio {{ i + 1 }}</small>
                      <input type="text" class="form-control mb-1 mt-1" :placeholder="'Nombre del autor ' + (i+1)" v-model="t.author_name" />
                      <textarea class="form-control" rows="2" placeholder="¿Qué dijo sobre el mini-curso?" v-model="t.content"></textarea>
                    </div>
                    <div class="d-flex mt-2">
                      <button type="button" class="btn-primary-custom" @click="editForm.testimonials.push({ author_name: '', content: '' })"><Plus :size="22" class="me-2"/> Añadir testimonio</button>
                      <button type="button" class="btn-danger-custom ms-2" v-if="editForm.testimonials?.length > 2" @click="editForm.testimonials.pop()"><X :size="22" class="me-2"/> Quitar último</button>
                    </div>
                  </div>
                </details>

                <details class="custom-accordion mb-2">
                  <summary class="accordion-header rounded bg-dark p-2 border border-secondary" style="cursor: pointer;">
                    <span class="fw-semibold">Preguntas Frecuentes (FAQ) <span class="text-danger">*</span> <small class="text-muted fw-normal">(mínimo 3)</small></span>
                  </summary>
                  <div class="accordion-body p-3 border border-top-0 border-secondary rounded-bottom" style="background: var(--card-bg, #1a1a1a);">
                    <div v-for="(f, i) in editForm.faqs" :key="'faq-mc2-'+i" class="border rounded p-2 mb-2" style="background: rgba(0,0,0,0.2);">
                      <small class="text-muted">Pregunta {{ i + 1 }}</small>
                      <input type="text" class="form-control mb-1 mt-1" :placeholder="'Pregunta ' + (i + 1)" v-model="f.question" />
                      <textarea class="form-control" rows="2" placeholder="Respuesta" v-model="f.answer"></textarea>
                    </div>
                    <div class="d-flex mt-2">
                      <button type="button" class="btn-primary-custom" @click="editForm.faqs.push({ question: '', answer: '' })"><Plus :size="22" class="me-2"/> Añadir FAQ</button>
                      <button type="button" class="btn-danger-custom ms-2" v-if="editForm.faqs?.length > 3" @click="editForm.faqs.pop()"><X :size="22" class="me-2"/> Quitar último</button>
                    </div>
                  </div>
                </details>

              </div>
              
              <!-- DERECHA: Vista Previa en Vivo -->
              <div class="p-4" style="flex: 1 1 40%; min-width: 350px; background-color: var(--card-bg, #141414); display: flex; flex-direction: column;">
                <h4 class="text-uppercase text-success mt-5 mb-4 form-section-title"><Monitor :size="22" class="me-2"/> Vista Previa en Vivo</h4>
                <div style="flex-grow: 1; display: flex; flex-direction: column;">
                  <div style="border: 1px solid var(--border-color, #333); border-radius: 8px; overflow: hidden; background: #000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); flex-grow: 1; display: flex; flex-direction: column;">
                    <!-- Browser Header -->
                    <div style="background: #1a1a1a; padding: 10px 15px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #333;">
                      <span style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56;"></span>
                      <span style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e;"></span>
                      <span style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f;"></span>
                      <div style="flex-grow: 1; text-align: center;">
                        <div style="display: inline-block; background: #0a0a0a; color: #888; font-size: 11px; padding: 2px 20px; border-radius: 12px; letter-spacing: 0.5px;">preview.promolider.org</div>
                      </div>
                    </div>
                    <!-- Iframe Content -->
                    <iframe :srcdoc="livePreviewHtml" frameborder="0" style="width: 100%; flex-grow: 1; min-height: 500px; background: white; display: block;"></iframe>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
        <div class="card-footer bg-dark border-top border-secondary p-3 d-flex justify-content-end gap-3">
          <button type="button" class="btn-cancel" @click="closeEditModals">Cancelar</button>
          <button type="submit" class="btn-primary-custom" @click="submitEditMiniCurso" :disabled="editLoading">
            <Loader2 v-if="editLoading" :size="16" class="spinner-inline me-2" /> 
            <Save v-else :size="16" class="me-2" />
            Actualizar Mini Curso
          </button>
        </div>
      </div>
    </div>

    <!-- ===================== DELETE MODAL ===================== -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-card" style="max-width:400px">
        <div class="modal-header"><h5 class="modal-title"><AlertTriangle :size="18" /> Eliminar</h5><button class="close-btn" @click="showDeleteModal = false"><X :size="20" /></button></div>
        <div class="modal-body">
          <p>¿Seguro que deseas eliminar <strong>{{ deleteTarget?.nombre || deleteTarget?.title }}</strong>?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn-danger-custom" @click="confirmDelete" :disabled="deleting">
            <Loader2 v-if="deleting" :size="14" class="spinner-inline" /> Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- ===================== STATUS MODAL ===================== -->
    <div v-if="showStatusModal" class="modal-overlay">
      <div class="modal-card" style="max-width:400px">
        <div class="modal-header"><h5 class="modal-title"><ToggleLeft :size="18" /> Cambiar estado</h5><button class="close-btn" @click="showStatusModal = false"><X :size="20" /></button></div>
        <div class="modal-body">
          <p>Nuevo estado para <strong>{{ statusTarget?.nombre || statusTarget?.title }}</strong></p>
          <select class="form-control" v-model="newStatus">
            <option value="" disabled>-- Seleccione un estado --</option>
            <option value="0">No publicado</option>
            <option value="1">Publicado</option>
            <option value="2">Privado</option>
          </select>
          <div class="mt-2" v-if="newStatus !== ''">
            <div class="alert-status" :class="getAlertClass(parseInt(newStatus))">
              <strong>{{ getEstadoLabelRaw(parseInt(newStatus)) }}</strong>
              <p class="mb-0 mt-1 small">{{ getStatusDescription(parseInt(newStatus)) }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showStatusModal = false">Cancelar</button>
          <button class="btn-primary-custom" @click="confirmStatusChange" :disabled="statusLoading || newStatus === ''">
            <Loader2 v-if="statusLoading" :size="14" class="spinner-inline" /> Cambiar Estado
          </button>
        </div>
      </div>
    </div>

    <!-- ===================== INVITATION MODAL ===================== -->
    <div v-if="showInviteModal" class="modal-overlay">
      <div class="modal-card" @click.stop>
        <div class="modal-header"><h5 class="modal-title"><Link :size="18" /> Invitar a {{ inviteTarget?.tipo || inviteTarget?.type }}: <u>{{ inviteTarget?.nombre || inviteTarget?.title }}</u></h5><button class="close-btn" @click="closeInviteModal"><X :size="20" /></button></div>
        <div class="modal-body">
          <div v-if="inviteLoading" class="loading-state py-3"><Loader2 class="spinner" :size="28" /><p>Verificando estado...</p></div>

          <!-- No registrado aún -->
          <div v-else-if="!invitationData.isRegistered" class="alert alert-warning">
            <h6><AlertTriangle :size="16" /> No disponible</h6>
            <p>Debes registrar/comprar esta herramienta antes de poder invitar a otros.</p>
          </div>

          <!-- Registrado, verificar link existente -->
          <div v-else>
            <!-- Ya existe un link -->
            <div v-if="invitationData.existInvitation && !invitationData.newLink" class="alert alert-info">
              <h6><Info :size="16" /> Link de Invitación Activo</h6>
              <p>Ya tienes un link de invitación activo para esta herramienta.</p>
              <div class="input-suffix">
                <input type="text" class="form-control" :value="invitationData.invitationLink" readonly @focus="$event.target.select()" />
                <button class="btn-suffix" @click="copyInviteLink(invitationData.invitationLink)"><Copy :size="16" /></button>
              </div>
            </div>

            <!-- No hay link, crear uno -->
            <div v-if="!invitationData.existInvitation && !invitationData.newLink" class="alert alert-warning">
              <h6><AlertTriangle :size="16" /> Crear Link de Invitación</h6>
              <p>No tienes un link de invitación activo.</p>
              <button class="stats-tab-btn mt-2" @click="generateInviteLink" :disabled="generatingLink">
                <Loader2 v-if="generatingLink" :size="14" class="spinner-inline" />
                <Plus v-else :size="14" /> Crear Link de Invitación
              </button>
            </div>

            <!-- Link recién creado -->
            <div v-if="invitationData.newLink" class="alert alert-success mt-2">
              <h6><CheckCircle2 :size="16" /> Link Creado Exitosamente</h6>
              <p>Válido por 7 días.</p>
              <div class="input-suffix">
                <input type="text" class="form-control" :value="invitationData.newLink" readonly @focus="$event.target.select()" />
                <button class="btn-suffix" @click="copyInviteLink(invitationData.newLink)"><Copy :size="16" /></button>
              </div>
            </div>

            <!-- Compartir via redes -->
            <div v-if="invitationData.existInvitation || invitationData.newLink" class="mt-3">
              <label class="font-weight-bold small">Compartir vía:</label>
              <div class="share-buttons d-flex flex-wrap gap-2 mt-2">
                <a :href="getWhatsappShareUrl()" target="_blank" class="btn-share btn-share-wa">
                  <MessageCircle :size="16" /> WhatsApp
                </a>
                <a :href="getFacebookShareUrl()" target="_blank" class="btn-share btn-share-fb">
                  <Facebook :size="16" /> Facebook
                </a>
                <button class="btn-share btn-share-copy" @click="copyInviteLink(getCurrentInvitationLink())">
                  <Copy :size="16" /> Copiar Link
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeInviteModal">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- ===================== TOAST ===================== -->
    <Transition name="toast-slide">
      <div class="toast-notification" v-if="toast">
        <div class="toast-icon"><CheckCircle2 v-if="toast.type === 'success'" :size="20" class="text-green" /><AlertCircle v-else :size="20" class="text-red" /></div>
        <div class="toast-content">
          <h4>{{ toast.title }}</h4>
          <p>{{ toast.message }}</p>
        </div>
        <button class="toast-close" @click="toast = null"><X :size="16" /></button>
      </div>
    </Transition>
    <ToolUsagesModal 
      v-if="showingUsages" 
      :item="selectedToolForUsages" 
      @close="showingUsages = false" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketingStore } from '../stores/marketingStore'
import { formatDate } from '@/utils/formatDate'
import apiClient from '@/services/apiClient'
import {
  Plus, Zap, Loader2, Search, AlertTriangle, X, Link, Copy, ToggleLeft, MousePointerClick,
  CheckCircle2, AlertCircle, Edit3, Info, MessageCircle, Facebook, Megaphone, ArrowLeft, Save,
  Mail, Instagram, Settings, Share2, Book, MonitorPlay, Eye, Monitor, Box, Download,
  Image as ImageIcon, FileText, UploadCloud, Trash2, Layers, Users, Calendar, Tag, MessageSquare
} from 'lucide-vue-next'
import { infoproductService } from '@/features/infoproducts/services/infoproductService'
import { generateCourseTemplate } from '@/features/marketing/utils/templateGenerators'
import ToolUsagesModal from '../components/ToolUsagesModal.vue'

const router = useRouter()
const store = useMarketingStore()

const courses = ref([])
const loadingCourses = ref(false)
const selectedCourseId = ref(null)
const selectedCourse = ref(null)

const loading = ref(false)
const searchQuery = ref('')
const perPage = ref(10)
const currentPage = ref(1)
const actionSelect = ref('')
const toast = ref(null)

const showingUsages = ref(false)
const selectedToolForUsages = ref(null)

const STORAGE_URL = import.meta.env.VITE_APP_STORAGE_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '/storage') : 'http://localhost:8000/storage');

function getCourseImage(course) {
  const getS3Url = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) {
      return url.replace('s3.sa-east-1', 's3-accelerate');
    }
    return `https://promolider-storage-user.s3-accelerate.amazonaws.com/${url}`;
  };

  if (course.url_portada) return getS3Url(course.url_portada);
  if (course.path_url) return getS3Url(course.path_url);
  return '/img_mantenimiento.png'; // Default image
}

function getS3ImageUrl(url) {
  console.log('[DEBUG getS3ImageUrl] URL original recibida:', url);
  if (!url || typeof url !== 'string') {
    console.log('[DEBUG getS3ImageUrl] URL inválida, devolviendo fallback');
    return '/img_mantenimiento.png';
  }
  let finalUrl = url;
  if (url.startsWith('http')) {
    finalUrl = url.replace('s3.sa-east-1', 's3-accelerate');
  } else {
    let cleanPath = url.replace(/\/+/g, '/').replace(/^\//, '');
    finalUrl = `https://promolider-storage-user.s3-accelerate.amazonaws.com/${cleanPath}`;
  }
  console.log('[DEBUG getS3ImageUrl] URL final construida:', finalUrl);
  return finalUrl;
}

// ─── Tipos y utilidades ───────────────────────────────────────────────

const TYPE_CONFIG = {
  masterclass: { label: 'Masterclass', color: '#20e205', class: 'badge-green' },
  ebook: { label: 'E-book', color: '#00d0e4', class: 'badge-blue' },
  'mini-course': { label: 'Mini Curso', color: '#ffc107', class: 'badge-orange' },
  minicourse: { label: 'Mini Curso', color: '#ffc107', class: 'badge-orange' },
  'material-publicitario': { label: 'Material', color: '#ff9800', class: 'badge-orange' },
}

function getTipoSlug(item) {
  const tipo = item.tipo || item.type || ''
  const lower = tipo.toLowerCase()
  if (lower.includes('masterclass') || lower === 'masterclass') return 'masterclass'
  if (lower.includes('ebook') || lower === 'ebook') return 'ebook'
  if (lower.includes('mini') || lower === 'minicourse' || lower === 'mini-course') return 'minicourse'
  if (lower.includes('material') || lower === 'material-publicitario') return 'material-publicitario'
  return 'masterclass'
}

function getTipoLabel(item) {
  const slug = getTipoSlug(item)
  return TYPE_CONFIG[slug]?.label || item.tipo || item.type || 'Desconocido'
}

function getTipoClass(item) {
  const slug = getTipoSlug(item)
  return TYPE_CONFIG[slug]?.class || ''
}

function getTipoStyle(item) {
  const slug = getTipoSlug(item)
  const color = TYPE_CONFIG[slug]?.color
  return color ? { color, fontWeight: '600' } : {}
}

function getEstadoLabel(item) {
  const estado = item.estado !== undefined ? item.estado : item.status
  if (estado === 1) return 'Publicado'
  if (estado === 0) return 'No publicado'
  if (estado === 2) return 'Privado'
  return 'Desconocido'
}

function getEstadoLabelRaw(estado) {
  if (estado === 1) return 'Publicado'
  if (estado === 0) return 'No publicado'
  if (estado === 2) return 'Privado'
  return 'Desconocido'
}

function getEstadoClass(item) {
  const estado = item.estado !== undefined ? item.estado : item.status
  if (estado === 1) return 'badge-green'
  if (estado === 0) return 'badge-gray'
  if (estado === 2) return 'badge-orange'
  return ''
}

function getAlertClass(estado) {
  const classes = { 0: 'alert-secondary', 1: 'alert-success', 2: 'alert-warning' }
  return classes[estado] || 'alert-info'
}

function getStatusDescription(estado) {
  const descriptions = {
    0: 'La herramienta no estará visible para nadie. Estado de borrador.',
    1: 'La herramienta será visible públicamente en el marketplace.',
    2: 'Solo los distribuidores autorizados podrán acceder a esta herramienta.'
  }
  return descriptions[estado] || ''
}

// ─── Computed ─────────────────────────────────────────────────────────

const filteredTools = computed(() => {
  let result = [...store.tools]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(t =>
      (t.nombre || t.title || '').toLowerCase().includes(q) ||
      (t.category_name || t.category?.name || '').toLowerCase().includes(q) ||
      (t.tipo || t.type || '').toLowerCase().includes(q)
    )
  }
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTools.value.length / perPage.value)))
const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredTools.value.slice(start, start + perPage.value)
})

watch(searchQuery, () => { currentPage.value = 1 })
watch(perPage, () => { currentPage.value = 1 })

// ─── Toast ────────────────────────────────────────────────────────────

function showToast(title, message, type = 'success') {
  toast.value = { title, message, type }
  setTimeout(() => { toast.value = null }, 3500)
}

// ─── Crear herramienta ───────────────────────────────────────────────

function createTool(type) {
  const routes = {
    Masterclass: '/marketing/masterclass/crear',
    'Mini-Curso': '/marketing/mini-course/crear',
    'E-book': '/marketing/ebook/crear',
    Dinamica: '/marketing/dinamica/crear',
    'Material Publicitario': '/marketing/material-publicitario/crear',
  }
  const baseRoute = routes[type]
  if (baseRoute) {
    const fullRoute = `${baseRoute}?course_id=${selectedCourseId.value}`
    const exists = router.getRoutes().some(r => r.path === baseRoute)
    if (exists) router.push(fullRoute)
    else showToast('Próximamente', `Creación de ${type.toLowerCase()} próximamente`, 'error')
  }
}

function showToolUsages(item) {
  selectedToolForUsages.value = item
  showingUsages.value = true
}

// ─── Action handling ───────────────────────────────────────────────────

function handleAction(item, action) {
  if (!action) return
  
  switch (action) {
    case 'edit': editTool(item); break
    case 'modules': viewModules(item); break
    case 'status': openStatusModal(item); break
    case 'delete': openDeleteModal(item); break
    case 'invite': openInviteModal(item); break
  }
}

// ─── Módulos y Clases (solo Mini Curso) ──────────────────────────────

function viewModules(item) {
  router.push({ name: 'marketing-minicourse-modules', params: { id: item.id } })
}

// ─── Editar Herramienta ──────────────────────────────────────────────

const showEditMasterclassModal = ref(false)
const showEditEbookModal = ref(false)
const showEditMiniModal = ref(false)
const isEditingTool = computed(() => showEditMasterclassModal.value || showEditEbookModal.value || showEditMiniModal.value)

const livePreviewHtml = computed(() => {
  if (!isEditingTool.value) return '';
  
  let mappedCourse = {};
  
  const getCategoryName = (categoryId) => {
    if (!categoryId) return null;
    const cat = store.categories?.find(c => c.id == categoryId);
    return cat ? cat.name : null;
  };
  
  if (showEditMasterclassModal.value) {
    let obsRaw = editForm.value.objectives;
    let obs = typeof obsRaw === 'string' ? obsRaw.split('\n').filter(o => o.trim()) : (obsRaw || []);
    
    let currentImg = localPreviews.value.images?.[0] 
      || (editImages.value?.length ? (editImages.value[0]?.image || editImages.value[0]?.url) : null)
      || editTarget.value?.image_url 
      || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1950&q=80';
      
    if (currentImg && !currentImg.startsWith('http') && !currentImg.startsWith('blob:')) {
      currentImg = getS3ImageUrl(currentImg);
    }
      
    mappedCourse = {
      title: editForm.value.title || editTarget.value?.title || 'Título de la Masterclass',
      description: editForm.value.description || editTarget.value?.description || 'Añade una descripción impactante aquí.',
      objectives: obs,
      category_name: getCategoryName(editForm.value.id_categories) || editTarget.value?.category?.name || editTarget.value?.category_name || 'Desarrollo Web',
      landing_banner: localPreviews.value.landing_banner?.[0] || editTarget.value?.landing_banner || '',
      images: [{ image: currentImg }],
      testimonials: editForm.value.testimonials || [],
      faqs: editForm.value.faqs || []
    };
  } else if (showEditEbookModal.value) {
    let currentImg = localPreviews.value.portada?.[0] 
      || (editImages.value?.length ? (editImages.value[0]?.image || editImages.value[0]?.url) : null)
      || editTarget.value?.cover_url 
      || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1950&q=80';
      
    if (currentImg && !currentImg.startsWith('http') && !currentImg.startsWith('blob:')) {
      currentImg = getS3ImageUrl(currentImg);
    }

    mappedCourse = {
      title: editForm.value.titulo || editTarget.value?.title || 'Título del E-book',
      description: editForm.value.descripcion || editTarget.value?.description || 'Descripción asombrosa de tu E-book.',
      category_name: getCategoryName(editForm.value.categoria) || editTarget.value?.category?.name || editTarget.value?.category_name || 'Categoría',
      landing_banner: localPreviews.value.landing_banner?.[0] || editTarget.value?.landing_banner || '',
      images: [{ image: currentImg }],
      testimonials: editForm.value.testimonials || [],
      faqs: editForm.value.faqs || []
    };
  } else if (showEditMiniModal.value) {
    let currentImg = localPreviews.value.imagen?.[0] 
      || (editImages.value?.length ? (editImages.value[0]?.image || editImages.value[0]?.url) : null)
      || editTarget.value?.image_url 
      || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1950&q=80';
      
    if (currentImg && !currentImg.startsWith('http') && !currentImg.startsWith('blob:')) {
      currentImg = getS3ImageUrl(currentImg);
    }

    mappedCourse = {
      title: editForm.value.titulo || editTarget.value?.title || 'Título del Mini Curso',
      description: editForm.value.descripcion || editTarget.value?.description || 'Aprende rápido con este mini curso.',
      category_name: getCategoryName(editForm.value.categoria) || editTarget.value?.category?.name || editTarget.value?.category_name || 'Categoría',
      landing_banner: localPreviews.value.landing_banner?.[0] || editTarget.value?.landing_banner || '',
      images: [{ image: currentImg }],
      testimonials: editForm.value.testimonials || [],
      faqs: editForm.value.faqs || []
    };
  }
  
  return generateCourseTemplate('dark-pro', mappedCourse, 'tu-usuario');
})

const editTarget = ref(null)
const editLoading = ref(false)
const editForm = ref({})
const editImages = ref([])
const editFiles = ref({})
const localPreviews = ref({
  images: [],
  portada: [],
  imagen: []
})

function generatePreviews(files, type) {
  // Limpiar previas anteriores para liberar memoria
  if (localPreviews.value[type]) {
    localPreviews.value[type].forEach(url => URL.revokeObjectURL(url))
  }
  
  if (!files || files.length === 0) {
    localPreviews.value[type] = []
    return
  }
  
  localPreviews.value[type] = Array.from(files).map(file => URL.createObjectURL(file))
}

function closeEditModals() {
  showEditMasterclassModal.value = false
  showEditEbookModal.value = false
  showEditMiniModal.value = false
  editTarget.value = null
  editForm.value = {}
  editImages.value = []
  editFiles.value = {}
  
  // Limpiar object URLs
  Object.keys(localPreviews.value).forEach(key => {
    localPreviews.value[key].forEach(url => URL.revokeObjectURL(url))
    localPreviews.value[key] = []
  })
}

async function editTool(item) {
  const type = getTipoSlug(item)
  
  if (type === 'material-publicitario') {
    // Redirigir a la vista de creación/edición de materiales
    router.push(`/marketing/material-publicitario/crear?course_id=${item.id || selectedCourseId.value}`)
    return
  }

  editTarget.value = item
  editLoading.value = true

  try {
    const resp = await store.fetchToolById(item.id, type)
    const data = resp?.data || resp

    if (type === 'masterclass') {
      editForm.value = {
        title: data.title || '',
        id_categories: data.id_categories || data.category_id || '',
        description: data.description || '',
        objectives: data.objectives || data.objective || '',
        date: data.date || '',
        email_contact: data.email_contact || '',
        phone_contact: data.phone_contact || '',
        meeting_link: data.meeting_link || '',
        testimonials: data.testimonials?.length >= 2
          ? data.testimonials.map(t => ({ author_name: t.author_name, content: t.content }))
          : [
              { author_name: data.testimonials?.[0]?.author_name || '', content: data.testimonials?.[0]?.content || '' },
              { author_name: data.testimonials?.[1]?.author_name || '', content: data.testimonials?.[1]?.content || '' },
            ],
        faqs: data.faqs?.length >= 3
          ? data.faqs.map(f => ({ question: f.question, answer: f.answer }))
          : [
              { question: data.faqs?.[0]?.question || '', answer: data.faqs?.[0]?.answer || '' },
              { question: data.faqs?.[1]?.question || '', answer: data.faqs?.[1]?.answer || '' },
              { question: data.faqs?.[2]?.question || '', answer: data.faqs?.[2]?.answer || '' },
            ],
      }
      console.log('[DEBUG editTool] Masterclass cargada, data.images:', data.images);
      editImages.value = data.images || []
      console.log('[DEBUG editTool] editImages asignado:', editImages.value);
      showEditMasterclassModal.value = true
    } else if (type === 'ebook') {
      editForm.value = {
        titulo: data.title || '',
        autor: data.author || '',
        categoria: data.category_id || '',
        precio: data.price || '',
        paginas: data.pages || '',
        descripcion: data.description || '',
        capitulos: data.chapters?.length ? data.chapters.map(c => ({
          titulo: c.title || '',
          contenido: c.content || '',
          paginas: c.pages || ''
        })) : [{ titulo: '', contenido: '', paginas: '' }],
        testimonials: data.testimonials?.length >= 2
          ? data.testimonials.map(t => ({ author_name: t.author_name, content: t.content }))
          : [
              { author_name: data.testimonials?.[0]?.author_name || '', content: data.testimonials?.[0]?.content || '' },
              { author_name: data.testimonials?.[1]?.author_name || '', content: data.testimonials?.[1]?.content || '' },
            ],
        faqs: data.faqs?.length >= 3
          ? data.faqs.map(f => ({ question: f.question, answer: f.answer }))
          : [
              { question: data.faqs?.[0]?.question || '', answer: data.faqs?.[0]?.answer || '' },
              { question: data.faqs?.[1]?.question || '', answer: data.faqs?.[1]?.answer || '' },
              { question: data.faqs?.[2]?.question || '', answer: data.faqs?.[2]?.answer || '' },
            ],
      }
      editImages.value = data.images || []
      showEditEbookModal.value = true
    } else if (type === 'minicourse' || type === 'mini-course') {
      editForm.value = {
        titulo: data.title || '',
        descripcion: data.description || '',
        duracion: data.duration || '',
        nivel: data.level || '',
        categoria: data.category_id || '',
        testimonials: data.testimonials?.length >= 2
          ? data.testimonials.map(t => ({ author_name: t.author_name, content: t.content }))
          : [
              { author_name: data.testimonials?.[0]?.author_name || '', content: data.testimonials?.[0]?.content || '' },
              { author_name: data.testimonials?.[1]?.author_name || '', content: data.testimonials?.[1]?.content || '' },
            ],
        faqs: data.faqs?.length >= 3
          ? data.faqs.map(f => ({ question: f.question, answer: f.answer }))
          : [
              { question: data.faqs?.[0]?.question || '', answer: data.faqs?.[0]?.answer || '' },
              { question: data.faqs?.[1]?.question || '', answer: data.faqs?.[1]?.answer || '' },
              { question: data.faqs?.[2]?.question || '', answer: data.faqs?.[2]?.answer || '' },
            ],
      }
      editImages.value = data.images || []
      showEditMiniModal.value = true
    }
  } catch (error) {
    showToast('Error', 'No se pudo cargar la información', 'error')
  } finally {
    editLoading.value = false
  }
}

async function submitEditMasterclass() {
  editLoading.value = true
  try {
    const fd = new FormData()
    fd.append('_method', 'PUT')
    const { testimonials, faqs, ...rest } = editForm.value
    Object.entries(rest).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v) })
    fd.append('testimonials', JSON.stringify(testimonials || []))
    fd.append('faqs', JSON.stringify(faqs || []))
    if (editFiles.value.images?.length) {
      Array.from(editFiles.value.images).forEach(f => fd.append('images[]', f))
    }
    if (editFiles.value.landing_banner) {
      fd.append('landing_banner', editFiles.value.landing_banner)
    }
    await store.updateTool(editTarget.value.id, 'masterclass', fd)
    closeEditModals()
    showToast('Actualizado', 'Masterclass actualizada correctamente')
  } catch {
    showToast('Error', 'No se pudo actualizar la masterclass', 'error')
  } finally { editLoading.value = false }
}

async function submitEditEbook() {
  editLoading.value = true
  try {
    const fd = new FormData()
    fd.append('_method', 'PUT')
    fd.append('title', editForm.value.titulo)
    fd.append('description', editForm.value.descripcion)
    fd.append('price', editForm.value.precio || 0)
    fd.append('author', editForm.value.autor)
    fd.append('category_id', editForm.value.categoria)
    fd.append('pages', editForm.value.paginas)
    editForm.value.capitulos.forEach((cap, i) => {
      fd.append(`chapters[${i}][title]`, cap.titulo)
      fd.append(`chapters[${i}][content]`, cap.contenido)
      fd.append(`chapters[${i}][pages]`, cap.paginas)
    })
    fd.append('testimonials', JSON.stringify(editForm.value.testimonials || []))
    fd.append('faqs', JSON.stringify(editForm.value.faqs || []))
    if (editFiles.value.portada) fd.append('cover', editFiles.value.portada)
    if (editFiles.value.archivo_pdf) fd.append('pdf', editFiles.value.archivo_pdf)
    if (editFiles.value.landing_banner) fd.append('landing_banner', editFiles.value.landing_banner)
    await store.updateTool(editTarget.value.id, 'ebook', fd)
    closeEditModals()
    showToast('Actualizado', 'E-book actualizado correctamente')
  } catch {
    showToast('Error', 'No se pudo actualizar el e-book', 'error')
  } finally { editLoading.value = false }
}

async function submitEditMiniCurso() {
  editLoading.value = true
  try {
    const fd = new FormData()
    fd.append('_method', 'PUT')
    fd.append('title', editForm.value.titulo)
    fd.append('description', editForm.value.descripcion)
    fd.append('duration', editForm.value.duracion)
    fd.append('level', editForm.value.nivel)
    fd.append('category_id', editForm.value.categoria)
    if (editFiles.value.imagen) fd.append('image', editFiles.value.imagen)
    if (editFiles.value.landing_banner) fd.append('landing_banner', editFiles.value.landing_banner)
    fd.append('testimonials', JSON.stringify(editForm.value.testimonials || []))
    fd.append('faqs', JSON.stringify(editForm.value.faqs || []))
    await store.updateTool(editTarget.value.id, 'mini-course', fd)
    closeEditModals()
    showToast('Actualizado', 'Mini curso actualizado correctamente')
  } catch {
    showToast('Error', 'No se pudo actualizar el mini curso', 'error')
  } finally { editLoading.value = false }
}

function addChapter() {
  editForm.value.capitulos.push({ titulo: '', contenido: '', paginas: '' })
}

function removeChapter(index) {
  if (editForm.value.capitulos.length > 1) editForm.value.capitulos.splice(index, 1)
}

// ─── Eliminar ────────────────────────────────────────────────────────

const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)

function openDeleteModal(item) { deleteTarget.value = item; showDeleteModal.value = true }
async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await store.deleteTool(deleteTarget.value.id, getTipoSlug(deleteTarget.value))
    showDeleteModal.value = false; deleteTarget.value = null
    showToast('Eliminado', 'Herramienta eliminada correctamente')
  } catch { showToast('Error', 'No se pudo eliminar', 'error') }
  finally { deleting.value = false }
}

// ─── Cambiar Estado ──────────────────────────────────────────────────

const showStatusModal = ref(false)
const statusTarget = ref(null)
const newStatus = ref('')
const statusLoading = ref(false)

function openStatusModal(item) {
  statusTarget.value = item
  newStatus.value = String(item.estado !== undefined ? item.estado : (item.status ?? ''))
  showStatusModal.value = true
}
async function confirmStatusChange() {
  if (!statusTarget.value || newStatus.value === '') return
  statusLoading.value = true
  try {
    await store.changeToolStatus(statusTarget.value.id, newStatus.value, getTipoSlug(statusTarget.value))
    showStatusModal.value = false; statusTarget.value = null; newStatus.value = ''
    showToast('Actualizado', 'Estado cambiado correctamente')
  } catch { showToast('Error', 'No se pudo cambiar el estado', 'error') }
  finally { statusLoading.value = false }
}

// ─── Invitación ──────────────────────────────────────────────────────

const showInviteModal = ref(false)
const inviteTarget = ref(null)
const inviteLoading = ref(false)
const generatingLink = ref(false)
const invitationData = ref({
  isRegistered: false,
  existInvitation: false,
  invitationLink: '',
  newLink: ''
})

function closeInviteModal() {
  showInviteModal.value = false
  inviteTarget.value = null
  invitationData.value = { isRegistered: false, existInvitation: false, invitationLink: '', newLink: '' }
}

async function openInviteModal(item) {
  inviteTarget.value = item
  invitationData.value = { isRegistered: false, existInvitation: false, invitationLink: '', newLink: '' }
  showInviteModal.value = true
  inviteLoading.value = true

  try {
    const type = getTipoSlug(item)
    // 1. Verificar si está registrado/comprado
    const regResp = await store.checkToolRegistration(item.id, type)
    const isRegistered = regResp?.isRegistered || regResp?.isPurchased || false
    invitationData.value.isRegistered = isRegistered

    if (isRegistered) {
      // 2. Verificar si ya existe un link de invitación
      const invResp = await store.checkToolInvitation(item.id, type)
      invitationData.value.existInvitation = invResp?.existInvitation || false
      invitationData.value.invitationLink = invResp?.invitationLink || invResp?.link || ''
    }
  } catch {
    invitationData.value.isRegistered = false
  } finally {
    inviteLoading.value = false
  }
}

async function generateInviteLink() {
  if (!inviteTarget.value) return
  generatingLink.value = true
  try {
    const type = getTipoSlug(inviteTarget.value)
    const resp = await store.createToolInvitation(inviteTarget.value.id, type)
    const link = resp?.link || resp?.data?.link || ''
    if (link) {
      invitationData.value.newLink = link
      invitationData.value.existInvitation = true
      invitationData.value.invitationLink = link
      showToast('Éxito', 'Link de invitación creado exitosamente')
    }
  } catch {
    showToast('Error', 'No se pudo crear el link de invitación', 'error')
  } finally { generatingLink.value = false }
}

function getCurrentInvitationLink() {
  return invitationData.value.newLink || invitationData.value.invitationLink || ''
}

function copyInviteLink(text) {
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copiado', 'Link copiado al portapapeles')
  })
}

function getWhatsappShareUrl() {
  const link = getCurrentInvitationLink()
  const toolName = inviteTarget.value?.nombre || inviteTarget.value?.title || ''
  const toolType = getTipoLabel(inviteTarget.value)
  const text = `¡Hola! Te invito a conocer este increíble ${toolType}: "${toolName}". Regístrate usando mi link de invitación: ${link}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

function getFacebookShareUrl() {
  const link = getCurrentInvitationLink()
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
}

async function fetchCourses() {
  loadingCourses.value = true
  try {
    const response = await infoproductService.getCreatedInfoproducts({ limit: 100, status: 2 })
    courses.value = response.data?.data || response.data || []
  } catch (error) {
    showToast('Error', 'No se pudieron cargar tus cursos', 'error')
  } finally {
    loadingCourses.value = false
  }
}

async function selectCourse(course) {
  selectedCourse.value = course
  selectedCourseId.value = course.id
  loading.value = true
  await store.loadTools(course.id)
  loading.value = false
}

function clearCourseSelection() {
  selectedCourseId.value = null
  selectedCourse.value = null
  store.tools = []
}

onMounted(async () => {
  await fetchCourses()
  await store.loadCategories()
})
</script>

<style scoped>
.marketing-tools-view { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Formularios de edición con Live Preview */
.edit-form-scroll {
  min-height: 70vh;
}
.edit-form-scroll::-webkit-scrollbar {
  width: 6px;
}
.edit-form-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.edit-form-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.form-section-title {
  font-size: 12px;
  letter-spacing: 1px;
  font-weight: 700;
  color: var(--primary-color) !important;
  display: flex;
  align-items: center;
}
.custom-accordion details {
  transition: all 0.3s ease;
}
.custom-accordion summary {
  list-style: none;
  transition: background 0.2s;
}
.custom-accordion summary::-webkit-details-marker {
  display: none;
}
.custom-accordion summary::after {
  content: '▼';
  float: right;
  font-size: 0.8em;
  transition: transform 0.3s;
}
.custom-accordion[open] summary::after {
  transform: rotate(180deg);
}
.custom-accordion[open] summary {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.card-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
}
.create-buttons { display: flex; gap: 6px; flex-wrap: wrap; }
.stats-tab-btn {
  display: inline-flex; align-items: center; gap: 5px;
  background: transparent; border: 1px solid var(--border-color);
  padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.stats-tab-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(24,214,0,0.04); }

.btn-back {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color);
  color: var(--text-main); cursor: pointer; font-size: 13px; font-weight: 600;
  padding: 6px 14px; border-radius: 8px; margin-bottom: 16px;
  transition: all 0.2s;
}
.btn-back:hover {
  background: rgba(24, 214, 0, 0.08); border-color: var(--primary-color);
  color: var(--primary-color);
}

.courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 20px; }
.course-card {
  border: 1px solid var(--border-color); border-radius: 12px;
  background: var(--card-bg); cursor: pointer; transition: all 0.2s;
  text-align: left; overflow: hidden; display: flex; flex-direction: column;
}
.course-card-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-bottom: 1px solid var(--border-color);
}
.course-card-body {
  padding: 16px;
}
.course-card:hover { border-color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.course-title { font-size: 15px; font-weight: 700; color: var(--text-bold); margin-bottom: 4px; margin-top: 0; }
.course-desc { font-size: 13px; color: var(--text-muted); margin: 0; }
.no-courses { padding: 40px; text-align: center; color: var(--text-muted); }
.no-courses p { margin-bottom: 16px; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 40px; color: var(--text-muted); gap: 12px; }
.spinner { animation: spin 1s linear infinite; color: var(--primary-color); }
.spinner-inline { animation: spin 1s linear infinite; display: inline-block; margin-right: 4px; }
@keyframes spin { to { transform: rotate(360deg); } }

.table-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px; margin-bottom: 12px;
}
.show-entries { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
.table-page-select {
  border: 1px solid var(--border-color); border-radius: 6px;
  padding: 4px 8px; font-size: 13px; background: var(--card-bg);
  color: var(--text-main); cursor: pointer;
}
.search-wrapper { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 10px; color: var(--text-light); pointer-events: none; }
.table-search {
  border: 1px solid var(--border-color); border-radius: 8px;
  padding: 7px 12px 7px 34px; font-size: 13px;
  background: var(--card-bg); color: var(--text-main);
  min-width: 220px; transition: border-color 0.2s;
}
.table-search:focus { outline: none; border-color: var(--primary-color); }

.table-responsive { border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); }
.table { width: 100%; border-collapse: collapse; background: var(--card-bg); }
.table thead { background: var(--bg-main); }
.table th {
  padding: 10px 12px; font-size: 0.78rem; font-weight: 700;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px;
  border-bottom: 1px solid var(--border-color); white-space: nowrap;
}
.table td {
  padding: 10px 12px; font-size: 0.85rem; color: var(--text-main);
  border-bottom: 1px solid var(--border-color); vertical-align: middle;
}
.table tbody tr:last-child td { border-bottom: none; }
.table tbody tr:hover { background: rgba(24, 214, 0, 0.03); }
.cell-name { font-weight: 600; }
.cell-dist { text-align: center; font-weight: 600; }

.badge { padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
.badge-green { background: rgba(24, 214, 0, 0.12); color: #166534; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
.badge-blue { background: rgba(24, 119, 242, 0.12); color: #1a56db; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
.badge-orange { background: rgba(245, 158, 11, 0.12); color: #92400e; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
.badge-gray { background: rgba(148, 163, 184, 0.15); color: #64748b; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }

.badge-status { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; display: inline-block; }
.badge-status.badge-green { background: rgba(24, 214, 0, 0.12); color: #166534; }
.badge-status.badge-gray { background: rgba(148, 163, 184, 0.15); color: #64748b; }
.badge-status.badge-orange { background: rgba(245, 158, 11, 0.12); color: #92400e; }

.action-select {
  border: 1px solid var(--border-color); border-radius: 6px;
  padding: 4px 8px; font-size: 12px; background: var(--card-bg);
  color: var(--text-main); cursor: pointer; min-width: 120px;
}

.table-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 12px; flex-wrap: wrap; gap: 8px;
}
.table-footer small { color: var(--text-muted); font-size: 12px; }
.pagination-custom { display: flex; gap: 4px; list-style: none; padding: 0; margin: 0; }
.pagination-custom li a {
  display: flex; align-items: center; justify-content: center;
  min-width: 32px; height: 32px; padding: 0 6px;
  border: 1px solid var(--border-color); border-radius: 6px;
  font-size: 13px; color: var(--text-main); text-decoration: none;
  transition: all 0.2s; background: var(--card-bg);
}
.pagination-custom li a:hover { border-color: var(--primary-color); color: var(--primary-color); }
.pagination-custom li.active a { background: var(--primary-color); border-color: var(--primary-color); color: white; font-weight: 700; }
.pagination-custom li.disabled a { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

/* ─── Modal Overlay ─── */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}
.modal-card {
  background: var(--card-bg); backdrop-filter: blur(16px);
  border: 1px solid var(--border-color); border-radius: 12px;
  width: 90%; max-width: 500px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: slideUp 0.3s ease-out;
}
.modal-lg-wide { max-width: 1000px; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--border-color);
}
.modal-title {
  font-size: 15px; font-weight: 700; color: var(--text-bold);
  display: flex; align-items: center; gap: 8px; margin: 0;
}
.close-btn {
  background: none; border: none; color: var(--text-light);
  cursor: pointer; padding: 6px; border-radius: 6px;
  display: flex; transition: all 0.2s;
}
.close-btn:hover { background: var(--bg-main); color: var(--danger-color); }
.modal-body { padding: 20px; max-height: 70vh; overflow-y: auto; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 0 20px 20px;
}
.btn-cancel {
  background: transparent; border: 1px solid var(--border-color);
  padding: 8px 16px; border-radius: 8px; font-size: 13px;
  font-weight: 500; color: var(--text-main); cursor: pointer; transition: all 0.2s;
}
.btn-cancel:hover { background: var(--bg-main); }
.btn-danger-custom {
  background: var(--danger-color); color: white; border: none;
  padding: 8px 16px; border-radius: 8px; font-size: 13px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 4px;
}
.btn-danger-custom:hover:not(:disabled) { background: #dc2626; transform: translateY(-1px); }
.btn-danger-custom:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary-custom {
  background: var(--primary-color); color: white; border: none;
  padding: 8px 16px; border-radius: 8px; font-size: 13px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 4px;
}
.btn-primary-custom:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-1px); }
.btn-primary-custom:disabled { opacity: 0.5; cursor: not-allowed; }

.input-suffix { display: flex; }
.input-suffix .form-control { border-radius: 8px 0 0 8px; flex: 1; }
.btn-suffix {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--primary-color); color: white; border: none;
  padding: 8px 14px; border-radius: 0 8px 8px 0; font-size: 12px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-suffix:hover { background: var(--primary-hover); }

.form-group { margin-bottom: 12px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: var(--text-main); }
.form-control {
  width: 100%; padding: 8px 12px; border: 1px solid var(--border-color);
  border-radius: 8px; font-size: 13px; background: var(--card-bg);
  color: var(--text-main); transition: border-color 0.2s;
}
.form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08); }
.form-control-file { display: block; width: 100%; padding: 6px 0; font-size: 13px; }
select.form-control { cursor: pointer; }
textarea.form-control { resize: vertical; }

.img-thumbnail-sm {
  max-height: 80px;
  border-radius: 8px;
  object-fit: contain;
}

/* ────────────────────────────────────────────────────────────────────────
   CUSTOM FILE UPLOAD (Estilos de Crear Curso)
───────────────────────────────────────────────────────────────────────── */
.custom-file-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  border: 2px dashed var(--border-color, #ccc);
  border-radius: 12px;
  background-color: var(--bg-main, #fff);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  margin-top: 8px;
}

.custom-file-upload:hover {
  border-color: var(--primary-color);
  background-color: rgba(24, 214, 0, 0.02);
}

.custom-file-upload.has-file {
  border-color: var(--primary-color);
  background-color: rgba(24, 214, 0, 0.05);
  border-style: solid;
}

.upload-icon-wrapper {
  margin: 0 auto 12px;
  background: var(--card-bg, #f8f9fa);
  padding: 10px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.upload-icon {
  width: 24px;
  height: 24px;
  color: var(--text-muted);
}

.upload-icon.success {
  color: var(--primary-color);
}

.upload-text {
  font-size: 13px;
  color: var(--text-color);
  line-height: 1.5;
}

.upload-text strong {
  color: var(--primary-color);
  font-weight: 700;
}

.file-name {
  font-weight: 600;
  color: var(--text-color);
  word-break: break-all;
}

.d-none {
  display: none !important;
}

.gap-2 { gap: 8px; }
.d-flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }

.bg-light-subtle { background: var(--bg-main); }

.btn-sm-icon {
  background: none; border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 4px; border-radius: 4px;
}
.btn-sm-icon:hover { background: var(--bg-main); }

.alert-status {
  padding: 10px 14px; border-radius: 8px; border: 1px solid;
}
.alert-status.alert-secondary { background: #f8f9fa; border-color: #6c757d; color: #383d41; }
.alert-status.alert-success { background: rgba(24,214,0,0.08); border-color: rgba(24,214,0,0.3); color: #166534; }
.alert-status.alert-warning { background: #fff3cd; border-color: #ffc107; color: #856404; }
.alert-status.alert-info { background: #e8f4fd; border-color: #b6d4fe; color: #0c5460; }

.alert { padding: 12px; border-radius: 8px; }
.alert-warning { background: #fff3cd; border: 1px solid #ffc107; color: #856404; }
.alert-info { background: #e8f4fd; border: 1px solid #b6d4fe; color: #0c5460; }
.alert-success { background: rgba(24,214,0,0.08); border: 1px solid rgba(24,214,0,0.3); color: #166534; }

/* ─── Share Buttons ─── */
.share-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
.btn-share {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; font-size: 12px;
  font-weight: 600; text-decoration: none; cursor: pointer;
  transition: all 0.2s; border: none;
}
.btn-share-wa { background: #25D366; color: white; }
.btn-share-wa:hover { background: #1da851; }
.btn-share-fb { background: #1877F2; color: white; }
.btn-share-fb:hover { background: #166fe5; }
.btn-share-copy { background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); }
.btn-share-copy:hover { background: var(--border-color); }

/* ─── Toast ─── */
.toast-notification {
  position: fixed; bottom: 30px; right: 30px;
  background: var(--card-bg); backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 14px 18px; border-radius: 12px;
  display: flex; align-items: flex-start; gap: 12px;
  z-index: 99999; max-width: 360px;
}
.toast-icon { flex-shrink: 0; display: flex; margin-top: 2px; }
.text-green { color: var(--primary-color); }
.text-red { color: var(--danger-color); }
.toast-content h4 { font-size: 14px; font-weight: 700; color: var(--text-bold); margin-bottom: 2px; }
.toast-content p { font-size: 12px; color: var(--text-muted); line-height: 1.4; }
.toast-close { background: none; border: none; color: var(--text-light); cursor: pointer; padding: 2px; flex-shrink: 0; }
.toast-close:hover { color: var(--text-bold); }
.toast-slide-enter-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from { transform: translateX(100%); opacity: 0; }
.toast-slide-leave-to { transform: scale(0.9); opacity: 0; }

@media (max-width: 768px) {
  .card-header { flex-direction: column; }
  .table-toolbar { flex-direction: column; align-items: stretch; }
  .table-search { min-width: 100%; }
  .toast-notification { bottom: 16px; right: 16px; left: 16px; max-width: none; }
  .modal-lg-wide { max-width: 100%; }
}

/* =========================================================
   NUEVO GRID DE TARJETAS (Dashboard Moderno)
========================================================= */

.dashboard-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.modern-search {
  flex: 1;
  max-width: 400px;
  position: relative;
}

.modern-search .search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.modern-search input {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 10px 15px 10px 40px;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.modern-search input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.results-text {
  font-size: 14px;
  color: var(--text-muted);
}

.empty-state-modern {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px dashed var(--border-color);
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.8;
}

.empty-state-modern h3 {
  color: var(--text-color);
  margin-bottom: 10px;
}

.empty-state-modern p {
  color: var(--text-muted);
  max-width: 400px;
}

.tools-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.tool-card-modern {
  background: var(--card-bg, #1e1e2d);
  border: 1px solid var(--border-color, #2b2b40);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.tool-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.1);
}

.tool-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.tool-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
}

.tool-status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tool-status-badge.badge-green { background: rgba(40, 199, 111, 0.2); color: #28c76f; border: 1px solid rgba(40, 199, 111, 0.3); }
.tool-status-badge.badge-gray { background: rgba(110, 107, 123, 0.2); color: #b9b9c3; border: 1px solid rgba(110, 107, 123, 0.3); }
.tool-status-badge.badge-blue { background: rgba(115, 103, 240, 0.2); color: #7367f0; border: 1px solid rgba(115, 103, 240, 0.3); }

.tool-card-body {
  flex: 1;
  margin-bottom: 20px;
}

.tool-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main, #fff);
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.tool-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.tool-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}
.stat-icon { color: var(--primary-color); }

.tool-actions {
  display: flex;
  gap: 8px;
}

.action-btn-icon {
  background: rgba(255,255,255,0.05);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.action-btn-icon:hover {
  background: rgba(255,255,255,0.15);
}

.action-btn-icon.text-danger:hover {
  background: rgba(234, 84, 85, 0.15);
  color: #ea5455;
}

@media (max-width: 768px) {
  .dashboard-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .modern-search { max-width: 100%; }
}
</style>