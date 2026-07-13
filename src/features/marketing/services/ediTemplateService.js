import apiClient from '@/services/apiClient'

export async function getEdiTemplates() {
  const response = await apiClient.get('/marketing/edi-templates')
  return response.data
}

export async function getUserEdiTemplates(userId) {
  const response = await apiClient.get(`/marketing/edi-templates/user/${userId}`)
  return response.data
}

export async function getEdiTemplate(id) {
  const response = await apiClient.get(`/marketing/edi-templates/${id}`)
  return response.data
}

export async function createEdiTemplate(data) {
  const response = await apiClient.post('/marketing/edi-templates', data)
  return response.data
}

export async function updateEdiTemplate(id, data) {
  const response = await apiClient.put(`/marketing/edi-templates/${id}`, data)
  return response.data
}

export async function deleteEdiTemplate(id) {
  const response = await apiClient.delete(`/marketing/edi-templates/${id}`)
  return response.data
}
