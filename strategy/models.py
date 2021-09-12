from django.db import models

# Create your models here.

from datetime import datetime, timedelta
import pymongo

mongoclient = pymongo.MongoClient("mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority") 
STRATEGY_PARAMETERS = 'parameters'
db = mongoclient[STRATEGY_PARAMETERS]

def get_parameter_list():
    collections = db.collection_names(include_system_collections=False)
    return collections

def get_parameter_detail_list(param_type):
    db_collection = db[param_type]
    param_details = list(db_collection.find({}, {"_id": False}))
    return param_details

def get_parameter_item_names(param_type):
    db_collection = db[param_type]
    param_items = [item['name'] for item in db_collection.find().sort('_id', pymongo.ASCENDING)]
    return param_items

def get_parameter_content(param_type, param_item_name):
    db_collection = db[param_type]
    
    content = db_collection.find_one({"name": param_item_name})
    return content['contents']