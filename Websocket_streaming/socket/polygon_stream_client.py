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
from datetime import datetime, timedelta

try:
   import queue
except ImportError:
   import Queue as queue

from define import *
stream_candles = queue.Queue()

API_KEY_CRYPTO = 'tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk'
API_KEY_STOCK = 'tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk'

stock_websocket = "wss://delayed.polygon.io/stocks"
crypto_websocket = "wss://socket.polygon.io/crypto"

def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    content = requests.get(url).content
    companies = pd.read_csv(io.StringIO(content.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols

        

################### websocket client for polygon ####################
class PolygonStream(object):
    def __init__(self, socket_url, candle_queue, symbols=["AMZN"], symbol_type=SYMBOL_TYPE_STOCK):
        self.symbols = symbols
        self.symbol_type = symbol_type
        self.candle_queue = candle_queue
        self.tickers = self.make_symbol_params(symbols)
        self._stop = False
        self.ws = websocket.WebSocketApp(
            socket_url, 
            on_open=self.on_open, 
            on_message=self.on_message,
            on_close=self.on_close,
            on_error=self.on_error
        )

        self.ws_thread = threading.Thread(target=self.ws.run_forever)
    
    def start(self):
        self.ws_thread.deamon = True
        self.ws_thread.start()

    def stop(self):
        self.ws.close()
        self._stop = True

    def make_symbol_params(self, symbols):
        last_symbol = symbols[-1]
        param = ''
        for idx, symbol in enumerate(symbols):
            if idx == len(symbols)-1:
                break

            if self.symbol_type == SYMBOL_TYPE_STOCK:
                param += "A."+symbol+","
            elif self.symbol_type == SYMBOL_TYPE_CRYPTO:
                param += "XA."+symbol+"-USD" + ","
        if self.symbol_type == SYMBOL_TYPE_STOCK:
            param += "A."+last_symbol
        elif self.symbol_type == SYMBOL_TYPE_CRYPTO:
            param += "XA."+last_symbol+"-USD"
        
        return param

    def put_queue(self, candles):
        if not self._stop:
            for candle in candles:
                if self.symbol_type == SYMBOL_TYPE_STOCK:
                    candle['symbol'] = candle['sym']
                    del candle['sym']
                elif self.symbol_type == SYMBOL_TYPE_CRYPTO:
                    candle['symbol'] = candle['pair']
                    del candle['pair']
                self.candle_queue.put(candle)
                if self.candle_queue.qsize() > 10000:
                    self.candle_queue.get()

    def make_test_quote(self, specific_symbol=None):
        symbol_cnt = len(self.symbols)
        sym_idx = random.randint(0, symbol_cnt-1)
        symbol = ""
        if specific_symbol is not None:
            symbol = specific_symbol
        else:
            symbol = self.symbols[sym_idx]
        candle_count = random.randint(1, 5)
        result = []
        # for i in range(candle_count):
        fake_candle = {
            "ev": "A",
            "sym": symbol,
            "pair": symbol+"-USD", 
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
        fake_candle['date'] = str(datetime.fromtimestamp(fake_candle['t']/1000) - timedelta(hours=2))
        result.append(fake_candle)
        return result

    def fill_date_field(self, candles):
        result = []
        for candle in candles:
            candle['date'] = str(datetime.fromtimestamp(candle['t']/1000) - timedelta(hours=2))
            result.append(candle)
        return result

    def buffering_symbols(self):
        print (self.symbol_type, " buffering start ...")
        for symbol in self.symbols:
            for i in range(25):
                candles = self.make_test_quote(specific_symbol=symbol)
                self.put_queue(candles)
            time.sleep(0.01)
        print (self.symbol_type, " buffering end!")

    def on_open(self, ws):
        print ("opened")
        api_key = ""
        if self.symbol_type == SYMBOL_TYPE_STOCK:
            api_key = API_KEY_STOCK
        elif self.symbol_type == SYMBOL_TYPE_CRYPTO:
            api_key = API_KEY_CRYPTO
        auth_data = {
            "action": "auth",
            "params": api_key
        }

        ws.send(json.dumps(auth_data))

        channel_data = {
            "action": "subscribe",
            "params": self.tickers  #"XA.*"
        }
        ws.send(json.dumps(channel_data))

        self.buffering_symbols()

        if False:
            while True:
                candles = self.make_test_quote()
                self.put_queue(candles)
                time.sleep(0.01)

    def on_message(self, ws, message):
        candles = list(eval(message))
        candles = self.fill_date_field(candles)
        self.put_queue(candles)
        

    def on_error(self, ws, error):
        print (error)

    def on_close(self, we):
        print ("closed connection!")

################### websocket server for client ###################

async def handler(websocket, path):
    while True:
        candles = []
        if not stream_candles.empty():
            while not stream_candles.empty():
                candle = stream_candles.get()
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
        symbols1 = ['GOOG'] # ['BTC', 'ETH', 'DOGE', 'BCH', 'LTC']
        # symbols = get_symbols()

        ps = PolygonStream(crypto_websocket, stream_candles, symbols1, symbol_type=SYMBOL_TYPE_STOCK)
        ps.start()

        cnt = 0
        while True:
            try:
                if not stream_candles.empty():
                    while not stream_candles.empty():
                        candle = stream_candles.get()
                        print (candle['symbol'])
                        cnt += 1
                if cnt != 0 and cnt%100==0:
                    print ('queue_side: {}, all_count: {}'.format(stream_candles.qsize(), cnt))
                
                time.sleep(0.01)

            except KeyboardInterrupt:
                ps.stop()
                time.sleep(1)
                sys.exit(0)


