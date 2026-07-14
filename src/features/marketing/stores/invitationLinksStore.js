import { defineStore } from 'pinia'
import * as invitationLinksService from '../services/invitationLinksService'

export const useInvitationLinksStore = defineStore('invitationLinks', {
  state: () => ({
    invitationLink: null,
    sponsorRemainingTime: 0,
    loading: false,
    generating: false,
    error: null,
  }),

  getters: {
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    hasActiveLink: (state) => state.invitationLink?.exists === true,
    formattedRemainingTime: (state) => {
      const seconds = state.sponsorRemainingTime
      if (!seconds) return 'Expirado'
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      return `${h}h ${m}m`
    },
  },

  actions: {
    async checkInvitation(productType, productId) {
      this.loading = true
      this.error = null
      try {
        const res = await invitationLinksService.checkInvitation(productType, productId)
        this.invitationLink = res.data || res
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al verificar invitación'
      } finally {
        this.loading = false
      }
    },

    async createInvitationLink(productType, productId) {
      this.generating = true
      this.error = null
      try {
        const res = await invitationLinksService.createInvitationLink(productType, productId)
        if (res.success) {
          this.invitationLink = res.data
        }
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al crear enlace de invitación'
      } finally {
        this.generating = false
      }
    },

    async fetchSponsorRemainingTime() {
      try {
        const res = await invitationLinksService.getSponsorRemainingTime()
        this.sponsorRemainingTime = res.tiempoRestanteEnSegundos || 0
      } catch (e) {
        this.sponsorRemainingTime = 0
      }
    },

    resetInvitation() {
      this.invitationLink = null
      this.error = null
    },
  },
})
