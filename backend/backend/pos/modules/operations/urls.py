from django.urls import path, include
from rest_framework.routers import DefaultRouter
from pos.modules.operations.views import ApprovalRuleViewSet, ApprovalRequestViewSet

router = DefaultRouter()
router.register(r"workflow/rules",    ApprovalRuleViewSet,    basename="workflow-rules")
router.register(r"workflow/requests", ApprovalRequestViewSet, basename="workflow-requests")

urlpatterns = [
    path("", include(router.urls)),
]


from django.urls import path, include
from rest_framework.routers import DefaultRouter
from pos.modules.operations.views import NotificationViewSet, EmailQueueViewSet, SMSQueueViewSet

router = DefaultRouter()
router.register(r"notifications",            NotificationViewSet, basename="notifications")
router.register(r"notifications/email-queue", EmailQueueViewSet,   basename="email-queue")
router.register(r"notifications/sms-queue",   SMSQueueViewSet,     basename="sms-queue")

urlpatterns = [
    path("", include(router.urls)),
]


