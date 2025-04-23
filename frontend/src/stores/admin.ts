import { defineStore } from 'pinia';
import api from '../api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

interface UserFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: string;
  is_staff?: string;
}

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [] as User[],
    totalUsers: 0,
    loading: false,
    error: null as string | null,
  }),
  
  actions: {
    async fetchUsers(filters: UserFilters = {}): Promise<PaginatedResponse> {
      this.loading = true;
      this.error = null;
      
      try {
        // Convert filters to URL parameters
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
        
        const response = await api.get(`/account/users/?${params.toString()}`);
        this.users = response.data.results;
        this.totalUsers = response.data.count;
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch users';
        console.error('Error fetching users:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateUser(userData: Partial<User> & { id: number }): Promise<User> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.patch(`/account/users/${userData.id}/`, userData);
        
        // Update local state
        this.users = this.users.map(user => 
          user.id === userData.id ? { ...user, ...response.data } : user
        );
        
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to update user';
        console.error('Error updating user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteUser(userId: number): Promise<void> {
      this.loading = true;
      this.error = null;
      
      try {
        await api.delete(`/account/users/${userId}/`);
        
        // Remove from local state
        this.users = this.users.filter(user => user.id !== userId);
        this.totalUsers--;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to delete user';
        console.error('Error deleting user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Create new user
    async createUser(userData: any) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/account/users/', userData)
        this.loading = false
        return response.data
      } catch (error: any) {
        this.loading = false
        this.error = error.response?.data?.message || 'Error creating user'
        console.error('Error creating user:', error)
        throw error
      }
    },
  }
});
