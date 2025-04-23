<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col-reverse space-y-reverse space-y-2">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="p-4 rounded-lg shadow-lg max-w-md transition-all transform 
             animate-fade-in-up w-full flex items-center justify-between"
      :class="{
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': toast.type === 'success',
        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': toast.type === 'error',
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': toast.type === 'info',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': toast.type === 'warning',
      }"
    >
      <div>
        <div class="font-semibold text-sm">
          {{ getToastTitle(toast.type) }}
        </div>
        <div class="text-sm mt-1">{{ toast.message }}</div>
      </div>
      <button 
        @click="removeToast(toast.id)"
        class="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast';

const { toasts, removeToast } = useToast();

const getToastTitle = (type) => {
  switch (type) {
    case 'success': return 'Success';
    case 'error': return 'Error';
    case 'warning': return 'Warning';
    case 'info': return 'WebSocket Event';
    default: return 'Notification';
  }
};
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
