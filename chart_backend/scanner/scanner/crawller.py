from queue import Queue
import pymongo
from datetime import datetime, timedelta
import pandas as pd 
import requests
import time
import io
import threading
import random

from scanner.models import (
    update_symbol_candle
)

try:
   import queue
except ImportError:
   import Queue as queue

API_KEY = 'tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk'

def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    s = requests.get(url).content
    companies = pd.read_csv(io.StringIO(s.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols

intervals = [
    [['1', 'minute'], 1, False, 5],    # use 30 when get a year candles
    # [['2', 'minute'], 2, False, 5],    # use 60 when get a year candles
    # [['12', 'minute'], 12, False, 10],  # use 200 when get a year candles
    # [['1', 'hour'], 1*60, False, 30],
    # [['4', 'hour'], 4*60, False, 90],
    # [['12', 'hour'], 12*60, False, 365],
    # [['1', 'day'], 24*60, False, 365],
]

class PolygonCrawller(object):
    def __init__(self, symbols, interval, data_queue, db_update=False):

        self.symbols = symbols
        self.interval = interval
        self.time_delta = 30                # fetch 30 days market data at a once
        self.working = False
        self._stop = False
        self.data_queue = data_queue
        self.db_update = db_update


        self.thread_start_time = None         
        self.candle_thread = threading.Thread(target=self.thread_func)

    def start(self):
        self.thread_start_time = time.time()
        if not self.candle_thread.is_alive():
            self.candle_thread.start()

    def stop(self):
        self._stop = True
        time.sleep(0.1)
 
    def get_thread_state(self):
        return self.working

    def set_interval(self, interval, time_delta=30):
        self.interval = interval
        self.time_delta = time_delta
        self.working = True

    def __del__(self):
        self.candle_thread.join()
        print ("deleted")


    def get_new_candle(self, symbol, interval, interval_unit):
        new_candles = []
        try:
            cur_date_str = datetime.now().date()
            start_date = cur_date_str-timedelta(days=self.time_delta)

            polygon_url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/{interval}/{interval_unit}/{start_date}/{str(cur_date_str)}?adjusted=true&sort=asc&limit=50000&apiKey=tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk"
            datasets = requests.get(polygon_url).json()
            api_candles = datasets['results'] if 'results' in datasets else []
            if len(api_candles) > 0:
                # last_idx = random.randint(0, len(api_candles)-1)
                # last_candle = api_candles[last_idx]
                last_candle = api_candles[-1]
                last_candle['date'] = str(datetime.fromtimestamp(last_candle['t']/1000) - timedelta(hours=2))
                del last_candle['t']
                if 'op' in last_candle.keys():
                    del last_candle['op']
                new_candles.append(last_candle)

        except:
            print ("......error in get_new_candles......")

        return new_candles

    def thread_func(self):
        while True:
            if self._stop == True:
                self.working = False
                break
            if self.working == False:
                time.sleep(1)
                continue
            for sym_idx, symbol in enumerate(self.symbols):
                new_candles = self.get_new_candle(symbol, self.interval[0], self.interval[1])
                
                if len(new_candles) > 0:
                    item = dict()
                    item['symbol'] = symbol
                    item['data'] = new_candles[0]
                    if not self.db_update:
                        self.data_queue.put(item)
                        if self.data_queue.qsize() > 100:
                            get_item = self.data_queue.get()
                    else:
                        update_symbol_candle(symbol, new_candles[0])
                    # print ('interval: {}, put symbol: {} - {}'.format(self.interval[0] + " " + self.interval[1], symbol, sym_idx))
                time.sleep(0.01)

            self.working = False

            time.sleep(60)

