from rest_framework import viewsets
from ..serializers import *
from rest_framework.response import Response
from rest_framework.decorators import api_view


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


@api_view(['GET'])
def product_by_barcode(request, barcode):
    try:
        product = Product.objects.get(barcode=barcode)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({"error": "Not found"}, status=404) 