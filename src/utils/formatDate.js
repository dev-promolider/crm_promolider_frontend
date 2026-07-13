/**
 * Formatea una fecha para mostrar en la UI
 * @param {string|Date} date - Fecha a formatear
 * @param {string} format - Formato: 'short' (DD/MM/YYYY), 'long' (día, DD de mes de YYYY), 'iso' (YYYY-MM-DD)
 * @returns {string} Fecha formateada
 */
export function formatDate(date, format = 'short') {
  if (!date) return '-'

  try {
    const d = new Date(date + (typeof date === 'string' && !date.includes('T') ? 'T12:00:00' : ''))

    if (isNaN(d.getTime())) return '-'

    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = d.getFullYear()

    switch (format) {
      case 'short':
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
      case 'long': {
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre']
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        return `${days[d.getDay()]}, ${day} de ${months[d.getMonth()]} del ${year}`
      }
      case 'iso':
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      default:
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
    }
  } catch {
    return '-'
  }
}
