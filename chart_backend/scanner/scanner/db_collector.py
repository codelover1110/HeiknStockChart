import sys, os
import asyncio
from threading import Thread
import time
import json
import pandas as pd 
import pymongo
import websockets
from scanner.models import get_scanner_initials

try:
   import queue
except ImportError:
   import Queue as queue

trigger_queue = queue.Queue()
last_symbol_candles = queue.Queue()
buy_list = []
soc_obj_list = []
initical_scanner_data = get_scanner_initials()

# MONGO_URL = 'mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority'
MONGO_URL = 'mongodb://root:rootUser2021@20.84.64.243:27018/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false'

mongoclient = pymongo.MongoClient(MONGO_URL)
masterdb = mongoclient['stock_market_data']

def start_stream_loop(loop, server):
    loop.run_until_complete(server)
    loop.run_forever()

async def show_websocket(wsp):
    print ('remote_address:',  wsp.remote_address)
    print ('local address:', wsp.local_address)
    print ('open:', wsp.open)
    # print ('state_name:', wsp.state_name)    # CONNECTING, OPEN, CLOSEING, CLOSED



async def handler(websocket, path):
    print ("000000000000000000000", websocket)
    # await websocket.recv()
    if websocket not in soc_obj_list:
        candles = []
        for data in initical_scanner_data:
            # print (data)
            rsi_candle = data['rsi_candle']
            item = dict()
            item['v'] = rsi_candle['v']
            item['vw'] = rsi_candle['vw']
            item['o'] = rsi_candle['o']
            item['c'] = rsi_candle['c']
            item['h'] = rsi_candle['h']
            item['l'] = rsi_candle['l']
            item['n'] = rsi_candle['n']
            item['rsi'] = rsi_candle['RSI']
            item['rsi_side'] = rsi_candle['side']
            item['rsi2'] = rsi_candle['rsi2']['bearPower']
            item['rsi2_color'] = rsi_candle['rsi2']['color']
            item['rsi3'] = rsi_candle['rsi3']['bearPower']
            item['rsi3_color'] = rsi_candle['rsi3']['color']
            item['heik'] = rsi_candle['heik']['bearPower']
            item['heik_color'] = rsi_candle['heik']['color']
            item['heik2'] = rsi_candle['heik2']['bearPower']
            item['heik2_color'] = rsi_candle['heik2']['color']
            item['date'] = str(rsi_candle['date'])
            candle = dict()
            candle['symbol'] = data['symbol']   
            candle['data'] = item
            candles.append(candle)

            print ("send initials for ", data['symbol'])
            soc_obj_list.append(websocket)
        await websocket.send(json.dumps(candles))
    else:
        pass
    
    while True:
        candles = []
        if not trigger_queue.empty():
            while not trigger_queue.empty():
                candle = trigger_queue.get()
                candles.append(candle)
                await websocket.send(json.dumps(candles))
                await show_websocket(websocket)
            if websocket.open:
                await websocket.send(json.dumps(candles))
            else:
                await websocket.close()
                print ("web socket is closed!")
        await asyncio.sleep(3)


def start_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

def insert_change_stream():
    print("Mongodb change stream insert listener thread started.")
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

def update_change_stream():
    print("Mongodb change stream update listener thread started.")
    db = mongoclient['scanner']
    db_collection = db['scanner_value']

    # update stream pipeline
    pipeline = [
        {'$match': {'operationType': 'update'}}
    ]
    try:
        for document in db_collection.watch(pipeline=pipeline, full_document='updateLookup'):
            doc = document['fullDocument']
            if 'rsi_candle' in doc.keys():
                rsi_candle = doc['rsi_candle']
                item = dict()
                item['v'] = rsi_candle['v']
                item['vw'] = rsi_candle['vw']
                item['o'] = rsi_candle['o']
                item['c'] = rsi_candle['c']
                item['h'] = rsi_candle['h']
                item['l'] = rsi_candle['l']
                item['n'] = rsi_candle['n']
                item['rsi'] = rsi_candle['RSI']
                item['rsi_side'] = rsi_candle['side']
                item['rsi2'] = rsi_candle['rsi2']['bearPower']
                item['rsi2_color'] = rsi_candle['rsi2']['color']
                item['rsi3'] = rsi_candle['rsi3']['bearPower']
                item['rsi3_color'] = rsi_candle['rsi3']['color']
                item['heik'] = rsi_candle['heik']['bearPower']
                item['heik_color'] = rsi_candle['heik']['color']
                item['heik2'] = rsi_candle['heik2']['bearPower']
                item['heik2_color'] = rsi_candle['heik2']['color']
                item['date'] = str(rsi_candle['date'])
                candle = dict()
                candle['symbol'] = doc['symbol']   
                candle['data'] = item
                # print ("db-trigger => ", rsi_candle)

                trigger_queue.put(candle)

    except KeyboardInterrupt:
        keyboard_shutdown()

def keyboard_shutdown():
    print('Interrupted\n')
    try:
        sys.exit(0)
    except SystemExit:
        os._exit(0)

def start_stream():
    insert_loop = asyncio.new_event_loop()
    insert_loop.call_soon_threadsafe(update_change_stream)
    t = Thread(target=start_loop, args=(insert_loop,))
    t.start()
    time.sleep(0.25)

    send_loop = asyncio.new_event_loop()
    start_server = websockets.serve(handler, "127.0.0.1", 9999, loop=send_loop)
    t1 = Thread(target=start_stream_loop, args=(send_loop, start_server))
    t1.start()

    if False:
        start_server = websockets.serve(handler, "127.0.0.1", 8888)
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()

def get_updated():
    candles = []
    if not trigger_queue.empty():
        while not trigger_queue.empty():
            candle = trigger_queue.get()
            candles.append(candle)
    return candles

# if __name__ == "__main__":
#     start_stream()