import apiClient from '@/services/apiClient'

export async function getMasterclassReport(view, userId = null) {
  const params = userId ? { user_id: userId } : {}
  const endpoint = `/marketing/reports/masterclass/${view}`
  const response = await apiClient.get(endpoint, { params })
  return response.data
}

export async function getMiniCourseReport(view, userId = null) {
  const params = userId ? { user_id: userId } : {}
  const endpoint = `/marketing/reports/mini-course/${view}`
  const response = await apiClient.get(endpoint, { params })
  return response.data
}

export async function getEbookReport(view, userId = null) {
  const params = userId ? { user_id: userId } : {}
  const endpoint = `/marketing/reports/ebook/${view}`
  const response = await apiClient.get(endpoint, { params })
  return response.data
}

export async function getPrivateContent(type = null) {
  const params = type ? { type } : {}
  const response = await apiClient.get('/marketing/reports/private-content', { params })
  return response.data
}

export async function getPrivateContentStudents(contentType, contentId) {
  const response = await apiClient.get(`/marketing/reports/private-content/${contentType}/${contentId}/students`)
  return response.data
}

export async function getContentByStatus() {
  const response = await apiClient.get('/marketing/reports/content-by-status')
  return response.data
}

export async function getContentByProducer() {
  const response = await apiClient.get('/marketing/reports/content-by-producer')
  return response.data
}

export async function getGeneralReports() {
  const response = await apiClient.get('/marketing/reports/general')
  return response.data
}

// ── Nuevos endpoints de Reportes ──

export async function getDistributorsReport(type, contentId) {
  const response = await apiClient.get(`/marketing/reports/distributors/${type}/${contentId}`)
  return response.data
}

export async function getStudentsReport(type, contentId) {
  const response = await apiClient.get(`/marketing/reports/students/${type}/${contentId}`)
  return response.data
}

export async function getPendingParticipantsReport(type, contentId) {
  const response = await apiClient.get(`/marketing/reports/participants/pending/${type}/${contentId}`)
  return response.data
}

export async function getStudentsList() {
  const response = await apiClient.get('/marketing/reports/students-list')
  return response.data
}

export async function getAllPendingParticipants(isParticipant = null) {
  let endpoint = '/marketing/reports/participants/all'
  if (isParticipant !== null) {
    endpoint += `/${isParticipant}`
  }
  const response = await apiClient.get(endpoint)
  return response.data
}

export async function getLastSells() {
  const response = await apiClient.get('/marketing/reports/last-sells')
  return response.data
}
