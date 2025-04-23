<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Profile</h1>
    
    <!-- WebSocket Test Button with status indicator -->
    <div class="fixed top-4 right-4 z-50 flex flex-col items-end">
      <div class="flex items-center mb-2">
        <span class="mr-2 text-sm text-white">
          WebSocket: 
          <span :class="{
            'text-green-400': wsConnected,
            'text-red-400': !wsConnected
          }">{{ wsConnected ? 'Connected' : 'Disconnected' }}</span>
        </span>
        <div :class="{
          'w-3 h-3 rounded-full': true,
          'bg-green-500': wsConnected,
          'bg-red-500': !wsConnected
        }"></div>
      </div>
      
      <button 
        @click="testWebSocketUpdate" 
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md disabled:bg-gray-400"
        :disabled="!wsConnected"
      >
        Test WebSocket Update
      </button>
    </div>
    
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
import { testMessageHandling } from '../../utils/websocket-debug';
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue' // <-- Import nextTick
import { useAuthStore } from '../../store/auth'
import { useUserStore } from '../../stores/user' // Fixed import path: store -> stores
import { userApi } from '../../api'
import { webSocketService } from '../../services/websocket'
import { useToast } from '../../composables/useToast'

// Setup stores
const authStore = useAuthStore()
const userStore = useUserStore() // Add userStore for direct profile updates
const { showToast } = useToast()

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

// WebSocket: handle live profile updates
let unsubscribeWebSocket = null

// Utility function for deep merging objects
const mergeDeep = (target, source) => {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      mergeDeep(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}

// Track WebSocket connection status
const wsConnected = ref(false);

// Add a function to test WebSocket handling with better error handling
const testWebSocketUpdate = () => {
  // Check connection before sending
  if (!webSocketService.isConnected) {
    showToast('WebSocket is not connected. Please wait or refresh the page.', 'error');
    return;
  }
  
  // Create test message
  const testMessage = {
    action: 'profile_updated',
    user_id: authStore.user?.id,
    data: {
      first_name: 'WebSocket',
      last_name: 'Test',
      bio: `This update was sent via WebSocket at ${new Date().toLocaleTimeString()}`
    }
  };
  
  // Try to send the message
  const sent = webSocketService.send(testMessage);
  
  if (sent) {
    showToast('Test message sent successfully!', 'success');
    console.log('Test message sent:', testMessage);
  } else {
    showToast('Failed to send test message', 'error');
  }
};

const handleWebSocketMessage = (message) => {
  console.log('[Profile.vue Handler] Received message:', message); 
  
  try {
    // Simple direct handler for the exact message format shown in the error
    if (message && typeof message === 'object' && message.action === 'profile_updated') {
      console.log('[Profile.vue] Exactly matched profile_updated action!');
      
      // Convert IDs to strings to avoid numeric vs string ID comparison issues
      const messageUserId = String(message.user_id || '');
      const currentUserId = String(authStore.user?.id || '');
      
      console.log('[Profile.vue] Message user_id:', messageUserId, 'Current user_id:', currentUserId);
      
      // Process the message if it's for the current user or no user_id is specified
      if (!messageUserId || messageUserId === currentUserId) {
        console.log('[Profile.vue] Processing update for current user');
        
        // Extract the data (either from the data property or the message itself)
        const updateData = message.data || {};
        console.log('[Profile.vue] Update data:', updateData);
        
        // Apply updates directly to userData object
        mergeDeep(userData, updateData);
        
        // Show success message
        successMessage.value = 'Profile updated in real-time!';
        showToast('Profile updated in real-time!', 'success');
        
        return; // Stop processing after handling
      } else {
        console.log('[Profile.vue] Ignoring update for different user:', messageUserId);
      }
    }
    
    // Only process further if the above direct match didn't handle it
    // ...rest of the existing message handling code...
  } catch (e) {
    console.error('[Profile.vue] Error in WebSocket handler:', e);
    showToast(`WebSocket error: ${e.message}`, 'error');
  }
}

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

// Check connection status regularly
const wsStatusInterval = setInterval(() => {
  wsConnected.value = webSocketService.isConnected;
}, 1000);

// Load profile data on component mount
onMounted(async () => {
  await loadProfile()
  // Only connect to WebSocket if user is authenticated and token exists
  const token = localStorage.getItem('access_token')
  if (authStore.user && token) {
    try {
      webSocketService.connect();
      showToast('WebSocket connected successfully', 'success');
      
      unsubscribeWebSocket = webSocketService.subscribe((data) => {
        console.log('[WebSocket Received]', data);
        handleWebSocketMessage(data);
      });
      
      console.log('[Profile.vue] WebSocket subscription active');
      
      // Initial connection status check
      setTimeout(() => {
        wsConnected.value = webSocketService.isConnected;
        console.log('WebSocket connection status:', wsConnected.value ? 'Connected' : 'Disconnected');
        
        if (wsConnected.value) {
          showToast('WebSocket connected successfully', 'success');
        } else {
          showToast('WebSocket connection pending or failed', 'warning');
        }
      }, 1000);
    } catch (e) {
      console.error('WebSocket connection error:', e);
      showToast('WebSocket connection failed', 'error');
    }
  }
})

onUnmounted(() => {
  if (unsubscribeWebSocket) unsubscribeWebSocket()
  clearInterval(wsStatusInterval);
})
</script>