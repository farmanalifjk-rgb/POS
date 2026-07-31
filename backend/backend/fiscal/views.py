from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from .models import InvoiceSequence, FiscalInvoice, FiscalDevice, FiscalSubmission
from .serializers import (InvoiceSequenceSerializer, FiscalInvoiceSerializer,
                          FiscalDeviceSerializer, FiscalSubmissionSerializer)
from .services import issue_invoice, cancel_invoice, submit_to_device


class InvoiceSequenceListCreateView(generics.ListCreateAPIView):
    serializer_class = InvoiceSequenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = InvoiceSequence.objects.all()


class FiscalInvoiceListView(generics.ListAPIView):
    serializer_class = FiscalInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = FiscalInvoice.objects.all()


class FiscalInvoiceDetailView(generics.RetrieveAPIView):
    serializer_class = FiscalInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = FiscalInvoice.objects.all()


class IssueInvoiceView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        inv = issue_invoice(order_id=request.data.get("order_id"),
                            sequence_id=request.data["sequence_id"],
                            customer_id=request.data.get("customer_id"),
                            user=request.user)
        return Response(FiscalInvoiceSerializer(inv).data, status=201)


class CancelInvoiceView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        return Response(FiscalInvoiceSerializer(cancel_invoice(pk, request.user)).data)


class FiscalDeviceListCreateView(generics.ListCreateAPIView):
    serializer_class = FiscalDeviceSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = FiscalDevice.objects.all()


class SubmitToDeviceView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, invoice_id):
        device_id = request.data["device_id"]
        sub = submit_to_device(invoice_id, device_id, request.user)
        return Response(FiscalSubmissionSerializer(sub).data)


class InvoiceXMLView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        inv = get_object_or_404(FiscalInvoice, pk=pk)
        return HttpResponse(inv.xml_content, content_type="application/xml",
                            headers={"Content-Disposition": f'attachment; filename="{inv.invoice_number}.xml"'})


class SubmissionListView(generics.ListAPIView):
    serializer_class = FiscalSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = FiscalSubmission.objects.all()
        inv = self.request.query_params.get("invoice_id")
        return qs.filter(invoice_id=inv) if inv else qs