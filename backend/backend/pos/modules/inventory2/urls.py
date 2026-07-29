from django.urls import path
from .views import (
    BinLocationListCreateView, StockReservationListCreateView, ReleaseReservationView,
    AvailableStockView, CycleCountListCreateView, CycleCountDetailView, RunCycleCountView,
    ReorderRuleListCreateView, ABCView, AgingView, ReorderAlertsView,
)

urlpatterns = [
    path("bins/", BinLocationListCreateView.as_view()),
    path("reservations/", StockReservationListCreateView.as_view()),
    path("reservations/<int:pk>/release/", ReleaseReservationView.as_view()),
    path("available/", AvailableStockView.as_view()),
    path("cycle-counts/", CycleCountListCreateView.as_view()),
    path("cycle-counts/<int:pk>/", CycleCountDetailView.as_view()),
    path("cycle-counts/<int:pk>/run/", RunCycleCountView.as_view()),
    path("reorder-rules/", ReorderRuleListCreateView.as_view()),
    path("abc/", ABCView.as_view()),
    path("aging/", AgingView.as_view()),
    path("reorder-alerts/", ReorderAlertsView.as_view()),
]