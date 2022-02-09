import eventlet
async_mode = eventlet
import os
import asyncio
from django.http import HttpResponse
import socketio
import time
from threading import Thread
import threading
import requests
import pandas as pd 
import json
import io
try:
   import queue
except ImportError:
   import Queue as queue

# from scanner.db_collector import start_stream, get_updated

# last_symbol_candles = queue.Queue()

# SEND_STREAM = False

sio = socketio.Server(async_mode='eventlet', cors_allowed_origins='*')  


# class StreamSender(object):
#     def __init__(self):
#         # self.symbols = get_symbols()
#         # self.symbols = ["GOOG", "ATVI", "AMD", "MSFT", "AMZN", "NVDA", "TSLA", "AAPL", ""]
#         self.state = False
#         self.thread = threading.Thread(target=self.thread_func)

#     def start(self):
#         if not self.thread.is_alive():
#             self.thread.start()

#     def start_streaming(self):
#         self.state = True

#     def stop_streaming(self):
#         self.state = False

#     def stop(self):
#         self.state = False
#         print("main thread is stopped!")

#     def thread_func(self):
#         while True:
#             if self.state == False:
#                 time.sleep(1)
#                 continue

#             candles = []
#             # if not last_symbol_candles.empty():
#             #     while not last_symbol_candles.empty():
#             #         candle = last_symbol_candles.get()
#             #         candles.append(candle)

#             #     sio.emit('stream_data', {'data': json.dumps(candles)})
#             #     print("-----------&&&&&&&&&&&&&&&&&&&&&&&")
#             # sio.emit('stream_data', {'data': "123"})
#             time.sleep(0.1)

# p_manager = PolygonManager(10)
# p_manager.start()

# sender = StreamSender()
# sender.start()



@sio.event
def connect(sid, environ):
    print('SUCCESFULLY CONNECTED ', sid)
    # start_stream()
    sio.emit('setFilters', {'data': 'foobar'})

@sio.on('start_streaming')
def start_streaming(sid, environ):
    print('start stream ................... ', sid)
    # sender.start_streaming()
    sio.emit('setFilters', {'data': 'foobar'})

@sio.on('testconnect')
def connection_bind(sid, data):
    print ("++++++++ websocket is connected!")
    print("sid:",sid,"data",data)
    return "OK", 123