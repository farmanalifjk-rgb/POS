from pos.models import *
from ..serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from decimal import Decimal
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from rest_framework.pagination import PageNumberPagination
import csv
from django.http import HttpResponse
from ..filters import *
from openpyxl import Workbook
from openpyxl.styles import *
from reportlab.platypus import (SimpleDocTemplate,Table,TableStyle)
from io import BytesIO
from ..pdf_helpers import *
from ..services.inventory import update_stock
from ..helpers import *



class RefundDetailView(APIView):

    def get(self, request, order_id):

        order = Order.objects.get(id=order_id)

        items = []

        for item in OrderItem.objects.filter(order=order):

            refunded = (
                RefundItem.objects.filter(order_item=item)
                .aggregate(total=Sum("quantity"))["total"]
                or 0
            )

            items.append({

                "order_item_id": item.id,

                "product": item.product.name,

                "sold_qty": item.quantity,

                "refunded_qty": refunded,

                "remaining_qty": item.quantity - refunded,

                "price": item.unit_price,

            })

        return Response({

            "order_id": order.id,

            "order_number": order.order_number,

            "customer": order.customer.name if order.customer else "Walk-in Customer",

            "items": items

        })
    

class ProcessRefundView(APIView):

    @transaction.atomic
    def post(self, request):

        order_id = request.data.get("order_id")

        if not order_id:
            return Response(
                {"error": "order_id is required"},
                status=400
            )

        order = Order.objects.get(id=order_id)

        refund = Refund.objects.create(
            order=order,
            reason=request.data.get("reason", ""),
            subtotal=Decimal("0.00"),
            discount=Decimal("0.00"),
            tax=Decimal("0.00"),
            total_amount=Decimal("0.00"),
        )

        refund_subtotal = Decimal("0.00")
        refund_total = Decimal("0.00")

        for row in request.data["items"]:

            qty = int(row["quantity"])

            if qty <= 0:
                continue

            order_item = OrderItem.objects.get(
                id=row["order_item_id"]
            )

            already_refunded = (
                RefundItem.objects.filter(
                    order_item=order_item
                ).aggregate(
                    total=Sum("quantity")
                )["total"] or 0
            )

            remaining = order_item.quantity - already_refunded

            if qty > remaining:
                raise serializers.ValidationError(
                    f"You cannot refund more than {remaining} "
                    f"for {order_item.product.name}"
                )

            # Original subtotal for refunded quantity
            line_subtotal = (
                order_item.unit_price * qty
            ).quantize(Decimal("0.01"))

            refund_subtotal += line_subtotal

            # Ratio of refunded quantity
            line_ratio = Decimal(qty) / Decimal(order_item.quantity)

            # Actual amount customer receives
            line_total = (
                order.total *
                (order_item.subtotal / order.subtotal)
            )

            amount = (
                line_total * line_ratio
            ).quantize(Decimal("0.01"))

            refund_total += amount

            RefundItem.objects.create(
                refund=refund,
                order_item=order_item,
                quantity=qty,
                subtotal=line_subtotal,
                amount=amount
            )

            product = order_item.product
            
            update_stock(
                product=product,
                quantity=qty,
                movement_type="refund",
                reference=f"RE-{refund.id:06d}",
                note=f"Refund for Order {order.order_number}",
            )

        # Calculate proportional discount/tax once
        if order.total > 0:
            ratio = refund_total / order.total
        else:
            ratio = Decimal("0.00")

        refund_discount = (
            order.discount * ratio
        ).quantize(Decimal("0.01"))

        refund_tax = (
            order.tax * ratio
        ).quantize(Decimal("0.01"))

        refund.subtotal = refund_subtotal
        refund.discount = refund_discount
        refund.tax = refund_tax
        refund.total_amount = refund_total
        refund.save()

        # Update order status
        fully_refunded = True

        for item in OrderItem.objects.filter(order=order):

            refunded = (
                RefundItem.objects.filter(
                    order_item=item
                ).aggregate(
                    total=Sum("quantity")
                )["total"] or 0
            )

            if refunded < item.quantity:
                fully_refunded = False
                break

        order.status = (
            "refunded"
            if fully_refunded
            else "partially_refunded"
        )

        order.save()

        return Response({
            "success": True,
            "refund_id": refund.id,
            "refund_total": refund_total
        })  


