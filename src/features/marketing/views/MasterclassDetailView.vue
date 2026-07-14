<template>
  <div class="container">
    <div class="back-btn" @click="goBack">
      <ChevronLeft :size="18" />
      Volver al Marketplace
    </div>
    <div class="card shadow-lg">
      <!-- Carrusel o imagen única -->
      <div v-if="item.images && item.images.length > 1">
        <div class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div v-for="(image, index) in item.images" :key="index" class="carousel-item" :class="{ active: index === currentImageIndex }">
              <div class="image-container">
                <img :src="image.image" class="d-block w-100" alt="Imagen de la Masterclass" />
                <div class="text-overlay">
                  <h2>{{ item.title }}</h2>
                  <span>{{ item.category_name }}</span>
                  <span><Calendar :size="14" /> {{ formatDate(item.date) }}</span>
                  <div class="buttons-container">
                    <button v-if="!isRegistered" @click="register" :disabled="loading" class="btn btn-success btn-md shadow-sm">
                      <UserPlus :size="16" />
                      {{ loading ? 'Registrando...' : 'Registrarse' }}
                    </button>
                    <button v-else @click="showInvitationModal" class="btn btn-primary btn-md shadow-sm">
                      <Share2 :size="16" /> Invitar
                    </button>
                  </div>
                </div>
                <div class="text-overlay-top-right">
                  <span class="badge-pill" :class="item.status ? 'badge-success' : 'badge-danger'">
                    {{ item.status ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="carousel-controls">
            <button @click="prevImage" class="carousel-btn" :disabled="currentImageIndex === 0"><ChevronLeft :size="18" /></button>
            <div class="carousel-dots">
              <span v-for="(img, i) in item.images" :key="i" class="dot" :class="{ active: i === currentImageIndex }" @click="currentImageIndex = i"></span>
            </div>
            <button @click="nextImage" class="carousel-btn" :disabled="currentImageIndex === item.images.length - 1"><ChevronRight :size="18" /></button>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="image-container">
          <img :src="item.images && item.images[0] ? item.images[0].image : ''" class="img-fluid w-100" alt="Masterclass" />
          <div v-if="!item.images || !item.images[0]" class="img-placeholder">
            <PlayCircle :size="48" style="color:#ccc" />
          </div>
          <div class="text-overlay">
            <h2>{{ item.title }}</h2>
            <span>{{ item.category_name }}</span>
            <span><Calendar :size="14" /> {{ formatDate(item.date) }}</span>
            <div class="buttons-container">
              <button v-if="!isRegistered" @click="register" :disabled="loading" class="btn btn-success btn-md shadow-sm">
                <UserPlus :size="16" />
                {{ loading ? 'Registrando...' : 'Registrarse' }}
              </button>
              <button v-else @click="showInvitationModal" class="btn btn-primary btn-md shadow-sm">
                <Share2 :size="16" /> Invitar
              </button>
            </div>
          </div>
          <div class="text-overlay-top-right">
            <span class="badge-pill" :class="item.status ? 'badge-success' : 'badge-danger'">
              {{ item.status ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Información -->
      <div class="info-section">
        <div class="info-main">
          <div class="info-block">
            <h4><Info :size="18" /> Descripción</h4>
            <p>{{ item.description }}</p>
          </div>
          <div class="info-block" v-if="item.objectives">
            <h4><Target :size="18" /> Objetivos</h4>
            <p>{{ item.objectives }}</p>
          </div>
          <div class="info-block" v-if="item.documents && item.documents.length > 0">
            <h4><FileText :size="18" /> Documentos</h4>
            <ul class="doc-list">
              <li v-for="doc in item.documents" :key="doc.id">
                <a :href="doc.document" target="_blank"><FileDown :size="14" /> Descargar Documento {{ doc.id }}</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="info-sidebar">
          <div class="info-block">
            <h4><Phone :size="18" /> Contacto</h4>
            <p v-if="item.email_contact">Email: <a :href="'mailto:' + item.email_contact">{{ item.email_contact }}</a></p>
            <p v-if="item.phone_contact">Teléfono: <a :href="'tel:' + item.phone_contact">{{ item.phone_contact }}</a></p>
          </div>
          <div class="info-block">
            <h4><Share2 :size="18" /> Compartir en</h4>
            <div class="social-icons">
              <a :href="getWhatsappUrl()" target="_blank" class="icon whatsapp"><MessageCircle :size="22" /></a>
              <a :href="getFacebookUrl()" target="_blank" class="icon facebook"><Facebook :size="22" /></a>
              <a href="https://www.instagram.com/" target="_blank" class="icon instagram"><Instagram :size="22" /></a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Invitación -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content-card">
        <div class="modal-header">
          <h5><Share2 :size="18" /> Invitar a Masterclass: {{ item.title }}</h5>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <template v-if="!newInvitationLink">
            <div v-if="invitationData.existInvitation" class="alert alert-info">
              <h6>Link de Invitación Activo</h6>
              <p>Ya tienes un link de invitación activo para esta masterclass.</p>
              <div class="input-group">
                <input type="text" :value="invitationData.invitationLink" readonly />
                <button @click="copyToClipboard(invitationData.invitationLink)" class="btn-outline">Copiar</button>
              </div>
            </div>
            <div v-else class="alert alert-warning">
              <h6>Crear Link de Invitación</h6>
              <p>No tienes un link de invitación activo. Haz clic para crear uno.</p>
              <button @click="createInvitationLink" :disabled="loadingInvitation" class="btn-primary">
                {{ loadingInvitation ? 'Creando...' : 'Crear Link de Invitación' }}
              </button>
            </div>
          </template>
          <div v-else class="alert alert-success">
            <h6>Link Creado Exitosamente</h6>
            <p>Tu link de invitación ha sido creado exitosamente.</p>
            <div class="input-group">
              <input type="text" :value="newInvitationLink" readonly />
              <button @click="copyToClipboard(newInvitationLink)" class="btn-outline">Copiar</button>
            </div>
          </div>
          <div class="share-buttons">
            <h6>Compartir via:</h6>
            <div class="share-row">
              <a :href="getWhatsappShareUrl()" target="_blank" class="btn-share whatsapp"><MessageCircle :size="16" /> WhatsApp</a>
              <a :href="getFacebookShareUrl()" target="_blank" class="btn-share facebook"><Facebook :size="16" /> Facebook</a>
              <button @click="copyToClipboard(getCurrentInvitationLink())" class="btn-share copy"><Clipboard :size="16" /> Copiar Link</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="showToast" class="toast-container">
      <div class="toast">
        <div class="toast-header">
          <span class="toast-icon">✓</span>
          <strong>Éxito</strong>
          <button class="btn-close-small" @click="showToast = false">✕</button>
        </div>
        <div class="toast-body">{{ toastMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/apiClient'
import {
  Calendar, UserPlus, Share2, ChevronLeft, ChevronRight,
  Info, Target, FileText, FileDown, Phone, PlayCircle,
  MessageCircle, Facebook, Instagram, Clipboard
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const item = ref({ images: [], documents: [] })
const currentImageIndex = ref(0)
const loading = ref(false)
const loadingInvitation = ref(false)

// Registration state
const isRegistered = ref(false)
const showModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const invitationData = ref({ existInvitation: false, invitationLink: '' })
const newInvitationLink = ref('')

function goBack() { router.push('/marketing/marketplace') }

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function prevImage() { if (currentImageIndex.value > 0) currentImageIndex.value-- }
function nextImage() { if (item.value.images && currentImageIndex.value < item.value.images.length - 1) currentImageIndex.value++ }

function getCurrentUrl() { return window.location.href }
function getWhatsappUrl() {
  const text = `Te recomiendo esta masterclass: ${item.value.title}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
function getFacebookUrl() {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getCurrentUrl())}`
}
function getWhatsappShareUrl() {
  const link = getCurrentInvitationLink()
  const text = `¡Hola! Te invito a esta increíble masterclass: "${item.value.title}" - ${formatDate(item.value.date)}. Regístrate usando mi link de invitación: ${link}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
function getFacebookShareUrl() {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getCurrentInvitationLink())}`
}
function getCurrentInvitationLink() {
  return newInvitationLink.value || invitationData.value.invitationLink || ''
}

async function register() {
  if (!item.value.id) return
  loading.value = true
  try {
    const res = await apiClient.post(`/registration/distributor/masterclass`, { masterclass_id: item.value.id })
    if (res.data.success) {
      isRegistered.value = true
      showToastMessage('Registrado exitosamente en la masterclass')
      await checkExistingInvitation()
    }
  } catch (e) {
    console.error('Error al registrarse:', e)
    alert('Hubo un problema al registrarse.')
  } finally {
    loading.value = false
  }
}

async function checkRegistration() {
  if (!item.value.id) return
  try {
    const res = await apiClient.get(`/masterclass/check-registration/${item.value.id}`)
    if (res.data.success) {
      isRegistered.value = res.data.isRegistered
      if (isRegistered.value) await checkExistingInvitation()
    }
  } catch (e) { console.error('Error al verificar registro:', e) }
}

async function checkExistingInvitation() {
  if (!item.value.id) return
  try {
    const res = await apiClient.get(`/masterclass/check-invitation/${item.value.id}`)
    if (res.data.success) {
      invitationData.value = {
        existInvitation: res.data.existInvitation,
        invitationLink: res.data.invitationLink || ''
      }
    }
  } catch (e) { console.error('Error al verificar invitación:', e) }
}

async function createInvitationLink() {
  if (!item.value.id) return
  loadingInvitation.value = true
  try {
    const res = await apiClient.post(`/masterclass/create-invitation/${item.value.id}`)
    console.log('createInvitationLink response:', res.data)
    if (res.data.link) {
      newInvitationLink.value = res.data.link
      invitationData.value.existInvitation = true
      invitationData.value.invitationLink = res.data.link
      showToastMessage('Link de invitación creado exitosamente')
    } else {
      console.warn('No link in response:', res.data)
    }
  } catch (e) {
    console.error('Error al crear link:', e)
    alert('Hubo un problema al generar el enlace.')
  } finally { loadingInvitation.value = false }
}

function showInvitationModal() {
  showModal.value = true
  newInvitationLink.value = ''
  checkExistingInvitation()
}

function closeModal() {
  showModal.value = false
  newInvitationLink.value = ''
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    showToastMessage('Link copiado al portapapeles')
  } catch (e) {
    console.error('Error al copiar:', e)
    alert('No se pudo copiar el link')
  }
}

function showToastMessage(msg) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

onMounted(async () => {
  try {
    const id = route.params.id
    const res = await apiClient.get(`/marketing/marketplace/masterclass/${id}`)
    item.value = res.data.data
    await checkRegistration()
  } catch (e) { console.error('Error loading masterclass:', e) }
})
</script>

<style scoped>
.container { max-width: 1000px; margin: 0 auto;  padding: 0 20px; }
.back-btn { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; color: #007bff; font-weight: 600; font-size: 14px; margin-bottom: 16px; padding: 8px 14px; border-radius: 8px; border: 1px solid #ddd; background: white; transition: all 0.2s; }
.back-btn:hover { background: #f8f9fa; border-color: #007bff; }

/* Image */
.image-container { position: relative; width: 100%; height: 300px; overflow: hidden; border-radius: 10px; }
.image-container img { width: 100%; height: 100%; object-fit: cover; }
.image-container::after {
  content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to right, rgb(24,28,28) 0%, rgba(0,0,0,0) 100%);
  z-index: 1; pointer-events: none; border-radius: 10px;
}
.img-placeholder { width: 100%; height: 300px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; }

.text-overlay {
  position: absolute; left: 20px; top: 50%; transform: translateY(-50%);
  color: white; font-weight: bold; text-shadow: 2px 2px 5px rgba(0,0,0,0.5); z-index: 2;
}
.text-overlay h2 { font-size: 28px; font-weight: 700; margin: 0; color: white; }
.text-overlay span { font-size: 16px; display: block; opacity: 0.9; margin-bottom: 5px; display: flex; align-items: center; gap: 6px; }
.text-overlay-top-right { position: absolute; top: 20px; right: 20px; z-index: 2; }
.badge-pill { padding: 8px 12px; border-radius: 10px; font-size: 14px; font-weight: 600; }
.badge-success { background: #28a745; color: white; }
.badge-danger { background: #dc3545; color: white; }

.buttons-container { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
.buttons-container .btn { width: fit-content; min-width: 160px; padding: 10px 24px; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
.btn-success { background: #28a745; color: white; }
.btn-success:hover { background: #218838; }
.btn-primary { background: #007bff; color: white; }
.btn-primary:hover { background: #0069d9; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Carousel */
.carousel-controls { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 12px; background: #f8f9fa; }
.carousel-btn { background: white; border: 1px solid #ddd; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.carousel-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.carousel-dots { display: flex; gap: 8px; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #ddd; cursor: pointer; }
.dot.active { background: #007bff; transform: scale(1.2); }

/* Info */
.info-section { display: flex; gap: 24px; padding: 24px; }
.info-main { flex: 1; }
.info-sidebar { width: 280px; flex-shrink: 0; }
.info-block { margin-bottom: 24px; }
.info-block h4 { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; margin-bottom: 12px; color: #333; font-weight: 700; }
.info-block p { color: #333; line-height: 1.6; font-size: 0.95rem; margin-bottom: 10px; }
.info-block a { color: #007bff; text-decoration: none; }
.doc-list { list-style: none; padding: 0; }
.doc-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
.doc-list a { display: inline-flex; align-items: center; gap: 6px; color: #007bff; text-decoration: none; font-size: 0.9rem; }

/* Social */
.social-icons { display: flex; gap: 15px; margin-top: 10px; }
.social-icons .icon { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; text-decoration: none; transition: transform 0.2s; }
.social-icons .icon:hover { transform: scale(1.1); }
.whatsapp { background: #25D366; }
.facebook { background: #1877F2; }
.instagram { background: linear-gradient(45deg, #F58529, #DD2A7B, #8134AF); }

/* Modal */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 20px; }
.modal-content-card { background: white; border-radius: 12px; max-width: 600px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid #eee; }
.modal-header h5 { margin: 0; display: flex; align-items: center; gap: 8px; font-weight: 700; }
.btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666; }
.modal-body { padding: 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; }
.btn-secondary { padding: 8px 20px; border: 1px solid #ddd; border-radius: 6px; background: white; color: #666; cursor: pointer; }
.btn-outline { padding: 8px 16px; border: 1px solid #007bff; border-radius: 6px; background: white; color: #007bff; cursor: pointer; font-weight: 600; }

.alert { padding: 16px; border-radius: 8px; margin-bottom: 16px; }
.alert h6 { margin: 0 0 8px 0; font-weight: 700; }
.alert p { margin: 0 0 12px 0; font-size: 0.9rem; }
.alert-info { background: #e8f4fd; border: 1px solid #b8daff; color: #004085; }
.alert-warning { background: #fff3cd; border: 1px solid #ffc107; color: #856404; }
.alert-success { background: #d4edda; border: 1px solid #28a745; color: #155724; }

.input-group { display: flex; gap: 8px; }
.input-group input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.85rem; }

.share-buttons { margin-top: 20px; }
.share-buttons h6 { margin-bottom: 12px; }
.share-row { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-share { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: 6px; color: white; font-weight: 600; font-size: 0.85rem; cursor: pointer; text-decoration: none; }
.btn-share.whatsapp { background: #25D366; }
.btn-share.facebook { background: #1877F2; }
.btn-share.copy { background: #17a2b8; }

/* Toast */
.toast-container { position: fixed; top: 20px; right: 20px; z-index: 1055; }
.toast { background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 280px; }
.toast-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #eee; }
.toast-icon { color: #28a745; font-weight: 700; }
.btn-close-small { margin-left: auto; background: none; border: none; cursor: pointer; color: #999; }
.toast-body { padding: 12px 16px; font-size: 0.9rem; }

@media (max-width: 768px) { .info-section { flex-direction: column; } .info-sidebar { width: 100%; } .text-overlay h2 { font-size: 20px; } .buttons-container .btn { width: 100%; min-width: auto; } .share-row { flex-direction: column; } }
</style>
