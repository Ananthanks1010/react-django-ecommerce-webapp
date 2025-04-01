from django.urls import path
from .views import (
    create_product, get_product, get_all_products, update_product, delete_product,
    upload_files, get_image, update_image, delete_image,
)

urlpatterns = [
    # Product Management
    path("create/", create_product, name="create_product"),  # Create a product
    path("product/<str:product_id>/", get_product, name="get_product"),  # Get a single product
    path("products/", get_all_products, name="get_all_products"),  # Get all products
    path("product/<str:product_id>/update/", update_product, name="update_product"),  # Update product
    path("product/<str:product_id>/delete/", delete_product, name="delete_product"),  # Delete product

    # File Upload & Retrieval
    path("upload/", upload_files, name="upload_files"),  # Upload images & 3D models
    path("image/<str:product_id>/", get_image, name="get_image"),  # Retrieve product assets
    path("image/<str:product_id>/update/", update_image, name="update_image"),  # Update product assets
    path("image/<str:product_id>/delete/", delete_image, name="delete_image"),  # Delete product assets
    
]
