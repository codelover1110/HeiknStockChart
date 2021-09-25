from datetime import datetime, timedelta
import pymongo

# mongo_client = pymongo.MongoClient('mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority')
# mongoclient = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
mongoclient = pymongo.MongoClient('mongodb://root:!23QweAsd@20.84.64.243:27017')

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
