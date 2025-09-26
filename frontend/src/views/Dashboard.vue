<template>
  <div>
    <h1 class="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
    
    <Card>
      <CardContent class="p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <svg class="w-16 h-16 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          
          <h2 class="mt-4 text-xl font-semibold text-card-foreground">Welcome to Ecosphere</h2>
          <p class="mt-2 text-muted-foreground text-center max-w-md">
            Your sustainable development platform is ready to use! This is a starter template 
            that you can customize for your specific needs.
          </p>
          
          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Profile Card -->
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Update your personal information and manage your account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button as-child>
                  <router-link to="/profile">
                    Edit Profile
                  </router-link>
                </Button>
              </CardContent>
            </Card>
            
            <!-- Admin Card (show only to admins) -->
            <Card v-if="isAdmin">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users, view statistics, and handle administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" as-child>
                  <router-link to="/admin/users">
                    Manage Users
                  </router-link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../store/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
</script>