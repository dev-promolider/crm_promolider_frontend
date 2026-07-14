import { defineStore } from 'pinia'
import * as paymentLinksService from '../services/paymentLinksService'

export const usePaymentLinksStore = defineStore('paymentLinks', {
  state: () => ({
    links: [],
    currentLink: null,
    loading: false,
    error: null,
  }),

  getters: {
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    activeLinks: (state) => state.links.filter(l => l.active),
  },

  actions: {
    async fetchLinks(params = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await paymentLinksService.getPaymentLinks(params)
        this.links = res.data || []
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al cargar enlaces de pago'
      } finally {
        this.loading = false
      }
    },

    async fetchLink(id) {
      this.loading = true
      this.error = null
      try {
        const res = await paymentLinksService.getPaymentLink(id)
        this.currentLink = res.data || null
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al cargar enlace'
      } finally {
        this.loading = false
      }
    },

    async createLink(data) {
      this.error = null
      try {
        const res = await paymentLinksService.createPaymentLink(data)
        this.links.unshift(res.data)
        return res.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al crear enlace'
        throw e
      }
    },

    async updateLink(id, data) {
      this.error = null
      try {
        const res = await paymentLinksService.updatePaymentLink(id, data)
        const idx = this.links.findIndex(l => l.id === id)
        if (idx !== -1) this.links[idx] = res.data
        if (this.currentLink?.id === id) this.currentLink = res.data
        return res.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al actualizar enlace'
        throw e
      }
    },

    async toggleLinkStatus(id) {
      this.error = null
      try {
        const res = await paymentLinksService.togglePaymentLinkStatus(id)
        const idx = this.links.findIndex(l => l.id === id)
        if (idx !== -1) this.links[idx] = res.data
        if (this.currentLink?.id === id) this.currentLink = res.data
        return res.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al cambiar estado'
        throw e
      }
    },

    async removeLink(id) {
      this.error = null
      try {
        await paymentLinksService.deletePaymentLink(id)
        this.links = this.links.filter(l => l.id !== id)
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al eliminar enlace'
        throw e
      }
    },
  },
})
