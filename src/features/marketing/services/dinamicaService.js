import apiClient from '@/services/apiClient'

// === Management API ===

export async function getMyDinamicas() {
  const r = await apiClient.get('/marketing/dinamicas')
  return r.data
}

export async function getDinamica(id) {
  const r = await apiClient.get('/marketing/dinamicas/' + id)
  return r.data
}

export async function createDinamica(data) {
  const r = await apiClient.post('/marketing/dinamica/store', data)
  return r.data
}

export async function updateDinamica(id, data) {
  const r = await apiClient.put('/marketing/dinamicas/' + id, data)
  return r.data
}

export async function deleteDinamica(id) {
  const r = await apiClient.delete('/marketing/dinamicas/' + id)
  return r.data
}

export async function toggleDinamicaStatus(id) {
  const r = await apiClient.post('/marketing/dinamicas/' + id + '/toggle-status')
  return r.data
}

export async function storeSpecifications(dinamicaId, data) {
  const r = await apiClient.post('/marketing/dinamica/' + dinamicaId + '/specifications', data)
  return r.data
}

export async function saveTriviaConfig(dinamicaId, data) {
  const r = await apiClient.post('/marketing/dinamica/' + dinamicaId + '/trivia', data)
  return r.data
}
