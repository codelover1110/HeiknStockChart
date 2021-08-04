from ib_insync import *
import pymongo
import datetime
import pandas as pd 
import os
import requests
import time
import io
import csv

mongoclient = pymongo.MongoClient("mongodb://localhost:27017")
stocks = list()
masterdb = mongoclient["stocks"]
stock_history = masterdb["1_hour_AAOI"]

all_data = stock_history.find()
data_file = open('1_hour_AAOI.csv', 'w', newline="") 
csv_writer = csv.writer(data_file) 
count = 0
for item in all_data: 
    if count == 0: 
        header = item.keys() 
        csv_writer.writerow(header) 
        count += 1
    csv_writer.writerow(item.values()) 
data_file.close() 
time.sleep(60)

