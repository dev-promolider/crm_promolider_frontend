import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'

// Import vendor CSS
import '../public/vendors/css/vendors.min.css'

// Import core styling from the brought resources
import './assets/sass/core.scss'
import './assets/sass/overrides.scss'

import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')

