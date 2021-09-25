import sys, os
import asyncio
from threading import Thread
import time
import random
import json
import pandas as pd 
import pymongo
import websockets

from scanner.crawller import PolygonCrawller, intervals

try:
   import queue
except ImportError:
   import Queue as queue

trigger_queue = queue.Queue()
last_symbol_candles = queue.Queue()
buy_list = []

# MONGO_URL = 'mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority'
MONGO_URL = 'mongodb://root:%2123QweAsd@20.84.64.243:27017'

mongoclient = pymongo.MongoClient(MONGO_URL)
masterdb = mongoclient['stock_market_data']

def start_stream_loop(loop, server):
    loop.run_until_complete(server)
    loop.run_forever()

async def handler(websocket, path):
    while True:
        candles = []
        if not trigger_queue.empty():
            while not trigger_queue.empty():
                candle = trigger_queue.get()
                candles.append(candle)
            await websocket.send(json.dumps(candles))
        await asyncio.sleep(3)


def start_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

def insert_change_stream():
    print("Insert listener thread started.")
    trade_collection = masterdb['backtest_1_minute']

    # Change stream pipeline
    pipeline = [
        {'$match': {'operationType': 'insert'}}
    ]
    try:
        for document in trade_collection.watch(pipeline=pipeline, full_document='updateLookup'):
            doc = document['fullDocument']
            item = dict()
            item['v'] = doc['v']
            item['vw'] = doc['vw']
            item['o'] = doc['o']
            item['c'] = doc['c']
            item['h'] = doc['h']
            item['l'] = doc['l']
            item['n'] = doc['n']
            item['date'] = str(doc['date'])
            candle = dict()
            candle['symbol'] = doc['stock']
            candle['data'] = item
            print (candle)

            trigger_queue.put(candle)

    except KeyboardInterrupt:
        keyboard_shutdown()

def keyboard_shutdown():
    print('Interrupted\n')
    try:
        sys.exit(0)
    except SystemExit:
        os._exit(0)

def start_streaming():
    insert_loop = asyncio.new_event_loop()
    insert_loop.call_soon_threadsafe(insert_change_stream)
    t = Thread(target=start_loop, args=(insert_loop,))
    t.start()
    time.sleep(0.25)

    send_loop = asyncio.new_event_loop()
    start_server = websockets.serve(handler, "127.0.0.1", 8888, loop=send_loop)
    t1 = Thread(target=start_stream_loop, args=(send_loop, start_server))
    t1.start()

    if False:
        start_server = websockets.serve(handler, "127.0.0.1", 8888)
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()

if __name__ == "__main__":
    start_streaming()