import os
import sys
from datetime import datetime,date
import pymongo
from bson.objectid import ObjectId
import csv
import time
import dotenv

dotenv_file = dotenv.find_dotenv()
dotenv.load_dotenv(dotenv_file)
DOUBLE_DB = True

MONGO_URL = os.environ['MONGO_URL_HUNTER']
MONGO_DATABASE = os.environ['MONGO_DATABASE']
MONGO_COLLECTION = os.environ['MONGO_COLLECTION']


LOG_FILE = 'logs/ts_rsi_heik_v1.csv'
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
        if True:
            id = new_action['_id']
            print (new_action)
            result = ob_table.delete_one({"_id": new_action['_id']})
            print (result)
    #     query = {"date": new_action['date'], "symbol": new_action["symbol"], "side": new_action["side"]}
    #     if ob_table.count_documents(query) > 0:
    #         pass
    #     else:
    #         ob_table.insert_one(new_action)

    #     updating_time = new_action['date']
    #     save_time = new_action['date']
    #     print("!!!!!!!!!!!!!!!!!!!!!!!!!!!", updating_time)
    # return save_time

def get_new_actions(last_date_time_obj):
    masterdb = mongoclient[MONGO_DATABASE]
    src_table = masterdb['trade-history']

    startDate = last_date_time_obj
    endDate = datetime.strptime('2021-09-09 13:33:17', '%Y-%m-%d %H:%M:%S')

    query_obj = {}
    query_obj['date'] = {"$gte": startDate, "$lt": endDate}
    query_obj['macro_strategy'] = "tsrh_dc"

    trades_data = list(src_table.find(query_obj).sort('date', pymongo.ASCENDING))
    return trades_data
    
# '2018-06-29 08:15:27'
# "2021-09-07 13:43:08"
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

