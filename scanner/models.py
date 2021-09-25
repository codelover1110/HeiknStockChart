from enum import Flag
from django.db import models
from datetime import datetime, timedelta
import pymongo

# mongoclient = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
mongoclient = pymongo.MongoClient('mongodb://root:!23QweAsd@20.84.64.243:27017')

NEWS = 'sticker_news'
NEWS_COL_NAME = 'news_meta_data'
FINANCIALS = 'financials_data'
FINANCIALS_COL_NAME = 'financials'
DETAILS = 'ticker_details'
DETAILS_COL_NAME = 'detail_meta_data'


def get_stock_financials_fields():
    fields = {
        "_id": 0,
        "ticker": 0,
    }

    financials_db = mongoclient[FINANCIALS]
    db_collection = financials_db[FINANCIALS_COL_NAME]
    financials = db_collection.find_one({}, fields)
    return list(financials.keys())

def get_indicators_fields():
    # news_db = mongoclient[NEWS]
    # db_collection = news_db[COL_NAME]
    return ['name', 'contents']

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
    return list(news.keys())

def get_ticker_details_fields():
    fields = {
        "_id": 0,
        "tags": 0,
        "similar": 0
    }

    news_db = mongoclient[DETAILS]
    db_collection = news_db[DETAILS_COL_NAME]
    details = db_collection.find_one({}, fields)
    return list(details.keys())

def get_available_items():
    news_db = mongoclient[NEWS]
    db_collection = news_db[NEWS_COL_NAME]
    result = list(db_collection.find({}, {'_id': False}).sort('date', pymongo.DESCENDING))
    return []


class Scanner(models.Model):
    symbol = models.CharField(max_length=10, blank=False, default='AMZN')
    open = models.FloatField(null=False, default=0.0)
    close = models.FloatField(null=False, default=0.0)
    high = models.FloatField(null=False, default=0.0)
    close = models.FloatField(null=False, default=0.0)
    value = models.IntegerField(null=False, default=0)
    num = models.IntegerField(null=False, default=0)
    date = models.DateTimeField(default=datetime.now())