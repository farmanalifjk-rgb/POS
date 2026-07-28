from django.db import models
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# ─── NEW: Brand ───────────────────────────────────────────────────────────────
class Brand(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to="brands/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    # ─── NEW: brand FK ─────────────────────────────────────────────────────────
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    barcode = models.CharField(max_length=100, unique=True, blank=True, null=True)
    description = models.CharField(max_length=500,blank=True, null=True)

    sales_price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)

    stock_quantity = models.IntegerField(default=0)

    min_stock = models.PositiveIntegerField(default=0)

    max_stock = models.PositiveIntegerField(null=True,blank=True)

    unit = models.CharField(max_length=20,default="Piece")

    image = models.ImageField(upload_to="products/", blank=True, null=True)

    is_active = models.BooleanField(default=True)

    # ─── NEW: optional, gated behind ProductSettings.enable_expiry / enable_batch_number ──
    expiry_date = models.DateField(null=True, blank=True)
    batch_number = models.CharField(max_length=100, blank=True, default="")

    def __str__(self):
        return self.name




class Customer(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)

    # ─── NEW: loyalty + grouping (Customer settings tab) ───────────────────
    group = models.ForeignKey(
        "pos.CustomerGroup", on_delete=models.SET_NULL, null=True, blank=True, related_name="customers"
    )
    loyalty_points = models.PositiveIntegerField(default=0)
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name


class CashSession(models.Model):
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2)
    closing_balance = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    actual_closing_balance = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_open = models.BooleanField(default=True)
    next_draft_number = models.IntegerField(default=1)
    employee_name = models.CharField(max_length=150,blank=True,default="")
    notes = models.TextField(blank=True, default="")

    def __str__(self):
        return f"Session #{self.id}"

class CashTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('in', 'Cash In'),
        ('out', 'Cash Out'),
    ]
    session = models.ForeignKey(CashSession, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type.upper()} - {self.amount} - {self.reason}"


class Order(models.Model):

    PAYMENT_CHOICES = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("bank", "Bank Transfer"),
    ]
    STATUS_CHOICES = [
    ('draft', 'Draft'),
    ('paid', 'Paid'),
    ("partially_refunded","Partially Refunded"),
    ("refunded", "Refunded"),
    ('cancelled', 'Cancelled'),
    ]

    customer = models.ForeignKey(Customer,on_delete=models.SET_NULL,null=True,blank=True)
    note = models.TextField(blank=True, default="")
    session = models.ForeignKey(CashSession,on_delete=models.SET_NULL,null=True,related_name="orders")
    created_at = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=20,choices=PAYMENT_CHOICES)
    subtotal = models.DecimalField(max_digits=12,decimal_places=2,default=0)
    tax = models.DecimalField(max_digits=12,decimal_places=2,default=0)
    discount = models.DecimalField(max_digits=12,decimal_places=2,default=0)
    total = models.DecimalField(max_digits=12,decimal_places=2,default=0)
    status = models.CharField(max_length=20,choices=STATUS_CHOICES,default='draft')
    # The number is assigned after the database has allocated the order ID.
    # Nullable values prevent concurrent checkouts from colliding on an empty
    # unique value during that first insert.
    order_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    amount_received = models.DecimalField(max_digits=12,decimal_places=2,default=0)
    change_amount = models.DecimalField(max_digits=12,decimal_places=2,default=0)

    def save(self, *args, **kwargs):

        is_new = self.pk is None

        super().save(*args, **kwargs)

        if is_new and not self.order_number:
            self.order_number = f"POS-{self.id:06d}"
            super().save(update_fields=["order_number"])

    def __str__(self):
        return f"Order #{self.id}"
        


class OrderItem(models.Model):
    order = models.ForeignKey(Order,on_delete=models.CASCADE,related_name="items")
    product = models.ForeignKey(Product,on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10,decimal_places=2)
    unit_price = models.DecimalField(max_digits=10,decimal_places=2)
    subtotal = models.DecimalField(max_digits=12,decimal_places=2)

    def __str__(self):
        return self.product.name


class Payment(models.Model):
    order = models.ForeignKey(Order,on_delete=models.CASCADE,related_name="payments")
    amount = models.DecimalField(max_digits=12,decimal_places=2)
    payment_method = models.CharField(max_length=20)
    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id}"
    

class DraftOrder(models.Model):

    session = models.ForeignKey(CashSession, on_delete=models.CASCADE)
    order_number = models.IntegerField()
    status = models.CharField(max_length=20,default="draft")
    customer = models.ForeignKey(Customer,on_delete=models.SET_NULL,null=True,blank=True)
    note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    


