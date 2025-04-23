<template>
  <div class="admin-layout">
    <div class="admin-header bg-primary-600 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold">Admin Dashboard</h1>
        <nav>
          <router-link 
            to="/admin/users" 
            class="text-white hover:text-primary-200 px-3 py-2"
            active-class="bg-primary-700 rounded"
          >
            Users
          </router-link>
        </nav>
      </div>
    </div>
    
    <div class="container mx-auto p-4">
      <router-view />
    </div>
  </div>
</template>

<script setup>
// The AdminLayout simply renders its child routes in <router-view>
// and provides common admin navigation elements
</script>

<style scoped>
.admin-layout {
  min-height: calc(100vh - 4rem); /* Adjust based on your navbar height */
}
</style>
