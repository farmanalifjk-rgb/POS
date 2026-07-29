
from rest_framework import serializers
from .models import (
    ProductVariant, ProductVariantAttribute, ProductBundle, BundleComponent,
    SerialNumber, Batch, BatchMovement, ProductMedia,
)


class ProductVariantAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariantAttribute
        fields = ["id", "name", "value"]


class ProductVariantSerializer(serializers.ModelSerializer):
    attributes = ProductVariantAttributeSerializer(many=True, read_only=True)

    class Meta:
        model = ProductVariant
        fields = "__all__"


class BundleComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BundleComponent
        fields = ["id", "product", "variant", "quantity", "override_price"]


class ProductBundleSerializer(serializers.ModelSerializer):
    components = BundleComponentSerializer(many=True, read_only=True)
    computed_price = serializers.SerializerMethodField()

    class Meta:
        model = ProductBundle
        fields = "__all__"

    def get_computed_price(self, obj):
        return obj.computed_price()


class SerialNumberSerializer(serializers.ModelSerializer):
    class Meta:
        model = SerialNumber
        fields = "__all__"


class BatchSerializer(serializers.ModelSerializer):
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Batch
        fields = "__all__"


class BatchMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BatchMovement
        fields = "__all__"


class ProductMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = "__all__"