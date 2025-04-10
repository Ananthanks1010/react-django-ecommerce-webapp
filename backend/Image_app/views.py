from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from Image_app.process.inference import input_fn  # Your YOLO wrapper

@api_view(['POST'])
def imagesearch(request):
    try:
        image_data = request.data.get("image_data")
        if not image_data:
            return Response({"error": "Missing 'image_data' field."}, status=400)

        result = input_fn(image_data)

        if not isinstance(result, list):
            return Response({"error": "Expected a list of product IDs."}, status=500)

        return Response({"product_ids": result})

    except Exception as e:
        print("Error in image search:", e)
        return Response({"error": str(e)}, status=500)
