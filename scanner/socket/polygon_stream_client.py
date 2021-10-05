import sys, os
import requests
import websocket, json
import time
import threading
from threading import Thread
import asyncio
import websockets
import pandas as pd
import io
import random
from datetime import datetime

try:
   import queue
except ImportError:
   import Queue as queue

stream_candles = queue.Queue()

API_KEY = 'KFiYTNFlVvNCqBK12l0Gs322fZcenL2T'
socket = "wss://delayed.polygon.io/stocks"

def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    content = requests.get(url).content
    companies = pd.read_csv(io.StringIO(content.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols

################### websocket client for polygon ####################
class PolygonStream(object):
    def __init__(self, socket_url, candle_queue, symbols="AMZN"):
        self.symbols = symbols
        self.candle_queue = candle_queue
        self.tickers = self.make_symbol_params(symbols)
        self._stop = False
        self.ws = websocket.WebSocketApp(
            socket_url, 
            on_open=self.on_open, 
            on_message=self.on_message,
            on_close=self.on_close
        )

        self.ws_thread = threading.Thread(target=self.ws.run_forever)
    
    def start(self):
        self.ws_thread.deamon = True
        self.ws_thread.start()

    def stop(self):
        self.ws.close()
        self._stop = True

    def make_symbol_params(self, symbols):
        param = ''
        for idx, symbol in enumerate(symbols):
            if idx == len(symbols)-1:
                break
            param += "A."+symbol +","
        param += "A." + symbol
        
        return param

    def put_queue(self, candles):
        if not self._stop:
            for candle in candles:
                candle['symbol'] = candle['sym']
                del candle['sym']
                self.candle_queue.put(candle)
                if self.candle_queue.qsize() > 1000:
                    self.candle_queue.get()

    def make_test_quote(self):
        symbol_cnt = len(self.symbols)
        sym_idx = random.randint(0, symbol_cnt-1)
        candle_count = random.randint(1, 5)
        result = []
        for i in range(candle_count):
            fake_candle = {
                "ev": "A",
                "sym": self.symbols[sym_idx],
                "v": random.randint(3300, 4000),
                "av": random.randint(490293, 840293),
                "op": random.randint(1, 10),
                "vw": random.randint(10, 30),
                "o": random.randint(30, 50),
                "c": random.randint(50, 70),
                "h": random.randint(70, 90),
                "l": random.randint(90, 110),
                "a": random.randint(110, 130),
                "z": random.randint(100, 1000),
                "s": random.randint(1610044640000, 1610544640000),
                "e": random.randint(1610044700000, 1610544700000),
            }
            fake_candle['date'] = str(datetime.fromtimestamp(int(fake_candle['s']/1000)))
            result.append(fake_candle)
        return result

    def file_date_field(self, candles):
        result = []
        for candle in candles:
            candle['date'] = str(datetime.fromtimestamp(int(candle['s']/1000)))
            result.append(candle)
        return result

    def on_open(self, ws):
        print ("opened")
        auth_data = {
            "action": "auth",
            "params": API_KEY
        }

        ws.send(json.dumps(auth_data))

        channel_data = {
            "action": "subscribe",
            "params": self.tickers # "A.*"
        }
        # ws.send(json.dumps(channel_data))

        if True:
            while True:
                candles = self.make_test_quote()
                self.put_queue(candles)
                time.sleep(0.5)

    def on_message(self, ws, message):
        # print(message)
        candles = list(eval(message))
        candles = self.file_date_field(candles)
        self.put_queue(candles)

    def on_close(self, we):
        print ("closed connection!")

################### websocket server for client ###################

async def handler(websocket, path):
    while True:
        candles = []
        if not stream_candles.empty():
            while not stream_candles.empty():
                candle = stream_candles.get()
                print ("web-socket => ", candle)
                candles.append(candle)
            await websocket.send(json.dumps(candles))
        await asyncio.sleep(1)

def start_stream_loop(loop, server):
    loop.run_until_complete(server)
    loop.run_forever()

def start_stream():
    send_loop = asyncio.new_event_loop()
    start_server = websockets.serve(handler, "127.0.0.1", 9999, loop=send_loop)
    t1 = Thread(target=start_stream_loop, args=(send_loop, start_server))
    t1.start()


if __name__=="__main__":
    if False:
        symbols = ["SQQQ", "PROG"]
        symbols1 = ['AMZN', 'MSFT']
        # symbols = get_symbols()

        ps = PolygonStream(socket, stream_candles, symbols)
        ps.start()

        cnt = 0
        while True:
            try:
                if not stream_candles.empty():
                    while not stream_candles.empty():
                        candle = stream_candles.get()
                        print (candle)
                        cnt += 1
                if cnt != 0 and cnt%100==0:
                    print ('queue_side: {}, all_count: {}'.format(stream_candles.qsize(), cnt))
                
                time.sleep(0.01)

            except KeyboardInterrupt:
                ps.stop()
                time.sleep(1)
                sys.exit(0)


