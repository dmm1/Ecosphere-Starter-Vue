<template>
  <nav class="bg-white dark:bg-gray-800 shadow-md">
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and primary navigation -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-xl font-bold text-primary-600 dark:text-primary-400">
              Ecosphere
            </router-link>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <!-- Main navigation links -->
            <router-link 
              to="/" 
              class="border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2"
              active-class="border-primary-500 text-gray-900 dark:text-white"
              exact
            >
              Dashboard
            </router-link>
            
            <!-- Admin-only links -->
            <router-link 
              v-if="isAdmin"
              to="/admin/users" 
              class="border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2"
              active-class="border-primary-500 text-gray-900 dark:text-white"
            >
              Users
            </router-link>
          </div>
        </div>
        
        <!-- User menu and dark mode toggle -->
        <div class="flex items-center">
          <!-- Dark mode toggle -->
          <button 
            @click="toggleDarkMode"
            class="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            aria-label="Toggle dark mode"
          >
            <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </button>
          
          <!-- Profile dropdown -->
          <div class="ml-4 relative flex-shrink-0">
            <div>
              <button 
                @click="toggleProfileMenu"
                class="bg-white dark:bg-gray-700 rounded-full flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" 
                id="user-menu" 
                aria-expanded="false" 
                aria-haspopup="true"
              >
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-800 dark:text-primary-200 uppercase font-bold">
                  {{ userInitials }}
                </div>
              </button>
            </div>
            
            <!-- Dropdown menu -->
            <div 
              v-show="profileMenuOpen"
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
            >
              <div class="py-1" role="none">
                <!-- User info -->
                <div class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
                  Signed in as <span class="font-semibold">{{ user?.email }}</span>
                </div>
                
                <!-- Profile -->
                <router-link 
                  to="/profile" 
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" 
                  role="menuitem"
                  @click="profileMenuOpen = false"
                >
                  Your Profile
                </router-link>
                
                <!-- Change Password -->
                <router-link 
                  to="/change-password" 
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" 
                  role="menuitem"
                  @click="profileMenuOpen = false"
                >
                  Change Password
                </router-link>
                
                <!-- Sign out -->
                <button 
                  @click="handleLogout" 
                  class="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" 
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile menu -->
    <div class="sm:hidden" id="mobile-menu">
      <div class="pt-2 pb-3 space-y-1">
        <router-link 
          to="/" 
          class="border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          active-class="bg-primary-50 dark:bg-primary-900 border-primary-500 text-primary-700 dark:text-primary-300"
          exact
        >
          Dashboard
        </router-link>
        
        <router-link 
          v-if="isAdmin"
          to="/admin/users" 
          class="border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          active-class="bg-primary-50 dark:bg-primary-900 border-primary-500 text-primary-700 dark:text-primary-300"
        >
          Users
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { useSettingsStore } from '../../store/settings'

// Setup stores
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const router = useRouter()

// Reactive state
const profileMenuOpen = ref(false)

// Computed properties
const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
const isDarkMode = computed(() => settingsStore.darkMode)
const userInitials = computed(() => {
  const email = user.value?.email || ''
  return email.substring(0, 1).toUpperCase()
})

// Methods
const toggleDarkMode = () => {
  settingsStore.toggleDarkMode();
}

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Click outside to close the dropdown
const closeDropdownOnClickOutside = (event) => {
  if (profileMenuOpen.value) {
    profileMenuOpen.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', closeDropdownOnClickOutside)
  settingsStore.initializeSettings()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdownOnClickOutside)
})
</script>