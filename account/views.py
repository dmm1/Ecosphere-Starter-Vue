from django.contrib.auth import get_user_model
from django.shortcuts import render
from django.db import models
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.pagination import PageNumberPagination
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Profile
from .serializers import (
    UserSerializer, RegisterSerializer, ChangePasswordSerializer, ProfileSerializer
)

User = get_user_model()


class LoginView(TokenObtainPairView):
    """Custom login view that returns user data along with tokens."""
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get user based on credentials
            user = User.objects.get(email=request.data.get('email'))
            # Add user data to response
            user_data = UserSerializer(user).data
            response.data['user'] = user_data
            
        return response


class RegisterView(generics.CreateAPIView):
    """API view for user registration."""
    
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """API view for user logout by blacklisting the refresh token."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(generics.GenericAPIView):
    """API view for changing user password."""
    
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """API view for retrieving and updating the current user's profile."""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        # Ensure profile exists
        if not hasattr(user, 'profile'):
            Profile.objects.create(user=user)
        return user

    def perform_update(self, serializer):
        user = serializer.save()
        # Notify connected clients about the profile update
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "user_updates",
            {
                "type": "user.update",
                "message": {
                    "action": "profile_updated",
                    "user_id": user.id,
                    "data": UserSerializer(user).data
                }
            }
        )


class LockedView(APIView):
    """View for handling locked accounts via django-axes."""
    
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({
            "detail": "Your account has been locked due to too many failed login attempts. Please try again later."
        }, status=status.HTTP_403_FORBIDDEN)


# Administrative views
class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination class that provides configurable pagination."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserListView(generics.ListAPIView):
    """API view for listing all users (admin only)."""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = User.objects.all()
        
        # Apply filters
        search = self.request.query_params.get('search', None)
        is_active = self.request.query_params.get('is_active', None)
        is_staff = self.request.query_params.get('is_staff', None)
        
        if search:
            queryset = queryset.filter(
                models.Q(email__icontains=search) |
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search)
            )
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        if is_staff is not None:
            queryset = queryset.filter(is_staff=is_staff.lower() == 'true')
            
        return queryset.order_by('-date_joined')


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API view for getting, updating, or deleting any user (admin only)."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_update(self, serializer):
        user = serializer.save()
        # Notify connected clients about the user update
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "user_updates",
            {
                "type": "user.update",
                "message": {
                    "action": "user_updated",
                    "user_id": user.id,
                    "data": UserSerializer(user).data
                }
            }
        )

    def perform_destroy(self, instance):
        user_id = instance.id
        instance.delete()
        # Notify connected clients about the user deletion
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "user_updates",
            {
                "type": "user.update",
                "message": {
                    "action": "user_deleted",
                    "user_id": user_id
                }
            }
        )


class ResetUserPasswordView(APIView):
    """API view for admin-initiated password reset."""
    
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            
            # Generate password reset token
            token = default_token_generator.make_token(user)
            
            # Create reset link (frontend needs to handle this URL)
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}&user={user.pk}"
            
            # Send email
            send_mail(
                'Password Reset',
                f'Click the following link to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            return Response({'detail': 'Password reset link sent successfully.'})
            
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'detail': 'Failed to send reset email.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
