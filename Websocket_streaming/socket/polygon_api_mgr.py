from datetime import datetime, timedelta
from logging import lastResort
import time
import threading

try:
   import queue
except ImportError:
   import Queue as queue

from define import SYMBOL_TYPE_CRYPTO, SYMBOL_TYPE_STOCK
from polygon_api_client import PolygonApiClient

new_candles = queue.Queue()
api_key = 'tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk'

class PolygonApiClientManager(object):
    def __init__(self, symbols, input_candle_queue, api_key, symbol_type=SYMBOL_TYPE_STOCK, interval=['1', 'minute']):
        self.symbols = symbols
        self.input_candle_queue = input_candle_queue
        self.api_key = api_key
        self.symbol_type = symbol_type
        self.interval = interval
        self._stop = False

        self.client_symbol_count = 30
        self.api_client_list = []

        self.thread = threading.Thread(target=self.thread_func)
        
        self.init()
    
    def init(self):
        self.symbols.append("")
        thread_count = int(len(self.symbols)/self.client_symbol_count) + 1
        for idx in range(thread_count):
            start_symbol_idx = self.client_symbol_count * idx
            if self.client_symbol_count*(idx+1) >= len(self.symbols):
                end_symbol_idx = len(self.symbols) - 1
            else:
                end_symbol_idx = self.client_symbol_count * (idx+1)

            client_symbols = self.symbols[start_symbol_idx : end_symbol_idx]
            pac_thread = PolygonApiClient(client_symbols, self.input_candle_queue, self.api_key, self.symbol_type)
            self.api_client_list.append(pac_thread)
            print ('create thread with {} symbols'.format(len(client_symbols)))

    def start(self):
        for thrd in self.api_client_list:
            thrd.start()
            time.sleep(0.5)

        # if not self.thread.is_alive():
        #     self.thread.start()

    def stop(self):
        for thrd in self.api_client_list:
            thrd.stop()
            time.sleep(0.5)

        self._stop = True
 
    def __del__(self):
        # self.thread.join()
        print ("deleted")

    def thread_func(self):
        while True:
            if self._stop == True:
                break
            if not self.input_candle_queue.empty():
                while not self.input_candle_queue.empty():
                    candle =self.input_candle_queue.get()
                    print (candle)
            time.sleep(1)

if __name__ == "__main__":
    if False:
        symbols = ["ETH","BTC", "DOGE", "BCH", "LTC"]
        # symbols = ["AXP", "V", "COST", "KO", "BAC"]
        symbol_type = SYMBOL_TYPE_CRYPTO
        pac_mgr = PolygonApiClientManager(symbols, new_candles, api_key, symbol_type=SYMBOL_TYPE_CRYPTO)
        pac_mgr.start()
        time.sleep(30)
        pac_mgr.stop()
        print("end")
  

                
