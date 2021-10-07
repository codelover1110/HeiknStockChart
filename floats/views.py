import sys
from django.shortcuts import render

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser 

from floats import models as floats_model

# Create your views here.

def BAD_REQUEST():
    return JsonResponse({"success": False, "message": "Invalid request!"}, safe=True)

@csrf_exempt
def float_details_list(request):
    if request.method == 'POST':
        req = JSONParser().parse(request)
        page_num = req['page_num']
        page_mounts = req['page_mounts']
        exchange = req['exchange']
        industry = req['industry']
        sector = req['sector']
    
    try:
        result = floats_model.get_floats_data(page_num, page_mounts, exchange, industry, sector)
        return JsonResponse({"success": True, "results": result}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get floats views fields!"}, safe=True)

@csrf_exempt
def float_details_filter_options(request):

    try:
        filter_options = floats_model.get_float_details_filter_options()
        return JsonResponse({"success": True, "result": filter_options}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get floats filter options!"}, safe=True)
    return BAD_REQUEST()
