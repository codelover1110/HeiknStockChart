import asyncio
from threading import Thread
import time
import random
import websockets
import json
import io
import requests
import threading
import pandas as pd 

from scanner.scanner.crawller import PolygonCrawller, intervals


try:
   import queue
except ImportError:
   import Queue as queue

trigger_queue = queue.Queue()
last_symbol_candles = queue.Queue()
buy_list = []

API_KEY = 'tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk'

def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    s = requests.get(url).content
    companies = pd.read_csv(io.StringIO(s.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols

class PolygonManager(object):
    def __init__(self, thread_cnt=1):
        self.interval = ['1', 'minute']
        self.thread_count = thread_cnt
        self.thread_list = []
        self.state = False
        # self.symbols = get_symbols()
        self.symbols = ["GOOG", "ATVI", "AMD", "MSFT", "AMZN", "NVDA", "TSLA", "AAPL", ""]
    
        self.thread = threading.Thread(target=self.thread_func)

        self.init()

    def init(self):
        symbol_count = len(self.symbols)
        print ("symbols: ", symbol_count)

        thread_symbol_count = int(symbol_count / self.thread_count) + 1
        for idx in range(self.thread_count):
            start_symbol_idx = thread_symbol_count * idx
            if thread_symbol_count*(idx+1) >= symbol_count:
                end_symbol_idx = symbol_count - 1
            else:
                end_symbol_idx = thread_symbol_count*(idx+1)
            
            thread_symbols = self.symbols[start_symbol_idx : end_symbol_idx]

            pc_thread = PolygonCrawller(thread_symbols, self.interval, last_symbol_candles, db_update=True)
            
            self.thread_list.append(pc_thread)
            print ('create thread with {} symbols'.format(len(thread_symbols)))
    
    def start(self):
        for thrd in self.thread_list:
            thrd.start()
            time.sleep(0.1)

        self.state = True
        if not self.thread.is_alive():
            self.thread.start()
        

    def stop(self):
        for thrd in self.thread_list:
            thrd.stop()
        time.sleep(2)
        self.state = False
        print("main thread is stopped!")

    def thread_func(self):

        while True:
            if self.state == False:
                break
            for item in intervals:
                proc_time = 0
                while True:
                    if self.state == False:
                        break
                    thread_states = []
                    for thrd in self.thread_list:
                        thread_working = thrd.get_thread_state()
                        thread_states.append(thread_working)
                    if True not in thread_states:
                        for thrd in self.thread_list:
                            thrd.set_interval(item[0], item[3])
                        break
                    else:
                        print('< {} > {}'.format(proc_time, thread_states))

                    time.sleep(5)
                    proc_time += 5
            time.sleep(1)

async def handler(websocket, path):
    while True:
        candles = []
        if not last_symbol_candles.empty():
            while not last_symbol_candles.empty():
                candle = last_symbol_candles.get()
                print ("web-socket => ", candle)
                candles.append(candle)
            await websocket.send(json.dumps(candles))
        await asyncio.sleep(1)

def start_stream_loop(loop, server):
    loop.run_until_complete(server)
    loop.run_forever()

def start_stream():
    p_manager = PolygonManager(5)
    p_manager.start()

    send_loop = asyncio.new_event_loop()
    start_server = websockets.serve(handler, "127.0.0.1", 9999, loop=send_loop)
    t1 = Thread(target=start_stream_loop, args=(send_loop, start_server))
    t1.start()

    if False:
        start_server = websockets.serve(handler, "127.0.0.1", 8888)
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()

def start_stream_db():
    p_manager = PolygonManager(5)
    p_manager.start()

def get_updated():
    candles = []    
    if not last_symbol_candles.empty():
        while not last_symbol_candles.empty():
            candle = last_symbol_candles.get()
            candles.append(candle)
    
    return candles
if __name__ == "__main__":
#     start_stream()
    print ("start")
