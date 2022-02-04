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

FLOATS = "floats"
FLOATSDETAILS = "floats_details"

def get_floats_data(page_num, page_mounts, exchange, industry, sector):
    
    fields = {
        "_id": 0,
    }

    floats_db = mongoclient[FLOATS]
    db_collection = floats_db[FLOATSDETAILS]

    query_obj = dict()
    query_obj['Note'] = { "$exists": False }
    if exchange != '':
        query_obj['Exchange'] = exchange
    if industry != '':
        query_obj['Industry'] = industry
    if sector != '':
        query_obj['Sector'] = sector

    page_total = db_collection.find(query_obj, fields).count()
    floats_list = db_collection.find(query_obj, fields).skip(page_num).limit(page_mounts)
    floats = []
    for float_item in floats_list:
        floats.append(float_item)
    return {
        'floats': floats,
        'page_total': page_total
    }

def get_float_details_filter_options():

    news_db = mongoclient[FLOATS]
    db_collection = news_db[FLOATSDETAILS]

    query_object = [{
        "$facet": {
            "exchange": [
                {
                    "$group" : {
                        "_id" : "$Exchange", 
                    }
                }
            ],
            "industry": [
                {
                    "$group" : {
                        "_id" : "$Industry", 
                    }
                }
            ],
            "sector": [
                {
                    "$group" : {
                        "_id" : "$Sector", 
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