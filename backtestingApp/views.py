from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate, login
from codes.forms import CodeForm
from users.forms import SignUpForm
from users.models  import CustomUser
from .utils import send_email
from django.http.response import JsonResponse
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser 
import json

@csrf_exempt 
def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({'success': 'success'}, status=status.HTTP_201_CREATED)
        else:
            return JsonResponse({'error': [(v[0]) for k, v in form.errors.items()]}, status=status.HTTP_409_CONFLICT)
    return JsonResponse({'success': 'false'}, status=status.HTTP_409_CONFLICT)

@csrf_exempt 
def auth_view(request):
    if request.method == "POST":
        request_data = JSONParser().parse(request)
        username = request_data['username']
        password = request_data['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            request.session['pk'] = user.pk
            sendVerifyCodetoEmail(user.pk)
            return JsonResponse({'user_id': user.pk}, status=status.HTTP_201_CREATED)
    return JsonResponse({'user_id': None}, status=status.HTTP_401_UNAUTHORIZED)

def sendVerifyCodetoEmail(pk):
    user = CustomUser.objects.get(pk = pk)
    code_user = f"{user.username}: {user.code}"
    send_email(code_user, user.email)
    return JsonResponse({'sending': 'email'}, status=status.HTTP_201_CREATED)

@csrf_exempt 
def verify_view(request):
    request_data = JSONParser().parse(request)
    user_id = request_data['user_id']
    num = request_data['num']
    user = CustomUser.objects.get(pk = user_id)
    code = user.code
    if str(code) == num:
        code.save()
        return JsonResponse({'verify': True}, status=status.HTTP_201_CREATED)
    return JsonResponse({'verify': False}, status=status.HTTP_201_CREATED)

