<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
    
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div class="p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <svg class="w-16 h-16 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          
          <h2 class="mt-4 text-xl font-semibold text-gray-800 dark:text-white">Welcome to Ecosphere</h2>
          <p class="mt-2 text-gray-600 dark:text-gray-400 text-center max-w-md">
            Your sustainable development platform is ready to use! This is a starter template 
            that you can customize for your specific needs.
          </p>
          
          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Profile Card -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Your Profile
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Update your personal information and manage your account settings
              </p>
              <router-link 
                to="/profile" 
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Edit Profile
              </router-link>
            </div>
            
            <!-- Admin Card (show only to admins) -->
            <div v-if="isAdmin" class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                User Management
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Manage users, view statistics, and handle administrative tasks
              </p>
              <router-link 
                to="/admin/users" 
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Users
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../store/auth'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
</script>