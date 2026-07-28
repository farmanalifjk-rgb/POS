from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from pos.models import (Supplier,PurchaseOrder,PurchaseOrderItem,PurchaseReturn,)
from ..serializers import *
from ..filters import *
from ..services.inventory import update_stock
from rest_framework.response import Response
from ..services.inventory import *
from ..filters import *
from ..serializers import *
from ..pdf_helpers import *
from ..helpers import *
from ..Order_no_generator import *



class SupplierListCreateView(APIView):

    def get(self, request):

        suppliers = Supplier.objects.filter(
            is_active=True
        )

        serializer = SupplierSerializer(
            suppliers,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = SupplierSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data,
            status=201
        )
    

class SupplierDetailView(APIView):

    def get_object(self, pk):

        return get_object_or_404(
            Supplier,
            pk=pk
        )

    def get(self, request, pk):

        serializer = SupplierSerializer(
            self.get_object(pk)
        )

        return Response(serializer.data)

    def put(self, request, pk):

        supplier = self.get_object(pk)

        serializer = SupplierSerializer(
            supplier,
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(serializer.data)

    def delete(self, request, pk):

        supplier = self.get_object(pk)

        supplier.is_active = False
        supplier.save()

        return Response(status=204) 


class PurchaseOrderCreateView(APIView):

    @transaction.atomic
    def post(self, request):

        serializer = PurchaseOrderCreateSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data
        
        supplier = Supplier.objects.get(
            pk=data["supplier"]
        )

        purchase = PurchaseOrder.objects.create(
        
            supplier=supplier,

            order_number=generate_purchase_order_number(),

            note=data.get("note", "")
        )

        subtotal = Decimal("0.00")

        for item in data["items"]:
        
            product = Product.objects.get(
                pk=item["product"]
            )

            qty = item["quantity"]

            cost = item["unit_cost"]

            line_total = qty * cost

            subtotal += line_total

            PurchaseOrderItem.objects.create(
            
                purchase_order=purchase,

                product=product,

                quantity=qty,

                unit_cost=cost,

                subtotal=line_total,
            )

        purchase.subtotal = subtotal

        purchase.tax = Decimal("0.00")

        purchase.total = subtotal

        purchase.save()

        return Response({
        
            "success": True,

            "purchase_order": purchase.order_number,

            "status": purchase.status,

        })


class ReceivePurchaseView(APIView):

    @transaction.atomic
    def post(self, request, order_number):
        
        purchase = get_object_or_404(
            PurchaseOrder,
            order_number=order_number
        )                 

        serializer = ReceivePurchaseSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )  

        for row in serializer.validated_data["items"]:
        
            item = PurchaseOrderItem.objects.get(
                id=row["purchase_item"],
                purchase_order=purchase
            )

            qty = row["quantity"]                                                                     

        remaining = (item.quantity -item.received_quantity) 

        if qty > remaining:
        
            raise serializers.ValidationError(
            
                f"Only {remaining} remaining for "

                f"{item.product.name}")                   
        
        update_stock(
        
            product=item.product,

            quantity=qty,

            movement_type="purchase",

            reference=purchase.order_number,

            note=f"Purchase {purchase.order_number}",

        )        

        item.received_quantity += qty

        item.save( update_fields=["received_quantity"])     

        all_received = all(
        
            item.received_quantity >= item.quantity

            for item in purchase.items.all()

        )

        if all_received:
        
            purchase.status = "received"

        else:
        
            purchase.status = "ordered"

        purchase.save(
            update_fields=["status"]
        )

        return Response({
        
            "success": True,

            "purchase_order": purchase.order_number,

            "status": purchase.status,

        })
    

class PurchaseOrderListView(APIView):

    def get(self, request):

        purchases = PurchaseOrder.objects.select_related(
            "supplier"
        ).prefetch_related(
            "items"
        ).order_by("-id")

        serializer = PurchaseOrderListSerializer(
            purchases,
            many=True
        )

        return Response(serializer.data)  


class PurchaseOrderDetailView(APIView):

    def get(self, request, order_number):

        purchase = get_object_or_404(

            PurchaseOrder,

            order_number=order_number

        )

        serializer = PurchaseOrderDetailSerializer(
            purchase
        )

        return Response(serializer.data)


class CancelPurchaseOrderView(APIView):

    @transaction.atomic
    def post(self, request, order_number):

        purchase = get_object_or_404(
            PurchaseOrder,
            order_number=order_number
        )

        if purchase.status == "received":
            raise serializers.ValidationError(
                "Received purchase orders cannot be cancelled."
            )

        if purchase.status == "cancelled":
            raise serializers.ValidationError(
                "Purchase order is already cancelled."
            )

        purchase.status = "cancelled"

        purchase.save(update_fields=["status"])

        return Response({
            "success": True,
            "status": purchase.status
        })


class PurchaseReturnView(APIView):

    @transaction.atomic
    def post(self, request, order_number):

        purchase = get_object_or_404(
            PurchaseOrder,
            order_number=order_number
        )

        serializer = PurchaseReturnSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        purchase_return = PurchaseReturn.objects.create(
            purchase_order=purchase,
            reason=serializer.validated_data.get(
                "reason",
                ""
            ),
            total_amount=Decimal("0.00")
        )

        total_amount = Decimal("0.00")

        for row in serializer.validated_data["items"]:
        
            item = get_object_or_404(
            
                PurchaseOrderItem,

                id=row["purchase_item"],

                purchase_order=purchase

            )

            qty = row["quantity"] 

        available = (
            item.received_quantity -
            item.returned_quantity
        )                          

        if qty > available:
        
            raise serializers.ValidationError(
            
                f"You can return only "

                f"{available} {item.product.name}"

            )  

        amount = qty * item.unit_cost

        total_amount += amount   

        PurchaseReturnItem.objects.create(
        
            purchase_return=purchase_return,

            purchase_item=item,

            quantity=qty,

            amount=amount,
            )

        item.returned_quantity += qty

        item.save(update_fields=["returned_quantity"])

        update_stock(
        
            product=item.product,

            quantity=-qty,

            movement_type="purchase_return",

            reference=str(purchase_return),

            note=f"Returned to supplier ({purchase.order_number})",

        )

        purchase_return.total_amount = total_amount

        purchase_return.save(update_fields=["total_amount"])

        return Response({
        
            "success": True,

            "purchase_return": str(purchase_return),

            "total_amount": total_amount,

        })
    

class PurchaseReturnListView(APIView):

    def get(self, request):

        returns = get_filtered_purchase_returns(request)

        serializer = PurchaseReturnListSerializer(

            returns,

            many=True

        )

        return Response(serializer.data)   


class PurchaseReturnDetailView(APIView):

    def get(self, request, pk):

        purchase_return = get_object_or_404(

            PurchaseReturn,

            pk=pk

        )

        serializer = PurchaseReturnDetailSerializer(
            purchase_return
        )

        return Response(serializer.data)


class PurchaseReturnDashboardView(APIView):

    def get(self, request):

        return Response(
            get_purchase_return_summary()
        )