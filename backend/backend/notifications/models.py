from django.conf import settings
from django.db import models


class NotificationChannel(models.TextChoices):
    IN_APP = "in_app", "In-app"
    EMAIL = "email", "Email"
    BOTH = "both", "In-app + Email"


class AlertRule(models.Model):
    KIND_LOW_STOCK = "low_stock"
    KIND_EXPIRY = "expiry"
    KIND_SHIFT_HANDOVER = "shift_handover"
    KIND_REORDER = "reorder"
    KIND_CREDIT_LIMIT = "credit_limit"
    KIND_CHOICES = [(KIND_LOW_STOCK, "Low stock"), (KIND_EXPIRY, "Near expiry"),
                    (KIND_SHIFT_HANDOVER, "Shift handover"), (KIND_REORDER, "Reorder"),
                    (KIND_CREDIT_LIMIT, "Customer credit limit exceeded")]
    kind = models.CharField(max_length=20, choices=KIND_CHOICES, unique=True)
    is_active = models.BooleanField(default=True)
    channel = models.CharField(max_length=10, choices=NotificationChannel.choices, default=NotificationChannel.IN_APP)
    # tunables
    low_stock_threshold = models.PositiveIntegerField(default=5)
    expiry_days = models.PositiveIntegerField(default=7)
    email_recipients = models.TextField(blank=True, help_text="Comma-separated emails (must be registered app users)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["kind"]


class Notification(models.Model):
    SEVERITY_INFO = "info"
    SEVERITY_WARNING = "warning"
    SEVERITY_CRITICAL = "critical"
    SEVERITY_CHOICES = [(SEVERITY_INFO, "Info"), (SEVERITY_WARNING, "Warning"), (SEVERITY_CRITICAL, "Critical")]
    rule = models.ForeignKey(AlertRule, null=True, blank=True, on_delete=models.SET_NULL)
    kind = models.CharField(max_length=20)
    title = models.CharField(max_length=200)
    body = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default=SEVERITY_WARNING)
    target_user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
                                    related_name="notifications")
    is_read = models.BooleanField(default=False)
    is_sent_email = models.BooleanField(default=False)
    link = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class NotificationDigest(models.Model):
    """Daily roll-up log of alerts fired."""
    day = models.DateField()
    fired_count = models.PositiveIntegerField(default=0)
    email_count = models.PositiveIntegerField(default=0)
    summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-day"]