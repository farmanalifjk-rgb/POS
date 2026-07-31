from rest_framework import serializers
from .models import AuditEvent, ActivityFeed


class AuditEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditEvent
        fields = "__all__"


class ActivityFeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityFeed
        fields = "__all__"