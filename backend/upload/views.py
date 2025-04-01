from django.shortcuts import render

# Create your views here.
import uuid
from typing import List

import boto3
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute, ListAttribute
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from Product.models import Product



# Initialize S3 Client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION_NAME,
)

AWS_CUSTOM_DOMAIN = settings.AWS_CUSTOM_DOMAIN

@api_view(["POST"])
def create_product(request):
    """
    Create a new product in DynamoDB.
    """
    try:
        data = request.data
        product_id = str(uuid.uuid4())  # Generate unique ID
        
        product = Product(
            product_id=product_id,
            product_name=data.get("product_name"),
            product_price=float(data.get("product_price", 0)),
            product_category=data.get("product_category"),
            product_color=data.get("product_color"),
            product_description=data.get("product_description"),
            product_sizes=data.get("product_sizes",[]),
            isTrending=data.get("isTrending", False),
            isFeatured=data.get("isFeatured", False),
            image_url=data.get("image_url", ""),  # List of image URLs
            thumbnail_url=data.get("thumbnail_url", []),  # Single thumbnail URL
            model_url=data.get("3d_model_url", ""),  # Single 3D model URL
        )
        product.save()

        return JsonResponse({"message": "Product created successfully", "product_id": product_id}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(["GET"])
def get_product(request, product_id):
    """
    Retrieve a single product from DynamoDB.
    """
    try:
        product = Product.get(product_id)
        return JsonResponse(product.attribute_values, status=200)
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)

@api_view(["GET"])
def get_all_products(request):
    """
    Retrieve all products from DynamoDB.
    """
    try:
        products = [product.attribute_values for product in Product.scan()]
        return JsonResponse({"products": products}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(["PUT", "PATCH"])
def update_product(request, product_id):
    """
    Update an existing product in DynamoDB.
    """
    try:
        product = Product.get(product_id)
        data = request.data

        if "product_name" in data:
            product.product_name = data["product_name"]
        if "product_price" in data:
            product.product_price = float(data["product_price"])
        if "product_category" in data:
            product.product_category = data["product_category"]
        if "product_color" in data:
            product.product_color = data["product_color"]
        if "product_description" in data:
            product.product_description = data["product_description"]
        if "isTrending" in data:
            product.isTrending = data["isTrending"]
        if "isFeatured" in data:
            product.isFeatured = data["isFeatured"]

        product.save()
        return JsonResponse({"message": "Product updated successfully"}, status=200)
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(["DELETE"])
def delete_product(request, product_id):
    """
    Delete a product from DynamoDB.
    """
    try:
        product = Product.get(product_id)
        product.delete()
        return JsonResponse({"message": "Product deleted successfully"}, status=200)
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ✅ Upload Multiple Images & 3D Models
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_files(request):
    try:
        product_id = request.data.get("product_id")
        if not product_id:
            return Response({"error": "product_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        images = request.FILES.getlist("images")
        models = request.FILES.getlist("models")

        # Upload images
        image_urls = []
        for image in images:
            image_ext = image.name.split(".")[-1]
            image_key = f"products/{product_id}/images/{uuid.uuid4()}.{image_ext}"
            s3_client.upload_fileobj(image, settings.AWS_STORAGE_BUCKET_NAME, image_key, ExtraArgs={"ACL": "public-read"})
            image_urls.append(f"{AWS_CUSTOM_DOMAIN}/{image_key}")

        # Upload 3D models
        model_urls = []
        for model in models:
            model_ext = model.name.split(".")[-1]
            model_key = f"products/{product_id}/models/{uuid.uuid4()}.{model_ext}"
            s3_client.upload_fileobj(model, settings.AWS_STORAGE_BUCKET_NAME, model_key, ExtraArgs={"ACL": "public-read"})
            model_urls.append(f"{AWS_CUSTOM_DOMAIN}/{model_key}")

        # Store in PynamoDB
        product, created = ProductAssets.get_or_create(product_id=product_id)
        product.image_urls = (product.image_urls or []) + image_urls
        product.model_urls = (product.model_urls or []) + model_urls
        product.save()

        return Response(
            {"product_id": product_id, "image_urls": image_urls, "model_urls": model_urls},
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ Get Product Details
@api_view(["GET"])
def get_image(request, product_id):
    try:
        product = ProductAssets.get(product_id)
        return Response(product.attribute_values)
    except ObjectDoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)


# ✅ Update Product Details
@api_view(["PUT"])
def update_image(request, product_id):
    try:
        product = ProductAssets.get(product_id)
        image_urls = request.data.get("image_urls", [])
        model_urls = request.data.get("model_urls", [])
        
        if image_urls:
            product.image_urls = image_urls
        if model_urls:
            product.model_urls = model_urls

        product.save()
        return Response({"message": "Product assets updated successfully"})
    except ObjectDoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)


# ✅ Delete Product
@api_view(["DELETE"])
def delete_image(request, product_id):
    try:
        product = ProductAssets.get(product_id)
        product.delete()
        return Response({"message": "Product assets deleted successfully"})
    except ObjectDoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
    
# s3 upload and pynamodb upload

