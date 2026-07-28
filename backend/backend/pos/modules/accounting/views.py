"""
Accounting API views.

Endpoints:
  GET/POST     /api/accounting/accounts/
  GET/PUT/DEL  /api/accounting/accounts/{id}/
  GET/POST     /api/accounting/journal/
  GET/PUT/DEL  /api/accounting/journal/{id}/
  POST         /api/accounting/journal/{id}/post/
  GET          /api/accounting/ledger/{account_id}/
  GET          /api/accounting/trial-balance/
  GET          /api/accounting/profit-loss/?start=&end=
  GET          /api/accounting/balance-sheet/
  GET          /api/accounting/cash-flow/?start=&end=
  GET/POST     /api/accounting/expense-categories/
  GET/POST     /api/accounting/expenses/
  GET/PUT/DEL  /api/accounting/expenses/{id}/
  POST         /api/accounting/expenses/{id}/approve/
"""
from django.db.models import Sum, Q
from django.utils.dateparse import parse_date
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from pos.modules.accounting.models import (
    AccountType, ChartOfAccount, Expense, ExpenseCategory,
    JournalEntry, JournalEntryLine,
)


# ── Serializer helpers (inline) ───────────────────────────────────────────────
from rest_framework import serializers


class AccountSerializer(serializers.ModelSerializer):
    balance  = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model  = ChartOfAccount
        fields = ["id","code","name","type","parent","description","is_active","created_at","balance","children"]

    def get_balance(self, obj):
        return float(obj.balance)

    def get_children(self, obj):
        return AccountSerializer(obj.children.all(), many=True).data


class JournalLineSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)
    account_code = serializers.CharField(source="account.code", read_only=True)

    class Meta:
        model  = JournalEntryLine
        fields = ["id","account","account_name","account_code","description","debit","credit"]


