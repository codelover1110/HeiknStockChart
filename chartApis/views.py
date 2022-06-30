from io import StringIO

from django.shortcuts import render
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from django.http import HttpResponse
from wsgiref.util import FileWrapper

from rest_framework.parsers import JSONParser
from rest_framework import status

from backup.models import BackupProgress
from django.core import serializers


from ib_insync import *
import numpy as np
import pandas as pd

import datetime

import requests

from types import SimpleNamespace
import json

from chartApis.models import api_get_trade_histories



pd.options.mode.chained_assignment = None  # default='warn'

from .utils import get_symbol_exchange

from .models import (
            get_stock_candles_for_strategy_new_chart_api,
            get_stock_candles_for_strategy_all,
            get_stock_candles_for_strategy_all_test,
            get_micro_strategies,
            get_macro_strategies,
            get_strategy_symbols,
            get_micro_strategy_symbols,
            get_indicator_list,
            get_backtesting_symbols,
            get_backtesting_result,
            get_data_trades_db,
            get_symbol_candles,
            put_script_file,
            update_strartegy_file,
            get_table_list_db,
            get_strategy_file,
            get_strategy_list,
            api_get_databases,
            api_get_collections,
            api_delete_database,
            api_delete_collection,
            # api_export_database,
            # api_export_collection,
            api_create_backup,
            api_execute_backup,
            api_get_indicator_signalling_list,
            get_data_chadAPI
            )

from .common import (
            get_chat_data_rsi_heik_v11,
            get_chat_data_rsi_heik_v11_test,
            join_append,
            calc_percentEfficiency,
            calc_percentEfficiency_api,
            calc_winningLosing,
            calc_winningLosing_api,
            fill_missing_candles__,
            get_db_name)

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
        # wL = calc_winningLosing(symbols, list_db_data)
        wL = calc_winningLosing_api(symbols, list_db_data)
        # pE_wLA_lS = calc_percentEfficiency(symbols, list_db_data)
        pE_wLA_lS = calc_percentEfficiency_api(symbols, list_db_data)
        if len(symbols) > 0:
            exchange = get_symbol_exchange(symbols[0])
        else:
            exchange = ""

        pE = pE_wLA_lS['pE']
        newPE = []

        for pE_record in pE:
            newPE_record = {}
            for symbol in pE_record:
                symbol_data = pE_record[symbol]

                if detect_individual_trade(symbol_data):
                    newPE_symbol_data = []
                    for symbol_record in symbol_data:
                        symbol_record['date'] = symbol_record['date'].strftime("%Y-%m-%d %H:%M:%S")
                        newPE_symbol_data.append(symbol_record)
                else:
                    group_counters = {}
                    group_dates = {}
                    group_percents = {}
                    group_entries = {}
                    group_exits = {}
                    group_efficiencies = {}
                    for symbol_record in symbol_data:
                        transaction_date = symbol_record['date'].strftime("%Y_%m_%d")
                        group_key = symbol + transaction_date

                        if not group_key in group_counters:
                            group_counters[group_key] = 0
                            group_percents[group_key] = 0
                            group_efficiencies[group_key] = 0

                        group_counters[group_key] += 1
                        group_dates[group_key] = symbol_record['date'].strftime("%Y-%m-%d")
                        group_percents[group_key] += symbol_record['percent']
                        group_entries[group_key] = symbol_record['entry']
                        group_exits[group_key] = symbol_record['exit']
                        group_efficiencies[group_key] += symbol_record['efficiency']


                    # group all times in a day
                    newPE_symbol_data = []
                    for group_key in group_counters:
                        newPE_symbol_record = {}
                        newPE_symbol_record['date'] = group_dates[group_key]
                        newPE_symbol_record['percent'] = round(group_percents[group_key] / group_counters[group_key], 5)
                        newPE_symbol_record['entry'] = group_entries[group_key]
                        newPE_symbol_record['exit'] = group_exits[group_key]
                        newPE_symbol_record['efficiency'] = round(group_efficiencies[group_key] / group_counters[group_key], 5)
                        newPE_symbol_data.append(newPE_symbol_record)


                newPE_record[symbol] = newPE_symbol_data

            newPE.append(newPE_record)

        bastestData = {
            'totalPercentGainLost': calculate_total_gain_lost(newPE),
            'percentEfficiency': newPE,
            'winningLosing': wL,
            "winningLosingAvg": pE_wLA_lS['wLA'],
            "longShort": pE_wLA_lS['lS'],
            "totWinLose": pE_wLA_lS['totWL'],
            "exchange": exchange
        }

        return JsonResponse({'chart_data': bastestData}, status=status.HTTP_201_CREATED)

