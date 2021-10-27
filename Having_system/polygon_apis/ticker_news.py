import sys
sys.path.insert(0, '..')
import pymongo
from datetime import datetime
import requests
import time
import threading
import json
try:
   import queue
except ImportError:
   import Queue as queue

from v_define import MONGO_URL, API_KEY, TICKER_NEWS_DB, TICKER_NEWS_LAST_UPDATE_COL, TICKER_NEWS_META_DATA_COL
from v_define import INTERVALS as intervals
from v_db_models import get_watch_list_symbols
from common import get_symbols

def monitoring():
    all_count = 0
    url = "https://api.polygon.io/v2/reference/news?limit=10&order=descending&sort=published_utc&apiKey=" + API_KEY
    contents = json.loads(requests.get(url).content)
    if contents["status"] == "OK" and len(contents["results"]) > 0:
        content = contents['results'][0]
        for key in content.keys():
            print ('{}: {}'.format(key, content[key]))
        print (type(content['published_utc']))
        all_count += len(contents["results"])
        print (len(contents["results"]))
        print (content)

    print ("all count: ", all_count)

mongoclient = pymongo.MongoClient(MONGO_URL)

class TickerNewsThread(object):
    def __init__(self):

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

    def update_last_put_date(self, last_news_date):
        masterdb = mongoclient[TICKER_NEWS_DB]
        ob_table = masterdb[TICKER_NEWS_LAST_UPDATE_COL]
        news_last_update_date = ob_table.find_one()

        if news_last_update_date is not None:
            object_id = news_last_update_date['_id']
            ob_table.update_one({'_id': object_id},  {'$set': {'last_date': last_news_date}}) 

    def get_last_put_date(self): 
        default_date = datetime.strptime("2010-09-01 00:00:00Z", '%Y-%m-%d %H:%M:%SZ')
        
        masterdb = mongoclient[TICKER_NEWS_DB]
        ob_table = masterdb[TICKER_NEWS_LAST_UPDATE_COL]
        key = 'last_date'
        last_date_doc = ob_table.find_one()
        if last_date_doc is not None:
            if key in last_date_doc.keys():
                return last_date_doc[key]
            else:
                object_id = last_date_doc['_id']
                ob_table.update({'_id': object_id},  {'$set': {key: default_date}}) 
                return default_date
        else:
            news_last_date = dict()
            news_last_date[key] = default_date
                
            ob_table.insert_one(news_last_date)
            return default_date

    def get_news(self, db_last_news_date):
        news = []
        try:
            polygon_url = "https://api.polygon.io/v2/reference/news?limit=1000&order=descending&sort=published_utc&apiKey=" + API_KEY
            datasets = requests.get(polygon_url).json()
            api_news = datasets['results'] if 'results' in datasets else []
            news = []

            for article in api_news:
                article['date'] = datetime.strptime(article['published_utc'], '%Y-%m-%dT%H:%M:%SZ')
                if article['date'] > db_last_news_date:
                    news.append(article)

        except:
            print ("......error in get_news......")

        return news

    def thread_func(self):
        while True:
            if self._stop == True:
                break
            if self.working == False:
                time.sleep(1)
                continue
            db_last_news_date = self.get_last_put_date()

            masterdb = mongoclient[TICKER_NEWS_DB]
            ob_table = masterdb[TICKER_NEWS_META_DATA_COL]
            
            put_news_count = 0
            news = self.get_news(db_last_news_date)

            if len(news) > 0:
                ob_table.insert_many(news)
                put_news_count += len(news)
                last_news_date = news[0]['date']
                self.update_last_put_date(last_news_date)

                print('news count:{}, last news date: {}'.format(put_news_count, last_news_date))
            else:
                pass

            time.sleep(1800)


if __name__ == "__main__":
    start_time = datetime.now()
    thread_count = 1
    thread_list = []

    for idx in range(thread_count):

        news_thread = TickerNewsThread()
        
        thread_list.append(news_thread)
        print ('created thread for news')
    
    for thrd in thread_list:
        thrd.start()
        time.sleep(0.5)

    while True:
        try:
            pass
            time.sleep(1)
        except KeyboardInterrupt:
            break

    for thrd in thread_list:
        thrd.stop()

    time.sleep(20)
    end_time = datetime.now()
    print ('start at: {}, end_at: {}'.format(start_time, end_time))

    


    
