"""
Accounting module models.

Provides double-entry bookkeeping with Chart of Accounts, Journal Entries,
Expenses, and derived reports (Trial Balance, P&L, Cash Flow, Balance Sheet).
"""
from django.conf import settings
from django.db import models


class AccountType(models.TextChoices):
    ASSET     = "asset",     "Asset"
    LIABILITY = "liability", "Liability"
    EQUITY    = "equity",    "Equity"
    REVENUE   = "revenue",   "Revenue"
    EXPENSE   = "expense",   "Expense"


class ChartOfAccount(models.Model):
    """A single account in the chart of accounts."""
    code        = models.CharField(max_length=20, unique=True)
    name        = models.CharField(max_length=200)
    type        = models.CharField(max_length=20, choices=AccountType.choices)
    parent      = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="children")
    description = models.TextField(blank=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.name}"

    @property
    def balance(self):
        from django.db.models import Sum, F
        lines = self.journal_lines.aggregate(
            debits=Sum("debit"), credits=Sum("credit")
        )
        debits  = lines["debits"]  or 0
        credits = lines["credits"] or 0
        if self.type in [AccountType.ASSET, AccountType.EXPENSE]:
            return debits - credits
        return credits - debits


class JournalEntry(models.Model):
    """A double-entry journal entry header."""
    STATUS_DRAFT   = "draft"
    STATUS_POSTED  = "posted"
    STATUS_CHOICES = [(STATUS_DRAFT, "Draft"), (STATUS_POSTED, "Posted")]

    reference       = models.CharField(max_length=60, unique=True)
    date            = models.DateField()
    description     = models.TextField(blank=True)
    status          = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    created_by      = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at      = models.DateTimeField(auto_now_add=True)
    is_auto_posted  = models.BooleanField(default=False, help_text="Set by the system when auto-posting from sales/purchases")

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"JE-{self.reference} ({self.date})"

    @property
    def is_balanced(self):
        from django.db.models import Sum
        agg = self.lines.aggregate(d=Sum("debit"), c=Sum("credit"))
        return (agg["d"] or 0) == (agg["c"] or 0)


class JournalEntryLine(models.Model):
    """A single debit or credit line within a journal entry."""
    entry       = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name="lines")
    account     = models.ForeignKey(ChartOfAccount, on_delete=models.PROTECT, related_name="journal_lines")
    description = models.CharField(max_length=255, blank=True)
    debit       = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit      = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"DR {self.debit} / CR {self.credit} — {self.account}"


# ── Expenses ───────────────────────────────────────────────────────────────────

class ExpenseCategory(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Expense Categories"

    def __str__(self):
        return self.name


class Expense(models.Model):
    STATUS_PENDING  = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES  = [
        (STATUS_PENDING,  "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    category      = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT, related_name="expenses")
    amount        = models.DecimalField(max_digits=15, decimal_places=2)
    description   = models.TextField()
    date          = models.DateField()
    paid_by       = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="expenses_paid")
    receipt_image = models.ImageField(upload_to="receipts/", null=True, blank=True)
    status        = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_PENDING)
    journal_entry = models.ForeignKey(JournalEntry, null=True, blank=True, on_delete=models.SET_NULL)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.category} — {self.amount} ({self.date})"