class RefundHistoryView(APIView):

    def get(self, request, order_id):

        refunds = Refund.objects.filter(
            order_id=order_id
        ).order_by("-created_at")

        data = []

        for refund in refunds:

            items = RefundItem.objects.filter(
                refund=refund
            )

            data.append({

                "refund_id": refund.id,

                "date": refund.created_at,

                "reason": refund.reason,

                "total": refund.total_amount,

                "items":[

                    {

                        "product": i.order_item.product.name,

                        "qty": i.quantity,

                        "amount": i.amount

                    }

                    for i in items

                ]

            })

        return Response(data)


class RefundReceiptView(APIView):

    def get(self, request, refund_id):

        refund = get_object_or_404(
            Refund,
            id=refund_id
        )

        company = Company.objects.first()

        refund_subtotal = sum(
            item.order_item.unit_price * item.quantity
            for item in refund.items.all()
        )

        if refund.order.total > 0:
            refund_ratio = refund.total_amount / refund.order.total
        else:
            refund_ratio = Decimal("0.00")

        refund_discount = refund.order.discount * refund_ratio

        refund_tax = refund.order.tax * refund_ratio   
        
        refund_total = refund_subtotal - refund_discount + refund_tax 

        return Response({

            "receipt_type": "refund",

            "company": {
                "name": company.name if company else "",
                "tagline": company.tagline if company else "",
                "address": company.address if company else "",
                "phone": company.phone if company else "",
                "email": company.email if company else "",
                "footer_message": company.footer_message if company else "",
                "website": company.website if company else "",
                "currency": company.currency if company else "Rs",
                "logo": company.logo.url if company and company.logo else None,
                "gst": company.gst if company else "",
            },

            "totals": {

                "subtotal": round(refund_subtotal,2),

                "discount": round(refund_discount,2),

                "tax": round(refund_tax,2),

                "total": round(refund_total,2),

                "paid": round(refund.total_amount,2),

                "change": 0,

            },

            "order": {
                "number": f"RE-{refund.id:06d}",
                "original_order": refund.order.order_number,
                "date": refund.created_at,
                "customer": (
                    refund.order.customer.name
                    if refund.order.customer
                    else "Walk-in Customer"
                ),
                "payment_method": refund.order.payment_method,
                "note": refund.reason,
            },

            "items": [
                    {
                    "name": item.order_item.product.name,
                    "qty": item.quantity,
                    "price": float(item.order_item.unit_price),
                    "subtotal": float(item.order_item.unit_price * item.quantity),
                }
                
                for item in refund.items.all()
            ]
        })   


class RefundHistoryListView(APIView):

    def get(self, request):

        refunds = get_filtered_refunds(request)          

        paginator = PageNumberPagination()
        paginator.page_size = 20

        page = paginator.paginate_queryset(refunds, request)

        data = []

        for refund in page:
        
            data.append({
            
                "id": refund.id,
                "refund_number": f"RE-{refund.id:06d}",
                "order_number": refund.order.order_number,
                "customer": (
                    refund.order.customer.name
                    if refund.order.customer
                    else "Walk-in Customer"
                ),
                "payment_method": refund.order.payment_method,
                "date": refund.created_at,
                "amount": float(refund.total_amount),
                "reason": refund.reason,
            })

        return paginator.get_paginated_response(data)


class RefundDetailHistoryView(APIView):

    def get(self, request, refund_id):

        refund = get_object_or_404(
            Refund,
            id=refund_id
        )

        return Response({

            "id": refund.id,

            "refund_number": f"RE-{refund.id:06d}",
            
            "order_id": refund.order.id,

            "order_number": refund.order.order_number,

            "customer": (
                refund.order.customer.name
                if refund.order.customer
                else "Walk-in Customer"
            ),

            "date": refund.created_at,

            "reason": refund.reason,

            "total": float(refund.total_amount),

            "items": [

                {

                    "product": item.order_item.product.name,

                    "qty": item.quantity,

                    "price": float(item.order_item.unit_price),

                    "amount": float(item.amount)

                }

                for item in refund.items.all()

            ]

        })
    

