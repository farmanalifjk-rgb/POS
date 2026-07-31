from rest_framework import serializers
from .models import AlertRule, Notification, NotificationDigest


class AlertRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertRule
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


class NotificationDigestSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationDigest
        fields = "__all__"