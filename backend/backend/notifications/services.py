from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from pos.models import Product, Customer
from hr.models import Shift
from customers.models import CustomerCreditLimit
from .models import AlertRule,Notification


def _rule(kind):
    return AlertRule.objects.filter(kind=kind, is_active=True).first()


def _emit(kind, title, body, severity="warning", link="", user=None):
    rule = _rule(kind)
    if not rule:
        return None
    n = Notification.objects.create(rule=rule, kind=kind, title=title, body=body,
                                     severity=severity, target_user=user, link=link)
    if rule.channel in (AlertRule.EMAIL if hasattr(AlertRule, "EMAIL") else []) or rule.channel == "both" or rule.channel == "email":
        _send_email(n, rule)
    return n


def _send_email(notification, rule):
    from notifications.emailer import send_alert_email
    recipients = [r.strip() for r in rule.email_recipients.split(",") if r.strip()]
    if recipients:
        send_alert_email(recipients, notification.title, notification.body)
        notification.is_sent_email = True
        notification.save(update_fields=["is_sent_email"])


@transaction.atomic
def scan_low_stock():
    rule = _rule(AlertRule.KIND_LOW_STOCK)
    if not rule:
        return []
    out = []
    for p in Product.objects.filter(is_active=True, stock_quantity__lte=rule.low_stock_threshold):
        n = _emit(AlertRule.KIND_LOW_STOCK, f"Low stock: {p.name}",
                  f"{p.name} (SKU {p.sku}) is at {p.stock_quantity} units (threshold {rule.low_stock_threshold}).",
                  severity="warning", link=f"#/products")
        if n:
            out.append(n.id)
    return out


@transaction.atomic
def scan_expiry():
    rule = _rule(AlertRule.KIND_EXPIRY)
    if not rule:
        return []
    cutoff = timezone.now().date() + timedelta(days=rule.expiry_days)
    out = []
    for p in Product.objects.filter(is_active=True, expiry_date__isnull=False, expiry_date__lte=cutoff):
        n = _emit(AlertRule.KIND_EXPIRY, f"Near expiry: {p.name}",
                  f"{p.name} expires on {p.expiry_date} (within {rule.expiry_days} days).",
                  severity="critical", link=f"#/products")
        if n:
            out.append(n.id)
    return out


@transaction.atomic
def scan_shift_handover():
    rule = _rule(AlertRule.KIND_SHIFT_HANDOVER)
    if not rule:
        return []
    out = []
    open_shifts = Shift.objects.filter(status=Shift.STATUS_OPEN, started_at__lt=timezone.now() - timedelta(hours=8))
    for s in open_shifts:
        n = _emit(AlertRule.KIND_SHIFT_HANDOVER, "Shift handover overdue",
                  f"{s.employee.full_name} has an open shift since {s.started_at:%H:%M} — handover required.",
                  severity="warning", link="#/shifts")
        if n:
            out.append(n.id)
    return out


@transaction.atomic
def scan_credit_limits():
    rule = _rule(AlertRule.KIND_CREDIT_LIMIT)
    if not rule:
        return []
    out = []
    for cl in CustomerCreditLimit.objects.filter(is_active=True):
        if Decimal(cl.used) >= Decimal(cl.limit):
            n = _emit(AlertRule.KIND_CREDIT_LIMIT,
                      f"Credit limit exceeded: {cl.customer.name}",
                      f"{cl.customer.name} used {cl.used} of {cl.limit} credit.",
                      severity="critical", link=f"#/customers")
            if n:
                out.append(n.id)
    return out


def run_all_scans():
    fired = []
    fired += scan_low_stock()
    fired += scan_expiry()
    fired += scan_shift_handover()
    fired += scan_credit_limits()
    return {"fired": len(fired)}


def mark_read(notification_id, user=None):
    n = Notification.objects.get(pk=notification_id)
    if user and n.target_user_id and n.target_user_id != user.id:
        raise PermissionError("Not your notification")
    n.is_read = True
    n.save(update_fields=["is_read"])
    return n