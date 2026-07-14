<template>
  <div class="page-editor">
    <!-- ── Editor Header ── -->
    <div class="editor-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">
          <ArrowLeft :size="16" />
          Volver a Plantillas
        </button>
        <div class="header-title-info">
          <span class="header-template-name">
            <Edit3 :size="14" />
            {{ baseTemplate?.name || 'Editor de página' }}
          </span>
          <span v-if="hasUnsavedChanges && !isPublished" class="badge badge-warning">
            <AlertCircle :size="12" /> Cambios sin guardar
          </span>
          <span v-else-if="hasUnsavedChanges && isPublished" class="badge badge-warning">
            <Edit3 :size="12" /> Modificando publicación
          </span>
          <span v-else-if="pageId && !isPublished" class="badge badge-success">
            <CheckCircle :size="12" /> Borrador guardado
          </span>
          <span v-else-if="isPublished" class="badge badge-info">
            <Globe :size="12" /> Publicado
          </span>
        </div>
      </div>

      <div class="header-controls">
        <label class="toggle-label">
          <input type="checkbox" v-model="showPreview" class="toggle-checkbox" />
          <span class="toggle-text">Vista en tiempo real</span>
        </label>

        <label class="toggle-label">
          <input type="checkbox" v-model="autoSaveEnabled" class="toggle-checkbox" />
          <span class="toggle-text">Auto-guardar</span>
        </label>

        <button class="btn-header btn-outline" @click="savePage" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="spinner-sm" :size="14" />
          <Save v-else :size="14" />
          {{ isSaving ? 'Guardando...' : (pageId ? 'Actualizar' : 'Guardar') }}
        </button>

        <button
          v-if="pageId"
          class="btn-header btn-publish"
          @click="publishPage"
          :disabled="isSaving || isPublished"
          :title="isPublished ? 'Ya está publicada' : 'Publicar página'"
        >
          <Globe v-if="!isPublished" :size="14" />
          <CheckCircle v-else :size="14" />
          {{ isPublished ? 'Publicado' : 'Publicar' }}
        </button>

        <div v-if="publishedUrl && isPublished" class="published-actions">
          <a :href="publishedUrl" target="_blank" class="btn-header btn-outline btn-sm" title="Ver página">
            <ExternalLink :size="12" /> Ver
          </a>
          <button class="btn-header btn-outline btn-sm" @click="copyUrl" title="Copiar enlace">
            <Copy :size="12" />
          </button>
        </div>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="errorMsg" class="error-banner">
      <AlertCircle :size="16" />
      {{ errorMsg }}
      <button @click="errorMsg = ''" class="close-error">&times;</button>
    </div>

    <!-- ── Editor Body: Split view ── -->
    <div class="editor-body">
      <!-- LEFT: Editable fields panel -->
      <div class="edit-panel" :class="{ 'full-width': !showPreview }">
        <div class="edit-content">
          <div class="card">
            <div class="card-header">
              <h6 class="card-header-title"><Tag :size="14" /> Información de la Plantilla</h6>
            </div>
            <div class="card-body">
              <div class="form-group">
                <label class="field-label">
                  <FileText :size="14" />
                  Nombre de tu página
                </label>
                <input
                  v-model="pageTitle"
                  type="text"
                  class="form-control"
                  placeholder="Ej: Mi Landing Page Personal"
                  maxlength="255"
                />
                <small class="field-hint">Este será el nombre con el que se guardará tu página</small>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h6 class="card-header-title"><Edit3 :size="14" /> Campos Editables</h6>
              <small class="card-desc">{{ baseTemplate?.description }}</small>
            </div>
            <div class="card-body">
              <div v-if="editableFields.length === 0" class="no-fields">
                <p>No hay campos editables disponibles.</p>
                <p class="hint">La plantilla debe tener atributos <code>data-editable="true"</code> y <code>data-field="nombre"</code> en sus elementos HTML.</p>
              </div>
              <div v-for="field in editableFields" :key="field.name" class="form-group">
                <label class="field-label">
              <Type v-if="isTitleField(field.name)" :size="14" />
              <Pointer v-else-if="isButtonField(field.name)" :size="14" />
              <FileText v-else :size="14" />
                  {{ formatFieldName(field.name) }}
                </label>

                <input
                  v-if="isTitleField(field.name)"
                  v-model="field.value"
                  type="text"
                  class="form-control form-control-lg"
                  :placeholder="'Ingresa ' + formatFieldName(field.name).toLowerCase() + '...'"
                  @input="onFieldChange"
                />
                <input
                  v-else-if="isButtonField(field.name)"
                  v-model="field.value"
                  type="text"
                  class="form-control"
                  :placeholder="'Texto del botón...'"
                  @input="onFieldChange"
                />
                <textarea
                  v-else
                  v-model="field.value"
                  class="form-control"
                  rows="3"
                  :placeholder="'Ingresa ' + formatFieldName(field.name).toLowerCase() + '...'"
                  @input="onFieldChange"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Live Preview -->
      <div v-if="showPreview" class="preview-panel">
        <div class="preview-header">
          <h6 class="preview-header-title"><Eye :size="14" /> Vista Previa en Tiempo Real</h6>
          <div class="device-switcher">
            <button class="btn-device" :class="{ active: previewDevice === 'desktop' }" @click="previewDevice = 'desktop'" title="Desktop">
              <Monitor :size="14" />
            </button>
            <button class="btn-device" :class="{ active: previewDevice === 'tablet' }" @click="previewDevice = 'tablet'" title="Tablet">
              <Tablet :size="14" />
            </button>
            <button class="btn-device" :class="{ active: previewDevice === 'mobile' }" @click="previewDevice = 'mobile'" title="Mobile">
              <Smartphone :size="14" />
            </button>
          </div>
        </div>

        <div class="preview-content-wrapper">
          <div class="preview-iframe-container" :class="'device-' + previewDevice">
            <iframe
              ref="previewFrame"
              class="preview-iframe"
              :srcdoc="previewHtml"
              frameborder="0"
              sandbox="allow-same-origin allow-scripts"
            ></iframe>
          </div>
        </div>
      </div>
    </div>

    <!-- ── URL Modal ── -->
    <div v-if="showUrlModal" class="modal-overlay" @click.self="showUrlModal = false">
      <div class="modal-dialog">
        <div class="modal-header bg-success">
          <h5 class="modal-title"><CheckCircle :size="18" /> ¡Página Publicada Exitosamente!</h5>
          <button type="button" class="close-btn" @click="showUrlModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Tu página ha sido publicada y está disponible en el siguiente enlace:</p>
          <div class="url-group">
            <input type="text" :value="publishedUrl" readonly class="url-input" ref="urlInput" />
            <button class="btn-copy-url" @click="copyUrl"><Copy :size="14" /></button>
          </div>
          <div class="modal-actions">
            <a :href="publishedUrl" target="_blank" class="btn-primary-sm">
              <ExternalLink :size="14" /> Ver página
            </a>
            <button class="btn-secondary-sm" @click="showUrlModal = false">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageBuilderStore } from '@/features/marketing/stores/pageBuilderStore'
