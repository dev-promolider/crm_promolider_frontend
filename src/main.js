import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

import './assets/css/main.css'

// Laravel Echo + Pusher (WebSocket)
// Static imports so window.Echo is available synchronously for composables
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY
const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1'

if (pusherKey) {
  window.Pusher = Pusher
  window.Echo = new Echo({
    broadcaster: 'pusher',
    key: pusherKey,
    cluster: pusherCluster,
    encrypted: true,
    wsHost: import.meta.env.VITE_WS_HOST || window.location.hostname,
    wsPort: import.meta.env.VITE_WS_PORT || 6001,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    forceTLS: false,
  })
} else {
  console.info('[Echo] Pusher no configurado — WebSocket no disponible. Se usará polling como fallback.')
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
