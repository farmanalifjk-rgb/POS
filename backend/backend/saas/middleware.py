from .services import get_active_tenant_for_user


class TenantMiddleware:
    """Resolves the active tenant for the request and attaches it as request.tenant."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.tenant = None
        if getattr(request, "user", None) and request.user.is_authenticated:
            if request.user.is_superuser and "X-Tenant-ID" in request.headers:
                from .models import Tenant
                request.tenant = Tenant.objects.filter(pk=request.headers["X-Tenant-ID"]).first()
            else:
                request.tenant = get_active_tenant_for_user(request.user)
        return self.get_response(request)