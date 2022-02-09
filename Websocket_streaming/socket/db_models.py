from enum import Flag
from django.db import models
from datetime import datetime, timedelta
import pymongo
from ib_insync import util
import json

from utils import get_fields_data, combine_dict, check_dict_none
from define import *


mongoclient = pymongo.MongoClient('mongodb://root:rootUser2021@20.84.64.243:27018/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false')
class DBManager(object):
    def __init__(self, symbols, fields, symbol_type=SYMBOL_TYPE_STOCK):
        self.financial_fields = get_fields_data(fields, 'Stock Financials')
        self.detail_fields = get_fields_data(fields, 'Ticker Details')
        self.symbols = symbols

        self.scanner_data = []
        self._working = False

        self.init()

    def init(self):
        self._working = True
        for symbol in self.symbols:
            f_data, d_data = None, None
            if self.financial_fields is not None:
                f_data = self.get_financial_fields_values(symbol, self.financial_fields)
                f_data = check_dict_none(f_data, self.financial_fields)
            if self.detail_fields is not None:
                d_data = self.get_ticker_details_fields_values(symbol, self.detail_fields)
                d_data = check_dict_none(d_data, self.detail_fields)
                
            item = dict()
            item['symbol'] = symbol
            item['data'] = combine_dict(f_data, d_data)
            self.scanner_data.append(item)
        self._working = False

    def get_fields_data(self, fields, key):
        for item in fields:
            if key in item.keys():
                return item[key]

    def reset_fields(self, symbols, fields):
        self.symbols = symbols
        self.financial_fields = get_fields_data(fields, 'Stock Financials')
        self.detail_fields = get_fields_data(fields, 'Ticker Details')
        
        self._working = True
        self.scanner_data = []
        self.init()
        self._working = False

    def get_status(self):
        return self._working

    def scanner_preload(self):
        return self.scanner_data

    def get_symbol_preload(self, symbol):
        for pre_load in self.scanner_data:
            if pre_load['symbol'] == symbol:
                return pre_load['data']


    def get_financial_fields_values(self, symbol, field_list):
        fields = {'_id': 0}
        for field in field_list:
            fields[field] = 1
        financials_db = mongoclient[FINANCIALS]
        db_collection = financials_db[FINANCIALS_COL_NAME]
        financials = db_collection.find_one({'ticker': symbol}, fields)
        return financials

    def get_ticker_details_fields_values(self, symbol, field_list):
        fields = {'_id': 0}
        for field in field_list:
            fields[field] = 1
        news_db = mongoclient[DETAILS]
        db_collection = news_db[DETAILS_COL_NAME]
        details = db_collection.find_one({'symbol': symbol}, fields)
        return details

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


    
