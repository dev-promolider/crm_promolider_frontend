import { defineStore } from 'pinia'
import * as gamificationService from '../services/gamificationService'

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    ranking: [],
    myPosition: 0,
    myInfo: null,
    configs: [],
    levels: [],
    badges: [],
    myBadges: [],
    rewards: [],
    rewardStats: null,
    redemptions: { items: [], total: 0 },
    availableRewards: [],
    myCredits: 0,
    myRedemptions: [],
    loading: false,
    error: null,
  }),

  getters: {
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    topRanking: (state) => state.ranking.slice(0, 3),
    pendingRedemptions: (state) => state.redemptions.items.filter(r => r.status === 'pending'),
  },

  actions: {
    async fetchRanking() {
      this.loading = true; this.error = null
      try {
        const res = await gamificationService.getRanking()
        if (res.success) {
          this.ranking = res.data.ranking || []
          this.myPosition = res.data.my_position || 0
        }
      } catch (e) { this.error = e.response?.data?.message || 'Error al cargar ranking'
      } finally { this.loading = false }
    },

    async fetchMyInfo() {
      try {
        const res = await gamificationService.getMyGamificationInfo()
        if (res.success) this.myInfo = res.data
      } catch (e) { /* ignore */ }
    },

    async fetchConfigs() {
      try {
        const res = await gamificationService.getPointConfig()
        if (res.success) this.configs = res.data
      } catch (e) { this.error = 'Error al cargar configuración' }
    },

    async saveConfig(id, data) {
      try {
        const res = await gamificationService.updatePointConfig(id, data)
        if (res.success) await this.fetchConfigs()
        return res
      } catch (e) { return { success: false, message: 'Error al guardar configuración' } }
    },

    async fetchLevels() {
      try {
        const res = await gamificationService.getLevels()
        if (res.success) this.levels = res.data
      } catch (e) { this.error = 'Error al cargar niveles' }
    },

    async createLevel(data) {
      try {
        const res = await gamificationService.createLevel(data)
        if (res.success) await this.fetchLevels()
        return res
      } catch (e) { return { success: false, message: 'Error al crear nivel' } }
    },

    async updateLevel(id, data) {
      try {
        const res = await gamificationService.updateLevel(id, data)
        if (res.success) await this.fetchLevels()
        return res
      } catch (e) { return { success: false, message: 'Error al actualizar nivel' } }
    },

    async fetchBadges() {
      try {
        const res = await gamificationService.getBadges()
        if (res.success) this.badges = res.data
      } catch (e) { this.error = 'Error al cargar insignias' }
    },

    async fetchMyBadges() {
      try {
        const res = await gamificationService.getMyBadges()
        if (res.success) this.myBadges = res.data
      } catch (e) { /* ignore */ }
    },

    async createBadge(data) {
      try {
        const res = await gamificationService.createBadge(data)
        if (res.success) await this.fetchBadges()
        return res
      } catch (e) { return { success: false, message: 'Error al crear insignia' } }
    },

    async updateBadge(id, data) {
      try {
        const res = await gamificationService.updateBadge(id, data)
        if (res.success) await this.fetchBadges()
        return res
      } catch (e) { return { success: false, message: 'Error al actualizar insignia' } }
    },

    async deleteBadge(id) {
      try {
        const res = await gamificationService.deleteBadge(id)
        if (res.success) await this.fetchBadges()
        return res
      } catch (e) { return { success: false, message: 'Error al eliminar insignia' } }
    },

    async fetchRewards() {
      try {
        const res = await gamificationService.getRewards()
        if (res.success) this.rewards = res.data
      } catch (e) { this.error = 'Error al cargar recompensas' }
    },

    async createReward(data) {
      try {
        const res = await gamificationService.createReward(data)
        if (res.success) await this.fetchRewards()
        return res
      } catch (e) { return { success: false, message: 'Error al crear recompensa' } }
    },

    async updateReward(id, data) {
      try {
        const res = await gamificationService.updateReward(id, data)
        if (res.success) await this.fetchRewards()
        return res
      } catch (e) { return { success: false, message: 'Error al actualizar recompensa' } }
    },

    async deleteReward(id) {
      try {
        const res = await gamificationService.deleteReward(id)
        if (res.success) await this.fetchRewards()
        return res
      } catch (e) { return { success: false, message: 'Error al eliminar recompensa' } }
    },

    async restoreReward(id) {
      try {
        const res = await gamificationService.restoreReward(id)
        if (res.success) await this.fetchRewards()
        return res
      } catch (e) { return { success: false, message: 'Error al restaurar recompensa' } }
    },

    async fetchRewardStats() {
      try {
        const res = await gamificationService.getRewardStats()
        if (res.success) this.rewardStats = res.data
      } catch (e) { /* ignore */ }
    },

    async fetchRedemptions(params = {}) {
      try {
        const res = await gamificationService.getRedemptions(params)
        if (res.success) this.redemptions = res.data
      } catch (e) { this.error = 'Error al cargar canjes' }
    },

    async processRedemption(id, data) {
      try {
        const res = await gamificationService.processRedemption(id, data)
        if (res.success) await this.fetchRedemptions()
        return res
      } catch (e) { return { success: false, message: 'Error al procesar canje' } }
    },

    async fetchAvailableRewards() {
      try {
        const res = await gamificationService.getAvailableRewards()
        if (res.success) this.availableRewards = res.data
      } catch (e) { /* ignore */ }
    },

    async fetchMyCredits() {
      try {
        const res = await gamificationService.getMyCredits()
        if (res.success) this.myCredits = res.data.credits || 0
      } catch (e) { /* ignore */ }
    },

    async redeemReward(rewardId) {
      try {
        const res = await gamificationService.redeemReward(rewardId)
        if (res.success) {
          await this.fetchMyCredits()
          await this.fetchMyRedemptions()
        }
        return res
      } catch (e) { return { success: false, message: 'Error al canjear recompensa' } }
    },

    async fetchMyRedemptions() {
      try {
        const res = await gamificationService.getMyRedemptions()
        if (res.success) this.myRedemptions = res.data
      } catch (e) { /* ignore */ }
    },
  },
})
