<template>
  <div class="user-management">
    <h1>User Management</h1>
    
    <div class="filters">
      <input type="text" v-model="searchQuery" placeholder="Search users..." @input="fetchUsers">
      <select v-model="activeFilter" @change="fetchUsers">
        <option value="">All Users</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>
    
    <table v-if="users.length > 0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.first_name }} {{ user.last_name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.is_active ? 'Active' : 'Inactive' }}</td>
          <td>
            <button @click="editUser(user)">Edit</button>
            <button @click="toggleUserStatus(user)">
              {{ user.is_active ? 'Deactivate' : 'Activate' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>No users found</div>
    
    <!-- Pagination controls -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">Next</button>
    </div>
    
    <!-- User edit modal -->
    <div v-if="editingUser" class="modal">
      <div class="modal-content">
        <h2>Edit User</h2>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>First Name</label>
            <input v-model="editingUser.first_name" type="text" />
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input v-model="editingUser.last_name" type="text" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="editingUser.email" type="email" />
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="editingUser.is_active" />
              Active
            </label>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="editingUser.is_staff" />
              Staff
            </label>
          </div>
          <div class="actions">
            <button type="button" @click="cancelEdit">Cancel</button>
            <button type="submit" :disabled="loading">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { webSocketService } from '../../services/websocket'
import { useAdminStore } from '../../stores/admin'
import { useToast } from '../../composables/useToast'

export default defineComponent({
  name: 'UserManagement',
  setup() {
    const adminStore = useAdminStore()
    const { showToast } = useToast()
    
    const users = ref<any[]>([])
    const editingUser = ref<any>(null)
    const loading = ref(false)
    const searchQuery = ref('')
    const activeFilter = ref('')
    const currentPage = ref(1)
    const totalPages = ref(1)
    
    const fetchUsers = async () => {
      try {
        loading.value = true
        const response = await adminStore.fetchUsers({
          page: currentPage.value,
          search: searchQuery.value,
          is_active: activeFilter.value || undefined
        })
        
        users.value = response.results || []
        totalPages.value = Math.ceil(response.count / 10) // Assuming page size of 10
      } catch (error) {
        console.error('Failed to fetch users:', error)
        showToast('Failed to load users', 'error')
      } finally {
        loading.value = false
      }
    }
    
    const changePage = (page: number) => {
      currentPage.value = page
      fetchUsers()
    }
    
    const editUser = (user: any) => {
      editingUser.value = { ...user }
    }
    
    const cancelEdit = () => {
      editingUser.value = null
    }
    
    const saveUser = async () => {
      if (!editingUser.value) return
      
      try {
        loading.value = true
        await adminStore.updateUser(editingUser.value)
        showToast('User updated successfully', 'success')
        cancelEdit()
        fetchUsers()
      } catch (error) {
        console.error('Failed to update user:', error)
        showToast('Failed to update user', 'error')
      } finally {
        loading.value = false
      }
    }
    
    const toggleUserStatus = async (user: any) => {
      try {
        loading.value = true
        const updatedData = { ...user, is_active: !user.is_active }
        await adminStore.updateUser(updatedData)
        showToast(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`, 'success')
      } catch (error) {
        console.error('Failed to update user status:', error)
        showToast('Failed to update user status', 'error')
      } finally {
        loading.value = false
      }
    }
    
    let unsubscribe: (() => void) | null = null
    
    const handleWebSocketMessage = (message: any) => {
      console.log('Admin received WebSocket message:', message)
      
      switch (message.action) {
        case 'user_updated':
          // Update user in the list
          users.value = users.value.map(user => 
            user.id === message.user_id ? { ...user, ...message.data } : user
          )
          break
          
        case 'user_deleted':
          // Remove deleted user
          users.value = users.value.filter(user => user.id !== message.user_id)
          break
      }
    }
    
    onMounted(() => {
      fetchUsers()
      
      // Connect to WebSocket
      webSocketService.connect()
      
      // Subscribe to WebSocket updates
      unsubscribe = webSocketService.subscribe(handleWebSocketMessage)
    })
    
    onUnmounted(() => {
      if (unsubscribe) unsubscribe()
    })
    
    return {
      users,
      loading,
      editingUser,
      searchQuery,
      activeFilter,
      currentPage,
      totalPages,
      fetchUsers,
      changePage,
      editUser,
      cancelEdit,
      saveUser,
      toggleUserStatus
    }
  }
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: var(--primary-color);
  color: white;
}

.pagination {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  border-radius: 5px;
  padding: 20px;
  width: 90%;
  max-width: 500px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
