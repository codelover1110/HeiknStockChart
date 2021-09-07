from datetime import datetime, timedelta
import pymongo
from .utils import define_start_date

# mongoclient = pymongo.MongoClient("mongodb://localhost:27017")
mongoclient = pymongo.MongoClient("mongodb://hunter:STOCKdb123@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority")
BACKTESTING_TRADES = 'backtesting_trades'
ALL_TRADES_HISTORY = 'trade-history'
STRATEGY_FILE = 'strategies'

hunter_mongoclient = pymongo.MongoClient("mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority")
MARKET_DATA_DB = 'market_data'
BACKTESTING_CANDLES = 'market_candles'  # 1 minute market data
BACKTESTING_CANDLES_60 = 'market_candles_60'# 60 minutes market data

############################################
## get all macro and micro strategy names ##
############################################
def get_strategies_names():
    query = [{
        "$facet": {
            "macro_strategy": [
                {
                    "$group" : {
                        "_id" : "$macro_strategy", 
                        "num_total" : {"$sum" : 1}
                    }
                }
            ],
            "micro_strategy": [
                {
                    "$group" : {
                        "_id" : "$micro_strategy", 
                        "num_total" : {"$sum" : 1}
                    }
                }
            ]
        }
    }]
    masterdb = mongoclient[BACKTESTING_TRADES]
    ob_table = masterdb[ALL_TRADES_HISTORY]
    agg_result = ob_table.aggregate(query)
    for doc in agg_result:
        return doc
    return  []


###################################################
### get micro strategy names for specific macro ### 
###################################################
def get_micro_strategies(macro_name):
    query = [
        {   
            "$match":{ 'macro_strategy': macro_name } 
        },
        {
            "$group":{
                "_id": "$micro_strategy",
            }
        }
    ]
    masterdb = mongoclient[BACKTESTING_TRADES]
    ob_table = masterdb[ALL_TRADES_HISTORY]
    agg_result = ob_table.aggregate(query)
    result = []
    for doc in agg_result:
        result.append(doc['_id'])
    return  result


#####################################
### get macro strategy names only ### 
#####################################
def get_macro_strategies():
    query = [
        {
            "$group" : {
                "_id" : "$macro_strategy", 
                "num_total" : {"$sum" : 1}
            }
        }
    ]
    masterdb = mongoclient[BACKTESTING_TRADES]
    ob_table = masterdb[ALL_TRADES_HISTORY]
    agg_result = ob_table.aggregate(query)
    result = []
    for doc in agg_result:
        result.append(doc['_id'])
    return  result

#####################################
### get macro strategy names only ### 
#####################################
def get_strategy_symbols(macro_name):
    query = [
        {   
            "$match":{ 'macro_strategy': macro_name } 
        },
        {
            "$group":{
                "_id": "$symbol",
            }
        }
    ]
    masterdb = mongoclient[BACKTESTING_TRADES]
    ob_table = masterdb[ALL_TRADES_HISTORY]
    agg_result = ob_table.aggregate(query)
    result = []
    for doc in agg_result:
        result.append(doc['_id'])
    return  result


###################################################
### generate all strateies from macro and micro ### 
###################################################
def get_strategy_name_only():
    strategies = get_strategies_names()
    macros = strategies['macro_strategy']
    micros = strategies['micro_strategy']
    strategy_names = []
    for macro in macros:
        for micro in micros:
            strategy_names.append('{}-{}-trades'.format(macro['_id'], micro['_id']))
    
    return strategy_names


###############################################
### get stock candles for specific strategy ### 
###############################################
def get_stock_candles_for_strategy(candle_name, symbol, macro, micro):
    start_date, end_date = define_start_date(candle_name)
    
    # get candles
    masterdb = mongoclient[candle_name]
    ob_table = masterdb[symbol]  # 'AMNZ'
    candle_result = ob_table.find({'date': {'$gte': start_date, '$lt': end_date}})
    candles = list(candle_result.sort('date', pymongo.ASCENDING))
    print ('-------------- db_name: {}, symbol {}, candles count: {}'.format(candle_name, symbol, len(candles)))

    if macro == 'no_strategy':
        find_trades_query = {
            'date': {'$gte': start_date, '$lt': end_date},
            'symbol': symbol
        }    
    else:  
        find_trades_query = {
            'date': {'$gte': start_date, '$lt': end_date},
            'micro_strategy': micro,
            'macro_strategy': macro,
            'symbol': symbol
        }
    masterdb = mongoclient[BACKTESTING_TRADES]
    ob_table = masterdb[ALL_TRADES_HISTORY] 
    trade_result = ob_table.find(find_trades_query)
    strategy_trades = list(trade_result.sort('date', pymongo.ASCENDING))

    return candles, strategy_trades


