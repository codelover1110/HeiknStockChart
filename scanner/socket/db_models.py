from enum import Flag
from django.db import models
from datetime import datetime, timedelta
import pymongo
from ib_insync import util
import json

from utils import get_fields_data, combine_dict, check_dict_none

NEWS = 'sticker_news'
NEWS_COL_NAME = 'news_meta_data'
FINANCIALS = 'financials_data'
FINANCIALS_COL_NAME = 'financials'
DETAILS = 'ticker_details'
DETAILS_COL_NAME = 'detail_meta_data'
PARAMETERS = 'parame'

SCANNER_DB = 'scanner'
SCANNER_VIEWS = 'scanner_views'

PARAMETERS_DB = 'parameters'
INDICATORS_COL_NAME = 'indicators'

class DBManager(object):
    def __init__(self, symbols, fields):
        self.mongoclient = pymongo.MongoClient('mongodb://root:rootUser2021@20.84.64.243:27017')
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

    def get_financial_fields_values(self, symbol, field_list):
        fields = {'_id': 0}
        for field in field_list:
            fields[field] = 1
        financials_db = self.mongoclient[FINANCIALS]
        db_collection = financials_db[FINANCIALS_COL_NAME]
        financials = db_collection.find_one({'ticker': symbol}, fields)
        return financials

    def get_ticker_details_fields_values(self, symbol, field_list):
        fields = {'_id': 0}
        for field in field_list:
            fields[field] = 1
        news_db = self.mongoclient[DETAILS]
        db_collection = news_db[DETAILS_COL_NAME]
        details = db_collection.find_one({'symbol': symbol}, fields)
        return details
