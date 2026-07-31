from decimal import Decimal
from django.conf import settings
from django.db import models


class InvoiceSequence(models.Model):
    """A sequenced, gapless invoice-number pool (per branch / per type)."""
    TYPE_INVOICE = "invoice"
    TYPE_CREDIT_NOTE = "credit_note"
    TYPE_PROFORMA = "proforma"
    TYPE_CHOICES = [(TYPE_INVOICE, "Invoice"), (TYPE_CREDIT_NOTE, "Credit note"), (TYPE_PROFORMA, "Proforma")]
    name = models.CharField(max_length=120)
    prefix = models.CharField(max_length=20)
    next_number = models.PositiveIntegerField(default=1)
    padding = models.PositiveIntegerField(default=6)
    document_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_INVOICE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class FiscalInvoice(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_ISSUED = "issued"
    STATUS_CANCELLED = "cancelled"
    STATUS_VOID = "void"
    STATUS_CHOICES = [(STATUS_DRAFT, "Draft"), (STATUS_ISSUED, "Issued"),
                      (STATUS_CANCELLED, "Cancelled"), (STATUS_VOID, "Void")]
    sequence = models.ForeignKey(InvoiceSequence, on_delete=models.PROTECT, related_name="invoices")
    invoice_number = models.CharField(max_length=40, unique=True)
    order = models.ForeignKey("pos.Order", null=True, blank=True, on_delete=models.SET_NULL, related_name="fiscal_invoices")
    customer = models.ForeignKey("pos.Customer", null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    issue_date = models.DateField(null=True, blank=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    qr_payload = models.TextField(blank=True)
    uuid = models.CharField(max_length=64, unique=True, blank=True)
    xml_content = models.TextField(blank=True)
    pdf_url = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)


class FiscalDevice(models.Model):
    """ESD / fiscal printer integration stub."""
    KIND_PRINTER = "printer"
    KIND_ESD = "esd"           # electronic sales device
    KIND_API = "api"
    KIND_CHOICES = [(KIND_PRINTER, "Fiscal printer"), (KIND_ESD, "ESD"), (KIND_API, "Tax authority API")]
    name = models.CharField(max_length=120)
    kind = models.CharField(max_length=20, choices=KIND_CHOICES, default=KIND_API)
    endpoint_url = models.CharField(max_length=255, blank=True)
    api_key = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class FiscalSubmission(models.Model):
    """Record of each invoice submitted to a fiscal device/authority."""
    STATUS_PENDING = "pending"
    STATUS_ACCEPTED = "accepted"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [(STATUS_PENDING, "Pending"), (STATUS_ACCEPTED, "Accepted"), (STATUS_REJECTED, "Rejected")]
    invoice = models.ForeignKey(FiscalInvoice, on_delete=models.CASCADE, related_name="submissions")
    device = models.ForeignKey(FiscalDevice, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    reference = models.CharField(max_length=120, blank=True)   # authority receipt number / UUID
    response_payload = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)