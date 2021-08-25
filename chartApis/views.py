from django.shortcuts import render

from django.http.response import JsonResponse
from numpy.core.arrayprint import printoptions
from numpy.core.fromnumeric import resize
from pymongo.message import update
from rest_framework.parsers import JSONParser 
from rest_framework import status
from rest_framework.decorators import api_view
from datetime import datetime, timedelta
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



import numpy as np
import pandas as pd
pd.options.mode.chained_assignment = None  # default='warn'
from datetime import datetime,date

from ib_insync import *
import numpy as np
import pandas as pd
pd.options.mode.chained_assignment = None  # default='warn'
from datetime import datetime,date
import matplotlib.pyplot as plt
from tksheet import Sheet
import tkinter as tk
from django.conf import settings
from .lib.heikfilter import HA, Filter

# mongoclient = pymongo.MongoClient("mongodb://localhost:27017")
mongoclient = pymongo.MongoClient("mongodb://hunter:STOCKdb123@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority")
# mongoclient = pymongo.MongoClient("mongodb://hunter:STOCKdb123@cluster0-shard-00-00.agmoz.mongodb.net:27017,cluster0-shard-00-01.agmoz.mongodb.net:27017,cluster0-shard-00-02.agmoz.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-f8c9fs-shard-0&authSource=admin&retryWrites=true&w=majority")



# Create your views here.
# @api_view(['GET', 'PUT', 'DELETE'])

def get_last_put_date():
    masterdb = mongoclient["backtest_tables"]
    ob_table = masterdb['last_date']
    last_date_doc = ob_table.find_one()
    if last_date_doc is not None:
        return last_date_doc['last_candle_date']

def get_view_data(ob_table, db_name):
    last_put_date = datetime.strptime(get_last_put_date(), '%Y-%m-%d')
    if db_name == 'backtest_12_minute':
        start = last_put_date - timedelta(days=20)
    elif db_name == 'backtest_2_minute':
        start = last_put_date - timedelta(days=20)
    elif db_name == 'backtest_1_hour':
        start = last_put_date - timedelta(days=30)
    elif db_name == 'backtest_4_hour':
        start = last_put_date - timedelta(days=90)
    elif db_name == 'backtest_12_hour':
        start = last_put_date - timedelta(days=90)
    else:
        start = last_put_date - timedelta(days=365)
    end = last_put_date + timedelta(days=1)
    print ('start at: {}, end at: {}'.format(str(start), str(end)))
    data_result = ob_table.find({
        'date': {
            '$gte': start,
            '$lt': end
        }
    })
    list_db_data = list(data_result.sort('date', pymongo.ASCENDING))

    return list_db_data

def dataConverter(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, datetime.datetime):
        return obj.__str__()

def get_chat_data(df):
    hadf = HA(df) 
    heik = (hadf["c"] - hadf["o"]).rolling(window=3).mean()
    heik_diff = heik.diff()
    df.replace(np.nan, 0)
    result_data = []
    for data in df.iloc:
        if( data.rsi2 >= 0 and data.rsi3 >= 0):
            side = "buy"
        elif ( data.rsi2 <= 0 and heik_diff.iloc[-1] <= 0):
            side = "sell"
        elif ( data.rsi1 >= 0):
            side = "hold"
        else:
            side = "wait"
        rsi = dataConverter(np.nan_to_num(data.RSI))
        rsi2 = dataConverter(np.nan_to_num(data.rsi2))
        rsi3 = dataConverter(np.nan_to_num(data.rsi3))
        heik = dataConverter(np.nan_to_num(heik_diff.iloc[-1]))
        heik2 = dataConverter(np.nan_to_num(heik_diff.iloc[-2]))

        result_data.append({
            'close': float(data.c),
            'date': data.date,
            'high': float(data.h),
            'low': float(data.l),
            'open': float(data.o),
            'percentChange': "",
            'volume': int(data.v),
            'RSI': rsi,
            'side': side,
            'rsi': {'bearPower': rsi, 'bullPower': rsi},
            'rsi2': {'bearPower': rsi2, 'bullPower': rsi2},
            'rsi3': {'bearPower': rsi3, 'bullPower': rsi3},
            'heik': {'bearPower': heik, 'bullPower': heik},
            'heik2': {'bearPower': heik2, 'bullPower': heik2},
        })
    
    return result_data 

def define_start_date(candle_name):
    cur_date = datetime.now().date()

    if candle_name == 'backtest_2_minute':
        start_time = cur_date - timedelta(days=20)
    elif candle_name == 'backtest_12_minute':
        start_time = cur_date - timedelta(days=20)
    elif candle_name == 'backtest_1_hour':
        start_time = cur_date - timedelta(days=30)
    elif candle_name == 'backtest_4_hour':
        start_time = cur_date - timedelta(days=90)
    elif candle_name == 'backtest_12_hour':
        start_time = cur_date - timedelta(days=90)
    elif candle_name == 'backtest_1_day':
        start_time = cur_date - timedelta(days=365)
    
    cur_date = cur_date + timedelta(days=1)

    return datetime.strptime(str(start_time), '%Y-%m-%d'), datetime.strptime(str(cur_date), '%Y-%m-%d')

