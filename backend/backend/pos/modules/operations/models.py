"""
Workflow / Approvals models.

Configurable approval rules per module/action, plus an approval
request queue that can gate purchase orders, refunds, payroll, etc.
"""
from django.conf import settings
from django.db import models


class ApprovalRule(models.Model):
    """Defines when an approval is required for a given module+action pair."""
    MODULE_CHOICES = [
        ("purchase_order",  "Purchase Order"),
        ("refund",          "Refund"),
        ("stock_adjustment","Stock Adjustment"),
        ("payroll",         "Payroll"),
        ("expense",         "Expense"),
        ("warehouse_transfer","Warehouse Transfer"),
    ]

    module           = models.CharField(max_length=50, choices=MODULE_CHOICES)
    action           = models.CharField(max_length=80, help_text='e.g. "create", "post", "over_limit"')
    min_amount       = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True,
                         help_text="Only trigger if record amount exceeds this threshold (null = always)")
    requires_approval = models.BooleanField(default=True)
    approver_role    = models.CharField(max_length=100, blank=True, help_text="Role/group name that can approve")
    is_active        = models.BooleanField(default=True)

    class Meta:
        ordering = ["module", "action"]
        constraints = [models.UniqueConstraint(fields=["module","action"], name="unique_approval_rule_module_action")]

    def __str__(self):
        return f"{self.module}.{self.action} → requires={self.requires_approval}"


class ApprovalRequest(models.Model):
    STATUS_PENDING  = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES  = [
        (STATUS_PENDING,  "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    module        = models.CharField(max_length=50)
    action        = models.CharField(max_length=80)
    reference_id  = models.PositiveIntegerField(help_text="PK of the related object")
    reference_str = models.CharField(max_length=100, blank=True, help_text="Human-readable reference, e.g. PO-2024-001")
    amount        = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    requested_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="approval_requests")
    status        = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_PENDING)
    reviewed_by   = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="approvals_reviewed")
    reviewed_at   = models.DateTimeField(null=True, blank=True)
    note          = models.TextField(blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.module}/{self.action} #{self.reference_id} [{self.status}]"


"""
Notifications module models.

In-app notification inbox plus email/SMS queuing tables.
Uses 'InAppNotification' to avoid clash with pos.modules.system.models.Notification.
"""
from django.conf import settings
from django.db import models


class InAppNotification(models.Model):
    TYPE_INFO    = "info"
    TYPE_SUCCESS = "success"
    TYPE_WARNING = "warning"
    TYPE_ERROR   = "error"
    TYPE_CHOICES = [
        (TYPE_INFO,    "Info"),
        (TYPE_SUCCESS, "Success"),
        (TYPE_WARNING, "Warning"),
        (TYPE_ERROR,   "Error"),
    ]

    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="inapp_notifications")
    type       = models.CharField(max_length=10, choices=TYPE_CHOICES, default=TYPE_INFO)
    title      = models.CharField(max_length=200)
    message    = models.TextField()
    link       = models.CharField(max_length=300, blank=True, help_text="Frontend hash route, e.g. #/orders/123")
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "In-App Notification"

    def __str__(self):
        return f"[{self.type}] {self.title} \u2192 {self.user}"


class EmailQueue(models.Model):
    STATUS_PENDING = "pending"
    STATUS_SENT    = "sent"
    STATUS_FAILED  = "failed"
    STATUS_CHOICES = [(STATUS_PENDING,"Pending"),(STATUS_SENT,"Sent"),(STATUS_FAILED,"Failed")]

    to         = models.EmailField()
    subject    = models.CharField(max_length=255)
    body       = models.TextField()
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    attempts   = models.PositiveSmallIntegerField(default=0)
    sent_at    = models.DateTimeField(null=True, blank=True)
    error      = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Email to {self.to}: {self.subject} [{self.status}]"


class SMSQueue(models.Model):
    STATUS_PENDING = "pending"
    STATUS_SENT    = "sent"
    STATUS_FAILED  = "failed"
    STATUS_CHOICES = [(STATUS_PENDING,"Pending"),(STATUS_SENT,"Sent"),(STATUS_FAILED,"Failed")]

    to         = models.CharField(max_length=20)
    message    = models.TextField(max_length=320)
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    attempts   = models.PositiveSmallIntegerField(default=0)
    sent_at    = models.DateTimeField(null=True, blank=True)
    error      = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"SMS to {self.to}: [{self.status}]"


