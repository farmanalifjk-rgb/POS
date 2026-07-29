from decimal import Decimal
from django.conf import settings
from django.db import models


class Tenant(models.Model):
    STATUS_ACTIVE = "active"
    STATUS_SUSPENDED = "suspended"
    STATUS_TRIAL = "trial"
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_SUSPENDED, "Suspended"),
        (STATUS_TRIAL, "Trial"),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=80, unique=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="owned_tenants"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_TRIAL)
    is_active = models.BooleanField(default=True)
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    suspended_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class TenantMembership(models.Model):
    ROLE_OWNER = "owner"
    ROLE_ADMIN = "admin"
    ROLE_MANAGER = "manager"
    ROLE_STAFF = "staff"
    ROLE_CHOICES = [
        (ROLE_OWNER, "Owner"),
        (ROLE_ADMIN, "Admin"),
        (ROLE_MANAGER, "Manager"),
        (ROLE_STAFF, "Staff"),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tenant_memberships")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_STAFF)
    is_active_in_tenant = models.BooleanField(default=True)  # the tenant the user is "logged into"
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["tenant", "user"], name="unique_tenant_user"),
        ]
        ordering = ["-joined_at"]

    def __str__(self):
        return f"{self.user} @ {self.tenant} ({self.role})"


class SubscriptionPlan(models.Model):
    INTERVAL_MONTHLY = "monthly"
    INTERVAL_YEARLY = "yearly"
    INTERVAL_CHOICES = [(INTERVAL_MONTHLY, "Monthly"), (INTERVAL_YEARLY, "Yearly")]

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=80, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    currency = models.CharField(max_length=10, default="USD")
    interval = models.CharField(max_length=10, choices=INTERVAL_CHOICES, default=INTERVAL_MONTHLY)
    trial_days = models.PositiveIntegerField(default=14)

    # Usage limits — None means unlimited
    max_users = models.PositiveIntegerField(null=True, blank=True)
    max_stores = models.PositiveIntegerField(null=True, blank=True)
    max_warehouses = models.PositiveIntegerField(null=True, blank=True)
    max_products = models.PositiveIntegerField(null=True, blank=True)
    storage_mb = models.PositiveIntegerField(null=True, blank=True)

    features = models.JSONField(default=dict, blank=True)
    is_public = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    stripe_price_id = models.CharField(max_length=120, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "price"]

    def __str__(self):
        return f"{self.name} ({self.interval})"


class Subscription(models.Model):
    STATUS_TRIALING = "trialing"
    STATUS_ACTIVE = "active"
    STATUS_PAST_DUE = "past_due"
    STATUS_CANCELED = "canceled"
    STATUS_EXPIRED = "expired"
    STATUS_INCOMPLETE = "incomplete"
    STATUS_CHOICES = [
        (STATUS_TRIALING, "Trialing"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_PAST_DUE, "Past due"),
        (STATUS_CANCELED, "Canceled"),
        (STATUS_EXPIRED, "Expired"),
        (STATUS_INCOMPLETE, "Incomplete"),
    ]

    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name="subscription")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name="subscriptions")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_TRIALING)
    stripe_customer_id = models.CharField(max_length=120, blank=True)
    stripe_subscription_id = models.CharField(max_length=120, blank=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.tenant} — {self.plan} ({self.status})"


class Invoice(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_OPEN = "open"
    STATUS_PAID = "paid"
    STATUS_VOID = "void"
    STATUS_UNCOLLECTIBLE = "uncollectible"
    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"), (STATUS_OPEN, "Open"), (STATUS_PAID, "Paid"),
        (STATUS_VOID, "Void"), (STATUS_UNCOLLECTIBLE, "Uncollectible"),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="invoices")
    subscription = models.ForeignKey(Subscription, null=True, blank=True, on_delete=models.SET_NULL, related_name="invoices")
    number = models.CharField(max_length=40, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_OPEN)
    amount_due = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    currency = models.CharField(max_length=10, default="USD")
    issued_at = models.DateTimeField(null=True, blank=True)
    due_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    stripe_invoice_id = models.CharField(max_length=120, blank=True)
    pdf_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("1"))
    unit_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))


class TenantUsage(models.Model):
    """Point-in-time usage snapshot per metric for a tenant."""
    METRIC_USERS = "users"
    METRIC_STORES = "stores"
    METRIC_WAREHOUSES = "warehouses"
    METRIC_PRODUCTS = "products"
    METRIC_STORAGE_MB = "storage_mb"
    METRIC_CHOICES = [
        (METRIC_USERS, "Users"), (METRIC_STORES, "Stores"),
        (METRIC_WAREHOUSES, "Warehouses"), (METRIC_PRODUCTS, "Products"),
        (METRIC_STORAGE_MB, "Storage (MB)"),
    ]
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="usage_snapshots")
    metric = models.CharField(max_length=20, choices=METRIC_CHOICES)
    value = models.PositiveIntegerField(default=0)
    captured_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-captured_at"]
        constraints = [
            models.UniqueConstraint(fields=["tenant", "metric", "captured_at"], name="unique_usage_snapshot")
        ]


class TenantAwareModel(models.Model):
    """Abstract base for any record that must be isolated per tenant."""
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="+", null=True, blank=True)

    class Meta:
        abstract = True