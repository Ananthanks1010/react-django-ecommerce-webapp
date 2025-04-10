from django.urls import path
from .views import ProductListView, FeaturedProductsView, get_product, product_description, get_products_by_ids
 # Import the correct view

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),  # Correct view reference
    path('featured/', FeaturedProductsView.as_view(), name='featured_product-list'),
    path('product/<str:product_id>/', get_product, name='get_product'),
    path('description/', product_description, name='get_description'),
     path("get-by-ids", get_products_by_ids, name="get_products_by_ids")
]