class RefundHistoryCSVExportView(APIView):

    def get(self, request):

        refunds = get_filtered_refunds(request)

        response = HttpResponse(content_type="text/csv")
        filename = build_export_filename(request,"refunds","csv")

        response["Content-Disposition"] = (f'attachment; filename="{filename}"')

        writer = csv.writer(response)

        writer.writerow([
            "Refund No",
            "Order No",
            "Customer",
            "Payment",
            "Amount",
            "Date"
        ])

        for refund in refunds:
            writer.writerow([
                f"RE-{refund.id:06d}",
                refund.order.order_number,
                refund.order.customer.name if refund.order.customer else "Walk-in Customer",
                refund.order.payment_method,
                refund.total_amount,
                refund.created_at.strftime("%Y-%m-%d %H:%M"),
            ])

        return response
 


class RefundHistoryExportExcelView(APIView):

    def get(self, request):

        refunds = get_filtered_refunds(request)

        workbook = Workbook()
        sheet = workbook.active

        sheet.title = "Refund Orders"
        sheet.freeze_panes = "A2"

        headers = [
            "Refund No",
            "Order No",
            "Customer",
            "Payment",
            "Refund",
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

        

        for refund in refunds:

            sheet.append([
                f"RE-{refund.id:06d}",
                refund.order.order_number,
                refund.order.customer.name if refund.order.customer else "Walk-in Customer",
                refund.order.payment_method,
                refund.total_amount,
                refund.created_at.strftime("%Y-%m-%d %H:%M"),
            ])

        sheet.auto_filter.ref = sheet.dimensions

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

        filename = build_export_filename(request,"refunds","xlsx")

        response["Content-Disposition"] = (f'attachment; filename="{filename}"')

        workbook.save(response)

        return response
 
    

class RefundHistoryExportPDFView(APIView):

    def get(self, request):

        buffer = BytesIO()

        doc = SimpleDocTemplate(buffer)

        company = Company.objects.first()

        story = []

        add_company_header(
            story,
            company,
        )

        add_report_title(
            story,
            "REFUND HISTORY REPORT",
        ) 

        refunds = get_filtered_refunds(request)

        generated = timezone.localtime().strftime("%d-%b-%Y %I:%M %p")

        report_info = [["Generated", generated]]

        add_report_info(story,report_info,)

        table_data = [[
            "S.No",
            "Refund No",
            "Order No",
            "Customer",
            "Payment",
            "Amount",
            "Date",
        ]]

        total_refunds = 0
        refund_amount = 0

        for index, refund in enumerate(refunds, start=1):
        
            total_refunds += 1
            refund_amount += refund.total_amount

            table_data.append([
            
                index,

                f"RE-{refund.id:06d}",

                refund.order.order_number,

                refund.order.customer.name
                if refund.order.customer
                else "Walk-in Customer",

                refund.order.payment_method.title(),

                f"Rs {refund.total_amount:,.2f}",

                refund.created_at.strftime("%d-%b-%Y"),

            ])

        table = Table(
            table_data,
            colWidths=[35, 70, 80, 120, 70, 70, 80],
            repeatRows=1,
        ) 

        style_report_table(table,len(table_data),)

        table.setStyle(TableStyle([

            ("ALIGN", (0, 0), (0, -1), "CENTER"),  # S.No

            ("ALIGN", (5, 1), (5, -1), "RIGHT"),   # Amount

        ]))   

        story.append(table)  

        summary_data = [

            ["Total Refunds", str(total_refunds)],

            ["Refund Amount", f"Rs {refund_amount:,.2f}"],

        ] 

        add_summary_table(story,"REFUND SUMMARY",summary_data,)

        doc.build(
            story,
            onFirstPage=add_page_footer,
            onLaterPages=add_page_footer,
        )

        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(
            pdf,
            content_type="application/pdf",
        )

        filename = build_export_filename(
            request,
            "refunds",
            "pdf",
        )

        response["Content-Disposition"] = (
            f'attachment; filename="{filename}"'
        )

        return response     