def calculate_total_gain_lost(data_array):
    new_data_array = []
    group_total_by_date = {}
    for record in data_array:
        symbol_data = list(record.values())[0]

        for symbol_record in symbol_data:
            # symbol_record = {'date': '2021-10-22', 'percent': -0.656, 'entry': 'buy', 'exit': 'sell', 'efficiency': -0.656}
            transaction_date = symbol_record['date']

            if not transaction_date in group_total_by_date:
                group_total_by_date[transaction_date] = {'date': transaction_date, 'percent': 0, 'entry': 'buy', 'exit': 'sell', 'efficiency': 0}

            group_total_by_date[transaction_date]['efficiency'] += symbol_record['efficiency']
            group_total_by_date[transaction_date]['percent'] += symbol_record['percent']

    sorted_group_total_by_date = []
    sorted_keys = sorted(group_total_by_date)
    for key in sorted_keys:
        sorted_group_total_by_date.append(group_total_by_date[key])

    new_data_array = [
        # {'Total Percent Gain/Lost': list(group_total_by_date.values())}
        {'Total Percent Gain/Lost': sorted_group_total_by_date}
    ]
    return new_data_array

def detect_individual_trade(symbol_data):
    transaction_date_list = {}
    for symbol_record in symbol_data:
        if type(symbol_record['date']) == str:
            transaction_date = symbol_record['date'][9].replace('-', '_')
        else:
            transaction_date = symbol_record['date'].strftime("%Y_%m_%d")
        transaction_date_list[transaction_date] = transaction_date

    return len(transaction_date_list) < 2

@csrf_exempt
def get_table_list(request):
    print (" ++++++ API: get_table_list ++++++")
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        strategy_name = request_data['strategy']
        tables_name = get_table_list_db(strategy_name)
        return JsonResponse({'tables': tables_name}, status=status.HTTP_201_CREATED)

@csrf_exempt
def get_sym_list(request):
    print (" ++++++ API: get_sym_list ++++++")
    if request.method == 'POST':
        my_file = open("chartApis/master.txt", "r")
        data = my_file.read()
        data_into_list = data.split("\n")
        my_file.close()
        return JsonResponse({'tables': data_into_list[:1000]}, status=status.HTTP_201_CREATED)

@csrf_exempt
def get_data_trades(request):
    print (" ++++++ API: get_data_trades ++++++")
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        if not 'symbol' in request_data:
            symbol = ''
        else:
            symbol = request_data['symbol']
        page_num = request_data['page_num']
        page_mounts = request_data['page_mounts']
        macroStrategy = request_data['macroStrategy']
        microStrategy = request_data['microStrategy']
        trades_data, page_total = get_data_trades_db(request_data['tradeStartDate'], request_data['tradeEndDate'], macroStrategy, microStrategy, symbol, page_num, page_mounts)
        return JsonResponse({'trades_data': trades_data, "page_total": page_total}, status=status.HTTP_201_CREATED)


@csrf_exempt
def get_table_candles(request):
    print (" ++++++ API: get_table_candles ++++++")
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        symbol = request_data['symbol']
        start_date = request_data['start']
        end_date = request_data['end']
        time_frame = request_data['time_frame']

        try:
            page_num = request_data['page_num']
            page_mounts = request_data['page_mounts']
            candles, page_total = get_symbol_candles(symbol, start_date, end_date, time_frame, page_num, page_mounts)
        except:
            candles, page_total = get_symbol_candles(symbol, start_date, end_date, time_frame)
        return JsonResponse({"candles": candles, "page_total": page_total}, status=status.HTTP_201_CREATED)

