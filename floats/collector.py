import asyncio
from threading import Thread
import time
import random
import websockets
import json
import io
import requests
import threading
import pandas as pd 

def get_symbols():
    url="https://pkgstore.datahub.io/core/nasdaq-listings/nasdaq-listed_csv/data/7665719fb51081ba0bd834fde71ce822/nasdaq-listed_csv.csv"
    s = requests.get(url).content
    companies = pd.read_csv(io.StringIO(s.decode('utf-8')))
    symbols = companies['Symbol'].tolist()
    return symbols

def get_floats_data():
    try:
        print ("get symbol start ?????")
        symbols = get_symbols()
        datasets = []
        for symbol in symbols:
            alpha_url = 'https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey=DIO3MPDF44RL6MOF'
            r = requests.get(alpha_url)
            datasets.append(r.json())
        print ("per symbol ?????", datasets)
        
    except:
        print ("......error in get_new_float_data......")

    return datasets