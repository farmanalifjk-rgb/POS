from datetime import timedelta
from django.db import transaction
from django.utils import timezone

from pos.models import Product, Order, Customer
from .models import Integration, SyncLog, SyncMapping
from .adapters import get_adapter


@transaction.atomic
def _log(integration, direction, entity_type, local_id, remote_id, status, message="", payload=None):
    return SyncLog.objects.create(integration=integration, direction=direction,
                                   entity_type=entity_type, local_id=local_id or "",
                                   remote_id=remote_id or "", status=status,
                                   message=message, payload=payload or {})


def sync_products_inbound(integration):
    adapter = get_adapter(integration)
    created, updated, failed = 0, 0, 0
    try:
        remote_products = adapter.fetch_products()
    except Exception as e:
        _log(integration, SyncLog.DIRECTION_INBOUND, "product", "", "", SyncLog.STATUS_FAILED, str(e))
        return {"created": 0, "updated": 0, "failed": 1, "error": str(e)}
    for rp in remote_products:
        try:
            mapping = SyncMapping.objects.filter(integration=integration, entity_type="product",
                                                 remote_id=rp["remote_id"]).first()
            if mapping:
                p = Product.objects.filter(id=mapping.local_id).first()
                if p:
                    p.name = rp["name"]
                    p.sku = rp.get("sku") or p.sku
                    p.sales_price = rp.get("price", p.sales_price)
                    p.save()
                    updated += 1
                else:
                    continue
            else:
                p = Product.objects.create(name=rp["name"], sku=rp.get("sku") or f"EXT-{rp['remote_id']}",
                                           sales_price=rp.get("price", 0), cost_price=0)
                SyncMapping.objects.create(integration=integration, entity_type="product",
                                           local_id=str(p.id), remote_id=rp["remote_id"],
                                           last_hash=adapter._hash(rp))
                created += 1
        except Exception as e:
            failed += 1
            _log(integration, SyncLog.DIRECTION_INBOUND, "product", "", rp.get("remote_id", ""),
                 SyncLog.STATUS_FAILED, str(e))
    integration.last_synced_at = timezone.now()
    integration.save(update_fields=["last_synced_at"])
    return {"created": created, "updated": updated, "failed": failed}


def sync_products_outbound(integration):
    adapter = get_adapter(integration)
    pushed, skipped, failed = 0, 0, 0
    for p in Product.objects.filter(is_active=True).iterator():
        mapping = SyncMapping.objects.filter(integration=integration, entity_type="product",
                                             local_id=str(p.id)).first()
        data = {"name": p.name, "sku": p.sku, "price": str(p.sales_price)}
        new_hash = adapter._hash(data)
        if mapping and mapping.last_hash == new_hash:
            skipped += 1
            continue
        try:
            remote_id = adapter.push_product(data)
            if mapping:
                mapping.remote_id = remote_id
                mapping.last_hash = new_hash
                mapping.save()
            else:
                SyncMapping.objects.create(integration=integration, entity_type="product",
                                           local_id=str(p.id), remote_id=remote_id, last_hash=new_hash)
            pushed += 1
        except Exception as e:
            failed += 1
            _log(integration, SyncLog.DIRECTION_OUTBOUND, "product", str(p.id), "",
                 SyncLog.STATUS_FAILED, str(e))
    integration.last_synced_at = timezone.now()
    integration.save(update_fields=["last_synced_at"])
    return {"pushed": pushed, "skipped": skipped, "failed": failed}


def sync_orders_inbound(integration, since=None):
    adapter = get_adapter(integration)
    imported, failed = 0, 0
    try:
        remote_orders = adapter.fetch_orders(since=since)
    except Exception as e:
        _log(integration, SyncLog.DIRECTION_INBOUND, "order", "", "", SyncLog.STATUS_FAILED, str(e))
        return {"imported": 0, "failed": 1, "error": str(e)}
    for ro in remote_orders:
        if SyncMapping.objects.filter(integration=integration, entity_type="order",
                                      remote_id=ro["remote_id"]).exists():
            continue
        try:
            order = Order.objects.create(payment_method="card", subtotal=ro.get("total", 0),
                                         tax=0, discount=0, total=ro.get("total", 0), status="paid")
            SyncMapping.objects.create(integration=integration, entity_type="order",
                                       local_id=str(order.id), remote_id=ro["remote_id"])
            imported += 1
        except Exception as e:
            failed += 1
            _log(integration, SyncLog.DIRECTION_INBOUND, "order", "", ro.get("remote_id", ""),
                 SyncLog.STATUS_FAILED, str(e))
    integration.last_synced_at = timezone.now()
    integration.save(update_fields=["last_synced_at"])
    return {"imported": imported, "failed": failed}


def push_invoice(integration, invoice_data):
    adapter = get_adapter(integration)
    try:
        remote_id = adapter.push_invoice(invoice_data)
        _log(integration, SyncLog.DIRECTION_OUTBOUND, "invoice",
             invoice_data.get("invoice_number", ""), remote_id, SyncLog.STATUS_SUCCESS)
        return remote_id
    except Exception as e:
        _log(integration, SyncLog.DIRECTION_OUTBOUND, "invoice",
             invoice_data.get("invoice_number", ""), "", SyncLog.STATUS_FAILED, str(e))
        raise


def run_sync(integration_id, direction="inbound", entity_type="product"):
    integration = Integration.objects.get(pk=integration_id)
    if entity_type == "product":
        return sync_products_inbound(integration) if direction == "inbound" else sync_products_outbound(integration)
    elif entity_type == "order":
        return sync_orders_inbound(integration)
    else:
        raise ValueError(f"Unknown entity_type {entity_type}")