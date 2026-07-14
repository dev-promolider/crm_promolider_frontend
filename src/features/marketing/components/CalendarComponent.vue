<template>
  <div class="calendar-container">
    <!-- Notifications -->
    <Transition name="fade-slide">
      <div v-if="notification.show" :class="['notification', notification.type]">
        <span class="notification-icon">
          <CheckCircle2 v-if="notification.type === 'success'" :size="16" />
          <AlertCircle v-else :size="16" />
        </span>
        {{ notification.message }}
      </div>
    </Transition>

    <!-- Header -->
    <div class="calendar-header">
      <button @click="previousMonth" class="nav-button" title="Mes anterior">
        <ChevronLeft :size="20" />
      </button>
      <h2 class="month-year">{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
      <button @click="nextMonth" class="nav-button" title="Mes siguiente">
        <ChevronRight :size="20" />
      </button>
    </div>

    <!-- Weekdays -->
    <div class="calendar-weekdays">
      <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
    </div>

    <!-- Days -->
    <div class="calendar-days">
      <div
        v-for="day in calendarDays"
        :key="day.key"
        :class="['calendar-day', { 'other-month': !day.isCurrentMonth, 'today': day.isToday, 'has-notes': day.hasNotes }]"
        @click="selectDay(day)"
      >
        <span class="day-number">{{ day.day }}</span>
        <div v-if="day.hasNotes" class="notes-indicator">
          <span class="notes-count">{{ day.notes.length }}</span>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="calendar-loading">
      <Loader2 class="spinner" :size="32" />
      <p>Cargando notas...</p>
    </div>

    <!-- Modal para notas (Raul-style) -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">
            <CalendarDays :size="18" />
            Notas — {{ selectedDate.day }}/{{ selectedDate.month + 1 }}/{{ selectedDate.year }}
          </h5>
          <button class="close-btn" @click="closeModal"><X :size="20" /></button>
        </div>

        <div class="modal-body">
          <!-- Notas existentes -->
          <div v-if="selectedDateNotes && selectedDateNotes.length > 0" class="existing-notes">
            <h6 class="section-label">Notas guardadas</h6>
            <div v-for="(note, idx) in selectedDateNotes" :key="note.id || idx" class="note-item">
              <div class="note-content">
                <span class="note-time-badge">{{ note.time }}</span>
                <span class="note-text">{{ note.text }}</span>
              </div>
              <button @click="deleteNote(note.id)" class="icon-btn danger" :disabled="loading" title="Eliminar nota">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>

          <!-- Nueva nota -->
          <div class="new-note-section" :class="{ 'with-notes': selectedDateNotes?.length > 0 }">
            <div class="section-header">
              <div class="section-header-icon">
                <Plus :size="14" />
              </div>
              <h6 class="section-label">Agregar nota</h6>
            </div>

            <div class="time-picker">
              <label class="field-label">Hora</label>
              <div class="time-selects">
                <select v-model="newNote.hour" class="time-select">
                  <option value="">HH</option>
                  <option v-for="h in hours" :key="h" :value="h">{{ String(h).padStart(2, '0') }}</option>
                </select>
                <span class="time-colon">:</span>
                <select v-model="newNote.minute" class="time-select">
                  <option value="">MM</option>
                  <option v-for="m in minutes" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
                </select>
              </div>
              <div class="quick-times">
                <button type="button" @click="setQuickTime('09:00')" class="quick-btn" :class="{ active: formatTime() === '09:00' }">9 AM</button>
                <button type="button" @click="setQuickTime('12:00')" class="quick-btn" :class="{ active: formatTime() === '12:00' }">12 PM</button>
                <button type="button" @click="setQuickTime('18:00')" class="quick-btn" :class="{ active: formatTime() === '18:00' }">6 PM</button>
                <button type="button" @click="setCurrentTime()" class="quick-btn now-btn">Ahora</button>
              </div>
            </div>

            <div class="form-group">
              <label class="field-label">Nota</label>
              <textarea v-model="newNote.text" class="form-control" rows="4" placeholder="¿Qué tienes pendiente para este día?..."></textarea>
            </div>

            <button @click="addNote" class="add-btn" :disabled="!newNote.text.trim() || loading">
              <Loader2 v-if="loading" :size="16" class="spinner-inline" />
              <Plus v-else :size="16" />
              {{ loading ? 'Guardando...' : 'Guardar nota' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/services/apiClient'
import {
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  CalendarDays, X, Trash2, Loader2, Plus
} from 'lucide-vue-next'

export default {
  name: 'CalendarComponent',
  components: {
    ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
    CalendarDays, X, Trash2, Loader2, Plus
  },
  data() {
    return {
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      showModal: false,
      selectedDate: null,
      loading: false,
      newNote: { hour: '', minute: '', text: '' },
      notes: {},
      notification: { show: false, message: '', type: 'success' },
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      weekDays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    }
  },
  computed: {
    hours() { return Array.from({ length: 24 }, (_, i) => i) },
    minutes() { return Array.from({ length: 60 }, (_, i) => i) },
    calendarDays() {
      const days = []
      const today = new Date()
      const firstDay = new Date(this.currentYear, this.currentMonth, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - startDate.getDay())
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        const dateKey = this.getDateKey(date)
        const dayNotes = this.notes[dateKey] || []
        days.push({
          key: dateKey, day: date.getDate(), month: date.getMonth(), year: date.getFullYear(),
          isCurrentMonth: date.getMonth() === this.currentMonth,
          isToday: date.toDateString() === today.toDateString(),
          hasNotes: dayNotes.length > 0, notes: dayNotes, fullDate: date,
        })
      }
      return days
    },
    selectedDateNotes() {
      if (!this.selectedDate) return []
      return this.notes[this.getDateKey(this.selectedDate.fullDate)] || []
    },
  },
  methods: {
    previousMonth() {
      if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear-- }
      else this.currentMonth--
    },
    nextMonth() {
      if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++ }
      else this.currentMonth++
    },
    selectDay(day) { this.selectedDate = day; this.showModal = true; this.newNote = { hour: '', minute: '', text: '' } },
    closeModal() { this.showModal = false; this.selectedDate = null; this.newNote = { hour: '', minute: '', text: '' } },

    async addNote() {
      if (!this.newNote.text.trim()) return
      this.loading = true
      try {
        const time = this.formatTime() || '00:00'
        const dateKey = this.getDateKey(this.selectedDate.fullDate)
        const response = await apiClient.post('/marketing/calendar/notes', { date: dateKey, time, content: this.newNote.text.trim() })
        if (response.data.success) {
          const updatedNotes = { ...this.notes }
          if (!updatedNotes[dateKey]) updatedNotes[dateKey] = []
          updatedNotes[dateKey].push({ id: response.data.data.id, time: response.data.data.time, text: response.data.data.text })
          updatedNotes[dateKey].sort((a, b) => a.time.localeCompare(b.time))
          this.notes = updatedNotes
          this.newNote = { hour: '', minute: '', text: '' }
          this.showNotification('Nota agregada', 'success')
        }
      } catch (error) {
        console.error('Error:', error)
        this.showNotification('Error al agregar la nota', 'error')
      } finally { this.loading = false }
    },

    async deleteNote(noteId) {
      if (this.loading || !noteId) return
      this.loading = true
      try {
        const response = await apiClient.delete(`/marketing/calendar/notes/${noteId}`)
        if (response.data.success) {
          const dateKey = this.getDateKey(this.selectedDate.fullDate)
          const updatedNotes = { ...this.notes }
          if (updatedNotes[dateKey]) {
            updatedNotes[dateKey] = updatedNotes[dateKey].filter(n => n.id !== noteId)
            if (updatedNotes[dateKey].length === 0) delete updatedNotes[dateKey]
          }
          this.notes = updatedNotes
          this.showNotification('Nota eliminada', 'success')
        }
      } catch (error) { this.showNotification('Error al eliminar la nota', 'error') }
      finally { this.loading = false }
    },

    getDateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` },

    async loadNotes() {
      this.loading = true
      try {
        const response = await apiClient.get('/marketing/calendar/notes')
        if (response.data.success) this.notes = response.data.data || {}
        else console.error('Error:', response.data.message)
      } catch (error) { console.error('Error al cargar notas:', error) }
      finally { this.loading = false }
    },

    formatTime() {
      if (this.newNote.hour === '' || this.newNote.minute === '') return ''
      return `${String(this.newNote.hour).padStart(2, '0')}:${String(this.newNote.minute).padStart(2, '0')}`
    },
    setQuickTime(time) { const [h, m] = time.split(':'); this.newNote.hour = parseInt(h); this.newNote.minute = parseInt(m) },
    setCurrentTime() { const now = new Date(); this.newNote.hour = now.getHours(); this.newNote.minute = now.getMinutes() },

    showNotification(message, type) {
      this.notification = { show: true, message, type }
      setTimeout(() => { this.notification.show = false }, 3000)
    },
  },
  async created() { this.loadNotes() },
}
</script>

<style scoped>
.calendar-container {
  max-width: 780px;
  margin: 0 auto;
  font-family: inherit;
}

/* ── Notification ── */
.notification {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}
.notification.success { background: rgba(24, 214, 0, 0.1); color: #166534; border: 1px solid rgba(24, 214, 0, 0.2); }
.notification.error { background: rgba(239, 68, 68, 0.1); color: #991b1b; border: 1px solid rgba(239, 68, 68, 0.2); }
.notification-icon { flex-shrink: 0; display: flex; }
.notification.success .notification-icon { color: var(--primary-color); }
.notification.error .notification-icon { color: var(--danger-color); }
@keyframes slideDown { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* ── Loading ── */
.calendar-loading {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 30px; color: var(--text-muted); font-size: 13px;
}
.spinner { animation: spin 1s linear infinite; color: var(--primary-color); }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Header ── */
.calendar-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; padding: 0 4px;
}
.month-year { font-size: 1.25rem; font-weight: 700; color: var(--text-bold); margin: 0; }
.nav-button {
  background: var(--card-bg); border: 1px solid var(--border-color);
  color: var(--text-main); border-radius: 8px;
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.nav-button:hover { background: var(--primary-color); color: white; border-color: var(--primary-color); }

/* ── Weekdays ── */
.calendar-weekdays {
  display: grid; grid-template-columns: repeat(7, 1fr);
  background: var(--bg-main); border-radius: 8px 8px 0 0; overflow: hidden;
}
.weekday {
  padding: 10px; text-align: center; font-weight: 600;
  color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;
}

/* ── Days Grid ── */
.calendar-days {
  display: grid; grid-template-columns: repeat(7, 1fr);
  border: 1px solid var(--border-color); border-top: none;
  border-radius: 0 0 8px 8px; overflow: hidden;
}
.calendar-day {
  background: var(--card-bg); min-height: 72px; padding: 6px;
  cursor: pointer; transition: all 0.15s ease;
  position: relative; display: flex; flex-direction: column;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}
.calendar-day:nth-child(7n) { border-right: none; }
.calendar-day:hover { background: var(--bg-main); z-index: 2; }
.calendar-day.other-month { opacity: 0.35; pointer-events: none; }
.calendar-day.today {
  background: rgba(24, 214, 0, 0.06);
  box-shadow: inset 0 0 0 2px var(--primary-color);
}
.calendar-day.has-notes { background: rgba(24, 214, 0, 0.03); }

.day-number { font-weight: 600; font-size: 0.85rem; color: var(--text-bold); }
.calendar-day.today .day-number {
  color: var(--primary-color); font-weight: 800;
}

.notes-indicator {
  position: absolute; top: 4px; right: 4px;
  background: var(--danger-color); color: white;
  border-radius: 50%; width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

/* ── Modal (Raul-style) ── */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-card {
  background: var(--card-bg); backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: 12px; width: 90%; max-width: 500px;
  max-height: 80vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--border-color);
}
.modal-title {
  font-size: 15px; font-weight: 700; color: var(--text-bold);
  display: flex; align-items: center; gap: 8px; margin: 0;
}
.close-btn {
  background: none; border: none; color: var(--text-light);
  cursor: pointer; padding: 6px; border-radius: 6px;
  display: flex; transition: all 0.2s;
}
.close-btn:hover { background: var(--bg-main); color: var(--danger-color); }

.modal-body { padding: 20px; }

/* ── Notes List ── */
.section-label {
  font-size: 12px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0;
}
.note-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; background: var(--bg-main);
  border-radius: 8px; margin-bottom: 6px; transition: background 0.2s;
}
.note-item:hover { background: rgba(24, 214, 0, 0.05); }
.note-content { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.note-time-badge {
  background: var(--primary-color); color: white;
  padding: 2px 8px; border-radius: 4px; font-size: 11px;
  font-weight: 700; flex-shrink: 0; white-space: nowrap;
}
.note-text { color: var(--text-main); font-size: 13px; line-height: 1.4; }
.icon-btn.danger {
  background: none; border: none; color: var(--text-light);
  cursor: pointer; padding: 6px; border-radius: 6px;
  display: flex; transition: all 0.2s; flex-shrink: 0;
}
.icon-btn.danger:hover { background: rgba(239,68,68,0.1); color: var(--danger-color); }
.icon-btn.danger:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Time Picker ── */
.time-picker {
  background: var(--bg-main); border: 1px solid var(--border-color);
  border-radius: 8px; padding: 12px;
}
.time-selects { display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 10px; }
.time-select {
  padding: 8px; border: 1px solid var(--border-color); border-radius: 6px;
  font-size: 15px; font-weight: 600; background: var(--card-bg);
  color: var(--text-bold); cursor: pointer; min-width: 64px; text-align: center;
  transition: border-color 0.2s;
}
.time-select:focus { outline: none; border-color: var(--primary-color); }
.time-colon { font-size: 22px; font-weight: 700; color: var(--primary-color); }

.quick-times { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.quick-btn {
  padding: 6px 12px; border: 1px solid var(--border-color);
  border-radius: 16px; background: var(--card-bg);
  color: var(--text-muted); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.quick-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }
.quick-btn.active { border-color: var(--primary-color); background: var(--primary-color); color: white; }
.quick-btn.now-btn { border-color: rgba(24, 214, 0, 0.3); color: var(--primary-color); }
.quick-btn.now-btn:hover { background: rgba(24, 214, 0, 0.08); }

/* ── New Note Section ── */
.new-note-section {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}
.new-note-section.with-notes {
  margin-top: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}
.section-header-icon {
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.field-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

/* ── Form ── */
.form-group { margin-bottom: 18px; }
.form-control {
  width: 100%; padding: 12px 14px;
  border: 1px solid var(--border-color); border-radius: 10px;
  font-size: 14px; font-family: inherit; line-height: 1.5;
  background: var(--card-bg); color: var(--text-main);
  transition: all 0.2s; resize: vertical;
}
.form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24, 214, 0, 0.1); }
.form-control::placeholder { color: var(--text-light); font-style: italic; }

.add-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 12px 18px; background: var(--primary-color); color: white;
  border: none; border-radius: 10px; font-weight: 700; font-size: 14px;
  cursor: pointer; transition: all 0.2s;
}
.add-btn:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(24, 214, 0, 0.3); }
.add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.spinner-inline { animation: spin 1s linear infinite; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .calendar-day { min-height: 56px; padding: 4px; }
  .modal-card { width: 95%; }
  .modal-header, .modal-body { padding: 14px; }
  .quick-btn { flex: 1; min-width: 50px; font-size: 11px; }
  .time-select { min-width: 54px; font-size: 14px; }
  .month-year { font-size: 1.1rem; }
}
</style>
