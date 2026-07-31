from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Integration, SyncLog, SyncMapping
from .serializers import IntegrationSerializer, SyncLogSerializer, SyncMappingSerializer
from .services import run_sync, sync_products_inbound, sync_products_outbound, sync_orders_inbound, push_invoice


class IntegrationListCreateView(generics.ListCreateAPIView):
    serializer_class = IntegrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Integration.objects.all()


class IntegrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IntegrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Integration.objects.all()


class SyncView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, integration_id):
        direction = request.data.get("direction", "inbound")
        entity_type = request.data.get("entity_type", "product")
        result = run_sync(integration_id, direction, entity_type)
        return Response(result)


class SyncLogListView(generics.ListAPIView):
    serializer_class = SyncLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = SyncLog.objects.all()
        iid = self.request.query_params.get("integration_id")
        return qs.filter(integration_id=iid) if iid else qs[:200]


class SyncMappingListView(generics.ListAPIView):
    serializer_class = SyncMappingSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = SyncMapping.objects.all()


class PushInvoiceView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, integration_id):
        remote_id = push_invoice(Integration.objects.get(pk=integration_id), request.data)
        return Response({"remote_id": remote_id}, status=201)