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


@csrf_exempt
def create_checkout(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed"}, status=405)

    try:
        data = json.loads(request.body)

        user_id = data.get("user_id")
        product_ids = data.get("product_id")  # Can be string or list
        phone_number = data.get("phone_number")

        if not user_id or not product_ids or not phone_number:
            return JsonResponse({"error": "Missing required fields"}, status=400)

        if isinstance(product_ids, str):
            product_ids = [product_ids]

        # Fetch user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

        # Fetch product details from DynamoDB
        product_details = []
        for pid in product_ids:
            try:
                product = Product.get(pid)
                product_details.append(ProductDetail(
                    product_id=product.product_id,
                    product_name=product.product_name,
                    product_color=product.product_color,
                    product_size=product.product_sizes[0] if product.product_sizes else "N/A",
                    product_price=str(product.product_price),
                    image_url=product.image_url
                ))
            except Product.DoesNotExist:
                return JsonResponse({"error": f"Product {pid} not found"}, status=404)

        # Save checkout
        checkout = Checkout(
            username=user.username,
            phone_number=phone_number,
            login_email=user.email,
            product_details=product_details,
            payment_type="cod",  # default for now
            created_at=datetime.utcnow()
        )
        checkout.save()

        # Print mock email
        print("\n=== Order Confirmation Email ===")
        print(f"To: {user.email}")
        print("Subject: Order Confirmation - Receipt ID")
        print(f"Body:\nThank you for your purchase!\n\nYour order receipt ID is: {checkout.checkout_id}\nPlease keep this ID for tracking your order.\n")
        print("===============================\n")

        return JsonResponse({
            "message": "Checkout created successfully",
            "receipt_id": checkout.checkout_id,
            "checkout_date": checkout.created_at.isoformat()
        })

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)