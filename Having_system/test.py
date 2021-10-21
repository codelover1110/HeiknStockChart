import sys
sys.path.insert(0, '..')
import pymongo
from datetime import datetime, timedelta
import requests
import time
import threading

try:
   import queue
except ImportError:
   import Queue as queue

from v_define import MONGO_URL, API_KEY, STOCK_CHART_DB_NAME, STOCK_LAST_UPDATE_DATE_COL, SYMBOL_TYPE_STOCK
from v_define import INTERVALS as intervals
from v_db_models import get_watch_list_symbols
from common import get_symbols

mongoclient = pymongo.MongoClient(MONGO_URL)

market_start_time = [9, 30]
market_end_time = [16, 30]
get_only_market_time = True
thread_count = 2
thread_list = []

class DailyPutThreadManager(object):
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
        self.time_delta = 30           
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
 
    def __del__(self):
        self.min_1_thread.join()
        print ("deleted")

    def thread_func(self):
        while True:
            if self._stop == True:
                break
            time.slee(1)
if __name__ == "__main__":
    start_time = datetime.now()
    interval = ['1', 'minute']
    int_value = 1
    
    market_start_time = [9, 30]
    market_end_time = [16, 30]
    get_only_market_time = True
    thread_count = 2
    thread_list = []

    symbols = get_watch_list_symbols(SYMBOL_TYPE_STOCK)
    symbols.append("")
    symbol_count = len(symbols)
    print (symbols, "symbols: ", symbol_count)
