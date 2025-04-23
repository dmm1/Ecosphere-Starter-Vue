<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>
      <button 
        class="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        @click="addNewUser"
      >
        Add New User
      </button>
    </div>
    
    <!-- Filters and search -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-grow">
          <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              id="search"
              type="text"
              v-model="searchQuery"
              @input="debounceSearch"
              class="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              placeholder="Search by name or email..."
            />
          </div>
        </div>
        
        <div class="sm:w-48">
          <label for="status-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            id="status-filter"
            v-model="activeFilter"
            @change="fetchUsers"
            class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">All Users</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Loading indicator -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-gray-600 dark:text-gray-300 text-lg">Loading users...</span>
    </div>
    
    <!-- Users table -->
    <div v-else-if="users.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ user.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span class="text-primary-800 dark:text-primary-200 font-medium text-sm">
                      {{ getInitials(user) }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.first_name }} {{ user.last_name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="user.is_staff" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Admin
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  User
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="user.is_active" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Inactive
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="editUser(user)" 
                  class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                >
                  Edit
                </button>
                <button 
                  @click="toggleUserStatus(user)" 
                  class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  :class="{'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300': user.is_active}"
                >
                  {{ user.is_active ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Showing <span class="font-medium">{{ users.length }}</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Previous</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {{ currentPage }} of {{ totalPages || 1 }}
              </span>
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages || totalPages === 0"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Next</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
      </svg>
      <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">No users found</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ searchQuery ? 'Try adjusting your search criteria.' : 'Add your first user to get started.' }}
      </p>
      <div class="mt-6">
        <button
          type="button"
          @click="addNewUser"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add New User
        </button>
      </div>
    </div>
    
    <!-- User edit/create modal using standard HTML/Tailwind -->
    <div v-if="!!editingUser" class="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="cancelEdit"></div>

        <!-- This element centers the modal contents -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <!-- Modal panel -->
        <div class="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" style="z-index: 20;">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
              {{ isNewUser ? 'Create User' : 'Edit User' }}
            </h3>
            
            <form @submit.prevent="saveUser" class="mt-4 space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <div class="mt-1">
                  <input
                    id="email"
                    type="email"
                    v-model="editingUser.email"
                    :disabled="!isNewUser"
                    required
                    class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    :class="{ 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed': !isNewUser }"
                  />
                  <p v-if="!isNewUser" class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
              <div>
                <label for="first_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <div class="mt-1">
                  <input
                    id="first_name"
                    type="text"
                    v-model="editingUser.first_name"
                    class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>
              <div>
                <label for="last_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <div class="mt-1">
                  <input
                    id="last_name"
                    type="text"
                    v-model="editingUser.last_name"
                    class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>
              
              <div v-if="isNewUser">
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <div class="mt-1">
                  <input
                    id="password"
                    type="password"
                    v-model="editingUser.password"
                    required
                    class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input
                    id="is_active"
                    type="checkbox"
                    v-model="editingUser.is_active"
                    class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="is_active" class="font-medium text-gray-700 dark:text-gray-300">Active</label>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input
                    id="is_staff"
                    type="checkbox"
                    v-model="editingUser.is_staff"
                    class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="is_staff" class="font-medium text-gray-700 dark:text-gray-300">Admin</label>
                  <p class="text-gray-500 dark:text-gray-400">Can access admin panel and manage users</p>
                </div>
              </div>
              
              <!-- Error message -->
              <div v-if="formError" class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-red-700 dark:text-red-300">{{ formError }}</p>
                  </div>
                </div>
              </div>
              
              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="loading"
                  class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {{ loading ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import Footer from '../../components/layout/Footer.vue'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useAdminStore } from '../../stores/admin'
import { useToast } from '../../composables/useToast'

// State management
const authStore = useAuthStore()
const adminStore = useAdminStore()
const { showToast } = useToast()

// UI state
const users = ref<any[]>([])
const editingUser = ref<any>(null)
const loading = ref(false)
const searchQuery = ref('')
const activeFilter = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const formError = ref('')
const isNewUser = computed(() => editingUser.value && !editingUser.value.id)

// Custom debounce function implementation
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

// Debounced search function
const debounceSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(() => {
    currentPage.value = 1; // Reset to first page when searching
    fetchUsers();
  }, 300);
};

// Initialize WebSocket with authentication token
const initializeWebSocket = () => {
  if (!authStore.accessToken) {
    console.error('Cannot initialize WebSocket: No auth token available');
    return;
  }
  
  // Import the WebSocketService dynamically to avoid circular dependencies
  import('../../services/websocket').then(({ webSocketService }) => {
    if (!webSocketService.isConnected) {
      console.log('Connecting to WebSocket for user management...');
      webSocketService.connect();
    }
    
    // Subscribe to WebSocket updates
    const unsubscribe = webSocketService.subscribe(handleWebSocketMessage);
    
    // Store the unsubscribe function for cleanup
    onUnmounted(() => {
      if (unsubscribe) {
        console.log('Unsubscribing from WebSocket in UserManagement');
        unsubscribe();
      }
    });
  }).catch(error => {
    console.error('Failed to import WebSocketService:', error);
  });
};

// Get user initials for avatar
const getInitials = (user: any) => {
  const first = (user.first_name || '').charAt(0)
  const last = (user.last_name || '').charAt(0)
  return (first + last).toUpperCase() || user.email.charAt(0).toUpperCase()
}

// Fetch users with search and filter
const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await adminStore.fetchUsers({
      page: currentPage.value,
      search: searchQuery.value,
      is_active: activeFilter.value || undefined
    })
    
    users.value = response.results || []
    totalPages.value = Math.ceil((response.count || 0) / 10) // Assuming page size of 10
  } catch (error) {
    console.error('Failed to fetch users:', error)
    showToast('Failed to load users', 'error')
  } finally {
    loading.value = false
  }
}

// Page navigation
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchUsers()
}

// User editing/creation
const editUser = (user: any) => {
  editingUser.value = { ...user }
  formError.value = ''
}

const addNewUser = () => {
  editingUser.value = {
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_active: true,
    is_staff: false
  }
  formError.value = ''
}

const cancelEdit = () => {
  editingUser.value = null
  formError.value = ''
}

const saveUser = async () => {
  if (!editingUser.value) return
  formError.value = ''
  
  try {
    loading.value = true
    
    if (isNewUser.value) {
      // Create new user
      const newUser = await adminStore.createUser(editingUser.value);
      showToast(`User ${newUser.email} created successfully`, 'success');
      
      // Send a WebSocket message if we have the service
      import('../../services/websocket').then(({ webSocketService }) => {
        if (webSocketService.isConnected) {
          webSocketService.send({
            action: 'user_created',
            user_id: newUser.id,
            data: newUser
          });
        }
      });
    } else {
      // Update existing user
      const updatedUser = await adminStore.updateUser(editingUser.value);
      showToast(`User ${updatedUser.email} updated successfully`, 'success');
      
      // Send a WebSocket message if we have the service
      import('../../services/websocket').then(({ webSocketService }) => {
        if (webSocketService.isConnected) {
          webSocketService.send({
            action: 'user_updated',
            user_id: updatedUser.id,
            data: updatedUser
          });
        }
      });
    }
    
    cancelEdit();
    fetchUsers();
  } catch (error: any) {
    console.error('Failed to save user:', error);
    formError.value = error.response?.data?.detail || error.response?.data?.message || 'Failed to save user';
    showToast('Failed to save user', 'error');
  } finally {
    loading.value = false;
  }
}

// User activation/deactivation
const toggleUserStatus = async (user: any) => {
  try {
    loading.value = true
    const newStatus = !user.is_active;
    const updatedData = { ...user, is_active: newStatus };
    
    const updatedUser = await adminStore.updateUser(updatedData);
    
    // Update the user in the local list
    const userIndex = users.value.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users.value[userIndex] = updatedUser;
    }
    
    // Show toast notification
    showToast(
      `User ${updatedUser.email} ${newStatus ? 'activated' : 'deactivated'} successfully`, 
      newStatus ? 'success' : 'warning'
    );
    
    // Send WebSocket notification
    import('../../services/websocket').then(({ webSocketService }) => {
      if (webSocketService.isConnected) {
        webSocketService.send({
          action: 'user_updated',
          user_id: updatedUser.id,
          data: updatedUser
        });
      }
    });
  } catch (error) {
    console.error('Failed to update user status:', error);
    showToast('Failed to update user status', 'error');
  } finally {
    loading.value = false
  }
}

