from decimal import Decimal
from django.db import transaction

from pos.models import Order, OrderItem, Product
from .models import TaxRate, TaxExemption, TaxBreakdown


def _active_rates_for(product, customer=None):
    """Return tax rates applying to a product, honouring exemptions."""
    qs = TaxRate.objects.filter(is_active=True)
    # scope: all, or this product/category
    rate_ids = []
    for r in qs:
        if not r.applies_to_all and not (r.product_id == product.id or (r.category_id and r.category_id == product.category_id)):
            continue
        rate_ids.append(r.id)
    exempt_ids = set()
    if customer:
        for ex in TaxExemption.objects.filter(is_active=True, customer=customer):
            exempt_ids.add(ex.tax_rate_id) if ex.tax_rate_id else exempt_ids.update(rate_ids)
    for ex in TaxExemption.objects.filter(is_active=True, product=product):
        exempt_ids.add(ex.tax_rate_id) if ex.tax_rate_id else exempt_ids.update(rate_ids)
    if product.category:
        for ex in TaxExemption.objects.filter(is_active=True, category=product.category):
            exempt_ids.add(ex.tax_rate_id) if ex.tax_rate_id else exempt_ids.update(rate_ids)
    return TaxRate.objects.filter(id__in=[r for r in rate_ids if r not in exempt_ids]).order_by("priority")


def compute_line_tax(product, line_subtotal, customer=None):
    """Return list of {rate_id, code, rate, taxable, amount, mode} for a line."""
    rates = _active_rates_for(product, customer)
    base = Decimal(line_subtotal)
    out = []
    running = base
    for r in rates:
        if r.mode == TaxRate.MODE_INCLUSIVE:
            # extract tax from inclusive price
            taxable = base / (Decimal("1") + r.rate)
            amount = base - taxable
        else:
            taxable = running if r.compound_style == TaxRate.COMPOUND_COMPOUND else base
            amount = taxable * r.rate
        out.append({"rate_id": r.id, "code": r.code, "rate": str(r.rate), "mode": r.mode,
                    "taxable": str(round(taxable, 4)), "amount": str(round(amount, 4))})
        if r.compound_style == TaxRate.COMPOUND_COMPOUND:
            running = running + amount
    return out


@transaction.atomic
def compute_order_tax(order, customer=None):
    """Recompute the order's tax from its items and persist a TaxBreakdown."""
    TaxBreakdown.objects.filter(order=order).delete()
    total_tax = Decimal("0")
    breakdown = []
    for item in order.items.all():
        lines = compute_line_tax(item.product, item.subtotal, customer)
        for ln in lines:
            amount = Decimal(ln["amount"])
            total_tax += amount
            TaxBreakdown.objects.create(order=order, tax_rate_id=ln["rate_id"],
                                         tax_rate_code=ln["code"], rate=Decimal(ln["rate"]),
                                         taxable_amount=Decimal(ln["taxable"]),
                                         tax_amount=amount, mode=ln["mode"])
    order.tax = total_tax
    order.total = Decimal(order.subtotal) - Decimal(order.discount) + total_tax
    order.save(update_fields=["tax", "total"])
    return total_tax


def tax_report(period_start, period_end):
    """Aggregate collected tax by rate code over a date range."""
    qs = TaxBreakdown.objects.filter(order__created_at__date__gte=period_start,
                                     order__created_at__date__lte=period_end,
                                     order__status__in=["paid", "partially_refunded"])
    by_code = {}
    total_taxable = Decimal("0")
    total_tax = Decimal("0")
    for b in qs:
        key = b.tax_rate_code or "UNKNOWN"
        by_code.setdefault(key, {"taxable": Decimal("0"), "tax": Decimal("0"), "rate": str(b.rate)})
        by_code[key]["taxable"] += b.taxable_amount
        by_code[key]["tax"] += b.tax_amount
        total_taxable += b.taxable_amount
        total_tax += b.tax_amount
    return {
        "period_start": str(period_start),
        "period_end": str(period_end),
        "total_taxable": str(total_taxable),
        "total_tax_collected": str(total_tax),
        "by_rate": [{"code": k, "rate": v["rate"], "taxable": str(v["taxable"]),
                     "tax": str(v["tax"])} for k, v in by_code.items()],
    }