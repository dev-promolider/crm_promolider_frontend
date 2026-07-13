import { defineStore } from 'pinia'
import * as dinamicaService from '../services/dinamicaService'

export const useDinamicasStore = defineStore('dinamicas', {
  state: () => ({
    items: [],
    currentItem: null,
    currentPremios: [],
    loading: false,
    error: null,
    editingId: null,
  }),

  getters: {
    isLoading: (s) => s.loading,
    getError: (s) => s.error,
    ruletas: (s) => s.items.filter(i => i.tipo_dinamica === 'ruleta'),
    trivias: (s) => s.items.filter(i => i.tipo_dinamica === 'trivia'),
    activeItems: (s) => s.items.filter(i => i.is_active),
  },

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const r = await dinamicaService.getMyDinamicas()
        if (r.success) this.items = r.data
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id) {
      this.loading = true
      this.error = null
      try {
        const r = await dinamicaService.getDinamica(id)
        if (r.success) {
          this.currentItem = r.data.dinamica
          this.currentPremios = r.data.premios || []
        }
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      this.loading = true
      this.error = null
      try {
        const r = await dinamicaService.createDinamica(data)
        if (r.success) {
          await this.fetchAll()
          return r
        }
        this.error = r.message
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async update(id, data) {
      this.loading = true
      this.error = null
      try {
        const r = await dinamicaService.updateDinamica(id, data)
        if (r.success) {
          await this.fetchAll()
        }
        return r
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async remove(id) {
      this.loading = true
      this.error = null
      try {
        const r = await dinamicaService.deleteDinamica(id)
        if (r.success) {
          this.items = this.items.filter(i => i.id !== id)
        }
        return r
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async toggleStatus(id) {
      this.error = null
      try {
        const r = await dinamicaService.toggleDinamicaStatus(id)
        if (r.success) {
          const item = this.items.find(i => i.id === id)
          if (item) item.is_active = r.is_active
          if (this.currentItem && this.currentItem.id === id) {
            this.currentItem.is_active = r.is_active
          }
        }
        return r
      } catch (e) {
        this.error = e.message
      }
    },

    async saveSpecifications(dinamicaId, data) {
      this.loading = true
      this.error = null
      try {
        const r = await dinamicaService.storeSpecifications(dinamicaId, data)
        if (r.success) {
          await this.fetchOne(dinamicaId)
        }
        return r
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async saveTrivia(dinamicaId, data) {
      this.loading = true
      this.error = null
      try {
        const r = await dinamicaService.saveTriviaConfig(dinamicaId, data)
        if (r.success) {
          await this.fetchOne(dinamicaId)
        }
        return r
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    resetCurrent() {
      this.currentItem = null
      this.currentPremios = []
      this.editingId = null
    },
  },
})
