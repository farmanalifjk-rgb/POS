
from rest_framework import serializers
from .models import (GiftCard, GiftCardTransaction, StoreCredit, StoreCreditTransaction,
                     TenderedPayment, PaymentReconciliation, ReconciliationLine, RefundCreditNote)


class GiftCardTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftCardTransaction
        fields = "__all__"


class GiftCardSerializer(serializers.ModelSerializer):
    transactions = GiftCardTransactionSerializer(many=True, read_only=True)
    class Meta:
        model = GiftCard
        fields = "__all__"


class StoreCreditTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreCreditTransaction
        fields = "__all__"


class StoreCreditSerializer(serializers.ModelSerializer):
    transactions = StoreCreditTransactionSerializer(many=True, read_only=True)
    class Meta:
        model = StoreCredit
        fields = "__all__"


class TenderedPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenderedPayment
        fields = "__all__"


class ReconciliationLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReconciliationLine
        fields = "__all__"


class PaymentReconciliationSerializer(serializers.ModelSerializer):
    lines = ReconciliationLineSerializer(many=True, read_only=True)
    class Meta:
        model = PaymentReconciliation
        fields = "__all__"


class RefundCreditNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RefundCreditNote
        fields = "__all__"
