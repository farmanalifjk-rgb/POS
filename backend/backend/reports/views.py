from datetime import datetime, timedelta
from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .services import (sales_summary, profit_margin, top_products, sales_by_day,
                       sales_by_category, sales_by_payment_method, z_report, hourly_sales)


def _parse(req, default_days=7):
    end = datetime.utcnow()
    start = end - timedelta(days=default_days)
    if req.get("start"):
        start = datetime.fromisoformat(req["start"])
    if req.get("end"):
        end = datetime.fromisoformat(req["end"])
    return start, end


class SalesSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        s, e = _parse(request.query_params)
        return Response(sales_summary(s, e))


class ProfitMarginView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        s, e = _parse(request.query_params)
        return Response(profit_margin(s, e))


class TopProductsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        s, e = _parse(request.query_params)
        limit = int(request.query_params.get("limit", 10))
        return Response(top_products(s, e, limit))


class SalesByDayView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        s, e = _parse(request.query_params)
        return Response(sales_by_day(s, e))


class SalesByCategoryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        s, e = _parse(request.query_params)
        return Response(sales_by_category(s, e))


class SalesByPaymentMethodView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        s, e = _parse(request.query_params)
        return Response(sales_by_payment_method(s, e))


class HourlySalesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        s, e = _parse(request.query_params)
        return Response(hourly_sales(s, e))


class ZReportView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, session_id):
        return Response(z_report(session_id))