############################
### get backtesting data ### 
############################
def get_backtesting_data_db(table_name, start_date, end_date):
    masterdb = mongoclient[BACKTESTING_TRADES]
    db_collection = masterdb[table_name]
    cur_date = datetime.now().date()

    if start_date == '' and end_date == '':
        end_date = str(cur_date)
        start_date = '2020-01-01'
    elif start_date == '':
        start_date = '2020-01-01'
    elif end_date == '':
        end_date = str(cur_date)

    print ('+++ get backtesting data => start:{}, end:{}'.format(start_date, end_date))

    start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
    end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')
    query = {
        'date': {'$gte': start_date_obj, '$lt': end_date_obj}
    }
    list_db_data = list(db_collection.find(query).sort('date', pymongo.ASCENDING))
    return list_db_data

    

#######################################
### get candles for specific symbol ### 
#######################################
def get_symbol_candles(symbol, start_date, end_date, time_frame):
    if False:   # for 1 miniutes db
        masterdb = hunter_mongoclient[MARKET_DATA_DB]
        if time_frame == '1':
            db_collection = masterdb[BACKTESTING_CANDLES]
        if time_frame == '60':
            db_collection = masterdb[BACKTESTING_CANDLES_60]

        cur_date = datetime.now().date()

        if start_date == '' and end_date == '':
            end_date = str(cur_date)
            start_date = '2020-01-01'
        elif start_date == '':
            start_date = '2020-01-01'
        elif end_date == '':
            end_date = str(cur_date)

        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')
        query = {
            'date': {'$gte': start_date_obj, '$lt': end_date_obj},
            'stock': symbol
        }
        list_db_data = list(db_collection.find(query).sort('date', pymongo.ASCENDING))

        return list_db_data
    else:   # for seperated db
        if time_frame == '1m':
            masterdb = mongoclient["backtest_2_minute"]
        elif time_frame == '1h':
            masterdb = mongoclient["backtest_1_hour"]
        elif time_frame == '1d':
            masterdb = mongoclient["backtest_1_day"]
        else:
            return []

        db_collection = masterdb[symbol]
        cur_date = datetime.now().date()
        if start_date == '' and end_date == '':
            end_date = str(cur_date)
            start_date = '2020-01-01'
        elif start_date == '':
            start_date = '2020-01-01'
        elif end_date == '':
            end_date = str(cur_date)

        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')

        query_obj = {}
        query_obj['date'] = {"$gte": start_date_obj, "$lt": end_date_obj}
        list_db_data = list(db_collection.find(query_obj, {'_id': False}).sort('date', pymongo.ASCENDING))

        return list_db_data


def put_script_file(file_name, content, user_id=1, update_date=datetime.now()):
    masterdb = mongoclient[BACKTESTING_TRADES]
    ob_table = masterdb[STRATEGY_FILE]
    strtg = dict()
    strtg['file_name'] = file_name
    strtg['content'] = content
    strtg['user_id'] = user_id
    strtg['update_date'] = update_date

    query = {"file_name": file_name}
    if ob_table.count_documents(query) > 0:
        return False
    else:
        ob_table.insert_one(strtg)
        return True

def update_strartegy_file(file_name, content, user_id=1, update_date=datetime.now()):
    masterdb = mongoclient[BACKTESTING_TRADES]
    ob_table = masterdb[STRATEGY_FILE]

    query = {"file_name": file_name}
    strtg = ob_table.find_one(query)
    _id = strtg['_id']

    ob_table.update({'_id': _id},  {'$set': {"file_name": file_name, "content": content, "update_date": update_date}})
    return True 

def get_strategy_file(file_name):
    masterdb = mongoclient[BACKTESTING_TRADES]
    ob_table = masterdb[STRATEGY_FILE]
    
    strtg = ob_table.find_one({"file_name": file_name}, {'_id': False})
    return strtg

def get_strategy_list(user_id=1):
    masterdb = mongoclient[BACKTESTING_TRADES]
    ob_table = masterdb[STRATEGY_FILE]
    
    strategies = ob_table.find({"user_id": user_id}, {'_id': False})
    result = list(strategies.sort('update_date', pymongo.ASCENDING))
    return result

    
