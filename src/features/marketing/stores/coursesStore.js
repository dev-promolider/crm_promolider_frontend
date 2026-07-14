import { defineStore } from 'pinia'
import * as coursesService from '../services/coursesService'

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    courses: [], currentCourse: null,
    modules: [], currentModule: null,
    classes: [],
    games: [], currentGame: null, gameDetails: [],
    certificates: [], templates: [],
    progress: { completed_lessons: [], progress: 0 },
    ratings: [],
    searchResults: [], searchQuery: '',
    loading: false, error: null,
  }),
  getters: {
    isLoading: (s) => s.loading,
    completedCount: (s) => s.progress.completed_lessons?.length || 0,
    modulesWithClasses: (s) => s.modules.filter(m => m.classes_count > 0),
  },
  actions: {
    async fetchCourses(params) { this.loading = true; this.error = null
      try { const r = await coursesService.getCourses(params); if (r.success) this.courses = r.data }
      catch (e) { this.error = e.response?.data?.message || 'Error' } finally { this.loading = false }
    },
    async fetchCourse(id) { this.loading = true
      try { const r = await coursesService.getCourse(id); if (r.success) this.currentCourse = r.data; return r }
      catch (e) { this.error = 'Error al cargar curso' } finally { this.loading = false }
    },
    async createCourse(data) { try { const r = await coursesService.createCourse(data); if (r.success) await this.fetchCourses(); return r } catch (e) { return { success: false } } },
    async updateCourse(id, data) { try { const r = await coursesService.updateCourse(id, data); if (r.success) this.currentCourse = r.data; return r } catch (e) { return { success: false } } },
    async deleteCourse(id) { try { const r = await coursesService.deleteCourse(id); if (r.success) await this.fetchCourses(); return r } catch (e) { return { success: false } } },

    async fetchModules(courseId) { try { const r = await coursesService.getModules(courseId); if (r.success) this.modules = r.data } catch (e) {} },
    async createModule(data) { try { const r = await coursesService.createModule(data); if (r.success) await this.fetchModules(data.id_courses); return r } catch (e) { return { success: false } } },
    async updateModule(id, data) { try { const r = await coursesService.updateModule(id, data); if (r.success) await this.fetchModules(data.id_courses || this.currentCourse?.id); return r } catch (e) { return { success: false } } },
    async deleteModule(id, courseId) { try { const r = await coursesService.deleteModule(id); if (r.success) await this.fetchModules(courseId); return r } catch (e) { return { success: false } } },

    async fetchClasses(moduleId) { try { const r = await coursesService.getClasses(moduleId); if (r.success) this.classes = r.data } catch (e) {} },
    async createClass(data) { try { const r = await coursesService.createClass(data); if (r.success) await this.fetchClasses(data.id_modules); return r } catch (e) { return { success: false } } },
    async updateClass(id, data) { try { const r = await coursesService.updateClass(id, data); if (r.success) return r } catch (e) { return { success: false } } },
    async deleteClass(id, moduleId) { try { const r = await coursesService.deleteClass(id); if (r.success) await this.fetchClasses(moduleId); return r } catch (e) { return { success: false } } },

    async fetchProgress(courseId) { try { const r = await coursesService.getProgress(courseId); if (r.success) this.progress = r.data } catch (e) {} },
    async completeLesson(courseId, lessonId) { try { const r = await coursesService.completeLesson(courseId, lessonId); if (r.success) await this.fetchProgress(courseId); return r } catch (e) { return { success: false } } },

    async fetchRatings(courseId) { try { const r = await coursesService.getRatings(courseId); if (r.success) this.ratings = r.data } catch (e) {} },
    async createRating(courseId, data) { try { const r = await coursesService.createRating(courseId, data); if (r.success) await this.fetchRatings(courseId); return r } catch (e) { return { success: false } } },

    async fetchGames(courseId) { try { const r = await coursesService.getGames(courseId); if (r.success) this.games = r.data } catch (e) {} },
    async createGame(data) { try { const r = await coursesService.createGame(data); if (r.success) await this.fetchGames(data.id_courses); return r } catch (e) { return { success: false } } },
    async deleteGame(id, courseId) { try { const r = await coursesService.deleteGame(id); if (r.success) await this.fetchGames(courseId); return r } catch (e) { return { success: false } } },
    async fetchGameDetails(gameId) { try { const r = await coursesService.getGameDetails(gameId); if (r.success) this.gameDetails = r.data } catch (e) {} },
    async createGameDetail(data) { try { const r = await coursesService.createGameDetail(data); if (r.success) await this.fetchGameDetails(data.id_course_game); return r } catch (e) { return { success: false } } },

    async fetchCertificates() { try { const r = await coursesService.getCertificates(); if (r.success) this.certificates = r.data } catch (e) {} },
    async searchCourses(query, params = {}) { this.loading = true; this.searchQuery = query
      try { const r = await coursesService.searchCourses(query, params); if (r.success) this.searchResults = r.data; return r }
      catch (e) { this.error = 'Error al buscar cursos'; return { success: false } } finally { this.loading = false }
    },
    async clearSearch() { this.searchResults = []; this.searchQuery = '' },

    async fetchTemplates() { try { const r = await coursesService.getTemplates(); if (r.success) this.templates = r.data } catch (e) {} },
    async createTemplate(data) { try { const r = await coursesService.createTemplate(data); if (r.success) await this.fetchTemplates(); return r } catch (e) { return { success: false } } },
  },
})
