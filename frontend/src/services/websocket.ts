interface WebSocketMessage {
  action?: 'profile_updated' | 'user_updated' | 'user_deleted';
  user_id?: number;
  data?: any;
  type?: string; // Add support for Django Channels message format
  message?: any; // Django Channels often wraps content in a message field
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private subscribers: ((data: any) => void)[] = [];
  private isConnecting: boolean = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  // Add getter to check if WebSocket is properly connected
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return; // Already connected or connecting
    }

    this.isConnecting = true;
    
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Get the JWT token from localStorage
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('WebSocket connection failed: No authentication token available');
      this.isConnecting = false;
      return;
    }

    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const path = '/ws/notifications/';
    const wsUrl = `${wsScheme}://${host}${path}?token=${token}`;
    
    console.log('Connecting to WebSocket at:', wsUrl);
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        console.log('WebSocket connected and ready to send messages');
        
        // Send authentication message on connection
        try {
          this.sendAuthentication(token);
        } catch (e) {
          console.error('Failed to send authentication message:', e);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          // Parse the raw message data
          const rawData = event.data;
          console.log('WebSocket raw received:', rawData);
          
          let data;
          try {
            // Parse JSON data
            data = JSON.parse(rawData);
          } catch (e) {
            // If not JSON, use as-is
            data = rawData;
            console.log('WebSocket received non-JSON message:', rawData);
          }
          
          console.log('WebSocket processed data:', data);

          // Handle Django Channels standard message format
          // It often sends {type: "...", message: {...actual data...}}
          if (data.type === 'connection_established') {
            console.log('WebSocket connection established:', data);
            return;
          }
          
          // Check for different message formats used by Django Channels
          // Format 1: {type: "message_type", message: {...}}
          if (data.type && data.message) {
            console.log('Processing Django format message:', data.type);
            // Send the actual message content to subscribers
            this.subscribers.forEach(callback => callback(data.message));
            return;
          }
          
          // Format 2: {action: "action_name", user_id: id, data: {...}}
          if (data.action) {
            console.log('Processing action message:', data.action);
            this.subscribers.forEach(callback => callback(data));
            return;
          }

          // If unknown format, still try to process
          console.warn('Unknown WebSocket message format, passing as-is:', data);
          this.subscribers.forEach(callback => callback(data));
        } catch (e) {
          console.error('Error processing WebSocket message:', e);
          console.error('Original message:', event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = (event) => {
        this.isConnecting = false;
        console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect in ${delay / 1000} seconds (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.reconnectTimeout = setTimeout(() => this.connect(), delay);
        } else {
          console.error('Maximum WebSocket reconnection attempts reached');
        }
      };
    } catch (error) {
      this.isConnecting = false;
      console.error('WebSocket connection error:', error);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect in ${delay / 1000} seconds (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.reconnectTimeout = setTimeout(() => this.connect(), delay);
      }
    }
  }

  // Separate method for sending authentication
  private sendAuthentication(token: string): void {
    if (this.isConnected) {
      console.log('Sending authentication message');
      this.ws!.send(JSON.stringify({
        type: 'authenticate',
        token: token
      }));
    } else {
      console.warn('Cannot authenticate: WebSocket not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
  
  // Add a debug method to help diagnose message handling
  debug(message: any): string {
    // Helper to determine and describe the message format
    try {
      // Check if it's a string that needs parsing
      if (typeof message === 'string') {
        try {
          const parsed = JSON.parse(message);
          return `String JSON message with keys: ${Object.keys(parsed).join(', ')}`;
        } catch (e) {
          return `Non-JSON string message: ${message.substring(0, 50)}...`;
        }
      }
      
      // Object message format analysis
      if (message && typeof message === 'object') {
        const keys = Object.keys(message);
        const format: string[] = []; // Explicitly type the array as string[]
        
        // Check for common patterns
        if (message.action) format.push(`action: "${message.action}"`);
        if (message.type) format.push(`type: "${message.type}"`);
        if (message.user_id) format.push(`user_id: ${message.user_id}`);
        if (message.data) format.push(`data: ${typeof message.data === 'object' ? '[Object]' : message.data}`);
        
        return `Object message - ${format.join(', ')} - keys: ${keys.join(', ')}`;
      }
      
      return `Unknown format: ${typeof message}`;
    } catch (e) {
      return `Error analyzing message: ${e}`;
    }
  }

  subscribe(callback: (data: any) => void) {
    // Wrap callback with debugging information
    const wrappedCallback = (data: any) => {
      // Log more detailed message debug info
      console.log(`[WebSocket] Processing message: ${this.debug(data)}`);
      
      // Call original callback
      callback(data);
    };
    
    this.subscribers.push(wrappedCallback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== wrappedCallback);
    };
  }

  // Improved send method with better error handling and logging
  send(message: any): boolean {
    // Detailed connection state check
    if (!this.ws) {
      console.error('Cannot send message: WebSocket instance does not exist');
      return false;
    }
    
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.error(`Cannot send message: WebSocket not in OPEN state. Current state: ${this.getReadyStateAsString()}`);
      return false;
    }

    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      console.log('Sending WebSocket message:', messageStr);
      this.ws.send(messageStr);
      return true;
    } catch (e) {
      console.error('Error sending WebSocket message:', e);
      return false;
    }
  }

  // Helper method to convert readyState to a readable string
  private getReadyStateAsString(): string {
    if (!this.ws) return 'UNDEFINED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

export const webSocketService = new WebSocketService();