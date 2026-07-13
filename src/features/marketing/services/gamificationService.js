import apiClient from '@/services/apiClient'

// Ranking
export async function getRanking() {
  const response = await apiClient.get('/marketing/gamification/ranking')
  return response.data
}

export async function getMyGamificationInfo() {
  const response = await apiClient.get('/marketing/gamification/my-info')
  return response.data
}

// Config
export async function getPointConfig() {
  const response = await apiClient.get('/marketing/gamification/config')
  return response.data
}

export async function updatePointConfig(id, data) {
  const response = await apiClient.put('/marketing/gamification/config/' + id, data)
  return response.data
}

// Levels
export async function getLevels() {
  const response = await apiClient.get('/marketing/gamification/levels')
  return response.data
}

export async function createLevel(data) {
  const response = await apiClient.post('/marketing/gamification/levels', data)
  return response.data
}

export async function updateLevel(id, data) {
  const response = await apiClient.put('/marketing/gamification/levels/' + id, data)
  return response.data
}

// Badges
export async function getBadges() {
  const response = await apiClient.get('/marketing/gamification/badges')
  return response.data
}

export async function getMyBadges() {
  const response = await apiClient.get('/marketing/gamification/my-badges')
  return response.data
}

export async function createBadge(data) {
  const response = await apiClient.post('/marketing/gamification/badges', data)
  return response.data
}

export async function updateBadge(id, data) {
  const response = await apiClient.put('/marketing/gamification/badges/' + id, data)
  return response.data
}

export async function deleteBadge(id) {
  const response = await apiClient.delete('/marketing/gamification/badges/' + id)
  return response.data
}

// Rewards (Admin)
export async function getRewards() {
  const response = await apiClient.get('/marketing/gamification/rewards')
  return response.data
}

export async function createReward(data) {
  const response = await apiClient.post('/marketing/gamification/rewards', data)
  return response.data
}

export async function updateReward(id, data) {
  const response = await apiClient.put('/marketing/gamification/rewards/' + id, data)
  return response.data
}

export async function deleteReward(id) {
  const response = await apiClient.delete('/marketing/gamification/rewards/' + id)
  return response.data
}

export async function restoreReward(id) {
  const response = await apiClient.post('/marketing/gamification/rewards/' + id + '/restore')
  return response.data
}

export async function getRewardStats() {
  const response = await apiClient.get('/marketing/gamification/rewards/stats')
  return response.data
}

export async function getRedemptions(params = {}) {
  const response = await apiClient.get('/marketing/gamification/redemptions', { params })
  return response.data
}

export async function processRedemption(id, data) {
  const response = await apiClient.post('/marketing/gamification/redemptions/' + id + '/process', data)
  return response.data
}

// User Rewards
export async function getAvailableRewards() {
  const response = await apiClient.get('/marketing/gamification/available-rewards')
  return response.data
}

export async function getMyCredits() {
  const response = await apiClient.get('/marketing/gamification/my-credits')
  return response.data
}

export async function redeemReward(rewardId) {
  const response = await apiClient.post('/marketing/gamification/redeem', { reward_id: rewardId })
  return response.data
}

export async function getMyRedemptions() {
  const response = await apiClient.get('/marketing/gamification/my-redemptions')
  return response.data
}