@csrf_exempt
def get_table_candles_chadAPI(request):
    print (" ++++++ API: get_table_candles ++++++")
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        symbol = request_data['symbol']
        start_date = request_data['start']
        end_date = request_data['end']
        time_frame = request_data['time_frame']
        candles = get_data_chadAPI(symbol, 'raw-bars', time_frame, 1000, True, True)
        results = candles["values"]
        results.reverse()
        return JsonResponse({"candles": results}, status=status.HTTP_201_CREATED)

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
def micro_strategy_symbols(request):
    print (" ++++++ API: micro_strategy_symbols ++++++")
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        macro = request_data['macro']
        micro = request_data['micro']
        micro_symbols = get_micro_strategy_symbols(macro, micro)
        result = []
        for symbol in micro_symbols:
            result.append(symbol)
        return JsonResponse({"result": result}, status=status.HTTP_201_CREATED)

@csrf_exempt
def indicator_list(request):
    print (" ++++++ API: indicator_list ++++++")
    indicator_list = get_indicator_list()
    return JsonResponse({"result": indicator_list}, status=status.HTTP_201_CREATED)

@csrf_exempt
def get_indicator_signalling_list(request):
    print (" ++++++ API: get_indicator_signalling_list ++++++")
    indicator_list = api_get_indicator_signalling_list()
    return JsonResponse({"result": indicator_list}, status=status.HTTP_201_CREATED)


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
    if not chat_candles is None:
        verdict = join_append(chat_candles, strategy_trades, strategy)
    verdict = fill_missing_candles__(verdict, db_name, macro, micro)
    exchange = get_symbol_exchange(symbol)

    return JsonResponse({'chart_data': verdict, 'exchange': exchange}, status=status.HTTP_201_CREATED)

@csrf_exempt
def get_live_data_test(request):
    print (" ++++++ API: get_live_data test ++++++")
    request_data = JSONParser().parse(request)
    db_name = request_data['db_name']
    symbol = request_data['symbol']
    macro = request_data['macro']
    micro = request_data['micro']
    strategy = '{}-{}-trades'.format(macro, micro)
    chat_candles, strategy_trades = get_stock_candles_for_strategy_all_test(db_name, symbol, macro, micro)
    if not chat_candles is None:
        verdict = join_append(chat_candles, strategy_trades, strategy)

    verdict = fill_missing_candles__(verdict, db_name, macro, micro)
    exchange = get_symbol_exchange(symbol)

    return JsonResponse({'chart_data': verdict, 'exchange': exchange}, status=status.HTTP_201_CREATED)

@csrf_exempt
def get_live_data_slice(request):
    print (" ++++++ API: get_live_data_slice ++++++")
    request_data = JSONParser().parse(request)
    db_name = request_data['db_name']
    symbol = request_data['symbol']
    macro = request_data['macro']
    micro = request_data['micro']
    strategy = '{}-{}-trades'.format(macro, micro)
    # candles, strategy_trades = get_stock_candles_for_strategy_all(db_name, symbol, macro, micro)
    # chat_candles = get_chat_data_rsi_heik_v11(candles)
    chat_candles, strategy_trades = get_stock_candles_for_strategy_all_test(db_name, symbol, macro, micro)
    verdict = join_append(chat_candles, strategy_trades, strategy)
    verdict = fill_missing_candles__(verdict, db_name, macro, micro)
    exchange = get_symbol_exchange(symbol)

    return JsonResponse({'chart_data': verdict[-25:], 'exchange': exchange}, status=status.HTTP_201_CREATED)

@csrf_exempt
def get_live_data_extended(request):
    print (" ++++++ API: get_live_data_extended ++++++")
    request_data = JSONParser().parse(request)
    db_name = request_data['db_name']
    symbol = request_data['symbol']
    macro = request_data['macro']
    micro = request_data['micro']
    strategy = '{}-{}-trades'.format(macro, micro)
    # candles, strategy_trades = get_stock_candles_for_strategy_all(db_name, symbol, macro, micro, extended=True)
    # # chat_candles = get_chat_data_from_candles(candles)
    # chat_candles = get_chat_data_rsi_heik_v11(candles)
    chat_candles, strategy_trades = get_stock_candles_for_strategy_all_test(db_name, symbol, macro, micro)
    verdict = join_append(chat_candles, strategy_trades, strategy)
    verdict = fill_missing_candles__(verdict, db_name, macro, micro)
    exchange = get_symbol_exchange(symbol)

    return JsonResponse({'chart_data': verdict, 'exchange': exchange}, status=status.HTTP_201_CREATED)

