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
# bigmlpiter
mongoclient = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
# mclerper
# mongoclient = pymongo.MongoClient("mongodb://hunter:STOCKdb123@cluster0-shard-00-00.agmoz.mongodb.net:27017,cluster0-shard-00-01.agmoz.mongodb.net:27017,cluster0-shard-00-02.agmoz.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-f8c9fs-shard-0&authSource=admin&retryWrites=true&w=majority")

INTERVAL_2_MINUTES_SLEEP_TIME = 10*60    # seconds
INTERVAL_12_MINUTES_SLEEP_TIME = 12*60    # seconds
INTERVAL_1_HOUR_SLEEP_TIME = 1*60*60    # seconds
INTERVAL_4_HOURS_SLEEP_TIME = 4*60*60    # seconds
INTERVAL_12_HOURS_SLEEP_TIME = 12*60*60    # seconds
INTERVAL_1_DAY_SLEEP_TIME = 24*60*60    # seconds

DB_PREFIX = "backtest_"


class DailyPutThread(object):
    def __init__(self, 
                    market_start_time, 
                    market_end_time, 
                    get_only_market_time=False):

        self.symbols = ['AMZN', 'AMD', 'MSFT', 'GOOG', 'ATVI']
        # self.symbols = ['GOOG']
        self.market_start_time = market_start_time
        self.market_end_time = market_end_time
        self.get_only_market_time = get_only_market_time
        self.update_states = [False, False, False, False, False, False]
        self.mutex = threading.Lock()

        self.thead_start_time = None         
        self.min_2_thread = threading.Thread(target=self.min_2_thread_func)
        self.min_12_thread = threading.Thread(target=self.min_12_thread_func)
        self.hour_1_thread = threading.Thread(target=self.hour_1_thread_func)
        self.hour_4_thread = threading.Thread(target=self.hour_4_thread_func)
        self.hour_12_thread = threading.Thread(target=self.hour_12_thread_func)
        self.day_1_thread = threading.Thread(target=self.day_1_thread_func)

    def start(self):
        self.thead_start_time = time.time()
        if not self.min_2_thread.is_alive():
            self.min_2_thread.start()
        time.sleep(0.7)
        if not self.min_12_thread.is_alive():
            self.min_12_thread.start()
        time.sleep(0.7)
        if not self.hour_1_thread.is_alive():
            self.hour_1_thread.start()
        time.sleep(0.7)
        if not self.hour_4_thread.is_alive():
            self.hour_4_thread.start()
        time.sleep(0.7)
        if not self.hour_12_thread.is_alive():
            self.hour_12_thread.start()
        time.sleep(0.7)
        if not self.day_1_thread.is_alive():
            self.day_1_thread.start()

    def stop(self):
        self._stop = True
 
    def get_thread_state(self):
        return self.state

    def __del__(self):
        self.min_2_thread.join()
        self.min_12_thread.join()
        self.hour_1_thread.join()
        self.hour_4_thread.join()
        self.hour_12_thread.join()
        self.day_1_thread.join()
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

        self.update_states = [False, False, False, False, False, False]

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

        print ("        api_candles:", len(api_candles))
        print ("        db_candles:", len(db_candles))
        print ("        new_candles:", len(new_candles), "  (contains for no marketing time candles)")
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
            db_name = DB_PREFIX+str(interval)+'_'+interval_unit
            masterdb = mongoclient[db_name]
            ob_table = masterdb[symbol]
            print('====> db:{}, table:{}'.format(db_name, symbol))
            existing_start = datetime.strptime(last_put_date, '%Y-%m-%d')
            existing_end = datetime.strptime(str(current_date+timedelta(days=1)), '%Y-%m-%d')
            data_result = ob_table.find({
                'date': {
                    '$gte': existing_start,
                    '$lt': existing_end
                }
            })
            print ('        from: {}, to: {}'.format(existing_start, existing_end))
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

    def min_2_thread_func(self):
        interval_value = '2'
        interval_unit = 'minute'
        while True:
            last_put_date = self.get_last_put_date()
            for symbol in self.symbols:
                db_name = DB_PREFIX+interval_value+'_'+interval_unit
                masterdb = mongoclient[db_name]
                ob_table = masterdb[symbol]
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
                        time.sleep(0.1)
            self.update_states[0] = True
            self.update_last_put_date()

            time.sleep(INTERVAL_2_MINUTES_SLEEP_TIME)

    def min_12_thread_func(self):
        interval_value = '12'
        interval_unit = 'minute'
        while True:
            last_put_date = self.get_last_put_date()
            for symbol in self.symbols:
                db_name = DB_PREFIX+interval_value+'_'+interval_unit
                masterdb = mongoclient[db_name]
                ob_table = masterdb[symbol]
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
                        time.sleep(0.1)
            self.update_states[1] = True

            time.sleep(INTERVAL_12_MINUTES_SLEEP_TIME)

    def hour_1_thread_func(self):
        interval_value = '1'
        interval_unit = 'hour'
        while True:
            last_put_date = self.get_last_put_date()
            for symbol in self.symbols:
                db_name = DB_PREFIX+interval_value+'_'+interval_unit
                masterdb = mongoclient[db_name]
                ob_table = masterdb[symbol]
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
                        time.sleep(0.1)

            self.update_states[2] = True

            time.sleep(INTERVAL_1_HOUR_SLEEP_TIME)
            
    def hour_4_thread_func(self):
        interval_value = '4'
        interval_unit = 'hour'
        while True:
            last_put_date = self.get_last_put_date()
            for symbol in self.symbols:
                db_name = DB_PREFIX+interval_value+'_'+interval_unit
                masterdb = mongoclient[db_name]
                ob_table = masterdb[symbol]
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
                        time.sleep(0.1)

            self.update_states[3] = True

            time.sleep(INTERVAL_4_HOURS_SLEEP_TIME)

    def hour_12_thread_func(self):
        interval_value = '12'
        interval_unit = 'hour'
        while True:
            last_put_date = self.get_last_put_date()
            for symbol in self.symbols:
                db_name = DB_PREFIX+interval_value+'_'+interval_unit
                masterdb = mongoclient[db_name]
                ob_table = masterdb[symbol]
                while True:
                    if not self.mutex.locked():
                        self.mutex.acquire()
                        new_candles = self.get_new_candles(symbol, interval_value, interval_unit, last_put_date)
                        for idx, candle in enumerate(new_candles):
                            # if self.get_only_market_time:
                            #     if not self.check_candle_in_maket_time(candle):
                            #         continue
                            query = {"date": candle['date']}
                            if ob_table.count_documents(query) > 0:
                                pass
                            else:
                                ob_table.insert_one(candle)
                        break
                    else:
                        time.sleep(0.1)
            self.update_states[4] = True

            time.sleep(INTERVAL_12_HOURS_SLEEP_TIME)

    def day_1_thread_func(self):
        interval_value = '1'
        interval_unit = 'day'
        while True:
            last_put_date = self.get_last_put_date()
            for symbol in self.symbols:
                db_name = DB_PREFIX+interval_value+'_'+interval_unit
                masterdb = mongoclient[db_name]
                ob_table = masterdb[symbol]
                while True:
                    if not self.mutex.locked():
                        self.mutex.acquire()
                        new_candles = self.get_new_candles(symbol, interval_value, interval_unit, last_put_date)
                        for idx, candle in enumerate(new_candles):
                            # if self.get_only_market_time:
                            #     if not self.check_candle_in_maket_time(candle):
                            #         continue
                            query = {"date": candle['date']}
                            if ob_table.count_documents(query) > 0:
                                pass
                            else:
                                ob_table.insert_one(candle)
                        break
                    else:
                        time.sleep(0.1)
            self.update_states[5] = True

            time.sleep(INTERVAL_1_DAY_SLEEP_TIME)

if __name__ == "__main__":
    market_start_time = [9, 30]
    market_end_time = [16, 30]
    get_only_market_time = True

    sc_thread = DailyPutThread(market_start_time,
                                market_end_time,
                                get_only_market_time)
    sc_thread.start()
