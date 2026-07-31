from rest_framework import serializers
from .models import Integration, SyncLog, SyncMapping


class IntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Integration
        fields = "__all__"


class SyncLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyncLog
        fields = "__all__"


class SyncMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyncMapping
        fields = "__all__"