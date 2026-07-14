import apiClient from '@/services/apiClient'

// ─── Normalización de tipos de herramientas ───────────────────────────────
// El backend usa slugs como 'masterclass', 'ebook', 'mini-course' o 'minicourse'
// pero desde la UI pueden llegar display names como 'E-book', 'Mini Curso', etc.
const TYPE_SLUG_MAP = {
  'E-book': 'ebook',
  'e-book': 'ebook',
  'ebook': 'ebook',
  'Mini Curso': 'mini-course',
  'mini curso': 'mini-course',
  'mini-course': 'mini-course',
  'minicourse': 'minicourse',
  'Masterclass': 'masterclass',
  'masterclass': 'masterclass',
}

function normalizeType(type) {
  return TYPE_SLUG_MAP[type] || type
}

// ─── Tools ────────────────────────────────────────────────────────────────

export async function getTools() {
  const response = await apiClient.get('/marketing/tools')
  return response.data
}

export async function changeToolStatus(toolType, toolId, status) {
  const slug = normalizeType(toolType)
  const response = await apiClient.patch(`/marketing/${slug}/${toolId}/status`, { status })
  return response.data
}

export async function deleteTool(toolType, toolId) {
  const slug = normalizeType(toolType)
  const response = await apiClient.delete(`/marketing/${slug}/${toolId}`)
  return response.data
}

// ─── Create (genérica) ────────────────────────────────────────────────────

export async function createTool(type, formData) {
  const slug = normalizeType(type)
  const isFormData = formData instanceof FormData
  const response = await apiClient.post(`/marketing/${slug}/store`, formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  })
  return response.data
}

// ─── Create (alias para compatibilidad) ───────────────────────────────────

export async function createMasterclass(formData) {
  return createTool('masterclass', formData)
}

export async function createMiniCourse(formData) {
  return createTool('mini-course', formData)
}

export async function createEbook(formData) {
  return createTool('ebook', formData)
}

// ─── Categories ───────────────────────────────────────────────────────────

export async function getCategories() {
  const response = await apiClient.get('/marketing/categories')
  return response.data
}

export async function createCategory(data) {
  const response = await apiClient.post('/marketing/categories', data)
  return response.data
}

// ─── Invitation Links ────────────────────────────────────────────────────

// Endpoints de invitación: para cada tipo de herramienta
// NOTA: apiClient ya tiene baseURL con /api/v1, por lo que las rutas NO deben empezar con /api/v1
const INVITATION_ENDPOINTS = {
  masterclass: {
    checkRegistration: '/masterclass/check-registration/',
    checkInvitation: '/masterclass/check-invitation/',
    createInvitation: '/masterclass/create-invitation/',
  },
  ebook: {
    checkRegistration: '/marketing/ebook/check-purchase/',
    checkInvitation: '/marketing/ebook/check-invitation/',
    createInvitation: '/marketing/ebook/invitation-link/',
  },
  'mini-course': {
    checkRegistration: '/marketing/mini-course/invitation/check-purchase/',
    checkInvitation: '/marketing/mini-course/invitation/check-invitation/',
    createInvitation: '/marketing/mini-course/invitation/invitation-link/',
  },
  minicourse: {
    checkRegistration: '/marketing/mini-course/invitation/check-purchase/',
    checkInvitation: '/marketing/mini-course/invitation/check-invitation/',
    createInvitation: '/marketing/mini-course/invitation/invitation-link/',
  },
}

export async function getToolById(type, toolId) {
  const slug = normalizeType(type)
  const response = await apiClient.get(`/marketing/${slug}/${toolId}`)
  return response.data
}

export async function updateTool(type, toolId, data) {
  const slug = normalizeType(type)
  const isFormData = data instanceof FormData
  const response = await apiClient.put(`/marketing/${slug}/${toolId}`, data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  })
  return response.data
}
export async function checkToolRegistration(type, toolId) {
  const slug = normalizeType(type)
  const ep = INVITATION_ENDPOINTS[slug]
  if (!ep) return { isRegistered: false, isPurchased: false }
  const response = await apiClient.get(ep.checkRegistration + toolId)
  return response.data
}

export async function checkToolInvitation(type, toolId) {
  const slug = normalizeType(type)
  const ep = INVITATION_ENDPOINTS[slug]
  if (!ep) return { existInvitation: false, invitationLink: '' }
  const response = await apiClient.get(ep.checkInvitation + toolId)
  return response.data
}

export async function createToolInvitation(type, toolId) {
  const slug = normalizeType(type)
  const ep = INVITATION_ENDPOINTS[slug]
  if (!ep) return { link: '' }
  const response = await apiClient.post(ep.createInvitation + toolId)
  return response.data
}

export async function createDinamica(data) {
  const response = await apiClient.post('/marketing/dinamica/store', data)
  return response.data
}

export async function getDinamicas() {
  const response = await apiClient.get('/marketing/dinamicas')
  return response.data
}

export async function storeDinamicaSpecifications(dinamicaId, data) {
  const response = await apiClient.post(`/marketing/dinamica/${dinamicaId}/specifications`, data)
  return response.data
}

export async function saveTrivia(dinamicaId, data) {
  const response = await apiClient.post(`/marketing/dinamica/${dinamicaId}/trivia`, data)
  return response.data
}
