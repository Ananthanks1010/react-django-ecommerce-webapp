from django.urls import path
from .views import RegisterUserView, VerifyOTPView, LoginUserView, get_username_by_id

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('login/', LoginUserView.as_view(), name='login'),
    path("get-username/", get_username_by_id),
]
