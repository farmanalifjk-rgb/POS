from .models import PurchaseOrder

def generate_purchase_order_number():

    last = PurchaseOrder.objects.order_by("-id").first()

    if not last:
        return "PO-000001"

    number = int(
        last.order_number.replace("PO-", "")
    ) + 1

    return f"PO-{number:06d}"