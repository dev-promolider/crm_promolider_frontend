<template>
  <div class="marketing-tools-view">
    <div class="view-card">
      <div class="view-card-body">
        <div class="view-header">
          <div>
            <h4 class="view-title">Herramientas de Marketing</h4>
            <span class="view-meta">Gestiona tus herramientas promocionales</span>
          </div>
          <div class="create-buttons">
            <button class="action-btn" @click="createTool('Masterclass')">
              <Plus :size="14" /> Masterclass
            </button>
            <button class="action-btn" @click="createTool('Mini Curso')">
              <Plus :size="14" /> Mini-Curso
            </button>
            <button class="action-btn" @click="createTool('E-book')">
              <Plus :size="14" /> E-book
            </button>
            <button class="action-btn" @click="createTool('Dinamica')">
              <Zap :size="14" /> Dinámica
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-state"><Loader2 class="spinner" :size="36" /><p>Cargando herramientas...</p></div>

        <!-- DataTable -->
        <div v-else>
          <div class="table-toolbar">
            <div class="show-entries">
              <span>Mostrar</span>
              <select class="page-size-select" v-model.number="perPage">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
              <span>registros</span>
            </div>
            <div class="search-wrapper">
              <Search :size="16" class="search-icon" />
              <input type="text" class="search-input" v-model="searchQuery" placeholder="Buscar..." />
            </div>
          </div>

          <div class="table-wrap">
            <table class="tools-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Fecha de registro</th>
                  <th>N° Distribuidores</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in paginatedTools" :key="item.id">
                  <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
                  <td><span class="tipo-badge" :class="getTipoClass(item)" :style="getTipoStyle(item)">{{ getTipoLabel(item) }}</span></td>
                  <td class="cell-name">{{ item.nombre || item.title }}</td>
                  <td>{{ item.category_name || item.category?.name || '-' }}</td>
                  <td>{{ formatDate(item.fecha || item.created_at) }}</td>
                  <td class="cell-dist">{{ item.distribuidores || item.distributors_count || 0 }}</td>
                  <td><span class="status-badge" :class="getEstadoClass(item)">{{ getEstadoLabel(item) }}</span></td>
                  <td>
                    <select class="action-select" :value="actionSelect" @change="handleAction(item, $event)">
                      <option value="">Acciones</option>
                      <option value="edit">Editar</option>
                      <option value="modules" v-if="getTipoSlug(item) === 'minicourse' || getTipoSlug(item) === 'mini-course'">Módulos y Clases</option>
                      <option value="status">Cambiar Estado</option>
                      <option value="delete">Eliminar</option>
                      <option value="invite">Invitación</option>
                    </select>
                  </td>
                </tr>
                <tr v-if="filteredTools.length === 0">
                  <td colspan="8" class="empty-cell">No hay herramientas registradas</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-footer">
            <small class="footer-info">Mostrando {{ filteredTools.length }} registros</small>
            <nav>
              <ul class="pagination-list">
                <li :class="{ disabled: currentPage <= 1 }">
                  <a href="#" @click.prevent="currentPage > 1 && currentPage--">&laquo;</a>
                </li>
                <li v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
                  <a href="#" @click.prevent="currentPage = page">{{ page }}</a>
                </li>
                <li :class="{ disabled: currentPage >= totalPages }">
                  <a href="#" @click.prevent="currentPage < totalPages && currentPage++">&raquo;</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== EDIT MODALS ===================== -->

    <!-- Edit Masterclass Modal -->
    <div v-if="showEditMasterclassModal" class="modal-overlay" @click.self="closeEditModals">
      <div class="modal-card modal-wide" @click.stop>
        <div class="modal-card-header">
          <h5 class="modal-card-title"><Edit3 :size="18" /> Editar Masterclass: <u>{{ editTarget?.nombre || editTarget?.title }}</u></h5>
          <button class="modal-close-btn" @click="closeEditModals"><X :size="20" /></button>
        </div>
        <div class="modal-card-body">
          <form @submit.prevent="submitEditMasterclass">
            <div class="field-row">
              <div class="field-col field-col-8">
                <div class="field-group">
                  <label>Título <span class="required-mark">*</span></label>
                  <input type="text" class="field-input" v-model="editForm.title" required />
                </div>
              </div>
              <div class="field-col field-col-4">
                <div class="field-group">
                  <label>Categoría <span class="required-mark">*</span></label>
                  <select class="field-input" v-model="editForm.id_categories" required>
                    <option value="">Seleccionar</option>
                    <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="field-group">
              <label>Descripción</label>
              <textarea class="field-input" rows="3" v-model="editForm.description"></textarea>
            </div>
            <div class="field-group">
              <label>Objetivos</label>
              <textarea class="field-input" rows="2" v-model="editForm.objective"></textarea>
            </div>
            <div class="field-row">
              <div class="field-col field-col-4">
                <div class="field-group">
                  <label>Fecha</label>
                  <input type="date" class="field-input" v-model="editForm.date" />
                </div>
              </div>
              <div class="field-col field-col-4">
                <div class="field-group">
                  <label>Email de contacto</label>
                  <input type="email" class="field-input" v-model="editForm.email_contact" />
                </div>
              </div>
              <div class="field-col field-col-4">
                <div class="field-group">
                  <label>Teléfono</label>
                  <input type="text" class="field-input" v-model="editForm.phone_contact" />
                </div>
              </div>
            </div>
            <div class="field-group">
              <label>Meeting Link</label>
              <input type="url" class="field-input" v-model="editForm.meeting_link" placeholder="https://zoom.us/j/..." />
            </div>
            <!-- Imágenes actuales -->
            <div v-if="editImages && editImages.length" class="section-spacer">
              <small class="field-hint">Imágenes actuales:</small>
              <div class="image-row">
                <div v-for="(img, i) in editImages" :key="i" class="img-preview-wrap">
                  <img :src="img.image || img.url" class="preview-thumb" />
                </div>
              </div>
            </div>
            <div class="field-row">
              <div class="field-col field-col-6">
                <div class="field-group">
                  <label>Nuevas imágenes</label>
                  <input type="file" class="file-input" multiple accept=".jpg,.jpeg,.png,.webp" @change="e => editFiles.images = e.target.files" />
                </div>
              </div>
              <div class="field-col field-col-6">
                <div class="field-group">
                  <label>Nuevos documentos</label>
                  <input type="file" class="file-input" multiple accept=".pdf,.doc,.docx" @change="e => editFiles.documents = e.target.files" />
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-card-footer">
          <button class="btn-cancel" @click="closeEditModals">Cancelar</button>
          <button class="btn-primary-custom" @click="submitEditMasterclass" :disabled="editLoading">
            <Loader2 v-if="editLoading" :size="14" class="spinner-inline" /> Actualizar Masterclass
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Ebook Modal -->
    <div v-if="showEditEbookModal" class="modal-overlay" @click.self="closeEditModals">
      <div class="modal-card modal-wide" @click.stop>
        <div class="modal-card-header">
          <h5 class="modal-card-title"><Edit3 :size="18" /> Editar E-book: <u>{{ editTarget?.nombre || editTarget?.title }}</u></h5>
          <button class="modal-close-btn" @click="closeEditModals"><X :size="20" /></button>
        </div>
        <div class="modal-card-body">
          <form @submit.prevent="submitEditEbook">
            <div class="field-row">
              <div class="field-col field-col-6">
                <div class="field-group">
                  <label>Título <span class="required-mark">*</span></label>
                  <input type="text" class="field-input" v-model="editForm.titulo" required />
                </div>
              </div>
              <div class="field-col field-col-6">
                <div class="field-group">
                  <label>Autor <span class="required-mark">*</span></label>
                  <input type="text" class="field-input" v-model="editForm.autor" required />
                </div>
              </div>
            </div>
            <div class="field-row">
              <div class="field-col field-col-6">
                <div class="field-group">
                  <label>Categoría <span class="required-mark">*</span></label>
                  <select class="field-input" v-model="editForm.categoria" required>
                    <option value="">Seleccionar</option>
                    <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
              </div>
              <div class="field-col field-col-3">
                <div class="field-group">
                  <label>Precio</label>
                  <input type="number" step="0.01" min="0" class="field-input" v-model="editForm.precio" />
                </div>
              </div>
              <div class="field-col field-col-3">
                <div class="field-group">
                  <label>Páginas</label>
                  <input type="number" min="1" class="field-input" v-model="editForm.paginas" required />
                </div>
              </div>
            </div>
            <div class="field-group">
              <label>Descripción</label>
              <textarea class="field-input" rows="3" v-model="editForm.descripcion" required></textarea>
            </div>
            <!-- Capítulos -->
            <div class="field-group">
              <label>Capítulos</label>
              <div class="chapters-container">
                <div v-for="(cap, i) in editForm.capitulos" :key="i" class="chapter-item">
                  <div class="chapter-header-row">
                    <strong class="chapter-label">Capítulo {{ i + 1 }}</strong>
                    <button type="button" class="icon-btn-danger" @click="removeChapter(i)" v-if="editForm.capitulos.length > 1"><X :size="14" /></button>
                  </div>
                  <div class="field-row">
                    <div class="field-col field-col-8">
                      <input type="text" class="field-input field-input-sm" v-model="cap.titulo" placeholder="Título del capítulo" />
                    </div>
                    <div class="field-col field-col-4">
                      <input type="number" min="1" class="field-input field-input-sm" v-model="cap.paginas" placeholder="Páginas" />
                    </div>
                  </div>
                  <textarea class="field-input field-input-sm" rows="2" v-model="cap.contenido" placeholder="Contenido..."></textarea>
                </div>
                <button type="button" class="add-chapter-button" @click="addChapter">
                  <Plus :size="12" /> Agregar Capítulo
                </button>
              </div>
            </div>
            <div class="field-row">
              <div class="field-col field-col-6">
                <div class="field-group">
                  <label>Nueva portada</label>
                  <input type="file" class="file-input" accept="image/jpeg,image/png,image/jpg,image/webp" @change="e => editFiles.portada = e.target.files?.[0]" />
                  <div v-if="editImages?.length" class="spacer-top-sm"><small class="field-hint">Portada actual:</small><img :src="editImages[0]?.image || editImages[0]?.url" class="preview-thumb preview-block" /></div>
                </div>
              </div>
              <div class="field-col field-col-6">
                <div class="field-group">
                  <label>Nuevo PDF</label>
                  <input type="file" class="file-input" accept=".pdf" @change="e => editFiles.archivo_pdf = e.target.files?.[0]" />
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-card-footer">
          <button class="btn-cancel" @click="closeEditModals">Cancelar</button>
          <button class="btn-primary-custom" @click="submitEditEbook" :disabled="editLoading">
            <Loader2 v-if="editLoading" :size="14" class="spinner-inline" /> Actualizar E-book
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Mini Curso Modal -->
    <div v-if="showEditMiniModal" class="modal-overlay" @click.self="closeEditModals">
      <div class="modal-card modal-wide" @click.stop>
        <div class="modal-card-header">
          <h5 class="modal-card-title"><Edit3 :size="18" /> Editar Mini Curso: <u>{{ editTarget?.nombre || editTarget?.title }}</u></h5>
          <button class="modal-close-btn" @click="closeEditModals"><X :size="20" /></button>
        </div>
        <div class="modal-card-body">
          <form @submit.prevent="submitEditMiniCurso">
            <div class="field-row">
              <div class="field-col field-col-6">
                <div class="field-group">
                  <label>Título <span class="required-mark">*</span></label>
                  <input type="text" class="field-input" v-model="editForm.titulo" required />
                </div>
              </div>
              <div class="field-col field-col-6">
                <div class="field-group">
                  <label>Nivel <span class="required-mark">*</span></label>
                  <select class="field-input" v-model="editForm.nivel" required>
                    <option value="">Seleccionar</option>
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="field-row">
              <div class="field-col field-col-6">
                <div class="field-group">
                  <label>Categoría <span class="required-mark">*</span></label>
                  <select class="field-input" v-model="editForm.categoria" required>
                    <option value="">Seleccionar</option>
                    <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
              </div>
              <div class="field-col field-col-6">
                <div class="field-group">
                  <label>Duración (min) <span class="required-mark">*</span></label>
                  <input type="number" min="1" class="field-input" v-model="editForm.duracion" required />
                </div>
              </div>
            </div>
            <div class="field-group">
              <label>Descripción</label>
              <textarea class="field-input" rows="3" v-model="editForm.descripcion" required></textarea>
            </div>
            <div class="field-group">
              <label>Nueva imagen</label>
              <input type="file" class="file-input" accept=".jpg,.jpeg,.png,.webp" @change="e => editFiles.imagen = e.target.files?.[0]" />
              <div v-if="editImages?.length" class="spacer-top-sm"><small class="field-hint">Imagen actual:</small><img :src="editImages[0]?.image || editImages[0]?.url" class="preview-thumb preview-block" /></div>
            </div>
          </form>
        </div>
        <div class="modal-card-footer">
          <button class="btn-cancel" @click="closeEditModals">Cancelar</button>
          <button class="btn-primary-custom" @click="submitEditMiniCurso" :disabled="editLoading">
            <Loader2 v-if="editLoading" :size="14" class="spinner-inline" /> Actualizar Mini Curso
          </button>
        </div>
      </div>
    </div>

    <!-- ===================== DELETE MODAL ===================== -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-card" style="max-width:400px">
        <div class="modal-card-header"><h5 class="modal-card-title"><AlertTriangle :size="18" /> Eliminar</h5><button class="modal-close-btn" @click="showDeleteModal = false"><X :size="20" /></button></div>
        <div class="modal-card-body">
          <p>¿Seguro que deseas eliminar <strong>{{ deleteTarget?.nombre || deleteTarget?.title }}</strong>?</p>
        </div>
        <div class="modal-card-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn-danger-custom" @click="confirmDelete" :disabled="deleting">
            <Loader2 v-if="deleting" :size="14" class="spinner-inline" /> Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- ===================== STATUS MODAL ===================== -->
    <div v-if="showStatusModal" class="modal-overlay" @click.self="showStatusModal = false">
      <div class="modal-card" style="max-width:400px">
        <div class="modal-card-header"><h5 class="modal-card-title"><ToggleLeft :size="18" /> Cambiar estado</h5><button class="modal-close-btn" @click="showStatusModal = false"><X :size="20" /></button></div>
        <div class="modal-card-body">
          <p>Nuevo estado para <strong>{{ statusTarget?.nombre || statusTarget?.title }}</strong></p>
          <select class="field-input" v-model="newStatus">
            <option value="" disabled>-- Seleccione un estado --</option>
            <option value="0">No publicado</option>
            <option value="1">Publicado</option>
            <option value="2">Privado</option>
          </select>
          <div class="spacer-top" v-if="newStatus !== ''">
            <div class="status-info-box" :class="getAlertClass(parseInt(newStatus))">
              <strong>{{ getEstadoLabelRaw(parseInt(newStatus)) }}</strong>
              <p class="status-desc">{{ getStatusDescription(parseInt(newStatus)) }}</p>
            </div>
          </div>
        </div>
        <div class="modal-card-footer">
          <button class="btn-cancel" @click="showStatusModal = false">Cancelar</button>
          <button class="btn-primary-custom" @click="confirmStatusChange" :disabled="statusLoading || newStatus === ''">
            <Loader2 v-if="statusLoading" :size="14" class="spinner-inline" /> Cambiar Estado
          </button>
        </div>
      </div>
    </div>

    <!-- ===================== INVITATION MODAL ===================== -->
    <div v-if="showInviteModal" class="modal-overlay" @click.self="closeInviteModal">
      <div class="modal-card" @click.stop>
        <div class="modal-card-header"><h5 class="modal-card-title"><Link :size="18" /> Invitar a {{ inviteTarget?.tipo || inviteTarget?.type }}: <u>{{ inviteTarget?.nombre || inviteTarget?.title }}</u></h5><button class="modal-close-btn" @click="closeInviteModal"><X :size="20" /></button></div>
        <div class="modal-card-body">
          <div v-if="inviteLoading" class="loading-invite"><Loader2 class="spinner" :size="28" /><p>Verificando estado...</p></div>

          <!-- No registrado aún -->
          <div v-else-if="!invitationData.isRegistered" class="info-box info-warning">
            <h6><AlertTriangle :size="16" /> No disponible</h6>
            <p>Debes registrar/comprar esta herramienta antes de poder invitar a otros.</p>
          </div>

          <!-- Registrado, verificar link existente -->
          <div v-else>
            <!-- Ya existe un link -->
            <div v-if="invitationData.existInvitation && !invitationData.newLink" class="info-box info-info">
              <h6><Info :size="16" /> Link de Invitación Activo</h6>
              <p>Ya tienes un link de invitación activo para esta herramienta.</p>
              <div class="input-suffix">
                <input type="text" class="field-input" :value="invitationData.invitationLink" readonly @focus="$event.target.select()" />
                <button class="btn-suffix" @click="copyInviteLink(invitationData.invitationLink)"><Copy :size="16" /></button>
              </div>
            </div>

            <!-- No hay link, crear uno -->
            <div v-if="!invitationData.existInvitation && !invitationData.newLink" class="info-box info-warning">
              <h6><AlertTriangle :size="16" /> Crear Link de Invitación</h6>
              <p>No tienes un link de invitación activo.</p>
              <button class="action-btn spacer-top-sm" @click="generateInviteLink" :disabled="generatingLink">
                <Loader2 v-if="generatingLink" :size="14" class="spinner-inline" />
                <Plus v-else :size="14" /> Crear Link de Invitación
              </button>
            </div>

            <!-- Link recién creado -->
            <div v-if="invitationData.newLink" class="info-box info-success spacer-top-sm">
              <h6><CheckCircle2 :size="16" /> Link Creado Exitosamente</h6>
              <p>Válido por 7 días.</p>
              <div class="input-suffix">
                <input type="text" class="field-input" :value="invitationData.newLink" readonly @focus="$event.target.select()" />
                <button class="btn-suffix" @click="copyInviteLink(invitationData.newLink)"><Copy :size="16" /></button>
              </div>
            </div>

            <!-- Compartir via redes -->
            <div v-if="invitationData.existInvitation || invitationData.newLink" class="spacer-top">
              <label class="share-label">Compartir vía:</label>
              <div class="share-buttons">
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
        <div class="modal-card-footer">
          <button class="btn-cancel" @click="closeInviteModal">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- ===================== TOAST ===================== -->
    <Transition name="toast-slide">
      <div class="toast-notification" v-if="toast">
        <div class="toast-icon"><CheckCircle2 v-if="toast.type === 'success'" :size="20" class="icon-green" /><AlertCircle v-else :size="20" class="icon-red" /></div>
        <div class="toast-content">
          <h4>{{ toast.title }}</h4>
          <p>{{ toast.message }}</p>
        </div>
        <button class="toast-close" @click="toast = null"><X :size="16" /></button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketingStore } from '../stores/marketingStore'
