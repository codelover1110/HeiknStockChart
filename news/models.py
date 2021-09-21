from datetime import datetime, timedelta
import pymongo

# mongoclient = pymongo.MongoClient("mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority") 
mongoclient = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
NEWS = 'sticker_news'
COL_NAME = 'news_meta_data'

def get_recent_news():
    news_db = mongoclient[NEWS]
    db_collection = news_db[COL_NAME]
    result = list(db_collection.find({}, {'_id': False}).sort('date', pymongo.DESCENDING))
    return result

def get_symbol_news(symbol):
    query = {
        "tickers":{"$in": [symbol]}
    }
    news_db = mongoclient[NEWS]
    db_collection = news_db[COL_NAME]
    result = list(db_collection.find(query, {'_id': False}).sort('date', pymongo.DESCENDING))
    return result


# def save_configs_one(config_collection, config):
#     db_collection = proc_db[config_collection]
#     config['update_date'] = datetime.now()
#     query = {"name": config['name']}
#     b_config = db_collection.find_one(query)
#     if b_config is not None:
#         db_collection.update_one({"_id": b_config['_id']}, {"$set": config}, upsert=False)
#     else:
#         db_collection.insert_one(config)

# def delete_configs(delete_config_list):
#     for config_collection in delete_config_list:
#         proc_db.drop_collection(config_collection)

# def delete_config_items(config_collection, config_detail_names):
#     db_collection = proc_db[config_collection]
#     for config_detail_name in config_detail_names:
#         query = {"name": config_detail_name}
#         doc = db_collection.find_one(query)
#         obj_id = doc['_id']
#         result = proc_db[config_collection].delete_one({'_id': obj_id})
