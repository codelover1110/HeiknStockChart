import queue
import time
import threading

from utils import get_candle_fields, get_fields_data
from define import *

output_stream_queue = queue.Queue()
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