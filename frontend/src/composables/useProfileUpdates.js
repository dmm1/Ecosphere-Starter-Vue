import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../store/auth'

/**
 * Composable to react to real-time profile updates
 * @param {Function} callback Optional callback function to execute when profile is updated
 * @returns {Object} Helper methods
 */
export function useProfileUpdates(callback = null) {
  const authStore = useAuthStore()
  
  // Handler for profile update events
  const handleProfileUpdate = (event) => {
    // Only react if it's our own user
    if (authStore.user && event.detail.userId === authStore.user.id) {
      console.log('Profile update detected in component')
      
      if (callback && typeof callback === 'function') {
        callback(authStore.user)
      }
    }
  }
  
  // Setup and teardown
  onMounted(() => {
    window.addEventListener('user-profile-updated', handleProfileUpdate)
  })
  
  onUnmounted(() => {
    window.removeEventListener('user-profile-updated', handleProfileUpdate)
  })
  
  return {
    // Manually trigger a profile refresh
    refreshProfile: () => authStore.fetchCurrentUser(),
    
    // Current user data
    user: authStore.user
  }
}
