from datetime import datetime, timedelta
from numpy.core.records import get_remaining_size
import pymongo
import time
import requests

mongoclient = pymongo.MongoClient('mongodb://mluser:mlUser1000@20.84.64.243:27019')

MARKET_DATA_DB = 'stock_market_data'
BACKTESTING_CANDLES = 'backtest_1_minute'  # 1 minute market data

# masterdb = mongoclient[MARKET_DATA_DB]
# db_collection = masterdb[BACKTESTING_CANDLES]

# def print_(label, value):
#     print ('------------{} => {}'.format(label, value))

# def define_start_date():
#     cur_date = datetime.now().date()
#     start_time = cur_date - timedelta(days=20)

#     return datetime.strptime(str(start_time), '%Y-%m-%d'), datetime.strptime(str(cur_date), '%Y-%m-%d')

# start_time = datetime.now()
# start_at, end_at = define_start_date()
# query = {'date':{'$gte': start_at, '$lt': end_at},'stock': 'GOOG'}
# candles = list(db_collection.find(query).sort('date', pymongo.ASCENDING))
# end_time = datetime.now()

# print ('{} -> {} : {}'.format(start_time, end_time, len(candles)))

# https://docs.whale-alert.io/#transactions
# start_at = int(time.time() - 1000)
# polygon_url = "https://api.whale-alert.io/v1/transactions?api_key=o1ip6p4clqCamFA4b43AxppY5J498UBf&min_value=600000&start="+str(start_at)
# datasets = requests.get(polygon_url).json()
# # print (datasets)
# for d in datasets['transactions']:
#     print (d)
# print (datasets['count'])
# print (datasets['cursor'])
# print (len(datasets))

NEWS = 'sticker_news'
COL_NAME = 'news_meta_data'

def get_recent_news():
    news_db = mongoclient[NEWS]
    db_collection = news_db[COL_NAME]
    result = list(db_collection.find({}, {'_id': False}).sort('date', pymongo.DESCENDING))
    return result

news  = get_recent_news()
print (len(news))
