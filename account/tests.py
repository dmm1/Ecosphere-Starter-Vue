import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from factory import Factory, Faker, SubFactory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()


# Factory Boy factories for test data generation
class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    email = Faker('email')
    first_name = Faker('first_name')
    last_name = Faker('last_name')
    bio = Faker('text', max_nb_chars=200)
    is_active = True

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Override the default _create to handle password hashing."""
        password = kwargs.pop('password', 'password123')
        user = model_class(*args, **kwargs)
        user.set_password(password)
        user.save()
        return user


class ProfileFactory(DjangoModelFactory):
    class Meta:
        model = Profile

    user = SubFactory(UserFactory)
    phone_number = Faker('phone_number')
    address = Faker('address')


# Pytest fixtures
@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user():
    return UserFactory(email='test@example.com', password='StrongPass123!')


@pytest.fixture
def authenticated_client(api_client, user):
    url = reverse('account:login')
    resp = api_client.post(url, {'email': user.email, 'password': 'StrongPass123!'}, format='json')
    token = resp.data['access']
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return api_client


# Tests for the account app
@pytest.mark.django_db
class TestUserRegistration:
    def test_user_can_register(self, api_client):
        url = reverse('account:register')
        data = {
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email='newuser@example.com').exists()
        
    def test_user_cannot_register_with_weak_password(self, api_client):
        url = reverse('account:register')
        data = {
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'weak',
            'password_confirm': 'weak'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert not User.objects.filter(email='newuser@example.com').exists()


@pytest.mark.django_db
class TestUserAuthentication:
    def test_user_can_login(self, api_client, user):
        url = reverse('account:login')
        data = {
            'email': user.email,
            'password': 'StrongPass123!'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
    
    def test_user_profile_protected(self, api_client, authenticated_client, user):
        url = reverse('account:profile')
        # Unauthenticated request should fail
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Authenticated request should succeed
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email


@pytest.mark.django_db
class TestProfileManagement:
    def test_user_can_update_profile(self, authenticated_client, user):
        url = reverse('account:profile')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'bio': 'Updated bio',
            'profile': {
                'phone_number': '+1234567890',
                'address': '123 Updated St'
            }
        }
        response = authenticated_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        # Refresh user from database
        user.refresh_from_db()
        assert user.first_name == 'Updated'
        assert user.bio == 'Updated bio'
        assert user.profile.phone_number == '+1234567890'
