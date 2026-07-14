import { defineStore } from 'pinia'
import * as freeCoursesService from '../services/freeCoursesService'

export const useFreeCoursesStore = defineStore('freeCourses', {
  state: () => ({
    courses: [],
    loading: false,
    error: null,
  }),

  getters: {
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },

  actions: {
    async fetchCourses(params = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await freeCoursesService.getFreeCourses(params)
        this.courses = res.data || []
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al cargar cursos gratuitos'
      } finally {
        this.loading = false
      }
    },

    async createCourse(data) {
      this.error = null
      try {
        const res = await freeCoursesService.createFreeCourse(data)
        this.courses.unshift(res.data)
        return res.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al crear curso gratuito'
        throw e
      }
    },

    async removeCourse(id) {
      this.error = null
      try {
        await freeCoursesService.deleteFreeCourse(id)
        this.courses = this.courses.filter(c => c.id !== id)
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al eliminar curso'
        throw e
      }
    },
  },
})
