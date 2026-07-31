from rest_framework import serializers
from .models import Currency, Language, TranslationKey, UserLocale


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = "__all__"


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = "__all__"


class TranslationKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = TranslationKey
        fields = "__all__"


class UserLocaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLocale
        fields = "__all__"