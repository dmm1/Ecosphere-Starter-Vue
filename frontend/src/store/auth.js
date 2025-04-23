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
    connectionErrors: 0,
    wsEnabled: true, // Can be disabled if connection keeps failing
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.is_staff || false,
    userProfile: (state) => state.user?.profile || {},
  },
  
  actions: {
    // Initialize WebSocket connection
    initializeWebSocket() {
      // Don't attempt if WebSockets have been disabled
      if (!this.wsEnabled) {
        console.log('WebSocket connections are currently disabled')
        return
      }

      if (this.socket) {
        this.socket.close()
      }

      if (!this.accessToken) {
        console.warn('No access token available for WebSocket connection')
        return
      }

      try {
        // For development
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        
        // Get host information with fallbacks
        // Try using direct localhost for development if IP connection fails
        let host = import.meta.env.VITE_WS_HOST || window.location.hostname
        
        // Check if we're on a failed reconnection attempt with an IP address
        // and switch to localhost as a fallback
        if (this.connectionErrors > 0 && host.match(/^\d+\.\d+\.\d+\.\d+$/)) {
          console.log('Switching to localhost for WebSocket connection after failed IP attempt')
          host = 'localhost'
        }
        
        const port = import.meta.env.VITE_WS_PORT || '8000'
        const wsHost = import.meta.env.DEV ? `${host}:${port}` : window.location.host
        
        // Build the WebSocket URL
        const wsUrl = `${wsProtocol}//${wsHost}/ws/notifications/?token=${this.accessToken}`

        // Log connection attempt (hiding the actual token)
        const logUrl = wsUrl.replace(this.accessToken, 'TOKEN_HIDDEN')
        console.log('Connecting to WebSocket:', logUrl)
        
        this.socket = new WebSocket(wsUrl)
        
        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket connection timeout - closing socket')
            this.socket.close()
          }
        }, 10000) // 10 second timeout

        this.socket.onopen = () => {
          clearTimeout(connectionTimeout)
          this.isConnected = true
          this.connectionErrors = 0 // Reset error counter on success
          console.log('WebSocket connected successfully')
        }

        this.socket.onclose = (event) => {
          clearTimeout(connectionTimeout)
          this.isConnected = false
          console.log('WebSocket disconnected with code:', event.code, 'Reason:', event.reason || 'Unknown')
          
          // Handle code 1006 (abnormal closure) specifically
          if (event.code === 1006) {
            console.warn('WebSocket closed abnormally (code 1006). This might indicate network issues or server unavailability.')
          }
          
          // Don't reconnect if closed due to authentication issues or if we've had too many errors
          if (![1000, 1001, 4001, 4003, 4004].includes(event.code) && this.connectionErrors < 5) {
            // Exponential backoff with random jitter
            const delay = Math.min(1000 * (Math.pow(2, this.connectionErrors) + Math.random()), 30000)
            this.connectionErrors++
            console.log(`Attempting to reconnect in ${Math.round(delay/1000)} seconds (attempt ${this.connectionErrors}/5)`)
            setTimeout(() => this.initializeWebSocket(), delay)
          } else {
            if (this.connectionErrors >= 5) {
              console.warn('Maximum WebSocket reconnection attempts reached. Disabling WebSockets.')
              this.wsEnabled = false
              // Store a reminder in localStorage to check server config
              localStorage.setItem('ws_disabled_at', new Date().toISOString())
            } else {
              console.warn('WebSocket closed normally or due to authentication issue, not reconnecting')
            }
          }
        }

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleWebSocketMessage(data)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error, 'Raw data:', event.data)
          }
        }

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error)
          
          // Try to provide more diagnostic information
          console.log('WebSocket URL:', logUrl)
          console.log('WebSocket readyState:', this.socket?.readyState)
          console.log('Check if the server is running and .env configuration is correct')
          
          // Additional diagnostics
          console.log('Network status:', navigator.onLine ? 'Online' : 'Offline')
          if (host.match(/^\d+\.\d+\.\d+\.\d+$/)) {
            console.log('Using IP address for connection. If this continues to fail, try using localhost instead.')
          }
        }
      } catch (e) {
        console.error('Error establishing WebSocket connection:', e)
        this.connectionErrors++
        
        if (this.connectionErrors < 3) {
          setTimeout(() => this.initializeWebSocket(), 5000)
        } else {
          console.warn('Failed to establish WebSocket connection after multiple attempts. Please check server configuration.')
        }
      }
    },

    // Handle incoming WebSocket messages
    handleWebSocketMessage(data) {
      // Check for Django Channels message format with type field
      if (data.type) {
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
            console.log('Unknown type message:', data)
        }
        return
      }
      
      // Handle action-based message format (used by frontend services)
      if (data.action) {
        switch (data.action) {
          case 'profile_updated':
            console.log('Profile update received for user:', data.user_id)
            // If it's our user, update our profile data
            if (this.user && this.user.id === data.user_id) {
              console.log('Updating current user profile')
              
              // Create a completely new user object to ensure reactivity
              const updatedUser = { ...this.user }
              
              // Update profile data directly in the user object
              if (data.data) {
                Object.keys(data.data).forEach(key => {
                  updatedUser[key] = data.data[key]
                })
                
                // If there's a profile object, ensure it's also updated correctly
                if (updatedUser.profile && data.data.profile) {
                  updatedUser.profile = { ...updatedUser.profile, ...data.data.profile }
                }
              }
              
              // Replace the entire user object to trigger reactivity
              this.user = updatedUser
              
              // Emit an event for components to react to profile changes
              window.dispatchEvent(new CustomEvent('user-profile-updated', { 
                detail: { userId: data.user_id } 
              }))
            } else {
              // If it's not our user, emit an event for admin user management
              window.dispatchEvent(new CustomEvent('admin-user-updated', { 
                detail: { userId: data.user_id, userData: data.data } 
              }))
            }
            break;
          case 'user_updated':
            console.log('User update received:', data.user_id)
            // Refresh user data if it's our user
            if (this.user && this.user.id === data.user_id) {
              this.fetchCurrentUser()
              
              // Emit profile update event
              window.dispatchEvent(new CustomEvent('user-profile-updated', { 
                detail: { userId: data.user_id } 
              }))
            } else {
              // Emit admin user update event
              window.dispatchEvent(new CustomEvent('admin-user-updated', { 
                detail: { userId: data.user_id, action: 'updated' } 
              }))
            }
            break;
          case 'user_deleted':
            console.log('User deletion notification received:', data.user_id)
            // If it's our user, log out (account deleted)
            if (this.user && this.user.id === data.user_id) {
              console.warn('Your account has been deleted')
              this.clearAuth()
            } else {
              // Emit admin user delete event
              window.dispatchEvent(new CustomEvent('admin-user-deleted', { 
                detail: { userId: data.user_id } 
              }))
            }
            break;
          default:
            console.log('Unknown action message:', data.action, data)
        }
        return
      }
      
      // Fallback for unrecognized message formats
      console.log('Unrecognized message format:', data)
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
    },

    // Reset WebSocket connection
    resetWebSocketConnection() {
      this.connectionErrors = 0
      this.wsEnabled = true
      localStorage.removeItem('ws_disabled_at')
      if (this.socket) {
        this.socket.close()
        this.socket = null
      }
      this.initializeWebSocket()
    },
    
    // Check WebSocket availability and try to initialize if needed
    checkWebSocketStatus() {
      // If WebSockets are disabled but it's been more than a day, try again
      const disabledAt = localStorage.getItem('ws_disabled_at')
      if (!this.wsEnabled && disabledAt) {
        const disabledDate = new Date(disabledAt)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        
        if (disabledDate < oneDayAgo) {
          console.log('Re-enabling WebSockets after cooldown period')
          this.resetWebSocketConnection()
        }
      }
      
      // If authenticated but not connected, try to connect
      if (this.isAuthenticated && !this.isConnected && this.wsEnabled && !this.socket) {
        this.initializeWebSocket()
      }
      
      return {
        enabled: this.wsEnabled,
        connected: this.isConnected,
        errors: this.connectionErrors
      }
    },
  }
})