// WebSocket handling - improved live updates
const handleWebSocketMessage = (message: any) => {
  console.log('Admin received WebSocket message:', message);
  
  // Handle action-based messages that come from other clients
  if (message.action) {
    switch (message.action) {
      case 'user_updated':
      case 'profile_updated':
        // Find and update the user in the list
        const userIndex = users.value.findIndex(user => user.id === message.user_id);
        if (userIndex !== -1) {
          // Create a new object to ensure reactivity
          const updatedUser = { ...users.value[userIndex], ...message.data };
          users.value[userIndex] = updatedUser;
          
          // Show toast notification for changes from other clients
          const userName = updatedUser.first_name ? 
            `${updatedUser.first_name} ${updatedUser.last_name}` : 
            updatedUser.email;
          
          showToast(`User ${userName} was updated by another admin`, 'info');
        } else {
          // If we don't have this user, refresh the list
          fetchUsers();
        }
        break;
        
      case 'user_deleted':
        // Find the user before removing
        const deletedUser = users.value.find(user => user.id === message.user_id);
        
        if (deletedUser) {
          const userName = deletedUser.first_name ? 
            `${deletedUser.first_name} ${deletedUser.last_name}` : 
            deletedUser.email;
          
          // Remove from list
          users.value = users.value.filter(user => user.id !== message.user_id);
          
          // Show toast notification
          showToast(`User ${userName} was deleted by another admin`, 'warning');
        }
        break;
        
      case 'user_created':
        // Refresh the list to include the new user
        fetchUsers();
        
        // Show toast notification
        showToast('A new user was created by another admin', 'info');
        break;
    }
  }
  
  // Handle message format that could come from Django Channels
  if (message.type === 'user_event' && message.data) {
    const event = message.data;
    
    if (event.action === 'updated') {
      // Refresh user data
      fetchUsers();
      showToast('User data was updated', 'info');
    } else if (event.action === 'deleted') {
      // Refresh user data
      fetchUsers();
      showToast('A user was deleted', 'warning');
    } else if (event.action === 'created') {
      // Refresh user data
      fetchUsers();
      showToast('A new user was created', 'info');
    }
  }
};

