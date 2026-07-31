from django.urls import path
from .views import (ModuleListView, PermissionListView, RoleListCreateView, RoleDetailView,
                    UserRoleListCreateView, UserRoleDetailView, RoleTemplateListCreateView,
                    ApplyTemplateView, PermissionOverrideListCreateView, MyPermissionsView,
                    CheckPermissionView, SeedView)

urlpatterns = [
    path("modules/", ModuleListView.as_view()),
    path("permissions/", PermissionListView.as_view()),
    path("roles/", RoleListCreateView.as_view()),
    path("roles/<int:pk>/", RoleDetailView.as_view()),
    path("user-roles/", UserRoleListCreateView.as_view()),
    path("user-roles/<int:pk>/", UserRoleDetailView.as_view()),
    path("templates/", RoleTemplateListCreateView.as_view()),
    path("roles/<int:role_id>/apply-template/", ApplyTemplateView.as_view()),
    path("overrides/", PermissionOverrideListCreateView.as_view()),
    path("me/", MyPermissionsView.as_view()),
    path("check/", CheckPermissionView.as_view()),
    path("seed/", SeedView.as_view()),
]