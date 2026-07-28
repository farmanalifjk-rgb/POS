from rest_framework import serializers
from .models import *
from decimal import Decimal
from django.db import transaction
from .services.inventory import update_stock


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    stock_status = serializers.SerializerMethodField()
    stock_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"

    def get_stock_status(self, obj):

        if obj.stock_quantity == 0:
            return "Out of Stock"

        if obj.stock_quantity <= obj.min_stock:
            return "Low Stock"

        if (
            obj.max_stock is not None and
            obj.stock_quantity > obj.max_stock
        ):
            return "Overstock"

        return "In Stock"

    def get_stock_percentage(self, obj):

        if not obj.max_stock:
            return None

        if obj.max_stock == 0:
            return 0

        percentage = (obj.stock_quantity / obj.max_stock) * 100

        return round(percentage, 1)

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class CashSessionSerializer(serializers.ModelSerializer):
    expected_cash = serializers.SerializerMethodField()
    difference = serializers.SerializerMethodField()
    total_sales = serializers.SerializerMethodField()
    cash_payments = serializers.SerializerMethodField()
    card_payments = serializers.SerializerMethodField()
    bank_payments = serializers.SerializerMethodField()
    total_orders = serializers.SerializerMethodField()

    class Meta:
        model = CashSession
        fields = '__all__'

    def get_total_sales(self, obj):
        from django.db.models import Sum
        return obj.orders.exclude(status='draft').exclude(status='cancelled').aggregate(total=Sum('total'))['total'] or 0

    def get_total_orders(self, obj):
        return obj.orders.exclude(status='draft').exclude(status='cancelled').count()

    def get_cash_payments(self, obj):
        from django.db.models import Sum
        return obj.orders.exclude(status='draft').exclude(status='cancelled').filter(payment_method='cash').aggregate(total=Sum('total'))['total'] or 0

    def get_card_payments(self, obj):
        from django.db.models import Sum
        return obj.orders.exclude(status='draft').exclude(status='cancelled').filter(payment_method='card').aggregate(total=Sum('total'))['total'] or 0

    def get_bank_payments(self, obj):
        from django.db.models import Sum
        return obj.orders.exclude(status='draft').exclude(status='cancelled').filter(payment_method='bank').aggregate(total=Sum('total'))['total'] or 0

    def get_expected_cash(self, obj):
        cash_sales = self.get_cash_payments(obj)
        from django.db.models import Sum
        cash_in = obj.transactions.filter(transaction_type='in').aggregate(total=Sum('amount'))['total'] or 0
        cash_out = obj.transactions.filter(transaction_type='out').aggregate(total=Sum('amount'))['total'] or 0
        return (obj.opening_balance or 0) + cash_sales + cash_in - cash_out

    def get_difference(self, obj):
        if obj.actual_closing_balance is not None:
            return obj.actual_closing_balance - self.get_expected_cash(obj)
        return 0

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(
        source="product.image",
        read_only=True
    )
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "quantity",
            "unit_price",
            "subtotal",
            "image",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Order
        fields = "__all__"       
        


class CartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_quantity(self, quantity):
        if quantity <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return quantity


class CheckoutSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField(required=False, allow_null=True)
    draft_order_id = serializers.IntegerField(required=False, allow_null=True)
    payment_method = serializers.CharField()
    discount = serializers.DecimalField(max_digits=10,decimal_places=2,required=False,default=0)
    items = CartItemSerializer(many=True)
    amount_received = serializers.DecimalField(max_digits=12,decimal_places=2)

    def validate_amount_received(self, amount):
        if amount < 0:
            raise serializers.ValidationError("Amount received cannot be negative.")
        return amount

    def validate_payment_method(self, payment_method):
        allowed = {value for value, _label in Order.PAYMENT_CHOICES}
        if payment_method not in allowed:
            raise serializers.ValidationError("Unsupported payment method.")
        return payment_method

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("At least one item is required to checkout.")
        return items

    def create(self, validated_data):
    
        with transaction.atomic():
        
            payment_method = validated_data["payment_method"]
            discount = validated_data.get("discount", Decimal("0.00"))
            items_data = validated_data["items"]
            draft_order_id = validated_data.get("draft_order_id")
            amount_received = validated_data.get("amount_received",Decimal("0.00"))
    
            # Customer and draft are optional. Initialise this before checking
            # its attributes so a direct (non-draft) checkout is always safe.
            customer = None
            draft = None

            customer_id = validated_data.get("customer_id")
            if customer_id is not None:
                try:
                    customer = Customer.objects.get(id=customer_id)
                except Customer.DoesNotExist:
                    raise serializers.ValidationError("Customer was not found.")

            if draft_order_id:
                draft = DraftOrder.objects.select_for_update().filter(id=draft_order_id).first()
                if not draft:
                    raise serializers.ValidationError("Draft order was not found.")

            if draft and customer is None:
                customer = draft.customer
    
            # Active session required
            session = CashSession.objects.filter(is_open=True).first()
    
            if not session:
                raise serializers.ValidationError(
                    "No active session found. Open session first."
                )
            
            # Create order first
            order = Order.objects.create(
                customer=customer,
                session=session,
                payment_method=payment_method,
                subtotal=0,
                discount=0,
                tax=0,
                total=0,
                note=draft.note if draft else ""
            )
    
            subtotal_amount = Decimal("0.00")
    
            # Process items
            for item in items_data:
            
                # Lock each product row for the entire checkout. This prevents
                # simultaneous cashiers from both selling the final unit.
                try:
                    product = Product.objects.select_for_update().get(id=item["product_id"])
                except Product.DoesNotExist:
                    raise serializers.ValidationError(f"Product {item['product_id']} was not found.")
    
                qty = item["quantity"]
    
                # Stock check
                if product.stock_quantity < qty:
                    raise serializers.ValidationError(
                        f"Not enough stock for {product.name}"
                    )
    
                # Reduce stock
                update_stock(
                    product=product,
                    quantity=-qty,
                    movement_type="sale",
                    reference=order.order_number,
                    note=f"Order #{order.order_number}",
                )
    
                # Calculate line subtotal
                line_subtotal = product.sales_price * qty
    
                subtotal_amount += line_subtotal
    
                # Create order item
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    unit_price=product.sales_price,
                    subtotal=line_subtotal
                )
    
            # Validate discount
            if discount < 0:
                raise serializers.ValidationError(
                    "Discount cannot be negative."
                )
    
            if discount > subtotal_amount:
                raise serializers.ValidationError(
                    "Discount cannot exceed subtotal."
                )
    
            # Use the configured default tax when one exists. A default tax is
            # global because products do not yet carry a tax category; this is
            # still safer and more configurable than a hidden hard-coded rate.
            default_tax = Tax.objects.filter(is_active=True, is_default=True).first()
            if default_tax is None:
                tax = Decimal("0.00")
            elif default_tax.tax_type == "fixed":
                tax = default_tax.rate
            else:
                tax = (subtotal_amount - discount) * (default_tax.rate / Decimal("100"))
    
            # Final total
            total = subtotal_amount - discount + tax

            if payment_method == "cash" and amount_received < total:
                raise serializers.ValidationError("Amount received is less than total.")
    
            # Update order totals
            order.subtotal = subtotal_amount
            order.discount = discount
            order.tax = tax
            order.total = total

            order.amount_received = amount_received

            order.change_amount = (
            amount_received - total
            if payment_method == "cash"
            else Decimal("0.00"))

            order.status = "paid"
            order.save()

            Payment.objects.create(
                order=order,
                amount=total,
                payment_method=payment_method,
            )

            if draft_order_id:
                DraftOrder.objects.filter(
                    id=draft_order_id
                ).delete()
    
            return order
        

class DraftOrderSerializer(serializers.ModelSerializer):

    customer_id = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()

    class Meta:
        model = DraftOrder
        fields = "__all__"

    def get_customer_id(self, obj):
        return obj.customer.id if obj.customer else None

    def get_payment_method(self, obj):
        return "Cash"


class DraftOrderItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(source="product.name",read_only=True)
    sales_price = serializers.DecimalField(source="product.sales_price",max_digits=10,decimal_places=2,read_only=True)
    image = serializers.ImageField(source="product.image",read_only=True)

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = DraftOrderItem
        fields = [
            "product_name",
            "id",
            "product",
            "quantity",
            "sales_price",
            "subtotal",
            "image",
        ]

    def get_subtotal(self, obj):
        return obj.product.sales_price * obj.quantity
    

class CompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company
        fields = "__all__"        


class OrderHistorySerializer(serializers.ModelSerializer):

    customer_name = serializers.SerializerMethodField()
    record_type = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer_name",
            "payment_method",
            "total",
            "created_at",
            "status",
            "record_type",
        ]

    def get_customer_name(self, obj):
        if obj.customer:
            return obj.customer.name
        return "Walk-in Customer"
    
    def get_record_type(self, obj):
        return "order"
    

