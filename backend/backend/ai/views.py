from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import AIQuery, ReorderSuggestion, PromptTemplate
from .serializers import AIQuerySerializer, ReorderSuggestionSerializer, PromptTemplateSerializer
from .services import ask, daily_summary, generate_reorder_suggestions


class AskView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        question = request.data.get("question", "").strip()
        if not question:
            return Response({"detail": "question is required"}, status=400)
        model = request.data.get("model", "automatic")
        result = ask(question, request.user, model)
        return Response(result)


class DailySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(daily_summary(request.user))


class AIQueryHistoryView(generics.ListAPIView):
    serializer_class = AIQuerySerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return AIQuery.objects.filter(user=self.request.user)[:50]


class GenerateReorderSuggestionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        return Response(generate_reorder_suggestions())


class ReorderSuggestionListView(generics.ListAPIView):
    serializer_class = ReorderSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = ReorderSuggestion.objects.all()
        status = self.request.query_params.get("status")
        return qs.filter(status=status) if status else qs[:100]


class ReorderSuggestionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ReorderSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ReorderSuggestion.objects.all()


class PromptTemplateListCreateView(generics.ListCreateAPIView):
    serializer_class = PromptTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PromptTemplate.objects.all()