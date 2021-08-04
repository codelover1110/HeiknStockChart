import pymongo
from datetime import datetime
import pandas as pd 
import os
import requests
import time
import io
import csv

apiKey = 'tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk'
startAt = '2020-07-01'
endAt = '2021-07-31'
mongoclient = pymongo.MongoClient("mongodb://localhost:27017")
masterdb = mongoclient["1d_stocks"]

def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    s = requests.get(url).content
    companies = pd.read_csv(io.StringIO(s.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols

def get_candles(candle, candle_type):
    # https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2020-10-14/2020-10-14?adjusted=true&sort=asc&limit=50000&apiKey=
    polygon_url = f"https://api.polygon.io/v2/aggs/ticker/{candle}/range/1/{candle_type}/{startAt}/{endAt}?adjusted=true&sort=asc&limit=50000&apiKey={apiKey}"
    print(polygon_url)
    datasets = requests.get(polygon_url).json()
    result = datasets['results'] if 'results' in datasets else []
    return result

def get_tables_name():
    print("List of collections\n--------------------")
    #list the collections
    masterdb = mongoclient["1d_stocks"]

    for coll in masterdb.list_collection_names():
        stock_name = (coll.split('_')[2])
        ob_table = masterdb['stock_list']
        query = {"stock_name": stock_name}
        if ob_table.count_documents(query) > 0:
            pass
        else:
            data = {'stock_name': stock_name}
            ob_table.insert_one(data)

def save_db():
    symbols = get_symbols()
    candles_type = [
        # 'minute'
        # 'hour'
        'day'
    ]
    for candle_type in candles_type:
        k = 0
        for symbol in symbols:
            k +=1
            if k > 1000:
                break
        # symbol = 'AAPL'
            candles = get_candles(symbol, candle_type)
            for candle in candles:
                table_name = f"1_{candle_type}_{symbol}"
                ob_table = masterdb[table_name]
                candle['date'] = datetime.fromtimestamp((candle['t']/1000))
                year = int(candle['date'].strftime("%Y"))
                month = int(candle['date'].strftime("%m"))
                day = int(candle['date'].strftime("%d"))
                mk_start = datetime(year, month, day, 9, 30)
                mk_end = datetime(year, month, day, 16, 0)
                print(mk_start, '-------------')
                print(candle['date'])
                print(candle)
                print(mk_end, '-------------')
                print(mk_start < candle['date'] < mk_end)
                # if mk_start <= candle['date'] <= mk_end:
                query = {"date": candle["date"]}
                if ob_table.count_documents(query) > 0:
                    pass
                else:
                    print(candle)
                    ob_table.insert_one(candle)


if __name__ == "__main__":
    save_db()
    # get_tables_name()