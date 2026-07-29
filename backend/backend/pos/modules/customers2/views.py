from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from pos.models import Customer
from .models import (CustomerAddress, CustomerCreditLimit, CustomerDocument, LoyaltyEvent,
                     CustomerNote, CustomerPortalToken)
from .serializers import (CustomerAddressSerializer, CustomerCreditLimitSerializer,
                          CustomerDocumentSerializer, LoyaltyEventSerializer,
                          CustomerNoteSerializer, CustomerPortalTokenSerializer)
from .services import (apply_credit, consume_credit, release_credit,
                       earn_loyalty, burn_loyalty, issue_portal_token)


class CustomerAddressListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerAddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return CustomerAddress.objects.filter(customer_id=self.kwargs["customer_id"])
    def perform_create(self, serializer): serializer.save(customer_id=self.kwargs["customer_id"])


class CustomerAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerAddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = CustomerAddress.objects.all()


class CreditLimitView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, customer_id):
        c = get_object_or_404(Customer, pk=customer_id)
        cl, _ = CustomerCreditLimit.objects.get_or_create(customer=c)
        return Response(CustomerCreditLimitSerializer(cl).data)
    def post(self, request, customer_id):
        c = get_object_or_404(Customer, pk=customer_id)
        cl = apply_credit(customer=c, amount=request.data.get("limit", 0),
                         terms_days=request.data.get("terms_days", 0), user=request.user)
        return Response(CustomerCreditLimitSerializer(cl).data)


class ConsumeCreditView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, customer_id):
        c = get_object_or_404(Customer, pk=customer_id)
        try: cl = consume_credit(customer=c, amount=request.data["amount"])
        except ValueError as e: return Response({"detail": str(e)}, status=400)
        return Response(CustomerCreditLimitSerializer(cl).data)


class ReleaseCreditView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, customer_id):
        c = get_object_or_404(Customer, pk=customer_id)
        cl = release_credit(customer=c, amount=request.data["amount"])
        return Response(CustomerCreditLimitSerializer(cl).data)


class CustomerDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return CustomerDocument.objects.filter(customer_id=self.kwargs["customer_id"])
    def perform_create(self, serializer): serializer.save(customer_id=self.kwargs["customer_id"], uploaded_by=self.request.user)


class LoyaltyTimelineView(generics.ListAPIView):
    serializer_class = LoyaltyEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return LoyaltyEvent.objects.filter(customer_id=self.kwargs["customer_id"])


class EarnLoyaltyView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, customer_id):
        c = get_object_or_404(Customer, pk=customer_id)
        ev = earn_loyalty(customer=c, points=request.data["points"],
                         order=request.data.get("order_id"), note=request.data.get("note", ""), user=request.user)
        return Response(LoyaltyEventSerializer(ev).data, status=201)


class BurnLoyaltyView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, customer_id):
        c = get_object_or_404(Customer, pk=customer_id)
        try: ev = burn_loyalty(customer=c, points=request.data["points"], user=request.user)
        except ValueError as e: return Response({"detail": str(e)}, status=400)
        return Response(LoyaltyEventSerializer(ev).data)


class CustomerNoteListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return CustomerNote.objects.filter(customer_id=self.kwargs["customer_id"])
    def perform_create(self, serializer): serializer.save(customer_id=self.kwargs["customer_id"], created_by=self.request.user)


class PortalTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, customer_id):
        c = get_object_or_404(Customer, pk=customer_id)
        return Response(CustomerPortalTokenSerializer(issue_portal_token(c)).data, status=201)