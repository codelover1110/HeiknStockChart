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
mongoclient = pymongo.MongoClient('mongodb://root:rootUser2021@20.84.64.243:27017')
# mongoclient = pymongo.MongoClient('mongodb://mluser:mlUser1000@20.84.64.243:27019')

FLOATS = "floats"
FLOATSDETAILS = "floats_details"

def get_floats_data():
    
    fields = {'_id': 0}

    floats_db = mongoclient[FLOATS]
    db_collection = floats_db[FLOATSDETAILS]


    floats_list = list(db_collection.find({}, fields))
    

    floats = []
    for float_item in floats_list:
        if 'Note' not in float_item:
            floats.append(float_item)
    return floats