<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Profile</h1>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center my-12">
      <svg class="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    
    <div v-else>
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
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Info Card -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden lg:col-span-2">
          <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h2>
          </div>
          
          <div class="p-6">
            <form @submit.prevent="updateProfile">
              <!-- Basic Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="userData.email" 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400" 
                    readonly
                    disabled
                  />
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Contact support to change your email address
                  </p>
                </div>
                
                <div>
                  <label for="date_joined" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</label>
                  <input 
                    type="text" 
                    id="date_joined" 
                    :value="formatDate(userData.date_joined)" 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400" 
                    readonly
                    disabled
                  />
                </div>
                
                <div>
                  <label for="first_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input 
                    type="text" 
                    id="first_name" 
                    v-model="userData.first_name" 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" 
                  />
                </div>
                
                <div>
                  <label for="last_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input 
                    type="text" 
                    id="last_name" 
                    v-model="userData.last_name" 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" 
                  />
                </div>
                
                <div>
                  <label for="phone_number" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone_number" 
                    v-model="userData.profile.phone_number" 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" 
                  />
                </div>
                
                <div>
                  <label for="last_login" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Login</label>
                  <input 
                    type="text" 
                    id="last_login" 
                    :value="userData.last_login ? formatDate(userData.last_login) : 'Never'" 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400" 
                    readonly
                    disabled
                  />
                </div>
              </div>
              
              <!-- Additional Information -->
              <div class="mb-6">
                <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">About Me</label>
                <textarea 
                  id="bio" 
                  v-model="userData.bio" 
                  rows="4" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Tell us a little about yourself..."
                ></textarea>
              </div>
              
              <!-- Submit Button -->
              <div class="flex justify-end">
                <button 
                  type="button" 
                  class="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  @click="resetForm"
                >
                  Reset
                </button>
                <button 
                  type="submit" 
                  class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  :disabled="saving"
                >
                  <span v-if="saving">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                  <span v-else>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Account Security Card -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Security</h2>
          </div>
          
          <div class="p-6">
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Update your password to ensure your account stays secure.
              </p>
              <router-link 
                to="/change-password" 
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
              >
                Change Password
              </router-link>
            </div>
            
            <div class="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Status</h3>
              <div class="flex items-center">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  userData.is_active ? 
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                ]">
                  {{ userData.is_active ? 'Active' : 'Inactive' }}
                </span>
                <span v-if="userData.is_staff" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import { userApi } from '../../api'

// Setup auth store
const authStore = useAuthStore()

// Reactive state
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const successMessage = ref('')
const originalUserData = ref({})

const userData = reactive({
  email: '',
  first_name: '',
  last_name: '',
  bio: '',
  date_joined: '',
  last_login: null,
  is_active: true,
  is_staff: false,
  profile: {
    phone_number: '',
  }
})

// Methods
const loadProfile = async () => {
  loading.value = true
  error.value = null
  
  try {
    // First try to get user data from auth store
    if (authStore.user) {
      Object.assign(userData, authStore.user)
      
      // Ensure profile structure exists
      if (!userData.profile) {
        userData.profile = {
          phone_number: ''
        }
      }
      
      // Store original data for reset functionality
      originalUserData.value = JSON.parse(JSON.stringify(userData))
      
      loading.value = false
    } else {
      // If not in store, fetch from API
      const response = await userApi.getProfile()
      
      // Store in userData
      Object.assign(userData, response.data)
      
      // Store original data for reset functionality
      originalUserData.value = JSON.parse(JSON.stringify(userData))
      
      loading.value = false
    }
  } catch (err) {
    loading.value = false
    error.value = err.response?.data?.detail || 'Failed to load profile data'
  }
}

const updateProfile = async () => {
  saving.value = true
  error.value = null
  successMessage.value = ''
  
  try {
    // Prepare update data including both user and profile data
    const updateData = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      bio: userData.bio,
      profile: {
        phone_number: userData.profile.phone_number
      }
    }
    
    // Send update request
    await userApi.updateProfile(updateData)
    
    // Update original data after successful save
    originalUserData.value = JSON.parse(JSON.stringify(userData))
    
    // Update auth store user data
    await authStore.fetchCurrentUser()
    
    successMessage.value = 'Profile successfully updated!'
    saving.value = false
  } catch (err) {
    saving.value = false
    error.value = err.response?.data || 'Failed to update profile'
  }
}

const resetForm = () => {
  // Reset form data to original values
  Object.assign(userData, JSON.parse(JSON.stringify(originalUserData.value)))
  error.value = null
}

// Format a date in a human-readable format
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Load profile data on component mount
onMounted(() => {
  loadProfile()
})
</script>