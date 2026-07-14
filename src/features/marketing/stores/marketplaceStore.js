import { defineStore } from 'pinia'
import * as marketplaceService from '../services/marketplaceService'

export const useMarketplaceStore = defineStore('marketplace', {
  state: () => ({
    masterclasses: [],
    ebooks: [],
    miniCourses: [],
    campaigns: [],

    // Pagination metadata
    masterclassesPagination: { currentPage: 1, lastPage: 1, perPage: 12, total: 0 },
    ebooksPagination: { currentPage: 1, lastPage: 1, perPage: 12, total: 0 },
    miniCoursesPagination: { currentPage: 1, lastPage: 1, perPage: 12, total: 0 },

    loading: false,
    error: null,
    activeTab: 'masterclass',
  }),

  getters: {
    isLoading: (state) => state.loading,

    currentList: (state) => {
      switch (state.activeTab) {
        case 'ebook': return state.ebooks
        case 'minicourse': return state.miniCourses
        case 'campaigns': return state.campaigns
        default: return state.masterclasses
      }
    },

    currentPagination: (state) => {
      switch (state.activeTab) {
        case 'ebook': return state.ebooksPagination
        case 'minicourse': return state.miniCoursesPagination
        default: return state.masterclassesPagination
      }
    },

    hasMorePages: () => (pagination) => {
      return pagination.currentPage < pagination.lastPage
    },

    hasPrevPage: () => (pagination) => {
      return pagination.currentPage > 1
    },
  },

  actions: {
    /**
     * Extract the items array from a paginated or flat response,
     * and return it along with pagination metadata.
     */
    extractPaginated(response) {
      const defaultPagination = { currentPage: 1, lastPage: 1, perPage: 12, total: 0 }

      if (!response) return { items: [], pagination: defaultPagination }

      // Paginated Laravel response wrapped in { success: true, data: { data: [...], ... } }
      if (response.success && response.data && response.data.data) {
        return {
          items: Array.isArray(response.data.data) ? response.data.data : [],
          pagination: {
            currentPage: response.data.current_page ?? 1,
            lastPage: response.data.last_page ?? 1,
            perPage: response.data.per_page ?? 12,
            total: response.data.total ?? 0,
          },
        }
      }

      // Flat array
      if (Array.isArray(response)) {
        return { items: response, pagination: defaultPagination }
      }

      // response.data is a flat array
      if (response.data && Array.isArray(response.data)) {
        return { items: response.data, pagination: defaultPagination }
      }

      return { items: [], pagination: defaultPagination }
    },

    async fetchMasterclasses(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await marketplaceService.getMasterclasses(params)
        const { items, pagination } = this.extractPaginated(response)
        this.masterclasses = items
        this.masterclassesPagination = pagination
      } catch (e) {
        console.error('Error fetching masterclasses:', e)
        this.masterclasses = []
        this.masterclassesPagination = { currentPage: 1, lastPage: 1, perPage: 12, total: 0 }
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchEbooks(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await marketplaceService.getEbooks(params)
        const { items, pagination } = this.extractPaginated(response)
        this.ebooks = items
        this.ebooksPagination = pagination
      } catch (e) {
        console.error('Error fetching ebooks:', e)
        this.ebooks = []
        this.ebooksPagination = { currentPage: 1, lastPage: 1, perPage: 12, total: 0 }
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchMiniCourses(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await marketplaceService.getMiniCourses(params)
        const { items, pagination } = this.extractPaginated(response)
        this.miniCourses = items
        this.miniCoursesPagination = pagination
      } catch (e) {
        console.error('Error fetching mini courses:', e)
        this.miniCourses = []
        this.miniCoursesPagination = { currentPage: 1, lastPage: 1, perPage: 12, total: 0 }
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchCampaigns() {
      this.loading = true
      this.error = null
      try {
        const response = await marketplaceService.getCampaigns()
        const { items } = this.extractPaginated(response)
        this.campaigns = items
      } catch (e) {
        console.error('Error fetching campaigns:', e)
        this.campaigns = []
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    // ── Pagination navigation helpers ──
    async goToPage(page) {
      const pagination = this.currentPagination
      if (page < 1 || page > pagination.lastPage) return

      const params = { page, per_page: pagination.perPage }

      switch (this.activeTab) {
        case 'ebook':
          await this.fetchEbooks(params)
          break
        case 'minicourse':
          await this.fetchMiniCourses(params)
          break
        default:
          await this.fetchMasterclasses(params)
      }
    },

    async nextPage() {
      const { currentPage, lastPage } = this.currentPagination
      if (currentPage < lastPage) {
        await this.goToPage(currentPage + 1)
      }
    },

    async prevPage() {
      const { currentPage } = this.currentPagination
      if (currentPage > 1) {
        await this.goToPage(currentPage - 1)
      }
    },

    setActiveTab(tab) {
      this.activeTab = tab
    },

    clearError() {
      this.error = null
    },
  },
})
