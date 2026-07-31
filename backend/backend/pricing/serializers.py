from rest_framework import serializers
from .models import (PriceList, PriceListItem, CustomerGroupPrice, VolumeTier, TimeBasedPrice, BuyXGetY)


class PriceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceList
        fields = "__all__"


class PriceListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceListItem
        fields = "__all__"


class CustomerGroupPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerGroupPrice
        fields = "__all__"


class VolumeTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolumeTier
        fields = "__all__"


class TimeBasedPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeBasedPrice
        fields = "__all__"


class BuyXGetYSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyXGetY
        fields = "__all__"