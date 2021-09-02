import os
import sys
from datetime import datetime,date
import pymongo
import csv
import time
import dotenv

dotenv_file = dotenv.find_dotenv()
dotenv.load_dotenv(dotenv_file)

MONGO_URL = os.environ['MONGO_URL_BIGML']
MONGO_DATABASE = os.environ['MONGO_DATABASE']
MONGO_COLLECTION = os.environ['MONGO_COLLECTION']

LOG_FILE = 'logs/forward-testing/ts_rsi_heik_v1.csv'
MACRO_STRATEGY_NAME='ts_rsi_heik_v1'

mongoclient = pymongo.MongoClient(MONGO_URL)
global updating_time

def insert_new_all(new_actions):
    global updating_time
    save_time = None
    masterdb = mongoclient[MONGO_DATABASE]
    ob_table = masterdb[MONGO_COLLECTION]

    for idx, new_action in enumerate(new_actions):
        if idx > 30:
            break
        query = {"date": new_action['date']}
        if ob_table.count_documents(query) > 0:
            pass
        else:
            ob_table.insert_one(new_action)
        updating_time = new_action['date']
        save_time = new_action['date']
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!", updating_time)
    return save_time

def get_strategy_name(new_action):
    time_frame = new_action['timeframe']
    csv_file_name = ''
    if '12 mins' == time_frame:
        csv_file_name = 'heikfilter-12mins-trades'
    elif '2 mins' == time_frame:
        csv_file_name = 'heikfilter-2mins-trades'
    elif '1 hour' == time_frame:
        csv_file_name = 'heikfilter-1hour-trades'
    elif '4 hours' == time_frame:
        csv_file_name = 'heikfilter-4hours-trades'
    elif '12 hours' == time_frame:
        csv_file_name = 'heikfilter-12hours-trades'
    elif '1 day' == time_frame:
        csv_file_name = 'heikfilter-1day-trades'
    elif '12 mins>1 hour' == time_frame:
        csv_file_name = 'heikfilter-12mins-1hour-trades'
    elif '12 mins>4 hours' == time_frame:
        csv_file_name = 'heikfilter-12mins-4hours-trades'
    elif '2 mins>4 hours' == time_frame:
        csv_file_name = 'heikfilter-2mins-4hours-trades'
    elif '2 mins>12 mins>4 hours' == time_frame:
        csv_file_name = 'heikfilter-2mins-12mins-4hours-trades'
    elif '2 mins>1 hour':
        csv_file_name = 'heikfilter-2mins-1hour-trades'

    return csv_file_name

def get_new_actions(last_date_time_obj):
    new_actions = []
    with open(LOG_FILE, "r") as log_f:
        trading_logs = list(csv.DictReader(log_f))
        for trading in trading_logs:
            if len(trading.keys()) == 0:
                continue
            action_time = trading['time']
            trade_date = datetime.strptime(action_time, '%Y-%m-%d %H:%M:%S')
            # print (trade_date)
            if trade_date > last_date_time_obj:
                insert_data = {
                    'date': trade_date,
                    'symbol': trading['sym'],
                    'side': trading['side'],
                    'quantity': trading['quantity'],
                    'price': trading['price'],
                    'macro_strategy': MACRO_STRATEGY_NAME,
                    'micro_strategy': trading['timeframe'].replace(' ', '').replace('>', '-')
                }
                new_actions.append(insert_data)

    new_actions.sort(key = lambda x:x['date'])
    return new_actions

# '2018-06-29 08:15:27'
# if __name__ == "__main__":
while True:
    try:
        LAST_UPDATE_TIME = os.environ['LAST_UPDATE_TIME']
        last_date_time_obj = datetime.strptime(LAST_UPDATE_TIME, '%Y-%m-%d %H:%M:%S')
        print ('=============:', LAST_UPDATE_TIME)

        new_actions = get_new_actions(last_date_time_obj)
        print (len(new_actions))
        save_time = insert_new_all(new_actions)

        print ('-------------:', save_time)
        if save_time is not None:
            os.environ['LAST_UPDATE_TIME'] = save_time.strftime('%Y-%m-%d %H:%M:%S')
            dotenv.set_key(dotenv_file, "LAST_UPDATE_TIME", save_time.strftime('%Y-%m-%d %H:%M:%S'))
        else:
            updating_time = last_date_time_obj
        time.sleep(5)
    except KeyboardInterrupt: 
        dotenv.set_key(dotenv_file, "LAST_UPDATE_TIME", updating_time.strftime('%Y-%m-%d %H:%M:%S'))
        print ("last_date_time_obj:", updating_time)
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)

