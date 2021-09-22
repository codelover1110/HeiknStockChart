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

API_KEY = 'tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk'
# mongoclient = pymongo.MongoClient('mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority')
# mongoclient = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
mongoclient = pymongo.MongoClient('mongodb://root:%2123QweAsd@20.84.64.243:27017')

def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    s = requests.get(url).content
    companies = pd.read_csv(io.StringIO(s.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols

DB_NAME = 'stock_market_data'

intervals = [
    [['1', 'minute'], 1, False, 30],    # use 30 when get a year candles
    # [['2', 'minute'], 2, False, 500],    # use 60 when get a year candles
    # [['12', 'minute'], 12, False, 500],  # use 200 when get a year candles
    # [['1', 'hour'], 1*60, False, 500],
    # [['4', 'hour'], 4*60, False, 500],
    # [['12', 'hour'], 12*60, False, 500],
    # [['1', 'day'], 24*60, False, 500],
]

class DailyPutThread(object):
    def __init__(self, symbols,
                    interval,
                    int_value,
                    market_start_time, 
                    market_end_time, 
                    get_only_market_time=False):

        self.symbols = symbols
        self.interval = interval
        self.int_value = int_value
        self.market_start_time = market_start_time
        self.market_end_time = market_end_time
        self.get_only_market_time = get_only_market_time
        self.time_delta = 30                # fetch 30 days market data at a once
        self.working = False
        self._stop = False


        self.thread_start_time = None         
        self.min_1_thread = threading.Thread(target=self.thread_func)

    def start(self):
        self.thread_start_time = time.time()
        if not self.min_1_thread.is_alive():
            self.min_1_thread.start()

    def stop(self):
        self._stop = True
        time.sleep(3)
 
    def get_thread_state(self):
        return self.working

    def set_interval(self, interval, int_value, get_only_market_time, time_delta=30):
        self.interval = interval
        self.int_value = int_value
        self.get_only_market_time = get_only_market_time
        self.time_delta = time_delta
        self.working = True

    def __del__(self):
        self.min_1_thread.join()
        print ("deleted")

    def update_last_put_date(self, symbol, interval, last_candle_date):
        masterdb = mongoclient[DB_NAME]
        ob_table = masterdb['symbol_last_date']
        symbol_last_update_date = ob_table.find_one({"symbol": symbol})

        if symbol_last_update_date is not None:
            object_id = symbol_last_update_date['_id']
            key = interval[0] + "_" + interval[1]
            ob_table.update_one({'_id': object_id},  {'$set': {key: last_candle_date}}) 

    def get_last_put_date(self, symbol, interval): 
        default_date = datetime.strptime("2020-09-01 00:00:00", '%Y-%m-%d %H:%M:%S')
        
        masterdb = mongoclient[DB_NAME]
        ob_table = masterdb['symbol_last_date']
        last_date_doc = ob_table.find_one({"symbol": symbol})
        if last_date_doc is not None:
            key = interval[0] + "_" + interval[1]
            if key in last_date_doc.keys():
                return last_date_doc[key]
            else:
                object_id = last_date_doc['_id']
                ob_table.update({'_id': object_id},  {'$set': {key: default_date}}) 
                return default_date
        else:
            symbol_last_date = dict()
            if True:
                symbol_last_date['symbol'] = symbol
                symbol_last_date['1_minute'] = default_date
                symbol_last_date['2_minute'] = default_date
                symbol_last_date['12_minute'] = default_date
                symbol_last_date['1_hour'] = default_date
                symbol_last_date['4_hour'] = default_date
                symbol_last_date['12_hour'] = default_date
                symbol_last_date['1_day'] = default_date
            else:
                symbol_last_date['symbol'] = symbol
                symbol_last_date['1_minute'] = datetime.now() - timedelta(days=20)
                symbol_last_date['2_minute'] = datetime.now() - timedelta(days=20)
                symbol_last_date['12_minute'] = datetime.now() - timedelta(days=20)
                symbol_last_date['1_hour'] = datetime.now() - timedelta(days=30)
                symbol_last_date['4_hour'] = datetime.now() - timedelta(days=90)
                symbol_last_date['12_hour'] = datetime.now() - timedelta(days=90)
                symbol_last_date['1_day'] = datetime.now() - timedelta(days=365)


            ob_table.insert_one(symbol_last_date)
            return symbol_last_date[interval[0] + "_" + interval[1]]

    def get_new_candles(self, symbol, interval, interval_unit, last_put_date):
        last_put_date_str = str(last_put_date.date())
        new_candles = []
        try:
            end_date = last_put_date+timedelta(days=self.time_delta)
            cur_date_str = str(end_date.date())

            polygon_url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/{interval}/{interval_unit}/{last_put_date_str}/{cur_date_str}?adjusted=true&sort=asc&limit=50000&apiKey=tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk"
            datasets = requests.get(polygon_url).json()
            api_candles = datasets['results'] if 'results' in datasets else []

            for candle in api_candles:
                candle_date = datetime.fromtimestamp((candle['t']/1000))
                if last_put_date < candle_date:
                    candle['date'] = candle_date
                    new_candles.append(candle)

        except:
            print ("......error in get_new_candles......")

        return new_candles

    def check_candle_in_maket_time(self, candle):
        year = int(candle['date'].strftime("%Y"))
        month = int(candle['date'].strftime("%m"))
        day = int(candle['date'].strftime("%d"))
        mk_start = datetime(year, month, day, self.market_start_time[0], self.market_start_time[1])
        mk_end = datetime(year, month, day, self.market_end_time[0], self.market_end_time[1])
        if mk_start <= candle['date'] <= mk_end:
            return True
        else:
            return False

    def thread_func(self):
        while True:
            if self._stop == True:
                break
            if self.working == False:
                time.sleep(1)
                continue
            for sym_idx, symbol in enumerate(self.symbols):
                last_put_date = self.get_last_put_date(symbol, self.interval)
                # last_put_date = datetime.strptime("2021-09-06 00:00:00", '%Y-%m-%d %H:%M:%S')

                masterdb = mongoclient[DB_NAME]
                collection_name = 'backtest_'+self.interval[0]+"_"+self.interval[1]
                ob_table = masterdb[collection_name]
                
                put_candle_count = 0
                while True:
                    new_candles = self.get_new_candles(symbol, self.interval[0], self.interval[1], last_put_date)
                    put_candles = []
                    for idx, candle in enumerate(new_candles):
                        if self.get_only_market_time:
                            if not self.check_candle_in_maket_time(candle):
                                continue

                        candle['interval'] = self.int_value
                        candle['stock'] = symbol
                        candle['time_frame'] = self.interval[0] + "_" + self.interval[1]
                        put_candles.append(candle)  

                    if len(put_candles) > 0:
                        ob_table.insert_many(put_candles)
                        last_candle_date = put_candles[-1]['date']
                        self.update_last_put_date(symbol, self.interval, last_candle_date)
                        put_candle_count += len(put_candles)
                        
                    last_put_date = last_put_date + timedelta(days=self.time_delta)
                    if last_put_date > datetime.now():
                        break
                print('{} {} ====> symbol:{}-{}, count:{}'.format(self.interval[0], self.interval[1],symbol, sym_idx, put_candle_count))
                time.sleep(0.01)
            self.working = False

            time.sleep(1)


if __name__ == "__main__":
    start_time = datetime.now()
    interval = ['1', 'minute']
    int_value = 1
    
    market_start_time = [9, 30]
    market_end_time = [16, 30]
    get_only_market_time = True
    thread_count = 10
    thread_list = []

    symbols = get_symbols()
    # symbols = ["GOOG", "ATVI", "AMD", "MSFT", "AMZN", "NVDA", "TSLA", "AAPL", ""]
    symbol_count = len(symbols)
    print ("symbols: ", symbol_count)

    thread_symbol_count = int(symbol_count / thread_count) + 1
    for idx in range(thread_count):
        start_symbol_idx = thread_symbol_count * idx
        if thread_symbol_count*(idx+1) >= symbol_count:
            end_symbol_idx = symbol_count - 1
        else:
            end_symbol_idx = thread_symbol_count*(idx+1)
        
        thread_symbols = symbols[start_symbol_idx : end_symbol_idx]

        dpc_thread = DailyPutThread(thread_symbols,
                                interval,
                                int_value,
                                market_start_time,
                                market_end_time,
                                get_only_market_time)
        
        thread_list.append(dpc_thread)
        print ('create thread with {} symbols'.format(len(thread_symbols)))
    
    for thrd in thread_list:
        thrd.start()
        time.sleep(0.5)

    # while True:
    for item in intervals:
        proc_time = 0
        while True:
            thread_states = []
            for thrd in thread_list:
                thread_working = thrd.get_thread_state()
                thread_states.append(thread_working)
            if True not in thread_states:
                for thrd in thread_list:
                    thrd.set_interval(item[0], item[1], item[2], item[3])
                break
            else:
                print('< {} > {}'.format(proc_time, thread_states))

            time.sleep(5)
            proc_time += 5
        # time.sleep(10*60)

    for thrd in thread_list:
        thrd.stop()

    time.sleep(2)
    end_time = datetime.now()
    print ('start at: {}, end_at: {}'.format(start_time, end_time))
    

    
