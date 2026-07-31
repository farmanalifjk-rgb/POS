from decimal import Decimal, InvalidOperation
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Currency, Language, TranslationKey, UserLocale
from .serializers import (CurrencySerializer, LanguageSerializer,
                          TranslationKeySerializer, UserLocaleSerializer)
from .services import convert, format_money, translate_batch, user_locale


class CurrencyListCreateView(generics.ListCreateAPIView):
    serializer_class = CurrencySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Currency.objects.all()


class CurrencyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CurrencySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Currency.objects.all()


class LanguageListCreateView(generics.ListCreateAPIView):
    serializer_class = LanguageSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Language.objects.all()


class TranslationKeyListCreateView(generics.ListCreateAPIView):
    serializer_class = TranslationKeySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = TranslationKey.objects.all()


class TranslationBatchView(APIView):
    """POST {language, namespace, keys: [...]} → {key: value}."""
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        return Response(translate_batch(request.data.get("keys", []),
                                        request.data.get("language", "en"),
                                        request.data.get("namespace", "common")))


class ConvertView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        try:
            amount = Decimal(request.query_params["amount"])
        except (KeyError, InvalidOperation):
            return Response({"detail": "amount required"}, status=400)
        src = request.query_params.get("from", "USD")
        dst = request.query_params.get("to", "USD")
        converted = convert(amount, src, dst)
        return Response({"amount": str(converted), "formatted": format_money(converted, dst)})


class MyLocaleView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        loc = user_locale(request.user)
        return Response(UserLocaleSerializer(loc).data if loc else {})
    def put(self, request):
        loc, _ = UserLocale.objects.get_or_create(user=request.user)
        serializer = UserLocaleSerializer(loc, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class FormatView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        amount = request.query_params.get("amount", "0")
        currency = request.query_params.get("currency", "USD")
        return Response({"formatted": format_money(amount, currency)})