import apiClient from '@/services/apiClient'

export async function getPublicDinamica(slug) {
  const response = await apiClient.get(`/d/${slug}`)
  return response.data
}

export async function registerParticipant(slug, data) {
  const response = await apiClient.post(`/d/${slug}/register`, data)
  return response.data
}

export async function spinRoulette(slug, email = null) {
  const payload = email ? { email } : {}
  const response = await apiClient.post(`/d/${slug}/spin`, payload)
  return response.data
}

export async function getDinamicaStatus(slug) {
  const response = await apiClient.get(`/d/${slug}/status`)
  return response.data
}

export async function getParticipantsFeed(slug) {
  const response = await apiClient.get(`/d/${slug}/participants-feed`)
  return response.data
}

export async function markAsPlayed(slug, email = null) {
  const payload = email ? { email } : {}
  const response = await apiClient.post(`/d/${slug}/marcar-jugado`, payload)
  return response.data
}

export async function registerWinner(slug, email = null, premio = null) {
  const payload = { ...(email ? { email } : {}), ...(premio ? { premio } : {}) }
  const response = await apiClient.post(`/d/${slug}/registrar-ganador`, payload)
  return response.data
}

// Trivia
export async function getTriviaPreview(slug, email = null) {
  const params = email ? { email } : {}
  const response = await apiClient.get(`/d/${slug}/preview`, { params })
  return response.data
}

export async function getTriviaQuestion(slug, numero, email = null) {
  const params = email ? { email } : {}
  const response = await apiClient.get(`/d/${slug}/pregunta/${numero}`, { params })
  return response.data
}

export async function submitTriviaAnswer(slug, numero, email = null, payload) {
  const body = { ...(email ? { email } : {}), ...payload }
  const response = await apiClient.post(`/d/${slug}/pregunta/${numero}/respuesta`, body)
  return response.data
}

export async function getTriviaResults(slug) {
  const response = await apiClient.get(`/d/${slug}/resultados`)
  return response.data
}
