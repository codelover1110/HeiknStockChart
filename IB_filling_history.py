from ib_insync import *
import pymongo
import datetime
import pandas as pd 
import os
import requests
import time
import io
import csv


ib = IB()
ib.connect('127.0.0.1',4001,clientId=1)
mongoclient = pymongo.MongoClient("mongodb://localhost:27017")
stocks = list()
url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
s = requests.get(url).content
companies = pd.read_csv(io.StringIO(s.decode('utf-8')))
Symbols = companies['Symbol'].tolist()
print(len(Symbols))
masterdb = mongoclient["stocks"]
stock_history = masterdb["1week_history_data"]
k = 0
symbol = 'AAPL'
contract = Stock(symbol,"NYSE","USD")
bars = ib.reqHistoricalData(contract,endDateTime = '20210702 00:00:00', durationStr = '1 D', barSizeSetting = '1 min', whatToShow = 'MIDPOINT', useRTH = 0)
df = util.df(bars)
for index, row in df.iterrows():
    tmp = {
        "symbol":symbol,
        "date":row[0].strftime("%Y-%m-%d %H:%M:%S"),
        "open":row[1],
        "high":row[2],
        "low":row[3],
        "close":row[4],
    }
    query = {"symbol":symbol,"date":tmp["date"]}
    if stock_history.count_documents(query)>0:
        #print("Here:",tmp)
        pass
    else:
        stock_history.insert_one(tmp)
        print(tmp)
    

all_data = stock_history.find()
data_file = open('1week_candle.csv', 'w', newline="") 
csv_writer = csv.writer(data_file) 
count = 0
for item in all_data: 
    if count == 0: 
        header = item.keys() 
        csv_writer.writerow(header) 
        count += 1
    csv_writer.writerow(item.values()) 
data_file.close() 