from rest_framework import serializers

from .models import Warehouse, WarehouseStock, WarehouseTransfer, WarehouseTransferItem


class WarehouseSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source="store.name", read_only=True)

    class Meta:
        model = Warehouse
        fields = "__all__"


class WarehouseStockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = WarehouseStock
        fields = "__all__"


class TransferLineSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=0.01)


class WarehouseTransferCreateSerializer(serializers.Serializer):
    source_warehouse_id = serializers.IntegerField(min_value=1)
    destination_warehouse_id = serializers.IntegerField(min_value=1)
    note = serializers.CharField(required=False, allow_blank=True)
    items = TransferLineSerializer(many=True, allow_empty=False)


class WarehouseTransferItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = WarehouseTransferItem
        fields = "__all__"


class WarehouseTransferSerializer(serializers.ModelSerializer):
    items = WarehouseTransferItemSerializer(many=True, read_only=True)
    source_warehouse_name = serializers.CharField(source="source_warehouse.name", read_only=True)
    destination_warehouse_name = serializers.CharField(source="destination_warehouse.name", read_only=True)

    class Meta:
        model = WarehouseTransfer
        fields = "__all__"


