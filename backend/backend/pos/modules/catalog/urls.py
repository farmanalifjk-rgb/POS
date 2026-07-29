from django.urls import path
from .views import (
    ProductVariantListCreateView, ProductVariantDetailView,
    ProductBundleListCreateView, ProductBundleDetailView,
    SerialListCreateView, SerialDetailView, ValidateSerialView,
    BatchListCreateView, BatchDetailView, BatchRecallView, FefoAllocateView,
    ProductMediaListCreateView,
)

urlpatterns = [
    path("products/<int:product_id>/variants/", ProductVariantListCreateView.as_view()),
    path("variants/<int:pk>/", ProductVariantDetailView.as_view()),
    path("bundles/", ProductBundleListCreateView.as_view()),
    path("bundles/<int:pk>/", ProductBundleDetailView.as_view()),
    path("serials/", SerialListCreateView.as_view()),
    path("serials/<int:pk>/", SerialDetailView.as_view()),
    path("serials/validate/", ValidateSerialView.as_view()),
    path("batches/", BatchListCreateView.as_view()),
    path("batches/<int:pk>/", BatchDetailView.as_view()),
    path("batches/<int:pk>/recall/", BatchRecallView.as_view()),
    path("batches/fefo-allocate/", FefoAllocateView.as_view()),
    path("products/<int:product_id>/media/", ProductMediaListCreateView.as_view()),
]