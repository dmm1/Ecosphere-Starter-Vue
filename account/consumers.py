import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.conf import settings
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs

User = get_user_model()

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get the token from the query string
        query_string = self.scope.get('query_string', b'').decode('utf-8')
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        
        if token is None:
            await self.close(code=4001)
            return
            
        try:
            # Verify the token
            UntypedToken(token)
            
            # Get the user ID from the token
            decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_data.get('user_id')
            
            if not user_id:
                await self.close(code=4002)
                return
                
            # Validate the user exists
            user = await self.get_user(user_id)
            if user is None or not user.is_active:
                await self.close(code=4003)
                return
                
            # Store user in scope for later use
            self.scope['user'] = user
            self.user_id = user_id
            
            # Add user to the group for receiving notifications
            self.group_name = f"user_{user_id}"
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            # Add to the general notifications group
            await self.channel_layer.group_add(
                "user_updates",  # This is used in views.py
                self.channel_name
            )
            
            await self.accept()
            
            # Send a welcome message
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to WebSocket'
            }))
            
        except (InvalidToken, TokenError) as e:
            print(f"WebSocket auth error: {str(e)}")
            await self.close(code=4004)
            
    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            
        if hasattr(self, 'user_id'):
            await self.channel_layer.group_discard(
                "user_updates",
                self.channel_name
            )
    
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
            
    async def user_update(self, event):
        """
        Handle user update messages from the channel layer
        """
        message = event.get('message', {})
        
        # Forward the message to the WebSocket
        await self.send(text_data=json.dumps(message))