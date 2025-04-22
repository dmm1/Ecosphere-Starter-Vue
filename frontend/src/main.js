import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/css/main.css'
import { useSettingsStore } from './store/settings'

// Create Vue app
const app = createApp(App)

// Use Pinia for state management
app.use(createPinia())

// Use Vue Router
app.use(router)

// Initialize settings
const settingsStore = useSettingsStore();
settingsStore.initializeSettings();

// Mount the app
app.mount('#app')