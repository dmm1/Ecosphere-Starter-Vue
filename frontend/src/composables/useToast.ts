import { ref } from 'vue';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

// Create a central toast state
const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useToast() {
  // Add a new toast message
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
    const id = nextId++;
    
    // Add the toast to our list
    toasts.value.push({
      id,
      message,
      type,
      duration
    });
    
    // Automatically remove the toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };
  
  // Remove a toast by ID
  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };
  
  // Clear all toasts
  const clearToasts = () => {
    toasts.value = [];
  };
  
  return {
    toasts,
    showToast,
    removeToast,
    clearToasts
  };
}
