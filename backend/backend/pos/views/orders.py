from rest_framework import viewsets
from pos.models import *
from ..serializers import *
from rest_framework.views import APIView
from decimal import Decimal
from rest_framework.decorators import api_view
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ..pagination import CustomPagination
import csv
from django.http import HttpResponse
from rest_framework.response import Response
from ..filters import *
from openpyxl import Workbook
from openpyxl.styles import *
from reportlab.platypus import (SimpleDocTemplate,Table,Paragraph,Spacer,)
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
from reportlab.platypus import Table
from ..pdf_helpers import *
from ..helpers import *



class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class CheckoutView(APIView):
    def post(self, request):

        serializer = CheckoutSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        order = serializer.save()

        draft_order_id = request.data.get(
            "draft_order_id"
        )

        if draft_order_id:
            DraftOrder.objects.filter(
                id=draft_order_id
            ).delete()

        return Response({
            "order_id": order.id,
            "total": order.total
        })   
    

@api_view(["GET"])
def receipt(request, order_id):

    order = get_object_or_404(
        Order,
        id=order_id
    )

    if order.status == "draft":
        return Response(
            {"error": "Draft orders cannot be printed."},
            status=400
        )

    company = Company.objects.first()

    items = OrderItem.objects.filter(
        order=order
    )

    return Response({

        "receipt_type": "sale", 

        "company": {

            "name": company.name if company else "",
            "tagline": company.tagline if company else "",
            "address": company.address if company else "",
            "phone": company.phone if company else "",
            "email": company.email if company else "",
            "website": company.website if company else "",
            "tax_number": company.tax_number if company else "",
            "footer_message": company.footer_message if company else "",
            "currency": company.currency if company else "Rs",
            "logo": company.logo.url if company and company.logo else None,
            "receipt_paper": company.receipt_paper if company else "80mm",
            "gst": company.gst if company else "",
        },

        "order": {

            "id": order.id,
            "number": order.order_number,
            "date": order.created_at,
            "customer": order.customer.name if order.customer else "Walk-in Customer",
            "payment_method": order.payment_method,
            "status": order.status,
            "note": order.note

        },

        "items": [

            {

                "name": item.product.name,
                "qty": item.quantity,
                "price": float(item.unit_price),
                "subtotal": float(item.subtotal)

            }

            for item in items

        ],

        "totals": {

            "subtotal": float(order.subtotal),
            "discount": float(order.discount),
            "tax": float(order.tax),
            "total": float(order.total),
            "paid": float(order.amount_received),
            "change": float(order.change_amount)

        },

    })


class OrderHistoryView(APIView):

    def get(self, request):

        status = request.GET.get("status")

        paginator = CustomPagination()

        if status == "draft":

            drafts = get_filtered_drafts(request)

            page = paginator.paginate_queryset(drafts, request)

            serializer = DraftOrderHistorySerializer(page, many=True)

            return paginator.get_paginated_response(serializer.data)

        orders = get_filtered_orders(request)

        page = paginator.paginate_queryset(orders, request)

        serializer = OrderHistorySerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)



