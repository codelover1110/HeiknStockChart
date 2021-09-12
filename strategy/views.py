from json.decoder import JSONDecodeError
from django.shortcuts import render
import sys
sys.path.append("..")

from django.shortcuts import render
from rest_framework import generics, views

from django.http import JsonResponse, HttpResponse
from django.core import serializers

from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser 

from strategy import models as params

def BAD_REQUEST():
    return JsonResponse({"success": False, "message": "Invalid request!"}, safe=True)

@csrf_exempt
def parameter_list(request):
    print (" ++++++ API: parmeter_list ++++++")
    try:
        parameters = params.get_parameter_list()
        return JsonResponse({"success": True, "result": parameters}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get parameter list!"}, safe=True)

@csrf_exempt
def parameter_item_names(request):
    print (" ++++++ API: parameter_item_names ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        param_type = req['param_type']

        try:
            param_item_names = params.get_parameter_item_names(param_type)
            return JsonResponse({"success": True, "result": param_item_names}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get parameter names!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def parameter_detail_list(request):
    print (" ++++++ API: parameter_detail_list ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        param_type = req['param_type']

        try:
            param_item_details = params.get_parameter_detail_list(param_type)
            return JsonResponse({"success": True, "result": param_item_details}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get parameter details!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def parameter_content(request):
    print (" ++++++ API: parameter_content ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        param_type = req['param_type']
        param_item_name = req['param_item_name']

        try:
            param_content = params.get_parameter_content(param_type, param_item_name)
            return JsonResponse({"success": True, "result": param_content}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get parameter content!"}, safe=True)
    return BAD_REQUEST()