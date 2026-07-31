from rest_framework import serializers
from .models import (
    Tenant, TenantMembership, SubscriptionPlan, Subscription,
    Invoice, InvoiceItem, TenantUsage,
)


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = "__all__"


class TenantMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = TenantMembership
        fields = ["id", "tenant", "user", "user_email", "user_name", "role", "is_active_in_tenant", "joined_at"]

    def get_user_email(self, obj):
        return obj.user.email if obj.user_id else None

    def get_user_name(self, obj):
        return getattr(obj.user, "username", "") if obj.user_id else None


class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ["id", "name", "slug", "owner", "status", "is_active", "trial_ends_at", "created_at"]


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    class Meta:
        model = Subscription
        fields = "__all__"


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ["id", "description", "quantity", "unit_amount", "total"]


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    class Meta:
        model = Invoice
        fields = "__all__"


class TenantUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantUsage
        fields = ["id", "metric", "value", "captured_at"]


class CreateTenantSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    slug = serializers.SlugField(max_length=80)
    plan_slug = serializers.SlugField(max_length=80)


class SwitchTenantSerializer(serializers.Serializer):
    tenant_id = serializers.IntegerField()