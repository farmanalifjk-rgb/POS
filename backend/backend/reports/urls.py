from django.urls import path
from .views import (SalesSummaryView, ProfitMarginView, TopProductsView, SalesByDayView,
                    SalesByCategoryView, SalesByPaymentMethodView, HourlySalesView, ZReportView)

urlpatterns = [
    path("sales-summary/", SalesSummaryView.as_view()),
    path("profit-margin/", ProfitMarginView.as_view()),
    path("top-products/", TopProductsView.as_view()),
    path("sales-by-day/", SalesByDayView.as_view()),
    path("sales-by-category/", SalesByCategoryView.as_view()),
    path("sales-by-payment/", SalesByPaymentMethodView.as_view()),
    path("hourly-sales/", HourlySalesView.as_view()),
    path("z-report/<int:session_id>/", ZReportView.as_view()),
]