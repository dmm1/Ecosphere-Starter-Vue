<template>
  <div class="default-layout">
    <NavBar />
    
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
    
    <Footer />
  </div>
</template>

<script setup>
import NavBar from '../components/layout/NavBar.vue'
import Footer from '../components/layout/Footer.vue'
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
}
</style>
