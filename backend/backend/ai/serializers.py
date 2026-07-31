from rest_framework import serializers
from .models import AIQuery, ReorderSuggestion, PromptTemplate


class AIQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = AIQuery
        fields = "__all__"


class ReorderSuggestionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    class Meta:
        model = ReorderSuggestion
        fields = "__all__"


class PromptTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromptTemplate
        fields = "__all__"