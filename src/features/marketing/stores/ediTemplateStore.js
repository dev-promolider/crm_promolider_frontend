import { defineStore } from 'pinia'
import * as ediTemplateService from '../services/ediTemplateService'

export const useEdiTemplateStore = defineStore('ediTemplate', {
  state: () => ({
    templates: [],
    userTemplates: [],
    currentTemplate: null,
    loading: false,
    saving: false,
    error: null,
  }),

  getters: {
    isLoading: (state) => state.loading,
    isSaving: (state) => state.saving,
    publishedTemplates: (state) => state.userTemplates.filter(t => t.status === 'published'),
    draftTemplates: (state) => state.userTemplates.filter(t => t.status === 'draft'),
  },

  actions: {
    extractData(response) {
      if (!response) return []
      if (Array.isArray(response)) return response
      if (response.data && Array.isArray(response.data)) return response.data
      if (response.success && response.data) {
        if (Array.isArray(response.data)) return response.data
        if (response.data.data && Array.isArray(response.data.data)) return response.data.data
      }
      return []
    },

    async fetchTemplates() {
      this.loading = true
      this.error = null
      try {
        const response = await ediTemplateService.getEdiTemplates()
        this.templates = this.extractData(response)
      } catch (e) {
        console.error('Error fetching editable templates:', e)
        this.templates = []
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchUserTemplates(userId) {
      this.loading = true
      this.error = null
      try {
        const response = await ediTemplateService.getUserEdiTemplates(userId)
        this.userTemplates = this.extractData(response)
      } catch (e) {
        console.error('Error fetching user editable templates:', e)
        this.userTemplates = []
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchTemplate(id) {
      this.loading = true
      this.error = null
      try {
        const response = await ediTemplateService.getEdiTemplate(id)
        this.currentTemplate = response?.data || response || null
        return this.currentTemplate
      } catch (e) {
        console.error('Error fetching editable template:', e)
        this.currentTemplate = null
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    async saveTemplate(data, id = null) {
      this.saving = true
      this.error = null
      try {
        let response
        if (id) {
          response = await ediTemplateService.updateEdiTemplate(id, data)
          const idx = this.userTemplates.findIndex(t => t.id === id)
          if (idx !== -1) this.userTemplates[idx] = response?.data || response
        } else {
          response = await ediTemplateService.createEdiTemplate(data)
          const newTemplate = response?.data || response
          if (newTemplate && !this.userTemplates.find(t => t.id === newTemplate.id)) {
            this.userTemplates.push(newTemplate)
          }
        }
        return response
      } catch (e) {
        console.error('Error saving editable template:', e)
        this.error = e.message
        throw e
      } finally {
        this.saving = false
      }
    },

    async deleteTemplate(id) {
      this.loading = true
      this.error = null
      try {
        await ediTemplateService.deleteEdiTemplate(id)
        this.userTemplates = this.userTemplates.filter(t => t.id !== id)
      } catch (e) {
        console.error('Error deleting editable template:', e)
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    clearCurrent() {
      this.currentTemplate = null
    },

    clearError() {
      this.error = null
    },
  },
})
