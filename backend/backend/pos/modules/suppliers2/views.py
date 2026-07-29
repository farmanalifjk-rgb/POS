from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from pos.models import Supplier, PurchaseOrder
from .models import SupplierContact, GoodsReceipt, PurchaseReturn, SupplierPortalToken
from .serializers import (SupplierContactSerializer, GoodsReceiptSerializer,
                          PurchaseReturnSerializer, SupplierPortalTokenSerializer)
from .services import create_receipt, create_purchase_return, issue_supplier_portal_token


class SupplierContactListCreateView(generics.ListCreateAPIView):
    serializer_class = SupplierContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return SupplierContact.objects.filter(supplier_id=self.kwargs["supplier_id"])
    def perform_create(self, serializer): serializer.save(supplier_id=self.kwargs["supplier_id"])


class CreateReceiptView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, po_id):
        po = get_object_or_404(PurchaseOrder, pk=po_id)
        receipt = create_receipt(purchase_order=po,
                                 supplier_invoice_number=request.data.get("supplier_invoice_number", ""),
                                 lines=request.data.get("lines", []), user=request.user)
        return Response(GoodsReceiptSerializer(receipt).data, status=201)


class ReceiptListView(generics.ListAPIView):
    serializer_class = GoodsReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = GoodsReceipt.objects.all()
        po = self.request.query_params.get("purchase_order_id")
        return qs.filter(purchase_order_id=po) if po else qs


class CreatePurchaseReturnView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, po_id):
        po = get_object_or_404(PurchaseOrder, pk=po_id)
        ret = create_purchase_return(purchase_order=po, lines=request.data.get("lines", []),
                                     reason=request.data.get("reason", ""), user=request.user)
        return Response(PurchaseReturnSerializer(ret).data, status=201)


class PurchaseReturnListView(generics.ListAPIView):
    serializer_class = PurchaseReturnSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PurchaseReturn.objects.all()


class SupplierPortalTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, supplier_id):
        s = get_object_or_404(Supplier, pk=supplier_id)
        return Response(SupplierPortalTokenSerializer(issue_supplier_portal_token(s)).data, status=201)