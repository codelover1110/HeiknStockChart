from datetime import datetime, timedelta
import pymongo
from .common import define_start_date

# mongoclient = pymongo.MongoClient("mongodb://localhost:27017")
mongoclient = pymongo.MongoClient("mongodb://hunter:STOCKdb123@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority")
# mongoclient = pymongo.MongoClient("mongodb://hunter:STOCKdb123@cluster0-shard-00-00.agmoz.mongodb.net:27017,cluster0-shard-00-01.agmoz.mongodb.net:27017,cluster0-shard-00-02.agmoz.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-f8c9fs-shard-0&authSource=admin&retryWrites=true&w=majority")

BACKTESTING_TRADES = 'backtesting_trades'
ALL_TRADES_HISTORY = 'trades'
############################################
## get all macro and micro strategy names ##
############################################
def get_strategies_names():
    query_get_strategy_names = [{
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
    agg_result = ob_table.aggregate(query_get_strategy_names)
    for doc in agg_result:
        return doc
    return  []

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
    print ('-------------- candles count: ', len(candles))

    find_trades_query = {
        'date': {'$gte': start_date, '$lt': end_date},
        'micro_strategy': micro,
        'macro_strategy': macro,
        'symbol': symbol
    }
    masterdb = mongoclient['backtesting_trades']
    ob_table = masterdb['trades'] 
    trade_result = ob_table.find(find_trades_query)
    strategy_trades = list(trade_result.sort('date', pymongo.ASCENDING))
    print ('-------------- trade count: ', len(strategy_trades))

    return candles, strategy_trades