<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">User Details</h1>
      <router-link 
        to="/admin/users" 
        class="flex items-center text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to User List
      </router-link>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center my-12">
      <svg class="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6">
      {{ error }}
      <div class="mt-4">
        <router-link 
          to="/admin/users" 
          class="text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-600 dark:hover:text-red-200"
        >
          Return to user list
        </router-link>
      </div>
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
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- User Info Card -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden lg:col-span-2">
          <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">User Information</h2>
          </div>
          
          <div class="p-6">
            <form @submit.prevent="saveUser">
              <!-- Basic Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="userData.email" 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" 
                  />
                </div>
                
                <div>
                  <label for="date_joined" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Joined</label>
                  <input 
                    type="text" 
                    id="date_joined" 
                    :value="formatDate(userData.date_joined)" 
                    disabled
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400" 
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
                  <label for="last_login" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Login</label>
                  <input 
                    type="text" 
                    id="last_login" 
                    :value="userData.last_login ? formatDate(userData.last_login) : 'Never'" 
                    disabled
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400" 
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
              </div>
              
              <!-- Additional information -->
              <div class="mb-6">
                <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                <textarea 
                  id="bio" 
                  v-model="userData.bio" 
                  rows="3" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              
              <!-- User role and status -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="flex items-center">
                  <input 
                    id="is_active" 
                    type="checkbox" 
                    v-model="userData.is_active"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label for="is_active" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Active Account
                  </label>
                </div>
                
                <div class="flex items-center">
                  <input 
                    id="is_staff" 
                    type="checkbox" 
                    v-model="userData.is_staff"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label for="is_staff" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Admin Privileges
                  </label>
                </div>
              </div>
              
              <!-- Action buttons -->
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
        
        <!-- Security and Actions Card -->
        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-medium text-gray-900 dark:text-white">Security</h2>
            </div>
            
            <div class="p-6">
              <div class="mb-6">
                <label for="reset_password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reset Password</label>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Send a password reset link to this user's email address.
                </p>
                <button 
                  type="button" 
                  @click="resetPassword" 
                  class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
                  :disabled="resettingPassword"
                >
                  <span v-if="resettingPassword">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                  <span v-else>Send Reset Link</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Danger Zone -->
          <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h2>
            </div>
            
            <div class="p-6">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delete User</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  This action is irreversible. All data associated with this user will be permanently removed.
                </p>
                <button 
                  type="button" 
                  @click="confirmDeleteUser" 
                  class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Delete confirmation modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 overflow-y-auto z-50">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" @click="showDeleteModal = false"></div>
          
          <!-- Modal panel -->
          <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Delete User
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete this user? All data will be permanently removed.
                      This action cannot be undone.
                    </p>
                    <div class="mt-4">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ userData.email }}
                      </p>
                    </div>
                    <div v-if="userData.is_staff" class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 rounded-md">
                      <p class="text-sm text-yellow-700 dark:text-yellow-300">
                        <strong>Warning:</strong> You are about to delete an admin user.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                @click="deleteUser" 
                type="button" 
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                :disabled="deleting"
              >
                <span v-if="deleting">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
                <span v-else>Delete</span>
              </button>
              <button 
                @click="showDeleteModal = false" 
                type="button" 
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userApi } from '../../api'

// Router and route
const route = useRoute()
const router = useRouter()
const userId = route.params.id

// Reactive state
const loading = ref(true)
const saving = ref(false)
const resettingPassword = ref(false)
const deleting = ref(false)
const error = ref(null)
const successMessage = ref('')
const showDeleteModal = ref(false)

// User data
const originalUserData = ref({})
const userData = reactive({
  email: '',
  first_name: '',
  last_name: '',
  bio: '',
  is_active: true,
  is_staff: false,
  date_joined: '',
  last_login: null,
  profile: {
    phone_number: ''
  }
})

// Methods
const loadUser = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await userApi.getUser(userId)
    
    // Store original data for reset functionality
    originalUserData.value = JSON.parse(JSON.stringify(response.data))
    
    // Set user data
    Object.assign(userData, response.data)
    
    // Ensure profile structure exists
    if (!userData.profile) {
      userData.profile = {
        phone_number: ''
      }
    }
    
    loading.value = false
  } catch (err) {
    loading.value = false
    error.value = err.response?.data?.detail || 'Failed to load user data'
  }
}

const saveUser = async () => {
  saving.value = true
  error.value = null
  successMessage.value = ''
  
  try {
    const updateData = {
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      bio: userData.bio,
      is_active: userData.is_active,
      is_staff: userData.is_staff,
      profile: {
        phone_number: userData.profile.phone_number
      }
    }
    
    await userApi.updateUser(userId, updateData)
    
    // Update original data after successful save
    originalUserData.value = JSON.parse(JSON.stringify(userData))
    
    successMessage.value = 'User information updated successfully'
    saving.value = false
  } catch (err) {
    saving.value = false
    error.value = err.response?.data?.detail || 'Failed to update user'
  }
}

const resetForm = () => {
  // Reset form data to original values
  Object.assign(userData, JSON.parse(JSON.stringify(originalUserData.value)))
}

const resetPassword = async () => {
  resettingPassword.value = true
  error.value = null
  successMessage.value = ''
  
  try {
    // This endpoint would need to be implemented in your Django backend
    await userApi.resetUserPassword(userId)
    successMessage.value = 'Password reset link sent to user'
    resettingPassword.value = false
  } catch (err) {
    resettingPassword.value = false
    error.value = err.response?.data?.detail || 'Failed to send password reset link'
  }
}

const confirmDeleteUser = () => {
  showDeleteModal.value = true
}

const deleteUser = async () => {
  deleting.value = true
  
  try {
    // This endpoint would need to be implemented in your Django backend
    await userApi.deleteUser(userId)
    router.push('/admin/users')
  } catch (err) {
    deleting.value = false
    showDeleteModal.value = false
    error.value = err.response?.data?.detail || 'Failed to delete user'
  }
}

// Format a date in a human-readable format
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}

// Load user data on component mount
onMounted(() => {
  loadUser()
})
</script>