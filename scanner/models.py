from enum import Flag
from django.db import models
from datetime import datetime, timedelta
import pymongo
from ib_insync import util
import json

from chartApis.common import get_chat_data_rsi_heik_v11
from financials.models import get_income_statement, get_balance_sheet, get_cash_statement
from chartApis.lib.ts_rsi_heik_v1_1 import Filter as rsi_heik_v1_fitler_1

# mongoclient = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
mongoclient = pymongo.MongoClient('mongodb://root:rootUser2021@20.84.64.243:27018/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false')
# mongoclient = pymongo.MongoClient('mongodb://mluser:mlUser1000@20.84.64.243:27019')

NEWS = 'sticker_news'
NEWS_COL_NAME = 'news_meta_data'
FINANCIALS = 'financials_data_1008'
FINANCIALS_COL_NAME = 'financials'
DETAILS = 'ticker_details'
# DETAILS_COL_NAME = 'detail_meta_data'
DETAILS_COL_NAME = 'ticker_detail_meta_data'
PARAMETERS = 'parame'

SCANNER_DB = 'scanner'
SCANNER_VALUE = 'scanner_value'
SCANNER_VIEWS = 'scanner_views'

PARAMETERS_DB = 'parameters'
WATCHLIST_COL_NAME = 'static_watchlists'
INDICATORS_COL_NAME = 'indicators'


def get_stock_financials_fields():
    fields = {
        "_id": 0,
        "calendarDate": 1,
        "currentRatio": 1,
        "debt": 1,
        "period": 1,
        "updated": 1,
        "assetsCurrent": 1, 
        "assets": 1, 
        "profitMargin": 1, 
        "shares": 1,
        "taxAssets": 1
    }

    financials_db = mongoclient[FINANCIALS]
    db_collection = financials_db[FINANCIALS_COL_NAME]
    financials = db_collection.find_one({}, fields)
    total = list(financials.keys())
    results = {
        "total": total,
        "defaults": total[:2]
    }
    return results

def get_financial_fields_values(symbol, field_list):
    fields = {'_id': 0}
    for field in field_list:
        fields[field] = 1
    financials_db = mongoclient[FINANCIALS]
    db_collection = financials_db[FINANCIALS_COL_NAME]
    financials = list(db_collection.find({'ticker': symbol}, fields))
    return financials

def get_indicators_fields():
    news_db = mongoclient[PARAMETERS_DB]
    db_collection = news_db[INDICATORS_COL_NAME]
    indicators = list(db_collection.find({}, {'_id': 0, 'name': 1}))
    total = [indicator['name'] for indicator in indicators]
    for n, i in enumerate(total):
        if i == 'heik_diff':
            total[n] = 'heik2'
        elif i == 'rsi1':
            total[n] = 'rsi'

    return {
        "total": total,
        "defaults": total,
    }

def get_ticker_news_fields():
    fields = {
        "_id": 0,
        "publisher": 0,
        "tickers": 0,
        "keywords": 0,
        "data": 0
    }

    news_db = mongoclient[NEWS]
    db_collection = news_db[NEWS_COL_NAME]
    news = db_collection.find_one({}, fields)

    total = list(news.keys())
    results = {
        "total": total,
        "defaults": total[:2]
    }

    return results

def get_ticker_details_fields():
    fields = {
        "_id": 0,
        "country": 1, 
        "phone": 1,
        "url": 1,
        "hq_state": 1,
        "type": 1, 
        "updated": 1, 
        "active": 1, 
        "ceo": 1,
        "exchangeSymbol": 1,
        "name": 1
    }

    news_db = mongoclient[DETAILS]
    db_collection = news_db[DETAILS_COL_NAME]
    details = db_collection.find_one({}, fields)
    total = list(details.keys())
    results = {
        "total": total,
        "defaults": total[:2]
    }

    return results

