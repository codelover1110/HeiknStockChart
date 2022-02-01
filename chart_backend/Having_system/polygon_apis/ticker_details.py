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

API_KEY = "tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk"


def monitoring():
    # symbol = 'AMZN'
    url = "https://api.polygon.io/v1/meta/symbols/AAPL/company?apiKey=" + API_KEY
    content = json.loads(requests.get(url).content)
    if 'error' not in content.keys():
        print (content)
    
def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    s = requests.get(url).content
    companies = pd.read_csv(io.StringIO(s.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols


# mongoclient = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
mongoclient = pymongo.MongoClient('mongodb://root:rootUser2021@20.84.64.243:27017')

DB_NAME = 'ticker_details'

class DailyPutThread(object):
    def __init__(self, symbols):

        self.symbols = symbols
        self.working = False
        self._stop = False


        self.thread_start_time = None  
               
        self.min_1_thread = threading.Thread(target=self.thread_func)

    def start(self):
        self.thread_start_time = time.time()
        if not self.min_1_thread.is_alive():
            self.min_1_thread.start()
        
        self.working = True

    def stop(self):
        self._stop = True
        time.sleep(3)
 
    def get_thread_state(self):
        return self.working

    def __del__(self):
        self.min_1_thread.join()
        print ("deleted")

    def get_details(self, symbol):
            # url = "https://api.polygon.io/v1/meta/symbols/" + symbol + "/company?apiKey=" + API_KEY
            url = "https://api.polygon.io/vX/reference/tickers/" + symbol + "?apiKey=" + API_KEY
            try:
                content = json.loads(requests.get(url).content)
                if 'error' not in content.keys():
                    return content
                else:
                    return ""
            except:
                return ""

    def thread_func(self):
        while True:
            if self._stop == True:
                break
            if self.working == False:
                time.sleep(1)
                continue
            for sym_idx, symbol in enumerate(self.symbols):
                masterdb = mongoclient[DB_NAME]
                collection_name = 'ticker_detail_meta_data'
                ob_table = masterdb[collection_name]
                
                symbol_details = self.get_details(symbol)
                if symbol_details != "":
                    ob_table.insert_one(symbol_details)
                    print ('{} - {}'.format(symbol, sym_idx))
                        
                time.sleep(0.01)
            self.working = False

            time.sleep(1)

def read_symbols():
    file_name = '../Update_candles/nasdaq_screener_1633384666001.csv'
    df = pd.read_csv(file_name)
    return df['Symbol'].tolist()

def get_db_symbols():
    masterdb = mongoclient[DB_NAME]
    collection_name = 'ticker_detail_meta_data'
    ob_table = masterdb[collection_name]
    db_symbols = list(ob_table.find({}, {"symbol": 1, "_id": 0}))
    result = []
    for sym in db_symbols:
        result.append(sym['symbol'])
    return result
    

if __name__ == "__main__":
    start_time = datetime.now()
    
    thread_count = 5
    thread_list = []

    # symbols = get_symbols()
    # symbols = ["GOOG", "ATVI", "AMD", "MSFT", "AMZN", "NVDA", "TSLA", "AAPL", ""]
    symbols_8k = read_symbols()
    if False:
        db_symbols = get_db_symbols()
        ns = []
        for sym in symbols_8k:
            if not sym in db_symbols:
                ns.append(sym)
        symbols_8k = ns
    symbol_count = len(symbols_8k)
    print ("symbols: ", symbol_count)
    symbols = symbols_8k

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


    time.sleep(10)
    for thrd in thread_list:
        thrd.stop()

    time.sleep(2)
    end_time = datetime.now()
    print ('start at: {}, end_at: {}'.format(start_time, end_time))
        
    # monitoring()
    # get_published_dates()
