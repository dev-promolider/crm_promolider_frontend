import apiClient from '@/services/apiClient'

export async function createInvitationLink(productType, productId) {
  const response = await apiClient.post(`/marketing/invitations/${productType}/${productId}/create`)
  return response.data
}

export async function checkInvitation(productType, productId) {
  const response = await apiClient.get(`/marketing/invitations/${productType}/${productId}/check`)
  return response.data
}

export async function getSponsorRemainingTime() {
  const response = await apiClient.get('/marketing/sponsor-links/remaining-time')
  return response.data
}

export async function getUserSponsorInfo(username) {
  const response = await apiClient.get(`/marketing/sponsor-links/user-info/${username}`)
  return response.data
}
