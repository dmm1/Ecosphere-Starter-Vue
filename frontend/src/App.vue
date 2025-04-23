<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
    <router-view />
    <Toast />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './store/auth'
import { useSettingsStore } from './store/settings'
import NavBar from './components/layout/NavBar.vue'
import ToastContainer from './components/ToastContainer.vue'
import Toast from './components/ui/Toast.vue'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isDarkMode = computed(() => settingsStore.darkMode)

// Initialize auth state from localStorage
onMounted(async () => {
  await authStore.initializeAuth()
  
  // If user is not authenticated and not on auth pages, redirect to login
  if (!authStore.isAuthenticated && 
      !router.currentRoute.value.path.includes('/login') && 
      !router.currentRoute.value.path.includes('/register')) {
    router.push('/login')
  }
})

// Watch authentication state and redirect accordingly
watch(() => authStore.isAuthenticated, (newValue) => {
  if (!newValue && 
      !router.currentRoute.value.path.includes('/login') && 
      !router.currentRoute.value.path.includes('/register')) {
    router.push('/login')
  }
})
</script>