import { defineStore } from 'pinia'
import * as reportsService from '../services/reportsService'

export const useReportsStore = defineStore('reports', {
  state: () => ({
    masterclassAdmin: [],
    masterclassProducer: [],
    masterclassDistributor: [],
    miniCourseAdmin: [],
    miniCourseProducer: [],
    miniCourseDistributor: [],
    ebookAdmin: [],
    ebookProducer: [],
    ebookDistributor: [],
    privateContent: [],
    privateContentStudents: [],
    contentByStatus: [],
    contentByProducer: [],
    generalReports: null,
    studentsList: [],
    allPendingParticipants: [],
    lastSells: [],
    loading: false,
    error: null,
  }),

  getters: {
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
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

    getStateKey(view) {
      const map = {
        admin: 'Admin',
        'admin-m': 'Admin',
        'admin-d': 'Admin',
        producer: 'Producer',
        'producer-m': 'Producer',
        'producer-d': 'Producer',
        distributor: 'Distributor',
      }
      return map[view] || 'Admin'
    },

    async fetchMasterclassReport(view, userId) {
      this.loading = true
      this.error = null
      try {
        const response = await reportsService.getMasterclassReport(view, userId)
        const key = 'masterclass' + this.getStateKey(view)
        this[key] = this.extractData(response)
        return response
      } catch (e) {
        console.error('Error fetching masterclass report:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchMiniCourseReport(view, userId) {
      this.loading = true
      this.error = null
      try {
        const response = await reportsService.getMiniCourseReport(view, userId)
        const key = 'miniCourse' + this.getStateKey(view)
        this[key] = this.extractData(response)
        return response
      } catch (e) {
        console.error('Error fetching mini course report:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchEbookReport(view, userId) {
      this.loading = true
      this.error = null
      try {
        const response = await reportsService.getEbookReport(view, userId)
        const key = 'ebook' + this.getStateKey(view)
        this[key] = this.extractData(response)
        return response
      } catch (e) {
        console.error('Error fetching ebook report:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchPrivateContent(type) {
      this.loading = true
      this.error = null
      try {
        const response = await reportsService.getPrivateContent(type)
        this.privateContent = this.extractData(response)
        return response
      } catch (e) {
        console.error('Error fetching private content:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchPrivateContentStudents(contentType, contentId) {
      this.loading = true
      this.error = null
      try {
        const response = await reportsService.getPrivateContentStudents(contentType, contentId)
        this.privateContentStudents = this.extractData(response)
        return response
      } catch (e) {
        console.error('Error fetching private content students:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchContentByStatus() {
      this.loading = true
      this.error = null
      try {
        const response = await reportsService.getContentByStatus()
        this.contentByStatus = this.extractData(response)
        return response
      } catch (e) {
        console.error('Error fetching content by status:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchContentByProducer() {
      this.loading = true
      this.error = null
      try {
        const response = await reportsService.getContentByProducer()
        this.contentByProducer = this.extractData(response)
        return response
      } catch (e) {
        console.error('Error fetching content by producer:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchGeneralReports() {
      this.loading = true
      this.error = null
      try {
        const response = await reportsService.getGeneralReports()
        this.generalReports = (response && response.data) || response || null
        return response
      } catch (e) {
        console.error('Error fetching general reports:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    // ── Modal data helpers (used in ReportsView modals) ──
    async fetchDistributors(type, contentId) {
      try {
        const res = await reportsService.getDistributorsReport(type, contentId)
        return res
      } catch (e) {
        console.error('Error fetching distributors:', e)
        return []
      }
    },

    async fetchStudents(type, contentId) {
      try {
        const res = await reportsService.getStudentsReport(type, contentId)
        return res
      } catch (e) {
        console.error('Error fetching students:', e)
        return []
      }
    },

    async fetchPendingParticipants(type, contentId) {
      try {
        const res = await reportsService.getPendingParticipantsReport(type, contentId)
        return res
      } catch (e) {
        console.error('Error fetching pending participants:', e)
        return []
      }
    },

    // ── Nuevos endpoints (students-list, participants/all, last-sells) ──
    async fetchStudentsList() {
      this.loading = true
      this.error = null
      try {
        const response = await reportsService.getStudentsList()
        this.studentsList = this.extractData(response)
        return response
      } catch (e) {
        console.error('Error fetching students list:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchAllPendingParticipants(isParticipant = null) {
      this.loading = true
      this.error = null
      try {
        const response = await reportsService.getAllPendingParticipants(isParticipant)
        this.allPendingParticipants = this.extractData(response)
        return response
      } catch (e) {
        console.error('Error fetching all pending participants:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchLastSells() {
      this.loading = true
      this.error = null
      try {
        const response = await reportsService.getLastSells()
        this.lastSells = this.extractData(response)
        return response
      } catch (e) {
        console.error('Error fetching last sells:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
  },
})
