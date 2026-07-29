from rest_framework import serializers
from .models import (SupplierContact, GoodsReceipt, GoodsReceiptLine, PurchaseReturn,
                     PurchaseReturnLine, SupplierPortalToken)


class SupplierContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierContact
        fields = "__all__"


class GoodsReceiptLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoodsReceiptLine
        fields = "__all__"


class GoodsReceiptSerializer(serializers.ModelSerializer):
    lines = GoodsReceiptLineSerializer(many=True, read_only=True)
    class Meta:
        model = GoodsReceipt
        fields = "__all__"


class PurchaseReturnLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseReturnLine
        fields = "__all__"


class PurchaseReturnSerializer(serializers.ModelSerializer):
    lines = PurchaseReturnLineSerializer(many=True, read_only=True)
    class Meta:
        model = PurchaseReturn
        fields = "__all__"


class SupplierPortalTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierPortalToken
        fields = "__all__"