class DraftOrderHistorySerializer(serializers.ModelSerializer):

    customer = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    record_type = serializers.SerializerMethodField()

    class Meta:
        model = DraftOrder
        fields = [
            "id",
            "order_number",
            "customer",
            "total",
            "payment_method",
            "created_at",
            "status",
            "record_type",
        ]

    def get_customer(self, obj):
        return obj.customer.name if obj.customer else "Walk-in Customer"

    def get_total(self, obj):
        total = 0

        for item in obj.items.all():
            total += item.product.sales_price * item.quantity

        return total

    def get_payment_method(self, obj):
        return "Cash"

    def get_status(self, obj):
        return "draft"

    def get_record_type(self, obj):
        return "draft"


class StockAdjustmentItemSerializer(serializers.Serializer):

    product_id = serializers.IntegerField()

    adjustment_type = serializers.ChoiceField(
        choices=["increase", "decrease"]
    )

    quantity = serializers.IntegerField(min_value=1)

    note = serializers.CharField(
        required=False,
        allow_blank=True
    )


class StockAdjustmentSerializer(serializers.Serializer):

    reason = serializers.CharField()

    note = serializers.CharField(
        required=False,
        allow_blank=True
    )

    items = StockAdjustmentItemSerializer(
        many=True
    )         


class InventorySerializer(serializers.ModelSerializer):

    category = serializers.CharField(
        source="category.name",
        default="",
        read_only=True
    )

    image_url = serializers.SerializerMethodField()

    stock_status = serializers.SerializerMethodField()

    inventory_value = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = [
            "id",
            "name",
            "sku",
            "barcode",
            "description",

            "category",

            "sales_price",
            "cost_price",

            "stock_quantity",
            "min_stock",
            "max_stock",
            "unit",

            "image_url",

            "stock_status",
            "inventory_value",

            "is_active",
        ]

    def get_stock_status(self, obj):

        if obj.stock_quantity <= 0:
            return "Out of Stock"

        elif obj.stock_quantity <= obj.min_stock:
            return "Low Stock"

        return "In Stock"

    def get_inventory_value(self, obj):
        return float(obj.cost_price) * obj.stock_quantity

    def get_image_url(self, obj):

        if not obj.image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(obj.image.url)

        return obj.image.url
    

    def get_stock_status(self, obj):

        if obj.stock_quantity <= 0:
            return "Out of Stock"

        if obj.stock_quantity <= 10:
            return "Low Stock"

        return "In Stock"

    def get_inventory_value(self, obj):

        return obj.stock_quantity * obj.cost_price        


class StockMovementSerializer(serializers.ModelSerializer):

    product = serializers.CharField(source="product.name")

    image = serializers.ImageField(
        source="product.image",
        read_only=True
    )

    movement = serializers.CharField(
        source="get_movement_type_display"
    )

    class Meta:
        model = StockMovement

        fields = [
            "id",
            "product",
            "image",
            "movement_type",
            "movement",
            "quantity",
            "previous_stock",
            "new_stock",
            "reference",
            "note",
            "created_at",
        ]


