from ..serializers import *
from rest_framework.response import Response
from rest_framework.views import APIView



class CompanyView(APIView):

    def get(self, request):

        company = Company.objects.first()

        serializer = CompanySerializer(company)

        return Response(serializer.data)