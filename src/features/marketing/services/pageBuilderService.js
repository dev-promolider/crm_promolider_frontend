import apiClient from '@/services/apiClient'

export async function getTemplates() {
  const response = await apiClient.get('/marketing/pages/templates')
  return response.data
}

export async function getUserPages(userId) {
  const response = await apiClient.get(`/marketing/pages/user/${userId}/templates`)
  return response.data
}

export async function getPage(id) {
  const response = await apiClient.get(`/marketing/pages/templates/${id}`)
  return response.data
}

export async function createPage(pageData) {
  const response = await apiClient.post('/marketing/pages/templates', pageData)
  return response.data
}

export async function updatePage(id, pageData) {
  const response = await apiClient.put(`/marketing/pages/templates/${id}`, pageData)
  return response.data
}

export async function deletePage(id) {
  const response = await apiClient.delete(`/marketing/pages/templates/${id}`)
  return response.data
}

export async function publishPage(id) {
  const response = await apiClient.post(`/marketing/pages/templates/${id}/publish`)
  return response.data
}

export async function unpublishPage(id) {
  const response = await apiClient.post(`/marketing/pages/templates/${id}/unpublish`)
  return response.data
}