import { formatDate } from '@/utils/formatDate'
import apiClient from '@/services/apiClient'
import {
  Plus, Zap, Loader2, Search, AlertTriangle, X, Link, Copy, ToggleLeft,
  CheckCircle2, AlertCircle, Edit3, Info, MessageCircle, Facebook
} from 'lucide-vue-next'

const router = useRouter()
const store = useMarketingStore()

const loading = ref(false)
const searchQuery = ref('')
const perPage = ref(10)
const currentPage = ref(1)
const actionSelect = ref('')
const toast = ref(null)

// ─── Tipos y utilidades ───────────────────────────────────────────────

const TYPE_CONFIG = {
  masterclass: { label: 'Masterclass', color: '#20e205', class: 'badge-green' },
  ebook: { label: 'E-book', color: '#00d0e4', class: 'badge-blue' },
  'mini-course': { label: 'Mini Curso', color: '#ffc107', class: 'badge-orange' },
  minicourse: { label: 'Mini Curso', color: '#ffc107', class: 'badge-orange' },
}

function getTipoSlug(item) {
  const tipo = item.tipo || item.type || ''
  const lower = tipo.toLowerCase()
  if (lower.includes('masterclass') || lower === 'masterclass') return 'masterclass'
  if (lower.includes('ebook') || lower === 'ebook') return 'ebook'
  if (lower.includes('mini') || lower === 'minicourse' || lower === 'mini-course') return 'minicourse'
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
  const classes = { 0: 'info-secondary', 1: 'info-success', 2: 'info-warning' }
  return classes[estado] || 'info-info'
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
    'Mini Curso': '/marketing/mini-course/crear',
    'E-book': '/marketing/ebook/crear',
    Dinamica: '/marketing/dinamica/crear',
  }
  const route = routes[type]
  if (route) {
    const exists = router.getRoutes().some(r => r.path === route)
    if (exists) router.push(route)
    else showToast('Próximamente', `Creación de ${type.toLowerCase()} próximamente`, 'error')
  }
}

