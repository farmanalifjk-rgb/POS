from .recorder import record
from .models import AuditEvent


class AuditMiddleware:
    """Logs login/logout + attaches request to a thread-local for recorder use."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # record auth events by path
        path = request.path.rstrip("/")
        if path.endswith("/login") and request.method == "POST" and getattr(request.user, "id", None):
            record(actor=request.user, action=AuditEvent.ACTION_LOGIN, entity_type="User",
                   entity_id=str(request.user.id), entity_label=str(request.user),
                   request=request, summary=f"{request.user} logged in", icon="log-in")
        elif path.endswith("/logout") and request.method in ("POST", "GET"):
            record(actor=getattr(request, "_pre_logout_user", None), action=AuditEvent.ACTION_LOGOUT,
                   entity_type="User", request=request, summary="User logged out", icon="log-out")
        return response