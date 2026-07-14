import apiClient from '@/services/apiClient'

export async function getFreeCourses(params = {}) {
  const response = await apiClient.get('/marketing/freecourses', { params })
  return response.data
}

export async function createFreeCourse(data) {
  const response = await apiClient.post('/marketing/freecourses', data)
  return response.data
}

export async function deleteFreeCourse(id) {
  const response = await apiClient.delete('/marketing/freecourses/' + id)
  return response.data
}