// ─── Action select ───────────────────────────────────────────────────

function handleAction(item, event) {
  const action = event.target.value
  if (!action) return
  nextTick(() => { actionSelect.value = '' })
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
const editTarget = ref(null)
const editLoading = ref(false)
const editForm = ref({})
const editImages = ref([])
const editFiles = ref({})

function closeEditModals() {
  showEditMasterclassModal.value = false
  showEditEbookModal.value = false
  showEditMiniModal.value = false
  editTarget.value = null
  editForm.value = {}
  editImages.value = []
  editFiles.value = {}
}

async function editTool(item) {
  const type = getTipoSlug(item)
  editTarget.value = item
  editLoading.value = true

  try {
    const resp = await store.getToolById(item.id, type)
    const data = resp?.data || resp

    if (type === 'masterclass') {
      editForm.value = {
        title: data.title || '',
        id_categories: data.id_categories || data.category_id || '',
        description: data.description || '',
        objective: data.objectives || data.objective || '',
        date: data.date || '',
        email_contact: data.email_contact || '',
        phone_contact: data.phone_contact || '',
        meeting_link: data.meeting_link || '',
      }
      editImages.value = data.images || []
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
    Object.entries(editForm.value).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v) })
    if (editFiles.value.images?.length) {
      Array.from(editFiles.value.images).forEach(f => fd.append('images[]', f))
    }
    if (editFiles.value.documents?.length) {
      Array.from(editFiles.value.documents).forEach(f => fd.append('documents[]', f))
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
    if (editFiles.value.portada) fd.append('cover', editFiles.value.portada)
    if (editFiles.value.archivo_pdf) fd.append('pdf', editFiles.value.archivo_pdf)
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

// ─── Mount ───────────────────────────────────────────────────────────

onMounted(async () => {
  loading.value = true
  await Promise.all([store.loadTools(), store.loadCategories()])
  loading.value = false
})
</script>

<style scoped>
.marketing-tools-view { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* ─── View Card ─── */
.view-card { width: 100%; }
.view-card-body { padding: 0; }

.view-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
}
.view-title { font-size: 1.25rem; font-weight: 700; color: var(--text-bold); margin: 0; }
.view-meta { font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px; }

.create-buttons { display: flex; gap: 6px; flex-wrap: wrap; }
.action-btn {
  display: inline-flex; align-items: center; gap: 5px;
  background: transparent; border: 1px solid var(--border-color);
  padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(24,214,0,0.04); }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 40px; color: var(--text-muted); gap: 12px; }
.spinner { animation: spin 1s linear infinite; color: var(--primary-color); }
.spinner-inline { animation: spin 1s linear infinite; display: inline-block; margin-right: 4px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Table Toolbar ─── */
.table-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px; margin-bottom: 12px;
}
.show-entries { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
.page-size-select {
  border: 1px solid var(--border-color); border-radius: 6px;
  padding: 4px 8px; font-size: 13px; background: var(--card-bg);
  color: var(--text-main); cursor: pointer;
}
.search-wrapper { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 10px; color: var(--text-light); pointer-events: none; }
.search-input {
  border: 1px solid var(--border-color); border-radius: 8px;
  padding: 7px 12px 7px 34px; font-size: 13px;
  background: var(--card-bg); color: var(--text-main);
  min-width: 220px; transition: border-color 0.2s;
}
.search-input:focus { outline: none; border-color: var(--primary-color); }

/* ─── Table ─── */
.table-wrap { border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); }
.tools-table { width: 100%; border-collapse: collapse; background: var(--card-bg); }
.tools-table thead { background: var(--bg-main); }
.tools-table th {
  padding: 10px 12px; font-size: 0.78rem; font-weight: 700;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px;
  border-bottom: 1px solid var(--border-color); white-space: nowrap;
}
.tools-table td {
  padding: 10px 12px; font-size: 0.85rem; color: var(--text-main);
  border-bottom: 1px solid var(--border-color); vertical-align: middle;
}
.tools-table tbody tr:last-child td { border-bottom: none; }
.tools-table tbody tr:hover { background: rgba(24, 214, 0, 0.03); }
.cell-name { font-weight: 600; }
.cell-dist { text-align: center; font-weight: 600; }
.empty-cell { text-align: center; color: var(--text-muted); padding: 24px 12px !important; }

/* ─── Badges ─── */
.tipo-badge { padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
.badge-green { background: rgba(24, 214, 0, 0.12); color: #166534; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
.badge-blue { background: rgba(24, 119, 242, 0.12); color: #1a56db; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
.badge-orange { background: rgba(245, 158, 11, 0.12); color: #92400e; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
.badge-gray { background: rgba(148, 163, 184, 0.15); color: #64748b; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }

.status-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; display: inline-block; }
.status-badge.badge-green { background: rgba(24, 214, 0, 0.12); color: #166534; }
.status-badge.badge-gray { background: rgba(148, 163, 184, 0.15); color: #64748b; }
.status-badge.badge-orange { background: rgba(245, 158, 11, 0.12); color: #92400e; }

.action-select {
  border: 1px solid var(--border-color); border-radius: 6px;
  padding: 4px 8px; font-size: 12px; background: var(--card-bg);
  color: var(--text-main); cursor: pointer; min-width: 120px;
}

/* ─── Table Footer ─── */
.table-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 12px; flex-wrap: wrap; gap: 8px;
}
.footer-info { color: var(--text-muted); font-size: 12px; }
.pagination-list { display: flex; gap: 4px; list-style: none; padding: 0; margin: 0; }
.pagination-list li a {
  display: flex; align-items: center; justify-content: center;
  min-width: 32px; height: 32px; padding: 0 6px;
  border: 1px solid var(--border-color); border-radius: 6px;
  font-size: 13px; color: var(--text-main); text-decoration: none;
  transition: all 0.2s; background: var(--card-bg);
}
.pagination-list li a:hover { border-color: var(--primary-color); color: var(--primary-color); }
.pagination-list li.active a { background: var(--primary-color); border-color: var(--primary-color); color: white; font-weight: 700; }
.pagination-list li.disabled a { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

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
.modal-wide { max-width: 700px; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-card-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--border-color);
}
.modal-card-title {
  font-size: 15px; font-weight: 700; color: var(--text-bold);
  display: flex; align-items: center; gap: 8px; margin: 0;
}
.modal-close-btn {
  background: none; border: none; color: var(--text-light);
  cursor: pointer; padding: 6px; border-radius: 6px;
  display: flex; transition: all 0.2s;
}
.modal-close-btn:hover { background: var(--bg-main); color: var(--danger-color); }
.modal-card-body { padding: 20px; max-height: 70vh; overflow-y: auto; }
.modal-card-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 0 20px 20px;
}

/* ─── Buttons ─── */
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
.btn-danger-custom:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
.btn-danger-custom:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary-custom {
  background: var(--primary-color); color: white; border: none;
  padding: 8px 16px; border-radius: 8px; font-size: 13px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 4px;
}
.btn-primary-custom:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.btn-primary-custom:disabled { opacity: 0.5; cursor: not-allowed; }

/* ─── Input Suffix ─── */
.input-suffix { display: flex; }
.input-suffix .field-input { border-radius: 8px 0 0 8px; flex: 1; }
.btn-suffix {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--primary-color); color: white; border: none;
  padding: 8px 14px; border-radius: 0 8px 8px 0; font-size: 12px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-suffix:hover { filter: brightness(1.1); }

/* ─── Form Fields ─── */
.field-group { margin-bottom: 12px; }
.field-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: var(--text-main); }
.field-input {
  width: 100%; padding: 8px 12px; border: 1px solid var(--border-color);
  border-radius: 8px; font-size: 13px; background: var(--card-bg);
  color: var(--text-main); transition: border-color 0.2s; font-family: inherit;
}
.field-input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.08); }
.field-input-sm { padding: 5px 10px; font-size: 12px; }
select.field-input { cursor: pointer; }
textarea.field-input { resize: vertical; }

.file-input { display: block; width: 100%; padding: 6px 0; font-size: 13px; }
.required-mark { color: var(--danger-color); }
.field-hint { font-size: 11px; color: var(--text-muted); }
.spacer-top { margin-top: 12px; }
.spacer-top-sm { margin-top: 8px; }
.section-spacer { margin-bottom: 12px; }

/* ─── Field Grid ─── */
.field-row { display: flex; gap: 12px; margin-bottom: 4px; }
.field-col { flex: 1; }
.field-col-8 { flex: 2; }
.field-col-6 { flex: 1; }
.field-col-4 { flex: 0 0 calc(33.333% - 8px); }
.field-col-3 { flex: 0 0 calc(25% - 9px); }

/* ─── Image Row ─── */
.image-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.img-preview-wrap { display: inline-block; }
.preview-thumb { max-height: 60px; border: 1px solid var(--border-color); border-radius: 4px; padding: 2px; }
.preview-block { display: block; margin-top: 8px; }

/* ─── Chapters ─── */
.chapters-container {
  background: var(--bg-main); border: 1px solid var(--border-color);
  border-radius: 8px; padding: 12px;
}
.chapter-item {
  margin-bottom: 8px; padding: 8px; border: 1px solid var(--border-color);
  border-radius: 6px; background: var(--card-bg);
}
.chapter-header-row {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;
}
.chapter-label { font-size: 13px; }
.icon-btn-danger {
  background: none; border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 4px; border-radius: 4px; color: var(--danger-color);
}
.icon-btn-danger:hover { background: var(--bg-main); }

.add-chapter-button {
  display: inline-flex; align-items: center; gap: 4px;
  background: transparent; border: 1px dashed var(--border-color);
  padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
  color: var(--text-muted); cursor: pointer; transition: all 0.2s; margin-top: 8px;
}
.add-chapter-button:hover { border-color: var(--primary-color); color: var(--primary-color); }

/* ─── Status Info Box ─── */
.status-info-box {
  padding: 10px 14px; border-radius: 8px; border: 1px solid;
  font-size: 12px;
}
.status-info-box strong { display: block; margin-bottom: 4px; }
.status-desc { margin: 0; font-size: 12px; }
.status-info-box.info-secondary { background: var(--bg-main); border-color: var(--text-muted); color: var(--text-main); }
.status-info-box.info-success { background: var(--indicator-green); border-color: var(--indicator-green-text); color: var(--indicator-green-text); }
.status-info-box.info-warning { background: var(--indicator-orange); border-color: var(--indicator-orange-text); color: var(--indicator-orange-text); }
.status-info-box.info-info { background: var(--indicator-blue); border-color: var(--indicator-blue-text); color: var(--indicator-blue-text); }

/* ─── Info Boxes ─── */
.info-box { padding: 12px; border-radius: 8px; border: 1px solid; font-size: 13px; }
.info-box h6 { display: flex; align-items: center; gap: 6px; margin: 0 0 6px 0; font-size: 13px; }
.info-box p { margin: 0; line-height: 1.4; }

.info-warning { background: var(--indicator-orange); border-color: var(--indicator-orange-text); color: var(--indicator-orange-text); }
.info-info { background: var(--indicator-blue); border-color: var(--indicator-blue-text); color: var(--indicator-blue-text); }
.info-success { background: var(--indicator-green); border-color: var(--indicator-green-text); color: var(--indicator-green-text); }

/* ─── Share ─── */
.share-label { font-weight: 700; font-size: 12px; display: block; margin-bottom: 8px; color: var(--text-main); }
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

.loading-invite { display: flex; flex-direction: column; align-items: center; padding: 16px 0; color: var(--text-muted); gap: 8px; }

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
.icon-green { color: var(--primary-color); }
.icon-red { color: var(--danger-color); }
.toast-content h4 { font-size: 14px; font-weight: 700; color: var(--text-bold); margin-bottom: 2px; }
.toast-content p { font-size: 12px; color: var(--text-muted); line-height: 1.4; }
.toast-close { background: none; border: none; color: var(--text-light); cursor: pointer; padding: 2px; flex-shrink: 0; }
.toast-close:hover { color: var(--text-bold); }
.toast-slide-enter-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from { transform: translateX(100%); opacity: 0; }
.toast-slide-leave-to { transform: scale(0.9); opacity: 0; }

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .view-header { flex-direction: column; }
  .table-toolbar { flex-direction: column; align-items: stretch; }
  .search-input { min-width: 100%; }
  .toast-notification { bottom: 16px; right: 16px; left: 16px; max-width: none; }
  .modal-wide { max-width: 100%; }
  .field-row { flex-direction: column; gap: 0; }
  .field-col-4, .field-col-3 { flex: 1; }
}
</style>