import {
  ArrowLeft, Save, Eye, Globe, Monitor, Tablet, Smartphone,
  Edit3, Tag, FileText, CheckCircle, AlertCircle,
  ExternalLink, Copy, Loader2, Type,
  Pointer
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = usePageBuilderStore()

// State
const pageTitle = ref('')
const baseTemplate = ref(null)
const editableFields = ref([])
const previewDevice = ref('desktop')
const showPreview = ref(true)
const autoSaveEnabled = ref(false)
const errorMsg = ref('')
const showUrlModal = ref(false)
const publishedUrl = ref('')
const pageId = ref(route.query.edit ? Number(route.query.edit) : null)
const isPublished = ref(false)
const hasUnsavedChanges = ref(false)
const isSaving = ref(false)
const previewHtml = ref('')
const rawContentHtml = ref('')
const rawStylesCss = ref('')
let autoSaveTimer = null

// Helpers
function isTitleField(name) {
  return name.toLowerCase().includes('title') || name.toLowerCase().includes('headline') || name.toLowerCase().includes('titulo')
}
function isButtonField(name) {
  return name.toLowerCase().includes('button') || name.toLowerCase().includes('cta') || name.toLowerCase().includes('boton')
}
function formatFieldName(name) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// Cargar datos al montar
onMounted(async () => {
  const templateId = route.query.template
  if (pageId.value) {
    try {
      const page = await store.fetchPage(pageId.value)
      if (page) {
        pageTitle.value = page.title || ''
        isPublished.value = page.status === 'published' || page.status === 1
        baseTemplate.value = page
        rawContentHtml.value = page.contentHtml || page.content || page.content_html || ''
        rawStylesCss.value = page.stylesCss || page.styles_css || ''
        publishedUrl.value = page.publicUrl || ''
        loadEditedFields(page)
      }
    } catch (e) {
      errorMsg.value = 'Error al cargar la página'
    }
  } else if (templateId) {
    try {
      const tmpl = store.templates.find(t => String(t.id) === String(templateId))
      if (tmpl) {
        baseTemplate.value = tmpl
        rawContentHtml.value = tmpl.content_html || tmpl.content || ''
        rawStylesCss.value = tmpl.styles_css || ''
        pageTitle.value = `Mi ${tmpl.name || 'página'} personalizada`
        loadEditedFields(tmpl)
      }
    } catch (e) {
      errorMsg.value = 'Error al cargar plantilla'
    }
  }
  generatePreviewHtml()
})

function loadEditedFields(source) {
  if (source.editedFields || source.edited_fields) {
    try {
      const fields = typeof (source.editedFields || source.edited_fields) === 'string'
        ? JSON.parse(source.editedFields || source.edited_fields)
        : (source.editedFields || source.edited_fields)
      if (fields && typeof fields === 'object') {
        editableFields.value = Object.entries(fields).map(([name, value]) => ({ name, value: value || '' }))
        return
      }
    } catch (e) { /* fallthrough */ }
  }

  const html = source.contentHtml || source.content_html || source.content || ''
  if (!html) return

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  const elements = tempDiv.querySelectorAll('[data-editable="true"]')
  const fields = []
  elements.forEach(el => {
    const name = el.getAttribute('data-field')
    if (name) {
      fields.push({
        name,
        value: (el.textContent || el.innerText || '').replace(/\s+/g, ' ').trim()
      })
    }
  })
  editableFields.value = fields
}

function getDefaultStyles() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif; }
    body { line-height: 1.6; color: #333; background: #fff; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    img { max-width: 100%; height: auto; }
    h1, h2, h3, h4, h5, h6 { margin-bottom: 1rem; font-weight: 600; }
    p { margin-bottom: 1rem; }
    button { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem; transition: all 0.3s ease; }
    input, textarea, select { padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem; width: 100%; margin-bottom: 1rem; }
    section { padding: 40px 20px; }
    .event-hero { background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-align: center; padding: 60px 20px; }
    .event-hero h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .event-info, .speaker, .registration { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .speaker-card { display: flex; gap: 20px; align-items: center; background: #f8f9fa; padding: 20px; border-radius: 10px; }
    .speaker-card img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
    @media (max-width: 768px) { .container { padding: 0 15px; } .event-hero h1 { font-size: 1.8rem; } }
  `
}

function generatePreviewHtml() {
  let html = rawContentHtml.value
  if (!html) { previewHtml.value = ''; return }

  html = html.replace(/\r\n/g, ' ').replace(/\n\s+/g, ' ').replace(/\s+/g, ' ').replace(/>\s+</g, '><')

  editableFields.value.forEach(field => {
    const value = field.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    const regex = new RegExp(`(<[^>]*data-field="${field.name}"[^>]*>)[^<]*(<\\/[^>]*>|>)`, 'gi')
    html = html.replace(regex, (match, openTag, closeTag) => {
      if (closeTag === '>') return openTag.replace(/placeholder="[^"]*"/, `placeholder="${value}"`)
      return openTag + value + closeTag
    })
  })

  previewHtml.value = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle.value || 'Preview'}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <style>${rawStylesCss.value || getDefaultStyles()}</style>
</head>
<body>${html}</body>
</html>`
}

// Reactivity
watch(editableFields, () => {
  hasUnsavedChanges.value = true
  generatePreviewHtml()
  scheduleAutoSave()
}, { deep: true })

watch(pageTitle, () => {
  hasUnsavedChanges.value = true
  generatePreviewHtml()
  scheduleAutoSave()
})

watch(autoSaveEnabled, (val) => {
  if (!val) clearTimeout(autoSaveTimer)
})

function scheduleAutoSave() {
  if (!autoSaveEnabled.value || !pageId.value) return
  clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => autoSaveUpdate(), 3000)
}

async function autoSaveUpdate() {
  if (!pageId.value) return
  try {
    const editedFieldsObj = editableFields.value.reduce((acc, f) => { acc[f.name] = f.value; return acc }, {})
    await store.savePage({
      title: pageTitle.value || 'Nueva página',
      content_html: previewHtml.value,
      edited_fields: JSON.stringify(editedFieldsObj),
      status: 'draft',
    }, pageId.value)
    hasUnsavedChanges.value = false
  } catch (e) {
    console.error('Auto-save error:', e)
  }
}

function onFieldChange() {
  hasUnsavedChanges.value = true
  generatePreviewHtml()
}

async function savePage() {
  isSaving.value = true
  errorMsg.value = ''
  try {
    const userId = Number(route.query.userId) || 1
    const editedFieldsObj = editableFields.value.reduce((acc, f) => { acc[f.name] = f.value; return acc }, {})

    const pageData = {
      user_id: userId,
      title: pageTitle.value || 'Nueva página',
      content_html: previewHtml.value,
      edited_fields: JSON.stringify(editedFieldsObj),
      status: 'draft',
    }

    let response
    if (pageId.value) {
      response = await store.savePage(pageData, pageId.value)
    } else {
      response = await store.savePage(pageData)
      if (response?.data?.id) pageId.value = response.data.id
      else if (response?.id) pageId.value = response.id
    }

    hasUnsavedChanges.value = false
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Error al guardar'
  } finally {
    isSaving.value = false
  }
}

async function publishPage() {
  isSaving.value = true
  errorMsg.value = ''
  try {
    if (!pageId.value) {
      await savePage()
      if (!pageId.value) throw new Error('No se pudo guardar la página')
    }

    const editedFieldsObj = editableFields.value.reduce((acc, f) => { acc[f.name] = f.value; return acc }, {})
    await store.savePage({
      title: pageTitle.value || 'Nueva página',
      content_html: previewHtml.value,
      edited_fields: JSON.stringify(editedFieldsObj),
      status: 'draft',
    }, pageId.value)

    const result = await store.publishPage(pageId.value)
    isPublished.value = true
    hasUnsavedChanges.value = false

    // Use the same API URL base as apiClient to ensure correct origin
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    const origin = new URL(apiUrl).origin
    if (result?.public_url) publishedUrl.value = result.public_url
    else if (result?.data?.publicUrl) publishedUrl.value = result.data.publicUrl
    else if (result?.data?.slug) publishedUrl.value = `${origin}/api/v1/pages/public/${result.data.slug}`
    else {
      const updated = await store.fetchPage(pageId.value)
      if (updated?.slug) publishedUrl.value = `${origin}/api/v1/pages/public/${updated.slug}`
    }
    showUrlModal.value = true
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Error al publicar'
  } finally {
    isSaving.value = false
  }
}

async function copyUrl() {
  if (publishedUrl.value) {
    try { await navigator.clipboard.writeText(publishedUrl.value) } catch (e) { console.warn(e) }
  }
}

function goBack() {
  router.push({ name: 'marketing-pages' })
}
</script>

<style scoped>
/* ── Layout ── */
.page-editor {
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  background: var(--bg-main, #f8f9fa);
}

/* ── Header ── */
.editor-header {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid var(--border-color, #dee2e6);
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}
.header-left {
  display: flex; align-items: center; gap: 12px;
}
.header-controls {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}

.btn-back {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent; border: 1px solid var(--border-color, #dee2e6);
  padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600;
  color: var(--text-muted, #666); cursor: pointer; transition: all 0.2s;
}
.btn-back:hover { border-color: var(--primary-color, #18d600); color: var(--primary-color, #18d600); }

.header-title-info { display: inline-flex; align-items: center; gap: 8px; }
.header-template-name {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 15px; font-weight: 600; color: var(--text-bold, #333);
}

.badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; padding: 3px 8px; border-radius: 10px;
  font-weight: 600; white-space: nowrap;
}
.badge-warning { background: #fff3cd; color: #856404; }
.badge-success { background: #d4edda; color: #155724; }
.badge-info { background: #d1ecf1; color: #0c5460; }

.toggle-label {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--text-muted, #666); cursor: pointer;
}
.toggle-checkbox { width: 14px; height: 14px; cursor: pointer; }

.btn-header {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
  border: 1px solid; cursor: pointer; transition: all 0.2s;
}
.btn-header.btn-outline {
  background: transparent; border-color: var(--border-color, #dee2e6); color: var(--text-muted, #666);
}
.btn-header.btn-outline:hover { border-color: var(--primary-color, #18d600); color: var(--primary-color, #18d600); }
.btn-header.btn-sm { padding: 4px 8px; font-size: 11px; }

.btn-header.btn-save {
  background: var(--primary-color, #28a745); border-color: var(--primary-color, #28a745); color: white;
}
.btn-header.btn-save:hover { opacity: 0.9; }
.btn-header.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-header.btn-publish {
  background: #2563eb; border-color: #2563eb; color: white;
}
.btn-header.btn-publish:hover { background: #1d4ed8; }
.btn-header.btn-publish:disabled { opacity: 0.5; cursor: not-allowed; }

.published-actions { display: flex; gap: 4px; }

/* ── Error Banner ── */
.error-banner {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px; background: #fef2f2; color: #dc2626;
  font-size: 13px; border-bottom: 1px solid #fecaca;
}
.close-error { margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer; color: #dc2626; }

/* ── Editor Body ── */
.editor-body {
  display: flex; flex: 1; overflow: hidden;
}

.edit-panel {
  width: 50%; overflow-y: auto;
  background: white; border-right: 1px solid var(--border-color, #dee2e6);
  transition: width 0.3s ease;
}
.edit-panel.full-width { width: 100%; }
.edit-content { padding: 16px; }

/* ── Cards ── */
.card {
  border: 1px solid var(--border-color, #dee2e6); border-radius: 8px;
  margin-bottom: 16px; background: white;
}
.card-header {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color, #dee2e6);
  background: var(--bg-main, #f8f9fa);
  border-radius: 8px 8px 0 0;
}
.card-header-title {
  margin: 0; font-size: 14px; font-weight: 700;
  color: var(--text-bold, #333);
  display: flex; align-items: center; gap: 6px;
}
.card-desc { font-size: 12px; color: var(--text-muted, #999); }
.card-body { padding: 14px; }

.form-group { margin-bottom: 16px; }
.field-label {
  display: flex; align-items: center; gap: 6px;
  font-weight: 600; margin-bottom: 6px; font-size: 13px;
  color: var(--text-bold, #333);
}

.form-control {
  width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #dee2e6);
  border-radius: 6px; font-size: 14px; color: var(--text-bold, #333);
  outline: none; transition: border-color 0.2s; font-family: inherit;
}
.form-control:focus { border-color: var(--primary-color, #18d600); box-shadow: 0 0 0 2px rgba(24,214,0,0.12); }
.form-control-lg { font-size: 1.25rem; font-weight: 600; padding: 10px 14px; }
.field-hint { font-size: 12px; color: var(--text-muted, #999); display: block; margin-top: 4px; }

.no-fields { text-align: center; padding: 30px 20px; color: var(--text-muted, #999); }
.no-fields p { margin-bottom: 8px; font-size: 13px; }
.no-fields .hint { font-size: 12px; }
.no-fields code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; }

/* ── Preview Panel ── */
.preview-panel {
  width: 50%; display: flex; flex-direction: column;
  background: var(--bg-main, #f8f9fa);
}
.preview-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px;
  background: white;
  border-bottom: 1px solid var(--border-color, #dee2e6);
}
.preview-header-title {
  margin: 0; font-size: 13px; font-weight: 700;
  color: var(--text-bold, #333);
  display: flex; align-items: center; gap: 6px;
}

.device-switcher { display: flex; gap: 4px; }
.btn-device {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px;
  background: transparent; border: 1px solid var(--border-color, #dee2e6);
  border-radius: 6px; cursor: pointer; color: var(--text-muted, #999);
  transition: all 0.2s;
}
.btn-device:hover { border-color: #94a3b8; color: #333; }
.btn-device.active { background: var(--primary-color, #18d600); border-color: var(--primary-color, #18d600); color: white; }

.preview-content-wrapper {
  flex: 1; padding: 12px;
  display: flex; justify-content: center;
  background: #e9ecef; overflow: auto;
}

.preview-iframe-container {
  background: white; border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
.preview-iframe-container.device-desktop { width: 100%; min-height: 500px; }
.preview-iframe-container.device-tablet { width: 768px; max-width: 90%; min-height: 700px; }
.preview-iframe-container.device-mobile { width: 375px; max-width: 90%; min-height: 600px; }

.preview-iframe {
  width: 100%; height: 100%; min-height: 500px;
  border-radius: 8px; border: none;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1050;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
}
.modal-dialog {
  background: white; border-radius: 12px;
  max-width: 500px; width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden;
}
.bg-success { background: #28a745; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px;
}
.modal-header .modal-title {
  margin: 0; font-size: 16px; color: white;
  display: flex; align-items: center; gap: 8px;
}
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; line-height: 1; color: white; opacity: 0.8; }
.close-btn:hover { opacity: 1; }

.modal-body { padding: 18px; }
.modal-body p { font-size: 14px; color: var(--text-muted, #666); margin-bottom: 12px; }

.url-group { display: flex; gap: 8px; margin-bottom: 12px; }
.url-input { flex: 1; padding: 8px 12px; border: 1px solid var(--border-color, #dee2e6); border-radius: 6px; font-size: 13px; background: #f8f9fa; color: #333; }
.btn-copy-url {
  background: #2563eb; color: white; border: none;
  padding: 8px 14px; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center;
}
.btn-copy-url:hover { background: #1d4ed8; }

.modal-actions { display: flex; gap: 8px; justify-content: center; }
.btn-primary-sm, .btn-secondary-sm {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600;
  cursor: pointer; text-decoration: none; border: none;
}
.btn-primary-sm { background: #2563eb; color: white; }
.btn-primary-sm:hover { background: #1d4ed8; }
.btn-secondary-sm { background: var(--bg-main, #f1f5f9); color: var(--text-muted, #666); border: 1px solid var(--border-color, #dee2e6); }
.btn-secondary-sm:hover { background: #e2e8f0; }

/* ── Spinner ── */
.spinner-sm { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ── */
@media (max-width: 992px) {
  .edit-panel, .preview-panel { width: 100% !important; }
  .edit-panel { border-right: none; border-bottom: 1px solid var(--border-color, #dee2e6); max-height: 50vh; }
  .preview-panel { max-height: 50vh; }
  .editor-body { flex-direction: column; }
}
</style>
