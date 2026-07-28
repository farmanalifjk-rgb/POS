from django.urls import path
from ..views.purchases import *

urlpatterns = [
    path("inventory/suppliers/",SupplierListCreateView.as_view(),),
    path("inventory/suppliers/<int:pk>/",SupplierDetailView.as_view(),),
    path("inventory/purchase-order/<int:pk>/",PurchaseOrderCreateView.as_view(),),
    path("inventory/purchase-orders/<str:order_number>/receive/",ReceivePurchaseView.as_view(),name="receive-purchase",),
    path("inventory/purchase-orders/",PurchaseOrderListView.as_view(),),
    path("inventory/purchase-orders/<str:order_number>/",PurchaseOrderDetailView.as_view(),),
    path("inventory/purchase-orders/<str:order_number>/cancel/",CancelPurchaseOrderView.as_view(),name="cancel-purchase-order",),
    path("inventory/purchase-orders/<str:order_number>/return/",PurchaseReturnView.as_view(),name="purchase-return",),
    path("inventory/purchase-returns/",PurchaseReturnListView.as_view(),),
    path("inventory/purchase-returns/<int:pk>/", PurchaseReturnDetailView.as_view(),),
    path("inventory/purchase-returns/dashboard/",PurchaseReturnDashboardView.as_view(),),                  
]