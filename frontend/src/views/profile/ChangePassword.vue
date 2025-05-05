<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h1>
    
    <!-- Success notification -->
    <div v-if="successMessage" class="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded-md flex items-center justify-between">
      <div>{{ successMessage }}</div>
      <button @click="successMessage = ''" class="text-green-700 dark:text-green-300 hover:text-green-600 dark:hover:text-green-200">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    
    <!-- Error notification -->
    <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md flex items-center justify-between">
      <div v-if="typeof error === 'string'">{{ error }}</div>
      <div v-else>
        <div v-for="(errors, field) in error" :key="field">
          <strong>{{ field }}:</strong> {{ errors.join(', ') }}
        </div>
      </div>
      <button @click="error = null" class="text-red-700 dark:text-red-300 hover:text-red-600 dark:hover:text-red-200">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    
    <!-- Password Form -->
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div class="p-6">
        <form @submit.prevent="changePassword">
          <!-- Current Password -->
          <div class="mb-6">
            <label for="current_password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <div class="mt-1">
              <input 
                id="current_password"
                type="password" 
                v-model="form.currentPassword"
                autocomplete="current-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <!-- New Password -->
          <div class="mb-6">
            <label for="new_password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <div class="mt-1">
              <input 
                id="new_password"
                type="password"
                v-model="form.newPassword"
                autocomplete="new-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Password must be at least 10 characters long.
            </p>
          </div>
          
          <!-- Confirm New Password -->
          <div class="mb-6">
            <label for="confirm_password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div class="mt-1">
              <input 
                id="confirm_password"
                type="password"
                v-model="form.confirmPassword"
                autocomplete="new-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <!-- Password strength indicator -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password Strength
            </label>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div :class="strengthBarColorClass" class="h-2.5 rounded-full" :style="{ width: `${passwordStrength.score * 25}%` }"></div>
            </div>
            <p class="mt-1 text-xs" :class="strengthTextColorClass">
              {{ passwordStrength.message }}
            </p>
          </div>
          
          <!-- Submit Button -->
          <div>
            <button 
              type="submit" 
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              :disabled="loading || !passwordsMatch || passwordStrength.score < 2"
            >
              <span v-if="loading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating password...
              </span>
              <span v-else>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../../store/auth'

// Setup auth store
const authStore = useAuthStore()

// Reactive state
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const successMessage = ref('')
const error = computed(() => authStore.error)
const loading = computed(() => authStore.loading)

// Computed properties for password validation
const passwordsMatch = computed(() => {
  if (!form.value.newPassword || !form.value.confirmPassword) return false
  return form.value.newPassword === form.value.confirmPassword
})

const passwordStrength = computed(() => {
  const password = form.value.newPassword || ''
  
  if (!password) {
    return { score: 0, message: 'No password provided' }
  }
  
  // Check password length
  const lengthScore = Math.min(Math.floor(password.length / 3), 2)
  
  // Check for mix of character types
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  
  const diversityScore = (hasLower ? 1 : 0) + 
                         (hasUpper ? 1 : 0) + 
                         (hasNumber ? 1 : 0) + 
                         (hasSpecial ? 1 : 0)
  
  // Calculate total score (0-4)
  const totalScore = Math.min(lengthScore + Math.floor(diversityScore / 2), 4)
  
  // Set appropriate message based on score
  let message
  switch (totalScore) {
    case 0:
      message = 'Very weak'
      break
    case 1:
      message = 'Weak'
      break
    case 2:
      message = 'Fair'
      break
    case 3:
      message = 'Good'
      break
    case 4:
      message = 'Strong'
      break
    default:
      message = 'Unknown'
  }
  
  return { score: totalScore, message }
})

// Color classes for strength indicator
const strengthBarColorClass = computed(() => {
  const score = passwordStrength.value.score
  if (score <= 1) return 'bg-red-600'
  if (score === 2) return 'bg-yellow-600'
  if (score === 3) return 'bg-green-600'
  if (score >= 4) return 'bg-green-700'
  return 'bg-gray-400'
})

const strengthTextColorClass = computed(() => {
  const score = passwordStrength.value.score
  if (score <= 1) return 'text-red-600 dark:text-red-400'
  if (score === 2) return 'text-yellow-600 dark:text-yellow-400'
  if (score === 3) return 'text-green-600 dark:text-green-400'
  if (score >= 4) return 'text-green-700 dark:text-green-500'
  return 'text-gray-500 dark:text-gray-400'
})

// Methods
const changePassword = async () => {
  // Basic validation
  if (!passwordsMatch.value) {
    authStore.error = 'Passwords do not match'
    return
  }
  
  if (passwordStrength.value.score < 2) {
    authStore.error = 'Password is too weak'
    return
  }
  
  // Submit password change request
  const success = await authStore.changePassword(
    form.value.currentPassword,
    form.value.newPassword
  )
  
  if (success) {
    // Reset form and show success message
    form.value.currentPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
    successMessage.value = 'Password successfully updated!'
  }
}

// Reset error when form changes
watch(form, () => {
  if (authStore.error) {
    authStore.error = null
  }
}, { deep: true })
</script>