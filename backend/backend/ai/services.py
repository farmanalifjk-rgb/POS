from datetime import timedelta
from decimal import Decimal
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from django.utils import timezone

from pos.models import Order, OrderItem, Product, Category
from reports.services import sales_summary, profit_margin, top_products, sales_by_category
from .models import AIQuery, ReorderSuggestion, PromptTemplate


def _avg_daily_sales(product, days=30):
    since = timezone.now() - timedelta(days=days)
    qs = OrderItem.objects.filter(product=product, order__created_at__gte=since,
                                   order__status__in=["paid", "partially_refunded"])
    total = qs.aggregate(t=Sum("quantity"))["t"] or Decimal("0")
    return Decimal(total) / Decimal(days)


def generate_reorder_suggestions():
    """Scan all active products and create reorder suggestions for low / fast-moving items."""
    suggestions = []
    for p in Product.objects.filter(is_active=True):
        avg_daily = _avg_daily_sales(p)
        if avg_daily <= 0:
            continue
        days_of_stock = Decimal(p.stock_quantity) / avg_daily if avg_daily > 0 else Decimal("999")
        lead_time = 7
        reorder_point = max((avg_daily * lead_time * Decimal("1.5")), Decimal(p.min_stock or 1))
        if Decimal(p.stock_quantity) > reorder_point and days_of_stock > 14:
            continue
        suggested_qty = max(int((avg_daily * 30) - p.stock_quantity), int(reorder_point))
        confidence = Decimal("0.85") if avg_daily > 2 else Decimal("0.60")
        rationale = (f"Avg {avg_daily:.1f}/day, {days_of_stock:.0f} days of stock left, "
                      f"reorder point {reorder_point:.0f}, lead time {lead_time}d.")
        s = ReorderSuggestion.objects.create(product=p, suggested_qty=suggested_qty,
                                             current_stock=p.stock_quantity, avg_daily_sales=avg_daily,
                                             days_of_stock=days_of_stock, lead_time_days=lead_time,
                                             confidence=confidence, rationale=rationale)
        suggestions.append(s.id)
    return {"generated": len(suggestions), "ids": suggestions}


def _build_context(question):
    """Gather relevant data for the LLM based on keywords in the question."""
    now = timezone.now()
    last_30 = (now - timedelta(days=30), now)
    last_7 = (now - timedelta(days=7), now)
    context = {"question": question}
    q = question.lower()
    if any(w in q for w in ["sale", "revenue", "profit", "margin", "today", "week", "month"]):
        context["sales_summary_30d"] = sales_summary(*last_30)
        context["profit_margin_30d"] = profit_margin(*last_30)
        context["sales_summary_7d"] = sales_summary(*last_7)
        context["top_products_30d"] = top_products(last_30[0], last_30[1], 10)
        context["sales_by_category_30d"] = sales_by_category(*last_30)
    if any(w in q for w in ["product", "stock", "inventory", "reorder", "low"]):
        low_stock = list(Product.objects.filter(is_active=True, stock_quantity__lte=5)
                         .values("name", "sku", "stock_quantity")[:20])
        context["low_stock_products"] = low_stock
    return context


def ask(question, user=None, model="automatic"):
    """Natural-language sales/business query answered by LLM with live data context."""
    from base44.integrations import Core
    context = _build_context(question)
    prompt = (f"You are a POS business analyst. Answer the user's question using ONLY the provided data. "
              f"Be concise and specific. Include numbers.\n\n"
              f"Question: {question}\n\n"
              f"Data context: {context}")
    try:
        result = Core.InvokeLLM(prompt=prompt, model=model)
        answer = result if isinstance(result, str) else str(result)
        tokens = 0
    except Exception as e:
        answer = f"Sorry, I couldn't process that: {e}"
        tokens = 0
    q = AIQuery.objects.create(user=user, question=question, answer=answer,
                                data=context, model=model, tokens_used=tokens)
    return {"id": q.id, "answer": answer}


def daily_summary(user=None, model="automatic"):
    """Generate a natural-language end-of-day business summary."""
    from base44.integrations import Core 
    now = timezone.now()
    today = (now.replace(hour=0, minute=0, second=0), now)
    data = {
        "sales_summary": sales_summary(*today),
        "profit_margin": profit_margin(*today),
        "top_products": top_products(today[0], today[1], 5),
    }
    prompt = (f"Write a concise end-of-day business summary for a retail POS. "
              f"Highlight net sales, profit, and top products. Data: {data}")
    try:
        result = Core.InvokeLLM(prompt=prompt, model=model)
        answer = result if isinstance(result, str) else str(result)
    except Exception as e:
        answer = f"Could not generate summary: {e}"
    q = AIQuery.objects.create(user=user, question="End-of-day summary", answer=answer,
                                data=data, model=model)
    return {"id": q.id, "summary": answer, "data": data}