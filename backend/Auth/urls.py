from django.urls import path
from .views import RegisterUserView, VerifyOTPView, LoginUserView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('login/', LoginUserView.as_view(), name='login'),
]
