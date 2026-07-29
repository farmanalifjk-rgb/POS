from decimal import Decimal
from django.conf import settings
from django.db import models


class SupplierContact(models.Model):
    supplier = models.ForeignKey("pos.Supplier", on_delete=models.CASCADE, related_name="contacts")
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=120, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class GoodsReceipt(models.Model):
    """Receipt of goods against a PurchaseOrder (full or partial)."""
    STATUS_DRAFT = "draft"
    STATUS_RECEIVED = "received"
    STATUS_INSPECTED = "inspected"
    STATUS_QUARANTINE = "quarantine"
    STATUS_CHOICES = [(STATUS_DRAFT, "Draft"), (STATUS_RECEIVED, "Received"),
                      (STATUS_INSPECTED, "Inspected"), (STATUS_QUARANTINE, "Quarantine")]
    purchase_order = models.ForeignKey("pos.PurchaseOrder", on_delete=models.PROTECT, related_name="receipts")
    receipt_number = models.CharField(max_length=30, unique=True)
    supplier_invoice_number = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    received_at = models.DateTimeField(auto_now_add=True)
    received_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    note = models.TextField(blank=True)


class GoodsReceiptLine(models.Model):
    receipt = models.ForeignKey(GoodsReceipt, on_delete=models.CASCADE, related_name="lines")
    purchase_order_item = models.ForeignKey("pos.PurchaseOrderItem", on_delete=models.SET_NULL, null=True, blank=True)
    product = models.ForeignKey("pos.Product", on_delete=models.PROTECT)
    quantity_ordered = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0"))
    quantity_received = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0"))
    quantity_accepted = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0"))
    quantity_rejected = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0"))
    rejection_reason = models.CharField(max_length=255, blank=True)
    batch_number = models.CharField(max_length=100, blank=True)
    expiry_date = models.DateField(null=True, blank=True)


class PurchaseReturn(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_RETURNED = "returned"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [(STATUS_DRAFT, "Draft"), (STATUS_RETURNED, "Returned"), (STATUS_CANCELLED, "Cancelled")]
    purchase_order = models.ForeignKey("pos.PurchaseOrder", on_delete=models.PROTECT, related_name="supplier_returns")
    return_number = models.CharField(max_length=30, unique=True)
    supplier_credit_note = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)


class PurchaseReturnLine(models.Model):
    purchase_return = models.ForeignKey(PurchaseReturn, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey("pos.Product", on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=14, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=255, blank=True)


class SupplierPortalToken(models.Model):
    supplier = models.OneToOneField("pos.Supplier", on_delete=models.CASCADE, related_name="portal_token")
    token = models.CharField(max_length=64, unique=True)
    contact_email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)