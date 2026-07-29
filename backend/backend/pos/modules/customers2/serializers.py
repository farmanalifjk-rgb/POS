from rest_framework import serializers
from .models import (CustomerAddress, CustomerCreditLimit, CustomerDocument,
                     LoyaltyEvent, CustomerNote, CustomerPortalToken)


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = "__all__"


class CustomerCreditLimitSerializer(serializers.ModelSerializer):
    available = serializers.SerializerMethodField()
    class Meta:
        model = CustomerCreditLimit
        fields = "__all__"
    def get_available(self, obj):
        from decimal import Decimal
        return str(Decimal(obj.limit) - Decimal(obj.used))


class CustomerDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerDocument
        fields = "__all__"


class LoyaltyEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyEvent
        fields = "__all__"


class CustomerNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerNote
        fields = "__all__"


class CustomerPortalTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerPortalToken
        fields = "__all__"