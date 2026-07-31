from datetime import timedelta
from django.db import transaction
from django.db.models import Sum
from decimal import Decimal
from django.utils import timezone

from pos.models import Product, OrderItem, StockMovement, StockAdjustmentItem, StockAdjustment
from enterprise.models import WarehouseStock
from .models import (CycleCount, CycleCountLine, ReorderRule, ABCAnalysis, InventoryAgingSnapshot,
                     StockReservation)


@transaction.atomic
def reserve_stock(*, product, warehouse, quantity, reference="", reserved_by=None, expires_in_hours=24):
    expires = timezone.now() + timedelta(hours=expires_in_hours) if expires_in_hours else None
    return StockReservation.objects.create(
        product=product, warehouse=warehouse, quantity=quantity, reference=reference,
        reserved_by=reserved_by, expires_at=expires)


@transaction.atomic
def release_reservation(reservation_id):
    r = StockReservation.objects.get(pk=reservation_id)
    r.status = StockReservation.STATUS_RELEASED
    r.save(update_fields=["status"])
    return r


def available_stock(product, warehouse=None):
    """On-hand minus active reservations."""
    on_hand = Decimal(product.stock_quantity or 0)
    if warehouse:
        ws = WarehouseStock.objects.filter(product=product, warehouse=warehouse).first()
        on_hand = ws.quantity if ws else Decimal("0")
    reserved = StockReservation.objects.filter(
        product=product, status=StockReservation.STATUS_ACTIVE,
    ).exclude(expires_at__lt=timezone.now()).aggregate(t=Sum("quantity"))["t"] or Decimal("0")
    return on_hand - reserved


@transaction.atomic
def run_cycle_count(count_id, counted_lines):
    """counted_lines: list of {product_id, counted_quantity, note}."""
    count = CycleCount.objects.get(pk=count_id)
    for line in counted_lines:
        product = Product.objects.get(pk=line["product_id"])
        ws = WarehouseStock.objects.filter(product=product, warehouse=count.warehouse).first()
        expected = ws.quantity if ws else Decimal(product.stock_quantity or 0)
        counted = Decimal(line.get("counted_quantity") or 0)
        CycleCountLine.objects.update_or_create(
            count=count, product=product,
            defaults={"expected_quantity": expected, "counted_quantity": counted,
                     "variance": counted - expected, "note": line.get("note", "")},
        )
    count.status = CycleCount.STATUS_RECONCILED
    count.completed_at = timezone.now()
    count.save(update_fields=["status", "completed_at"])


def compute_abc(window_days=365):
    """Recompute ABC classification from sale value over the window."""
    since = timezone.now() - timedelta(days=window_days)
    items = (OrderItem.objects.filter(order__created_at__gte=since)
             .values("product")
             .annotate(value=Sum("subtotal"))
             .order_by("-value"))
    total = sum((i["value"] or 0) for i in items) or Decimal("1")
    cumulative = Decimal("0")
    ABCAnalysis.objects.all().delete()
    for i in items:
        cumulative += Decimal(i["value"] or 0)
        share = cumulative / Decimal(total)
        cls = ABCAnalysis.CLASS_A if share <= Decimal("0.80") else (ABCAnalysis.CLASS_B if share <= Decimal("0.95") else ABCAnalysis.CLASS_C)
        ABCAnalysis.objects.create(product_id=i["product"], annual_value=i["value"] or 0,
                                    cumulative_share=share, abc_class=cls)


def compute_aging():
    """Bucket on-hand stock by days since last inward movement."""
    buckets = {"0-30": Decimal("0"), "31-60": Decimal("0"), "61-90": Decimal("0"), "90+": Decimal("0")}
    for p in Product.objects.filter(is_active=True):
        last_in = StockMovement.objects.filter(product=p, quantity__gt=0).order_by("-created_at").first()
        days = (timezone.now() - last_in.created_at).days if last_in else 999
        key = "0-30" if days <= 30 else "31-60" if days <= 60 else "61-90" if days <= 90 else "90+"
        buckets[key] += Decimal(p.stock_quantity or 0)
    InventoryAgingSnapshot.objects.all().delete()
    now = timezone.now()
    for bucket, qty in buckets.items():
        InventoryAgingSnapshot.objects.create(product=None, bucket=bucket, quantity=qty, captured_at=now)
    return buckets


def products_below_reorder():
    out = []
    for rule in ReorderRule.objects.filter(is_active=True):
        avail = available_stock(rule.product, rule.warehouse)
        if avail <= rule.reorder_point:
            out.append({"rule_id": rule.id, "product_id": rule.product_id,
                         "available": float(avail), "reorder_point": float(rule.reorder_point),
                         "target_stock": float(rule.target_stock),
                         "auto_po": rule.auto_generate_po})
    return out