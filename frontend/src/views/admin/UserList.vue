<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Management</h1>
    
    <!-- Error alert -->
    <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md flex items-center justify-between">
      <div>{{ error }}</div>
      <button @click="error = null" class="text-red-700 dark:text-red-300 hover:text-red-600 dark:hover:text-red-200">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    
    <!-- Search and filter controls -->
    <div class="mb-6 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- Search input -->
        <div class="w-full md:w-auto flex-grow">
          <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Search users</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              id="search"
              v-model="filters.search"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Search by email or name..."
              @keyup.enter="handleSearch"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <button @click="handleSearch" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Status filter -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select 
            id="status" 
            v-model="filters.is_active" 
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-gray-700 dark:text-white"
            @change="loadUsers"
          >
            <option value="">All Users</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        
        <!-- Role filter -->
        <div>
          <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
          <select 
            id="role" 
            v-model="filters.is_staff" 
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-gray-700 dark:text-white"
            @change="loadUsers"
          >
            <option value="">All Roles</option>
            <option value="true">Admins</option>
            <option value="false">Regular Users</option>
          </select>
        </div>
        
        <!-- Clear filters button -->
        <div>
          <button 
            @click="clearFilters" 
            class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
    
    <!-- Users table -->
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Last Login
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-4">
                <div class="flex items-center justify-center">
                  <svg class="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="ml-2 text-gray-700 dark:text-gray-300">Loading users...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No users found matching your filters.
              </td>
            </tr>
            <template v-else>
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-800 dark:text-primary-200 uppercase font-bold">
                      {{ user.email ? user.email.charAt(0) : '?' }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ user.profile && (user.profile.first_name || user.profile.last_name) ? 
                           `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim() : 
                           'No Name' }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ user.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    user.is_active ? 
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  ]">
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {{ user.is_staff ? 'Admin' : 'User' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(user.date_joined) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ user.last_login ? formatDate(user.last_login) : 'Never' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <router-link 
                    :to="`/admin/users/${user.id}`" 
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </router-link>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination controls -->
      <div v-if="pagination.count > 0" class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Showing
              <span class="font-medium">{{ ((pagination.page - 1) * pagination.pageSize) + 1 }}</span>
              to
              <span class="font-medium">{{ Math.min(pagination.page * pagination.pageSize, pagination.count) }}</span>
              of
              <span class="font-medium">{{ pagination.count }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <!-- Previous page -->
              <button
                @click="goToPage(pagination.page - 1)"
                :disabled="pagination.page <= 1"
                :class="[
                  'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium',
                  pagination.page <= 1 ? 
                    'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 
                    'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                <span class="sr-only">Previous</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <!-- Page numbers -->
              <template v-for="pageNum in paginationRange" :key="pageNum">
                <button
                  @click="goToPage(pageNum)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium',
                    pageNum === pagination.page ? 
                      'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200' : 
                      'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  ]"
                >
                  {{ pageNum }}
                </button>
              </template>
              
              <!-- Next page -->
              <button
                @click="goToPage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.totalPages"
                :class="[
                  'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium',
                  pagination.page >= pagination.totalPages ? 
                    'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 
                    'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../../api'

// Reactive state
const users = ref([])
const loading = ref(true)
const error = ref(null)
const filters = reactive({
  search: '',
  is_active: '',
  is_staff: ''
})
const pagination = reactive({
  count: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1
})

// Methods
const loadUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Build filter object with only non-empty values
    const activeFilters = {}
    if (filters.search) activeFilters.search = filters.search
    if (filters.is_active) activeFilters.is_active = filters.is_active
    if (filters.is_staff) activeFilters.is_staff = filters.is_staff
    
    // Add pagination parameters
    const params = {
      ...activeFilters,
      page: pagination.page,
      page_size: pagination.pageSize
    }
    
    // Fetch users with pagination and filters
    const response = await userApi.getUsers(params)
    users.value = response.data.results
    
    // Update pagination state
    pagination.count = response.data.count
    pagination.totalPages = Math.ceil(response.data.count / pagination.pageSize)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  if (page < 1 || page > pagination.totalPages || page === '...') return
  pagination.page = page
  loadUsers()
}

const handleSearch = () => {
  pagination.page = 1 // Reset to first page when searching
  loadUsers()
}

const clearFilters = () => {
  filters.search = ''
  filters.is_active = ''
  filters.is_staff = ''
  pagination.page = 1
  loadUsers()
}

// Computed properties for pagination
const paginationRange = computed(() => {
  const totalPages = pagination.totalPages
  const currentPage = pagination.page
  const range = []
  
  if (totalPages <= 7) {
    // If 7 or fewer pages, show all
    for (let i = 1; i <= totalPages; i++) {
      range.push(i)
    }
  } else {
    // Always include first and last page
    range.push(1)
    
    if (currentPage > 3) {
      range.push('...')
    }
    
    // Add pages around current page
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    
    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    
    if (currentPage < totalPages - 2) {
      range.push('...')
    }
    
    range.push(totalPages)
  }
  
  return range
})

// Format a date in a human-readable format
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Load users when component mounts
onMounted(() => {
  loadUsers()
})
</script>