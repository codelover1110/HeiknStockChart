import sys
sys.path.append("..")

from django.shortcuts import render
from rest_framework import generics, views
from .serializer import SignupLinkRoleSerializer

from .models import SingupLinkRole, CustomUser
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

@csrf_exempt
def update_user_role(request):
    if request.method == "POST":
        req = JSONParser().parse(request)
        pk = req['id']
        
        user = CustomUser.objects.get(pk=pk)
        if user is not None:
            if user.is_active == False:
                return JsonResponse({"success": "false", "message": "Deleted user can't be updated!"}, status=201)
            # user.is_superuser = req['is_superuser']
            # user.username = req['username']
            # user.first_name = req['first_name']
            # user.last_name = req['last_name']
            # user.email = req['email']
            # user.phone_number = req['phone_number']
            user.role = req['role']
            user.save()
            return JsonResponse({"success": "true", "message": "User role is updated successfuly!"}, status=201)
        else:
            return JsonResponse({"success": "false", "message": "User is not exist!"}, status=201)
    return JsonResponse({"success": "false", 'message': 'Invalied request method!'}, status=201)


@csrf_exempt
def get_user_list(request):
    all_users = list(CustomUser.objects.all().values())
    result = []
    for user in all_users:
        if user['is_active'] is True:
            result.append(user)
    return JsonResponse(result, safe=False)



@csrf_exempt
def delete_user(request):
    if request.method == 'PUT':
        req = JSONParser().parse(request)
        pk = req['id']
        user = CustomUser.objects.get(pk=pk)
        user.delete()
        # user.is_active = False
        # user.save()
        return JsonResponse({"success": True, "message": "User is deleted!"}, status=201)
    return JsonResponse({"success": "false", 'message': 'Invalied request method!'}, status=201)
 