import requests, jwt
from jwt.algorithms import RSAAlgorithm
from django.conf import settings

def get_cognito_jwks():
    jwks_url = f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/{settings.COGNITO_USER_POOL_ID}/.well-known/jwks.json"
    return requests.get(jwks_url).json()

def verify_cognito_token(token):
    jwks = get_cognito_jwks()
    unverified_header = jwt.get_unverified_header(token)

    for key in jwks['keys']:
        if key['kid'] == unverified_header['kid']:
            public_key = RSAAlgorithm.from_jwk(key)
            return jwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                audience=settings.COGNITO_CLIENT_ID
            )
    raise jwt.InvalidTokenError("Signature verification failed")

# Optional: Sync user to Django DB
from django.contrib.auth import get_user_model

def get_or_create_user_from_cognito(user_info):
    User = get_user_model()
    user, created = User.objects.get_or_create(
        username=user_info["sub"],
        defaults={"email": user_info.get("email")}
    )
    return user
