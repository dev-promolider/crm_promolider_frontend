import { defineStore } from 'pinia'
import * as calendarService from '../services/calendarService'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    events: [],
    notes: [],
    activities: [],
    loading: false,
    error: null,
    selectedDate: null,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
  }),

  getters: {
    isLoading: (state) => state.loading,
    getEventsByDate: (state) => (date) => {
      return state.events.filter(e => e.date === date)
    },
    getNotesByDate: (state) => (date) => {
      return state.notes.filter(n => n.date === date)
    },
    getActivitiesByDate: (state) => (date) => {
      return state.activities.filter(a => a.date === date)
    },
  },

  actions: {
    async fetchCalendarEvents(role, userId) {
      this.loading = true
      this.error = null
      try {
        const response = await calendarService.getCalendarEvents(role, userId)
        const data = response.data || response
        this.events = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Error al cargar eventos del calendario:', error)
        this.error = error.response?.data?.message || 'Error al cargar eventos'
        this.events = []
      } finally {
        this.loading = false
      }
    },

    async fetchActivities(userId) {
      try {
        const response = await calendarService.getActivities(userId)
        const data = response.data || response
        this.activities = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Error al cargar actividades:', error)
        this.activities = []
      }
    },

    async fetchNotes(params = {}) {
      try {
        const response = await calendarService.getNotes(params)
        const data = response.data || response
        this.notes = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Error al cargar notas:', error)
        this.notes = []
      }
    },

    async createNote(noteData) {
      try {
        const response = await calendarService.createNote(noteData)
        const newNote = response.data || response
        if (newNote && newNote.id) {
          this.notes.push(newNote)
        }
        return newNote
      } catch (error) {
        console.error('Error al crear nota:', error)
        throw error
      }
    },

    async updateNote(id, noteData) {
      try {
        const response = await calendarService.updateNote(id, noteData)
        const updatedNote = response.data || response
        const index = this.notes.findIndex(n => n.id === id)
        if (index !== -1) {
          this.notes[index] = { ...this.notes[index], ...updatedNote }
        }
        return updatedNote
    } catch (error) {
      console.error('Error al actualizar nota:', error)
      throw error
    }
    },

    async deleteNote(id) {
      try {
        await calendarService.deleteNote(id)
        this.notes = this.notes.filter(n => n.id !== id)
      } catch (error) {
        console.error('Error al eliminar nota:', error)
        throw error
      }
    },

    async syncNotes(notes) {
      try {
        await calendarService.syncNotes(notes)
      } catch (error) {
        console.error('Error al sincronizar notas:', error)
        throw error
      }
    },

    async createMeeting(meetingData) {
      try {
        const response = await calendarService.createMeeting(meetingData)
        const newMeeting = response.data || response
        if (newMeeting && newMeeting.id) {
          this.activities.push(newMeeting)
        }
        return newMeeting
      } catch (error) {
        console.error('Error al crear reunión:', error)
        throw error
      }
    },

    setSelectedDate(date) {
      this.selectedDate = date
    },

    setCurrentMonth(month, year) {
      this.currentMonth = month
      this.currentYear = year
    },

    clearErrors() {
      this.error = null
    },
  },
})
