import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

import './assets/css/main.css'

// Laravel Echo + Pusher (WebSocket)
// Static imports so window.Echo is available synchronously for composables
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

async function initApp() {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const DYNAMIC_API_URL = isLocal ? "http://127.0.0.1:8000/api/v1" : "https://api.promolider.email/api/v1"; // Cambia esta URL por la de tu producción

  const apiUrl = import.meta.env.VITE_API_URL || DYNAMIC_API_URL;
  const configUrl = `${apiUrl}/config`
  
  try {
    const response = await fetch(configUrl)
    const config = await response.json()

    if (config.pusher_app_key) {
      window.Pusher = Pusher
      window.Echo = new Echo({
        broadcaster: 'pusher',
        key: config.pusher_app_key,
        cluster: config.pusher_cluster || 'mt1',
        encrypted: true,
        wsHost: import.meta.env.VITE_WS_HOST || window.location.hostname,
        wsPort: import.meta.env.VITE_WS_PORT || 6001,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        forceTLS: false,
      })
    } else {
      console.info('[Echo] Pusher no configurado desde el backend — WebSocket no disponible.')
    }
  } catch (error) {
    console.warn('[Echo] Error al obtener la configuración de Pusher:', error)
  }

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  app.mount('#app')
}

initApp()
