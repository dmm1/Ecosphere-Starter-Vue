<template>
  <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        Create a new account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleRegister">
          <!-- Error alerts -->
          <div v-if="typeof error === 'string'" class="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
            {{ error }}
          </div>
          <div v-else-if="error">
            <div v-for="(errors, field) in error" :key="field" class="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-3">
              <strong class="font-medium">{{ field }}:</strong>
              <ul class="mt-1 ml-4 list-disc">
                <li v-for="(err, index) in errors" :key="index">{{ err }}</li>
              </ul>
            </div>
          </div>

          <!-- Email field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <div class="mt-1">
              <input 
                id="email" 
                v-model="form.email" 
                name="email" 
                type="email" 
                autocomplete="email" 
                required 
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <!-- First name field -->
          <div>
            <label for="first_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              First name
            </label>
            <div class="mt-1">
              <input 
                id="first_name" 
                v-model="form.first_name" 
                name="first_name" 
                type="text" 
                autocomplete="given-name" 
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Last name field -->
          <div>
            <label for="last_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Last name
            </label>
            <div class="mt-1">
              <input 
                id="last_name" 
                v-model="form.last_name" 
                name="last_name" 
                type="text" 
                autocomplete="family-name" 
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Password field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div class="mt-1">
              <input 
                id="password" 
                v-model="form.password" 
                name="password" 
                type="password" 
                autocomplete="new-password" 
                required 
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Password must be at least 10 characters long.
            </p>
          </div>

          <!-- Password confirmation field -->
          <div>
            <label for="password_confirm" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm password
            </label>
            <div class="mt-1">
              <input 
                id="password_confirm" 
                v-model="form.password_confirm" 
                name="password_confirm" 
                type="password" 
                autocomplete="new-password" 
                required 
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <!-- Submit button -->
          <div>
            <button 
              type="submit" 
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              :disabled="loading"
            >
              <span v-if="loading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
              <span v-else>Create account</span>
            </button>
          </div>
        </form>

        <!-- Login link -->
        <div class="mt-6">
          <div class="text-center text-sm">
            <p class="text-gray-600 dark:text-gray-400">
              Already have an account?
              <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Sign in
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dark mode toggle -->
    <div class="mt-4 text-center">
      <button 
        @click="toggleDarkMode" 
        type="button" 
        class="inline-flex items-center p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
      >
        <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
        <span class="ml-2 text-sm">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { useSettingsStore } from '../../store/settings'

// Setup stores and router
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const router = useRouter()

// Form data
const form = ref({
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  password_confirm: ''
})

// Reactive state
const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)
const isDarkMode = computed(() => settingsStore.darkMode)

// Methods
const handleRegister = async () => {
  // Validate password match
  if (form.value.password !== form.value.password_confirm) {
    authStore.error = { password_confirm: ['Passwords do not match'] }
    return
  }

  const userData = {
    email: form.value.email,
    password: form.value.password,
    profile: {
      first_name: form.value.first_name,
      last_name: form.value.last_name
    }
  }

  const success = await authStore.register(userData)
  if (success) {
    router.push('/login')
  }
}

const toggleDarkMode = () => {
  settingsStore.toggleDarkMode()
}

// Initialize settings on component mount
onMounted(() => {
  settingsStore.initializeSettings()
})
</script>