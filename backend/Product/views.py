from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Product

# Create your views here.

class ProductListView(APIView):
    def get(self,request):
        products = Product.scan()

        product_list = [product.attribute_values for product in products]

        return Response(product_list)
        

class FeaturedProductsView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            featured_products = []
            for product in Product.scan():
                if product.isFeatured:
                    featured_products.append({
                        "product_id": product.product_id,
                        "product_name": product.product_name,
                        "product_price": product.product_price,
                        "product_category": product.product_category,
                        "product_color": product.product_color,
                        "product_description": product.product_description,
                        "product_sizes": product.product_sizes,
                        "image_url": product.image_url,
                        "thumbnail_url": product.thumbnail_url,
                        "model_url": product.model_url,
                    })
            
            return Response({"featured_products": featured_products}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_product(request, product_id):
    try:
        product = Product.get(product_id)  # Fetch product from DynamoDB
        return Response({
            "product_id": product.product_id,
            "product_name": product.product_name,
            "product_price": product.product_price,
            "product_category": product.product_category,
            "product_color": product.product_color,
            "product_description": product.product_description,
            "product_sizes": product.product_sizes,
            "isTrending": product.isTrending,
            "isFeatured": product.isFeatured,
            "image_url": product.image_url,
            "thumbnail_url": product.thumbnail_url,
            "model_url": product.model_url
        })
    except DoesNotExist:
        return Response({"error": "Product not found"}, status=404)