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
    path("api/", include("pos.modules.enterprise.urls")),

    # ── Phase 3: New modules ──────────────────────────────────────────────────
    path("api/", include("pos.modules.accounting.urls")),
    path("api/", include("pos.modules.hr.urls")),
    path("api/", include("pos.modules.loyalty.urls")),
    path("api/", include("pos.modules.operations.urls")),
    path("api/", include("pos.modules.operations.urls")),


    # ── Phase 4: Apps ──────────────────────────────────────────────────
    path("saas/", include("pos.modules.saas.urls")),
    path("catalog/", include("pos.modules.catalog.urls")),
    path("pricing/", include("pos.modules.pricing.urls")),
    path("inventory2/", include("pos.modules.inventory2.urls")),
    path("pos2/", include("pos.modules.pos2.urls")),
    path("payments2/", include("pos.modules.payments2.urls")),
    path("customers2/", include("pos.modules.customers2.urls")),
    path("suppliers2/", include("pos.modules.suppliers2.urls")),
    path("transfers2/", include("pos.modules.transfers2.urls")),

]
