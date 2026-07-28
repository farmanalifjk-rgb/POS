from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from pos.models import WarehouseStock, WarehouseTransfer, WarehouseTransferItem
from uuid import uuid4


@transaction.atomic
def receive_transfer(*, transfer: WarehouseTransfer, quantities: dict[int, Decimal], user=None):
    """Receive a transfer once, atomically, and update destination stock.

    Source stock is deducted when the transfer is sent. This function only
    receives quantities that have actually arrived, allowing partial delivery.
    """
    transfer = WarehouseTransfer.objects.select_for_update().get(pk=transfer.pk)
    if transfer.status not in {WarehouseTransfer.STATUS_DRAFT, WarehouseTransfer.STATUS_IN_TRANSIT}:
        raise ValidationError("Only a draft or in-transit transfer can be received.")

    items = list(transfer.items.select_for_update().select_related("product"))
    for item in items:
        quantity = Decimal(str(quantities.get(item.id, 0)))
        remaining = item.quantity - item.received_quantity
        if quantity < 0 or quantity > remaining:
            raise ValidationError({"items": f"Invalid received quantity for {item.product.name}."})
        if not quantity:
            continue
        stock, _ = WarehouseStock.objects.select_for_update().get_or_create(
            warehouse=transfer.destination_warehouse,
            product=item.product,
            defaults={"quantity": Decimal("0.00")},
        )
        stock.quantity += quantity
        stock.save(update_fields=["quantity", "updated_at"])
        item.received_quantity += quantity
        item.save(update_fields=["received_quantity"])

    if all(item.received_quantity == item.quantity for item in items):
        transfer.status = WarehouseTransfer.STATUS_RECEIVED
        transfer.received_at = timezone.now()
        transfer.received_by = user
    else:
        transfer.status = WarehouseTransfer.STATUS_IN_TRANSIT
    transfer.save(update_fields=["status", "received_at", "received_by"])
    return transfer


@transaction.atomic
def dispatch_transfer(*, source_warehouse, destination_warehouse, items, note="", user=None):
    if source_warehouse.pk == destination_warehouse.pk:
        raise ValidationError("Source and destination warehouses must be different.")
    transfer = WarehouseTransfer.objects.create(
        transfer_number=f"WT-{uuid4().hex[:10].upper()}",
        source_warehouse=source_warehouse,
        destination_warehouse=destination_warehouse,
        status=WarehouseTransfer.STATUS_IN_TRANSIT,
        note=note,
        requested_by=user if getattr(user, "is_authenticated", False) else None,
    )
    for row in items:
        quantity = Decimal(str(row["quantity"]))
        if quantity <= 0:
            raise ValidationError("Transfer quantities must be greater than zero.")
        try:
            source_stock = WarehouseStock.objects.select_for_update().get(
                warehouse=source_warehouse, product_id=row["product_id"]
            )
        except WarehouseStock.DoesNotExist:
            raise ValidationError({"items": f"Product {row['product_id']} has no stock in the source warehouse."})
        if source_stock.quantity < quantity:
            raise ValidationError({"items": f"Insufficient source stock for product {row['product_id']}."})
        source_stock.quantity -= quantity
        source_stock.save(update_fields=["quantity", "updated_at"])
        WarehouseTransferItem.objects.create(transfer=transfer, product_id=row["product_id"], quantity=quantity)
    return transfer
