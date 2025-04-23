<template>
  <div class="min-h-screen" :class="isDarkMode ? 'dark' : ''">
    <ToastContainer />
    <NavBar v-if="isAuthenticated" />
    <main class="container mx-auto px-4 py-6">
      <router-view />
    </main>
    <footer v-if="isAuthenticated" class="mt-auto py-4 text-center text-sm text-gray-500 dark:text-gray-400">
      &copy; {{ new Date().getFullYear() }} Ecosphere
    </footer>
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