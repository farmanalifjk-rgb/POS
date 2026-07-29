import secrets
from decimal import Decimal
from django.db import transaction

from pos.models import Customer, Order
from .models import (CustomerCreditLimit, LoyaltyEvent, CustomerPortalToken)


@transaction.atomic
def apply_credit(*, customer, amount, terms_days=0, user=None):
    cl, _ = CustomerCreditLimit.objects.get_or_create(customer=customer,
                                                      defaults={"limit": Decimal(amount), "terms_days": terms_days})
    cl.limit = Decimal(amount)
    cl.terms_days = terms_days
    cl.is_active = True
    cl.save(update_fields=["limit", "terms_days", "is_active"])
    return cl


@transaction.atomic
def consume_credit(*, customer, amount):
    cl = CustomerCreditLimit.objects.filter(customer=customer, is_active=True).first()
    if not cl:
        raise ValueError("No credit limit set")
    if Decimal(cl.used) + Decimal(amount) > Decimal(cl.limit):
        raise ValueError("Exceeds credit limit")
    cl.used = Decimal(cl.used) + Decimal(amount)
    cl.save(update_fields=["used"])
    return cl


@transaction.atomic
def release_credit(*, customer, amount):
    cl = CustomerCreditLimit.objects.get(customer=customer)
    cl.used = max(Decimal("0"), Decimal(cl.used) - Decimal(amount))
    cl.save(update_fields=["used"])
    return cl


@transaction.atomic
def earn_loyalty(*, customer, points, order=None, note="", user=None):
    customer.loyalty_points = (customer.loyalty_points or 0) + int(points)
    customer.save(update_fields=["loyalty_points"])
    return LoyaltyEvent.objects.create(customer=customer, kind=LoyaltyEvent.KIND_EARN,
                                        points=points, order=order, note=note, created_by=user)


@transaction.atomic
def burn_loyalty(*, customer, points, order=None, note="", user=None):
    pts = int(points)
    if pts > (customer.loyalty_points or 0):
        raise ValueError("Not enough loyalty points")
    customer.loyalty_points = (customer.loyalty_points or 0) - pts
    customer.save(update_fields=["loyalty_points"])
    return LoyaltyEvent.objects.create(customer=customer, kind=LoyaltyEvent.KIND_BURN,
                                        points=-pts, order=order, note=note, created_by=user)


def issue_portal_token(customer):
    token, _ = CustomerPortalToken.objects.update_or_create(
        customer=customer,
        defaults={"token": secrets.token_urlsafe(32), "email": customer.email, "is_active": True},
    )
    return token