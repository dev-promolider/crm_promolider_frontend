import apiClient from '@/services/apiClient'

export async function getQuestionCategories(params = {}) {
  const response = await apiClient.get('/marketing/question-categories', { params })
  return response.data
}

export async function getQuestionCategory(id) {
  const response = await apiClient.get('/marketing/question-categories/' + id)
  return response.data
}

export async function createQuestionCategory(data) {
  const response = await apiClient.post('/marketing/question-categories', data)
  return response.data
}

export async function updateQuestionCategory(id, data) {
  const response = await apiClient.put('/marketing/question-categories/' + id, data)
  return response.data
}

export async function toggleQuestionCategoryStatus(id) {
  const response = await apiClient.patch('/marketing/question-categories/' + id + '/toggle')
  return response.data
}

export async function deleteQuestionCategory(id) {
  const response = await apiClient.delete('/marketing/question-categories/' + id)
  return response.data
}

// ─── Question Items ───────────────────────────────────────────────────

export async function getQuestions(categoryId, params = {}) {
  const response = await apiClient.get('/marketing/question-categories/' + categoryId + '/questions', { params })
  return response.data
}

export async function createQuestion(categoryId, data) {
  const response = await apiClient.post('/marketing/question-categories/' + categoryId + '/questions', data)
  return response.data
}

export async function updateQuestion(categoryId, questionId, data) {
  const response = await apiClient.put('/marketing/question-categories/' + categoryId + '/questions/' + questionId, data)
  return response.data
}

export async function deleteQuestion(categoryId, questionId) {
  const response = await apiClient.delete('/marketing/question-categories/' + categoryId + '/questions/' + questionId)
  return response.data
}
