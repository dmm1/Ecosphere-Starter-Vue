import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time user notifications."""
    
    async def connect(self):
        """Handle WebSocket connection."""
        self.user = self.scope["user"]
        
        if self.user.is_anonymous:
            # Reject the connection if user is not authenticated
            await self.close()
            return
        
        # Set up user-specific notification group
        self.notification_group_name = f"user_{self.user.id}_notifications"
        
        # Add this channel to the user's notification group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send welcome message
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to notification service'
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'notification_group_name'):
            # Remove this channel from the user's notification group
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle messages received from WebSocket."""
        try:
            data = json.loads(text_data)
            
            # Echo back the received message (for debugging)
            await self.send(text_data=json.dumps({
                'type': 'echo',
                'message': f"Received: {data.get('message', '')}"
            }))
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    async def notification_message(self, event):
        """Send notification message to WebSocket."""
        # This method is called when something is sent to the notification group
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': event['message']
        }))
        
    @database_sync_to_async
    def get_user(self, user_id):
        """Get user by ID (async-compatible database query)."""
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None