from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from pos.models import Product
from .models import (ProductVariant, ProductBundle, SerialNumber, Batch, ProductMedia)
from .serializers import (
    ProductVariantSerializer, ProductBundleSerializer, SerialNumberSerializer,
    BatchSerializer, ProductMediaSerializer,
)
from .services import allocate_batch_fefo, validate_serial, recall_batch


class ProductVariantListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProductVariant.objects.filter(product_id=self.kwargs["product_id"])

    def perform_create(self, serializer):
        serializer.save(product_id=self.kwargs["product_id"])


class ProductVariantDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated]
    queryset = ProductVariant.objects.all()


class ProductBundleListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductBundleSerializer
    permission_classes = [IsAuthenticated]
    queryset = ProductBundle.objects.all()


class ProductBundleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductBundleSerializer
    permission_classes = [IsAuthenticated]
    queryset = ProductBundle.objects.all()


class SerialListCreateView(generics.ListCreateAPIView):
    serializer_class = SerialNumberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = SerialNumber.objects.all()
        pid = self.request.query_params.get("product_id")
        if pid:
            qs = qs.filter(product_id=pid)
        st = self.request.query_params.get("status")
        if st:
            qs = qs.filter(status=st)
        return qs


class SerialDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SerialNumberSerializer
    permission_classes = [IsAuthenticated]
    queryset = SerialNumber.objects.all()


class ValidateSerialView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        p = get_object_or_404(Product, pk=request.data.get("product_id"))
        try:
            s = validate_serial(p, request.data.get("serial_number"))
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response(SerialNumberSerializer(s).data)


class BatchListCreateView(generics.ListCreateAPIView):
    serializer_class = BatchSerializer
    permission_classes = [IsAuthenticated]
    queryset = Batch.objects.all()


class BatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BatchSerializer
    permission_classes = [IsAuthenticated]
    queryset = Batch.objects.all()


class BatchRecallView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        b = get_object_or_404(Batch, pk=pk)
        recall_batch(b, request.data.get("reason", ""))
        return Response(BatchSerializer(b).data)


class FefoAllocateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        p = get_object_or_404(Product, pk=request.data.get("product_id"))
        try:
            allocs = allocate_batch_fefo(
                product=p, quantity=request.data.get("quantity"),
                kind=request.data.get("kind", "sale"),
                order=request.data.get("order"),
                reference=request.data.get("reference", ""), user=request.user,
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response([{"batch_id": b.id, "taken": str(q)} for b, q in allocs])


class ProductMediaListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductMediaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProductMedia.objects.filter(product_id=self.kwargs["product_id"])

    def perform_create(self, serializer):
        serializer.save(product_id=self.kwargs["product_id"])
