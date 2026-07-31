from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from decimal import Decimal

from pos.models import Product
from enterprise.models import Warehouse
from .models import StockTransfer, PutAwayRule, PutAwayTask, BinReplenishmentTask
from .serializers import (StockTransferSerializer, PutAwayRuleSerializer,
                          PutAwayTaskSerializer, BinReplenishmentTaskSerializer)
from .services import create_transfer, receive_transfer, suggest_putaway, generate_replenishment_tasks


class StockTransferListCreateView(generics.ListCreateAPIView):
    serializer_class = StockTransferSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = StockTransfer.objects.all()

    def perform_create(self, serializer):
        d = serializer.validated_data
        serializer.instance = create_transfer(source=d["source_warehouse"], destination=d["destination_warehouse"],
                                              lines=self.request.data.get("items", []),
                                              note=d.get("note", ""), user=self.request.user)


class StockTransferDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StockTransferSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = StockTransfer.objects.all()


class ReceiveTransferView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        t = receive_transfer(pk, request.data.get("lines"))
        return Response(StockTransferSerializer(t).data)


class PutAwayRuleListCreateView(generics.ListCreateAPIView):
    queryset = PutAwayRule.objects.all()
    serializer_class = PutAwayRuleSerializer
    permission_classes = [permissions.IsAuthenticated]


class SuggestPutAwayView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        wh = get_object_or_404(Warehouse, pk=request.data["warehouse_id"])
        p = get_object_or_404(Product, pk=request.data["product_id"])
        task = suggest_putaway(wh, p, Decimal(request.data.get("quantity", 1)), request.data.get("reference", ""))
        return Response(PutAwayTaskSerializer(task).data, status=201)


class PutAwayTaskListView(generics.ListAPIView):
    serializer_class = PutAwayTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = PutAwayTask.objects.all()
        wh = self.request.query_params.get("warehouse_id")
        return qs.filter(warehouse_id=wh) if wh else qs


class CompletePutAwayView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        from django.utils import timezone
        t = get_object_or_404(PutAwayTask, pk=pk)
        t.status = PutAwayTask.STATUS_DONE
        t.completed_at = timezone.now()
        t.completed_by = request.user
        t.save(update_fields=["status", "completed_at", "completed_by"])
        return Response(PutAwayTaskSerializer(t).data)


class ReplenishmentGenerateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        wh = get_object_or_404(Warehouse, pk=pk)
        ids = generate_replenishment_tasks(wh, Decimal(request.data.get("threshold", 5)))
        return Response({"created": ids})


class ReplenishmentListView(generics.ListAPIView):
    serializer_class = BinReplenishmentTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = BinReplenishmentTask.objects.all()
        wh = self.request.query_params.get("warehouse_id")
        return qs.filter(warehouse_id=wh) if wh else qs