import apiClient from '@/services/apiClient'

/**
 * Obtiene eventos del calendario según el rol del usuario
 */
export async function getCalendarEvents(role, userId) {
  const endpointMap = {
    admin: '/marketing/calendar/admin',
    producer: `/marketing/calendar/producer/${userId}`,
    distributor: `/marketing/calendar/distributor/${userId}`,
  }
  const url = endpointMap[role] || endpointMap.admin
  const response = await apiClient.get(url)
  return response.data
}

/**
 * Obtiene las actividades/reuniones de un usuario
 */
export async function getActivities(userId) {
  const response = await apiClient.get(`/marketing/calendar/activities/${userId}`)
  return response.data
}

/**
 * Crea una nueva reunión
 */
export async function createMeeting(meetingData) {
  const response = await apiClient.post('/marketing/calendar/meetings', meetingData)
  return response.data
}

// ---- Notas del calendario ----

/**
 * Obtiene las notas del usuario en un rango de fechas opcional
 */
export async function getNotes(params = {}) {
  const response = await apiClient.get('/marketing/calendar/notes', { params })
  return response.data
}

/**
 * Sincroniza notas (crea/actualiza en batch)
 */
export async function syncNotes(notes) {
  const response = await apiClient.post('/marketing/calendar/notes/sync', { notes })
  return response.data
}

/**
 * Crea una nueva nota
 */
export async function createNote(noteData) {
  const response = await apiClient.post('/marketing/calendar/notes', noteData)
  return response.data
}

/**
 * Actualiza una nota existente
 */
export async function updateNote(id, noteData) {
  const response = await apiClient.put(`/marketing/calendar/notes/${id}`, noteData)
  return response.data
}

/**
 * Elimina una nota
 */
export async function deleteNote(id) {
  const response = await apiClient.delete(`/marketing/calendar/notes/${id}`)
  return response.data
}
