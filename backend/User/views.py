# views.py
import boto3
from django.shortcuts import redirect, HttpResponse
from django.conf import settings
from django.http import JsonResponse
from .utils import verify_cognito_token
import urllib.parse, base64, requests

def get_cognito_domain():
    """Fetch the current Hosted UI domain for the Cognito user pool."""
    client = boto3.client("cognito-idp", region_name=settings.AWS_COGNITO_REGION)
    response = client.describe_user_pool(UserPoolId=settings.COGNITO_USER_POOL_ID)
    domain = response["UserPool"]["Domain"]
    if not domain.startswith("https://"):
        domain = f"https://{domain}.auth.{settings.AWS_COGNITO_REGION}.amazoncognito.com"
    return domain

def build_cognito_url(path, from_page):
    domain = get_cognito_domain()
    params = {
        'client_id': settings.COGNITO_CLIENT_ID,
        'response_type': 'code',
        'scope': 'openid email profile',
        'redirect_uri': settings.COGNITO_REDIRECT_URI,
    }
    url = f"{domain}/{path}?{urllib.parse.urlencode(params)}"
    return url

def cognito_login(request):
    from_page = request.GET.get("from", "/")
    request.session["next_url"] = from_page
    return redirect(build_cognito_url("login", from_page))

def cognito_signup(request):
    from_page = request.GET.get("from", "/")
    request.session["next_url"] = from_page
    return redirect(build_cognito_url("signup", from_page))

def cognito_callback(request):
    code = request.GET.get("code")
    if not code:
        return HttpResponse("Missing code", status=400)

    domain = get_cognito_domain()
    token_url = f"{domain}/oauth2/token"
    client_secret = f"{settings.COGNITO_CLIENT_ID}:{settings.COGNITO_CLIENT_SECRET}"
    auth_header = base64.b64encode(client_secret.encode()).decode()

    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {auth_header}",
    }

    data = {
        "grant_type": "authorization_code",
        "client_id": settings.COGNITO_CLIENT_ID,
        "code": code,
        "redirect_uri": settings.COGNITO_REDIRECT_URI,
    }

    token_response = requests.post(token_url, headers=headers, data=data)

    if token_response.status_code != 200:
        return HttpResponse("Token exchange failed", status=400)

    tokens = token_response.json()
    id_token = tokens.get("id_token")

    try:
        user_info = verify_cognito_token(id_token)
    except Exception as e:
        return HttpResponse(f"Token verification failed: {e}", status=401)

    request.session["user"] = {
        "email": user_info.get("email"),
        "sub": user_info.get("sub"),
        "name": user_info.get("name"),
    }

    next_url = request.session.pop("next_url", "/")
    return redirect(next_url)

def get_user_info(request):
    user = request.session.get("user")
    if not user:
        return JsonResponse({"error": "Not logged in"}, status=401)
    return JsonResponse(user)

def cognito_logout(request):
    request.session.flush()
    domain = get_cognito_domain()
    logout_url = f"{domain}/logout?client_id={settings.COGNITO_CLIENT_ID}&logout_uri=http://localhost:3000/"
    return redirect(logout_url)
