from io import StringIO
from datetime import datetime
import pymongo
import tempfile
import pandas
from wsgiref.util import FileWrapper
from zipfile import ZipFile
from backup.models import BackupProgress

from Having_system.Update_candles.define import INDICATORS_COL_NAME, PARAMETERS_DB
from .utils import define_start_date, check_candle_in_maket_time

azuremongo = pymongo.MongoClient('mongodb://root:rootUser2021@20.84.64.243:27017')
BACKTESTING_TRADES = 'backtesting_trades'
# ALL_TRADES_HISTORY = 'trading-history'
ALL_TRADES_HISTORY = 'trade-history'
STRATEGY_FILE = 'strategies'
MARKET_DATA_DB = 'chart_market_data'
STOCK_MARKET_DATA_ALL = 'stock_market_data_all'

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
            },
        },
        {
            "$sort": {"_id": -1}
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

def get_indicator_list():
    masterdb = azuremongo[PARAMETERS_DB]
    ob_table = masterdb[INDICATORS_COL_NAME]
    indicator_names = list(ob_table.find({}, {'name': 1, '_id': 0}))
    result = []
    for indicator in indicator_names:
        if indicator['name'] != 'int_percent_net':
            result.append(indicator['name'])
    return  result

##################################
### get macro strategy symbols ###
##################################
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

######################################
### get symbols for micro strategy ###
######################################
def get_micro_strategy_symbols(macro_name, micro_name):
    query = [
        {
            "$match":{ 'macro_strategy': macro_name, 'micro_strategy': micro_name }
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
    masterdb = azuremongo[MARKET_DATA_DB]
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
def get_symbol_candles(symbol, start_date, end_date, time_frame, page_num=0, page_mounts=0):
    masterdb = azuremongo[STOCK_MARKET_DATA_ALL]
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

    page_total = db_collection.find(query, {'_id': False}).count()
    if page_num != 0 and page_mounts != 0:
        list_db_data = list(db_collection.find(query, {'_id': False}).sort('date', pymongo.DESCENDING).skip(page_num).limit(page_mounts))
    else:
        list_db_data = list(db_collection.find(query, {'_id': False}).sort('date', pymongo.DESCENDING))

    return list_db_data, page_total

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


def api_get_databases():
    return azuremongo.list_database_names()

def api_get_collections(db_name):
    return azuremongo[db_name].collection_names()

def api_delete_collection(db_name, collection_name):
    db = azuremongo[db_name]
    collection = db[collection_name]
    collection.drop()
    return True

def api_delete_database(db_name):
    db = azuremongo[db_name]
    db.drop()
    return True

# def api_export_database(db_name):
#     print('api_export_database', db_name)

#     collections = api_get_collections(db_name)
#     tempdir = tempfile.mkdtemp()

#     target_zipfile = tempdir + '/' + db_name + '.zip'
#     print('Target Zip file: ', target_zipfile)
#     zipObj = ZipFile(target_zipfile, 'w')


#     for collection_name in collections:
#         csv_file_path = tempdir + '/' + collection_name + '.csv'
#         print(csv_file_path)
#         dataframe = get_csv_collection(db_name, collection_name)
#         dataframe.to_csv(csv_file_path)

#         zipObj.write(csv_file_path)

#     zipObj.close()

#     zipfile = open(target_zipfile, 'rb')

#     return FileWrapper(zipfile)

# def api_export_collection(db_name, collection_name):
#     print('++++ api_export_collection +++ ', db_name, collection_name)
#     docs = get_csv_collection(db_name, collection_name)
#     csv_export = docs.to_csv(sep=",")
#     return csv_export

def get_csv_collection(backup, collection_name, check_stopping):
    db = azuremongo[backup.database]
    collection = db[collection_name]

    cursor = collection.find()
    mongo_docs = list(cursor)

    series_obj = pandas.Series({"a key":"a value"})
    print ("series_obj:", type(series_obj))

    docs = pandas.DataFrame(columns=[])
    for num, doc in enumerate( mongo_docs ):
        doc["_id"] = str(doc["_id"])
        doc_id = doc["_id"]

        if check_stopping(collection_name, doc_id):
            return False

        # print('Process csv data', backup.database, collection_name, doc_id)
        series_obj = pandas.Series( doc, name=doc_id )
        docs = docs.append( series_obj )

    return docs


def count_total_collection(db_name, collection_name):
    if not collection_name:
        total = count_total_database_record(db_name)
    else:
        total = count_total_collection_record(db_name, collection_name)
    return total


def count_total_database_record(db_name):
    total = 0
    collections = api_get_collections(db_name)
    for collection_name in collections:
        total = total + count_total_collection_record(db_name, collection_name)

    return total

def count_total_collection_record(db_name, collection_name):
    db = azuremongo[db_name]
    collection = db[collection_name]
    return collection.find().count()

def api_create_backup(db_name, collection_name):
    backup = BackupProgress()


    backup.database = db_name
    backup.collection = collection_name
    backup.status = 'generated'
    backup.current = 0
    backup.total = count_total_collection(db_name, collection_name)
    backup.save()

    return backup


def api_execute_backup(backup, check_stopping = None):
    db_name = backup.database

    if backup.is_database():
        print('++++ api_execute_backup: dataabse +++ ', db_name)
        collections = api_get_collections(db_name)
        tempdir = tempfile.mkdtemp()

        target_zipfile = tempdir + '/' + db_name + '.zip'
        print('Target Zip file: ', target_zipfile)
        zipObj = ZipFile(target_zipfile, 'w')

        for collection_name in collections:
            csv_file_path = tempdir + '/' + collection_name + '.csv'
            print(csv_file_path)
            dataframe = get_csv_collection(backup, collection_name, check_stopping)
            if not dataframe:
                zipObj.close()
                return False
            dataframe.to_csv(csv_file_path)
            zipObj.write(csv_file_path)

        zipObj.close()

        zipfile = open(target_zipfile, 'rb')

        return FileWrapper(zipfile)
    else:
        print('++++ api_execute_backup +++ ', backup.database, backup.collection)
        docs = get_csv_collection(backup, backup.collection, check_stopping)
        if not docs:
            return False
        csv_export = docs.to_csv(sep=",")
        return csv_export