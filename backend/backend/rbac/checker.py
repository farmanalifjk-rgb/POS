from functools import wraps
from django.http import JsonResponse

from .models import UserRole, PermissionOverride, Permission,RoleTemplate


def user_permissions(user):
    """Resolve the effective permission keys for a user, honouring overrides."""
    if not user or not user.is_authenticated:
        return set()
    if user.is_superuser:
        return {"*.*"}  # superuser bypasses everything
    keys = set()
    for assignment in UserRole.objects.filter(user=user, is_active=True).select_related("role"):
        for p in assignment.role.permissions.all():
            keys.add(f"{p.module.key}.{p.action}")
    # overrides
    for ov in PermissionOverride.objects.filter(user=user).select_related("permission__module"):
        key = f"{ov.permission.module.key}.{ov.permission.action}"
        if ov.decision == "allow":
            keys.add(key)
        else:
            keys.discard(key)
    return keys


def has_permission(user, module_key, action):
    keys = user_permissions(user)
    return "*.*" in keys or f"{module_key}.{action}" in keys


def require_permission(module_key, action):
    """Decorator for DRF / Django views: `@require_permission("pos", "refund")`."""
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            if not has_permission(request.user, module_key, action):
                return JsonResponse({"detail": f"Permission denied: {module_key}.{action}"}, status=403)
            return view_func(request, *args, **kwargs)
        return _wrapped
    return decorator


def apply_template_to_role(role, template):
    """Copy a RoleTemplate's permission_keys into a Role."""
    added = []
    for key in template.permission_keys:
        if "." not in key:
            continue
        module_key, action = key.split(".", 1)
        p = Permission.objects.filter(module__key=module_key, action=action).first()
        if p:
            role.permissions.add(p)
            added.append(key)
    return added


def seed_modules_and_permissions():
    """Idempotent seed of common modules + their permissions."""
    from .models import Module
    modules = {
        "pos": ["view", "create", "update", "refund", "void", "discount"],
        "inventory": ["view", "create", "update", "delete", "manage"],
        "products": ["view", "create", "update", "delete"],
        "customers": ["view", "create", "update", "delete"],
        "suppliers": ["view", "create", "update"],
        "reports": ["view", "report"],
        "tax": ["view", "manage", "report"],
        "hr": ["view", "create", "update", "manage"],
        "fiscal": ["view", "create", "manage"],
        "audit": ["view"],
        "settings": ["view", "manage"],
    }
    for mk, actions in modules.items():
        mod, _ = Module.objects.get_or_create(key=mk, defaults={"label": mk.title()})
        for a in actions:
            Permission.objects.get_or_create(module=mod, action=a)
    # seed role templates
    templates = {
        "cashier": ["pos.view", "pos.create", "customers.view", "customers.create", "products.view"],
        "supervisor": ["pos.view", "pos.create", "pos.update", "pos.refund", "pos.void", "pos.discount",
                       "customers.view", "customers.create", "customers.update", "inventory.view",
                       "reports.view", "hr.view"],
        "manager": ["*.*"],
        "accountant": ["reports.view", "reports.report", "tax.view", "tax.report", "fiscal.view", "audit.view"],
    }
    for key, perms in templates.items():
        RoleTemplate.objects.update_or_create(key=key, defaults={"label": key.title(),
                                                                 "permission_keys": perms})