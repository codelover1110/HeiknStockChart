import sys
sys.path.append("..")
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser 
from financials import models as financials

def BAD_REQUEST():
    return JsonResponse({"success": False, "message": "Invalid request!"}, safe=True)

@csrf_exempt
def symbol_financials(request):
    print (" ++++++ API: symbol_financials ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        symbol = req['symbol']

        try:
            symbol_financials = financials.get_symbol_financials(symbol)
            return JsonResponse({"success": True, "result": symbol_financials}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get symbol financials!"}, safe=True)
    return BAD_REQUEST()


@csrf_exempt
def income_statement(request):
    print (" ++++++ API: income_statement ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        symbol = req['symbol']

        try:
            income_statement = financials.get_income_statement(symbol)
            return JsonResponse({"success": True, "results": income_statement}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get income statement!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def balance_sheet(request):
    print (" ++++++ API: balance_sheet ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        symbol = req['symbol']

        try:
            balance_sheet = financials.get_balance_sheet(symbol)
            return JsonResponse({"success": True, "results": balance_sheet}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get balance sheet!"}, safe=True)
    return BAD_REQUEST()


@csrf_exempt
def cash_statement(request):
    print (" ++++++ API: cash_statement ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        symbol = req['symbol']

        try:
            cash_statement = financials.get_cash_statement(symbol)
            return JsonResponse({"success": True, "results": cash_statement}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get cash statement!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def financial_total_data(request):
    print (" ++++++ API: financial_total_data ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        symbol = req['symbol']

        try:
            financial_total_data = financials.get_financial_total_data(symbol)
            return JsonResponse({"success": True, "results": financial_total_data}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get financial total data!"}, safe=True)
    return BAD_REQUEST()
