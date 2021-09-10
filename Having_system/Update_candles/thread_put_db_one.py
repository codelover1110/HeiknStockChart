import pymongo
from datetime import datetime, timedelta
import pandas as pd 
import os
import requests
import time
import io
import csv
import threading

try:
   import queue
except ImportError:
   import Queue as queue

DELTA_TIME = 10 # day
API_KEY = 'tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk'

# bigmlpiter
# mongoclient = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
# mclerper
# mongoclient = pymongo.MongoClient("mongodb://hunter:STOCKdb123@cluster0-shard-00-00.agmoz.mongodb.net:27017,cluster0-shard-00-01.agmoz.mongodb.net:27017,cluster0-shard-00-02.agmoz.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-f8c9fs-shard-0&authSource=admin&retryWrites=true&w=majority")
# hunter
mongoclient = pymongo.MongoClient("mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority")
intervals = [
    [2, 'minute'],
    [12, 'minute'],
    [1, 'hour'],
    [4, 'hour'],
    [12, 'hour'],
    [1, 'day']
]

class SymbolCandleThread(object):
    def __init__(self, 
                    symbol, 
                    interval, 
                    whole_start_time, 
                    whole_end_time, 
                    market_start_time, 
                    market_end_time, 
                    get_only_market_time=False):

        self.symbol = symbol
        self.interval = interval
        self.whole_start_time = whole_start_time
        self.whole_end_time = whole_end_time
        self.market_start_time = market_start_time
        self.market_end_time = market_end_time
        self.get_only_market_time = get_only_market_time


        self.thead_start_time = None         
        self.candle_queue = queue.Queue()
        self.get_thread = threading.Thread(target=self.get_candle_thread_func)
        self.put_thread = threading.Thread(target=self.put_candle_thread_func)

        self.current_date = whole_start_time
        self._stop = False
        self.working = False
        self.last_candle = None
        self.ob_table = None

    def start(self):
        self.thead_start_time = time.time()
        if not self.get_thread.is_alive():
            self.get_thread.start()
        if not self.put_thread.is_alive():
            self.put_thread.start()

    def stop(self):
        self._stop = True
 
    def get_thread_state(self):
        return self.working

    def __del__(self):
        self.get_thread.join()
        self.put_thread.join()
        print ("deleted")

    def set_params(self, symbol, interval):
        self.symbol = symbol
        self.interval = interval

        db_name = 'market_data'
        masterdb = mongoclient[db_name]
        # self.ob_table = masterdb[symbol]
        self.ob_table = masterdb['market_stock_candles']
        self.current_date = self.whole_start_time
        self.working = True

    def get_candles(self, stock, interval, candle_type):
        # https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2020-10-14/2020-10-14?adjusted=true&sort=asc&limit=50000&apiKey=
        startAt = str(self.current_date.date())
        end_date = self.current_date + timedelta(days=DELTA_TIME)
        endAt = str(end_date.date())
        polygon_url = f"https://api.polygon.io/v2/aggs/ticker/{stock}/range/{interval}/{candle_type}/{startAt}/{endAt}?adjusted=true&sort=asc&limit=50000&apiKey={API_KEY}"
        datasets = requests.get(polygon_url).json()
        result = datasets['results'] if 'results' in datasets else []
        print('=== get candle {} ===: {}, {}--{}'.format(len(result), stock, startAt, endAt))
        if len(result) == 0:
            print ("--- no result --- : ", polygon_url)
        return result

    def check_candle_in_maket_time(self, candle):
        candle['date'] = datetime.fromtimestamp((candle['t']/1000))
        year = int(candle['date'].strftime("%Y"))
        month = int(candle['date'].strftime("%m"))
        day = int(candle['date'].strftime("%d"))
        mk_start = datetime(year, month, day, self.market_start_time[0], self.market_start_time[1])
        mk_end = datetime(year, month, day, self.market_end_time[0], self.market_end_time[1])
        if mk_start <= candle['date'] <= mk_end:
            candle['interval'] = 24*60
            candle['stock'] = self.symbol
            return True
        else:
            return False

    def fill_space(self, candle):
        last_candle_time = self.last_candle['date']
        candle_time = candle['date']
        if self.interval[0] == 2 and self.interval[1] == 'minute':
            time_delta = timedelta(minutes=2)
        if self.interval[0] == 12 and self.interval[1] == 'minute':
            time_delta = timedelta(minutes=12)
        if self.interval[0] == 1 and self.interval[1] == 'hour':
            time_delta = timedelta(hours=1)
        if self.interval[0] == 4 and self.interval[1] == 'hour':
            time_delta = timedelta(hours=4)
        if self.interval[0] == 12 and self.interval[1] == 'hour':
            time_delta = timedelta(hours=12)
        if self.interval[0] == 1 and self.interval[1] == 'day':
            time_delta = timedelta(days=2)

        if last_candle_time + time_delta < candle_time:
            last_candle_time = last_candle_time + time_delta
            while last_candle_time < candle_time:
                fill_candle = self.last_candle.copy()
                del fill_candle['_id']
                fill_candle['date'] = last_candle_time
                self.ob_table.insert_one(fill_candle)
                print (' fill : {}'.format(str(last_candle_time)))
                last_candle_time = last_candle_time + time_delta

    def get_candle_thread_func(self):
        while True:
            if self._stop:
                return
            if self.current_date > self.whole_end_time:
                time.sleep(0.1)
                continue

            candles = self.get_candles(self.symbol, str(self.interval[0]), self.interval[1])
            for idx, candle in enumerate(candles):
                if self.get_only_market_time:
                    if not self.check_candle_in_maket_time(candle):
                        continue
                else:
                    candle['date'] = datetime.fromtimestamp((candle['t']/1000))
                    candle['interval'] = 24*60
                    candle['stock'] = self.symbol
                self.candle_queue.put(candle)
                if self.candle_queue.qsize() > 1000:
                    time.sleep(0.1)
            self.current_date += timedelta(days=DELTA_TIME)
                
            time.sleep(0.01)
    
    def put_candle_thread_func(self):
        total_candle_count = 0
        while True:
            if self._stop:
                return
            if self.current_date > self.whole_end_time and self.candle_queue.empty()==True:
                self.working = False
                time.sleep(0.1)
                continue
            if not self.candle_queue.empty():
                put_candles = []
                while not self.candle_queue.empty():
                    candle = self.candle_queue.get()
                    put_candles.append(candle)

                self.ob_table.insert_many(put_candles)
    
            time.sleep(0.001)

