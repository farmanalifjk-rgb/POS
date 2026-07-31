from decimal import Decimal
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from .models import (Employee, Shift, ShiftAssignment, CommissionRule, CommissionEntry,
                     PayrollRun, PayrollLine)
from .serializers import (EmployeeSerializer, ShiftSerializer, ShiftAssignmentSerializer,
                          CommissionRuleSerializer, CommissionEntrySerializer,
                          PayrollRunSerializer, PayrollLineSerializer)
from .services import (start_shift, end_shift, compute_commissions_for_order, run_payroll, payroll_csv)


class EmployeeListCreateView(generics.ListCreateAPIView):
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Employee.objects.all()


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Employee.objects.all()


class StartShiftView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, employee_id):
        try:
            shift = start_shift(employee_id, request.data.get("session_id"), request.user)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response(ShiftSerializer(shift).data, status=201)


class EndShiftView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, shift_id):
        return Response(ShiftSerializer(end_shift(shift_id, request.data.get("break_minutes", 0))).data)


class ShiftListView(generics.ListAPIView):
    serializer_class = ShiftSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = Shift.objects.all()
        emp = self.request.query_params.get("employee_id")
        return qs.filter(employee_id=emp) if emp else qs


class ShiftAssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = ShiftAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ShiftAssignment.objects.all()


class CommissionRuleListCreateView(generics.ListCreateAPIView):
    serializer_class = CommissionRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = CommissionRule.objects.all()


class CommissionEntryListView(generics.ListAPIView):
    serializer_class = CommissionEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = CommissionEntry.objects.all()
        emp = self.request.query_params.get("employee_id")
        return qs.filter(employee_id=emp) if emp else qs


class ComputeOrderCommissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, order_id):
        from pos.models import Order
        order = get_object_or_404(Order, pk=order_id)
        entries = compute_commissions_for_order(order, request.data["employee_id"])
        return Response(CommissionEntrySerializer(entries, many=True).data, status=201)


class RunPayrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        run = run_payroll(request.data["period_start"], request.data["period_end"], request.user)
        return Response(PayrollRunSerializer(run).data, status=201)


class PayrollRunListView(generics.ListAPIView):
    serializer_class = PayrollRunSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PayrollRun.objects.all()


class PayrollRunDetailView(generics.RetrieveAPIView):
    serializer_class = PayrollRunSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PayrollRun.objects.all()


class PayrollCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        csv_text = payroll_csv(pk)
        resp = HttpResponse(csv_text, content_type="text/csv")
        resp["Content-Disposition"] = f'attachment; filename="payroll-{pk}.csv"'
        return resp