class ProductDetailSerializer(serializers.ModelSerializer):

    category = serializers.CharField(
        source="category.name",
        read_only=True
    )

    stock_status = serializers.SerializerMethodField()

    profit_per_unit = serializers.SerializerMethodField()

    markup_percentage = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:

        model = Product

        fields = [

            "id",

            "name",

            "sku",

            "barcode",

            "category",

            "sales_price",

            "cost_price",

            "stock_quantity",

            "min_stock",

            "max_stock",

            "unit",

            "image",
            "image_url",

            "stock_status",

            "profit_per_unit",

            "markup_percentage",

            "is_active",

        ]

    def get_stock_status(self, obj):

        if obj.stock_quantity == 0:
            return "Out of Stock"

        if obj.stock_quantity <= obj.min_stock:
            return "Low Stock"

        if (
            obj.max_stock and
            obj.stock_quantity > obj.max_stock
        ):
            return "Overstock"

        return "In Stock"

    def get_stock_percentage(self, obj):

        if not obj.max_stock:
            return None

        if obj.max_stock == 0:
            return 0

        percentage = (obj.stock_quantity / obj.max_stock) * 100

        return round(percentage, 1)

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class CashSessionSerializer(serializers.ModelSerializer):
    expected_cash = serializers.SerializerMethodField()
    difference = serializers.SerializerMethodField()
    total_sales = serializers.SerializerMethodField()
    cash_payments = serializers.SerializerMethodField()
    card_payments = serializers.SerializerMethodField()
    bank_payments = serializers.SerializerMethodField()
    total_orders = serializers.SerializerMethodField()

    class Meta:
        model = CashSession
        fields = '__all__'

    def get_total_sales(self, obj):
        from django.db.models import Sum
        return obj.orders.exclude(status='draft').exclude(status='cancelled').aggregate(total=Sum('total'))['total'] or 0

    def get_total_orders(self, obj):
        return obj.orders.exclude(status='draft').exclude(status='cancelled').count()

    def get_cash_payments(self, obj):
        from django.db.models import Sum
        return obj.orders.exclude(status='draft').exclude(status='cancelled').filter(payment_method='cash').aggregate(total=Sum('total'))['total'] or 0

    def get_card_payments(self, obj):
        from django.db.models import Sum
        return obj.orders.exclude(status='draft').exclude(status='cancelled').filter(payment_method='card').aggregate(total=Sum('total'))['total'] or 0

    def get_bank_payments(self, obj):
        from django.db.models import Sum
        return obj.orders.exclude(status='draft').exclude(status='cancelled').filter(payment_method='bank').aggregate(total=Sum('total'))['total'] or 0

    def get_expected_cash(self, obj):
        cash_sales = self.get_cash_payments(obj)
        from django.db.models import Sum
        cash_in = obj.transactions.filter(transaction_type='in').aggregate(total=Sum('amount'))['total'] or 0
        cash_out = obj.transactions.filter(transaction_type='out').aggregate(total=Sum('amount'))['total'] or 0
        return (obj.opening_balance or 0) + cash_sales + cash_in - cash_out

    def get_difference(self, obj):
        if obj.actual_closing_balance is not None:
            return obj.actual_closing_balance - self.get_expected_cash(obj)
        return 0

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(
        source="product.image",
        read_only=True
    )
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Supplier

        fields = "__all__"


class PurchaseOrderItemSerializer(serializers.Serializer):

    product = serializers.IntegerField()

    quantity = serializers.IntegerField()

    unit_cost = serializers.DecimalField(max_digits=10,decimal_places=2)

    class Meta:
        model = Supplier
        fields = "__all__"


class PurchaseOrderCreateSerializer(serializers.Serializer):

    supplier = serializers.IntegerField()

    note = serializers.CharField(
        required=False,
        allow_blank=True
    )

    items = PurchaseOrderItemSerializer(
        many=True
    )


class ReceiveItemSerializer(serializers.Serializer):

    purchase_item = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class ReceivePurchaseSerializer(serializers.Serializer):

    items = ReceiveItemSerializer(many=True)


class PurchaseOrderItemDetailSerializer(serializers.ModelSerializer):

    product = serializers.CharField(
        source="product.name"
    )

    class Meta:

        model = PurchaseOrderItem

        fields = [
            "id",
            "product",
            "quantity",
            "received_quantity",
            "unit_cost",
            "subtotal",
        ]


class PurchaseOrderListSerializer(serializers.ModelSerializer):

    supplier = serializers.CharField(
        source="supplier.name",
        read_only=True,
    )

    total_items = serializers.SerializerMethodField()

    class Meta:

        model = PurchaseOrder

        fields = [

            "id",

            "order_number",

            "supplier",

            "status",

            "subtotal",

            "tax",

            "total",

            "total_items",

            "created_at",

        ]

    def get_total_items(self, obj):

        return obj.items.count()

    
class PurchaseOrderDetailSerializer(serializers.ModelSerializer):

    supplier = serializers.CharField(
        source="supplier.name"
    )

    items = PurchaseOrderItemDetailSerializer(
        many=True
    )

    class Meta:

        model = PurchaseOrder

        fields = "__all__"


class PurchaseReturnItemSerializer(serializers.Serializer):

    purchase_item = serializers.IntegerField()

    quantity = serializers.IntegerField(
        min_value=1
    )


class PurchaseReturnSerializer(serializers.Serializer):

    reason = serializers.CharField(
        required=False,
        allow_blank=True
    )

    items = PurchaseReturnItemSerializer(
        many=True
    )


class PurchaseReturnListSerializer(serializers.ModelSerializer):

    purchase_order = serializers.CharField(
        source="purchase_order.order_number",
        read_only=True
    )

    supplier = serializers.CharField(
        source="purchase_order.supplier.name",
        read_only=True
    )

    total_items = serializers.SerializerMethodField()

    class Meta:

        model = PurchaseReturn

        fields = [

            "id",

            "purchase_order",

            "supplier",

            "total_amount",

            "total_items",

            "created_at",

        ]

    def get_total_items(self, obj):

        return obj.items.count()


