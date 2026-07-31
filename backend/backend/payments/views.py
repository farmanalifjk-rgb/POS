from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from pos.models import Order, Refund, CashSession, Customer
from .models import (GiftCard, StoreCredit, TenderedPayment, PaymentReconciliation, RefundCreditNote)
from .serializers import (GiftCardSerializer, StoreCreditSerializer, TenderedPaymentSerializer,
                          PaymentReconciliationSerializer, RefundCreditNoteSerializer)
from .services import (issue_gift_card, topup_gift_card, redeem_gift_card, issue_store_credit,
                       redeem_store_credit, settle_order, reconcile_session, refund_as_store_credit)


class GiftCardListCreateView(generics.ListCreateAPIView):
    serializer_class = GiftCardSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = GiftCard.objects.all()

    def perform_create(self, serializer):
        d = serializer.validated_data
        serializer.instance = issue_gift_card(initial_balance=d["initial_balance"],customer=d.get("issued_to"), expires_at=d.get("expires_at"),user=self.request.user, code=d.get("code"))


class GiftCardDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GiftCardSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = GiftCard.objects.all()


class GiftCardTopupView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        return Response(GiftCardSerializer(topup_gift_card(pk, request.data["amount"], request.user)).data)


class GiftCardRedeemView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            gc = redeem_gift_card(request.data["code"], request.data["amount"],
                                  order=request.data.get("order_id"), user=request.user)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response(GiftCardSerializer(gc).data)


class StoreCreditDetailView(generics.RetrieveAPIView):
    serializer_class = StoreCreditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        c = get_object_or_404(Customer, pk=self.kwargs["customer_id"])
        sc, _ = StoreCredit.objects.get_or_create(customer=c)
        return sc


class StoreCreditIssueView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, customer_id):
        c = get_object_or_404(Customer, pk=customer_id)
        issue_store_credit(customer=c, amount=request.data["amount"], note=request.data.get("note", ""), user=request.user)
        sc = StoreCredit.objects.get(customer=c)
        return Response(StoreCreditSerializer(sc).data)


class SettleOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id)
        try:
            settle_order(order=order, tenders=request.data["tenders"], user=request.user)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response({"status": "settled", "total": str(order.total)})


class TenderedPaymentListView(generics.ListAPIView):
    serializer_class = TenderedPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = TenderedPayment.objects.all()
        oid = self.request.query_params.get("order_id")
        return qs.filter(order_id=oid) if oid else qs


class ReconcileSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, session_id):
        session = get_object_or_404(CashSession, pk=session_id)
        rec = reconcile_session(session=session, counted_lines=request.data["lines"], user=request.user)
        return Response(PaymentReconciliationSerializer(rec).data)


class RefundCreditNoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, refund_id):
        refund = get_object_or_404(Refund, pk=refund_id)
        customer = get_object_or_404(Customer, pk=request.data["customer_id"])
        note = refund_as_store_credit(refund=refund, customer=customer, user=request.user)
        return Response(RefundCreditNoteSerializer(note).data, status=201)