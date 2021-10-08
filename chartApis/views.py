from django.shortcuts import render
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from rest_framework.parsers import JSONParser 
from rest_framework import status

from ib_insync import *
import numpy as np
import pandas as pd
pd.options.mode.chained_assignment = None  # default='warn'

from .models import (
            get_stock_candles_for_strategy_all,
            get_micro_strategies, 
            get_macro_strategies, 
            get_strategy_symbols, 
            get_backtesting_symbols, 
            get_backtesting_result,
            get_data_trades_db,
            get_symbol_candles,
            put_script_file,
            update_strartegy_file,
            get_table_list_db,
            get_strategy_file,
            get_strategy_list)

from .common import (
            get_chat_data_rsi_heik_v11,
            join_append, 
            calc_percentEfficiency, 
            calc_winningLosing, 
            fill_missing_candles__)

@csrf_exempt
def backtesting_symbols(request):
    print (" ++++++ API: backtesting_symbols ++++++")
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        macro = request_data['macro']
        micro = request_data['micro']
        start_date = request_data['start_date']
        end_date = request_data['end_date']
        symbols = get_backtesting_symbols(macro, micro, start_date, end_date)

        return JsonResponse({'strategy_symbols': symbols}, status=status.HTTP_201_CREATED)


@csrf_exempt    
def backtesting_result(request):
    print (" ++++++ API: backtesting_result ++++++")
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        macro = request_data['macro']
        micro = request_data['micro']
        start_date = request_data['start_date']
        end_date = request_data['end_date']
        symbols = request_data['symbols']
        list_db_data = get_backtesting_result(symbols, macro, micro, start_date, end_date)
        
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
    print (" ++++++ API: get_table_list ++++++")
    if request.method == 'POST':        
        request_data = JSONParser().parse(request)
        strategy_name = request_data['strategy']
        tables_name = get_table_list_db(strategy_name)
        return JsonResponse({'tables': tables_name}, status=status.HTTP_201_CREATED)

@csrf_exempt 
def get_data_trades(request):
    print (" ++++++ API: get_data_trades ++++++")
    if request.method == 'POST':        
        request_data = JSONParser().parse(request)
        if not 'symbol' in request_data:
            symbol = ''
        else:
            symbol = request_data['symbol']
        macroStrategy = request_data['macroStrategy']
        microStrategy = request_data['microStrategy']
        trades_data = get_data_trades_db(request_data['tradeStartDate'], request_data['tradeEndDate'], macroStrategy, microStrategy, symbol)
        return JsonResponse({'trades_data': trades_data}, status=status.HTTP_201_CREATED)


@csrf_exempt
def get_table_candles(request):
    print (" ++++++ API: get_table_candles ++++++")
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        symbol = request_data['symbol']
        start_date = request_data['start']
        end_date = request_data['end']
        time_frame = request_data['time_frame']

        candles = get_symbol_candles(symbol, start_date, end_date, time_frame)
        return JsonResponse({"candles": candles}, status=status.HTTP_201_CREATED)

@csrf_exempt
def get_strategies_list(request):
    print (" ++++++ API: get_strategies_list ++++++")
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
def get_live_data(request):
    print (" ++++++ API: get_live_data ++++++")
    request_data = JSONParser().parse(request)
    db_name = request_data['db_name']
    symbol = request_data['symbol']
    macro = request_data['macro']
    micro = request_data['micro']
    strategy = '{}-{}-trades'.format(macro, micro)
    # candles, strategy_trades = get_stock_candles_for_strategy(db_name, symbol, macro, micro)
    candles, strategy_trades = get_stock_candles_for_strategy_all(db_name, symbol, macro, micro)
    chat_candles = get_chat_data_rsi_heik_v11(candles)
    verdict = join_append(chat_candles, strategy_trades, strategy)
    verdict = fill_missing_candles__(verdict, db_name, macro, micro)
    
    return JsonResponse({'chart_data': verdict}, status=status.HTTP_201_CREATED)


@csrf_exempt
def get_live_data_extended(request):
    print (" ++++++ API: get_live_data_extended ++++++")
    request_data = JSONParser().parse(request)
    db_name = request_data['db_name']
    symbol = request_data['symbol']
    macro = request_data['macro']
    micro = request_data['micro']
    strategy = '{}-{}-trades'.format(macro, micro)
    candles, strategy_trades = get_stock_candles_for_strategy_all(db_name, symbol, macro, micro, extended=True)
    # chat_candles = get_chat_data_from_candles(candles)
    chat_candles = get_chat_data_rsi_heik_v11(candles)
    verdict = join_append(chat_candles, strategy_trades, strategy)
    verdict = fill_missing_candles__(verdict, db_name, macro, micro)
    
    return JsonResponse({'chart_data': verdict}, status=status.HTTP_201_CREATED)

# strategy management api
@csrf_exempt
def get_script_file(request):
    print (" ++++++ API: get_script_file ++++++")
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        file_name = request_data['filename']
        strtg = get_strategy_file(file_name)
        return JsonResponse({'file_content': strtg}, status=status.HTTP_201_CREATED)

@csrf_exempt
def create_script_file(request):
    print (" ++++++ API: create_script_file ++++++")
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
    print (" ++++++ API: update_script_file ++++++")
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
    print (" ++++++ API: get_script_list ++++++")
    strategies = get_strategy_list()
    return JsonResponse({'strategy_files': strategies}, status=status.HTTP_201_CREATED)


def index(request):
    return render(request, "build/index.html")