@csrf_exempt
def get_live_data_extended_slice(request):
    print (" ++++++ API: get_live_data_extended_slice ++++++")
    request_data = JSONParser().parse(request)
    db_name = request_data['db_name']
    symbol = request_data['symbol']
    macro = request_data['macro']
    micro = request_data['micro']
    strategy = '{}-{}-trades'.format(macro, micro)
    # candles, strategy_trades = get_stock_candles_for_strategy_all(db_name, symbol, macro, micro, extended=True)
    # chat_candles = get_chat_data_rsi_heik_v11(candles)
    chat_candles, strategy_trades = get_stock_candles_for_strategy_all_test(db_name, symbol, macro, micro)
    verdict = join_append(chat_candles, strategy_trades, strategy)
    verdict = fill_missing_candles__(verdict, db_name, macro, micro)
    exchange = get_symbol_exchange(symbol)

    return JsonResponse({'chart_data': verdict[-25:], 'exchange': exchange}, status=status.HTTP_201_CREATED)

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


@csrf_exempt
def get_databases(request):
    print(" ++++++ API: get_database_names ++++++")
    databases = api_get_databases()
    return JsonResponse({'success': True, 'data': databases}, status=status.HTTP_201_CREATED)


@csrf_exempt
def get_collections(request):
    print(" ++++++ API: api_get_collections ++++++")
    db_name = request.GET['db_name']
    collections = api_get_collections(db_name)
    return JsonResponse({'success': True, 'data': collections}, status=status.HTTP_201_CREATED)


@csrf_exempt
def delete_database(request):
    print(" ++++++ API: api_delete_database ++++++")
    db_name = request.GET['db_name']
    result = api_delete_database(db_name)
    return JsonResponse({'success': True, 'data': result}, status=status.HTTP_201_CREATED)

@csrf_exempt
def delete_collection(request):
    print(" ++++++ API: api_delete_collection ++++++")
    db_name = request.GET['db_name']
    collection_name = request.GET['collection_name']
    result = api_delete_collection(db_name, collection_name)
    return JsonResponse({'success': True, 'data': result}, status=status.HTTP_201_CREATED)


# @csrf_exempt
# def export_database(request):
#     print(" ++++++ API: api_export_database ++++++")
#     db_name = request.GET['db_name']
#     result = api_export_database(db_name)


#     # filelike = StringIO("This is an example file-like object"*10)
#     response = HttpResponse(result, content_type='application/csv')
#     response['Content-Disposition'] = 'attachment; filename="%s"' % 'hoangxuanhao.csv'

#     return response

#     # return JsonResponse({'success': True, 'data': result}, status=status.HTTP_201_CREATED)


# @csrf_exempt
# def export_collection(request):
#     print(" ++++++ API: api_export_collection ++++++")
#     db_name = request.GET['db_name']
#     collection_name = request.GET['collection_name']
#     result = api_export_collection(db_name, collection_name)

#     # filelike = StringIO("This is an example file-like object"*10)
#     response = HttpResponse(result, content_type='application/csv')
#     response['Content-Disposition'] = 'attachment; filename="%s"' % 'hoangxuanhao.csv'

#     return response


@csrf_exempt
def create_backup(request):
    print(" ++++++ API: api_create_backup ++++++")
    db_name = request.GET['db_name']
    collection_name = ''
    if 'collection_name' in request.GET:
        collection_name = request.GET['collection_name']

    print(db_name, collection_name)
    backup = api_create_backup(db_name, collection_name)
    result = backup.json()

    return JsonResponse({'success': True, 'data': result}, status=status.HTTP_201_CREATED)


@csrf_exempt
def execute_backup(request):
    print(" ++++++ API: api_execute_backup ++++++")
    backup_id = request.GET['backup_id']

    backup = BackupProgress.objects.get(pk=backup_id)
    print(backup.json())

    counter = 0
    def check_stopping(collection, document):
        nonlocal counter, backup
        counter = counter + 1
        if counter % 100 == 0:
            refresh_backup = BackupProgress.objects.get(pk=backup_id)
            if refresh_backup.status == 'stop':
                return True
        return False
    try:
        fileData = api_execute_backup(backup, check_stopping)
    except:
        fileData = ' '
    if not fileData:
        backup.delete()
        return JsonResponse({'success': False, 'data': {}}, status=status.HTTP_201_CREATED)

    response = HttpResponse(fileData, content_type='application/csv')
    response['Content-Disposition'] = 'attachment; filename="%s"' % 'hoangxuanhao.csv'

    backup.delete()

    return response

