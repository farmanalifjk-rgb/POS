from datetime import datetime
from decimal import Decimal
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from pos.models import Order
from .models import TaxRate, TaxExemption, TaxBreakdown, TaxReport
from .serializers import (TaxRateSerializer, TaxExemptionSerializer,
                          TaxBreakdownSerializer, TaxReportSerializer)
from .engine import compute_order_tax, compute_line_tax, tax_report


class TaxRateListCreateView(generics.ListCreateAPIView):
    serializer_class = TaxRateSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = TaxRate.objects.all()


class TaxRateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaxRateSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = TaxRate.objects.all()


class TaxExemptionListCreateView(generics.ListCreateAPIView):
    serializer_class = TaxExemptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = TaxExemption.objects.all()


class TaxExemptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaxExemptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = TaxExemption.objects.all()


class PreviewLineTaxView(APIView):
    """Preview tax for a hypothetical line without persisting."""
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        from pos.models import Product, Customer
        p = get_object_or_404(Product, pk=request.data["product_id"])
        cust = None
        if request.data.get("customer_id"):
            cust = get_object_or_404(Customer, pk=request.data["customer_id"])
        return Response(compute_line_tax(p, Decimal(request.data["subtotal"]), cust))


class ComputeOrderTaxView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id)
        cust = order.customer
        total = compute_order_tax(order, cust)
        return Response({"order": order.order_number, "tax": str(total),
                          "total": str(order.total),
                          "breakdown": TaxBreakdownSerializer(order.tax_breakdowns.all(), many=True).data})


class TaxBreakdownByOrderView(generics.ListAPIView):
    serializer_class = TaxBreakdownSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = TaxBreakdown.objects.all()
        oid = self.request.query_params.get("order_id")
        return qs.filter(order_id=oid) if oid else qs


class TaxReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        if not start or not end:
            from django.utils import timezone
            from datetime import timedelta
            end = timezone.now().date()
            start = end - timedelta(days=30)
        data = tax_report(start, end)
        rep = TaxReport.objects.create(period_start=start, period_end=end,
                                       total_taxable=Decimal(data["total_taxable"]),
                                       total_tax_collected=Decimal(data["total_tax_collected"]),
                                       breakdown_json=str(data["by_rate"]))
        data["report_id"] = rep.id
        return Response(data)