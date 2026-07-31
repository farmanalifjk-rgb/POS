from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import (BinLocation, StockReservation, CycleCount, ReorderRule, ABCAnalysis)
from .serializers import (BinLocationSerializer, StockReservationSerializer, CycleCountSerializer,
                          ReorderRuleSerializer, ABCAnalysisSerializer, InventoryAgingSerializer)
from .services import (reserve_stock, release_reservation, run_cycle_count,
                       compute_abc, compute_aging, products_below_reorder, available_stock)


class BinLocationListCreateView(generics.ListCreateAPIView):
    serializer_class = BinLocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = BinLocation.objects.all()
        wid = self.request.query_params.get("warehouse_id")
        return qs.filter(warehouse_id=wid) if wid else qs


class StockReservationListCreateView(generics.ListCreateAPIView):
    queryset = StockReservation.objects.all()
    serializer_class = StockReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        d = serializer.validated_data
        r = reserve_stock(product=d["product"], warehouse=d.get("warehouse"),
                          quantity=d["quantity"], reference=d.get("reference", ""),
                          reserved_by=self.request.user)
        serializer.instance = r


class ReleaseReservationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        return Response(StockReservationSerializer(release_reservation(pk)).data)


class AvailableStockView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        from pos.models import Product
        p = get_object_or_404(Product, pk=request.query_params.get("product"))
        wid = request.query_params.get("warehouse_id")
        wh = None
        if wid:
            from enterprise.models import Warehouse
            wh = Warehouse.objects.filter(pk=wid).first()
        return Response({"available": str(available_stock(p, wh))})


class CycleCountListCreateView(generics.ListCreateAPIView):
    queryset = CycleCount.objects.all()
    serializer_class = CycleCountSerializer
    permission_classes = [permissions.IsAuthenticated]


class CycleCountDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CycleCount.objects.all()
    serializer_class = CycleCountSerializer
    permission_classes = [permissions.IsAuthenticated]


class RunCycleCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        run_cycle_count(pk, request.data.get("lines", []))
        return Response(CycleCountSerializer(CycleCount.objects.get(pk=pk)).data)


class ReorderRuleListCreateView(generics.ListCreateAPIView):
    queryset = ReorderRule.objects.all()
    serializer_class = ReorderRuleSerializer
    permission_classes = [permissions.IsAuthenticated]


class ABCView(generics.ListAPIView):
    serializer_class = ABCAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ABCAnalysis.objects.all()

    def list(self, request, *a, **k):
        compute_abc()
        return super().list(request, *a, **k)


class AgingView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        buckets = compute_aging()
        return Response({"buckets": buckets})

class ReorderAlertsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(products_below_reorder())


