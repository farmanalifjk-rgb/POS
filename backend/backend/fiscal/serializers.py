from rest_framework import serializers
from .models import InvoiceSequence, FiscalInvoice, FiscalDevice, FiscalSubmission


class InvoiceSequenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceSequence
        fields = "__all__"


class FiscalInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FiscalInvoice
        fields = "__all__"


class FiscalDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FiscalDevice
        fields = "__all__"


class FiscalSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FiscalSubmission
        fields = "__all__"