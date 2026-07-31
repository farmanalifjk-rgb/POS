from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone

from .models import AlertRule, Notification, NotificationDigest
from .serializers import AlertRuleSerializer, NotificationSerializer, NotificationDigestSerializer
from .services import run_all_scans, mark_read


class AlertRuleListCreateView(generics.ListCreateAPIView):
    serializer_class = AlertRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AlertRule.objects.all()


class AlertRuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AlertRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AlertRule.objects.all()


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.all()
        unread = self.request.query_params.get("unread")
        if unread == "1":
            qs = qs.filter(is_read=False)
        mine = self.request.query_params.get("mine")
        if mine == "1":
            qs = qs.filter(target_user=self.request.user)
        return qs[:100]


class NotificationDetailView(generics.RetrieveAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Notification.objects.all()


class MarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        n = mark_read(pk, request.user)
        return Response(NotificationSerializer(n).data)


class MarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        Notification.objects.filter(target_user=request.user, is_read=False).update(is_read=True)
        return Response({"ok": True})


class RunScansView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request):
        result = run_all_scans()
        NotificationDigest.objects.create(day=timezone.now().date(),fired_count=result["fired"],email_count=Notification.objects.filter(is_sent_email=True,created_at__date=timezone.now().date()).count(),summary=str(result))
        return Response(result)


class NotificationDigestListView(generics.ListAPIView):
    serializer_class = NotificationDigestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = NotificationDigest.objects.all()