from datetime import datetime
import pymongo
from .utils import define_start_date, check_candle_in_maket_time

# mongoclient = pymongo.MongoClient('mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority')
# mongo_client = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
# azuremongo = mongoclient
azuremongo = pymongo.MongoClient('mongodb://root:!23QweAsd@20.84.64.243:27017')
BACKTESTING_TRADES = 'backtesting_trades'
ALL_TRADES_HISTORY = 'trading-history'
STRATEGY_FILE = 'strategies'
MARKET_DATA_DB = 'stock_market_data'

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
    masterdb = azuremongo[BACKTESTING_TRADES]
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
    masterdb = azuremongo[BACKTESTING_TRADES]
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
    masterdb = azuremongo[BACKTESTING_TRADES]
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
    masterdb = azuremongo[BACKTESTING_TRADES]
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

def get_stock_candles_for_strategy_all(candle_name, symbol, macro, micro, extended=False):
    start_date, end_date = define_start_date(candle_name)
    
    # get candles
    masterdb = azuremongo['stock_market_data']
    ob_table = masterdb[candle_name] 
    candle_result = ob_table.find({'date': {'$gte': start_date, '$lt': end_date}, 'stock': symbol})
    sort_candles = list(candle_result.sort('date', pymongo.ASCENDING))   
    
    candles = []
    if extended:
        candles = sort_candles
    else:
        if candle_name != 'backtest_12_hour' and candle_name != 'backtest_1_day':
            for candle in sort_candles:
                if check_candle_in_maket_time(candle):
                    candles.append(candle)
        else:
            candles = sort_candles
    result_dates = []
    result_candles = []
    for candle in candles:
        if candle['date'] not in result_dates:
            result_candles.append(candle)
            result_dates.append(candle['date'])
    
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
    masterdb = azuremongo[BACKTESTING_TRADES]
    ob_table = masterdb[ALL_TRADES_HISTORY] 
    trade_result = ob_table.find(find_trades_query)
    strategy_trades = list(trade_result.sort('date', pymongo.ASCENDING))

    return result_candles, strategy_trades

def get_backtesting_symbols(macro, micro, start_date, end_date):
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
    query = [
        {
            "$facet":{
                "symbols":[
                    {   
                        "$match":{ 
                            'date': {'$gte': start_date_obj, '$lt': end_date_obj}, 
                            'macro_strategy': macro, 
                            'micro_strategy': micro 
                        }
                    },
                    {
                        "$group":{
                            "_id": "$symbol",
                        }
                    }                ]
            }
        }]
    masterdb = azuremongo[BACKTESTING_TRADES]
    ob_table = masterdb[ALL_TRADES_HISTORY]
    agg_result = ob_table.aggregate(query)
    for doc in agg_result:
        symbols = [sym['_id'] for sym in doc['symbols']]
        return symbols
    return  []

def get_backtesting_result(symbols, macro, micro, start_date, end_date):
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
            'macro_strategy': macro, 
            'micro_strategy': micro,
            'symbol':{'$in': symbols}
        }
    masterdb = azuremongo[BACKTESTING_TRADES]
    ob_table = masterdb[ALL_TRADES_HISTORY]
    list_data_db = list(ob_table.find(query, {'_id': False}).sort('date', pymongo.ASCENDING))
    return list_data_db

def get_data_trades_db(start_date, end_date, macro, micro, symbol):
    masterdb = azuremongo[BACKTESTING_TRADES]
    db_collection = masterdb[ALL_TRADES_HISTORY]
    query_obj = {}
    if symbol != '':
        query_obj['symbol'] = symbol
    if macro != '':
        query_obj['macro_strategy'] = macro
    if micro != '':
        query_obj['micro_strategy'] = micro
    
    startDate = datetime.strptime(start_date, '%Y-%m-%d')
    endDate = datetime.strptime(end_date, '%Y-%m-%d')
    query_obj['date'] = {"$gte": startDate, "$lt": endDate}

    trades_data = list(db_collection.find(query_obj, {'_id': False}).sort('date', pymongo.ASCENDING))
    return trades_data

def get_table_list_db(strategy_name):
    masterdb = azuremongo["backtest_tables"]
    if strategy_name != 'no_strategy':
        ob_table = masterdb['trade_list']
    else:
        ob_table = masterdb['stock_list']
    tables_name = []
    for x in ob_table.find():
        tables_name.append(x['stock_name'])

    return tables_name

#######################################
### get candles for specific symbol ### 
#######################################
def get_symbol_candles(symbol, start_date, end_date, time_frame):
    if True:   # for 1 miniutes db
        masterdb = azuremongo[MARKET_DATA_DB]
        if time_frame == '1m':
            db_collection = masterdb['backtest_1_minute']
        elif time_frame == '1h':
            db_collection = masterdb['backtest_1_hour']
        elif time_frame == '1d':
            db_collection = masterdb['backtest_1_day']
        else: 
            return []

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
        list_db_data = list(db_collection.find(query, {'_id': False}).sort('date', pymongo.ASCENDING))

        return list_db_data

def put_script_file(file_name, content, user_id=1, update_date=datetime.now()):
    masterdb = azuremongo[BACKTESTING_TRADES]
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
    masterdb = azuremongo[BACKTESTING_TRADES]
    ob_table = masterdb[STRATEGY_FILE]

    query = {"file_name": file_name}
    strtg = ob_table.find_one(query)
    _id = strtg['_id']

    ob_table.update({'_id': _id},  {'$set': {"file_name": file_name, "content": content, "update_date": update_date}})
    return True 

def get_strategy_file(file_name):
    masterdb = azuremongo[BACKTESTING_TRADES]
    ob_table = masterdb[STRATEGY_FILE]
    
    strtg = ob_table.find_one({"file_name": file_name}, {'_id': False})
    return strtg

def get_strategy_list(user_id=1):
    masterdb = azuremongo[BACKTESTING_TRADES]
    ob_table = masterdb[STRATEGY_FILE]
    
    strategies = ob_table.find({"user_id": user_id}, {'_id': False})
    result = list(strategies.sort('update_date', pymongo.ASCENDING))
    return result

    