class JournalEntrySerializer(serializers.ModelSerializer):
    lines        = JournalLineSerializer(many=True, read_only=True)
    is_balanced  = serializers.BooleanField(read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = JournalEntry
        fields = ["id","reference","date","description","status","is_auto_posted",
                  "is_balanced","created_by","created_by_name","created_at","lines"]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = ExpenseCategory
        fields = ["id","name","description"]


class ExpenseSerializer(serializers.ModelSerializer):
    category_name  = serializers.CharField(source="category.name", read_only=True)
    paid_by_name   = serializers.SerializerMethodField()

    class Meta:
        model  = Expense
        fields = ["id","category","category_name","amount","description","date",
                  "paid_by","paid_by_name","receipt_image","status","journal_entry","created_at"]

    def get_paid_by_name(self, obj):
        if obj.paid_by:
            return obj.paid_by.get_full_name() or obj.paid_by.username
        return None


# ── ViewSets ──────────────────────────────────────────────────────────────────

class ChartOfAccountViewSet(viewsets.ModelViewSet):
    queryset = ChartOfAccount.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        t  = self.request.query_params.get("type")
        if t:
            qs = qs.filter(type=t)
        root = self.request.query_params.get("root")
        if root:
            qs = qs.filter(parent__isnull=True)
        return qs


class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.prefetch_related("lines__account").all()
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        start = self.request.query_params.get("start")
        end   = self.request.query_params.get("end")
        s     = self.request.query_params.get("status")
        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)
        if s:
            qs = qs.filter(status=s)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def post(self, request, pk=None):
        """Mark a draft journal entry as posted."""
        entry = self.get_object()
        if entry.status == JournalEntry.STATUS_POSTED:
            return Response({"error": "Already posted."}, status=400)
        if not entry.is_balanced:
            return Response({"error": "Journal entry is not balanced (debits ≠ credits)."}, status=400)
        entry.status = JournalEntry.STATUS_POSTED
        entry.save()
        return Response(JournalEntrySerializer(entry).data)

    @action(detail=False, methods=["post"])
    def create_with_lines(self, request):
        """Create a journal entry together with its lines in a single request."""
        data  = request.data
        lines = data.pop("lines", [])
        ser   = JournalEntrySerializer(data=data)
        ser.is_valid(raise_exception=True)
        entry = ser.save(created_by=request.user)
        for line in lines:
            line["entry"] = entry.id
            ls = JournalLineSerializer(data=line)
            ls.is_valid(raise_exception=True)
            ls.save()
        return Response(JournalEntrySerializer(entry).data, status=201)


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related("category","paid_by").all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs  = super().get_queryset()
        cat = self.request.query_params.get("category")
        s   = self.request.query_params.get("status")
        start = self.request.query_params.get("start")
        end   = self.request.query_params.get("end")
        if cat:   qs = qs.filter(category_id=cat)
        if s:     qs = qs.filter(status=s)
        if start: qs = qs.filter(date__gte=start)
        if end:   qs = qs.filter(date__lte=end)
        return qs

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        expense = self.get_object()
        expense.status = Expense.STATUS_APPROVED
        expense.save()
        return Response(ExpenseSerializer(expense).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        expense = self.get_object()
        expense.status = Expense.STATUS_REJECTED
        expense.save()
        return Response(ExpenseSerializer(expense).data)


# ── Reporting Views ───────────────────────────────────────────────────────────

class LedgerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            account = ChartOfAccount.objects.get(pk=account_id)
        except ChartOfAccount.DoesNotExist:
            return Response({"error": "Account not found."}, status=404)

        lines = JournalEntryLine.objects.filter(
            account=account, entry__status=JournalEntry.STATUS_POSTED
        ).select_related("entry").order_by("entry__date", "id")

        running_balance = 0
        result = []
        for line in lines:
            if account.type in [AccountType.ASSET, AccountType.EXPENSE]:
                running_balance += float(line.debit) - float(line.credit)
            else:
                running_balance += float(line.credit) - float(line.debit)
            result.append({
                "date":        str(line.entry.date),
                "reference":   line.entry.reference,
                "description": line.description or line.entry.description,
                "debit":       float(line.debit),
                "credit":      float(line.credit),
                "balance":     running_balance,
            })

        return Response({"account": AccountSerializer(account).data, "lines": result})


class TrialBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        accounts = ChartOfAccount.objects.filter(is_active=True)
        rows = []
        total_dr = total_cr = 0
        for acc in accounts:
            b = float(acc.balance)
            dr = b if acc.type in [AccountType.ASSET, AccountType.EXPENSE] and b > 0 else 0
            cr = abs(b) if b < 0 or acc.type in [AccountType.LIABILITY, AccountType.EQUITY, AccountType.REVENUE] else 0
            rows.append({"code": acc.code, "name": acc.name, "type": acc.type, "debit": dr, "credit": cr})
            total_dr += dr
            total_cr += cr
        return Response({"rows": rows, "total_debit": total_dr, "total_credit": total_cr})


class ProfitLossReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start = request.query_params.get("start")
        end   = request.query_params.get("end")

        # Revenue: sum of posted journal lines on Revenue accounts
        rev_filter = Q(entry__status=JournalEntry.STATUS_POSTED, account__type=AccountType.REVENUE)
        if start: rev_filter &= Q(entry__date__gte=start)
        if end:   rev_filter &= Q(entry__date__lte=end)

        rev_agg = JournalEntryLine.objects.filter(rev_filter).aggregate(c=Sum("credit"), d=Sum("debit"))
        revenue = float((rev_agg["c"] or 0) - (rev_agg["d"] or 0))

        # Expenses: sum of posted journal lines on Expense accounts
        exp_filter = Q(entry__status=JournalEntry.STATUS_POSTED, account__type=AccountType.EXPENSE)
        if start: exp_filter &= Q(entry__date__gte=start)
        if end:   exp_filter &= Q(entry__date__lte=end)

        exp_agg = JournalEntryLine.objects.filter(exp_filter).aggregate(d=Sum("debit"), c=Sum("credit"))
        expenses_total = float((exp_agg["d"] or 0) - (exp_agg["c"] or 0))

        # COGS from expense categories named "Cost of Goods Sold" or similar
        cogs = Expense.objects.filter(
            status=Expense.STATUS_APPROVED, category__name__icontains="cost of goods"
        )
        if start: cogs = cogs.filter(date__gte=start)
        if end:   cogs = cogs.filter(date__lte=end)
        cogs_total = float(cogs.aggregate(t=Sum("amount"))["t"] or 0)

        gross_profit = revenue - cogs_total
        net_profit   = gross_profit - expenses_total

        return Response({
            "revenue":      revenue,
            "cogs":         cogs_total,
            "gross_profit": gross_profit,
            "expenses":     expenses_total,
            "net_profit":   net_profit,
            "income_breakdown":  [],
            "expense_breakdown": [],
        })


class BalanceSheetView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        def section(type_val):
            accs = ChartOfAccount.objects.filter(type=type_val, is_active=True)
            rows = [{"code": a.code, "name": a.name, "balance": float(a.balance)} for a in accs]
            total = sum(r["balance"] for r in rows)
            return {"rows": rows, "total": total}

        return Response({
            "assets":      section(AccountType.ASSET),
            "liabilities": section(AccountType.LIABILITY),
            "equity":      section(AccountType.EQUITY),
        })


class CashFlowReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start = request.query_params.get("start")
        end   = request.query_params.get("end")
        # Simplified: inflows from revenue accounts, outflows from expense accounts
        rev_filter = Q(entry__status=JournalEntry.STATUS_POSTED, account__type=AccountType.REVENUE)
        exp_filter = Q(entry__status=JournalEntry.STATUS_POSTED, account__type=AccountType.EXPENSE)
        if start:
            rev_filter &= Q(entry__date__gte=start)
            exp_filter &= Q(entry__date__gte=start)
        if end:
            rev_filter &= Q(entry__date__lte=end)
            exp_filter &= Q(entry__date__lte=end)

        rev = JournalEntryLine.objects.filter(rev_filter).aggregate(c=Sum("credit"),d=Sum("debit"))
        exp = JournalEntryLine.objects.filter(exp_filter).aggregate(d=Sum("debit"),c=Sum("credit"))

        inflows  = float((rev["c"] or 0) - (rev["d"] or 0))
        outflows = float((exp["d"] or 0) - (exp["c"] or 0))

        return Response({
            "total_inflows":  inflows,
            "total_outflows": outflows,
            "net_cash_flow":  inflows - outflows,
            "inflows":  [{"label": "Sales Revenue", "amount": inflows}],
            "outflows": [{"label": "Operating Expenses", "amount": outflows}],
            "timeline": [],
        })


