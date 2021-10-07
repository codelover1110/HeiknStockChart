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

API_KEY = "DIO3MPDF44RL6MOF"


def monitoring():
    symbol = "AAME"
    url = f"https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey=" + API_KEY
    content = json.loads(requests.get(url).content)
    if content is not {}:
        print (content)
    
def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    s = requests.get(url).content
    companies = pd.read_csv(io.StringIO(s.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols

# mongoclient = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
mongoclient = pymongo.MongoClient('mongodb://root:rootUser2021@20.84.64.243:27017')

DB_NAME = 'floats'

class FloatsPutThread(object):
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

    def get_floats(self, symbol):
            url = f"https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey=" + API_KEY
            content = json.loads(requests.get(url).content)
            if content is not {}:
                return content
            else:
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
                collection_name = 'floats_details'
                ob_table = masterdb[collection_name]
                
                floats_details = self.get_floats(symbol)
                if floats_details != "":
                    ob_table.insert_one(floats_details)
                    print ('{} - {}'.format(symbol, sym_idx))
                        
                time.sleep(0.01)
            self.working = False

            time.sleep(1)

def read_symbols():
    file_name = '../Update_candles/nasdaq_screener_1633384666001.csv'
    df = pd.read_csv(file_name)
    return df['Symbol'].tolist()

if __name__ == "__main__":
    start_time = datetime.now()
    
    thread_count = 10
    thread_list = []

    symbols = read_symbols()
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

        dpc_thread = FloatsPutThread(thread_symbols)
        
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

    # monitoring()
    


    
