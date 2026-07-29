import secrets
from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from pos.models import Product, StockMovement, PurchaseOrder, PurchaseOrderItem
from .models import (GoodsReceipt, GoodsReceiptLine, PurchaseReturn, PurchaseReturnLine,
                     SupplierPortalToken)


def _next_number(prefix, model, field):
    last = model.objects.order_by("-id").first()
    n = (last.id + 1) if last else 1
    return f"{prefix}-{n:06d}"


@transaction.atomic
def create_receipt(*, purchase_order, supplier_invoice_number="", lines, user=None):
    """lines: list of {product_id, purchase_order_item_id, quantity_received,
                      quantity_rejected, rejection_reason, batch_number, expiry_date}."""
    receipt = GoodsReceipt.objects.create(purchase_order=purchase_order,
                                          receipt_number=_next_number("GRN", GoodsReceipt, "receipt_number"),
                                          supplier_invoice_number=supplier_invoice_number,
                                          received_by=user)
    for ln in lines:
        product = Product.objects.get(pk=ln["product_id"])
        poi = None
        if ln.get("purchase_order_item_id"):
            poi = PurchaseOrderItem.objects.get(pk=ln["purchase_order_item_id"])
        ordered = Decimal(poi.quantity) if poi else Decimal(ln.get("quantity_ordered", 0))
        recv = Decimal(ln["quantity_received"])
        rej = Decimal(ln.get("quantity_rejected", 0))
        accepted = recv - rej
        GoodsReceiptLine.objects.create(receipt=receipt, purchase_order_item=poi, product=product,
                                         quantity_ordered=ordered, quantity_received=recv,
                                         quantity_accepted=accepted, quantity_rejected=rej,
                                         rejection_reason=ln.get("rejection_reason", ""),
                                         batch_number=ln.get("batch_number", ""),
                                         expiry_date=ln.get("expiry_date"))
        # bump product stock + PO received qty
        product.stock_quantity = Decimal(product.stock_quantity or 0) + accepted
        product.save(update_fields=["stock_quantity"])
        if poi:
            poi.received_quantity = (poi.received_quantity or 0) + int(accepted)
            poi.save(update_fields=["received_quantity"])
        StockMovement.objects.create(product=product, reference=receipt.receipt_number,
                                      quantity=int(accepted), movement_type="purchase",
                                      previous_stock=product.stock_quantity - int(accepted),
                                      new_stock=product.stock_quantity)
    receipt.status = GoodsReceipt.STATUS_RECEIVED
    receipt.save(update_fields=["status"])
    # mark PO received if fully received
    if all((it.received_quantity or 0) >= it.quantity for it in purchase_order.items.all()):
        purchase_order.status = "received"
        purchase_order.save(update_fields=["status"])
    return receipt


@transaction.atomic
def create_purchase_return(*, purchase_order, lines, reason="", user=None):
    ret = PurchaseReturn.objects.create(purchase_order=purchase_order,
                                        return_number=_next_number("PR", PurchaseReturn, "return_number"),
                                        reason=reason, created_by=user)
    total = Decimal("0")
    for ln in lines:
        product = Product.objects.get(pk=ln["product_id"])
        qty = Decimal(ln["quantity"])
        unit = Decimal(ln["unit_cost"])
        PurchaseReturnLine.objects.create(purchase_return=ret, product=product,
                                          quantity=qty, unit_cost=unit, reason=ln.get("reason", ""))
        total += qty * unit
        product.stock_quantity = Decimal(product.stock_quantity or 0) - qty
        product.save(update_fields=["stock_quantity"])
        # update PO item returned qty
        poi = purchase_order.items.filter(product=product).first()
        if poi:
            poi.returned_quantity = (poi.returned_quantity or 0) + int(qty)
            poi.save(update_fields=["returned_quantity"])
        StockMovement.objects.create(product=product, reference=ret.return_number,
                                      quantity=-int(qty), movement_type="purchase_return",
                                      previous_stock=product.stock_quantity + int(qty),
                                      new_stock=product.stock_quantity)
    ret.total_amount = total
    ret.status = PurchaseReturn.STATUS_RETURNED
    ret.save(update_fields=["total_amount", "status"])
    return ret


def issue_supplier_portal_token(supplier):
    token, _ = SupplierPortalToken.objects.update_or_create(
        supplier=supplier,
        defaults={"token": secrets.token_urlsafe(32), "contact_email": supplier.email, "is_active": True},
    )
    return token