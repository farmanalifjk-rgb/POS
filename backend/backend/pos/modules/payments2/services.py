import secrets
from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from pos.models import Order, Payment, Refund
from .models import (GiftCard, GiftCardTransaction, StoreCredit, StoreCreditTransaction,
                     TenderedPayment, PaymentReconciliation, ReconciliationLine, RefundCreditNote)


def _gen_code(prefix="GC"):
    return f"{prefix}-{secrets.token_hex(6).upper()}"


@transaction.atomic
def issue_gift_card(*, initial_balance, customer=None, expires_at=None, user=None, code=None):
    gc = GiftCard.objects.create(code=code or _gen_code(), initial_balance=initial_balance,balance=initial_balance, issued_to=customer, expires_at=expires_at,created_by=user)
    GiftCardTransaction.objects.create(gift_card=gc, kind=GiftCardTransaction.KIND_ISSUE, amount=initial_balance, created_by=user)
    return gc


@transaction.atomic
def topup_gift_card(gift_card_id, amount, user=None):
    gc = GiftCard.objects.get(pk=gift_card_id)
    gc.balance = Decimal(gc.balance) + Decimal(amount)
    gc.save(update_fields=["balance"])
    GiftCardTransaction.objects.create(gift_card=gc, kind=GiftCardTransaction.KIND_TOPUP, amount=amount, created_by=user)
    return gc


@transaction.atomic
def redeem_gift_card(code, amount, order=None, user=None):
    gc = GiftCard.objects.select_for_update().get(code=code, is_active=True)
    amount = Decimal(amount)
    if amount > gc.balance:
        raise ValueError("Gift card balance insufficient")
    gc.balance = Decimal(gc.balance) - amount
    gc.save(update_fields=["balance"])
    GiftCardTransaction.objects.create(gift_card=gc, kind=GiftCardTransaction.KIND_REDEEM, amount=amount,order=order, created_by=user)
    return gc


def _get_wallet(customer):
    wallet, _ = StoreCredit.objects.get_or_create(customer=customer)
    return wallet


@transaction.atomic
def issue_store_credit(*, customer, amount, order=None, note="", user=None):
    wallet = _get_wallet(customer)
    wallet.balance = Decimal(wallet.balance) + Decimal(amount)
    wallet.save(update_fields=["balance"])
    return StoreCreditTransaction.objects.create(store_credit=wallet, kind=StoreCreditTransaction.KIND_ISSUE,amount=amount, order=order, note=note, created_by=user)


@transaction.atomic
def redeem_store_credit(*, customer, amount, order=None, user=None):
    wallet = _get_wallet(customer)
    amount = Decimal(amount)
    if amount > wallet.balance:
        raise ValueError("Store credit balance insufficient")
    wallet.balance = Decimal(wallet.balance) - amount
    wallet.save(update_fields=["balance"])
    return StoreCreditTransaction.objects.create(store_credit=wallet, kind=StoreCreditTransaction.KIND_REDEEM,amount=amount, order=order, created_by=user)


@transaction.atomic
def record_tender(*, order, tender_type, amount, reference="", user=None):
    return TenderedPayment.objects.create(order=order, tender_type=tender_type, amount=amount,reference=reference, created_by=user)


@transaction.atomic
def settle_order(*, order, tenders, user=None):
    """tenders: list of {tender_type, amount, reference}. Splits + partials handled here."""
    total = Decimal(order.total)
    paid = Decimal("0")
    for t in tenders:
        amt = Decimal(t["amount"])
        kind = t["tender_type"]
        if kind == TenderedPayment.TENDER_GIFT_CARD:
            redeem_gift_card(t["reference"], amt, order=order, user=user)
        elif kind == TenderedPayment.TENDER_STORE_CREDIT:
            if order.customer:
                redeem_store_credit(customer=order.customer, amount=amt, order=order, user=user)
            else:
                raise ValueError("Store credit needs a customer")
        record_tender(order=order, tender_type=kind, amount=amt, reference=t.get("reference", ""), user=user)
        Payment.objects.create(order=order, amount=amt, payment_method=kind)
        paid += amt
        if paid >= total:
            break
    if paid < total:
        raise ValueError("Underpayment: paid %s of %s" % (paid, total))
    order.status = "paid"
    order.save(update_fields=["status"])
    return order


@transaction.atomic
def reconcile_session(*, session, counted_lines, user=None):
    """counted_lines: list of {tender_type, counted_amount, note}."""
    rec = PaymentReconciliation.objects.create(session=session, created_by=user)
    expected_total = Decimal("0")
    counted_total = Decimal("0")
    for line in counted_lines:
        kind = line["tender_type"]
        expected = Decimal(sum(
            (p.amount for p in TenderedPayment.objects.filter(order__session=session, tender_type=kind)), Decimal("0")
        ))
        counted = Decimal(line["counted_amount"])
        ReconciliationLine.objects.create(reconciliation=rec, tender_type=kind,expected_amount=expected, counted_amount=counted,variance=counted - expected, note=line.get("note", ""))
        expected_total += expected
        counted_total += counted
    rec.expected_total = expected_total
    rec.counted_total = counted_total
    rec.variance = counted_total - expected_total
    rec.status = PaymentReconciliation.STATUS_MATCHED if rec.variance == 0 else PaymentReconciliation.STATUS_DISCREPANCY
    rec.save()
    return rec


@transaction.atomic
def refund_as_store_credit(*, refund, customer, user=None):
    note = RefundCreditNote.objects.create(refund=refund, customer=customer,amount=refund.total_amount, code=_gen_code("CN"))
    issue_store_credit(customer=customer, amount=refund.total_amount, note=f"Credit note {note.code}", user=user)
    return note