from django.shortcuts import render

from django.http.response import JsonResponse
from rest_framework.parsers import JSONParser 
from rest_framework import status
from rest_framework.decorators import api_view
from datetime import datetime
import os
from django.views.decorators.csrf import csrf_exempt
from configparser import ConfigParser

import pymongo
from datetime import datetime
import pandas as pd 
import os
import requests
import time
import io
import csv

mongoclient = pymongo.MongoClient("mongodb://localhost:27017")


# Create your views here.
# @api_view(['GET', 'PUT', 'DELETE'])
def get_table_list(request):
    masterdb = mongoclient["2m_stocks"]
    ob_table = masterdb['stock_list']
    tables_name = []
    for x in ob_table.find():
        tables_name.append(x['stock_name'])
    return JsonResponse({'tables': tables_name}, status=status.HTTP_201_CREATED)

@csrf_exempt 
def get_data(request):
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        db_name = request_data['db_name']
        masterdb = mongoclient[db_name]
        table_name = request_data['table_name']
        ob_table = masterdb[table_name]
        tables_name = []
        for x in ob_table.find():
            tables_name.append({
                'absoluteChange': "",
                'close': x['c'],
                'date': x['date'],
                'dividend': "",
                'high': x['h'],
                'low': x['l'],
                'macd': {'macd': None, 'signal': None, 'divergence': None},
                'open': x['o'],
                'percentChange': "",
                'split': "",
                'volume': ""
            })
        # tables_name.append({
        #     'columns': ["date", "open", "high", "low", "close", "volume", "split", "dividend", "absoluteChange", "percentChange"]
        # })
    return JsonResponse({'chart_data': tables_name}, status=status.HTTP_201_CREATED)

def index(request):
    return render(request, "build/index.html")

    
    
