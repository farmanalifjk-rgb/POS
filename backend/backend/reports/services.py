from decimal import Decimal
from datetime import timedelta
from django.db.models import Sum, Count, F, Q, DecimalField
from django.db.models.functions import Coalesce, TruncDate
from django.utils import timezone

from pos.models import Order, OrderItem, Product, Payment, Refund, CashSession


def _range(start, end):
    return (timezone.make_aware(start) if timezone.is_naive(start) else start,
            timezone.make_aware(end) if timezone.is_naive(end) else end)


def sales_summary(start, end):
    s, e = _range(start, end)
    orders = Order.objects.filter(created_at__gte=s, created_at__lt=e, status__in=["paid", "partially_refunded"])
    refunds = Refund.objects.filter(created_at__gte=s, created_at__lt=e)
    gross = orders.aggregate(t=Coalesce(Sum("total"), Decimal("0"), output_field=DecimalField()))["t"]
    discount = orders.aggregate(t=Coalesce(Sum("discount"), Decimal("0"), output_field=DecimalField()))["t"]
    tax = orders.aggregate(t=Coalesce(Sum("tax"), Decimal("0"), output_field=DecimalField()))["t"]
    refunded = refunds.aggregate(t=Coalesce(Sum("total_amount"), Decimal("0"), output_field=DecimalField()))["t"]
    net = gross - refunded
    count = orders.count()
    avg = net / count if count else Decimal("0")
    return {
        "gross_sales": str(gross),
        "discount": str(discount),
        "tax_collected": str(tax),
        "refunded": str(refunded),
        "net_sales": str(net),
        "order_count": count,
        "average_order": str(round(avg, 2)),
        "refund_count": refunds.count(),
    }


def profit_margin(start, end):
    s, e = _range(start, end)
    items = OrderItem.objects.filter(order__created_at__gte=s, order__created_at__lt=e,
                                     order__status__in=["paid", "partially_refunded"])
    revenue = Decimal("0")
    cost = Decimal("0")
    for it in items:
        line_rev = Decimal(it.subtotal)
        line_cost = Decimal(it.product.cost_price) * Decimal(it.quantity)
        revenue += line_rev
        cost += line_cost
    gross_profit = revenue - cost
    margin = (gross_profit / revenue * Decimal("100")) if revenue > 0 else Decimal("0")
    return {
        "revenue": str(revenue),
        "cost_of_goods": str(cost),
        "gross_profit": str(gross_profit),
        "margin_percent": str(round(margin, 2)),
    }


def top_products(start, end, limit=10):
    s, e = _range(start, end)
    qs = (OrderItem.objects
          .filter(order__created_at__gte=s, order__created_at__lt=e, order__status__in=["paid", "partially_refunded"])
          .values("product_id", "product__name", "product__sku")
          .annotate(qty_sold=Sum("quantity"), revenue=Sum("subtotal"))
          .order_by("-revenue")[:limit])
    return [{"product_id": r["product_id"], "name": r["product__name"], "sku": r["product__sku"],
             "qty_sold": str(r["qty_sold"]), "revenue": str(r["revenue"])} for r in qs]


def sales_by_day(start, end):
    s, e = _range(start, end)
    qs = (Order.objects.filter(created_at__gte=s, created_at__lt=e, status__in=["paid", "partially_refunded"])
          .annotate(day=TruncDate("created_at"))
          .values("day")
          .annotate(total=Sum("total"), count=Count("id"))
          .order_by("day"))
    return [{"date": str(r["day"]), "total": str(r["total"]), "count": r["count"]} for r in qs]


def sales_by_category(start, end):
    s, e = _range(start, end)
    qs = (OrderItem.objects.filter(order__created_at__gte=s, order__created_at__lt=e,
                                   order__status__in=["paid", "partially_refunded"])
          .values("product__category__name")
          .annotate(revenue=Sum("subtotal"), qty=Sum("quantity"))
          .order_by("-revenue"))
    return [{"category": r["product__category__name"] or "Uncategorised",
             "revenue": str(r["revenue"]), "qty": str(r["qty"])} for r in qs]


def sales_by_payment_method(start, end):
    s, e = _range(start, end)
    qs = (Payment.objects.filter(paid_at__gte=s, paid_at__lt=e)
          .values("payment_method")
          .annotate(total=Sum("amount"), count=Count("id"))
          .order_by("-total"))
    return [{"method": r["payment_method"], "total": str(r["total"]), "count": r["count"]} for r in qs]


def z_report(session_id):
    """End-of-day z-report for a cash session."""
    session = CashSession.objects.get(pk=session_id)
    orders = Order.objects.filter(session=session, status__in=["paid", "partially_refunded"])
    refunds = Refund.objects.filter(order__session=session)
    total = orders.aggregate(t=Coalesce(Sum("total"), Decimal("0"), output_field=DecimalField()))["t"]
    tax = orders.aggregate(t=Coalesce(Sum("tax"), Decimal("0"), output_field=DecimalField()))["t"]
    by_method = (Payment.objects.filter(order__session=session)
                 .values("payment_method").annotate(total=Sum("amount")).order_by("-total"))
    return {
        "session_id": session.id,
        "opened_at": session.opened_at.isoformat(),
        "closed_at": session.closed_at.isoformat() if session.closed_at else None,
        "opening_balance": str(session.opening_balance),
        "gross_total": str(total),
        "tax_total": str(tax),
        "refund_total": str(refunds.aggregate(t=Coalesce(Sum("total_amount"), Decimal("0"), output_field=DecimalField()))["t"]),
        "by_method": [{"method": m["payment_method"], "total": str(m["total"])} for m in by_method],
        "expected_closing": str(Decimal(session.opening_balance) + total),
        "actual_closing": str(session.actual_closing_balance) if session.actual_closing_balance else None,
    }


def hourly_sales(start, end):
    """Sales bucketed by hour of day — for heatmap charts."""
    s, e = _range(start, end)
    out = {h: Decimal("0") for h in range(24)}
    for o in Order.objects.filter(created_at__gte=s, created_at__lt=e, status__in=["paid", "partially_refunded"]):
        out[o.created_at.hour] += Decimal(o.total)
    return [{"hour": h, "total": str(v)} for h, v in out.items()]