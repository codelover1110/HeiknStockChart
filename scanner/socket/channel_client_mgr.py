from collections import defaultdict
import queue
import sys, os
import time
import threading
from threading import Thread
from discord import client
from ib_insync import util
from pymongo.message import _do_batched_write_command

from polygon_stream_client import PolygonStream
from utils import Filter as rsi_heik_v1_fitler_1
from db_models import DBManager, get_all_scanner_symbols, get_all_scanner_fields
from utils import get_candle_fields, combine_dict, get_fields_data

stock_websocket = "wss://delayed.polygon.io/stocks"
crypto_websocket = "wss://socket.polygon.io/crypto"
output_stream_queue = queue.Queue()

class ChannelClientManager(object):
    def __init__(self, output_queue):
        self.symbols = ["AMZN"]
        self.fields = None
        self.socket_url = stock_websocket 
        self.input_all_stream_queue = queue.Queue()
        self.db_join_candle_queue = queue.Queue()
        self.output_stream_queue = output_queue
        self.symbol_last_candles = []
        self.channels = []
        self._removing = False
        self._stop = False

        self.polygon_stream_client = None
        self.db_scanner = None

        self.db_join_thread = threading.Thread(target=self.db_join_thread_func)
        self.seperate_stream_thread = threading.Thread(target=self.seperate_stream_to_channels)

        self.init()

    def init(self):
        self.symbols = get_all_scanner_symbols()
        self.symbols.extend(["SQQQ", "PROG", "CEI", "PLTR", "RKLB"])
        default_fields = get_all_scanner_fields()

        for symbol in self.symbols:
            sym_last_candles = dict()
            sym_last_candles['symbol'] = symbol
            sym_last_candles['last_candles'] = []
            self.symbol_last_candles.append(sym_last_candles)

        self.polygon_stream_client = PolygonStream(self.socket_url, self.input_all_stream_queue, self.symbols)
        self.db_scanner = DBManager(self.symbols, default_fields)
    
    def start(self):
        self.polygon_stream_client.start()
        if not self.db_join_thread.is_alive():
            self.db_join_thread.start()
        if not self.seperate_stream_thread.is_alive():
            self.seperate_stream_thread.start()

    def stop(self):
        self._stop = True
        self.polygon_stream_client.stop()
        try:
            time.sleep(1)
            self.db_join_thread.join()
            self.seperate_stream_thread.join()
        except:
            pass

        for channel in self.channels:
            channel.stop()

    def add_new_channel(self, client_info, scanner_info):
        channel_obj = ChannelClient(self.output_stream_queue, scanner_info, client_info)
        channel_obj.start()

        self.channels.append(channel_obj)

    def remove_channel(self, client_info):
        self._removing = True
        for idx, channel_obj in enumerate(self.channels):
            if client_info == channel_obj.get_channel_client_info():
                del self.channels[idx]
                
        self._removing = False

    def reset_channel(self, client_info, scanner_info):
        for idx, channel_obj in enumerate(self.channels):
            if client_info == channel_obj.get_channel_client_info():
                channel_obj.reset_scanner_view(scanner_info)

    def is_removing(self):
        return self._removing

    def find_client_idx(self, client_id):
        for idx, channel_obj in enumerate(self.channels):
            client = channel_obj.get_channel_client_info()
            if client['id'] == client_id:
                return idx
        return -1

    def set_channel_stop(self, client_info):
        for idx, channel_obj in enumerate(self.channels):
            if client_info == channel_obj.get_channel_client_info():
                channel_obj.stop()

    def join_db_data(self, candle):
        symbol = candle['symbol']
        for idx, sym_last_candles in enumerate(self.symbol_last_candles):
            if sym_last_candles['symbol'] == symbol:
                last_candles = sym_last_candles['last_candles']
                last_candles.append(candle)
                if len(last_candles) > 24:
                    df = util.df(last_candles)
                    last_candle = rsi_heik_v1_fitler_1(df)
                    symbol_preload = self.db_scanner.get_symbol_preload(symbol)
                    
                    update_item = dict()
                    update_item['symbol'] = symbol
                    update_item['data'] = combine_dict(last_candle, symbol_preload)
                    self.db_join_candle_queue.put(update_item)
                    

                    self.symbol_last_candles[idx]['last_candles'] = last_candles[-24:]
                else:
                    self.symbol_last_candles[idx]['last_candles'] = last_candles

    def db_join_thread_func(self):
        
        while True:
            if self._stop:
                break
            if not self.input_all_stream_queue.empty():
                while not self.input_all_stream_queue.empty():
                    candle = self.input_all_stream_queue.get()
                    self.join_db_data(candle)

            time.sleep(0.5)

    def seperate_stream_to_channels(self):
        while True:
            if self._stop:
                break
            if not self.db_join_candle_queue.empty():
                while not self.db_join_candle_queue.empty():
                    db_candle = self.db_join_candle_queue.get()
                    for channel_obj in self.channels:
                        if db_candle['symbol'] in channel_obj.get_channel_symbols():
                            channel_obj.put_db_joined_candle(db_candle.copy())

            time.sleep(0.5)

