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
from strategy.utils import save_strategy

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

@csrf_exempt
def save_script_file(request):
    print (" ++++++ API: save_script_file ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        file_name = req['file_name']
        content = req['content']

        try:
            save_strategy(file_name, content)
            return JsonResponse({"success": True, "message": "Saved successfully!"}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to save script file!"}, safe=True)
    return BAD_REQUEST()

#################### config operations ######################
@csrf_exempt
def config_list(request):
    print (" ++++++ API: config_list ++++++")
    try:
        configs = params.get_config_list()
        return JsonResponse({"success": True, "result": configs}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get config list!"}, safe=True)

@csrf_exempt
def config_details(request):
    print (" ++++++ API: config_details ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        config_collection = req['config_collection']

        try:
            config_details = params.get_config_details(config_collection)
            return JsonResponse({"success": True, "result": config_details}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get {config_collection} config details!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def config_detail_names(request):
    print (" ++++++ API: config_details ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        config_collection = req['config_collection']

        try:
            config_details = params.get_config_details(config_collection)
            result = []
            for detail in config_details:
                result.append(detail['name'])
            return JsonResponse({"success": True, "result": result}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get {config_collection} config details!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def config_item_detail(request):
    print (" ++++++ API: config_item_detail ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        config_collection = req['config_collection']
        name = req['name']

        try:
            config_detail = params.get_config_item_detail(config_collection, name)
            return JsonResponse({"success": True, "result": config_detail}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get {config_collection}-{name} config details!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def create_one_config_detail(request):
    print (" ++++++ API: create_one_config_detail ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        config_collection = req['config_collection']
        config = req['config']
        try:
            if config['name'] != "":
                params.create_configs_one(config_collection, config)
                return JsonResponse({"success": True, "message": "The config is saved!"}, safe=True)
            else: 
                return JsonResponse({"success": False, "message": "Name is required to save!"}, safe=True)    
        except:
            return JsonResponse({"success": False, "message": "Failed to save config details!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def delete_configs(request):
    print (" ++++++ API: delete_configs ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        delete_config_list = req['delete_config_list']
        try:
            params.delete_configs(delete_config_list)
            return JsonResponse({"success": True, "message": "The configs are deleted!"}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to delete configs!"}, safe=True)
    return BAD_REQUEST()


@csrf_exempt
def delete_config_details(request):
    print (" ++++++ API: delete_config_details ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        config_collection = req['config_collection']
        delete_config_items = req['delete_config_items']
        try:
            params.delete_config_items(config_collection, delete_config_items)
            return JsonResponse({"success": True, "message": "The config details are deleted!"}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to delete config details!"}, safe=True)
    return BAD_REQUEST()

