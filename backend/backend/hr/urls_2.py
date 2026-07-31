from django.urls import path
from .views import (
    EmployeeListCreateView, EmployeeDetailView, StartShiftView, EndShiftView,
    ShiftListView, ShiftAssignmentListCreateView, CommissionRuleListCreateView,
    CommissionEntryListView, ComputeOrderCommissionView, RunPayrollView,
    PayrollRunListView, PayrollRunDetailView, PayrollCSVView,
)

urlpatterns = [
    path("employees/", EmployeeListCreateView.as_view()),
    path("employees/<int:pk>/", EmployeeDetailView.as_view()),
    path("employees/<int:employee_id>/start-shift/", StartShiftView.as_view()),
    path("shifts/<int:shift_id>/end/", EndShiftView.as_view()),
    path("shifts/", ShiftListView.as_view()),
    path("assignments/", ShiftAssignmentListCreateView.as_view()),
    path("commission-rules/", CommissionRuleListCreateView.as_view()),
    path("commissions/", CommissionEntryListView.as_view()),
    path("orders/<int:order_id>/commissions/", ComputeOrderCommissionView.as_view()),
    path("payroll/run/", RunPayrollView.as_view()),
    path("payroll/", PayrollRunListView.as_view()),
    path("payroll/<int:pk>/", PayrollRunDetailView.as_view()),
    path("payroll/<int:pk>/csv/", PayrollCSVView.as_view()),
]