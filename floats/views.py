import sys
from django.shortcuts import render

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser 

from floats import collector

# Create your views here.

def BAD_REQUEST():
    return JsonResponse({"success": False, "message": "Invalid request!"}, safe=True)

@csrf_exempt
def float_details_list(request):
    print (" ++++++ API: float/float_views ++++++")
    try:
        result = collector.get_floats_data()
        return JsonResponse({"success": True, "results": result}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get stock financials fields!"}, safe=True)