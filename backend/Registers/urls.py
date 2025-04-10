# cart/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.add_product_to_cart, name='add_to_cart'),
    path('remove/', views.remove_product_from_cart, name='remove_from_cart'),
    path('get/', views.get_cart_products, name='get_cart'),
    path("checkout/", views.create_checkout, name="create_checkout"),
]