def get_ticker_details_fields_values(symbol, field_list):
    fields = {'_id': 0}
    for field in field_list:
        fields[field] = 1
    news_db = mongoclient[DETAILS]
    db_collection = news_db[DETAILS_COL_NAME]
    details = list(db_collection.find({'symbol': symbol}, fields))
    return details

def get_available_items():
    news_db = mongoclient[NEWS]
    db_collection = news_db[NEWS_COL_NAME]
    result = dict()
    result['stock_financials'] = get_stock_financials_fields()
    result['indicators'] = get_indicators_fields()
    result['ticker_details'] = get_ticker_details_fields()
    return result

def get_multi_financials(symbols, financial_part):
    result = []
    for symbol in symbols:
        if symbol == "GOOG":
            symbol = "AAL"
        if financial_part == 'income_statement':
            part_data = get_income_statement(symbol)
        elif financial_part == 'balance_sheet':
            part_data = get_balance_sheet(symbol)
        elif financial_part == 'cash_statement':
            part_data = get_cash_statement(symbol)

        if symbol == "AAL":
            symbol = "GOOG"
        if len(part_data) > 10:
            result.append([symbol, part_data])
        else:
            result.append([symbol, part_data])

    return result

def update_symbol_candle(symbol, candle):
    scanner_db = mongoclient[SCANNER_DB]
    db_collection = scanner_db[SCANNER_VALUE]

    symbol_scanner = db_collection.find_one({'symbol': symbol})
    if symbol_scanner is not None:
        latest_candles = symbol_scanner['lastest_candles']
        if latest_candles[-1]['date'] < candle['date']:
            latest_candles.append(candle)
            if len(latest_candles) > 24:
                tmp_latest_candles = latest_candles.copy()
                df = util.df(tmp_latest_candles)
                new_candle = rsi_heik_v1_fitler_1(df)
                tmp_candle = candle.copy()
                tmp_candle['RSI'] = new_candle['RSI']
                tmp_candle['side'] = new_candle['side']
                tmp_candle['rsi2'] = new_candle['rsi2']
                tmp_candle['rsi3'] = new_candle['rsi3']
                tmp_candle['heik'] = new_candle['heik']
                tmp_candle['heik2'] = new_candle['heik2']
                symbol_scanner['rsi_candle'] = tmp_candle
                symbol_scanner['lastest_candles'] = latest_candles[-24:]
            else:
                symbol_scanner['lastest_candles'] = latest_candles

            db_collection.update_one({"_id": symbol_scanner['_id']}, {"$set": symbol_scanner}, upsert=False)
      
    else:
        scanner_value = {
            'symbol': symbol,
            'lastest_candles': [candle]
        }
        db_collection.insert_one(scanner_value)

def save_scanner_views(chart_number, symbols, fields):
    scanner_db = mongoclient[SCANNER_DB]
    db_collection = scanner_db[SCANNER_VIEWS]
    scanner_views = db_collection.find_one({"chart_number": chart_number})

    if scanner_views is not None:
        db_collection.update_one({"_id": scanner_views['_id']}, {"$set":{'chart_number': chart_number, 'symbols': symbols, 'fields': fields}}, upsert=False)
    else:
        new_one = dict()
        new_one['chart_number'] = chart_number
        new_one['symbols'] = symbols
        new_one['fields'] = fields
        db_collection.insert_one(new_one)

def save_scanner_views1(scanner_views):
    scanner_db = mongoclient[SCANNER_DB]
    db_collection = scanner_db[SCANNER_VIEWS]
    s_views = db_collection.find_one({"chart_number": scanner_views['chart_number']})

    if s_views is not None:
        db_collection.update_one({"_id": s_views['_id']}, {"$set":scanner_views}, upsert=False)
    else:
        db_collection.insert_one(scanner_views)

def save_all_scanner_views(all_scanner_views):
    scanner_db = mongoclient[SCANNER_DB]
    db_collection = scanner_db[SCANNER_VIEWS]
    for scanner_views in all_scanner_views:
        s_views = db_collection.find_one({"chart_number": scanner_views['chart_number']})
        if s_views is not None:
            db_collection.update_one({"_id": s_views['_id']}, {"$set": scanner_views}, upsert=False)
        else:
            db_collection.insert_one(scanner_views)

