from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from pos.models import Product, StockMovement
from enterprise.models import Warehouse, WarehouseStock
from .models import StockTransfer, StockTransferItem, PutAwayRule, PutAwayTask, BinReplenishmentTask


def _next_number(prefix, model):
    last = model.objects.order_by("-id").first()
    n = (last.id + 1) if last else 1
    return f"{prefix}-{n:06d}"


def _ws(warehouse, product):
    ws, _ = WarehouseStock.objects.get_or_create(warehouse=warehouse, product=product)
    return ws


@transaction.atomic
def create_transfer(*, source, destination, lines, note="", user=None):
    """lines: list of {product_id, quantity}."""
    transfer = StockTransfer.objects.create(transfer_number=_next_number("TR", StockTransfer),
                                            source_warehouse=source, destination_warehouse=destination,
                                            note=note, created_by=user)
    for ln in lines:
        product = Product.objects.get(pk=ln["product_id"])
        qty = Decimal(ln["quantity"])
        src_ws = _ws(source, product)
        if src_ws.quantity < qty:
            raise ValueError(f"Insufficient stock in source for {product.name}")
        src_ws.quantity -= qty
        src_ws.save(update_fields=["quantity"])
        StockTransferItem.objects.create(transfer=transfer, product=product, quantity=qty)
    transfer.status = StockTransfer.STATUS_IN_TRANSIT
    transfer.shipped_at = timezone.now()
    transfer.save(update_fields=["status", "shipped_at"])
    return transfer


@transaction.atomic
def receive_transfer(transfer_id, received_lines=None):
    """received_lines: optional list of {item_id, received_quantity} for partials."""
    transfer = StockTransfer.objects.get(pk=transfer_id)
    items = transfer.items.all()
    for item in items:
        recv = Decimal(item.quantity)
        if received_lines:
            match = next((r for r in received_lines if r["item_id"] == item.id), None)
            if match:
                recv = Decimal(match["received_quantity"])
        dst_ws = _ws(transfer.destination_warehouse, item.product)
        dst_ws.quantity += recv
        dst_ws.save(update_fields=["quantity"])
        item.received_quantity = recv
        item.save(update_fields=["received_quantity"])
        StockMovement.objects.create(product=item.product, reference=transfer.transfer_number,
                                      quantity=int(recv), movement_type="adjustment",
                                      note=f"Transfer in from {transfer.source_warehouse_id}")
    transfer.status = StockTransfer.STATUS_RECEIVED
    transfer.received_at = timezone.now()
    transfer.save(update_fields=["status", "received_at"])
    return transfer


def suggest_putaway(warehouse, product, quantity, reference=""):
    """Pick a bin using active PutAwayRules (fixed → category → ABC)."""
    rule = (PutAwayRule.objects.filter(warehouse=warehouse, is_active=True, category=product.category).first()
            if product.category else None)
    if not rule:
        rule = PutAwayRule.objects.filter(warehouse=warehouse, is_active=True, strategy=PutAwayRule.STRATEGY_FIXED).first()
    target = rule.target_bin if rule else None
    return PutAwayTask.objects.create(warehouse=warehouse, product=product, quantity=quantity,
                                       suggested_bin=target, reference=reference)


def generate_replenishment_tasks(warehouse, low_threshold=Decimal("5")):
    """Create replenishment tasks for pick-face bins below threshold."""
    from inventory.models import BinLocation
    tasks = []
    for bin_loc in BinLocation.objects.filter(warehouse=warehouse, is_active=True):
        # assume bin carries stock via WarehouseStock keyed loosely; here we generate by product min_stock
        for p in Product.objects.filter(is_active=True, min_stock__gt=0):
            ws = WarehouseStock.objects.filter(warehouse=warehouse, product=p).first()
            if ws and ws.quantity <= low_threshold:
                t = BinReplenishmentTask.objects.create(warehouse=warehouse, product=p, to_bin=bin_loc,
                                                        quantity=Decimal(p.min_stock) * 2)
                tasks.append(t.id)
    return tasks
