from django.urls import path
from .views import (
    PlanListView, TenantMeView, CreateTenantView, SwitchTenantView,
    TenantMembersView, SubscriptionCheckoutView, CancelSubscriptionView,
    InvoicesView, LimitCheckView, StripeWebhookView,
)

urlpatterns = [
    path("plans/", PlanListView.as_view()),
    path("tenant/", TenantMeView.as_view()),
    path("tenants/", CreateTenantView.as_view()),
    path("tenants/switch/", SwitchTenantView.as_view()),
    path("tenants/members/", TenantMembersView.as_view()),
    path("subscription/checkout/", SubscriptionCheckoutView.as_view()),
    path("subscription/cancel/", CancelSubscriptionView.as_view()),
    path("invoices/", InvoicesView.as_view()),
    path("limits/", LimitCheckView.as_view()),
    path("stripe/webhook/", StripeWebhookView.as_view()),
]