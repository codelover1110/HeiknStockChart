from enum import Flag
from django.db import models
from datetime import datetime, timedelta
import pymongo
from ib_insync import util
import json

from define import *


mongoclient = pymongo.MongoClient('mongodb://root:rootUser2021@20.84.64.243:27017')
  

def get_all_scanner_symbols():
    scanner_db = mongoclient[SCANNER_DB]
    db_collection = scanner_db[SCANNER_VIEWS]
    symbol_lists = list(db_collection.find({}, {"_id": 0, "symbols": 1}))
    result = []
    for symbols in symbol_lists:
        for symbol in symbols['symbols']:
            if symbol not in result:
                result.append(symbol)
    return result

def get_watch_list_symbols(symbol_type):
    def add_symbols(src, dst):
        for sym in dst:
            if not sym in src:
                src.append(sym)
        return src

    scanner_db = mongoclient[PARAMETERS_DB]
    db_collection = scanner_db[WATCHLIST_COL_NAME]
    watch_lists = list(db_collection.find({}, {"_id": 0}))
    crypto_symbols = []
    stock_symbols = []
    for wl in watch_lists:
        name = wl['name']
        tickers = wl['contents'].split('\n')
        if '' in tickers:
            tickers.remove('')
        if 'crypto' in name.lower():
            add_symbols(crypto_symbols,tickers)
        else:
            add_symbols(stock_symbols,tickers)
    if symbol_type == SYMBOL_TYPE_STOCK:
        return stock_symbols
    elif symbol_type == SYMBOL_TYPE_CRYPTO:
        return crypto_symbols

def get_all_scanner_fields():
    financials_db = mongoclient[FINANCIALS]
    db_collection = financials_db[FINANCIALS_COL_NAME]
    financials = db_collection.find_one({}, SCANNER_FINANCIAL_DETAIL_FIELDS)
    financial_keys = financials.keys()

    detail_db = mongoclient[DETAILS]
    db_collection = detail_db[DETAILS_COL_NAME]
    details = db_collection.find_one({}, SCANNER_TICKER_DETAIL_FIELDS)
    detail_kyes = details.keys()
    return [
        {'Stock Financials': financial_keys},
        {'Ticker Details': detail_kyes}
    ]


    
