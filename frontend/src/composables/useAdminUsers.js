import { ref, onMounted, onUnmounted } from 'vue'
import api from '../api'

/**
 * Composable for admin user management with real-time updates
 */
export function useAdminUsers() {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Fetch all users from the API
  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/account/users/')
      users.value = response.data
      return users.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch users'
      console.error('Error fetching users:', err)
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Handle user updates from WebSocket
  const handleUserUpdate = (event) => {
    const { userId, userData } = event.detail
    
    // Find and update the user in the list
    const userIndex = users.value.findIndex(user => user.id === userId)
    if (userIndex !== -1) {
      const updatedUser = { ...users.value[userIndex], ...userData }
      users.value[userIndex] = updatedUser
      console.log('Admin: User updated via WebSocket:', userId)
    }
  }
  
  // Handle user deletion from WebSocket
  const handleUserDelete = (event) => {
    const { userId } = event.detail
    
    // Remove the user from the list
    users.value = users.value.filter(user => user.id !== userId)
    console.log('Admin: User deleted via WebSocket:', userId)
  }
  
  // Setup event listeners
  onMounted(() => {
    window.addEventListener('admin-user-updated', handleUserUpdate)
    window.addEventListener('admin-user-deleted', handleUserDelete)
  })
  
  onUnmounted(() => {
    window.removeEventListener('admin-user-updated', handleUserUpdate)
    window.removeEventListener('admin-user-deleted', handleUserDelete)
  })
  
  return {
    users,
    loading,
    error,
    fetchUsers,
    
    // CRUD operations for admin user management
    getUser: async (userId) => {
      try {
        const response = await api.get(`/account/users/${userId}/`)
        return response.data
      } catch (err) {
        console.error(`Error fetching user ${userId}:`, err)
        throw err
      }
    },
    
    updateUser: async (userId, userData) => {
      try {
        const response = await api.patch(`/account/users/${userId}/`, userData)
        // Update local cache
        const userIndex = users.value.findIndex(user => user.id === userId)
        if (userIndex !== -1) {
          users.value[userIndex] = response.data
        }
        return response.data
      } catch (err) {
        console.error(`Error updating user ${userId}:`, err)
        throw err
      }
    },
    
    deleteUser: async (userId) => {
      try {
        await api.delete(`/account/users/${userId}/`)
        // Update local cache
        users.value = users.value.filter(user => user.id !== userId)
        return true
      } catch (err) {
        console.error(`Error deleting user ${userId}:`, err)
        throw err
      }
    }
  }
}
