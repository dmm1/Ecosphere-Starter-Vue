import { ref } from 'vue';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  timeout: number;
}

// Shared state across instances
const toasts = ref<Toast[]>([]);
let nextId = 1;

export function useToast() {
  const showToast = (message: string, type: ToastType = 'info', timeout = 3000) => {
    const id = nextId++;
    const toast: Toast = {
      id,
      message,
      type,
      timeout
    };
    
    toasts.value.push(toast);
    
    // Auto remove
    setTimeout(() => {
      removeToast(id);
    }, timeout);
    
    return id;
  };
  
  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };
  
  return {
    toasts,
    showToast,
    removeToast
  };
}
