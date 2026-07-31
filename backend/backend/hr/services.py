from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from pos.models import Order, OrderItem
from .models import Employee, Shift, CommissionRule, CommissionEntry, PayrollRun, PayrollLine


@transaction.atomic
def start_shift(employee_id, session_id=None, user=None):
    emp = Employee.objects.get(pk=employee_id)
    open_shift = Shift.objects.filter(employee=emp, status=Shift.STATUS_OPEN).first()
    if open_shift:
        raise ValueError("Employee already has an open shift")
    return Shift.objects.create(employee=emp, session_id=session_id)


@transaction.atomic
def end_shift(shift_id, break_minutes=0):
    shift = Shift.objects.get(pk=shift_id)
    if shift.status == Shift.STATUS_CLOSED:
        return shift
    shift.ended_at = timezone.now()
    shift.break_minutes = break_minutes
    shift.status = Shift.STATUS_CLOSED
    shift.save(update_fields=["ended_at", "break_minutes", "status"])
    return shift


def _matched_rules(product):
    rules = []
    for r in CommissionRule.objects.filter(is_active=True):
        if r.scope == CommissionRule.SCOPE_GLOBAL:
            rules.append(r)
        elif r.scope == CommissionRule.SCOPE_PRODUCT and r.product_id == product.id:
            rules.append(r)
        elif r.scope == CommissionRule.SCOPE_CATEGORY and r.category_id == product.category_id:
            rules.append(r)
    return rules


@transaction.atomic
def compute_commissions_for_order(order, employee_id):
    """Compute commission entries for every line of an order, attributed to an employee."""
    emp = Employee.objects.get(pk=employee_id)
    entries = []
    for item in order.items.all():
        for rule in _matched_rules(item.product):
            if rule.basis == CommissionRule.BASIS_PERCENT:
                amount = Decimal(item.subtotal) * rule.value
            else:
                amount = rule.value * Decimal(item.quantity)
            if amount <= 0:
                continue
            entries.append(CommissionEntry.objects.create(employee=emp, order=order, rule=rule,
                                                           amount=amount,
                                                           note=f"{item.product.name} x{item.quantity}"))
    return entries


@transaction.atomic
def run_payroll(period_start, period_end, user=None):
    """Aggregate base + hours + commissions per active employee over a period."""
    run = PayrollRun.objects.create(period_start=period_start, period_end=period_end,
                                    created_by=user)
    total_base = Decimal("0")
    total_hours = Decimal("0")
    total_comm = Decimal("0")
    total_gross = Decimal("0")
    for emp in Employee.objects.filter(is_active=True):
        shifts = Shift.objects.filter(employee=emp, started_at__date__gte=period_start,
                                      started_at__date__lte=period_end, status=Shift.STATUS_CLOSED)
        hours = Decimal("0")
        for s in shifts:
            if s.ended_at:
                delta = s.ended_at - s.started_at
                worked = delta.total_seconds() / 3600 - (s.break_minutes / 60)
                hours += Decimal(str(round(max(worked, 0), 2)))
        hourly_pay = hours * Decimal(emp.hourly_rate)
        comm = Decimal(sum((c.amount for c in emp.commissions.filter(created_at__date__gte=period_start,
                                                                     created_at__date__lte=period_end)), Decimal("0")))
        gross = Decimal(emp.base_salary) + hourly_pay + comm
        PayrollLine.objects.create(run=run, employee=emp, base_salary=emp.base_salary,
                                   hours_worked=hours, hourly_pay=hourly_pay,
                                   commissions=comm, gross_pay=gross)
        total_base += Decimal(emp.base_salary)
        total_hours += hours
        total_comm += comm
        total_gross += gross
    run.total_base = total_base
    run.total_hours = total_hours
    run.total_commissions = total_comm
    run.total_gross = total_gross
    run.save()
    return run


def payroll_csv(run_id):
    """Build a CSV string ready for accounting export."""
    import csv, io
    run = PayrollRun.objects.get(pk=run_id)
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["employee_code", "name", "base_salary", "hours_worked", "hourly_pay",
                "commissions", "gross_pay", "period_start", "period_end"])
    for ln in run.lines.all():
        w.writerow([ln.employee.employee_code, ln.employee.full_name, ln.base_salary,
                    ln.hours_worked, ln.hourly_pay, ln.commissions, ln.gross_pay,
                    run.period_start, run.period_end])
    return buf.getvalue()
