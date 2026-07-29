from rest_framework import serializers
from .models import (BinLocation, StockReservation, CycleCount, CycleCountLine,
                     ReorderRule, ABCAnalysis, InventoryAgingSnapshot)


class BinLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BinLocation
        fields = "__all__"


class StockReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockReservation
        fields = "__all__"


class CycleCountLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycleCountLine
        fields = "__all__"


class CycleCountSerializer(serializers.ModelSerializer):
    lines = CycleCountLineSerializer(many=True, read_only=True)
    class Meta:
        model = CycleCount
        fields = "__all__"


class ReorderRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReorderRule
        fields = "__all__"


class ABCAnalysisSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    class Meta:
        model = ABCAnalysis
        fields = "__all__"


class InventoryAgingSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryAgingSnapshot
        fields = "__all__"