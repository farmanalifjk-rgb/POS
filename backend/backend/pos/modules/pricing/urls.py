from django.urls import path
from .views import (
    PriceListListCreateView, PriceListDetailView, PriceListItemListCreateView,
    CustomerGroupPriceListCreateView, VolumeTierListCreateView,
    TimeBasedPriceListCreateView, BuyXGetYListCreateView, ResolvePriceView,
)

urlpatterns = [
    path("price-lists/", PriceListListCreateView.as_view()),
    path("price-lists/<int:pk>/", PriceListDetailView.as_view()),
    path("price-lists/<int:price_list_id>/items/", PriceListItemListCreateView.as_view()),
    path("group-prices/", CustomerGroupPriceListCreateView.as_view()),
    path("volume-tiers/", VolumeTierListCreateView.as_view()),
    path("time-prices/", TimeBasedPriceListCreateView.as_view()),
    path("buyx-gety/", BuyXGetYListCreateView.as_view()),
    path("resolve/", ResolvePriceView.as_view()),
]