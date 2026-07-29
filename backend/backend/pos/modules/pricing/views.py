from decimal import Decimal
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from pos.models import Product, Customer
from .models import (PriceList, PriceListItem, CustomerGroupPrice, VolumeTier, TimeBasedPrice, BuyXGetY)
from .serializers import (PriceListSerializer, PriceListItemSerializer, CustomerGroupPriceSerializer,
                          VolumeTierSerializer, TimeBasedPriceSerializer, BuyXGetYSerializer)
from .services import resolve_price, apply_buyx_gety


class PriceListListCreateView(generics.ListCreateAPIView):
    queryset = PriceList.objects.all()
    serializer_class = PriceListSerializer
    permission_classes = [permissions.IsAuthenticated]


class PriceListDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PriceList.objects.all()
    serializer_class = PriceListSerializer
    permission_classes = [permissions.IsAuthenticated]


class PriceListItemListCreateView(generics.ListCreateAPIView):
    serializer_class = PriceListItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PriceListItem.objects.filter(price_list_id=self.kwargs["price_list_id"])

    def perform_create(self, serializer):
        serializer.save(price_list_id=self.kwargs["price_list_id"])


class CustomerGroupPriceListCreateView(generics.ListCreateAPIView):
    queryset = CustomerGroupPrice.objects.all()
    serializer_class = CustomerGroupPriceSerializer
    permission_classes = [permissions.IsAuthenticated]


class VolumeTierListCreateView(generics.ListCreateAPIView):
    queryset = VolumeTier.objects.all()
    serializer_class = VolumeTierSerializer
    permission_classes = [permissions.IsAuthenticated]


class TimeBasedPriceListCreateView(generics.ListCreateAPIView):
    queryset = TimeBasedPrice.objects.all()
    serializer_class = TimeBasedPriceSerializer
    permission_classes = [permissions.IsAuthenticated]


class BuyXGetYListCreateView(generics.ListCreateAPIView):
    queryset = BuyXGetY.objects.all()
    serializer_class = BuyXGetYSerializer
    permission_classes = [permissions.IsAuthenticated]


class ResolvePriceView(APIView):
    """GET /api/pricing/resolve/?product=&quantity=&customer=&price_list=&variant="""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        product = get_object_or_404(Product, pk=request.query_params.get("product"))
        customer = None
        cid = request.query_params.get("customer")
        if cid:
            customer = Customer.objects.filter(pk=cid).first()
        pl = request.query_params.get("price_list")
        price_list = PriceList.objects.filter(pk=pl).first() if pl else None
        qty = Decimal(request.query_params.get("quantity", "1"))
        price = resolve_price(product=product, customer=customer, quantity=qty, price_list=price_list)
        free = apply_buyx_gety(product=product, quantity=int(qty))
        return Response({
            "unit_price": str(price),
            "line_total": str(price * qty),
            "buyx_gety": [{"product": p.id, "qty": q} for p, q in free],
        })