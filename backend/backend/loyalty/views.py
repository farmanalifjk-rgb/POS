"""
Loyalty & Promotions API views.

Endpoints:
  /api/loyalty/program/           (singleton GET/PUT)
  /api/loyalty/tiers/
  /api/loyalty/transactions/
  /api/loyalty/gift-cards/        + redeem action
  /api/loyalty/coupons/           + validate action
  /api/loyalty/promotions/
"""
from django.utils import timezone
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from loyalty.models import (
    Coupon, LoyaltyProgram, LoyaltyTransaction,
    MembershipTier, Promotion,
)


# ── Serializers ───────────────────────────────────────────────────────────────

class LoyaltyProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model  = LoyaltyProgram
        fields = ["id","name","points_per_currency","redemption_rate","min_points_redeem","is_active","updated_at"]


class MembershipTierSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MembershipTier
        fields = ["id","name","min_points","bonus_percent","color"]


class LoyaltyTransactionSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)

    class Meta:
        model  = LoyaltyTransaction
        fields = ["id","customer","customer_name","type","points","reference","reason","created_at"]


class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model  = Coupon
        fields = ["id","code","discount_type","discount_value","min_order","max_discount",
                  "uses_total","uses_left","expiry","is_active","is_valid","created_at"]


class PromotionSerializer(serializers.ModelSerializer):
    is_running = serializers.BooleanField(read_only=True)

    class Meta:
        model  = Promotion
        fields = ["id","name","type","description","conditions","discount",
                  "start_date","end_date","is_active","is_running","created_at"]


# ── Views ─────────────────────────────────────────────────────────────────────

class LoyaltyProgramView(APIView):
    """Singleton loyalty program config (GET + PUT)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prog, _ = LoyaltyProgram.objects.get_or_create(pk=1, defaults={"name":"Default Loyalty Program"})
        return Response(LoyaltyProgramSerializer(prog).data)

    def put(self, request):
        prog, _ = LoyaltyProgram.objects.get_or_create(pk=1, defaults={"name":"Default Loyalty Program"})
        ser = LoyaltyProgramSerializer(prog, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)


class MembershipTierViewSet(viewsets.ModelViewSet):
    queryset = MembershipTier.objects.all()
    serializer_class = MembershipTierSerializer
    permission_classes = [IsAuthenticated]


class LoyaltyTransactionViewSet(viewsets.ModelViewSet):
    queryset = LoyaltyTransaction.objects.select_related("customer").all()
    serializer_class = LoyaltyTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs  = super().get_queryset()
        cid = self.request.query_params.get("customer")
        t   = self.request.query_params.get("type")
        if cid: qs = qs.filter(customer_id=cid)
        if t:   qs = qs.filter(type=t)
        return qs

    def perform_create(self, serializer):
        """Save transaction and update customer loyalty_points balance."""
        tx = serializer.save()
        customer = tx.customer
        if hasattr(customer, "loyalty_points"):
            customer.loyalty_points = (customer.loyalty_points or 0) + tx.points
            customer.save(update_fields=["loyalty_points"])



class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"])
    def validate(self, request):
        """Validate a coupon code and return discount details."""
        code  = request.data.get("code", "").upper()
        order_total = float(request.data.get("order_total", 0))
        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({"valid": False, "error": "Coupon not found."}, status=404)
        if not coupon.is_valid:
            return Response({"valid": False, "error": "Coupon is not valid or has expired."}, status=400)
        if order_total < float(coupon.min_order):
            return Response({
                "valid": False,
                "error": f"Minimum order amount is Rs. {coupon.min_order}."
            }, status=400)
        if coupon.discount_type == Coupon.TYPE_PERCENT:
            discount = order_total * float(coupon.discount_value) / 100
            if coupon.max_discount:
                discount = min(discount, float(coupon.max_discount))
        else:
            discount = float(coupon.discount_value)
        return Response({"valid": True, "coupon": CouponSerializer(coupon).data, "discount_amount": discount})


class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        active = self.request.query_params.get("active")
        if active == "true":
            today = timezone.now().date()
            qs = qs.filter(is_active=True, start_date__lte=today).filter(
                end_date__gte=today) | qs.filter(is_active=True, end_date__isnull=True, start_date__lte=today)
        return qs


