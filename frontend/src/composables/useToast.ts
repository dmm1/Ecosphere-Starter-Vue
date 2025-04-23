import { ref } from 'vue';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  // Add a unique key to prevent duplicate toasts
  key?: string;
}

// Create a central toast state
const toasts = ref<Toast[]>([]);
let nextId = 0;

// Keep track of recent toast keys to prevent duplicates
const recentToastKeys = new Set<string>();
const DUPLICATE_PREVENTION_TIME = 3000; // 3 seconds

export function useToast() {
  // Add a new toast message with deduplication
  const showToast = (
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info', 
    duration = 3000,
    options?: { uniqueKey?: string }
  ) => {
    const id = nextId++;
    
    // Generate a unique key for this toast if not provided
    const uniqueKey = options?.uniqueKey || `${message}-${type}`;
    
    // Check for duplicates
    if (recentToastKeys.has(uniqueKey)) {
      console.log(`Preventing duplicate toast: ${uniqueKey}`);
      return;
    }
    
    // Add to recent toasts to prevent duplicates
    recentToastKeys.add(uniqueKey);
    
    // Remove from recent toasts after the prevention time
    setTimeout(() => {
      recentToastKeys.delete(uniqueKey);
    }, DUPLICATE_PREVENTION_TIME);
    
    // Add the toast to our list
    toasts.value.push({
      id,
      message,
      type,
      duration,
      key: uniqueKey
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
