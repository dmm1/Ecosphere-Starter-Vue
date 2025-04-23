/**
 * WebSocket debugging utilities
 */
import { webSocketService } from '../services/websocket';

/**
 * Creates a sample profile update message
 */
export function createTestProfileMessage(userId: number) {
  return {
    action: 'profile_updated',
    user_id: userId,
    data: {
      id: userId,
      first_name: 'Test',
      last_name: 'User',
      bio: `Updated via WebSocket at ${new Date().toLocaleTimeString()}`
    }
  };
}

/**
 * Check if WebSocket is connected before testing
 */
export function checkWebSocketConnection(): boolean {
  const isConnected = webSocketService.isConnected;
  console.log('[WebSocket Debug] Connection status check:', isConnected ? 'Connected' : 'Disconnected');
  return isConnected;
}

/**
 * Tests the WebSocket message handler with a sample message
 */
export function testMessageHandling(handler: Function) {
  // Get user ID from localStorage if available
  const userId = getUserIdFromStorage();
  
  // Create test message
  const testMessage = createTestProfileMessage(userId);
  console.log('[WebSocket Test] Created test message:', testMessage);
  
  // Test the handler
  try {
    handler(testMessage);
    console.log('[WebSocket Test] Handler executed successfully');
    return true;
  } catch (e) {
    console.error('[WebSocket Test] Handler error:', e);
    return false;
  }
}

/**
 * Sends a test WebSocket message
 */
export function sendTestMessage(): boolean {
  // First check if the WebSocket is connected
  if (!checkWebSocketConnection()) {
    console.error('[WebSocket Test] Cannot send test message: WebSocket not connected');
    return false;
  }
  
  // Get user ID from localStorage if available
  const userId = getUserIdFromStorage();
  
  // Create test message
  const testMessage = createTestProfileMessage(userId);
  console.log('[WebSocket Test] Sending test message:', testMessage);
  
  // Send the message
  return webSocketService.send(testMessage);
}

/**
 * Complete WebSocket test function that runs all checks
 * and provides detailed feedback
 */
export function runWebSocketTest(): {
  connected: boolean;
  sendSuccess?: boolean;
  error?: string;
} {
  const result = {
    connected: false,
    sendSuccess: undefined as boolean | undefined,
    error: undefined as string | undefined
  };
  
  try {
    // Step 1: Check connection
    result.connected = webSocketService.isConnected;
    console.log('[WebSocket Test] Connection check:', result.connected ? 'Connected' : 'Disconnected');
    
    if (!result.connected) {
      result.error = 'WebSocket is not connected';
      return result;
    }
    
    // Step 2: Send test message
    const userId = getUserIdFromStorage();
    const testMessage = createTestProfileMessage(userId);
    result.sendSuccess = webSocketService.send(testMessage);
    
    if (!result.sendSuccess) {
      result.error = 'Failed to send test message';
    } else {
      console.log('[WebSocket Test] Test message sent successfully');
    }
    
    return result;
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
    console.error('[WebSocket Test] Error during test:', result.error);
    return result;
  }
}

/**
 * Helper to get the user ID from storage
 */
function getUserIdFromStorage(): number {
  try {
    // Try to get user ID from auth store in localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) return user.id;
    }
    
    // Fallback: Check if there's an auth token and it contains a user ID
    const token = localStorage.getItem('access_token');
    if (token) {
      // Try to extract user ID from JWT if applicable
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.user_id) return payload.user_id;
        }
      } catch (e) {
        console.warn('Could not extract user ID from token:', e);
      }
    }
  } catch (e) {
    console.warn('Error getting user ID from storage:', e);
  }
  
  // Default
  return 1;
}
