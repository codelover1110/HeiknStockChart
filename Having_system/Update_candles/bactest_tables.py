import pymongo
from datetime import datetime, timedelta
import pandas as pd 
import time
import requests
import csv
import io

try:
   import queue
except ImportError:
   import Queue as queue

API_KEY = 'tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk'

# mongoclient = pymongo.MongoClient("mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority")
azuremongo = pymongo.MongoClient('mongodb://root:!23QweAsd@20.84.64.243:27017')

def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    s = requests.get(url).content
    companies = pd.read_csv(io.StringIO(s.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols


def put_symbols_db():
    default_symbols = ["GOOG", "ATVI", "AMD", "MSFT", "AMZN", "NVDA", "TSLA", "AAPL"]
    symbols = get_symbols()
    for sym in default_symbols:
        if sym not in symbols:
            symbols.append(sym)

    masterdb = azuremongo["backtest_tables"]
    # collection: stock_list
    ob_table = masterdb['stock_list']
    document_symbols = []
    for sym in symbols:
        doc = {'stock_name': sym}
        document_symbols.append(doc)
    
    ob_table.insert_many(document_symbols)

    # collection: trade_list
    ob_table = masterdb['trade_list']
    for sym in default_symbols:
        stock_name = sym
        query = {"stock_name": stock_name}
        if ob_table.count_documents(query) > 0:
            pass
        else:
            data = {'stock_name': stock_name}
            ob_table.insert_one(data)

def set_last_candle_date(date_str):
    # save last_update_date and this used when get new candles
    # if there is last_update_date vaule => update, else => create
    masterdb = azuremongo["backtest_tables"]
    ob_table = masterdb['last_date']
    last_date = ob_table.find_one()
    if last_date is not None:
        object_id = last_date['_id']
        ob_table.update({'_id': object_id},  {'$set': {"last_candle_date": date_str}}) 
        print ('last date updated from "{}" to "{}"...'.format(last_date['last_candle_date'], date_str))
    else:
        data = {"last_candle_date": date_str}
        ob_table.insert_one(data)

def delete_candles():
    stocks = ['ADRU', 'ADSK', 'ADTN', 'ADUS', 'ADVS', 'ADXS', 'ADXSW', 'AEGN', 'AEGR', 'AEHR', 'AEIS', 'AEPI', 'AERI', 'AETI', 'AEY', 'AEZS', 'AFAM', 'AFCB', 'AFFX', 'AFH', 'AFMD', 'AFOP', 'AFSI', 'AGEN', 'AGII', 'AGIIL', 'AGIO', 'AGNC', 'AGNCB']
    masterdb = azuremongo["market_data"]
    ob_table = masterdb['market_candles']

    for stock in stocks:
        query = { "stock": stock }
        x = ob_table.delete_many(query)
        print ('stock {} deleted'.format(stock))

if __name__ == "__main__":
    
    put_symbols_db()
    cur_date = datetime.now().date()
    set_last_candle_date(str(cur_date))
