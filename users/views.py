import sys
sys.path.append("..")

from django.shortcuts import render
from rest_framework import generics, views
from .serializer import SignupLinkRoleSerializer

from .models import SingupLinkRole
from django.http import JsonResponse
from django.core import serializers

from .utils import generate_random_code
from backtestingApp.utils import send_email
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser 


class SignupLinkRoleView(views.APIView):
    serializer_class = SignupLinkRoleSerializer
    
    def get(self, request, *args, **kwargs):
        res = SingupLinkRole.objects.all().values()
        return JsonResponse(list(res), safe=False)

    def post(self, request):
        data = dict()
        data['role'] = request.data['roles']
        data['link'] = request.data['link'] + generate_random_code(15)
        links = SignupLinkRoleSerializer(data=data)
        if links.is_valid():
            links.save()
            return JsonResponse({"success": "create link"}, status=201)
        return JsonResponse({"success": "failed"}, status=401)

@csrf_exempt
def send_link_to_email(request) :
    if request.method == "POST":
        request_data = JSONParser().parse(request)
        print(request_data)
        email = request_data['email']
        link = request_data['link']
        send_email(link, email)
        return JsonResponse({"success": "true"}, status=201)
    return JsonResponse({"success": "true"}, status=201)
     