from django.conf import settings
from django.db import models


class Module(models.Model):
    """A logical module/area the app exposes (pos, inventory, reports, hr, tax...)."""
    key = models.CharField(max_length=60, unique=True)     # "pos", "inventory", "reports"...
    label = models.CharField(max_length=120)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["label"]


class Permission(models.Model):
    """Atomic action on a module: pos.view, pos.refund, inventory.adjust..."""
    ACTION_VIEW = "view"
    ACTION_CREATE = "create"
    ACTION_UPDATE = "update"
    ACTION_DELETE = "delete"
    ACTION_REFUND = "refund"
    ACTION_VOID = "void"
    ACTION_DISCOUNT = "discount"
    ACTION_REPORT = "report"
    ACTION_MANAGE = "manage"
    ACTION_CHOICES = [(ACTION_VIEW, "View"), (ACTION_CREATE, "Create"), (ACTION_UPDATE, "Update"),
                      (ACTION_DELETE, "Delete"), (ACTION_REFUND, "Refund"), (ACTION_VOID, "Void"),
                      (ACTION_DISCOUNT, "Discount"), (ACTION_REPORT, "Report"), (ACTION_MANAGE, "Manage")]
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="permissions")
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("module", "action")]
        ordering = ["module__label", "action"]


class Role(models.Model):
    """Named role (Cashier, Supervisor, Manager, Accountant) with a permission set."""
    SYSTEM_ADMIN = "admin"
    key = models.CharField(max_length=60, unique=True)
    label = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    is_system = models.BooleanField(default=False)  # system roles can't be deleted
    permissions = models.ManyToManyField(Permission, blank=True, related_name="roles")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["label"]


class UserRole(models.Model):
    """Assignment of a role to a user (a user can hold multiple roles)."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_roles")
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="assignments")
    branch = models.ForeignKey('tenancy.Branch', null=True, blank=True, on_delete=models.CASCADE,
                               help_text="Scope the role to a branch; blank = all branches")
    is_active = models.BooleanField(default=True)
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
                                    related_name="role_assignments")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "role", "branch")]
        ordering = ["-created_at"]


class RoleTemplate(models.Model):
    """Pre-baked permission bundles that can be cloned into a Role."""
    key = models.CharField(max_length=60, unique=True)
    label = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    permission_keys = models.JSONField(default=list, help_text='List of "module.action" strings')
    created_at = models.DateTimeField(auto_now_add=True)


class PermissionOverride(models.Model):
    """Per-user allow/deny override on a single permission (wins over roles)."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="permission_overrides")
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    decision = models.CharField(max_length=10, choices=[("allow", "Allow"), ("deny", "Deny")])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "permission")]