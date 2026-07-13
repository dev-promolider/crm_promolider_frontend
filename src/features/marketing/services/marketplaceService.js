import apiClient from '@/services/apiClient'

export async function getMasterclasses(params = {}) {
  const response = await apiClient.get('/marketing/marketplace/masterclasses', { params })
  return response.data
}

export async function getEbooks(params = {}) {
  const response = await apiClient.get('/marketing/marketplace/ebooks', { params })
  return response.data
}

export async function getMiniCourses(params = {}) {
  const response = await apiClient.get('/marketing/marketplace/mini-courses', { params })
  return response.data
}

export async function getCampaigns(params = {}) {
  const response = await apiClient.get('/marketing/marketplace/campaigns', { params })
  return response.data
}

export async function getMasterclassDetail(id) {
  const response = await apiClient.get(`/marketing/marketplace/masterclass/${id}`)
  return response.data
}

export async function getEbookDetail(id) {
  const response = await apiClient.get(`/marketing/marketplace/ebook/${id}`)
  return response.data
}

export async function getMiniCourseDetail(id) {
  const response = await apiClient.get(`/marketing/marketplace/mini-course/${id}`)
  return response.data
}
