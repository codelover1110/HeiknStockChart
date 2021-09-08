from django.shortcuts import render
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from rest_framework.parsers import JSONParser 
from rest_framework import status

import pymongo
from datetime import datetime, timedelta
from ib_insync import *
import numpy as np
import pandas as pd
pd.options.mode.chained_assignment = None  # default='warn'

from .models import (
            get_strategies_names, 
            get_stock_candles_for_strategy,  
            get_micro_strategies, 
            get_macro_strategies, 
            get_strategy_symbols, 
            get_backtesting_data_db, 
            get_symbol_candles,
            put_script_file,
            update_strartegy_file,
            get_strategy_file,
            get_strategy_list)

from .common import (
            get_chat_data_from_candles, 
            get_chat_data_rsi_heik_v1,
            join_append, 
            calc_percentEfficiency, 
            calc_winningLosing, 
            fill_missing_candles__)

# mongoclient = pymongo.MongoClient("mongodb://localhost:27017")
mongoclient = pymongo.MongoClient("mongodb://hunter:STOCKdb123@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority")
# mongoclient = pymongo.MongoClient("mongodb://hunter:STOCKdb123@cluster0-shard-00-00.agmoz.mongodb.net:27017,cluster0-shard-00-01.agmoz.mongodb.net:27017,cluster0-shard-00-02.agmoz.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-f8c9fs-shard-0&authSource=admin&retryWrites=true&w=majority")


@csrf_exempt    
def get_backtesting_data(request):
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        table_name = request_data['table_name']
        symbols = request_data['symbols']
        if True:
            start_date = request_data['start_date']
            end_date = request_data['end_date']
            list_db_data = get_backtesting_data_db(table_name, start_date, end_date)
        else:
            masterdb = mongoclient["backtesting_trades"]
            db_collection = masterdb[table_name]
            list_db_data = list(db_collection.find().sort('date', pymongo.ASCENDING))
        
        wL = calc_winningLosing(symbols, list_db_data)
        pE_wLA_lS = calc_percentEfficiency(symbols, list_db_data)
        bastestData = {
            'percentEfficiency': pE_wLA_lS['pE'],
            'winningLosing': wL,
            "winningLosingAvg": pE_wLA_lS['wLA'],
            "longShort": pE_wLA_lS['lS']
        }

    return JsonResponse({'chart_data': bastestData}, status=status.HTTP_201_CREATED)


@csrf_exempt 
def get_table_list(request):
    request_data = JSONParser().parse(request)
    strategy_name = request_data['strategy']
    masterdb = mongoclient["backtest_tables"]
    if strategy_name != 'no_strategy':
        ob_table = masterdb['trade_list']
    else:
        ob_table = masterdb['stock_list']
    tables_name = []
    for x in ob_table.find():
        tables_name.append(x['stock_name'])
    return JsonResponse({'tables': tables_name}, status=status.HTTP_201_CREATED)


@csrf_exempt 
def get_data_trades(request):
    if request.method == 'POST':        
        request_data = JSONParser().parse(request)
        if not 'symbol' in request_data:
            symbol = ''
        else:
            symbol = request_data['symbol']
        macroStrategy = request_data['macroStrategy']
        microStrategy = request_data['microStrategy']
        masterdb = mongoclient["backtesting_trades"]
        db_collection = masterdb['all_trades']
        query_obj = {}
        if symbol != '':
            query_obj['symbol'] = {"$regex": "^"+symbol.upper()}
        if macroStrategy != '':
            query_obj['strategy_name'] = {"$regex": "^"+macroStrategy.lower()}
        if microStrategy != '':
            query_obj['strategy_name'] = {"$regex": microStrategy.lower()}
        if macroStrategy != '' and microStrategy != '':
            query_obj['strategy_name'] = {"$regex": macroStrategy.lower() + '-' + microStrategy.lower()}
        
        startDate = datetime.strptime(request_data['tradeStartDate'], '%Y-%m-%d')
        endDate = datetime.strptime(request_data['tradeEndDate'], '%Y-%m-%d')
        query_obj['date'] = {"$gte": startDate, "$lt": endDate}

        trades_data = list(db_collection.find(query_obj, {'_id': False}).sort('date', pymongo.ASCENDING))
        return JsonResponse({'trades_data': trades_data}, status=status.HTTP_201_CREATED)