def get_scanner_views(chart_number):
    scanner_db = mongoclient[SCANNER_DB]
    db_collection = scanner_db[SCANNER_VIEWS]
    scanner_views = db_collection.find_one({'chart_number': chart_number}, {'_id': False})

    return scanner_views

def get_all_scanner_views():
    scanner_db = mongoclient[SCANNER_DB]
    db_collection = scanner_db[SCANNER_VIEWS]
    all_scanner_views = list(db_collection.find({}, {'_id': False}))

    return all_scanner_views
    
def get_scanner_initials():
    scanner_db = mongoclient[SCANNER_DB]
    db_collection = scanner_db[SCANNER_VALUE]
    initical_scanner_data = list(db_collection.find({}, {"symbol": 1, "rsi_candle":1}))

    return initical_scanner_data

def get_watchlist(name):
    scanner_db = mongoclient[PARAMETERS_DB]
    db_collection = scanner_db[WATCHLIST_COL_NAME]
    wl = db_collection.find_one({'name': name}, {"_id": 0})
    tickers = wl['contents'].split('\n')
    tickers.remove('')

    return tickers

def get_watchlist_all():
    scanner_db = mongoclient[PARAMETERS_DB]
    db_collection = scanner_db[WATCHLIST_COL_NAME]
    wls = list(db_collection.find({}, {"_id": 0}))
    result = []
    for wl in wls: 
        wl_name = wl['name']
        tickers = wl['contents'].split('\n')
        if '' in tickers:
            tickers.remove('')
        wl_item = dict()
        wl_item['name'] = wl_name
        wl_item['tickers'] = tickers
        result.append(wl_item)

    return result

def get_all_scanner_symbols():
    scanner_db = mongoclient[SCANNER_DB]
    db_collection = scanner_db[SCANNER_VIEWS]
    symbol_lists = list(db_collection.find({}, {"_id": 0, "symbols": 1}))

    result = []
    for symbols in symbol_lists:
        for symbol in symbols:
            if symbol not in result:
                result.append(symbol)
    return result
    result = json.loads(wl['contents'])
    return result['tickers']

def get_ticker_details_list(exchange, industry, sector, page_num=0, page_mounts=0):
    news_db = mongoclient[DETAILS]
    db_collection = news_db[DETAILS_COL_NAME]
    fields = {'_id': 0, 'tags':0, 'similar':0, 'address':0}
    

    query_obj = dict()
    if exchange != '':
        query_obj['exchange'] = exchange
    if industry != '':
        query_obj['industry'] = industry
    if sector != '':
        query_obj['sector'] = sector
    
    page_total = db_collection.find(query_obj, fields).count()
    if page_num != 0 and page_mounts != 0:
        details = list(db_collection.find(query_obj, fields).skip(page_num).limit(page_mounts))
    else:
        details = list(db_collection.find(query_obj, fields))
    return details, page_total

def get_ticker_details_filter_options():
    news_db = mongoclient[DETAILS]
    db_collection = news_db[DETAILS_COL_NAME]

    query_object = [{
        "$facet": {
            "exchange": [
                {
                    "$group" : {
                        "_id" : "$exchange", 
                    }
                }
            ],
            "industry": [
                {
                    "$group" : {
                        "_id" : "$industry", 
                    }
                }
            ],
            "sector": [
                {
                    "$group" : {
                        "_id" : "$sector", 
                    }
                }
            ]
        }
    }]

    agg_result = db_collection.aggregate(query_object)
    agg_options = []
    for doc in agg_result:
        agg_options = doc
    
    options = dict()
    options["exchanges"] = [item["_id"] for item in agg_options["exchange"]]
    options["industry"] = [item["_id"] for item in agg_options["industry"]]
    options['sector'] = [item["_id"] for item in agg_options["sector"]]

    return options
