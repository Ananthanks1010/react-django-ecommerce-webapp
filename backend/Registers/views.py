# cart/views.py

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_http_methods
import json
from .models import UserCart


# cart/views.py

@csrf_exempt
@require_POST
def add_product_to_cart(request):
    """
    Adds a product_id to the user's cart (as a POST request).
    JSON body must include: user_id, product_id
    """
    try:
        data = json.loads(request.body)
        user_id = data.get("user_id")
        product_id = data.get("product_id")

        if not user_id or not product_id:
            return JsonResponse({"error": "Missing user_id or product_id"}, status=400)

        try:
            cart = UserCart.get(user_id)
            if product_id not in cart.product_ids:
                cart.product_ids.append(product_id)
                cart.save()
        except UserCart.DoesNotExist:
            cart = UserCart(user_id=user_id, product_ids=[product_id])
            cart.save()

        return JsonResponse({"message": f"Product '{product_id}' added to cart", "product_ids": cart.product_ids})

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



@csrf_exempt
@require_http_methods(["DELETE"])
def remove_product_from_cart(request):
    data = json.loads(request.body)
    user_id = data.get("user_id")
    product_id = data.get("product_id")

    if not user_id or not product_id:
        return JsonResponse({"error": "Missing user_id or product_id"}, status=400)

    try:
        cart = UserCart.get(user_id)
        if product_id in cart.product_ids:
            cart.product_ids.remove(product_id)
            cart.save()
            return JsonResponse({"message": f"Product {product_id} removed from cart"})
        else:
            return JsonResponse({"error": "Product not found in cart"}, status=404)
    except UserCart.DoesNotExist:
        return JsonResponse({"error": "Cart not found"}, status=404)


@csrf_exempt
@require_POST
def get_cart_products(request):
    data = json.loads(request.body)
    user_id = data.get("user_id")

    if not user_id:
        return JsonResponse({"error": "Missing user_id"}, status=400)

    try:
        cart = UserCart.get(user_id)
        return JsonResponse({"user_id": user_id, "product_ids": cart.product_ids})
    except UserCart.DoesNotExist:
        return JsonResponse({"user_id": user_id, "product_ids": []})
