from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = 'account'

urlpatterns = [
    # Authentication URLs
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile URLs
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    
    # Account lockout (for django-axes)
    path('locked/', views.LockedView.as_view(), name='locked'),
    
    # Admin URLs
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/<int:pk>/reset-password/', views.ResetUserPasswordView.as_view(), name='reset_user_password'),
]