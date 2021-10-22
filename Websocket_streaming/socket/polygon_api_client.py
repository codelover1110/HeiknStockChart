from datetime import datetime, timedelta
import requests
import time
import threading

try:
   import queue
except ImportError:
   import Queue as queue

from define import SYMBOL_TYPE_CRYPTO, SYMBOL_TYPE_STOCK

new_candles = queue.Queue()
api_key = 'tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk'

class PolygonApiClient(object):
    def __init__(self, symbols, new_candle_queue, api_key, symbol_type=SYMBOL_TYPE_STOCK, interval=['1', 'minute']):
        self.symbols = symbols
        self.new_candle_queue = new_candle_queue
        self.api_key = api_key
        self.symbol_type = symbol_type
        self.interval = interval
        self.latest_time = None
        self._stop = False

        self.api_thread = threading.Thread(target=self.thread_func)

    def start(self):
        self.buffering_candles()
        if not self.api_thread.is_alive():
            self.api_thread.start()

    def stop(self):
        self._stop = True
        time.sleep(1)
 
    def __del__(self):
        self.api_thread.join()
        print ("deleted")

    def buffering_candles(self):
        for symbol in self.symbols:
            start_date = datetime.now() - timedelta(days=3)
            start_date = start_date.date()
            end_date = datetime.now() + timedelta(days=1)
            end_date = end_date.date()

            if self.symbol_type == SYMBOL_TYPE_STOCK:
                polygon_url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/{self.interval[0]}/{self.interval[1]}/{str(start_date)}/{str(end_date)}?adjusted=true&sort=asc&limit=50000&apiKey=" + self.api_key
            elif self.symbol_type == SYMBOL_TYPE_CRYPTO:
                sym_x = f"X:{symbol}USD"
                polygon_url = f"https://api.polygon.io/v2/aggs/ticker/{sym_x}/range/{self.interval[0]}/{self.interval[1]}/{str(start_date)}/{str(end_date)}?adjusted=true&sort=asc&limit=50000&apiKey=" + self.api_key
            datasets = requests.get(polygon_url).json()
            api_candles = datasets['results'] if 'results' in datasets else []
            buffering_candles = api_candles[-25:]
            for candle in buffering_candles:
                candle['date'] = str(datetime.fromtimestamp(candle['t']/1000) - timedelta(hours=2))
                print ("buffering ", symbol)
                self.put_queue(candle, symbol)
            time.sleep(0.01)

    def put_queue(self, candle, symbol):
        if not self._stop:
            if self.symbol_type == SYMBOL_TYPE_STOCK:
                candle['symbol'] = symbol
            elif self.symbol_type == SYMBOL_TYPE_CRYPTO:
                candle['symbol'] = symbol + "-USD"
            self.new_candle_queue.put(candle)
            if self.new_candle_queue.qsize() > 10000:
                self.new_candle_queue.get()

    def update_new_candles(self, symbol):
        
        start_date = datetime.now() - timedelta(days=3)
        start_date = start_date.date()
        end_date = datetime.now() + timedelta(days=1)
        end_date = end_date.date()
        try:
            if self.symbol_type == SYMBOL_TYPE_STOCK:
                polygon_url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/{self.interval[0]}/{self.interval[1]}/{str(start_date)}/{str(end_date)}?adjusted=true&sort=desc&limit=3&apiKey=" + self.api_key
            elif self.symbol_type == SYMBOL_TYPE_CRYPTO:
                sym_x = f"X:{symbol}USD"
                polygon_url = f"https://api.polygon.io/v2/aggs/ticker/{sym_x}/range/{self.interval[0]}/{self.interval[1]}/{str(start_date)}/{str(end_date)}?adjusted=true&sort=desc&limit=3&apiKey=" + self.api_key
            datasets = requests.get(polygon_url).json()
            api_candles = datasets['results'] if 'results' in datasets else []
            if len(api_candles) > 0:
                last_candle = api_candles[0]
                last_candle_date = datetime.fromtimestamp(last_candle['t']/1000) - timedelta(hours=2)
                last_candle['date'] = str(last_candle_date)
                if self.latest_time == None:
                    self.latest_time = last_candle_date

                if self.latest_time < last_candle_date:
                    self.put_queue(last_candle, symbol)
                    self.latest_time = last_candle_date
            
        except:
            print ("......error in get_new_candles......")

    def thread_func(self):
        while True:
            if self._stop == True:
                break
            for symbol in self.symbols:
                self.update_new_candles(symbol)

            time.sleep(60)

if __name__ == "__main__":
    symbols = ["ETH","BTC", "DOGE", "BCH", "LTC"]
    # symbols = ["AXP", "V", "COST", "KO", "BAC"]
    symbol_type = SYMBOL_TYPE_CRYPTO
    if False:
        thread_list = []

        symbols.append("")
        symbol_count = len(symbols)
        print (symbols, "symbols: ", symbol_count)

        thread_symbol_count = 2
        thread_count = int(symbol_count/thread_symbol_count) + 1
        for idx in range(thread_count):
            start_symbol_idx = thread_symbol_count * idx
            if thread_symbol_count*(idx+1) >= symbol_count:
                end_symbol_idx = symbol_count - 1
            else:
                end_symbol_idx = thread_symbol_count*(idx+1)
            
            thread_symbols = symbols[start_symbol_idx : end_symbol_idx]

            pac_thread = PolygonApiClient(thread_symbols,new_candles, api_key, symbol_type)
            
            thread_list.append(pac_thread)
            print ('create thread with {} symbols'.format(len(thread_symbols)))
        
        for thrd in thread_list:
            thrd.start()
            time.sleep(0.5)

        loop_cnt = 0
        while True:
            if loop_cnt > 30:
                break
            if not new_candles.empty():
                print("======================== loop count: ", loop_cnt)
                while not new_candles.empty():
                    candle = new_candles.get()
                    print(candle)
            loop_cnt += 1
            time.sleep(5)

        for thrd in thread_list:
            thrd.stop()
            time.sleep(1)
        
        print ("end")

                
