import json
import uuid
import random
import time
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import UserModel
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST



# In-memory OTP store with expiry tracking
otp_store = {}

class RegisterUserView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if UserModel.get_or_none(email):
            return Response({'error': 'Email already registered.'}, status=status.HTTP_400_BAD_REQUEST)

        otp = str(random.randint(100000, 999999))
        otp_store[email] = {
            'otp': otp,
            'password': password,
            'created_at': time.time()  # Store current timestamp
        }

        print(f"DEBUG: OTP for {email} is {otp}")  # Replace with real email logic

        return Response({'message': 'OTP sent to your email.'}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({'error': 'Email and OTP are required.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_data = otp_store.get(email)

        if otp_data:
            # Check if OTP is expired (older than 5 minutes)
            if time.time() - otp_data['created_at'] > 300:
                otp_store.pop(email)  # Remove expired OTP
                return Response({'error': 'OTP has expired. Please register again.'}, status=status.HTTP_400_BAD_REQUEST)

            if otp_data['otp'] == otp:
                user_id = str(uuid.uuid4())
                UserModel(
                    user_id=user_id,
                    user_name=email.split('@')[0],
                    email=email,
                    password=otp_data['password']
                ).save()
                otp_store.pop(email)
                return Response({'user_id': user_id}, status=status.HTTP_201_CREATED)

        return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)


class LoginUserView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = UserModel.get_or_none(email)
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.password != password:
            return Response({'error': 'Incorrect password.'}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({'user_id': user.user_id}, status=status.HTTP_200_OK)

@csrf_exempt
@require_POST
def get_username_by_id(request):
    try:
        data = json.loads(request.body)
        user_id = data.get("user_id")

        if not user_id:
            return JsonResponse({"error": "Missing user_id"}, status=400)

        try:
            user = UserModel.get(user_id)
            return JsonResponse({
                "user_id": user_id,
                "username": UserModel.user_name  # ✅ corrected field
            })
        except UserModel.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
