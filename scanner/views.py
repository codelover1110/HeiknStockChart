import sys

# from numpy.lib import financial
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
        print(available_items)
        return JsonResponse({"success": True, "result": available_items}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get available items for scanner!"}, safe=True)

@csrf_exempt
def multi_financials(request):
    print (" ++++++ API: scanner/multi_financials ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        try:
            symbols = req['symbols']
            financial_part = req['financial_part']
        except:
            print ("request: ", req)

        try:
            multi_symbol_fynancials = scanner.get_multi_financials(symbols, financial_part)
            return JsonResponse({"success": True, "results": multi_symbol_fynancials}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get multi symbol fynancials!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def save_scanner_views(request):
    print (" ++++++ API: scanner/save_scanner_views ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        try:
            scanner.save_scanner_views1(req)
            return JsonResponse({"success": True, "message": "Scanner view saved!"}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to save scanner view!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def save_all_views(request):
    print (" ++++++ API: scanner/save_all_views ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        try:
            scanner.save_all_scanner_views(req)
            return JsonResponse({"success": True, "message": "All scanner view saved!"}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to save all scanner view!"}, safe=True)
    return BAD_REQUEST()


@csrf_exempt
def scanner_views(request):
    print (" ++++++ API: /scanner/scanner_views ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        chart_number = req['chart_number']

        try:
            scanner_views = scanner.get_scanner_views(chart_number)
            return JsonResponse({"success": True, "result": scanner_views}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get scanner views!"}, safe=True)

@csrf_exempt
def load_all_views(request):
    print (" ++++++ API: /scanner/load_all_views ++++++")
    try:
        all_scanner_views = scanner.get_all_scanner_views()
        return JsonResponse({"success": True, "result": all_scanner_views}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get all scanner views!"}, safe=True)

@csrf_exempt
def watchlists(request):
    print (" ++++++ API: scanner/watchlists ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        name = req['name']
        try:
            watchlists = scanner.get_watchlist(name)
            return JsonResponse({"success": True, "result": watchlists}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get watchlists!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def watchlists_all(request):
    print (" ++++++ API: /scanner/watchlists_all ++++++")
    try:
        watch_list_all = scanner.get_watchlist_all()
        return JsonResponse({"success": True, "result": watch_list_all}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get all watchlists!"}, safe=True)


@csrf_exempt
def view_values(request):
    print (" ++++++ API: scanner/view_values ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        symbol = req['symbol']
        financial_fields = req['financial_fields']
        detail_fields = req['detail_fields']

        try:
            financial_values = scanner.get_financial_fields_values(symbol, financial_fields)
            detail_values = scanner.get_indicators_fields(symbol, detail_fields)
            result = dict()
            result['financial_values'] = financial_values
            result['detail_vaules'] = detail_values
            return JsonResponse({"success": True, "result": result}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get scanner view values!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def ticker_details_list(request):
    print (" ++++++ API: scanner/ticker_details_list ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        exchange = req['exchange']
        industry = req['industry']
        sector = req['sector']
        page_num = req['page_num']
        page_mounts = req['page_mounts']
        # try:
        tickerlist, page_total = scanner.get_ticker_details_list(exchange, industry, sector, page_num, page_mounts)
        return JsonResponse({"success": True, "result": tickerlist, "page_total": page_total}, safe=True)
        # except:
        #     return JsonResponse({"success": False, "message": "Failed to get watchlists!"}, safe=True)
    return BAD_REQUEST()

@csrf_exempt
def ticker_details_filter_options(request):
    try:
        filter_options = scanner.get_ticker_details_filter_options()
        return JsonResponse({"success": True, "result": filter_options}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get ticker filter options!"}, safe=True)
    return BAD_REQUEST()
