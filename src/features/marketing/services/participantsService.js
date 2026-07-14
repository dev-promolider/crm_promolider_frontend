import apiClient from '@/services/apiClient'

/**
 * Actualizar estado de participante en Masterclass
 * participant: 0=No participa, 1=Participa, 2=Finalizado, 3=Observador
 */
export async function updateMasterclassParticipantStatus(userId, participant) {
  const response = await apiClient.patch(`/marketing/participants/masterclass/${userId}/participant`, { participant })
  return response.data
}

/**
 * Actualizar observación de un estudiante de Masterclass
 */
export async function updateMasterclassObservation(userId, observation) {
  const response = await apiClient.patch(`/marketing/participants/masterclass/${userId}/observation`, { observation })
  return response.data
}

/**
 * Actualizar estado de participante en Ebook
 */
export async function updateEbookParticipantStatus(userId, participant) {
  const response = await apiClient.patch(`/marketing/participants/ebook/${userId}/participant`, { participant })
  return response.data
}

/**
 * Actualizar observación de un estudiante de Ebook
 */
export async function updateEbookObservation(userId, observation) {
  const response = await apiClient.patch(`/marketing/participants/ebook/${userId}/observation`, { observation })
  return response.data
}

/**
 * Actualizar estado de participante en Mini Curso
 */
export async function updateMiniCourseParticipantStatus(userId, participant) {
  const response = await apiClient.patch(`/marketing/participants/mini-course/${userId}/participant`, { participant })
  return response.data
}

/**
 * Actualizar observación de un estudiante de Mini Curso
 */
export async function updateMiniCourseObservation(userId, observation) {
  const response = await apiClient.patch(`/marketing/participants/mini-course/${userId}/observation`, { observation })
  return response.data
}
