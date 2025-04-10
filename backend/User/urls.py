# urls.py
from django.urls import path
from .views import (
    cognito_login,
    cognito_signup,
    cognito_callback,
    get_user_info,
    cognito_logout,
)

urlpatterns = [
    path('login-cognito/', cognito_login, name='cognito-login'),
    path('signup-cognito/', cognito_signup, name='cognito-signup'),
    path('callback/', cognito_callback, name='cognito-callback'),
    path('userinfo/', get_user_info, name='cognito-userinfo'),
    path('logout/', cognito_logout, name='cognito-logout'),
]
