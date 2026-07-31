"""
HR / Employee Management API views.

Endpoints:
  /api/hr/departments/
  /api/hr/employees/           + clock-in, clock-out actions
  /api/hr/attendance/
  /api/hr/leave-types/
  /api/hr/leave-requests/      + approve, reject actions
  /api/hr/shifts/
  /api/hr/payroll/             + generate_entries, post actions
  /api/hr/payroll-entries/
"""
from django.utils import timezone
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from hr.models import (
    Attendance, Department, Employee, LeaveRequest, LeaveType,
    PayrollEntry, PayrollRun, Shift,
)


# ── Serializers ───────────────────────────────────────────────────────────────

class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model  = Department
        fields = ["id","name","description","employee_count","created_at"]

    def get_employee_count(self, obj):
        return obj.employees.count()


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    full_name       = serializers.CharField(read_only=True)

    class Meta:
        model  = Employee
        fields = ["id","employee_id","first_name","last_name","full_name","gender",
                  "date_of_birth","phone","email","address","role","department",
                  "department_name","hire_date","basic_salary","status","photo","created_at"]


class ShiftSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)

    class Meta:
        model  = Shift
        fields = ["id","employee","employee_name","date","start_time","end_time","notes","created_at"]


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    hours_worked  = serializers.FloatField(read_only=True)

    class Meta:
        model  = Attendance
        fields = ["id","employee","employee_name","date","clock_in","clock_out","status","notes","hours_worked"]


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = LeaveType
        fields = ["id","name","days_allowed","is_paid"]


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name  = serializers.CharField(source="employee.full_name", read_only=True)
    leave_type_name = serializers.CharField(source="leave_type.name", read_only=True)
    total_days     = serializers.IntegerField(read_only=True)

    class Meta:
        model  = LeaveRequest
        fields = ["id","employee","employee_name","leave_type","leave_type_name",
                  "start_date","end_date","total_days","reason","status",
                  "reviewed_by","reviewed_at","created_at"]


class PayrollEntrySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)

    class Meta:
        model  = PayrollEntry
        fields = ["id","payroll_run","employee","employee_name","basic","allowances","deductions","tax","net"]


class PayrollRunSerializer(serializers.ModelSerializer):
    entries = PayrollEntrySerializer(many=True, read_only=True)
    total_net = serializers.SerializerMethodField()

    class Meta:
        model  = PayrollRun
        fields = ["id","month","year","status","notes","total_net","created_by","created_at","entries"]

    def get_total_net(self, obj):
        from django.db.models import Sum
        return float(obj.entries.aggregate(t=Sum("net"))["t"] or 0)


# ── ViewSets ──────────────────────────────────────────────────────────────────

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("department").all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        dept = self.request.query_params.get("department")
        s    = self.request.query_params.get("status")
        q    = self.request.query_params.get("search")
        if dept: qs = qs.filter(department_id=dept)
        if s:    qs = qs.filter(status=s)
        if q:    qs = qs.filter(
            first_name__icontains=q) | qs.filter(
            last_name__icontains=q) | qs.filter(
            employee_id__icontains=q)
        return qs

    @action(detail=True, methods=["post"])
    def clock_in(self, request, pk=None):
        employee = self.get_object()
        today = timezone.now().date()
        att, _ = Attendance.objects.get_or_create(employee=employee, date=today)
        att.clock_in = timezone.now()
        att.status   = "present"
        att.save()
        return Response(AttendanceSerializer(att).data)

    @action(detail=True, methods=["post"])
    def clock_out(self, request, pk=None):
        employee = self.get_object()
        today = timezone.now().date()
        try:
            att = Attendance.objects.get(employee=employee, date=today)
        except Attendance.DoesNotExist:
            return Response({"error": "No clock-in record for today."}, status=400)
        att.clock_out = timezone.now()
        att.save()
        return Response(AttendanceSerializer(att).data)


class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.select_related("employee").all()
    serializer_class = ShiftSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs  = super().get_queryset()
        emp = self.request.query_params.get("employee")
        d   = self.request.query_params.get("date")
        if emp: qs = qs.filter(employee_id=emp)
        if d:   qs = qs.filter(date=d)
        return qs


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("employee").all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs  = super().get_queryset()
        emp = self.request.query_params.get("employee")
        start = self.request.query_params.get("start")
        end   = self.request.query_params.get("end")
        s     = self.request.query_params.get("status")
        if emp:   qs = qs.filter(employee_id=emp)
        if start: qs = qs.filter(date__gte=start)
        if end:   qs = qs.filter(date__lte=end)
        if s:     qs = qs.filter(status=s)
        return qs


class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAuthenticated]


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related("employee","leave_type","reviewed_by").all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs  = super().get_queryset()
        emp = self.request.query_params.get("employee")
        s   = self.request.query_params.get("status")
        if emp: qs = qs.filter(employee_id=emp)
        if s:   qs = qs.filter(status=s)
        return qs

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        req = self.get_object()
        req.status      = LeaveRequest.STATUS_APPROVED
        req.reviewed_by = request.user
        req.reviewed_at = timezone.now()
        req.save()
        return Response(LeaveRequestSerializer(req).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        req = self.get_object()
        req.status      = LeaveRequest.STATUS_REJECTED
        req.reviewed_by = request.user
        req.reviewed_at = timezone.now()
        req.note        = request.data.get("note", "")
        req.save()
        return Response(LeaveRequestSerializer(req).data)


class PayrollRunViewSet(viewsets.ModelViewSet):
    queryset = PayrollRun.objects.prefetch_related("entries__employee").all()
    serializer_class = PayrollRunSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def generate_entries(self, request, pk=None):
        """Auto-generate payroll entries for all active employees."""
        run = self.get_object()
        if run.status == PayrollRun.STATUS_POSTED:
            return Response({"error": "Payroll already posted."}, status=400)
        employees = Employee.objects.filter(status=Employee.STATUS_ACTIVE)
        created = 0
        for emp in employees:
            entry, was_created = PayrollEntry.objects.get_or_create(
                payroll_run=run, employee=emp,
                defaults={"basic": emp.basic_salary}
            )
            if was_created:
                created += 1
        return Response({"generated": created, "total": employees.count()})

    @action(detail=True, methods=["post"])
    def post_payroll(self, request, pk=None):
        """Mark payroll run as posted."""
        run = self.get_object()
        run.status = PayrollRun.STATUS_POSTED
        run.save()
        return Response(PayrollRunSerializer(run).data)


class PayrollEntryViewSet(viewsets.ModelViewSet):
    queryset = PayrollEntry.objects.select_related("employee","payroll_run").all()
    serializer_class = PayrollEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs  = super().get_queryset()
        run = self.request.query_params.get("payroll_run")
        emp = self.request.query_params.get("employee")
        if run: qs = qs.filter(payroll_run_id=run)
        if emp: qs = qs.filter(employee_id=emp)
        return qs