def join(candles, strategy_trades, strategy_name):
    candle_len = len(candles)
    candle_cursor = 0
    insert_candles = []
    for trades_data in strategy_trades:
        trade_date = trades_data['date']
        for idx in range(candle_cursor, candle_len):
            candle = candles[idx]
            if candle['date'] > trade_date and idx != 0:
                update_candle = candles[idx-1]
                if 'price' not in update_candle.keys():
                    # print ("type:::", type(trades_data['price']), trades_data['price'])
                    update_candle['price'] = round(float(trades_data['price']), 2)
                    update_candle['quantity'] = round(float(trades_data['quantity']), 2)
                    update_candle['side'] = trades_data['side']
                    update_candle['trade_date'] = trade_date
                    update_candle['strategy'] = strategy_name
                else:
                    insert_candle = update_candle.copy()
                    insert_candle['date'] = trade_date
                    insert_candle['price'] = round(float(trades_data['price']), 2)
                    insert_candle['quantity'] = round(float(trades_data['quantity']), 2)
                    insert_candle['side'] = trades_data['side']
                    insert_candle['trade_date'] = trade_date
                    insert_candle['strategy'] = strategy_name
                    insert_candles.append(insert_candle)
                candle_cursor = idx
                break
    candles.extend(insert_candles)
    # print (insert_candles)
    candles.sort(key = lambda x: x['date'])

    return candles

def join_append(candles, strategy_trades, strategy_name):
    candle_len = len(candles)
    candle_cursor = 0
    for trades_data in strategy_trades:
        trade_date = trades_data['date']
        for idx in range(candle_cursor, candle_len):
            candle = candles[idx]
            if candle['date'] > trade_date and idx != 0:
                update_candle = candles[idx-1]
                if trades_data['side'] == 'BUY':
                    side_type = 'LONG'
                elif trades_data['side'] == 'SELL':
                    side_type = 'SHORT'
                trade_item = dict()
                trade_item['longShort'] = side_type
                trade_item['trade_date'] = trade_date
                trade_item['price'] = round(float(trades_data['price']), 2)
                trade_item['strategy'] = strategy_name
                trade_item['quantity'] = round(float(trades_data['quantity']), 2)
                if 'trades' not in update_candle.keys():
                    update_candle['trades'] = [trade_item]
                else:
                    trades = update_candle['trades']
                    trades.append(trade_item)
                    update_candle['trades'] = trades
                candle_cursor = idx
                break

    return candles

def fill_missing_candles(chat_candles, candle_name, strategy_name):
    db_names = ['backtest_2_minute', '', 'backtest_12_minute', '', 'backtest_1_hour', 'backtest_4_hour', 'backtest_12_hour', 'backtest_1_day']
    strategy_names = [
                'heikfilter-2mins-trades',
                'heikfilter-2mins-4hours-trades', 
                'heikfilter-12mins-trades',
                'heikfilter-12mins-4hours-trades',
                'heikfilter-1hour-trades',
                'heikfilter-4hours-trades',
                'heikfilter-12hours-trades',
                'heikfilter-1day-trades',
            ]
    for idx, db_name in enumerate(db_names):
        if db_name == candle_name:
            if strategy_name in strategy_names[idx:]:
                insert_candles = []
                for candle in chat_candles:
                    try:
                        trades = candle['trades']
                        if len(trades) > 1:
                            single_trades = trades[0]
                            candle['trades'] = [single_trades]
                            for trade_idx in range(1, len(trades)):
                                new_candle_trades = trades[trade_idx]
                                new_candle = candle.copy()
                                new_candle['trades'] = [new_candle_trades]
                                new_candle['date'] = new_candle_trades['trade_date']
                                insert_candles.append(new_candle)
                    except:
                        pass
                chat_candles.extend(insert_candles)
                chat_candles.sort(key = lambda x: x['date'])
                break

    return chat_candles

def fetch_data(stock, candle_name, strategy_name):
    print ('stock:{}, candle_name: {}, strategy_name:{}'.format(stock, candle_name, strategy_name))
    start_date, end_date = define_start_date(candle_name)
    print(start_date, "||", end_date)
    
    # get candles
    masterdb = mongoclient[candle_name]
    ob_table = masterdb[stock]  # 'AMNZ'
    candle_result = ob_table.find({'date': {'$gte': start_date, '$lt': end_date}})
    candles = list(candle_result.sort('date', pymongo.ASCENDING))

    # get strategy trades
    masterdb = mongoclient['backtesting_trades']
    ob_table = masterdb[strategy_name]  # 'AMNZ'
    trade_result = ob_table.find({'date': {'$gte': start_date, '$lt': end_date}, 'symbol': stock})
    strategy_trades = list(trade_result.sort('date', pymongo.ASCENDING))

    # res = join(candles, strategy_trades, strategy_name)
    return candles, strategy_trades

