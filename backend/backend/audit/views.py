from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q

from .models import AuditEvent, ActivityFeed
from .serializers import AuditEventSerializer, ActivityFeedSerializer


class AuditEventListView(generics.ListAPIView):
    serializer_class = AuditEventSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = AuditEvent.objects.all()
        entity_type = self.request.query_params.get("entity_type")
        action = self.request.query_params.get("action")
        actor = self.request.query_params.get("actor")
        if entity_type:
            qs = qs.filter(entity_type__iexact=entity_type)
        if action:
            qs = qs.filter(action=action)
        if actor:
            qs = qs.filter(Q(actor_id=actor) | Q(actor_name__icontains=actor))
        return qs[:500]


class AuditEventDetailView(generics.RetrieveAPIView):
    serializer_class = AuditEventSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = AuditEvent.objects.all()


class ActivityFeedListView(generics.ListAPIView):
    serializer_class = ActivityFeedSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ActivityFeed.objects.all()[:50]


class AuditStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def get(self, request):
        from django.db.models import Count
        from collections import Counter
        counts = Counter(e.action for e in AuditEvent.objects.all()[:5000])
        return Response({"actions": dict(counts), "total": AuditEvent.objects.count()})