@csrf_exempt
def get_table_candles(request):
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        symbol = request_data['symbol']
        start_date = request_data['start']
        end_date = request_data['end']
        time_frame = request_data['time_frame']

        candles = get_symbol_candles(symbol, start_date, end_date, time_frame)
        return JsonResponse({"candles": candles}, status=status.HTTP_201_CREATED)

@csrf_exempt
def get_strategies(request):
    strategies = get_strategies_names()
    return JsonResponse(strategies, status=status.HTTP_201_CREATED)


@csrf_exempt
def get_strategies_list(request):
    strategies = []
    macro_strtg = get_macro_strategies()
    for macro in macro_strtg:
        item = dict()
        item['macro'] = macro
        item['micro'] = get_micro_strategies(macro)
        item['symbols'] = get_strategy_symbols(macro)
        strategies.append(item)
    return JsonResponse({"result": strategies}, status=status.HTTP_201_CREATED)    


@csrf_exempt
def get_micros(request):
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        strategies = get_micro_strategies(request_data['macro'])
        return JsonResponse({"micros": strategies}, status=status.HTTP_201_CREATED)


@csrf_exempt
def get_macros(request):
    strategies = get_macro_strategies()
    return JsonResponse({"macros": strategies}, status=status.HTTP_201_CREATED)


@csrf_exempt
def get_stock_strategy_candles(request):
    request_data = JSONParser().parse(request)
    db_name = request_data['db_name']
    symbol = request_data['symbol']
    macro = request_data['macro']
    micro = request_data['micro']
    strategy = '{}-{}-trades'.format(macro, micro)
    candles, strategy_trades = get_stock_candles_for_strategy(db_name, symbol, macro, micro)
    chat_candles = get_chat_data_from_candles(candles)
    verdict = join_append(chat_candles, strategy_trades, strategy)
    verdict = fill_missing_candles__(verdict, db_name, strategy)
    
    return JsonResponse({'chart_data': verdict}, status=status.HTTP_201_CREATED)


@csrf_exempt
def get_live_data(request):
    request_data = JSONParser().parse(request)
    db_name = request_data['db_name']
    symbol = request_data['symbol']
    macro = request_data['macro']
    micro = request_data['micro']
    strategy = '{}-{}-trades'.format(macro, micro)
    candles, strategy_trades = get_stock_candles_for_strategy(db_name, symbol, macro, micro)
    chat_candles = get_chat_data_rsi_heik_v1(candles)
    verdict = join_append(chat_candles, strategy_trades, strategy)
    verdict = fill_missing_candles__(verdict, db_name, strategy)
    
    return JsonResponse({'chart_data': verdict}, status=status.HTTP_201_CREATED)


# strategy management api
@csrf_exempt
def get_script_file(request):
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        file_name = request_data['filename']
        strtg = get_strategy_file(file_name)
        return JsonResponse({'file_content': strtg}, status=status.HTTP_201_CREATED)

@csrf_exempt
def create_script_file(request):
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        file_name = request_data['filename']
        content = request_data['content']
        if put_script_file(file_name, content):
            return JsonResponse({'success': True, "message": "new strategy file is created"}, status=status.HTTP_201_CREATED)
        else:
            return JsonResponse({'success': False, "message": "file name already exist"}, status=status.HTTP_201_CREATED)

@csrf_exempt
def update_script_file(request):
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        file_name = request_data['filename']
        content = request_data['content']
        if update_strartegy_file(file_name, content):
            return JsonResponse({'success': True, "message": "strategy file is updated"}, status=status.HTTP_201_CREATED)
        else:
            return JsonResponse({'success': False, "message": "update failed"}, status=status.HTTP_201_CREATED)


@csrf_exempt
def get_script_list(request):
    strategies = get_strategy_list()
    return JsonResponse({'strategy_files': strategies}, status=status.HTTP_201_CREATED)


def index(request):
    return render(request, "build/index.html")