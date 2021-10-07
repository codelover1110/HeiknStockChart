from collections import defaultdict
import queue
import sys, os
import time
import threading
from threading import Thread
from ib_insync import util

from polygon_stream_client import PolygonStream
from utils import Filter as rsi_heik_v1_fitler_1
from db_models import DBManager
from utils import get_fields_data, combine_dict

polygon_websocket = "wss://delayed.polygon.io/stocks"
symbol_update_queue = queue.Queue()

class ScannerClient(object):
    def __init__(self, socket_url, update_queue, symbols="AMZN", scanner_info=None, client_info=None):
        self.symbols = symbols
        self.socket_url = socket_url 
        self.stream_queue = queue.Queue()
        self.client_info = client_info      # {'id': 1, 'handler': handler, 'address': (host, port)}
        self.scanner_info = scanner_info    # {'chart_number': 1, 'symbols': ["AMZN"], 'fields': ['rsi', 'rsi2']}
        self.symbol_last_candles = []
        self.symbol_updates_queue = update_queue
        self.polygon_stream_client = None
        self.db_scanner = None
        self.pre_load_scanner = None

        self.update_thread = threading.Thread(target=self.update_func)

        self.init()

    def init(self):
        self.polygon_stream_client = PolygonStream(self.socket_url, self.stream_queue, self.symbols)

        for symbol in self.symbols:
            sym_last_candles = dict()
            sym_last_candles['symbol'] = symbol
            sym_last_candles['last_candles'] = []
            self.symbol_last_candles.append(sym_last_candles)

        if self.db_scanner is None:
            self.db_scanner = DBManager(self.symbols, self.scanner_info['fields'])
        else:
            self.db_scanner.reset_fields(self.symbols, self.scanner_info['fields'])
        self.pre_load_scanner = self.db_scanner.scanner_preload()
    
    def start(self):
        self.polygon_stream_client.start()
        if not self.update_thread.is_alive():
            self.update_thread.start()

    def stop(self):
        self.polygon_stream_client.stop()

    def reset(self, new_scanner_info):
        self.polygon_stream_client.stop()
        time.sleep(1)
        self.polygon_stream_client = None
        while not self.stream_queue.empty():
            self.stream_queue.get()
        self.symbol_last_candles = []
        
        self.symbols = new_scanner_info['symbols']
        self.scanner_info = new_scanner_info
        self.init()
        self.start()

    def get_scanner_info(self):
        return self.scanner_info
  
    def filter_fields(self, rsi_candle):
        default_fields = ['rsi', 'rsi2', 'rsi3', 'heik', 'heik2', 'rsi_color', 'rsi2_color', 'rsi3_color', 'heik_color', 'hiek2_color']
        filtered = dict()
        fields = get_fields_data(self.scanner_info['fields'], 'Indicators')
        for field in fields:
            if field in rsi_candle.keys():
                filtered[field] = rsi_candle[field]

        fields = get_fields_data(self.scanner_info['fields'], 'Trade Details')
        for field in fields:
            if field in rsi_candle.keys():
                filtered[field] = rsi_candle[field]
        
        for field in default_fields:
            if field not in fields:
                filtered[field] = rsi_candle[field]
        return filtered

    def get_symbol_preload(self, symbol):
        for pre_load in self.pre_load_scanner:
            if pre_load['symbol'] == symbol:
                return pre_load['data']

    def update_symbol_data(self, candle):
        symbol = candle['symbol']
        for idx, sym_last_candles in enumerate(self.symbol_last_candles):
            if sym_last_candles['symbol'] == symbol:
                last_candles = sym_last_candles['last_candles']
                last_candles.append(candle)
                if len(last_candles) > 24:
                    df = util.df(last_candles)
                    last_candle = rsi_heik_v1_fitler_1(df)
                    
                    update_item = dict()
                    update_item['symbol'] = symbol
                    symbol_preload = self.get_symbol_preload(symbol)
                    update_item['data'] = combine_dict(symbol_preload, self.filter_fields(last_candle))
                    update_item['client'] = self.client_info
                    self.symbol_updates_queue.put(update_item)

                    self.symbol_last_candles[idx]['last_candles'] = last_candles[-24:]
                else:
                    self.symbol_last_candles[idx]['last_candles'] = last_candles

    def update_func(self):
        while True:
            if not self.stream_queue.empty():
                while not self.stream_queue.empty():
                    candle = self.stream_queue.get()
                    self.update_symbol_data(candle)

            time.sleep(1)
                    
if __name__ == "__main__":
    if False:
        symbols_1 = ["HORSE", "CAT", "PIG", "DOG"]
        symbols_2 = ["AMZN", "GOOG", "AAPL", "ATVI"]
        sc_1 = ScannerClient(polygon_websocket, symbol_update_queue, symbols_1)
        sc_1.start()
        sc_2 = ScannerClient(polygon_websocket, symbol_update_queue, symbols_2)
        sc_2.start()

        while True:
            try:
                if not symbol_update_queue.empty():
                    while not symbol_update_queue.empty():
                        symbol_update = symbol_update_queue.get()
                        print(symbol_update['symbol'])
                time.sleep(0.01)

            except KeyboardInterrupt:
                sc_1.stop()
                sc_2.stop()
                sys.exit(0)

