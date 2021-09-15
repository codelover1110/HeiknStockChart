import os
from datetime import datetime,date
import yaml
import threading
import pymongo
import csv
import time
from datetime import timedelta

with open("configs/general.yaml") as f:
    generalConfig = yaml.load(f, Loader = yaml.Loader)

strategy = generalConfig["strategy"]
SAVE_TIME_INTERVAL = 20 # seconds
# MONGO_SERVER_URL = "mongodb+srv://hunter:STOCKdb123@cluster0.agmoz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
# MONGO_SERVER_URL = "mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority"
MONGO_SERVER_URL = "mongodb://hunter:STOCKdb123@cluster0-shard-00-00.agmoz.mongodb.net:27017,cluster0-shard-00-01.agmoz.mongodb.net:27017,cluster0-shard-00-02.agmoz.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-f8c9fs-shard-0&authSource=admin&retryWrites=true&w=majority"
class SaveActionThread(object):
    def __init__(self):
        self.mongoclient = pymongo.MongoClient(MONGO_SERVER_URL)
        self._stop = False
        self.trading_log_file = "logs/forward-testing/"+strategy+".csv"
        self.save_action_file = "logs/forward-testing/"+strategy+"-save.csv"

        self.action_save_thread = threading.Thread(target=self.action_save_thread_func)

    def start(self):
        if not self.action_save_thread.is_alive():
            self.action_save_thread.start()

    def stop(self):
        self._stop = True
 
    def get_thread_state(self):
        return self.state

    def __del__(self):
        self.action_save_thread.join()
        print ("deleted")

    def save_action(self, new_action, time_delta, db_name):
        action_time = new_action['time']
        trade_date = datetime.strptime(action_time, '%Y-%m-%d %H:%M:%S')

        masterdb = self.mongoclient[db_name]
        ob_table = masterdb[new_action['sym']]

        start = trade_date - time_delta
        end = trade_date + time_delta
        data_result = ob_table.find_one({
            'date': {
                '$gte': start,
                '$lt': end
            }
        })

        if data_result is None:
            data_result = ob_table.find_one({
                'date': {
                    '$gte': trade_date,
                }
            })

        updatequery = {'_id': data_result['_id']}
        newvalues = {
            "$set": {
                "price": new_action['price'],
                "quantity": new_action['quantity'],
                "side": new_action['side']
            }
        }

        ob_table.update_one(updatequery, newvalues)
        print ('{} :::db:csv ======> {} : {}'.format(db_name, str(data_result['date']), str(new_action['time'])))
        return data_result["date"]

    def save_insert_action(self, new_action, time_delta, db_name):
        masterdb = self.mongoclient[db_name]
        ob_table = masterdb[new_action['sym']]

        action_time = new_action['time']
        trade_date = datetime.strptime(action_time, '%Y-%m-%d %H:%M:%S')
        
        query = {"date": trade_date}
        if ob_table.count_documents(query) > 0:     # update candle
            data_result = ob_table.find_one({
                'date':trade_date
            })
            updatequery = {'_id': data_result['_id']}
            newvalues = {
                "$set": {
                    "price": new_action['price'],
                    "quantity": new_action['quantity'],
                    "side": new_action['side']
                }
            }
            print (' update ===> date: {}'.format(str(trade_date)))
            ob_table.update_one(updatequery, newvalues)
        else:                                        # insert new candle
            start = trade_date - time_delta
            end = trade_date + time_delta
            data_result = ob_table.find_one({
                'date': {
                    '$gte': start,
                    '$lt': end
                }
            })

            if data_result is None:
                data_result = ob_table.find_one({
                    'date': {
                        '$gte': trade_date,
                    }
                })
            
            print(' insert ===> closed date: {},   trade_date: {}'.format(str(data_result['date']), str(trade_date)))
            insert_candle = data_result.copy()
            del insert_candle['_id']
            insert_candle['date'] = trade_date
            insert_candle['price'] = new_action['price']
            insert_candle['quantity'] = new_action['quantity']
            insert_candle['side'] = new_action['side']

            ob_table.insert_one(insert_candle)

        return trade_date

    def insert_backtesting_signals(self, new_action, updated_doc_date, csv_file_name):
        # insert to backtesting_signals
        masterdb = self.mongoclient["backtesting_signals"]
        ob_table = masterdb[csv_file_name]
        insert_data = {
            "ddate": updated_doc_date, 
            "symbol": new_action["sym"],
            "value": new_action['quantity'],
            "action": new_action['side']
        }
        query = {"ddate": new_action["time"]}
        if ob_table.count_documents(query) > 0:
            pass
        else:
            ob_table.insert_one(insert_data)

    def insert_backtesting_trades(self, new_action, csv_file_name):
        # insert to backtesting_trades
        masterdb = self.mongoclient["backtesting_trades"]
        ob_table = masterdb[csv_file_name]
        insert_data = {
            'date': datetime.strptime(new_action['time'], '%Y-%m-%d %H:%M:%S'),
            'symbol': new_action['sym'],
            'side': new_action['side'],
            'quantity': new_action['quantity'],
            'price': new_action['price']
        }
        query = {"date": datetime.strptime(new_action['time'], '%Y-%m-%d %H:%M:%S')}
        if ob_table.count_documents(query) > 0:
            pass
        else:
            ob_table.insert_one(insert_data)

    def save_actions_database(self, new_action):
        time_frame = new_action['timeframe']
        db_name = ''
        time_delta = timedelta(minutes=2)
        csv_file_name = ''
        if '12 mins' in time_frame:
            db_name = 'backtest_12_minute'
            time_delta = timedelta(minutes=12)
            csv_file_name = 'heikfilter-12mins-trades'
        elif '2 mins' in time_frame:
            db_name = 'backtest_2_minute'
            time_delta = timedelta(minutes=2)
            csv_file_name = 'heikfilter-2mins-trades'
        elif '1 hour' in time_frame:
            db_name = 'backtest_1_hour'
            time_delta = timedelta(hours=1)
            csv_file_name = 'heikfilter-1hour-trades'
        elif '4 hour' in time_frame:
            db_name = 'backtest_4_hour'
            time_delta = timedelta(hours=4)
            csv_file_name = 'heikfilter-4hours-trades'
        elif '12 hours' in time_frame:
            db_name = 'backtest_12_hour'
            time_delta = timedelta(hours=12)
            csv_file_name = 'heikfilter-12hours-trades'
        elif '1 day' in time_frame:
            db_name = 'backtest_1_day'
            time_delta = timedelta(days=1)
            csv_file_name = 'heikfilter-1day-trades'
        try:
            updated_doc_date = self.save_insert_action(new_action, time_delta, db_name)
            # self.insert_backtesting_signals(new_action, updated_doc_date, csv_file_name)
            self.insert_backtesting_trades(new_action, csv_file_name)
            return True
        except:
            print("no found candle doc for new_action!", new_action)
            return False

    def action_save_thread_func(self):
        while True:
            if self._stop:
                break
            try:
                if not os.path.isfile(self.save_action_file):
                    with open(self.save_action_file,"w") as save_f:
                        save_f.write("id,time,sym,timeframe,side,quantity,price,commission,pct_return (excl commission), pct_returns ( incl commission),save\n")

                save_action_ids = []
                with open(self.save_action_file, 'r') as f:
                    save_actions = list(csv.DictReader(f))
                    for save_action in save_actions:
                        try:
                            save_action_ids.append(save_action[0]['id'])
                        except:
                            save_action_ids.append(save_action['id'])
                        
                new_actions = []
                with open(self.save_action_file, 'a', newline='') as save_f:
                    # print("save_action_ids:", save_action_ids)
                    with open(self.trading_log_file, "r") as log_f:
                        trading_logs = list(csv.DictReader(log_f))
                        for trading in trading_logs:
                            if len(trading.keys()) == 0:
                                continue
                            trading_id = trading['id']
                            if trading_id not in save_action_ids:
                                new_actions.append(trading)

                    print ('new {} rows are adding ...'.format(len(new_actions)))
                    if len(new_actions) > 0:
                        save_writer = csv.DictWriter(save_f, new_actions[0].keys())
                        for idx, new_action in enumerate(new_actions):
                            # print ('{} =====> {}'.format(idx, new_action))
                            if self.save_actions_database(new_action):
                                new_action['save'] = 1
                                save_writer.writerow(new_action)
                            else:
                                print (" error for saving: ", new_action)
            except:
                print ('Can not read file {}.'.format(self.save_action_file))
                print ('Please check if that file is opend now.')

            time.sleep(SAVE_TIME_INTERVAL)


if __name__ == "__main__":
    sa_thread = SaveActionThread()
    sa_thread.start()