class PurchaseReturnDetailSerializer(serializers.ModelSerializer):

    purchase_order = serializers.CharField(
        source="purchase_order.order_number"
    )

    supplier = serializers.CharField(
        source="purchase_order.supplier.name"
    )

    items = PurchaseReturnItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:

        model = PurchaseReturn

        fields = "__all__"


class PurchaseReturnItemDetailSerializer(serializers.ModelSerializer):

    product = serializers.CharField(
        source="purchase_item.product.name"
    )

    unit_cost = serializers.DecimalField(
        source="purchase_item.unit_cost",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = PurchaseReturnItem
        fields = [
            "product",
            "quantity",
            "unit_cost",
            "amount",
        ]


class StockAdjustmentListSerializer(serializers.ModelSerializer):

    created_by = serializers.CharField(
        source="created_by.username",
        default=None
    )

    total_items = serializers.SerializerMethodField()

    net_change = serializers.SerializerMethodField()

    class Meta:

        model = StockAdjustment

        fields = [

            "id",

            "adjustment_number",

            "reason",

            "note",

            "created_by",

            "created_at",

            "total_items",

            "net_change",

        ]

    def get_total_items(self, obj):

        return obj.items.count()

    def get_net_change(self, obj):

        total = 0

        for item in obj.items.all():

            total += item.new_stock - item.previous_stock

        return total


class StockAdjustmentItemDetailSerializer(serializers.ModelSerializer):

    product = serializers.CharField(
        source="product.name"
    )

    sku = serializers.CharField(
        source="product.sku"
    )

    adjustment_type = serializers.SerializerMethodField()

    class Meta:

        model = StockAdjustmentItem

        fields = [

            "product",

            "sku",

            "adjustment_type",

            "quantity",

            "previous_stock",

            "new_stock",

            "note",

        ]

    def get_adjustment_type(self, obj):

        if obj.new_stock > obj.previous_stock:
            return "increase"

        return "decrease"


class StockAdjustmentDetailSerializer(serializers.ModelSerializer):

    created_by = serializers.SerializerMethodField()

    items = StockAdjustmentItemDetailSerializer(
        many=True,
        read_only=True
    )

    class Meta:

        model = StockAdjustment

        fields = [

            "id",

            "adjustment_number",

            "reason",

            "note",

            "created_at",

            "created_by",

            "items",

        ]

    def get_created_by(self, obj):

        if obj.created_by:

            return obj.created_by.username

        return None  


class InventoryValuationSerializer(serializers.Serializer):

    total_products = serializers.IntegerField()

    total_stock_units = serializers.IntegerField()

    inventory_cost_value = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    inventory_sale_value = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    expected_profit = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )


class ProductInventoryValuationSerializer(serializers.ModelSerializer):

    category = serializers.CharField(
        source="category.name",
        default=""
    )

    cost_value = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        read_only=True,
    )

    sale_value = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        read_only=True,
    )

    expected_profit = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        read_only=True,
    )

    class Meta:

        model = Product

        fields = [

            "id",

            "name",

            "sku",

            "category",

            "stock_quantity",

            "cost_price",

            "sales_price",

            "cost_value",

            "sale_value",

            "expected_profit",
        ]


class InventoryReportSerializer(serializers.Serializer):

    total_products = serializers.IntegerField()

    total_stock = serializers.IntegerField()

    total_cost = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    total_sale = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    total_profit = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    ) 


class InventoryAnalyticsSerializer(serializers.Serializer):

    total_products = serializers.IntegerField()

    total_stock = serializers.IntegerField()

    low_stock = serializers.IntegerField()

    out_of_stock = serializers.IntegerField()

    overstock = serializers.IntegerField()


class TopSellingProductSerializer(serializers.Serializer):

    product__id = serializers.IntegerField()

    product__name = serializers.CharField()

    product__sku = serializers.CharField()

    total_sold = serializers.IntegerField()


class SlowMovingProductSerializer(serializers.ModelSerializer):

    total_sold = serializers.IntegerField()

    category = serializers.CharField(
        source="category.name",
        default=""
    )

    class Meta:

        model = Product

        fields = [

            "id",

            "name",

            "sku",

            "category",

            "stock_quantity",

            "total_sold",

            "cost_price",

            "sales_price",

        ]


class MostReturnedProductSerializer(serializers.Serializer):

    product_id = serializers.IntegerField()

    product_name = serializers.CharField()

    sku = serializers.CharField()

    total_returned = serializers.IntegerField()                                                                                                                     
