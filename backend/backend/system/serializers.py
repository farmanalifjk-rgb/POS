"""
serializers_settings.py
Serializers for every model in models_settings.py plus the extended
Company / PaymentMethod / Customer / Product fields.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from pos.models import (
    Company, PaymentMethod, Tax, Customer, Product, Category, Brand,
)
from system.models import (
    Store, POSSettings, InventorySettings, TaxSettings, ReceiptSettings,
    NotificationSettings, Notification, HardwareDevice, BarcodeSettings,
    CustomerGroup, CustomerSettings, ProductSettings, CustomField,
    SecuritySettings, LoginAttempt, TrustedDevice, AuditLog,
    BackupSettings, BackupRecord, DataManagementSettings,
    ReportSettings, ScheduledReport, AppearanceSettings, FeatureFlags,
    APIKey, Webhook, WebhookDelivery, EmailTemplate, SMSTemplate,
    ReceiptTemplate, AboutInfo, ErrorLog,
)

User = get_user_model()


# ─── Company (General / Company tab) ───────────────────────────────────────
class CompanyFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = "__all__"


# ─── Store ──────────────────────────────────────────────────────────────────
class StoreSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source="manager.get_full_name", read_only=True, default="")

    class Meta:
        model = Store
        fields = "__all__"


# ─── POS Settings ───────────────────────────────────────────────────────────
class POSSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSSettings
        fields = "__all__"


# ─── Inventory Settings ─────────────────────────────────────────────────────
class InventorySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventorySettings
        fields = "__all__"


# ─── Tax Settings + Tax ─────────────────────────────────────────────────────
class TaxSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxSettings
        fields = "__all__"


class TaxFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tax
        fields = "__all__"


# ─── Payment Methods ────────────────────────────────────────────────────────
class PaymentMethodFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = "__all__"


# ─── Receipt Settings ───────────────────────────────────────────────────────
class ReceiptSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceiptSettings
        fields = "__all__"


class ReceiptTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceiptTemplate
        fields = "__all__"


# ─── Notifications ──────────────────────────────────────────────────────────
class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


# ─── Hardware ───────────────────────────────────────────────────────────────
class HardwareDeviceSerializer(serializers.ModelSerializer):
    device_type_display = serializers.CharField(source="get_device_type_display", read_only=True)

    class Meta:
        model = HardwareDevice
        fields = "__all__"


class BarcodeSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BarcodeSettings
        fields = "__all__"


# ─── Customer ───────────────────────────────────────────────────────────────
class CustomerGroupSerializer(serializers.ModelSerializer):
    customers_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomerGroup
        fields = "__all__"

    def get_customers_count(self, obj):
        return obj.customers.count()


class CustomerSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerSettings
        fields = "__all__"


class CustomerFullSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source="group.name", read_only=True, default="")

    class Meta:
        model = Customer
        fields = "__all__"


# ─── Product Settings + Custom Fields ───────────────────────────────────────
class ProductSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSettings
        fields = "__all__"


class CustomFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomField
        fields = "__all__"


# ─── Security ───────────────────────────────────────────────────────────────
class SecuritySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecuritySettings
        fields = "__all__"


class LoginAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginAttempt
        fields = "__all__"


class TrustedDeviceSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = TrustedDevice
        fields = "__all__"


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True, default="")

    class Meta:
        model = AuditLog
        fields = "__all__"


# ─── Backup & Restore / Data Management ─────────────────────────────────────
class BackupSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupSettings
        fields = "__all__"


class BackupRecordSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.username", read_only=True, default="")

    class Meta:
        model = BackupRecord
        fields = "__all__"


class DataManagementSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataManagementSettings
        fields = "__all__"


# ─── Reports ────────────────────────────────────────────────────────────────
class ReportSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportSettings
        fields = "__all__"


class ScheduledReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledReport
        fields = "__all__"


# ─── Appearance ─────────────────────────────────────────────────────────────
class AppearanceSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppearanceSettings
        fields = "__all__"


# ─── Feature Flags ──────────────────────────────────────────────────────────
class FeatureFlagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureFlags
        fields = "__all__"


# ─── Developer / Integrations ───────────────────────────────────────────────
class APIKeySerializer(serializers.ModelSerializer):
    key_display = serializers.SerializerMethodField()

    class Meta:
        model = APIKey
        fields = ["id", "name", "key_display", "scopes", "is_active", "last_used_at",
                  "created_by", "created_at", "expires_at"]

    def get_key_display(self, obj):
        # Full key is only ever shown once, at creation time (see view). Afterwards masked.
        return obj.masked_key()


class APIKeyCreateResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ["id", "name", "key", "scopes", "is_active", "created_at", "expires_at"]


class WebhookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webhook
        fields = "__all__"
        read_only_fields = ["secret"]


class WebhookDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookDelivery
        fields = "__all__"


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = "__all__"


class SMSTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSTemplate
        fields = "__all__"


# ─── About ──────────────────────────────────────────────────────────────────
class AboutInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutInfo
        fields = "__all__"


# ─── Error / Crash Logs ──────────────────────────────────────────────────────
class ErrorLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True, default="")

    class Meta:
        model = ErrorLog
        fields = "__all__"