// Custom event handlers for admin user updates
const handleAdminUserUpdate = (event: CustomEvent) => {
  const { userId, userData } = event.detail;
  
  const userIndex = users.value.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    // Create a new object to ensure reactivity
    users.value[userIndex] = { ...users.value[userIndex], ...userData };
    
    // Show toast notification
    const userName = users.value[userIndex].first_name || users.value[userIndex].email;
    showToast(`User ${userName} was updated`, 'success');
  }
};

const handleAdminUserDelete = (event: CustomEvent) => {
  const { userId } = event.detail;
  
  // Find the user before removing
  const deletedUser = users.value.find(user => user.id === userId);
  const userName = deletedUser ? `${deletedUser.first_name} ${deletedUser.last_name}` : `#${userId}`;
  
  // Remove from list
  users.value = users.value.filter(user => user.id !== userId);
  
  // Show toast notification
  showToast(`User ${userName} was deleted`, 'warning');
};

// Watch for auth changes to reconnect WebSocket if needed
watch(() => authStore.accessToken, (newToken) => {
  if (newToken) {
    initializeWebSocket()
  }
}, { immediate: true })

// Lifecycle hooks
onMounted(() => {
  fetchUsers()
  
  // Only initialize WebSocket if we have an auth token
  if (authStore.accessToken) {
    initializeWebSocket();
  }
  
  // Listen for custom events from auth store
  window.addEventListener('admin-user-updated', handleAdminUserUpdate as EventListener)
  window.addEventListener('admin-user-deleted', handleAdminUserDelete as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('admin-user-updated', handleAdminUserUpdate as EventListener)
  window.removeEventListener('admin-user-deleted', handleAdminUserDelete as EventListener)
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: var(--primary-color);
  color: white;
}

.pagination {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  border-radius: 5px;
  padding: 20px;
  width: 90%;
  max-width: 500px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
