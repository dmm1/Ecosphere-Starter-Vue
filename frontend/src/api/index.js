import axios from 'axios'
import { useAuthStore } from '../store/auth'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Function to refresh token
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post('/api/account/token/refresh/', {
      refresh: refreshToken
    })
    return response.data.access
  } catch (error) {
    throw error
  }
}

// Interceptor to handle token refreshing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If error is 401 and request hasn't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }
        
        // Try to refresh the token
        const newAccessToken = await refreshAccessToken(refreshToken)
        
        // Update localStorage and authorization header
        localStorage.setItem('accessToken', newAccessToken)
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        
        // Update default headers for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
        
        // Update auth store
        const authStore = useAuthStore()
        authStore.accessToken = newAccessToken
        
        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, clear tokens and reject
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        
        // Clear auth store
        const authStore = useAuthStore()
        authStore.clearAuth()
        
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Function to set auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// User API functions
export const userApi = {
  // Get list of users (admin only)
  getUsers: async (page = 1, filters = {}) => {
    const params = { page, ...filters }
    return api.get('/account/users/', { params })
  },

  // Get single user by ID (admin only)
  getUser: async (userId) => {
    return api.get(`/account/users/${userId}/`)
  },

  // Update user (admin only)
  updateUser: async (userId, userData) => {
    return api.patch(`/account/users/${userId}/`, userData)
  },
  
  // Delete user (admin only)
  deleteUser: async (userId) => {
    return api.delete(`/account/users/${userId}/`)
  },
  
  // Reset user password (admin only)
  resetUserPassword: async (userId) => {
    return api.post(`/account/users/${userId}/reset-password/`)
  },

  // Get current user profile
  getProfile: async () => {
    return api.get('/account/profile/')
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return api.patch('/account/profile/', profileData)
  }
}

// WebSocket notification connection
export const connectWebSocket = (authToken, onMessage) => {
  const socket = new WebSocket(`ws://${window.location.host}/ws/notifications/?token=${authToken}`)
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    onMessage(data)
  }
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
  
  return socket
}

export default api