def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    s = requests.get(url).content
    companies = pd.read_csv(io.StringIO(s.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols

def get_db_symbols():
    masterdb = mongoclient["backtest_tables"]
    ob_table = masterdb['stock_list']
    cursor = ob_table.find({})
    symbols = []
    for doc in cursor:
        symbols.append(doc['stock_name'])
    return symbols

def put_symbols_db():
    default_symbols = ['AMZN', 'AMD', 'MSFT', 'GOOG', 'ATVI', 'TSLA']
    symbols = get_symbols()
    for sym in default_symbols:
        if sym not in symbols:
            symbols.append(sym)

    masterdb = mongoclient["backtest_tables"]
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
    masterdb = mongoclient["backtest_tables"]
    ob_table = masterdb['last_date']
    last_date = ob_table.find_one()
    if last_date is not None:
        object_id = last_date['_id']
        ob_table.update({'_id': object_id},  {'$set': {"last_candle_date": date_str}}) 
        print ('last date updated from "{}" to "{}"...'.format(last_date['last_candle_date'], date_str))
    else:
        data = {"last_candle_date": date_str}
        ob_table.insert_one(data)

def define_start_date(interval, whole_year=False):
    cur_date = datetime.now().date()
    if whole_year == False:
        if interval == [2, 'minute']:
            start_time = cur_date - timedelta(days=20)
        elif interval == [12, 'minute']:
            start_time = cur_date - timedelta(days=20)
        elif interval == [1, 'hour']:
            start_time = cur_date - timedelta(days=30)
        elif interval == [4, 'hour']:
            start_time = cur_date - timedelta(days=90)
        elif interval == [12, 'hour']:
            start_time = cur_date - timedelta(days=90)
        elif interval == [1, 'day']:
            start_time = cur_date - timedelta(days=365)

        return str(start_time), str(cur_date)
    else:
        start_time = cur_date - timedelta(days=365)
        return str(start_time), str(cur_date)

def check_candle_in_maket_time(candle):
    market_start_time = [9, 30]
    market_end_time = [16, 30]
    candle['date'] = datetime.fromtimestamp((candle['t']/1000))
    year = int(candle['date'].strftime("%Y"))
    month = int(candle['date'].strftime("%m"))
    day = int(candle['date'].strftime("%d"))
    mk_start = datetime(year, month, day, market_start_time[0], market_start_time[1])
    mk_end = datetime(year, month, day, market_end_time[0], market_end_time[1])
    if mk_start <= candle['date'] <= mk_end:

        return True
    else:
        return False

def get_put_candles(stock, interval, candle_type, startAt, endAt, db_name):
    print ('{} => {} : from {} to {}'.format(str(interval)+'_'+candle_type, stock, startAt, endAt))
    masterdb = mongoclient[db_name]
    ob_table = masterdb[stock]
    # https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2020-10-14/2020-10-14?adjusted=true&sort=asc&limit=50000&apiKey=
    polygon_url = f"https://api.polygon.io/v2/aggs/ticker/{stock}/range/{interval}/{candle_type}/{startAt}/{endAt}?adjusted=true&sort=asc&limit=50000&apiKey={API_KEY}"
    datasets = requests.get(polygon_url).json()
    candles = datasets['results'] if 'results' in datasets else []
    print ('candle count: {}'.format(len(candles)))
    for idx, candle in enumerate(candles):
        print ('    ', idx)
        if interval == 12 and candle_type == 'hour':
            candle['date'] = datetime.fromtimestamp((candle['t']/1000))
            ob_table.insert_one(candle)
            continue
        elif interval == 1 and candle_type == 'day':
            candle['date'] = datetime.fromtimestamp((candle['t']/1000))
            ob_table.insert_one(candle)
            continue
        
        if not check_candle_in_maket_time(candle):
            continue
        else:
            candle['date'] = datetime.fromtimestamp((candle['t']/1000))
            ob_table.insert_one(candle)

def delete_candles():
    stocks = ['ADRU', 'ADSK', 'ADTN', 'ADUS', 'ADVS', 'ADXS', 'ADXSW', 'AEGN', 'AEGR', 'AEHR', 'AEIS', 'AEPI', 'AERI', 'AETI', 'AEY', 'AEZS', 'AFAM', 'AFCB', 'AFFX', 'AFH', 'AFMD', 'AFOP', 'AFSI', 'AGEN', 'AGII', 'AGIIL', 'AGIO', 'AGNC', 'AGNCB']
    masterdb = mongoclient["market_data"]
    ob_table = masterdb['market_candles']

    for stock in stocks:
        query = { "stock": stock }
        x = ob_table.delete_many(query)
        print ('stock {} deleted'.format(stock))

if __name__ == "__main__":
    
    # print ("++++++++++ put symbol list +++++++++")
    # put_symbols_db()

    print ("++++++++++ put canldes +++++++++")
    symbols = get_db_symbols()
    # symbols = ['AMZN', 'AMD', 'MSFT', 'GOOG', 'ATVI']
    print (len(symbols), ' symbols: ', symbols)
    interval = [1, 'minute']
    start_date, end_date = define_start_date(interval, whole_year=True)
    whole_start_time = datetime.strptime(start_date, '%Y-%m-%d')
    whole_end_time = datetime.strptime(end_date, '%Y-%m-%d')
    market_start_time = [9, 30]
    market_end_time = [16, 30]
    get_only_market_time = False
    cur_date = datetime.now().date()

    put_thread_list = []
    thread_cnt = 10
    for i in range(0, thread_cnt):
        sc_thread = SymbolCandleThread('AMZN', 
            interval, 
            whole_start_time, 
            whole_end_time,
            market_start_time,
            market_end_time,
            get_only_market_time)
        sc_thread.start()
        put_thread_list.append(sc_thread)

    symbol_idx = 0
    while symbol_idx < len(symbols):
        for sc_thread in put_thread_list:
            if symbol_idx == len(symbols):
                break
            if sc_thread.get_thread_state() == False:
                symbol = symbols[symbol_idx]
                sc_thread.set_params(symbol, interval)
                symbol_idx += 1
        time.sleep(1)

    while True:
        stop_cnt = 0
        for sc_thread in put_thread_list:
            if sc_thread.get_thread_state() == False:
                sc_thread.stop()
                stop_cnt += 1
        # print ("stoped count:", stop_cnt)
        if stop_cnt == thread_cnt:
            break
        time.sleep(1)

    # print ("+++++ put last candle udpate list +++++")
    # set_last_candle_date(str(cur_date))
