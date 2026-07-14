import { ref, onUnmounted } from 'vue'
import { useDinamicaPublicStore } from '../stores/dinamicaPublicStore'

/**
 * Composable that connects to Laravel Echo WebSocket channels
 * for real-time updates on the dinamica (ruleta) public page.
 *
 * Listens on:
 *   - `public-ruleta` channel → RuletaSpinEvent, TurnoTimerEvent
 *   - `dinamica.{slug}` channel → DinamicaWinnerEvent
 *
 * Falls back to HTTP polling if Echo is not available.
 */
export function useDinamicaWebSocket(slug) {
  const store = useDinamicaPublicStore()
  const wsConnected = ref(!!window.Echo)

  let publicChannel = null
  let privateChannel = null

  function setup() {
    if (!window.Echo || !slug.value) return

    // ---- Public-ruleta channel (broadcast rest to all participants) ----
    publicChannel = window.Echo.channel('public-ruleta')

    // RuletaSpinEvent → refresh participants list and status
    publicChannel.listen('.ruleta.spin', (event) => {
      store.updateFromSpinEvent(event)
      store.loadParticipantsFeed(slug.value)
    })

    // TurnoTimerEvent → update the current turn timer
    publicChannel.listen('.turno.timer', (event) => {
      store.updateFromTurnoTimerEvent(event)
    })

    // ---- Dinamica-specific channel (private winner notification) ----
    const channelName = `dinamica.${slug.value}`
    privateChannel = window.Echo.channel(channelName)

    // DinamicaSpinEvent → update spin result
    privateChannel.listen('.dinamica.spin', (event) => {
      store.updateFromDinamicaSpinEvent(event)
    })

    // DinamicaWinnerEvent → mark as winner end show closure
    privateChannel.listen('.dinamica.winner', (event) => {
      store.updateFromDinamicaWinnerEvent(event)
    })
  }

  function teardown() {
    if (publicChannel && window.Echo) {
      window.Echo.leave('public-ruleta')
      publicChannel = null
    }
    if (privateChannel && slug.value && window.Echo) {
      window.Echo.leave(`dinamica.${slug.value}`)
      privateChannel = null
    }
  }

  // Auto-setup on creation
  setup()

  // Cleanup on component unmount
  onUnmounted(() => {
    teardown()
  })

  return {
    wsConnected,
    setup,
    teardown,
  }
}
