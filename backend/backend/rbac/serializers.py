from rest_framework import serializers
from .models import Module, Permission, Role, UserRole, RoleTemplate, PermissionOverride


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = "__all__"


class PermissionSerializer(serializers.ModelSerializer):
    module_key = serializers.CharField(source="module.key", read_only=True)
    class Meta:
        model = Permission
        fields = "__all__"


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Permission.objects.all(), source="permissions", required=False)
    class Meta:
        model = Role
        fields = "__all__"


class UserRoleSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    role_label = serializers.CharField(source="role.label", read_only=True)
    class Meta:
        model = UserRole
        fields = "__all__"


class RoleTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleTemplate
        fields = "__all__"


class PermissionOverrideSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermissionOverride
        fields = "__all__"