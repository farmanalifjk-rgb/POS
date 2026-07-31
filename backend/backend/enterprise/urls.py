from django.urls import path

from enterprise.views import (
    WarehouseListCreateView, WarehouseStockListView, WarehouseTransferListCreateView,
    WarehouseTransferReceiveView,
)

urlpatterns = [
    path("enterprise/warehouses/", WarehouseListCreateView.as_view()),
    path("enterprise/warehouses/<int:warehouse_id>/stock/", WarehouseStockListView.as_view()),
    path("enterprise/transfers/", WarehouseTransferListCreateView.as_view()),
    path("enterprise/transfers/<int:transfer_id>/receive/", WarehouseTransferReceiveView.as_view()),
]


