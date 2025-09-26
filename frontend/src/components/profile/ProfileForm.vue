<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <form @submit.prevent="handleSubmit">
      <div class="space-y-6">
        <!-- Email field (disabled, just for display) -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          <div class="mt-1">
            <input
              id="email"
              type="email"
              :value="user?.email"
              disabled
              class="bg-gray-100 dark:bg-gray-700 cursor-not-allowed shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
        </div>
        
        <!-- First name -->
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <div class="mt-1">
            <input
              id="firstName"
              v-model="form.first_name"
              type="text"
              class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            />
          </div>
        </div>
        
        <!-- Last name -->
        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name
          </label>
          <div class="mt-1">
            <input
              id="lastName"
              v-model="form.last_name"
              type="text"
              class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            />
          </div>
        </div>
        
        <!-- Biography -->
        <div>
          <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Biography
          </label>
          <div class="mt-1">
            <textarea
              id="bio"
              v-model="form.bio"
              rows="3"
              class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              placeholder="Tell us about yourself"
            ></textarea>
          </div>
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>
        
        <!-- Submit button -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <span v-if="loading">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import api from '../../api'
import { useProfileUpdates } from '../../composables/useProfileUpdates'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['saved'])

// Form state
const form = reactive({
  first_name: '',
  last_name: '',
  bio: ''
})

const loading = ref(false)
const error = ref(null)

// Initialize form with user data when available
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.first_name = newUser.first_name || ''
    form.last_name = newUser.last_name || ''
    form.bio = newUser.bio || ''
  }
}, { immediate: true })

// Handle real-time profile updates
const {} = useProfileUpdates((updatedUser) => {
  if (updatedUser && updatedUser.id === props.user.id) {
    form.first_name = updatedUser.first_name || ''
    form.last_name = updatedUser.last_name || ''
    form.bio = updatedUser.bio || ''
  }
})

// Form submission
const handleSubmit = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.patch('/account/profile/', form)
    emit('saved', response.data)
  } catch (err) {
    console.error('Error saving profile:', err)
    error.value = err.response?.data?.message || 'Failed to save profile changes'
  } finally {
    loading.value = false
  }
}
</script>
