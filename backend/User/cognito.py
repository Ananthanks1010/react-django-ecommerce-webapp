import boto3
import os
import hmac
import hashlib
import base64
from django.conf import settings

client = boto3.client("cognito-idp", region_name=settings.AWS_COGNITO_REGION)  # e.g., us-east-1

COGNITO_CLIENT_ID = settings.AWS_COGNITO_CLIENT_ID
COGNITO_CLIENT_SECRET = settings.AWS_CLIENT_SECRET


def get_secret_hash(username: str) -> str:
    message = username + COGNITO_CLIENT_ID
    dig = hmac.new(
        key=COGNITO_CLIENT_SECRET.encode("utf-8"),
        msg=message.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).digest()
    return base64.b64encode(dig).decode()


def sign_up(email, password):
    client.sign_up(
        ClientId=COGNITO_CLIENT_ID,
        SecretHash=get_secret_hash(email),
        Username=email,
        Password=password,
        UserAttributes=[{"Name": "email", "Value": email}],
    )


def confirm_sign_up(email, code):
    client.confirm_sign_up(
        ClientId=COGNITO_CLIENT_ID,
        SecretHash=get_secret_hash(email),
        Username=email,
        ConfirmationCode=code,
    )


def login(email, password):
    response = client.initiate_auth(
        ClientId=COGNITO_CLIENT_ID,
        AuthFlow="USER_PASSWORD_AUTH",
        AuthParameters={
            "USERNAME": email,
            "PASSWORD": password,
            "SECRET_HASH": get_secret_hash(email),
        },
    )
    return {
        "access_token": response["AuthenticationResult"]["AccessToken"],
        "id_token": response["AuthenticationResult"]["IdToken"],
        "refresh_token": response["AuthenticationResult"]["RefreshToken"],
    }
