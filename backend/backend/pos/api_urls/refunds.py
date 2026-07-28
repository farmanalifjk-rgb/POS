from django.urls import path
from ..views.refunds import *

urlpatterns = [
    path("refund/<int:order_id>/",RefundDetailView.as_view()),
    path("refund/process/",ProcessRefundView.as_view()),
    path("refund-history/<int:order_id>/",RefundHistoryView.as_view()),
    path("refund-receipt/<int:refund_id>/",RefundReceiptView.as_view()),
    path("refund-history/",RefundHistoryListView.as_view()),
    path("refund-history/detail/<int:refund_id>/",RefundDetailHistoryView.as_view()),
    path("refund-history/export/csv/",RefundHistoryCSVExportView.as_view()),
    path("refund-history/export/excel/",RefundHistoryExportExcelView.as_view(),),
    path("refund-history/export/pdf/",RefundHistoryExportPDFView.as_view(),),        
]