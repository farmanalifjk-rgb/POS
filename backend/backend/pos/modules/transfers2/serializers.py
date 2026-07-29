from rest_framework import serializers
from .models import StockTransfer, StockTransferItem, PutAwayRule, PutAwayTask, BinReplenishmentTask


class StockTransferItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransferItem
        fields = "__all__"


class StockTransferSerializer(serializers.ModelSerializer):
    items = StockTransferItemSerializer(many=True, read_only=True)
    class Meta:
        model = StockTransfer
        fields = "__all__"


class PutAwayRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PutAwayRule
        fields = "__all__"


class PutAwayTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = PutAwayTask
        fields = "__all__"


class BinReplenishmentTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = BinReplenishmentTask
        fields = "__all__"