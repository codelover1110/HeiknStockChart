import pymongo
from datetime import datetime, timedelta
import pandas as pd 
import requests
import time
import io
import threading
import json
try:
   import queue
except ImportError:
   import Queue as queue

def monitoring():
    symbols = get_symbols()
    # symbol = 'AMZN'
    all_count = 0
    for symbol in symbols:
        url = "https://api.polygon.io/v2/reference/financials/" + symbol + "?limit=2000&apiKey=" + API_KEY
        contents = json.loads(requests.get(url).content)
        if contents["status"] == "OK" and len(contents["results"]) > 0:
            # content = contents['results'][0]
            # for key in content.keys():
            #     print ('{}: {}'.format(key, content[key]))
            all_count += len(contents["results"])
            print (symbol, ":", len(contents["results"]))
    
    print ("all count: ", all_count)

API_KEY = "tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk"

# mongoclient = pymongo.MongoClient('mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority')
# mongoclient = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
mongoclient = pymongo.MongoClient('mongodb://root:!23QweAsd@20.84.64.243:27017')


def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    content = requests.get(url).content
    companies = pd.read_csv(io.StringIO(content.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols


DB_NAME = 'financials_data'

class DailyPutThread(object):
    def __init__(self, symbols):

        self.symbols = symbols
        self.working = False
        self._stop = False

        self.thread_start_time = None         
        self.thread = threading.Thread(target=self.thread_func)

    def start(self):
        self.thread_start_time = time.time()
        if not self.thread.is_alive():
            self.thread.start()
        self.working = True

    def stop(self):
        self._stop = True
        time.sleep(3)
 
    def get_thread_state(self):
        return self.working

    def __del__(self):
        self.thread.join()
        print ("deleted")

    def update_last_put_date(self, symbol, last_candle_date):
        masterdb = mongoclient[DB_NAME]
        ob_table = masterdb['last_update_date']
        symbol_last_update_date = ob_table.find_one({"symbol": symbol})

        if symbol_last_update_date is not None:
            object_id = symbol_last_update_date['_id']
            ob_table.update_one({'_id': object_id},  {'$set': {'last_date': last_candle_date}}) 

    def get_last_put_date(self, symbol): 
        default_date = datetime.strptime("2010-09-01 00:00:00", '%Y-%m-%d %H:%M:%S')
        
        masterdb = mongoclient[DB_NAME]
        ob_table = masterdb['last_update_date']
        key = 'last_date'
        last_date_doc = ob_table.find_one({"symbol": symbol})
        if last_date_doc is not None:
            if key in last_date_doc.keys():
                return last_date_doc[key]
            else:
                object_id = last_date_doc['_id']
                ob_table.update({'_id': object_id},  {'$set': {key: default_date}}) 
                return default_date
        else:
            symbol_last_date = dict()
            symbol_last_date['symbol'] = symbol
            symbol_last_date[key] = default_date
                
            ob_table.insert_one(symbol_last_date)
            return default_date

    def get_new_candles(self, symbol, last_put_date):
        new_candles = []

        try:
            # https://api.polygon.io/v2/reference/financials/AAPL?limit=5&apiKey=*
            polygon_url = "https://api.polygon.io/v2/reference/financials/" + symbol + "?limit=1000&apiKey=" + API_KEY
            datasets = requests.get(polygon_url).json()
            api_candles = datasets['results'] if 'results' in datasets else []
            new_candles = api_candles

        except:
            print ("......error in get_new_candles......")

        return new_candles

    def thread_func(self):
        while True:
            if self._stop == True:
                break
            if self.working == False:
                time.sleep(1)
                continue
            for sym_idx, symbol in enumerate(self.symbols):
                last_put_date = self.get_last_put_date(symbol)

                masterdb = mongoclient[DB_NAME]
                collection_name = 'financials'
                ob_table = masterdb[collection_name]
                
                put_candle_count = 0
                new_candles = self.get_new_candles(symbol, last_put_date)
                put_candles = new_candles

                if len(put_candles) > 0:
                    ob_table.insert_many(put_candles)
                    put_candle_count += len(put_candles)
                last_candle_date = datetime.now()
                self.update_last_put_date(symbol, last_candle_date)

                print('symbol:{}-{}, count:{}'.format(symbol, sym_idx, put_candle_count))
                time.sleep(0.01)
            self.working = False

            time.sleep(1)


if __name__ == "__main__":
    start_time = datetime.now()
    thread_count = 10
    thread_list = []

    symbols = get_symbols()
    symbols.append("")
    # symbols = ["GOOG", "ATVI", "AMD", "MSFT", "AMZN", "NVDA", "TSLA", "AAPL", ""]
    symbol_count = len(symbols)
    print ("symbols: ", symbol_count)

    thread_symbol_count = int(symbol_count / thread_count) + 1
    for idx in range(thread_count):
        start_symbol_idx = thread_symbol_count * idx
        if thread_symbol_count*(idx+1) >= symbol_count:
            end_symbol_idx = symbol_count - 1
        else:
            end_symbol_idx = thread_symbol_count*(idx+1)
        
        thread_symbols = symbols[start_symbol_idx : end_symbol_idx]

        dpc_thread = DailyPutThread(thread_symbols)
        
        thread_list.append(dpc_thread)
        print ('create thread with {} symbols'.format(len(thread_symbols)))
    
    for thrd in thread_list:
        thrd.start()
        time.sleep(0.5)

    proc_time = 0
    while True:
        thread_states = []
        for thrd in thread_list:
            thread_working = thrd.get_thread_state()
            thread_states.append(thread_working)
        if True not in thread_states:
            break
        else:
            print('< {} > {}'.format(proc_time, thread_states))

        time.sleep(5)
        proc_time += 5

    for thrd in thread_list:
        thrd.stop()

    time.sleep(2)
    end_time = datetime.now()
    print ('start at: {}, end_at: {}'.format(start_time, end_time))
    


    
