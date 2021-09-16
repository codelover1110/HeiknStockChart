from datetime import datetime, timedelta
import pymongo
import time


hunter_mongoclient = pymongo.MongoClient("mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority")
# hunter_mongoclient = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
MARKET_DATA_DB = 'stock_market_data'
BACKTESTING_CANDLES = 'backtest_1_minute'  # 1 minute market data

masterdb = hunter_mongoclient[MARKET_DATA_DB]
db_collection = masterdb[BACKTESTING_CANDLES]

def print_(label, value):
    print ('------------{} => {}'.format(label, value))

def define_start_date(candle_name):
    cur_date = datetime.now().date()
    
    if candle_name == 'backtest_2_minute':
        start_time = cur_date - timedelta(days=20)
    elif candle_name == 'backtest_12_minute':
        start_time = cur_date - timedelta(days=20)
    elif candle_name == 'backtest_1_hour':
        start_time = cur_date - timedelta(days=30)
    elif candle_name == 'backtest_4_hour':
        start_time = cur_date - timedelta(days=90)
    elif candle_name == 'backtest_12_hour':
        start_time = cur_date - timedelta(days=90)
    elif candle_name == 'backtest_1_day':
        start_time = cur_date - timedelta(days=365)

    return datetime.strptime(str(start_time), '%Y-%m-%d'), datetime.strptime(str(cur_date), '%Y-%m-%d')

if False:
    print_("collection list", masterdb.list_collection_names())

    print_("document count", db_collection.find().count())

    print_("index information", db_collection.index_information())

    print ("explain result", db_collection.find().explain())


if False:
    start_time = datetime.now()
    query = {'stock': 'GOOG'}
    cnt = db_collection.count_documents(query)
    end_time = datetime.now()
    
    print ('{} -> {} : {}'.format(start_time, end_time, cnt))
    # 2021-09-14 09:40:13.348850 -> 2021-09-14 09:42:04.283049 : 104196   non indexing
    # 2021-09-14 11:02:04.212541 -> 2021-09-14 11:03:54.728863 : 104196   text indexing

if True:
    start_time = datetime.now()
    start_at, end_at = define_start_date('backtest_2_minute')
    query = {'date':{'$gte': start_at, '$lt': end_at},'stock': 'GOOG'}
    candles = list(db_collection.find(query).sort('date', pymongo.ASCENDING))
    end_time = datetime.now()
    
    print ('{} -> {} : {}'.format(start_time, end_time, len(candles)))

    # 2021-09-14 21:10:17.937609 -> 2021-09-14 21:12:10.957179 : 5026           text indexing
    # 2021-09-14 21:14:45.669552 -> 2021-09-14 21:16:39.517852 : 5026           no indexing