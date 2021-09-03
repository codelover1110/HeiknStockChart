from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate, login
from codes.forms import CodeForm
from users.models  import CustomUser
from users.models import SingupLinkRole
from .utils import send_email
from django.http.response import JsonResponse
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode as uid_decoder
from django.utils.http import urlsafe_base64_encode as uid_encoder 
from django.utils.encoding import force_bytes
from django.utils.encoding import force_text
import json

@csrf_exempt 
def signup_view(request):
    if request.method == 'POST':
        print(request)
        request_data = JSONParser().parse(request)
        try:
            # signup_link = request_data['signup_path']
            # if SingupLinkRole.objects.filter(link=signup_link).exists():
            #     pk = SingupLinkRole.objects.get(link=signup_link).pk
            #     obj = SingupLinkRole.objects.get(pk=pk)
            #     if not obj.expired:
            CustomUser.objects.create_user(
                username=request_data['username'],
                email=request_data['email'],
                password=request_data['password1'],
                first_name="",
                last_name="",
                role="",
                # role=obj.role,
                is_active=True,
            )
            # obj.expired = True
            # obj.save()
            return JsonResponse({'success': 'success'}, status=status.HTTP_201_CREATED)
            # return JsonResponse({'error': 'error', 'content': 'Invalid link'}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            print (e, type(e))
            return JsonResponse({'error': 'error', 'content': e}, status=status.HTTP_409_CONFLICT)
    return JsonResponse({'error': 'false'}, status=status.HTTP_409_CONFLICT)

@csrf_exempt 
def auth_view(request):
    if request.method == "POST":
        request_data = JSONParser().parse(request)
        username = request_data['username']
        password = request_data['password']
        user = authenticate(request, username=username, password=password)
        print(username, password)
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

@csrf_exempt 
def password_reset_view(request):
    request_data = JSONParser().parse(request)
    print(request_data)
    email = request_data['email']
    url = request_data['url']
    user = CustomUser.objects.get(email=email)
    token_generator = default_token_generator
    temp_key = token_generator.make_token(user)
    uidb64 = uid_encoder(force_bytes(user.pk))
    url= url + '/password-reset-confirm' + '/' + uidb64 + "/" + temp_key
    send_email(url, email)
    return JsonResponse({'success': True}, status=status.HTTP_201_CREATED)

@csrf_exempt 
def password_reset_confirm_view(request):
    request_data = JSONParser().parse(request)
    path = request_data['pathname']
    token = path.split('/')[-1]
    uuid = path.split('/')[-2]
    uid = force_text(uid_decoder(uuid))
    user = CustomUser.objects.get(pk=uid)
    
    try:
        if not default_token_generator.check_token(user, token):
            return JsonResponse({'success': False, 'content': 'token is invalid'}, status=status.HTTP_201_CREATED)

        if not request_data['password1'] == request_data['password2']:
            return JsonResponse({'success': False, 'content': 'password and confirm password does not match'}, status=status.HTTP_201_CREATED)
        
        user.set_password(request_data['password2'])
        user.save()
        return JsonResponse({'success': True, 'content': 'password reseted successfully'}, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print (e, type(e))
        return JsonResponse({'success': False, 'content': 'some errors'}, status=status.HTTP_201_CREATED)