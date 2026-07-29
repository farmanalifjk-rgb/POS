from django.urls import path
from .views import (
    CustomerAddressListCreateView, CustomerAddressDetailView,
    CreditLimitView, ConsumeCreditView, ReleaseCreditView,
    CustomerDocumentListCreateView, LoyaltyTimelineView, EarnLoyaltyView, BurnLoyaltyView,
    CustomerNoteListCreateView, PortalTokenView,
)

urlpatterns = [
    path("customers/<int:customer_id>/addresses/", CustomerAddressListCreateView.as_view()),
    path("addresses/<int:pk>/", CustomerAddressDetailView.as_view()),
    path("customers/<int:customer_id>/credit-limit/", CreditLimitView.as_view()),
    path("customers/<int:customer_id>/credit-limit/consume/", ConsumeCreditView.as_view()),
    path("customers/<int:customer_id>/credit-limit/release/", ReleaseCreditView.as_view()),
    path("customers/<int:customer_id>/documents/", CustomerDocumentListCreateView.as_view()),
    path("customers/<int:customer_id>/loyalty/", LoyaltyTimelineView.as_view()),
    path("customers/<int:customer_id>/loyalty/earn/", EarnLoyaltyView.as_view()),
    path("customers/<int:customer_id>/loyalty/burn/", BurnLoyaltyView.as_view()),
    path("customers/<int:customer_id>/notes/", CustomerNoteListCreateView.as_view()),
    path("customers/<int:customer_id>/portal-token/", PortalTokenView.as_view()),
]