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
mongoclient = pymongo.MongoClient('mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority')

INTERVAL_2_MINUTES_SLEEP_TIME = 15*60    # seconds
INTERVAL_1_HOUR_SLEEP_TIME = 1*60*60    # seconds


def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    s = requests.get(url).content
    companies = pd.read_csv(io.StringIO(s.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols


class DailyPutThread(object):
    def __init__(self, symbols,
                    market_start_time, 
                    market_end_time, 
                    get_only_market_time=False):

        self.symbols = symbols
        self.market_start_time = market_start_time
        self.market_end_time = market_end_time
        self.get_only_market_time = get_only_market_time
        self.update_states = [False, False]
        self.mutex = threading.Lock()

        self.thead_start_time = None         
        self.min_1_thread = threading.Thread(target=self.min_1_thread_func)
        self.hour_1_thread = threading.Thread(target=self.hour_1_thread_func)

    def start(self):
        self.thead_start_time = time.time()
        if not self.min_1_thread.is_alive():
            self.min_1_thread.start()
        time.sleep(0.5)
        if not self.hour_1_thread.is_alive():
            self.hour_1_thread.start()

    def stop(self):
        self._stop = True
 
    def get_thread_state(self):
        return self.update_states

    def set_thread_state(self):
        self.update_states = [False, False]

    def __del__(self):
        self.min_1_thread.join()
        self.hour_1_thread.join()
        print ("deleted")

    def update_last_put_date(self):
        if False in self.update_states:
            return
        masterdb = mongoclient["backtest_tables"]
        ob_table = masterdb['last_date']
        last_date_doc = ob_table.find_one()

        current_date = datetime.now().date()
        last_put_date_obj = datetime.strptime(last_date_doc['last_candle_date'], '%Y-%m-%d').date()
        if current_date > last_put_date_obj:
            object_id = last_date_doc['_id']
            ob_table.update({'_id': object_id},  {'$set': {"last_candle_date": str(current_date)}}) 
            print ("        -----------> updated last put date: ", str(current_date))
        else:
            print("        -----------> last put date didn't updated <-----------")

        self.update_states = [False, False]

    def get_last_put_date(self): 
        masterdb = mongoclient["backtest_tables"]
        ob_table = masterdb['last_date']
        last_date_doc = ob_table.find_one()
        current_date = datetime.now().date()
        if last_date_doc is not None:
            return last_date_doc['last_candle_date']
        else:
            data = {"last_candle_date": str(current_date)}
            ob_table.insert_one(data)
            return str(current_date)

    def filter_new_candles(self, api_candles, db_candles):
        new_candles = []
        if len(db_candles) == 0:
            for candle in api_candles:
                candle['date'] = datetime.fromtimestamp((candle['t']/1000))
                new_candles.append(candle)
        else:
            latest_db_candle = db_candles[-1]
            latest_db_date = latest_db_candle['date']

            for candle in api_candles:
                candle_date = datetime.fromtimestamp((candle['t']/1000))
                if latest_db_date < candle_date:
                    candle['date'] = candle_date
                    new_candles.append(candle)

        # print ("        api_candles:", len(api_candles))
        # print ("        db_candles:", len(db_candles))
        # print ("        new_candles:", len(new_candles), "  (contains for no marketing time candles)")
        return new_candles

    def get_new_candles(self, symbol, interval, interval_unit, last_put_date):
        try:
            # get api candles
            current_date = datetime.now().date()
            cur_date_str = str(current_date + timedelta(days=1))
            polygon_url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/{interval}/{interval_unit}/{last_put_date}/{cur_date_str}?adjusted=true&sort=asc&limit=50000&apiKey=tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk"
            datasets = requests.get(polygon_url).json()
            api_candles = datasets['results'] if 'results' in datasets else []

            # get db candles
            db_name = 'market_data'
            masterdb = mongoclient[db_name]
            ob_table = masterdb['market_candles']
            
            existing_start = datetime.strptime(last_put_date, '%Y-%m-%d')
            existing_end = datetime.strptime(str(current_date+timedelta(days=1)), '%Y-%m-%d')
            data_result = ob_table.find({
                'date': {
                    '$gte': existing_start,
                    '$lt': existing_end
                },
                'stock': symbol
            })
            # print ('        from: {}, to: {}'.format(existing_start, existing_end))
            db_candles = list(data_result.sort('date', pymongo.ASCENDING))
            new_candles = self.filter_new_candles(api_candles, db_candles)
        except:
            print ("......error in get_new_candles......")

        self.mutex.release()
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

    def min_1_thread_func(self):
        interval_value = '1'
        interval_unit = 'minute'
        while True:
            last_put_date = self.get_last_put_date()
            for idx, symbol in enumerate(self.symbols):
                db_name = 'test_market_data'
                masterdb = mongoclient[db_name]
                ob_table = masterdb['market_candles']
                while True:
                    if not self.mutex.locked():
                        self.mutex.acquire()
                        # print('====> symbol:{}-{}'.format(symbol, idx))
                        new_candles = self.get_new_candles(symbol, interval_value, interval_unit, last_put_date)
                        for idx, candle in enumerate(new_candles):
                            if self.get_only_market_time:
                                if not self.check_candle_in_maket_time(candle):
                                    continue
                            query = {"date": candle['date']}
                            if ob_table.count_documents(query) > 0:
                                pass
                            else:
                                ob_table.insert_one(candle)
                        break
                    else:
                        time.sleep(0.01)
            self.update_states[0] = True
            # self.update_last_put_date()

            time.sleep(INTERVAL_2_MINUTES_SLEEP_TIME)

    def hour_1_thread_func(self):
        interval_value = '1'
        interval_unit = 'hour'
        while True:
            last_put_date = self.get_last_put_date()
            for symbol in self.symbols:
                db_name = 'test_market_data'
                masterdb = mongoclient[db_name]
                ob_table = masterdb['market_candles']
                while True:
                    if not self.mutex.locked():
                        self.mutex.acquire()
                        new_candles = self.get_new_candles(symbol, interval_value, interval_unit, last_put_date)
                        for idx, candle in enumerate(new_candles):
                            if self.get_only_market_time:
                                if not self.check_candle_in_maket_time(candle):
                                    continue
                            query = {"date": candle['date']}
                            if ob_table.count_documents(query) > 0:
                                pass
                            else:
                                ob_table.insert_one(candle)
                        break
                    else:
                        time.sleep(0.01)

            self.update_states[1] = True

            time.sleep(INTERVAL_1_HOUR_SLEEP_TIME)
      
if __name__ == "__main__":
    market_start_time = [9, 30]
    market_end_time = [16, 30]
    get_only_market_time = True
    thread_count = 10
    thread_list = []

    symbols = get_symbols()
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

        dpo_thread = DailyPutThread(thread_symbols,
                                market_start_time,
                                market_end_time,
                                get_only_market_time)
        
        thread_list.append(dpo_thread)
        print ('create thread with {} symbols'.format(len(thread_symbols)))
    
    for thrd in thread_list:
        thrd.start()
        time.sleep(0.5)

    proc_time = 0
    while True:
        thread_states = []
        for thrd in thread_list:
            thread_states.extend(thrd.get_thread_state())

        if False not in thread_states:
            # update db
            masterdb = mongoclient["backtest_tables"]
            ob_table = masterdb['last_date']
            last_date_doc = ob_table.find_one()

            current_date = datetime.now().date()
            last_put_date_obj = datetime.strptime(last_date_doc['last_candle_date'], '%Y-%m-%d').date()
            if current_date > last_put_date_obj:
                object_id = last_date_doc['_id']
                ob_table.update({'_id': object_id},  {'$set': {"last_candle_date": str(current_date)}}) 
                print ("        -----------> updated last put date: ", str(current_date))
            else:
                print("        -----------> last put date didn't updated <-----------")


            for thrd in thread_list:
                thrd.set_thread_state()

            time.sleep(5)
            proc_time = 0
        else:
            print('< {} > {}'.format(proc_time, thread_states))

        time.sleep(5)
        proc_time += 5



    if False:  # using only one thread
        market_start_time = [9, 30]
        market_end_time = [16, 30]
        get_only_market_time = True

        symbols = get_symbols()
        sc_thread = DailyPutThread(symbols, 
                                    market_start_time,
                                    market_end_time,
                                    get_only_market_time)
        sc_thread.start()
