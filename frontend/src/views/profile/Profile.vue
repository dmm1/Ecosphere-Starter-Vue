<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Your Profile</h1>
    
    <!-- Alert Messages -->
    <div v-if="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
      <p class="font-bold">Success</p>
      <p>{{ successMessage }}</p>
    </div>
    
    <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
      <p class="font-bold">Error</p>
      <p>{{ errorMessage }}</p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Profile Info -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-lg font-medium mb-4">Profile Information</h2>
        <form @submit.prevent="updateProfile">
          <!-- Email -->
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              id="email" 
              v-model="profileForm.email" 
              disabled 
              class="bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
            >
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Contact admin to change your email</p>
          </div>
          
          <!-- First Name -->
          <div class="mb-4">
            <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              v-model="profileForm.first_name" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
          </div>
          
          <!-- Last Name -->
          <div class="mb-4">
            <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              v-model="profileForm.last_name" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
          </div>
          
          <!-- Bio -->
          <div class="mb-4">
            <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
            <textarea 
              id="bio" 
              v-model="profileForm.bio" 
              rows="4" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Tell us about yourself"
            ></textarea>
          </div>
          
          <div class="flex justify-end">
            <button 
              type="submit" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              :disabled="profileLoading"
            >
              <span v-if="profileLoading">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
      
      <!-- Password Change -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-lg font-medium mb-4">Change Password</h2>
        <form @submit.prevent="changePassword">
          <!-- Current Password -->
          <div class="mb-4">
            <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input 
              type="password" 
              id="currentPassword" 
              v-model="passwordForm.current_password" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            >
          </div>
          
          <!-- New Password -->
          <div class="mb-4">
            <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input 
              type="password" 
              id="newPassword" 
              v-model="passwordForm.new_password" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
              minlength="8"
            >
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 8 characters</p>
          </div>
          
          <!-- Confirm New Password -->
          <div class="mb-4">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="passwordForm.confirm_password" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            >
          </div>
          
          <div class="flex justify-end">
            <button 
              type="submit" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              :disabled="passwordLoading || !passwordsMatch || !passwordForm.new_password"
            >
              <span v-if="passwordLoading">Updating...</span>
              <span v-else>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import api from '../../api'

const authStore = useAuthStore()
const profileLoading = ref(false)
const passwordLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Profile form data
const profileForm = reactive({
  email: '',
  first_name: '',
  last_name: '',
  bio: ''
})

// Password change form
const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

// Computed properties
const passwordsMatch = computed(() => {
  return passwordForm.new_password === passwordForm.confirm_password
})

// Load profile data
const loadProfile = () => {
  if (authStore.user) {
    profileForm.email = authStore.user.email || ''
    profileForm.first_name = authStore.user.first_name || ''
    profileForm.last_name = authStore.user.last_name || ''
    profileForm.bio = authStore.user.bio || ''
  }
}

// Save profile changes
const updateProfile = async () => {
  profileLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const response = await api.patch('/account/profile/', {
      first_name: profileForm.first_name,
      last_name: profileForm.last_name,
      bio: profileForm.bio
    })
    
    // Update user in store
    authStore.user = { ...authStore.user, ...response.data }
    successMessage.value = 'Profile updated successfully'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error updating profile:', error)
    errorMessage.value = error.response?.data?.detail || 'Failed to update profile'
  } finally {
    profileLoading.value = false
  }
}

// Change password
const changePassword = async () => {
  // Validate passwords match
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    errorMessage.value = 'New passwords do not match'
    return
  }
  
  passwordLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    await authStore.changePassword(passwordForm.current_password, passwordForm.new_password)
    
    // Reset form fields
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
    
    successMessage.value = 'Password changed successfully'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error changing password:', error)
    errorMessage.value = error.response?.data?.detail || error.response?.data?.current_password?.[0] || 'Failed to change password'
  } finally {
    passwordLoading.value = false
  }
}

// WebSocket profile update handler
const handleProfileUpdate = (event) => {
  // Only update if it's our user
  if (authStore.user && event.detail.userId === authStore.user.id) {
    loadProfile() // Reload profile data from store
    successMessage.value = 'Your profile was updated in real-time'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
}

onMounted(() => {
  loadProfile() // Initialize form with current user data
  
  // Listen for real-time profile updates
  window.addEventListener('user-profile-updated', handleProfileUpdate)
})

onUnmounted(() => {
  window.removeEventListener('user-profile-updated', handleProfileUpdate)
})
</script>