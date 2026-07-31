from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Module, Permission, Role, UserRole, RoleTemplate, PermissionOverride
from .serializers import (ModuleSerializer, PermissionSerializer, RoleSerializer,
                          UserRoleSerializer, RoleTemplateSerializer, PermissionOverrideSerializer)
from .checker import user_permissions, apply_template_to_role, seed_modules_and_permissions


class ModuleListView(generics.ListAPIView):
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Module.objects.filter(is_active=True)


class PermissionListView(generics.ListAPIView):
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Permission.objects.select_related("module").all()


class RoleListCreateView(generics.ListCreateAPIView):
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Role.objects.all()


class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Role.objects.all()

    def destroy(self, request, *args, **kwargs):
        role = self.get_object()
        if role.is_system:
            return Response({"detail": "System roles cannot be deleted."}, status=400)
        return super().destroy(request, *args, **kwargs)


class UserRoleListCreateView(generics.ListCreateAPIView):
    serializer_class = UserRoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserRole.objects.all()


class UserRoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserRoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserRole.objects.all()


class RoleTemplateListCreateView(generics.ListCreateAPIView):
    serializer_class = RoleTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = RoleTemplate.objects.all()


class ApplyTemplateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, role_id):
        role = get_object_or_404(Role, pk=role_id)
        template = get_object_or_404(RoleTemplate, pk=request.data["template_id"])
        added = apply_template_to_role(role, template)
        return Response({"added": added}, status=200)


class PermissionOverrideListCreateView(generics.ListCreateAPIView):
    serializer_class = PermissionOverrideSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PermissionOverride.objects.all()


class MyPermissionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response({"permissions": sorted(user_permissions(request.user))})


class CheckPermissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        from .checker import has_permission
        module = request.query_params.get("module")
        action = request.query_params.get("action")
        return Response({"allowed": has_permission(request.user, module, action)})


class SeedView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request):
        seed_modules_and_permissions()
        return Response({"modules": Module.objects.count(),
                         "permissions": Permission.objects.count(),
                         "templates": RoleTemplate.objects.count()})