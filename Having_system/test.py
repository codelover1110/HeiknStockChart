from datetime import datetime, timedelta
import pymongo


hunter_mongoclient = pymongo.MongoClient("mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority")
MARKET_DATA_DB = 'market_data'
BACKTESTING_CANDLES = 'market_stock_candles'  # 1 minute market data



masterdb = hunter_mongoclient[MARKET_DATA_DB]
db_collection = masterdb[BACKTESTING_CANDLES]

query = {"interval": 60}

print(db_collection.count_documents(query))