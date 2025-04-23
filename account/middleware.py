from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from urllib.parse import parse_qs
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        access_token = AccessToken(token_key)
        user_id = access_token['user_id']
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist, KeyError):
        return AnonymousUser()


class WebSocketJWTAuthMiddleware(BaseMiddleware):
    """Middleware that authenticates WebSocket connections using JWT tokens."""

    async def __call__(self, scope, receive, send):
        # Get the query string from the scope
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)

        # Get the token from query parameters
        token = query_params.get('token', [None])[0]

        if token:
            # Get the user from the token
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()

        # Call the underlying consumer with the updated scope
        return await super().__call__(scope, receive, send)