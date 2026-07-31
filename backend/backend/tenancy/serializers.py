from rest_framework import serializers
from .models import Tenant, Branch, UserTenantMembership, TenantSetting, BranchSetting


class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = "__all__"


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = "__all__"


class UserTenantMembershipSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    tenant_name = serializers.CharField(source="tenant.name", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    class Meta:
        model = UserTenantMembership
        fields = "__all__"


class TenantSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantSetting
        fields = "__all__"


class BranchSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BranchSetting
        fields = "__all__"