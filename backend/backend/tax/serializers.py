from rest_framework import serializers
from .models import TaxRate, TaxExemption, TaxBreakdown, TaxReport


class TaxRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRate
        fields = "__all__"


class TaxExemptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxExemption
        fields = "__all__"


class TaxBreakdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxBreakdown
        fields = "__all__"


class TaxReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxReport
        fields = "__all__"