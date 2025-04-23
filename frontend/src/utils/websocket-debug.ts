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
 * Tests the WebSocket message handler with a sample message
 */
export function testMessageHandling(handler: Function) {
  // Get user ID from localStorage if available
  let userId = 1;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) userId = user.id;
    }
  } catch (e) {
    console.error('Error getting user from localStorage:', e);
  }
  
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
export function sendTestMessage() {
  // Get user ID from localStorage if available
  let userId = 1;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) userId = user.id;
    }
  } catch (e) {
    console.error('Error getting user from localStorage:', e);
  }
  
  // Create and send test message
  const testMessage = createTestProfileMessage(userId);
  console.log('[WebSocket Test] Sending test message:', testMessage);
  
  // Send the message
  webSocketService.send(testMessage);
  return testMessage;
}
