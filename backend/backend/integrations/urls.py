from django.urls import path
from .views import (IntegrationListCreateView, IntegrationDetailView, SyncView,
                    SyncLogListView, SyncMappingListView, PushInvoiceView)

urlpatterns = [
    path("integrations/", IntegrationListCreateView.as_view()),
    path("integrations/<int:pk>/", IntegrationDetailView.as_view()),
    path("integrations/<int:integration_id>/sync/", SyncView.as_view()),
    path("integrations/<int:integration_id>/push-invoice/", PushInvoiceView.as_view()),
    path("logs/", SyncLogListView.as_view()),
    path("mappings/", SyncMappingListView.as_view()),
]