import { defineStore } from 'pinia'
import * as pageBuilderService from '../services/pageBuilderService'

export const usePageBuilderStore = defineStore('pageBuilder', {
  state: () => ({
    templates: [],
    userPages: [],
    currentPage: null,
    loading: false,
    saving: false,
    error: null,
  }),

  getters: {
    isLoading: (state) => state.loading,
    isSaving: (state) => state.saving,
    publishedPages: (state) => state.userPages.filter(p => p.status === 1 || p.status === 'published'),
    draftPages: (state) => state.userPages.filter(p => p.status !== 1 && p.status !== 'published'),
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

    async fetchTemplates() {
      this.loading = true
      this.error = null
      try {
        const response = await pageBuilderService.getTemplates()
        this.templates = this.extractData(response)
      } catch (e) {
        console.error('Error fetching templates:', e)
        this.templates = []
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchUserPages(userId) {
      this.loading = true
      this.error = null
      try {
        const response = await pageBuilderService.getUserPages(userId)
        this.userPages = this.extractData(response)
      } catch (e) {
        console.error('Error fetching user pages:', e)
        this.userPages = []
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchPage(id) {
      this.loading = true
      this.error = null
      try {
        const response = await pageBuilderService.getPage(id)
        this.currentPage = response?.data || response || null
        return this.currentPage
      } catch (e) {
        console.error('Error fetching page:', e)
        this.currentPage = null
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    async savePage(pageData, id = null) {
      this.saving = true
      this.error = null
      try {
        let response
        if (id) {
          response = await pageBuilderService.updatePage(id, pageData)
          const idx = this.userPages.findIndex(p => p.id === id)
          if (idx !== -1) this.userPages[idx] = response?.data || response
        } else {
          response = await pageBuilderService.createPage(pageData)
          const newPage = response?.data || response
          if (newPage && !this.userPages.find(p => p.id === newPage.id)) {
            this.userPages.push(newPage)
          }
        }
        return response
      } catch (e) {
        console.error('Error saving page:', e)
        this.error = e.message
        throw e
      } finally {
        this.saving = false
      }
    },

    async deletePage(id) {
      this.loading = true
      this.error = null
      try {
        await pageBuilderService.deletePage(id)
        this.userPages = this.userPages.filter(p => p.id !== id)
      } catch (e) {
        console.error('Error deleting page:', e)
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    async publishPage(id) {
      this.saving = true
      this.error = null
      try {
        const response = await pageBuilderService.publishPage(id)
        const updated = response?.data
        if (updated) {
          const idx = this.userPages.findIndex(p => p.id === id)
          if (idx !== -1) this.userPages[idx] = updated
        }
        if (this.currentPage?.id === id) this.currentPage = updated
        return response
      } catch (e) {
        console.error('Error publishing page:', e)
        this.error = e.message
        throw e
      } finally {
        this.saving = false
      }
    },

    async unpublishPage(id) {
      this.saving = true
      this.error = null
      try {
        const response = await pageBuilderService.unpublishPage(id)
        const updated = response?.data
        if (updated) {
          const idx = this.userPages.findIndex(p => p.id === id)
          if (idx !== -1) this.userPages[idx] = updated
        }
        if (this.currentPage?.id === id) this.currentPage = updated
        return response
      } catch (e) {
        console.error('Error unpublishing page:', e)
        this.error = e.message
        throw e
      } finally {
        this.saving = false
      }
    },

    clearCurrentPage() {
      this.currentPage = null
    },

    clearError() {
      this.error = null
    },
  },
})
