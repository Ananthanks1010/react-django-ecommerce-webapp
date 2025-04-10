from django.urls import path
from .views import imagesearch
 # Import the correct view

urlpatterns = [
    path('imagesearch/', imagesearch, name='imagesearch'), 
]
