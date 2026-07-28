from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from ..serializers import CashSessionSerializer, OrderSerializer
from ..models import CashSession, CashTransaction, Order

class CashSessionListView(APIView):
    def get(self, request):
        status_filter = request.query_params.get('status')
        date_filter = request.query_params.get('date')
        cashier_filter = request.query_params.get('cashier')
        sessions = CashSession.objects.all().order_by("-id")
        
        if status_filter == 'open':
            sessions = sessions.filter(is_open=True)
        elif status_filter == 'closed':
            sessions = sessions.filter(is_open=False)
            
        if date_filter and date_filter != 'all' and date_filter != 'today':
            sessions = sessions.filter(opened_at__date=date_filter)
        elif date_filter == 'today':
            from django.utils.timezone import now
            sessions = sessions.filter(opened_at__date=now().date())
            
        if cashier_filter:
            sessions = sessions.filter(employee_name__icontains=cashier_filter)
            
        search_filter = request.query_params.get('search')
        if search_filter:
            sessions = sessions.filter(id__icontains=search_filter)
            
        serializer = CashSessionSerializer(sessions, many=True)
        return Response(serializer.data)

class CashTransactionView(APIView):
    def post(self, request, pk, action):
        try:
            session = CashSession.objects.get(pk=pk, is_open=True)
        except CashSession.DoesNotExist:
            return Response({"error": "Active session not found."}, status=status.HTTP_404_NOT_FOUND)
            
        amount = request.data.get('amount')
        reason = request.data.get('reason')
        
        if not amount or not reason:
            return Response({"error": "Amount and reason are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        CashTransaction.objects.create(
            session=session,
            transaction_type=action,
            amount=amount,
            reason=reason
        )
        return Response({"message": f"Cash {action} recorded."})

class CashSessionCloseView(APIView):
    def post(self, request, pk):
        try:
            session = CashSession.objects.get(pk=pk, is_open=True)
            actual_cash = request.data.get("actual_cash", 0)

            # Auto-close related draft orders
            session.orders.filter(status='draft').update(status='cancelled')

            session.is_open = False
            session.closed_at = timezone.now()
            session.actual_closing_balance = actual_cash
            
            # Recalculate closing balance safely
            total_cash_in = session.transactions.filter(transaction_type='in').aggregate(total=Sum('amount'))['total'] or 0
            total_cash_out = session.transactions.filter(transaction_type='out').aggregate(total=Sum('amount'))['total'] or 0
            
            total_sales = session.orders.filter(status__in=['paid', 'partially_refunded']).aggregate(total=Sum('total'))['total'] or 0
            total_refunds = session.orders.filter(status__in=['refunded', 'partially_refunded']).aggregate(total=Sum('change_amount'))['total'] or 0 # Simplified

            expected = Decimal(session.opening_balance) + Decimal(total_cash_in) - Decimal(total_cash_out) + Decimal(total_sales) - Decimal(total_refunds)
            session.closing_balance = expected

            session.save()
            return Response({"message": "Session closed", "expected": expected})

        except CashSession.DoesNotExist:
            return Response({"error": "Session not found or already closed"}, status=status.HTTP_404_NOT_FOUND)

class CashSessionCashiersView(APIView):
    def get(self, request):
        cashiers = CashSession.objects.exclude(employee_name="").values_list('employee_name', flat=True).distinct()
        data = [{"name": c} for c in cashiers]
        return Response(data)

class CashSessionTimelineView(APIView):
    def get(self, request, pk):
        try:
            session = CashSession.objects.get(pk=pk)
        except CashSession.DoesNotExist:
            return Response({"error": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
            
        events = []
        
        events.append({
            "type": "opened",
            "description": f"Session Opened by {session.employee_name or 'Admin'}",
            "amount": session.opening_balance,
            "timestamp": session.opened_at
        })
        
        transactions = CashTransaction.objects.filter(session=session)
        for t in transactions:
            events.append({
                "type": f"cash_{t.transaction_type}",
                "description": t.reason,
                "amount": t.amount,
                "timestamp": t.created_at
            })
            
        orders = Order.objects.filter(session=session).exclude(status='draft').exclude(status='cancelled')
        for o in orders:
            event_type = "refund" if "refund" in o.status else "sale"
            events.append({
                "type": event_type,
                "description": f"Order #{o.order_number or o.id}",
                "amount": o.total,
                "timestamp": o.created_at
            })
            
        if not session.is_open:
            events.append({
                "type": "closed",
                "description": session.notes or "Session Closed",
                "amount": session.actual_closing_balance,
                "timestamp": session.closed_at
            })
            
        events.sort(key=lambda x: x["timestamp"])
        
        return Response(events)