def calc_winningLosing(symbols, db_data):
    wL = []   
    for symbol in symbols:
        winningLosing_temp = {
            'symbol': symbol,
            'winning': 0,
            'losing': 0
        }
        pair_wL = {}
        for db_collection in db_data:
            side = db_collection['side']
            if symbol == db_collection['symbol']:
                pair_wL[side] = float(db_collection['price'])
                if 'BUY' in pair_wL and 'SELL' in pair_wL:
                    calc = pair_wL['SELL'] - pair_wL['BUY']
                    if calc > 0:
                        winningLosing_temp['winning'] =  winningLosing_temp['winning'] + 1
                    else:
                        winningLosing_temp['losing'] =  winningLosing_temp['losing'] + 1
                    pair_wL = {}
        wL.append(winningLosing_temp)
    return wL

def calc_percentEfficiency(symbols, db_data):
    pE = []
    wLA = []
    lS = []
    for symbol in symbols:
        pair_pE = {}
        sym_pE = []
        winningT = []
        losingT = []
        for db_collection in db_data:
            side = db_collection['side']
            if symbol == db_collection['symbol']:
                pair_pE[side] = {
                    "price": float(db_collection['price']),
                    "date": db_collection['date']
                    }
                if 'BUY' in pair_pE and 'SELL' in pair_pE:
                    percent = float(pair_pE['SELL']['price']) * 100  / float(pair_pE['BUY']['price'])
                    # percent = round(percent, 2)
                    percent = percent - 100
                    percent = round(percent, 3)
                    if pair_pE['SELL']['date'].timestamp() - pair_pE['BUY']['date'].timestamp() > 0:
                        entry = 'BUY'
                        exit = 'SELL'
                        exit_date = pair_pE['SELL']['date']
                    else:
                        entry = 'SELL'
                        exit = 'BUY'
                        exit_date = pair_pE['BUY']['date']

                    sym_pE.append({
                        'date': exit_date,
                        'percent': percent,
                        'entry': entry,
                        'exit': exit,
                        'efficiency': percent
                    })
                    pair_pE = {}
                    print("percent", percent)
                    if percent > 0:
                        winningT.append(percent)
                    else:
                        losingT.append(percent)
              

        avgWinning = 0
        avgLosing = 0
        avgWinning = sum(winningT) / len(winningT) if len(winningT) > 0 else 0
        avgWinning = round(avgWinning, 3)
        avgLosing = sum(losingT) / len(losingT) if len(losingT) > 0 else 0
        avgLosing = round(avgLosing, 3)
        wLA.append({
            "symbol": symbol,
            "avgWinning": avgWinning,
            "avgLosing": avgLosing
        })

        # Calculation Long and Short
        short = 0
        long = 0
        if len(sym_pE) > 0 and sym_pE[-1]['entry'] == 'BUY':
            long = sym_pE[-1]['percent']
            short = 0
        elif len(sym_pE) > 0 and sym_pE[-1]['entry'] == 'SELL':
            long = 0
            short = sym_pE[-1]['percent']
        lS.append({
            symbol: {
                'long': long,
                'short': short,
            }
        })
        # Calculation efficiency
        # for sym_item in sym_pE:
        #     sym_item['efficiency'] = 0
        #     if long > 0:
        #         sym_item['efficiency'] = sym_item['percent'] * 100/long
        #     elif short > 0:
        #         sym_item['efficiency'] = sym_item['percent'] * 100/short

        pE.append({
            symbol: sym_pE
        })
    
    return {
        "pE": pE,
        "wLA": wLA,
        "lS": lS
    }

@csrf_exempt 
def get_backtesting_data(request):
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        table_name = request_data['table_name']
        symbols = request_data['symbols']
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
def get_data(request):
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        db_name = request_data['db_name']
        symbol = request_data['symbol']
        masterdb = mongoclient[db_name]
        # table_name = request_data['table_name']
        # ob_table = masterdb[table_name]
        strategy = request_data['strategy']
        # list_db_data = get_view_data(ob_table, db_name)
        candles, strategy_trades = fetch_data(symbol, db_name, strategy)
        # print(list_db_data)
        # convert to pandas dataframe:
        df = util.df(candles)
        df = Filter(df)
        
        chat_candles = get_chat_data(df)
        verdict = join_append(chat_candles, strategy_trades, strategy)
        verdict = fill_missing_candles(verdict, db_name, strategy)
        
    return JsonResponse({'chart_data': verdict}, status=status.HTTP_201_CREATED)

def index(request):
    return render(request, "build/index.html")