class DraftOrderItem(models.Model):

    draft_order = models.ForeignKey(DraftOrder,on_delete=models.CASCADE,related_name="items")
    product = models.ForeignKey(Product,on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    unit_price = models.DecimalField(max_digits=12,decimal_places=2)        


class StockMovement(models.Model):

    MOVEMENT_TYPES = [
    
        ("purchase", "Purchase"),
    
        ("sale", "Sale"),
    
        ("refund", "Refund"),
    
        ("purchase_return", "Purchase Return"),
    
        ("adjustment", "Adjustment"),
    
        ("damage", "Damage"),
    
    ]

    product = models.ForeignKey(Product,on_delete=models.CASCADE)

    reference = models.CharField(max_length=50,blank=True)

    quantity = models.IntegerField()

    movement_type = models.CharField(max_length=20,choices=MOVEMENT_TYPES)

    previous_stock = models.PositiveIntegerField(null=True,blank=True)

    new_stock = models.PositiveIntegerField(null=True,blank=True)

    note = models.CharField(max_length=255,blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.movement_type}"
    
    class Meta:
        ordering = ["-created_at"]



class Company(models.Model):

    PAPER_CHOICES = [
    ("58mm", "58mm Thermal"),
    ("80mm", "80mm Thermal"),
    ("A5", "A5"),
    ("A4", "A4"),
    ]

    name = models.CharField(max_length=200)
    tagline = models.CharField(max_length=200,blank=True)
    address = models.TextField()
    phone = models.CharField(max_length=50,blank=True)
    email = models.EmailField(blank=True)
    website = models.CharField(max_length=200,blank=True)
    tax_number = models.CharField(max_length=100,blank=True)
    footer_message = models.TextField(blank=True,default="Thank you for your purchase!")
    logo = models.ImageField(upload_to="company/",null=True,blank=True)
    currency = models.CharField(max_length=20,default="Rs")
    receipt_paper = models.CharField(max_length=10,choices=PAPER_CHOICES,default="80mm")
    gst = models.CharField(max_length=50,blank=True,default="")

    # ─── NEW: Business Information ─────────────────────────────────────────
    legal_name = models.CharField(max_length=200, blank=True)
    cover_image = models.ImageField(upload_to="company/covers/", null=True, blank=True)
    business_type = models.CharField(max_length=30, blank=True, default="retail", choices=[
        ("retail", "Retail"), ("restaurant", "Restaurant"), ("grocery", "Grocery"),
        ("pharmacy", "Pharmacy"), ("salon", "Salon / Services"), ("wholesale", "Wholesale"), ("other", "Other"),
    ])
    industry = models.CharField(max_length=100, blank=True)
    business_registration_number = models.CharField(max_length=100, blank=True)

    # ─── NEW: Address (structured) ─────────────────────────────────────────
    country = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    full_address = models.TextField(blank=True)

    # ─── NEW: Receipt Information ──────────────────────────────────────────
    receipt_header = models.TextField(blank=True)
    thank_you_message = models.CharField(max_length=255, blank=True, default="Thank you for your purchase!")
    return_policy = models.TextField(blank=True)
    show_qr_code_on_receipt = models.BooleanField(default=True)
    show_logo_on_receipt = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Refund(models.Model):

    order = models.ForeignKey(Order,on_delete=models.CASCADE,related_name="refunds")
    reason = models.TextField(blank=True)

    subtotal = models.DecimalField(max_digits=12,decimal_places=2,default=0)

    discount = models.DecimalField(max_digits=12,decimal_places=2,default=0)

    tax = models.DecimalField(max_digits=12,decimal_places=2,default=0)

    total_amount = models.DecimalField(max_digits=12,decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)       


class RefundItem(models.Model):

    refund = models.ForeignKey(Refund,on_delete=models.CASCADE,related_name="items")
    order_item = models.ForeignKey(OrderItem,on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=2,default=0)
    amount = models.DecimalField(max_digits=12,decimal_places=2)
    
   
class StockAdjustment(models.Model):

    ADJUSTMENT_TYPES = [

        ("increase", "Increase"),

        ("decrease", "Decrease"),

    ]

    adjustment_number = models.CharField(max_length=20,unique=True,)

    adjustment_type = models.CharField(max_length=20,choices=ADJUSTMENT_TYPES,)

    reason = models.CharField(max_length=255,)

    note = models.TextField(blank=True,)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,)

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):

        return self.adjustment_number
    
    def save(self, *args, **kwargs):

        if not self.adjustment_number:

            last = StockAdjustment.objects.order_by(
                "-id"
            ).first()

            next_id = 1 if not last else last.id + 1

            self.adjustment_number = (
                f"SA-{next_id:06d}"
            )

        super().save(*args, **kwargs)
    

