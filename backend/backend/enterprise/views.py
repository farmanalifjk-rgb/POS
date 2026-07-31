from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from pos.models import Warehouse, WarehouseStock, WarehouseTransfer
from enterprise.serializers import (
    WarehouseSerializer, WarehouseStockSerializer, WarehouseTransferCreateSerializer,
    WarehouseTransferSerializer,
)
from pos.services.transfers import dispatch_transfer, receive_transfer


class WarehouseListCreateView(generics.ListCreateAPIView):
    queryset = Warehouse.objects.select_related("store").all()
    serializer_class = WarehouseSerializer


class WarehouseStockListView(generics.ListAPIView):
    serializer_class = WarehouseStockSerializer

    def get_queryset(self):
        return WarehouseStock.objects.select_related("warehouse", "product").filter(warehouse_id=self.kwargs["warehouse_id"])


class WarehouseTransferListCreateView(APIView):
    def get(self, request):
        return Response(WarehouseTransferSerializer(WarehouseTransfer.objects.select_related("source_warehouse", "destination_warehouse").prefetch_related("items__product"), many=True).data)

    def post(self, request):
        serializer = WarehouseTransferCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        source = get_object_or_404(Warehouse, pk=data["source_warehouse_id"], is_active=True)
        destination = get_object_or_404(Warehouse, pk=data["destination_warehouse_id"], is_active=True)
        transfer = dispatch_transfer(source_warehouse=source, destination_warehouse=destination, items=data["items"], note=data.get("note", ""), user=request.user)
        return Response(WarehouseTransferSerializer(transfer).data, status=status.HTTP_201_CREATED)


class WarehouseTransferReceiveView(APIView):
    def post(self, request, transfer_id):
        transfer = get_object_or_404(WarehouseTransfer, pk=transfer_id)
        rows = request.data.get("items", [])
        quantities = {int(row["id"]): row["quantity"] for row in rows if "id" in row and "quantity" in row}
        transfer = receive_transfer(transfer=transfer, quantities=quantities, user=request.user)
        return Response(WarehouseTransferSerializer(transfer).data)


