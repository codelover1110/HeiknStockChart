from datetime import datetime, timedelta
import pymongo
import time

mongoclient = pymongo.MongoClient('mongodb://root:%2123QweAsd@20.84.64.243:27017')

MARKET_DATA_DB = 'stock_market_data'
BACKTESTING_CANDLES = 'backtest_1_minute'  # 1 minute market data

masterdb = mongoclient[MARKET_DATA_DB]
db_collection = masterdb[BACKTESTING_CANDLES]

def print_(label, value):
    print ('------------{} => {}'.format(label, value))

def define_start_date():
    cur_date = datetime.now().date()
    start_time = cur_date - timedelta(days=20)

    return datetime.strptime(str(start_time), '%Y-%m-%d'), datetime.strptime(str(cur_date), '%Y-%m-%d')

start_time = datetime.now()
start_at, end_at = define_start_date()
query = {'date':{'$gte': start_at, '$lt': end_at},'stock': 'GOOG'}
candles = list(db_collection.find(query).sort('date', pymongo.ASCENDING))
end_time = datetime.now()

print ('{} -> {} : {}'.format(start_time, end_time, len(candles)))
