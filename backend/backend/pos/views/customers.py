from rest_framework import viewsets
from ..serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response



class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer



class CustomerListView(APIView):

    def get(self, request):

        customers = Customer.objects.all()

        data = [
            {
                "id": c.id,
                "name": c.name,
                "phone": c.phone
            }
            for c in customers
        ]

        return Response(data)


class CustomerCreateView(APIView):

    def post(self, request):

        customer = Customer.objects.create(
            name=request.data.get("name"),
            phone=request.data.get("phone", "")
        )

        return Response({
            "id": customer.id,
            "name": customer.name
        })


class AssignCustomerView(APIView):

    def post(self, request):

        draft = DraftOrder.objects.get(
            id=request.data.get("draft_id")
        )

        draft.customer_id = request.data.get(
            "customer_id"
        )

        draft.save()

        return Response({
            "success": True
        })    