@csrf_exempt
def stop_backup(request):
    print(" ++++++ API: api_execute_backup ++++++")
    backup_id = request.GET['backup_id']

    backup = BackupProgress.objects.get(pk=backup_id)
    backup.status = 'stop'
    backup.save()

    return JsonResponse({'success': True, 'data': backup.json()}, status=status.HTTP_201_CREATED)


def index(request):
    return render(request, "build/index.html")

@csrf_exempt
def get_new_chart_data(request):
    try:
        symbol = request.GET['symbol']
        timeframe = request.GET['timeframe']
        bars = request.GET['bars']
        close = request.GET['close']
        extended = request.GET['extended_hours']
        macro = request.GET['macro']
        micro = request.GET['micro']

        strategy = '{}-{}-trades'.format(macro, micro)
        db_name = get_db_name(timeframe)

        candles, strategy_trades  = get_stock_candles_for_strategy_new_chart_api(timeframe, bars, symbol, extended, close, macro, micro)
        if not candles is None:
            verdict = join_append(candles, strategy_trades, strategy)

        if len(verdict) <= 1:
            error_message = "Error gettting data from polygon: Couldn't retreive enough data from polygon"
            return JsonResponse({'success': False, 'error': error_message}, status=status.HTTP_201_CREATED)
        else:
            return JsonResponse({'success': True, 'data': verdict}, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(e)
        error_message = "Error gettting data from polygon: Couldn't retreive enough data from polygon"
        return JsonResponse({'success': False, 'error': error_message}, status=status.HTTP_201_CREATED)


@csrf_exempt
def get_new_chart_data_backup(request):
    symbol = request.GET['symbol']
    timeframe = request.GET['timeframe']
    bars = request.GET['bars']
    close = request.GET['close']
    extended_hours = request.GET['extended_hours']

    print('+++++++++++++++get_new_chart_data')
    print(f"http://40.67.136.227/raw-bars/?symbol={symbol}&timeframe={timeframe}&bars={bars}&close={close}&extended_hours={extended_hours}&asset_class=equities&key=Thohn9po1mai7ba")
    response = requests.get(f"http://40.67.136.227/raw-bars/?symbol={symbol}&timeframe={timeframe}&bars={bars}&close={close}&extended_hours={extended_hours}&asset_class=equities&key=Thohn9po1mai7ba")

    result = response.json()
    result = result['values']

    print('result', result)

    data = []
    for row in result:
        item = {
            'date': row[0],
            'open': row[1],
            'high': row[2],
            'low': row[3],
            'close': row[4],
            'volume': row[6],
            'trade_date': row[0],

        }


        item['rsi'] = {
          'bearPower': 7.719123464290127,
          'bullPower': 7.719123464290127,
          'side': "hold"
        }
        item['rsi2'] = {
          'bearPower': -1.418928447187744,
          'bullPower': -1.418928447187744,
          'color': "l_r"
        }
        item['rsi3'] = {
          'bearPower': -0.946470217385734,
          'bullPower': -0.946470217385734,
          'color': "d_r"
        }
        item['heik'] = {
          'bearPower': 0.017029435934588832,
          'bullPower': 0.017029435934588832,
          'color': "d_g"
        }
        item['heik2'] = {
          'bearPower': -0.004312769267923972,
          'bullPower': -0.004312769267923972,
          'color': "d_r"
        }


        # item['trade_data'] = api_get_trade_histories(symbol, item['date'])
        data.append(item)

    return JsonResponse({'success': True, 'data': data}, status=status.HTTP_201_CREATED)


@csrf_exempt
def get_trade_histories(request):
    symbol = request.GET['symbol']
    date = request.GET['date']
    data = api_get_trade_histories(symbol, date)

    return JsonResponse({'success': True, 'data': data}, status=status.HTTP_201_CREATED)