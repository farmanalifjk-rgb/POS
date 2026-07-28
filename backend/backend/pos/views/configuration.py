"""
Views for Settings, Users, Roles, Taxes, and Payment Methods.
These are NEW views — existing views are untouched.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from pos.models import Company, Role, UserProfile, Tax, PaymentMethod
from ..pagination import CustomPagination

User = get_user_model()


# ─── Inline serializers ────────────────────────────────────────────────────────

class CompanyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = "__all__"


class RoleSerializer(serializers.ModelSerializer):
    users_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ["id", "name", "description", "permissions", "is_active", "created_at", "users_count"]

    def get_users_count(self, obj):
        return UserProfile.objects.filter(role=obj).count()


class UserProfileSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.name", read_only=True, default="")

    class Meta:
        model = UserProfile
        fields = ["role", "role_name", "phone", "avatar"]


class UserListSerializer(serializers.ModelSerializer):
    role_id = serializers.SerializerMethodField()
    role_name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "is_active", "is_staff", "date_joined", "last_login",
            "role_id", "role_name", "phone",
        ]

    def get_role_id(self, obj):
        try:
            return obj.profile.role_id
        except Exception:
            return None

    def get_role_name(self, obj):
        try:
            return obj.profile.role.name if obj.profile.role else ""
        except Exception:
            return ""

    def get_phone(self, obj):
        try:
            return obj.profile.phone
        except Exception:
            return ""


class UserCreateSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False, default=True)
    is_staff = serializers.BooleanField(required=False, default=False)
    role_id = serializers.IntegerField(required=False, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True)


class TaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tax
        fields = "__all__"


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = "__all__"


# ─── Settings ─────────────────────────────────────────────────────────────────

class SettingsView(APIView):

    def get(self, request):
        company = Company.objects.first()
        if not company:
            return Response({})
        serializer = CompanyUpdateSerializer(company)
        return Response(serializer.data)

    def put(self, request):
        company = Company.objects.first()
        if not company:
            company = Company()
        serializer = CompanyUpdateSerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Users ─────────────────────────────────────────────────────────────────────

class UsersListView(APIView):

    def get(self, request):
        users = User.objects.prefetch_related("profile", "profile__role").order_by("-date_joined")

        search = request.GET.get("search", "").strip()
        if search:
            users = users.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        role = request.GET.get("role")
        if role:
            users = users.filter(profile__role_id=role)

        status_filter = request.GET.get("status")
        if status_filter == "active":
            users = users.filter(is_active=True)
        elif status_filter == "inactive":
            users = users.filter(is_active=False)

        paginator = CustomPagination()
        page = paginator.paginate_queryset(users, request)
        serializer = UserListSerializer(page, many=True)
        paged = paginator.get_paginated_response(serializer.data)

        # Stats
        paged.data["stats"] = {
            "total": User.objects.count(),
            "active": User.objects.filter(is_active=True).count(),
            "admins": User.objects.filter(is_staff=True).count(),
            "inactive": User.objects.filter(is_active=False).count(),
        }
        return paged

    def post(self, request):
        s = UserCreateSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
        d = s.validated_data

        if User.objects.filter(username=d["username"]).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        password = d.get("password")
        if password:
            from .settings_security import validate_password_against_policy
            is_valid, errors = validate_password_against_policy(password)
            if not is_valid:
                return Response({"password": errors}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=d["username"],
            email=d.get("email", ""),
            password=password or User.objects.make_random_password(),
            first_name=d.get("first_name", ""),
            last_name=d.get("last_name", ""),
            is_active=d.get("is_active", True),
            is_staff=d.get("is_staff", False),
        )

        role_id = d.get("role_id")
        phone = d.get("phone", "")
        role = Role.objects.filter(id=role_id).first() if role_id else None
        from django.utils import timezone
        UserProfile.objects.create(user=user, role=role, phone=phone, password_changed_at=timezone.now())

        serializer = UserListSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserDetailView(APIView):

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserListSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        data = request.data

        if "username" in data:
            user.username = data["username"]
        if "email" in data:
            user.email = data["email"]
        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]
        if "is_active" in data:
            user.is_active = data["is_active"]
        if "is_staff" in data:
            user.is_staff = data["is_staff"]
        if "password" in data and data["password"]:
            from .settings_security import validate_password_against_policy
            is_valid, errors = validate_password_against_policy(data["password"])
            if not is_valid:
                return Response({"password": errors}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(data["password"])
        user.save()

        # Profile
        from django.utils import timezone
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if "role_id" in data:
            profile.role = Role.objects.filter(id=data["role_id"]).first()
        if "phone" in data:
            profile.phone = data["phone"]
        if "password" in data and data["password"]:
            profile.password_changed_at = timezone.now()
        profile.save()

        serializer = UserListSerializer(user)
        return Response(serializer.data)

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if user.is_superuser:
            return Response({"error": "Cannot delete superuser"}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Roles ─────────────────────────────────────────────────────────────────────

class RolesListView(APIView):

    def get(self, request):
        roles = Role.objects.all()
        search = request.GET.get("search", "").strip()
        if search:
            roles = roles.filter(Q(name__icontains=search) | Q(description__icontains=search))
        is_active = request.GET.get("is_active")
        if is_active == "true":
            roles = roles.filter(is_active=True)
        paginator = CustomPagination()
        page = paginator.paginate_queryset(roles, request)
        serializer = RoleSerializer(page, many=True)
        paged = paginator.get_paginated_response(serializer.data)
        paged.data["stats"] = {
            "total": Role.objects.count(),
            "active": Role.objects.filter(is_active=True).count(),
        }
        return paged

    def post(self, request):
        serializer = RoleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoleDetailView(APIView):

    def get(self, request, pk):
        role = get_object_or_404(Role, pk=pk)
        serializer = RoleSerializer(role)
        return Response(serializer.data)

    def put(self, request, pk):
        role = get_object_or_404(Role, pk=pk)
        serializer = RoleSerializer(role, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        role = get_object_or_404(Role, pk=pk)
        role.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Taxes ─────────────────────────────────────────────────────────────────────

class TaxesListView(APIView):

    def get(self, request):
        taxes = Tax.objects.all()
        search = request.GET.get("search", "").strip()
        if search:
            taxes = taxes.filter(name__icontains=search)
        paginator = CustomPagination()
        page = paginator.paginate_queryset(taxes, request)
        serializer = TaxSerializer(page, many=True)
        paged = paginator.get_paginated_response(serializer.data)
        default_tax = Tax.objects.filter(is_default=True).first()
        paged.data["stats"] = {
            "total": Tax.objects.count(),
            "active": Tax.objects.filter(is_active=True).count(),
            "default_name": default_tax.name if default_tax else "-",
            "default_rate": float(default_tax.rate) if default_tax else 0,
        }
        return paged

    def post(self, request):
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        # If this is set as default, unset all others
        if data.get("is_default") in [True, "true", "True", 1, "1"]:
            Tax.objects.update(is_default=False)
        serializer = TaxSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaxDetailView(APIView):

    def get(self, request, pk):
        tax = get_object_or_404(Tax, pk=pk)
        serializer = TaxSerializer(tax)
        return Response(serializer.data)

    def put(self, request, pk):
        tax = get_object_or_404(Tax, pk=pk)
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        if data.get("is_default") in [True, "true", "True", 1, "1"]:
            Tax.objects.exclude(pk=pk).update(is_default=False)
        serializer = TaxSerializer(tax, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        tax = get_object_or_404(Tax, pk=pk)
        tax.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Payment Methods ───────────────────────────────────────────────────────────

class PaymentMethodsListView(APIView):

    def get(self, request):
        methods = PaymentMethod.objects.all()
        search = request.GET.get("search", "").strip()
        if search:
            methods = methods.filter(name__icontains=search)
        paginator = CustomPagination()
        page = paginator.paginate_queryset(methods, request)
        serializer = PaymentMethodSerializer(page, many=True)
        paged = paginator.get_paginated_response(serializer.data)
        default_m = PaymentMethod.objects.filter(is_default=True).first()
        paged.data["stats"] = {
            "total": PaymentMethod.objects.count(),
            "active": PaymentMethod.objects.filter(is_active=True).count(),
            "default_name": default_m.name if default_m else "-",
        }
        return paged

    def post(self, request):
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        if data.get("is_default") in [True, "true", "True", 1, "1"]:
            PaymentMethod.objects.update(is_default=False)
        serializer = PaymentMethodSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaymentMethodDetailView(APIView):

    def get(self, request, pk):
        m = get_object_or_404(PaymentMethod, pk=pk)
        serializer = PaymentMethodSerializer(m)
        return Response(serializer.data)

    def put(self, request, pk):
        m = get_object_or_404(PaymentMethod, pk=pk)
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        if data.get("is_default") in [True, "true", "True", 1, "1"]:
            PaymentMethod.objects.exclude(pk=pk).update(is_default=False)
        serializer = PaymentMethodSerializer(m, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        m = get_object_or_404(PaymentMethod, pk=pk)
        m.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
