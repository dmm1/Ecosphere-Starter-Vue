from django.contrib.auth import get_user_model
from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

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


class LockedView(APIView):
    """View for handling locked accounts via django-axes."""
    
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({
            "detail": "Your account has been locked due to too many failed login attempts. Please try again later."
        }, status=status.HTTP_403_FORBIDDEN)


# Administrative views
class UserListView(generics.ListAPIView):
    """API view for listing all users (admin only)."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API view for getting, updating, or deleting any user (admin only)."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
