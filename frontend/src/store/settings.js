import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    darkMode: false,
    sidebarCollapsed: false,
    notifications: true,
  }),
  
  actions: {
    // Initialize settings from localStorage
    initializeSettings() {
      // Use Tailwind's recommended key
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark') {
        this.darkMode = true;
      } else if (storedTheme === 'light') {
        this.darkMode = false;
      } else {
        // Fallback to system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.darkMode = prefersDark;
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
      }
      this.applyDarkMode();

      // Load other settings
      const sidebarState = localStorage.getItem('sidebarCollapsed')
      if (sidebarState !== null) {
        this.sidebarCollapsed = sidebarState === 'true'
      }
      
      const notificationState = localStorage.getItem('notifications')
      if (notificationState !== null) {
        this.notifications = notificationState === 'true'
      }
      
      // Apply dark mode class to HTML element
      this.applyDarkMode()
    },
    
    // Toggle dark mode
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
      this.applyDarkMode();
    },
    
    // Apply dark mode class to HTML element
    applyDarkMode() {
      if (this.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    
    // Toggle sidebar collapse state
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString())
    },
    
    // Toggle notifications
    toggleNotifications() {
      this.notifications = !this.notifications
      localStorage.setItem('notifications', this.notifications.toString())
    }
  }
})