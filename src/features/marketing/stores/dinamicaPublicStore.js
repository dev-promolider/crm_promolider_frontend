import { defineStore } from 'pinia'
import * as dinamicaPublicService from '../services/dinamicaPublicService'

export const useDinamicaPublicStore = defineStore('dinamicaPublic', {
  state: () => ({
    dinamica: null,
    participants: [],
    hasWinner: false,
    nextTurno: null,
    turnoActual: null,
    turnoExpiresAt: null,
    turnoStartedAt: null,
    turnoDurationSeconds: 90,
    turnoRemainingSeconds: null,
    triviaConfig: null,
    currentQuestion: null,
    triviaResults: [],
    email: localStorage.getItem('dinamica_email') || '',
    loading: false,
    error: null,
    _loadRequestId: 0, // counter to ignore stale responses
  }),

  getters: {
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    isRegistered: (state) => {
      if (!state.email) return false
      return state.participants.some(p => p.email && p.email === state.email)
    },
    totalQuestions: (state) => {
      return state.triviaConfig?.questions?.length || 0
    },
    myRecord: (state) => {
      if (!state.email) return null
      return state.participants.find(p => p.email && p.email === state.email) || null
    },
    esMiTurno: (state) => {
      if (!state.myRecord || !state.turnoActual) return false
      return state.myRecord.id === state.turnoActual.id
    },
  },

  actions: {
    setEmail(email) {
      this.email = email
      localStorage.setItem('dinamica_email', email)
    },

    async loadDinamica(slug) {
      const requestId = ++this._loadRequestId
      this.loading = true
      this.error = null
      try {
        const data = await dinamicaPublicService.getPublicDinamica(slug)
        // Ignore stale responses from previous requests
        if (requestId !== this._loadRequestId) return
        this.dinamica = data.dinamica
        this.participants = data.participants || []
        this.hasWinner = data.has_winner
        this.nextTurno = data.next_turno
        this.triviaConfig = data.trivia_config
        // Update turn timer info if present
        if (data.turno_actual) {
          this.turnoActual = data.turno_actual
          this.turnoExpiresAt = data.turno_expires_at || data.turno_actual.expires_at
          this.turnoStartedAt = data.turno_started_at || data.turno_actual.started_at
          this.turnoRemainingSeconds = data.turno_remaining_seconds
        }
        if (data.turno_duration_seconds) {
          this.turnoDurationSeconds = data.turno_duration_seconds
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar la dinámica'
      } finally {
        this.loading = false
      }
    },

    async register(slug, data) {
      this.loading = true
      this.error = null
      try {
        const result = await dinamicaPublicService.registerParticipant(slug, data)
        if (result.email) this.setEmail(result.email)
        // Añadir participante optimistically
        if (result.already_registered !== true) {
          this.participants.unshift({
            id: result.registro_id,
            nombre: data.nombre,
            apellido: data.apellido || '',
            email: result.email,
            turno: result.turno,
            ha_jugado: false,
            ha_ganado: false,
          })
        }
        await this.loadDinamica(slug)
        return result
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al registrarse'
        throw err
      } finally {
        this.loading = false
      }
    },

    async spin(slug) {
      this.loading = true
      this.error = null
      try {
        const result = await dinamicaPublicService.spinRoulette(slug, this.email)
        return result
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al girar la ruleta'
        throw err
      } finally {
        this.loading = false
      }
    },

    async loadStatus(slug) {
      try {
        const data = await dinamicaPublicService.getDinamicaStatus(slug)
        this.hasWinner = data.has_winner
        this.nextTurno = data.next_turno
        return data
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al obtener estado'
      }
    },

    async loadParticipantsFeed(slug) {
      try {
        const data = await dinamicaPublicService.getParticipantsFeed(slug)
        this.participants = data.participants || data
        if (data.has_winner !== undefined) {
          this.hasWinner = data.has_winner
        }
        if (data.turno_actual) {
          this.turnoActual = data.turno_actual
          this.turnoExpiresAt = data.turno_expires_at || data.turno_actual.expires_at
          this.turnoStartedAt = data.turno_started_at || data.turno_actual.started_at
        }
        if (data.turno_duration_seconds) {
          this.turnoDurationSeconds = data.turno_duration_seconds
        }
        if (data.turno_remaining_seconds !== undefined) {
          this.turnoRemainingSeconds = data.turno_remaining_seconds
        }
      } catch (err) {
        console.error('Error loading participants feed:', err)
      }
    },

    async markPlayed(slug) {
      this.loading = true
      try {
        const result = await dinamicaPublicService.markAsPlayed(slug, this.email)
        await this.loadDinamica(slug)
        return result
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al marcar como jugado'
      } finally {
        this.loading = false
      }
    },

    async registerWinner(slug, premio = null) {
      this.loading = true
      try {
        const result = await dinamicaPublicService.registerWinner(slug, this.email, premio)
        this.hasWinner = true
        return result
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al registrar ganador'
      } finally {
        this.loading = false
      }
    },

    // ---- WebSocket Event Handlers ----

    updateFromSpinEvent(event) {
      // RuletaSpinEvent — might contain angle info
      // Simply triggers a refresh of participants via the composable
    },

    updateFromTurnoTimerEvent(event) {
      if (!event) return
      // TurnoTimerEvent payload: {dinamicaSlug, turno, startedAt, expiresAt, duration}
      if (event.turno) {
        this.turnoActual = event.turno
      }
      if (event.startedAt) this.turnoStartedAt = event.startedAt
      if (event.expiresAt) this.turnoExpiresAt = event.expiresAt
      if (event.duration) this.turnoDurationSeconds = event.duration
    },

    updateFromDinamicaSpinEvent(event) {
      // DinamicaSpinEvent — could contain premio info
    },

    updateFromDinamicaWinnerEvent(event) {
      this.hasWinner = true
    },

    // ---- Trivia actions ----

    async loadTriviaPreview(slug) {
      this.loading = true
      try {
        const data = await dinamicaPublicService.getTriviaPreview(slug, this.email)
        return data
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar trivia'
        throw err
      } finally {
        this.loading = false
      }
    },

    async loadQuestion(slug, numero) {
      this.loading = true
      try {
        const data = await dinamicaPublicService.getTriviaQuestion(slug, numero, this.email)
        this.currentQuestion = data
        return data
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar pregunta'
      } finally {
        this.loading = false
      }
    },

    async submitAnswer(slug, numero, respuesta) {
      this.loading = true
      try {
        const result = await dinamicaPublicService.submitTriviaAnswer(slug, numero, this.email, respuesta)
        return result
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al enviar respuesta'
      } finally {
        this.loading = false
      }
    },

    async loadResults(slug) {
      this.loading = true
      try {
        const data = await dinamicaPublicService.getTriviaResults(slug)
        this.triviaResults = data.leaderboard || []
        return data
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar resultados'
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },
  },
})
