from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Tenant, TenantMembership, SubscriptionPlan, Subscription,
    Invoice, TenantUsage,
)
from .serializers import (
    TenantSerializer, TenantMembershipSerializer, SubscriptionPlanSerializer,
    SubscriptionSerializer, InvoiceSerializer, CreateTenantSerializer,
    SwitchTenantSerializer,
)
from .services import (
    provision_tenant, get_active_tenant_for_user, switch_active_tenant,
    capture_usage, enforce_limit, create_checkout_session, handle_stripe_webhook,
    LimitExceeded,
)


def _ensure_membership(user, tenant, min_role=None):
    m = TenantMembership.objects.filter(user=user, tenant=tenant).first()
    if not m and not user.is_superuser:
        return None
    return m


class PlanListView(generics.ListAPIView):
    """Public: list active, public subscription plans."""
    permission_classes = [AllowAny]
    serializer_class = SubscriptionPlanSerializer

    def get_queryset(self):
        return SubscriptionPlan.objects.filter(is_active=True, is_public=True)


class TenantMeView(APIView):
    """Current tenant + subscription + usage for the logged-in user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = get_active_tenant_for_user(request.user)
        if not tenant:
            return Response({"detail": "No active tenant."}, status=404)
        usage = capture_usage(tenant)
        sub = getattr(tenant, "subscription", None)
        return Response({
            "tenant": TenantSerializer(tenant).data,
            "subscription": SubscriptionSerializer(sub).data if sub else None,
            "usage": usage,
        })


class CreateTenantView(APIView):
    """Self-service tenant provisioning (sign-up)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = CreateTenantSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        if Tenant.objects.filter(slug=d["slug"]).exists():
            return Response({"detail": "Slug already taken."}, status=400)
        tenant = provision_tenant(name=d["name"], slug=d["slug"],
                                  owner=request.user, plan_slug=d["plan_slug"])
        return Response(TenantSerializer(tenant).data, status=201)


class SwitchTenantView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = SwitchTenantSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        tenant = switch_active_tenant(request.user, ser.validated_data["tenant_id"])
        return Response(TenantSerializer(tenant).data)


class TenantMembersView(generics.ListCreateAPIView):
    serializer_class = TenantMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tenant = get_active_tenant_for_user(self.request.user)
        if not tenant:
            return TenantMembership.objects.none()
        return TenantMembership.objects.filter(tenant=tenant)


class SubscriptionCheckoutView(APIView):
    """Start a Stripe Checkout session to subscribe/upgrade the current plan."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tenant = get_active_tenant_for_user(request.user)
        if not tenant:
            return Response({"detail": "No active tenant."}, status=404)
        plan_slug = request.data.get("plan_slug")
        plan = SubscriptionPlan.objects.get(slug=plan_slug, is_active=True)
        success = request.data.get("success_url", request.build_absolute_uri("/#/subscription?status=ok"))
        cancel = request.data.get("cancel_url", request.build_absolute_uri("/#subscription?status=cancel"))
        url = create_checkout_session(tenant, plan, success, cancel)
        return Response({"checkout_url": url})


class CancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tenant = get_active_tenant_for_user(request.user)
        if not tenant or not getattr(tenant, "subscription", None):
            return Response({"detail": "No subscription."}, status=404)
        sub = tenant.subscription
        sub.cancel_at_period_end = True
        sub.save(update_fields=["cancel_at_period_end"])
        return Response(SubscriptionSerializer(sub).data)


class InvoicesView(generics.ListAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tenant = get_active_tenant_for_user(self.request.user)
        if not tenant:
            return Invoice.objects.none()
        return Invoice.objects.filter(tenant=tenant)


class LimitCheckView(APIView):
    """Internal-ish endpoint used by create forms to pre-validate plan limits."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        metric = request.query_params.get("metric")
        tenant = get_active_tenant_for_user(request.user)
        if not tenant:
            return Response({"allowed": True})
        try:
            enforce_limit(tenant, metric)
            return Response({"allowed": True})
        except LimitExceeded as e:
            return Response({"allowed": False, "limit": e.limit, "current": e.current}, status=402)


@permission_classes([AllowAny])
class StripeWebhookView(APIView):
    """Receives Stripe events. Expects the raw signed payload forwarded by urls.py."""
    def post(self, request):
        import stripe
        from django.conf import settings
        payload = request.body
        sig = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        try:
            event = stripe.Webhook.construct_event(
                payload, sig, settings.STRIPE_WEBHOOK_SECRET
            ) if settings.STRIPE_WEBHOOK_SECRET else None
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response({"detail": "Invalid signature"}, status=400)
        if event is None:
            event = request.data  # fallback when signature verification is disabled
        return Response(handle_stripe_webhook(event))