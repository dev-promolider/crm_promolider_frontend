import { defineStore } from 'pinia'
import * as questionCategoriesService from '../services/questionCategoriesService'

export const useQuestionCategoriesStore = defineStore('questionCategories', {
  state: () => ({
    categories: [],
    currentCategory: null,
    questions: [],
    loading: false,
    error: null,
  }),

  getters: {
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    activeCategories: (state) => state.categories.filter(c => c.is_active),
  },

  actions: {
    async fetchCategories(params = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await questionCategoriesService.getQuestionCategories(params)
        this.categories = res.data || []
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al cargar categorías'
      } finally {
        this.loading = false
      }
    },

    async fetchCategory(id) {
      this.loading = true
      this.error = null
      try {
        const res = await questionCategoriesService.getQuestionCategory(id)
        this.currentCategory = res.data || null
        this.questions = res.data?.questions || []
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al cargar categoría'
      } finally {
        this.loading = false
      }
    },

    async createCategory(data) {
      this.error = null
      try {
        const res = await questionCategoriesService.createQuestionCategory(data)
        this.categories.unshift(res.data)
        return res.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al crear categoría'
        throw e
      }
    },

    async updateCategory(id, data) {
      this.error = null
      try {
        const res = await questionCategoriesService.updateQuestionCategory(id, data)
        const idx = this.categories.findIndex(c => c.id === id)
        if (idx !== -1) this.categories[idx] = res.data
        if (this.currentCategory?.id === id) this.currentCategory = res.data
        return res.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al actualizar categoría'
        throw e
      }
    },

    async toggleCategoryStatus(id) {
      this.error = null
      try {
        const res = await questionCategoriesService.toggleQuestionCategoryStatus(id)
        const idx = this.categories.findIndex(c => c.id === id)
        if (idx !== -1) this.categories[idx] = res.data
        if (this.currentCategory?.id === id) this.currentCategory = res.data
        return res.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al cambiar estado'
        throw e
      }
    },

    async removeCategory(id) {
      this.error = null
      try {
        await questionCategoriesService.deleteQuestionCategory(id)
        this.categories = this.categories.filter(c => c.id !== id)
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al eliminar categoría'
        throw e
      }
    },

    async fetchQuestions(categoryId, params = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await questionCategoriesService.getQuestions(categoryId, params)
        this.questions = res.data || []
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al cargar preguntas'
      } finally {
        this.loading = false
      }
    },

    async createQuestion(categoryId, data) {
      this.error = null
      try {
        const res = await questionCategoriesService.createQuestion(categoryId, data)
        this.questions.unshift(res.data)
        return res.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al crear pregunta'
        throw e
      }
    },

    async updateQuestion(categoryId, questionId, data) {
      this.error = null
      try {
        const res = await questionCategoriesService.updateQuestion(categoryId, questionId, data)
        const idx = this.questions.findIndex(q => q.id === questionId)
        if (idx !== -1) this.questions[idx] = res.data
        return res.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al actualizar pregunta'
        throw e
      }
    },

    async deleteQuestion(categoryId, questionId) {
      this.error = null
      try {
        await questionCategoriesService.deleteQuestion(categoryId, questionId)
        this.questions = this.questions.filter(q => q.id !== questionId)
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al eliminar pregunta'
        throw e
      }
    },
  },
})
