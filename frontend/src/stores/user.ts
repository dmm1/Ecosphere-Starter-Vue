import { defineStore } from 'pinia';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  profile?: any;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
  }),
  
  actions: {
    setUser(userData: Partial<User>) {
      if (!this.user && userData) {
        this.user = userData as User;
      } else if (this.user) {
        this.user = { ...this.user, ...userData };
      }
      this.isAuthenticated = !!this.user;
    },
    
    async fetchCurrentUser() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('/api/account/profile/');
        this.setUser(response.data);
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch user data';
        console.error('Error fetching user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateProfile(userData: Partial<User>) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.patch('/api/account/profile/', userData);
        this.setUser(response.data);
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to update profile';
        console.error('Error updating profile:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    logout() {
      this.user = null;
      this.isAuthenticated = false;
    }
  }
});
