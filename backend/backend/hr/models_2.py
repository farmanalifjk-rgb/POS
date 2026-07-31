from decimal import Decimal
from django.conf import settings
from django.db import models


class Employee(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="employee_profile")
    employee_code = models.CharField(max_length=30, unique=True)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=30, blank=True)
    position = models.CharField(max_length=120, blank=True)        # Cashier, Supervisor, Manager
    department = models.CharField(max_length=120, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0"))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["full_name"]


class Shift(models.Model):
    STATUS_OPEN = "open"
    STATUS_CLOSED = "closed"
    STATUS_CHOICES = [(STATUS_OPEN, "Open"), (STATUS_CLOSED, "Closed")]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="shifts")
    session = models.ForeignKey("pos.CashSession", null=True, blank=True, on_delete=models.SET_NULL, related_name="shifts")
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_OPEN)
    break_minutes = models.PositiveIntegerField(default=0)
    note = models.TextField(blank=True)


class ShiftAssignment(models.Model):
    """Scheduled shift (roster) — planned, before it becomes a worked Shift."""
    WEEKDAY_CHOICES = [(0, "Mon"), (1, "Tue"), (2, "Wed"), (3, "Thu"), (4, "Fri"), (5, "Sat"), (6, "Sun")]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="assignments")
    weekday = models.PositiveIntegerField(choices=WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class CommissionRule(models.Model):
    SCOPE_PRODUCT = "product"
    SCOPE_CATEGORY = "category"
    SCOPE_GLOBAL = "global"
    SCOPE_CHOICES = [(SCOPE_PRODUCT, "Product"), (SCOPE_CATEGORY, "Category"), (SCOPE_GLOBAL, "Global")]
    BASIS_PERCENT = "percent"
    BASIS_FIXED = "fixed"
    BASIS_CHOICES = [(BASIS_PERCENT, "Percent of sale"), (BASIS_FIXED, "Fixed per unit")]
    name = models.CharField(max_length=120)
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES, default=SCOPE_GLOBAL)
    basis = models.CharField(max_length=10, choices=BASIS_CHOICES, default=BASIS_PERCENT)
    value = models.DecimalField(max_digits=8, decimal_places=4, default=Decimal("0"))  # 0.05 = 5% or $2
    product = models.ForeignKey("pos.Product", null=True, blank=True, on_delete=models.SET_NULL)
    category = models.ForeignKey("pos.Category", null=True, blank=True, on_delete=models.SET_NULL)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class CommissionEntry(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="commissions")
    order = models.ForeignKey("pos.Order", null=True, blank=True, on_delete=models.SET_NULL)
    rule = models.ForeignKey(CommissionRule, null=True, blank=True, on_delete=models.SET_NULL)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class PayrollRun(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_APPROVED = "approved"
    STATUS_PAID = "paid"
    STATUS_CHOICES = [(STATUS_DRAFT, "Draft"), (STATUS_APPROVED, "Approved"), (STATUS_PAID, "Paid")]
    period_start = models.DateField()
    period_end = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    total_base = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0"))
    total_hours = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0"))
    total_commissions = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0"))
    total_gross = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0"))
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)


class PayrollLine(models.Model):
    run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name="lines")
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    hours_worked = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0"))
    hourly_pay = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    commissions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    gross_pay = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    note = models.TextField(blank=True)