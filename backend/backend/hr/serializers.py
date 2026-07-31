from rest_framework import serializers
from .models import Employee, Shift, ShiftAssignment, CommissionRule, CommissionEntry, PayrollRun, PayrollLine


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = "__all__"


class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = "__all__"

class ShiftAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftAssignment
        fields = "__all__"


class CommissionRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionRule
        fields = "__all__"


class CommissionEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionEntry
        fields = "__all__"


class PayrollLineSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    class Meta:
        model = PayrollLine
        fields = "__all__"


class PayrollRunSerializer(serializers.ModelSerializer):
    lines = PayrollLineSerializer(many=True, read_only=True)
    class Meta:
        model = PayrollRun
        fields = "__all__"