class ChannelClient(object):
    def __init__(self, output_queue, scanner_info, client_info):
        self.symbols = scanner_info['symbols']
        self.fields = scanner_info['fields']
        self.client_info = client_info
        self.channel_input_queue = queue.Queue()
        self.output_stream_queue = output_queue
        self._stop = False

        self.filter_thread = threading.Thread(target=self.filter_func)
    
    def start(self):
        if not self.filter_thread.is_alive():
            self.filter_thread.start()

    def stop(self):
        self._stop = True
        try:
            time.sleep(0.2)
            self.filter_func.join()
        except:
            pass

    def reset_scanner_view(self, scanner_info):
        self.symbols = scanner_info['symbols']
        self.fields = scanner_info['fields']

    def get_channel_symbols(self):
        return self.symbols

    def get_channel_client_info(self):
        return self.client_info

    def put_db_joined_candle(self, candle):
        self.channel_input_queue.put(candle)

    def filter_candle(self, candle):
        candle_data = candle['data']
        candle_fields = get_candle_fields()
        try:
            candle_fields.extend(get_fields_data(self.fields, 'Stock Financials'))
            candle_fields.extend(get_fields_data(self.fields, 'Ticker Details'))
        except:
            self.fields

        del_keys = []
        for key in candle_data.keys():
            if not key in candle_fields:
                del_keys.append(key)
        [candle_data.pop(key) for key in del_keys]

        candle['data'] = candle_data
        candle['client'] = self.client_info
        return candle
        
    def filter_func(self):
        while True:
            if self._stop:
                break
            if not self.channel_input_queue.empty():
                while not self.channel_input_queue.empty():
                    candle = self.channel_input_queue.get()
                    filtered_candle = self.filter_candle(candle)
                    self.output_stream_queue.put(filtered_candle)

            time.sleep(0.1)

if __name__ == "__main__":
    if False:
        client_info = {
            "id": 1,
            'handler': 'handler',
            'address': ('234.23.12.42', 8382)
        }
        scanner_info = {
            'chart_number': '1',
            'symbols': ["SQQQ", "PROG"],
            'fields': ['rsi', 'ris2', 'rsi3', 'heik', 'heik2']
        }

        client_info2 = {
            "id": 2,
            'handler': 'handler',
            'address': ('234.23.12.42', 8382)
        }
        scanner_info2 = {
            'chart_number': '1',
            'symbols': ['AMD', 'TSLA'],
            'fields': ['rsi', 'ris2', 'rsi3', 'heik', 'heik2']
        }

        cc_mgr = ChannelClientManager(output_stream_queue)
        cc_mgr.start()

        time.sleep(20)
        cc_mgr.add_new_channel(client_info, scanner_info)

        time.sleep(20)
        cc_mgr.add_new_channel(client_info2, scanner_info2)

        while True:
            try:
                if not output_stream_queue.empty():
                    while not output_stream_queue.empty():
                        symbol_update = output_stream_queue.get()
                        print(symbol_update['symbol'], ":", symbol_update['client'])
                time.sleep(0.01)

            except KeyboardInterrupt:
                print("****** channel manager stopped! ******")
                cc_mgr.stop()
                sys.exit(0)

        
