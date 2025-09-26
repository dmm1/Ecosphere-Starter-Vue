<template>
  <Card>
    <CardHeader>
      <CardTitle>Profile Information</CardTitle>
      <CardDescription>Update your personal information and manage your account settings</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Email field (disabled, just for display) -->
        <div class="space-y-2">
          <Label for="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            :value="user?.email"
            disabled
            class="bg-muted cursor-not-allowed"
          />
        </div>
        
        <!-- First name -->
        <div class="space-y-2">
          <Label for="firstName">First Name</Label>
          <Input
            id="firstName"
            v-model="form.first_name"
            type="text"
          />
        </div>
        
        <!-- Last name -->
        <div class="space-y-2">
          <Label for="lastName">Last Name</Label>
          <Input
            id="lastName"
            v-model="form.last_name"
            type="text"
          />
        </div>
        
        <!-- Biography -->
        <div class="space-y-2">
          <Label for="bio">Biography</Label>
          <textarea
            id="bio"
            v-model="form.bio"
            rows="3"
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Tell us about yourself"
          ></textarea>
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="text-destructive text-sm">
          {{ error }}
        </div>
        
        <!-- Submit button -->
        <div class="flex justify-end">
          <Button
            type="submit"
            :disabled="loading"
          >
            <span v-if="loading">Saving...</span>
            <span v-else>Save Changes</span>
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import api from '../../api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
