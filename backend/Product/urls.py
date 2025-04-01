from django.urls import path
from .views import ProductListView  # Import the correct view

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),  # Correct view reference
]
