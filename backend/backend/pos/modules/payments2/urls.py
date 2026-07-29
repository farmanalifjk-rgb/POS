from django.urls import path
from .views import (
    GiftCardListCreateView, GiftCardDetailView, GiftCardTopupView, GiftCardRedeemView,
    StoreCreditDetailView, StoreCreditIssueView, SettleOrderView, TenderedPaymentListView,
    ReconcileSessionView, RefundCreditNoteView,
)

urlpatterns = [
    path("gift-cards/", GiftCardListCreateView.as_view()),
    path("gift-cards/<int:pk>/", GiftCardDetailView.as_view()),
    path("gift-cards/<int:pk>/topup/", GiftCardTopupView.as_view()),
    path("gift-cards/redeem/", GiftCardRedeemView.as_view()),
    path("store-credit/<int:customer_id>/", StoreCreditDetailView.as_view()),
    path("store-credit/<int:customer_id>/issue/", StoreCreditIssueView.as_view()),
    path("orders/<int:order_id>/settle/", SettleOrderView.as_view()),
    path("tenders/", TenderedPaymentListView.as_view()),
    path("sessions/<int:session_id>/reconcile/", ReconcileSessionView.as_view()),
    path("refunds/<int:refund_id>/credit-note/", RefundCreditNoteView.as_view()),
]