class StockAdjustmentItem(models.Model):

    adjustment = models.ForeignKey(StockAdjustment,related_name="items",on_delete=models.CASCADE,)

    product = models.ForeignKey(Product,on_delete=models.CASCADE,)

    quantity = models.PositiveIntegerField()

    previous_stock = models.PositiveIntegerField()

    new_stock = models.PositiveIntegerField()

    note = models.CharField(max_length=255,blank=True,)

    def __str__(self):

        return self.product.name    


class Supplier(models.Model):

    name = models.CharField(max_length=255)

    company = models.CharField(
        max_length=255,
        blank=True
    )

    contact_person = models.CharField(
        max_length=255,
        blank=True
    )

    phone = models.CharField(max_length=30)

    email = models.EmailField(
        blank=True
    )

    address = models.TextField(
        blank=True
    )

    tax_number = models.CharField(
        max_length=100,
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class PurchaseOrder(models.Model):

    STATUS_CHOICES = [

        ("draft", "Draft"),

        ("ordered", "Ordered"),

        ("received", "Received"),

        ("cancelled", "Cancelled"),

    ]

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
    )

    order_number = models.CharField(
        max_length=30,
        unique=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft",
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    tax = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    supplier_invoice_number = models.CharField(max_length=100,blank=True)

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    note = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.order_number


class PurchaseOrderItem(models.Model):

    purchase_order = models.ForeignKey(PurchaseOrder,related_name="items",on_delete=models.CASCADE,)

    product = models.ForeignKey(Product,on_delete=models.PROTECT,)

    quantity = models.PositiveIntegerField()

    received_quantity = models.PositiveIntegerField(default=0)

    unit_cost = models.DecimalField(max_digits=10,decimal_places=2,)

    subtotal = models.DecimalField(max_digits=12,decimal_places=2,)

    returned_quantity = models.PositiveIntegerField(default=0)


class PurchaseReturn(models.Model):

    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.PROTECT,
        related_name="returns"
    )

    reason = models.TextField(
        blank=True
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return f"PR-{self.id:06d}"


class PurchaseReturnItem(models.Model):

    purchase_return = models.ForeignKey(
        PurchaseReturn,
        related_name="items",
        on_delete=models.CASCADE,
    )

    purchase_item = models.ForeignKey(
        PurchaseOrderItem,
        on_delete=models.PROTECT,
    )

    quantity = models.PositiveIntegerField()

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    def __str__(self):
        return self.purchase_item.product.name


# ═══════════════════════════════════════════════════════════════════════════════
# NEW MODELS — added for Products / Configuration tabs
# ═══════════════════════════════════════════════════════════════════════════════

class Variant(models.Model):
    """Variant type, e.g. 'Color', 'Size'."""
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class VariantValue(models.Model):
    """Individual value for a Variant, e.g. 'Red' for 'Color'."""
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE, related_name="values")
    value = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.variant.name}: {self.value}"

    class Meta:
        unique_together = ("variant", "value")


class Tax(models.Model):
    TAX_TYPES = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed Amount"),
    ]

    name = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=6, decimal_places=2)
    tax_type = models.CharField(max_length=20, choices=TAX_TYPES, default="percentage")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.rate}%)"

    class Meta:
        ordering = ["-is_default", "name"]


class PaymentMethod(models.Model):
    METHOD_TYPES = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("bank", "Bank Transfer"),
        ("mobile", "Mobile Payment"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=100)
    method_type = models.CharField(max_length=20, choices=METHOD_TYPES, default="cash")
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # ─── NEW: presentation for the POS payment screen ──────────────────────
    icon = models.CharField(max_length=50, blank=True, default="wallet", help_text="Lucide icon name")
    color = models.CharField(max_length=20, blank=True, default="#6366F1")

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["-is_default", "name"]


class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # ─── NEW: security tab support (password expiry) ──────────────────────
    password_changed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.user.username



# NEW settings-module models live in models_settings.py, imported here so
# Django app registry discovers them.
from .modules.system.models import *  # noqa

# NEW auth models (expiring tokens, OTPs) live in models_auth.py.
from .modules.auth.models import *  # noqa

# Enterprise location and warehouse models.
from .modules.enterprise.models import *  # noqa
