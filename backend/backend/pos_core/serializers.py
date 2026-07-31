from rest_framework import serializers
from .models import (ParkedOrder, Layaway, LayawayPayment, SplitBill, SplitBillShare,
                     ExchangeOrder, OfflineSyncQueue, ReceiptTemplate, CashDrawerEvent)


class ParkedOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParkedOrder
        fields = "__all__"


class LayawayPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LayawayPayment
        fields = "__all__"


class LayawaySerializer(serializers.ModelSerializer):
    installments = LayawayPaymentSerializer(many=True, read_only=True)
    class Meta:
        model = Layaway
        fields = "__all__"


class SplitBillShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = SplitBillShare
        fields = "__all__"


class SplitBillSerializer(serializers.ModelSerializer):
    shares = SplitBillShareSerializer(many=True, read_only=True)
    class Meta:
        model = SplitBill
        fields = "__all__"


class ExchangeOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeOrder
        fields = "__all__"


class OfflineSyncQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfflineSyncQueue
        fields = "__all__"


class ReceiptTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceiptTemplate
        fields = "__all__"


class CashDrawerEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashDrawerEvent
        fields = "__all__"