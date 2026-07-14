import apiClient from '@/services/apiClient'

export async function getPaymentLinks(params = {}) {
  const response = await apiClient.get('/marketing/payment-links', { params })
  return response.data
}

export async function getPaymentLink(id) {
  const response = await apiClient.get('/marketing/payment-links/' + id)
  return response.data
}

export async function createPaymentLink(data) {
  const response = await apiClient.post('/marketing/payment-links', data)
  return response.data
}

export async function updatePaymentLink(id, data) {
  const response = await apiClient.put('/marketing/payment-links/' + id, data)
  return response.data
}

export async function togglePaymentLinkStatus(id) {
  const response = await apiClient.patch('/marketing/payment-links/' + id + '/toggle')
  return response.data
}

export async function deletePaymentLink(id) {
  const response = await apiClient.delete('/marketing/payment-links/' + id)
  return response.data
}
