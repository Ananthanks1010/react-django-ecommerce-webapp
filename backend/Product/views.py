from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from fastapi import FastAPI, Query
from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute
from typing import List
import os
from fuzzywuzzy import fuzz
from pynamodb.attributes import UnicodeAttribute
from pynamodb.models import Model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json

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


@csrf_exempt  # Disable CSRF for local testing; enable proper auth in production
@require_POST
def product_description(request):
    try:
        # Parse JSON body
        data = json.loads(request.body)
        search_term = data.get('product_description', '').lower()

        if not search_term:
            return JsonResponse({'error': 'product_description is required'}, status=400)

        # Threshold for fuzzy match (0-100), higher = stricter
        FUZZY_THRESHOLD = 70

        matching_products = []

        for item in Product.scan():
            desc = item.product_description
            if not desc:
                continue

            score = fuzz.partial_ratio(search_term, desc.lower())
            if score >= FUZZY_THRESHOLD:
                matching_products.append(item.product_id)

        return JsonResponse({'product_ids': matching_products})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_POST
def get_products_by_ids(request):
    try:
        data = json.loads(request.body)
        product_ids = data.get("product_ids", [])

        if not isinstance(product_ids, list) or not product_ids:
            return JsonResponse({"error": "product_ids must be a non-empty array"}, status=400)

        products_data = []

        for pid in product_ids:
            try:
                product = Product.get(pid)
                products_data.append({
                    "product_id": product.product_id,
                    "name": product.product_name,
                    "product_description": product.product_description,
                    "images": product.thumbnail_url or [],
                    "image" : product.image_url,
                    "model" : product.model_url,
                    "price" : product.product_price,
                    "category" : product.product_category,
                    "sizes" : product.product_sizes,
                })
            except Product.DoesNotExist:
                continue  # Skip missing products

        return JsonResponse({"products": products_data}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
        

@csrf_exempt
def get_model_url(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')

        if not product_id:
            return JsonResponse({'error': 'Missing product_id'}, status=400)

        product = Product.get(product_id)
        
        if not product.model_url:
            return JsonResponse({'error': 'Model URL not available for this product'}, status=404)

        return JsonResponse({'model_url': product.model_url}, status=200)

    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)