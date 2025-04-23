"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import django

# Set the Django settings module early
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Standard ASGI imports
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

# Import websocket routing configuration
from account.routing import websocket_urlpatterns
from account.middleware import WebSocketJWTAuthMiddleware

# Initialize Django ASGI application
django_asgi_app = get_asgi_application()

# Define application for ASGI server to use
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        WebSocketJWTAuthMiddleware(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})