class OrderDetailView(APIView):

    def get(self, request, order_id):

        order = get_object_or_404(
            Order,
            id=order_id
        )

        items_data = []

        refunded_total = (order.refunds.aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00"))


        if order.total > 0:
            refund_ratio = refunded_total / order.total
        else:
            refund_ratio = Decimal("0.00")

        remaining_subtotal = order.subtotal * (Decimal("1.00") - refund_ratio)
        remaining_total = order.total - refunded_total

        for item in order.items.all():

            refunded_qty = (
            RefundItem.objects.filter(order_item=item)
            .aggregate(total=Sum("quantity"))["total"]
            or 0
        )

            remaining_qty = item.quantity - refunded_qty

            refunded_amount = item.unit_price * refunded_qty

            item_remaining_subtotal = item.unit_price * remaining_qty


            items_data.append({

                "product": item.product.name,

                "purchased_qty": item.quantity,

                "refunded_qty": refunded_qty,

                "remaining_qty": remaining_qty,

                "price": float(item.unit_price),

                "subtotal": float(item_remaining_subtotal)

            })

        return Response({

            "id": order.id,

            "order_number": order.order_number,

            "customer": (
                order.customer.name
                if order.customer
                else "Walk-in Customer"
            ),

            "payment_method": order.payment_method,

            "created_at": order.created_at,

            "status": order.status,

            "subtotal": float(order.subtotal),

            "discount": float(order.discount),

            "tax": float(order.tax),

            "total": float(order.total),
            
            "refunded_total": float(refunded_total),
            
            "remaining_total": float(remaining_total),

            "amount_received": float(order.amount_received),

            "change_amount": float(order.change_amount),

            "items": items_data

        })  


class OrderHistoryCSVExportView(APIView):

    def get(self, request):

        status = request.GET.get("status")

        if status == "draft":
        
            drafts = get_filtered_drafts(request)

            response = HttpResponse(content_type="text/csv")
            filename = build_export_filename(request,"draft_orders","csv")

            response["Content-Disposition"] = (f'attachment; filename="{filename}"')

            writer = csv.writer(response)

            writer.writerow([
                "Draft No",
                "Customer",
                "Date",
                "Session"
            ])

            for draft in drafts:
                writer.writerow([
                    draft.order_number,
                    draft.customer.name if draft.customer else "Walk-in Customer",
                    draft.created_at.strftime("%Y-%m-%d %H:%M"),
                    str(draft.session),
                ])

            return response
        

        orders = get_filtered_orders(request)

        response = HttpResponse(content_type="text/csv")

        filename = build_export_filename( request,"orders","csv")

        response["Content-Disposition"] = (f'attachment; filename="{filename}"')

        writer = csv.writer(response)

        writer.writerow([
            "Order No",
            "Customer",
            "Payment",
            "Session",
            "Subtotal",
            "Discount",
            "Tax",
            "Total",
            "Status",
            "Date",
        ])

        for order in orders:

            writer.writerow([
                order.order_number,
                order.customer.name if order.customer else "Walk-in Customer",
                order.payment_method,
                order.session if order.session else "",
                order.subtotal,
                order.discount,
                order.tax,
                order.total,
                order.status,
                order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            ])

        return response


class OrderHistoryExportExcelView(APIView):

    def get(self, request):

        orders = get_filtered_orders(request)

        workbook = Workbook()

        sheet = workbook.active

        sheet.title = "Orders"

        sheet.freeze_panes = "A2"

        headers = [
            "Order No",
            "Customer",
            "Payment",
            "Total",
            "Status",
            "Session",
            "Date",
        ]

        sheet.append(headers)

        header_fill = PatternFill(
            fill_type="solid",
            fgColor="1F4E78"
        )

        for cell in sheet[1]:
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center")

        for order in orders:
        
            sheet.append([
                order.order_number,
                order.customer.name if order.customer else "Walk-in Customer",
                order.payment_method,
                float(order.total),
                order.status,
                str(order.session),
                order.created_at.strftime("%Y-%m-%d %H:%M"),
            ])

        # ---------- Add Excel filter ----------
        sheet.auto_filter.ref = sheet.dimensions

        # ---------- Format Total column ----------
        for cell in sheet["D"][1:]:
            cell.number_format = '#,##0.00'

        # ---------- Auto width ----------
        for column_cells in sheet.columns:
        
            length = max(
                len(str(cell.value)) if cell.value else 0
                for cell in column_cells
            )

            sheet.column_dimensions[
                column_cells[0].column_letter
            ].width = length + 3

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        filename = build_export_filename(request,"orders","xlsx")

        response["Content-Disposition"] = (f'attachment; filename="{filename}"')

        workbook.save(response)

        return response


class OrderHistoryExportPDFView(APIView):

    def get(self, request):

        buffer = BytesIO()

        doc = SimpleDocTemplate(buffer)

        styles = getSampleStyleSheet()
       
        total_orders = 0
        subtotal = 0
        discount = 0
        tax = 0
        grand_total = 0

        company = Company.objects.first()

        story = []

        orders = get_filtered_orders(request)   

        add_company_header(story,company,)                                   

        add_report_title(story,"ORDER HISTORY REPORT",)        

        generated = timezone.localtime().strftime("%d-%b-%Y %I:%M %p")

        story.append(Spacer(1, 10))

        customer = request.GET.get("customer")
        payment = request.GET.get("payment")
        session = request.GET.get("session")
        date = request.GET.get("date")
        status = request.GET.get("status")

        report_info = [
            ["Generated", generated]
        ]

        if customer:
            try:
                customer_name = Customer.objects.get(id=customer).name
                report_info.append(["Customer", customer_name])
            except Customer.DoesNotExist:
                pass
            
        if payment:
            report_info.append(["Payment", payment])

        if session:
            report_info.append(["Session", session])

        if status:
            report_info.append(["Status", status.title()])

        if date:
            report_info.append(["Date Filter", date.title()])  

        add_report_info(story,report_info,)

        if not orders.exists():
        
            story.append(
            
                Paragraph(
                    "No orders found for the selected filters.",
                    styles["Heading3"]
                )

            )        

        table_data = [[
            "S.No",
            "Order No",
            "Customer",
            "Payment",
            "Total",
            "Status",
            "Date",
        ]]

        for index, order in enumerate(orders, start=1):

            total_orders += 1
            subtotal += order.subtotal
            discount += order.discount
            tax += order.tax
            grand_total += order.total
        
            table_data.append([

                index,
            
                order.order_number,

                order.customer.name
                if order.customer
                else "Walk-in Customer",

                order.payment_method,

                f"Rs {order.total:,.2f}",

                order.status.replace("_", " ").title(),

                order.created_at.strftime("%d-%b-%Y"),

            ])     

        table = Table(table_data)

        style_report_table(table,len(table_data))

        story.append(table)  

        story.append(Spacer(1, 25))

        summary_data = [

            ["Total Orders", str(total_orders)],

            ["Subtotal", f"Rs {subtotal:,.2f}"],

            ["Discount", f"Rs {discount:,.2f}"],

            ["Tax", f"Rs {tax:,.2f}"],

            ["Grand Total", f"Rs {grand_total:,.2f}"],
        ]

        add_summary_table(story,"SUMMARY",summary_data,)

        doc.build(
            story,
            onFirstPage=add_page_footer,
            onLaterPages=add_page_footer,
        )

        pdf = buffer.getvalue()

        buffer.close()

        response = HttpResponse(
            pdf,
            content_type="application/pdf"
        )

        filename = build_export_filename(
            request,
            "orders",
            "pdf"
        )

        response["Content-Disposition"] = (
            f'attachment; filename="{filename}"'
        )

        return response     


@api_view(["GET"])
def order_stats(request):

    total_orders = Order.objects.count()

    total_items = (
        OrderItem.objects.aggregate(
            total=Sum("quantity")
        )["total"] or 0
    )

    refund_orders = Order.objects.filter(
        status__in=["refunded", "partially_refunded"]
    ).count()

    completed_orders = Order.objects.filter(
        status="paid"
    ).count()

    return Response({
        "total_orders": total_orders,
        "total_items": total_items,
        "refund_orders": refund_orders,
        "completed_orders": completed_orders,
    })           