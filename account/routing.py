from django.urls import path
from . import consumers

# WebSocket URL patterns
websocket_urlpatterns = [
    # Will be implemented once we create the consumer
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
]