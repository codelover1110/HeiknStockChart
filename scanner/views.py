import sys
sys.path.append("..")
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser 
from scanner import models as scanner

def BAD_REQUEST():
    return JsonResponse({"success": False, "message": "Invalid request!"}, safe=True)

@csrf_exempt
def stock_financials_fields(request):
    print (" ++++++ API: scanner/stock_financials_fields ++++++")
    try:
        stock_financials_fields = scanner.get_stock_financials_fields()
        result = {'snapshots': '', 'others': stock_financials_fields}
        return JsonResponse({"success": True, "results": result, "defaults": result["others"][:2]}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get stock financials fields!"}, safe=True)

@csrf_exempt
def indicators_fields(request):
    print (" ++++++ API: scanner/indicators_fields ++++++")
    try:
        indicators_fields = scanner.get_indicators_fields()
        result = {'snapshots': indicators_fields}
        return JsonResponse({"success": True, "results": result, "defaults": result["snapshots"][:2]}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get indicators fields!"}, safe=True)


@csrf_exempt
def ticker_news_fields(request):
    print (" ++++++ API: scanner/ticker_news_fields ++++++")
    try:
        ticker_news_fields = scanner.get_ticker_news_fields()
        return JsonResponse({"success": True, "results": ticker_news_fields, "defaults": ticker_news_fields[:2]}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get ticker news fields!"}, safe=True)


@csrf_exempt
def ticker_details_fields(request):
    print (" ++++++ API: scanner/ticker_details_fields ++++++")
    try:
        ticker_details_fields = scanner.get_ticker_details_fields()
        return JsonResponse({"success": True, "results": ticker_details_fields, "defaults": ticker_details_fields[:2]}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get ticker details!"}, safe=True)


@csrf_exempt
def available_items(request):
    print (" ++++++ API: /scanner/available_items ++++++")
    try:
        available_items = scanner.get_available_items()
        return JsonResponse({"success": True, "result": available_items}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get available items for scanner!"}, safe=True)


# @csrf_exempt
# def available_items(request):
#     print (" ++++++ API: scanner/available_items ++++++")
#     if request.method == 'POST':
#         req = JSONParser().parse(request)
#         symbol = req['symbol']

#         try:
#             financial_total_data = scanner.get_available_items(symbol)
#             return JsonResponse({"success": True, "results": financial_total_data}, safe=True)
#         except:
#             return JsonResponse({"success": False, "message": "Failed to get financial total data!"}, safe=True)
#     return BAD_REQUEST()
