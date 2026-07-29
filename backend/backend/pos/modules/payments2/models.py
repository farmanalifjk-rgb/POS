from decimal import Decimal
from django.conf import settings
from django.db import models


class GiftCard(models.Model):
    code = models.CharField(max_length=32, unique=True)
    initial_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    currency = models.CharField(max_length=10, default="USD")
    is_active = models.BooleanField(default=True)
    expires_at = models.DateField(null=True, blank=True)
    issued_to = models.ForeignKey("pos.Customer", null=True, blank=True, on_delete=models.SET_NULL, related_name="gift_cards")
    issued_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)


class GiftCardTransaction(models.Model):
    KIND_ISSUE = "issue"
    KIND_TOPUP = "topup"
    KIND_REDEEM = "redeem"
    KIND_VOID = "void"
    KIND_CHOICES = [(KIND_ISSUE, "Issue"), (KIND_TOPUP, "Top-up"), (KIND_REDEEM, "Redeem"), (KIND_VOID, "Void")]
    gift_card = models.ForeignKey(GiftCard, on_delete=models.CASCADE, related_name="transactions")
    kind = models.CharField(max_length=10, choices=KIND_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    order = models.ForeignKey("pos.Order", null=True, blank=True, on_delete=models.SET_NULL)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)


class StoreCredit(models.Model):
    """Store-credit wallet per customer (refunds + loyalty + manual adjustments)."""
    customer = models.ForeignKey("pos.Customer", on_delete=models.CASCADE, related_name="store_credits")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    currency = models.CharField(max_length=10, default="USD")
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["customer"], name="unique_customer_storecredit")]


class StoreCreditTransaction(models.Model):
    KIND_ISSUE = "issue"          # from refund
    KIND_ADJUST = "adjust"        # manual
    KIND_REDEEM = "redeem"        # used to pay an order
    KIND_EXPIRE = "expire"
    KIND_CHOICES = [(KIND_ISSUE, "Issue"), (KIND_ADJUST, "Adjust"), (KIND_REDEEM, "Redeem"), (KIND_EXPIRE, "Expire")]
    store_credit = models.ForeignKey(StoreCredit, on_delete=models.CASCADE, related_name="transactions")
    kind = models.CharField(max_length=10, choices=KIND_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    order = models.ForeignKey("pos.Order", null=True, blank=True, on_delete=models.SET_NULL)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)


class TenderedPayment(models.Model):
    """A single tender applied to an order (cash, card, gift card, store credit, split)."""
    TENDER_CASH = "cash"
    TENDER_CARD = "card"
    TENDER_BANK = "bank"
    TENDER_GIFT_CARD = "gift_card"
    TENDER_STORE_CREDIT = "store_credit"
    TENDER_LOYALTY = "loyalty"
    TENDER_WALLET = "wallet"
    TENDER_CHOICES = [(TENDER_CASH, "Cash"), (TENDER_CARD, "Card"), (TENDER_BANK, "Bank"),
                      (TENDER_GIFT_CARD, "Gift card"), (TENDER_STORE_CREDIT, "Store credit"),
                      (TENDER_LOYALTY, "Loyalty points"), (TENDER_WALLET, "Wallet")]
    order = models.ForeignKey("pos.Order", on_delete=models.CASCADE, related_name="tenders")
    tender_type = models.CharField(max_length=20, choices=TENDER_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=120, blank=True)  # card last4 / gift card code
    is_settled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)


class PaymentReconciliation(models.Model):
    STATUS_OPEN = "open"
    STATUS_MATCHED = "matched"
    STATUS_DISCREPANCY = "discrepancy"
    STATUS_CHOICES = [(STATUS_OPEN, "Open"), (STATUS_MATCHED, "Matched"), (STATUS_DISCREPANCY, "Discrepancy")]
    session = models.ForeignKey("pos.CashSession", on_delete=models.CASCADE, related_name="reconciliations")
    expected_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    counted_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    variance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_OPEN)
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)


class ReconciliationLine(models.Model):
    reconciliation = models.ForeignKey(PaymentReconciliation, on_delete=models.CASCADE, related_name="lines")
    tender_type = models.CharField(max_length=20)
    expected_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    counted_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    variance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    note = models.CharField(max_length=255, blank=True)


class RefundCreditNote(models.Model):
    """A refund issued as store credit (credit note) instead of cash."""
    refund = models.ForeignKey("pos.Refund", on_delete=models.CASCADE, related_name="credit_notes")
    customer = models.ForeignKey("pos.Customer", null=True, blank=True, on_delete=models.SET_NULL)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    code = models.CharField(max_length=32, unique=True)
    is_redeemed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
