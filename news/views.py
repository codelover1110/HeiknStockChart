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

from news import models as news
from strategy.utils import save_strategy, save_config, run_command
# Create your views here.

def BAD_REQUEST():
    return JsonResponse({"success": False, "message": "Invalid request!"}, safe=True)

@csrf_exempt
def recent_news(request):
    print (" ++++++ API: recent_news ++++++")

    try:
        recent_news = news.get_recent_news()
        return JsonResponse({"success": True, "result": recent_news}, safe=True)
    except:
        return JsonResponse({"success": False, "message": "Failed to get recent news!"}, safe=True)


@csrf_exempt
def symbol_news(request):
    print (" ++++++ API: symbol_news ++++++")
    if request.method == 'POST':
        req = JSONParser().parse(request)
        symbol = req['symbol']

        try:
            symbol_news = news.get_symbol_news(symbol)
            return JsonResponse({"success": True, "results": symbol_news}, safe=True)
        except:
            return JsonResponse({"success": False, "message": "Failed to get news!"}, safe=True)
    return BAD_REQUEST()