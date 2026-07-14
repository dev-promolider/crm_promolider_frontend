import { defineStore } from 'pinia'
import * as marketingService from '../services/marketingService'

export const useMarketingStore = defineStore('marketing', {
  state: () => ({
    tools: [],
    categories: [],
    loading: false,
    error: null,
  }),

  getters: {
    isLoading: (state) => state.loading,
    getToolById: (state) => (id) => state.tools.find(t => t.id === id) || null,
    toolsByType: (state) => (type) => state.tools.filter(t => t.tipo === type || t.type === type),
  },

  actions: {
    extractData(response) {
      if (!response) return []
      if (Array.isArray(response)) return response
      if (response.data && Array.isArray(response.data)) return response.data
      if (response.success && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) return response.data.data
      }
      return []
    },

    async loadTools() {
      this.loading = true
      this.error = null
      try {
        const response = await marketingService.getTools()
        this.tools = this.extractData(response)
      } catch (error) {
        console.error('Error al cargar herramientas:', error)
        this.error = error.response?.data?.message || 'Error al cargar herramientas'
        this.tools = []
      } finally {
        this.loading = false
      }
    },

    async loadCategories() {
      try {
        const response = await marketingService.getCategories()
        this.categories = this.extractData(response)
      } catch (error) {
        console.error('Error al cargar categorías:', error)
        this.categories = []
      }
    },

    async changeToolStatus(toolId, newStatus, toolType) {
      try {
        await marketingService.changeToolStatus(toolType, toolId, newStatus)
        const tool = this.tools.find(t => t.id === toolId)
        // Convertir a número porque el select devuelve string pero la BD tiene int
        if (tool) tool.status = parseInt(newStatus, 10)
        return true
      } catch (error) {
        console.error('Error al cambiar estado:', error)
        throw error
      }
    },

    async getToolById(toolId, toolType) {
      try {
        const response = await marketingService.getToolById(toolType, toolId)
        return response.data || response
      } catch (error) {
        console.error('Error al obtener herramienta:', error)
        throw error
      }
    },

    async updateTool(toolId, toolType, data) {
      try {
        await marketingService.updateTool(toolType, toolId, data)
        await this.loadTools()
        return true
      } catch (error) {
        console.error('Error al actualizar herramienta:', error)
        throw error
      }
    },

    async deleteTool(toolId, toolType) {
      try {
        await marketingService.deleteTool(toolType, toolId)
        this.tools = this.tools.filter(t => t.id !== toolId)
      } catch (error) {
        console.error('Error al eliminar herramienta:', error)
        throw error
      }
    },

    async checkToolRegistration(toolId, toolType) {
      try {
        return await marketingService.checkToolRegistration(toolType, toolId)
      } catch (error) {
        return { isRegistered: false, isPurchased: false }
      }
    },

    async checkToolInvitation(toolId, toolType) {
      try {
        return await marketingService.checkToolInvitation(toolType, toolId)
      } catch (error) {
        return { existInvitation: false, invitationLink: '' }
      }
    },

    async createToolInvitation(toolId, toolType) {
      try {
        return await marketingService.createToolInvitation(toolType, toolId)
      } catch (error) {
        console.error('Error al crear invitación:', error)
        return { link: '' }
      }
    },

    clearError() {
      this.error = null
    },
  },
})
