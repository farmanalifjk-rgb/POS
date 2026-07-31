import base64
import hashlib
import json
import uuid as uuid_lib
from datetime import date
from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from pos.models import Order, Customer
from .models import InvoiceSequence, FiscalInvoice, FiscalDevice, FiscalSubmission


@transaction.atomic
def next_invoice_number(sequence):
    seq = InvoiceSequence.objects.select_for_update().get(pk=sequence.id)
    number = f"{seq.prefix}-{seq.next_number:0{seq.padding}d}"
    seq.next_number += 1
    seq.save(update_fields=["next_number"])
    return number


def build_qr_payload(invoice):
    """Compact TLV-ish payload (seller, total, tax, uuid, timestamp)."""
    parts = [
        f"S:{invoice.sequence.name}",
        f"N:{invoice.invoice_number}",
        f"D:{invoice.issue_date or date.today().isoformat()}",
        f"T:{invoice.total}",
        f"X:{invoice.tax}",
        f"U:{invoice.uuid}",
    ]
    raw = "|".join(parts)
    return base64.b64encode(raw.encode()).decode()


def build_xml(invoice, order=None, customer=None):
    items_xml = []
    if order:
        for it in order.items.all():
            items_xml.append(
                f"<Line><Product>{it.product.name}</Product>"
                f"<Qty>{it.quantity}</Qty><UnitPrice>{it.unit_price}</UnitPrice>"
                f"<Subtotal>{it.subtotal}</Subtotal></Line>"
            )
    customer_name = customer.name if customer else "Walk-in customer"
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Invoice>
  <InvoiceNumber>{invoice.invoice_number}</InvoiceNumber>
  <UUID>{invoice.uuid}</UUID>
  <IssueDate>{invoice.issue_date or date.today().isoformat()}</IssueDate>
  <Customer>{customer_name}</Customer>
  <Subtotal>{invoice.subtotal}</Subtotal>
  <Tax>{invoice.tax}</Tax>
  <Discount>{invoice.discount}</Discount>
  <Total>{invoice.total}</Total>
  <Lines>{''.join(items_xml)}</Lines>
  <QR>{invoice.qr_payload}</QR>
</Invoice>"""


@transaction.atomic
def issue_invoice(*, order_id=None, sequence_id, customer_id=None, user=None, document_type=None):
    seq = InvoiceSequence.objects.get(pk=sequence_id)
    if document_type and seq.document_type != document_type:
        raise ValueError("Sequence document_type mismatch")
    order = Order.objects.get(pk=order_id) if order_id else None
    customer = Customer.objects.get(pk=customer_id) if customer_id else (order.customer if order else None)
    invoice = FiscalInvoice.objects.create(sequence=seq, invoice_number="TEMP",
                                             order=order, customer=customer,
                                             created_by=user, uuid=uuid_lib.uuid4().hex,
                                             status=FiscalInvoice.STATUS_DRAFT)
    invoice.invoice_number = next_invoice_number(seq)
    if order:
        invoice.subtotal = order.subtotal
        invoice.tax = order.tax
        invoice.discount = order.discount
        invoice.total = order.total
    invoice.issue_date = date.today()
    invoice.qr_payload = build_qr_payload(invoice)
    invoice.xml_content = build_xml(invoice, order, customer)
    invoice.status = FiscalInvoice.STATUS_ISSUED
    invoice.save()
    return invoice


@transaction.atomic
def cancel_invoice(invoice_id, user=None):
    inv = FiscalInvoice.objects.get(pk=invoice_id)
    if inv.status == FiscalInvoice.STATUS_ISSUED:
        inv.status = FiscalInvoice.STATUS_CANCELLED
        inv.save(update_fields=["status"])
    return inv


@transaction.atomic
def submit_to_device(invoice_id, device_id, user=None):
    inv = FiscalInvoice.objects.get(pk=invoice_id)
    device = FiscalDevice.objects.get(pk=device_id)
    sub = FiscalSubmission.objects.create(invoice=inv, device=device,
                                          status=FiscalSubmission.STATUS_PENDING)
    # ---- integration stub: replace with real device API call ----
    try:
        # e.g. requests.post(device.endpoint_url, headers={"Authorization": device.api_key},
        #                    json={"xml": inv.xml_content, "qr": inv.qr_payload})
        sub.reference = f"RCPT-{inv.invoice_number}-{timezone.now().strftime('%Y%m%d%H%M%S')}"
        sub.status = FiscalSubmission.STATUS_ACCEPTED
        sub.response_payload = json.dumps({"accepted": True, "reference": sub.reference})
    except Exception as e:
        sub.status = FiscalSubmission.STATUS_REJECTED
        sub.response_payload = str(e)
    sub.responded_at = timezone.now()
    sub.save()
    device.last_used_at = timezone.now()
    device.save(update_fields=["last_used_at"])
    return sub