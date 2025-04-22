from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import Profile

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for Profile model."""
    
    class Meta:
        model = Profile
        fields = ['profile_picture', 'phone_number', 'address']
        read_only_fields = ['user']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model."""
    
    profile = ProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'bio', 'date_joined', 'last_login', 'date_updated', 'is_active', 'is_staff', 'profile']
        read_only_fields = ['date_joined', 'date_updated', 'last_login', 'is_active', 'is_staff']

    def to_representation(self, instance):
        """Add profile to response if it exists."""
        representation = super().to_representation(instance)
        try:
            if not hasattr(instance, 'profile'):
                Profile.objects.create(user=instance)
            representation['profile'] = ProfileSerializer(instance.profile).data
        except Profile.DoesNotExist:
            representation['profile'] = None
        return representation
    
    def update(self, instance, validated_data):
        """Update user and related profile."""
        profile_data = validated_data.pop('profile', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile if provided
        if profile_data and hasattr(instance, 'profile'):
            for attr, value in profile_data.items():
                setattr(instance.profile, attr, value)
            instance.profile.save()
        # Create profile if it doesn't exist
        elif profile_data:
            Profile.objects.create(user=instance, **profile_data)
            
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate(self, data):
        """Validate that passwords match and meet requirements."""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        try:
            validate_password(data['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e)})
        
        return data
    
    def create(self, validated_data):
        """Create user with validated data."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'],
        )
        
        # Create an empty profile for the user
        Profile.objects.create(user=user)
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    current_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate(self, data):
        """Validate current password and new password confirmation."""
        if not self.context['request'].user.check_password(data['current_password']):
            raise serializers.ValidationError({"current_password": "Invalid current password."})
            
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        
        try:
            validate_password(data['new_password'], user=self.context['request'].user)
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e)})
            
        return data