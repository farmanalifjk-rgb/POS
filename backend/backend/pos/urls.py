from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.products import *
from .views.categories import *
from .views.customers import *
from .views.orders import *

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path("api/", include("pos.api_urls.auth")),
    path("api/", include("pos.api_urls.orders")),
    path("api/", include("pos.api_urls.drafts")),
    path("api/", include("pos.api_urls.refunds")),
    path("api/", include("pos.api_urls.inventory")),
    path("api/", include("pos.api_urls.purchases")),
    path("api/", include("pos.api_urls.company")),
    path("api/", include("pos.api_urls.products")),
    path("api/", include("pos.api_urls.cash_session")),
    path("api/", include("pos.api_urls.customers")),
    path("api/", include("pos.api_urls.products_management")),
    path("api/", include("pos.api_urls.reports")),
    path("api/", include("pos.api_urls.configuration")),
    path("api/", include("pos.api_urls.settings_extra")),
    path("api/", include("pos.api_urls.auth_secure")),
    path("api/", include("enterprise.urls")),

    # ── Phase 3: New modules ──────────────────────────────────────────────────
    path("api/", include("accounting.urls")),
    path("api/", include("hr.urls")),
    path("api/", include("loyalty.urls")),
    path("api/", include("operations.urls")),
    path("api/", include("operations.urls")),


    # ── Phase 4: Apps ──────────────────────────────────────────────────
    path("api/saas/", include("saas.urls")),
    path("api/catalog/", include("catalog.urls")),
    path("api/pricing/", include("pricing.urls")),
    path("api/inventory2/", include("inventory.urls")),
    path("api/pos2/", include("pos_core.urls")),
    path("api/payments2/", include("payments.urls")),
    path("api/customers2/", include("customers.urls")),
    path("api/suppliers2/", include("suppliers.urls")),
    path("api/transfers2/", include("transfers.urls")),
    path("api/reports2/", include("reports.urls")),
    path("api/tax2/", include("tax.urls")),
    path("api/fiscal2/", include("fiscal.urls")),
    path("api/hr2/", include("hr.urls")),
    path("api/notifications2/", include("notifications.urls")),
    path("api/audit2/", include("audit.urls")),
    path("api/rbac2/", include("rbac.urls")),
    path("api/tenancy2/", include("tenancy.urls")),
    path("api/i18n2/", include("i18n_app.urls")),
    path("api/integrations2/", include("integrations.urls")),
    path("api/ai2/", include("ai.urls")),
]
