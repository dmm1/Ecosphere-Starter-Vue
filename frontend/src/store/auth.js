import { defineStore } from 'pinia'
import api, { setAuthToken } from '../api'
import { webSocketService } from '../services/websocket' // Ensure service is imported

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
    socket: null,
    isConnected: false,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.is_staff || false,
    userProfile: (state) => state.user?.profile || {},
  },
  
  actions: {
    // Initialize WebSocket connection
    initializeWebSocket() {
      if (this.socket) {
        this.socket.close()
      }

      if (!this.accessToken) {
        console.warn('No access token available for WebSocket connection')
        return
      }

      // For development
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsHost = import.meta.env.DEV ? window.location.hostname + ':8000' : window.location.host
      const wsUrl = `${wsProtocol}//${wsHost}/ws/notifications/?token=${this.accessToken}`

      console.log('Connecting to WebSocket:', wsUrl)
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        this.isConnected = true
        console.log('WebSocket connected')
      }

      this.socket.onclose = (event) => {
        this.isConnected = false
        console.log('WebSocket disconnected with code:', event.code)
        
        // Don't reconnect if closed due to authentication issues
        if (event.code !== 4001) {
          // Try to reconnect after 5 seconds
          setTimeout(() => this.initializeWebSocket(), 5000)
        }
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleWebSocketMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    },

    // Handle incoming WebSocket messages
    handleWebSocketMessage(data) {
      switch (data.type) {
        case 'notification':
          // Update user data when receiving a notification
          this.fetchCurrentUser()
          break
        case 'connection_established':
          console.log('WebSocket connection established:', data.message)
          break
        case 'error':
          console.error('WebSocket error:', data.message)
          break
        default:
          console.log('Unknown message type:', data)
      }
    },

    // Initialize auth from localStorage
    async initializeAuth() {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (accessToken && refreshToken) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        setAuthToken(accessToken)
        
        try {
          await this.fetchCurrentUser()
          // Initialize WebSocket connection after successful auth
          this.initializeWebSocket()
        } catch (error) {
          // If fetching user fails, clear the tokens
          this.clearAuth()
        }
      }
    },
    
    // Clear authentication state
    clearAuth() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setAuthToken(null)
      // Close WebSocket connection on logout
      if (this.socket) {
        this.socket.close()
        this.socket = null
      }
    },
    
    // Login user
    async login(email, password) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post('/account/login/', { email, password })
        this.accessToken = response.data.access
        this.refreshToken = response.data.refresh
        this.user = response.data.user
        
        localStorage.setItem('accessToken', this.accessToken)
        localStorage.setItem('refreshToken', this.refreshToken)
        setAuthToken(this.accessToken)
        
        // Initialize WebSocket connection after login
        this.initializeWebSocket()
        
        this.loading = false
        return true
      } catch (error) {
        this.loading = false
        this.error = error.response?.data?.detail || 'Login failed'
        return false
      }
    },
    
    // Register new user
    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post('/account/register/', userData)
        this.loading = false
        return true
      } catch (error) {
        this.loading = false
        this.error = error.response?.data || 'Registration failed'
        return false
      }
    },
    
    // Logout user
    async logout() {
      this.loading = true
      
      try {
        if (this.refreshToken) {
          await api.post('/account/logout/', { refresh: this.refreshToken })
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.clearAuth()
        this.loading = false
      }
    },
    
    // Update tokens
    updateTokens(accessToken, refreshToken = null) {
      this.accessToken = accessToken
      localStorage.setItem('accessToken', accessToken)
      setAuthToken(accessToken)
      
      if (refreshToken) {
        this.refreshToken = refreshToken
        localStorage.setItem('refreshToken', refreshToken)
      }
    },
    
    // Fetch current user details
    async fetchCurrentUser() {
      if (!this.accessToken) return null
      
      try {
        const response = await api.get('/account/profile/')
        this.user = response.data
        return this.user
      } catch (error) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized')
        }
        console.error('Failed to fetch user details:', error)
        return null
      }
    },
    
    // Change password
    async changePassword(currentPassword, newPassword) {
      this.loading = true
      this.error = null
      
      try {
        await api.post('/account/change-password/', {
          current_password: currentPassword,
          new_password: newPassword
        })
        this.loading = false
        return true
      } catch (error) {
        this.loading = false
        this.error = error.response?.data || 'Password change failed'
        return false
      }
    }
  }
})