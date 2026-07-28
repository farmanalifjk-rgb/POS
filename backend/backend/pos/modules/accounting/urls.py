from django.urls import path, include
from rest_framework.routers import DefaultRouter
from pos.modules.accounting.views import (
    ChartOfAccountViewSet, JournalEntryViewSet,
    ExpenseCategoryViewSet, ExpenseViewSet,
    LedgerView, TrialBalanceView, ProfitLossReportView,
    BalanceSheetView, CashFlowReportView,
)

router = DefaultRouter()
router.register(r"accounting/accounts",          ChartOfAccountViewSet,   basename="accounting-accounts")
router.register(r"accounting/journal",           JournalEntryViewSet,     basename="accounting-journal")
router.register(r"accounting/expense-categories",ExpenseCategoryViewSet,  basename="expense-categories")
router.register(r"accounting/expenses",          ExpenseViewSet,          basename="expenses")

urlpatterns = [
    path("", include(router.urls)),
    path("accounting/ledger/<int:account_id>/", LedgerView.as_view(),          name="accounting-ledger"),
    path("accounting/trial-balance/",           TrialBalanceView.as_view(),     name="accounting-trial-balance"),
    path("reports/profit-loss/",                ProfitLossReportView.as_view(), name="reports-profit-loss"),
    path("reports/balance-sheet/",              BalanceSheetView.as_view(),     name="reports-balance-sheet"),
    path("reports/cash-flow/",                  CashFlowReportView.as_view(),   name="reports-cash-flow"),
]


