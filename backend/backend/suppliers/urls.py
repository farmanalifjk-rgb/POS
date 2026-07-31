from django.urls import path
from .views import (
    SupplierContactListCreateView, CreateReceiptView, ReceiptListView,
    CreatePurchaseReturnView, PurchaseReturnListView, SupplierPortalTokenView,
)

urlpatterns = [
    path("suppliers/<int:supplier_id>/contacts/", SupplierContactListCreateView.as_view()),
    path("purchase-orders/<int:po_id>/receipts/", CreateReceiptView.as_view()),
    path("receipts/", ReceiptListView.as_view()),
    path("purchase-orders/<int:po_id>/returns/", CreatePurchaseReturnView.as_view()),
    path("purchase-returns/", PurchaseReturnListView.as_view()),
    path("suppliers/<int:supplier_id>/portal-token/", SupplierPortalTokenView.as_view()),
]