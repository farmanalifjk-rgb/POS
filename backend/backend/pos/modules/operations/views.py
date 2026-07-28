"""
Workflow / Approvals API views.

Endpoints:
  GET/POST     /api/workflow/rules/
  GET/PUT/DEL  /api/workflow/rules/{id}/
  GET/POST     /api/workflow/requests/
  POST         /api/workflow/requests/{id}/approve/
  POST         /api/workflow/requests/{id}/reject/
  GET          /api/workflow/requests/pending-count/
"""
from django.utils import timezone
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from pos.modules.operations.models import ApprovalRequest, ApprovalRule


# ── Serializers ───────────────────────────────────────────────────────────────

class ApprovalRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ApprovalRule
        fields = ["id","module","action","min_amount","requires_approval","approver_role","is_active"]


class ApprovalRequestSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.SerializerMethodField()
    reviewed_by_name  = serializers.SerializerMethodField()

    class Meta:
        model  = ApprovalRequest
        fields = ["id","module","action","reference_id","reference_str","amount",
                  "requested_by","requested_by_name","status","reviewed_by",
                  "reviewed_by_name","reviewed_at","note","created_at"]

    def get_requested_by_name(self, obj):
        if obj.requested_by:
            return obj.requested_by.get_full_name() or obj.requested_by.username
        return None

    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return obj.reviewed_by.get_full_name() or obj.reviewed_by.username
        return None


# ── ViewSets ──────────────────────────────────────────────────────────────────

class ApprovalRuleViewSet(viewsets.ModelViewSet):
    queryset = ApprovalRule.objects.all()
    serializer_class = ApprovalRuleSerializer
    permission_classes = [IsAuthenticated]


class ApprovalRequestViewSet(viewsets.ModelViewSet):
    queryset = ApprovalRequest.objects.select_related("requested_by","reviewed_by").all()
    serializer_class = ApprovalRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs  = super().get_queryset()
        m   = self.request.query_params.get("module")
        s   = self.request.query_params.get("status")
        if m: qs = qs.filter(module=m)
        if s: qs = qs.filter(status=s)
        return qs

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        req = self.get_object()
        if req.status != ApprovalRequest.STATUS_PENDING:
            return Response({"error": "Request is not pending."}, status=400)
        req.status      = ApprovalRequest.STATUS_APPROVED
        req.reviewed_by = request.user
        req.reviewed_at = timezone.now()
        req.note        = request.data.get("note", "")
        req.save()
        return Response(ApprovalRequestSerializer(req).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        req = self.get_object()
        if req.status != ApprovalRequest.STATUS_PENDING:
            return Response({"error": "Request is not pending."}, status=400)
        req.status      = ApprovalRequest.STATUS_REJECTED
        req.reviewed_by = request.user
        req.reviewed_at = timezone.now()
        req.note        = request.data.get("note", "")
        req.save()
        return Response(ApprovalRequestSerializer(req).data)

    @action(detail=False, methods=["get"])
    def pending_count(self, request):
        count = ApprovalRequest.objects.filter(status=ApprovalRequest.STATUS_PENDING).count()
        return Response({"count": count})


"""
Notifications API views.

Endpoints:
  GET/POST     /api/notifications/
  POST         /api/notifications/{id}/mark-read/
  POST         /api/notifications/mark-all-read/
  GET          /api/notifications/unread-count/
  GET/POST     /api/notifications/email-queue/
  GET/POST     /api/notifications/sms-queue/
"""
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from pos.modules.operations.models import EmailQueue, InAppNotification, SMSQueue


# ── Serializers ───────────────────────────────────────────────────────────────

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = InAppNotification
        fields = ["id","user","type","title","message","link","is_read","created_at"]


class EmailQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model  = EmailQueue
        fields = ["id","to","subject","body","status","attempts","sent_at","error","created_at"]


class SMSQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SMSQueue
        fields = ["id","to","message","status","attempts","sent_at","error","created_at"]


# ── Views ─────────────────────────────────────────────────────────────────────

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = InAppNotification.objects.filter(user=self.request.user)
        t  = self.request.query_params.get("type")
        is_read = self.request.query_params.get("is_read")
        if t:       qs = qs.filter(type=t)
        if is_read is not None:
            qs = qs.filter(is_read=is_read.lower() == "true")
        return qs

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        n = self.get_object()
        n.is_read = True
        n.save()
        return Response(NotificationSerializer(n).data)

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        count = InAppNotification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"marked": count})

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        count = InAppNotification.objects.filter(user=request.user, is_read=False).count()
        return Response({"count": count})


class EmailQueueViewSet(viewsets.ModelViewSet):
    queryset = EmailQueue.objects.all()
    serializer_class = EmailQueueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        s  = self.request.query_params.get("status")
        if s: qs = qs.filter(status=s)
        return qs


class SMSQueueViewSet(viewsets.ModelViewSet):
    queryset = SMSQueue.objects.all()
    serializer_class = SMSQueueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        s  = self.request.query_params.get("status")
        if s: qs = qs.filter(status=s)
        return qs


