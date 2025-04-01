from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product

# Create your views here.

class ProductListView(APIView):
    def get(self,request):
        products = Product.scan()

        product_list = [product.attribute_values for product in products]

        return Response(product_list)