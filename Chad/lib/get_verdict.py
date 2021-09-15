from ib_insync import *
import pandas as pd
from datetime import datetime, timedelta
import os
import requests
import json
import yaml
import sys
import pickle


def IBGetVerdict(barSize, mktDataHours, stocks):
    """
    Grabs historical bars from IB and returns DataFrame of syms
    along with "verdict" from the Filter function, our strategy

    Has to be repeated for each individual timeframe
    """

    # This might be overkill / slow things down,
    # will have to experiment
    ibData = IB()
    ibData.connect('127.0.0.1', 7496, clientId=2)
    
    resample = False

    # The minute values accepted by the IB API
    minSizes = ["1","2","3","5","10","15","20","30"]

    # extract letter and number from timeframe
    numeric = "".join([i for i in barSize if i.isdigit()])
    alpha = "".join([i for i in barSize if i.isalpha()])

    if "m" in barSize and any([x == numeric for x in minSizes]):
        barSizeToGet = numeric + " mins"
        if numeric == "1":
            # want 'min' rather than 'mins'
            barSizeToGet = barSizeToGet[:-1]
        barDuration = "2 D"
    elif "m" in barSize:
        barSizeToGet = "1 min"
        barDuration = "2 D"
        resample = True
    elif "d" in barSize:
        # Currently doesn't handle multiple days (i.e. 2D, 3D, etc.)
        barSizeToGet = "1 day"
        barDuration = "50 D"
    else:
        # Assuming that using [1 hour, 2 hours, 3 hours, 4 hours, 8 hours]
        # if you want more have to expand this like the minute one above. 
        barSizeToGet = barSize
        barDuration = "10 D"

    hoursMapping = {
            "emkt":True,
            "mkt":False,
        }

    lst = []
    for counter in range(len(stocks)):
        stock = stocks[counter]
        contract = Stock(stock, 'ISLAND', 'USD')
        current_date = datetime.now()

        df = ibData.reqHistoricalData(
            contract, endDateTime=current_date, durationStr=barDuration,
            barSizeSetting=barSizeToGet, whatToShow='MIDPOINT',
            useRTH=hoursMapping[mktDataHours])

        # convert to pandas dataframe:
        df = util.df(df)
        df = df[["date","open","high","low","close"]]

        # Ascending order is important for indicator calculations
        df.sort_values(by="date")

        # re-sample if necessary
        if resample == True:
            df.set_index("date", inplace = True)
            df = df.resample(numeric + 'min').agg({
                "open":"first",
                "high":"max",
                "low":"min",
                "close":"last"
                })
            df.reset_index(inplace = True)
            df = df.dropna()

            # First and last bars can have incomplete data when resampling
            df = df.iloc[1:-1]

        ## 15 candles are currently required to calculate our Wilders Average
        if len(df) < 15:
            return "not enough candles"
        verdict = Filter(df, barSize,stock)

        lst.append([stock,verdict])

    ibData.disconnect()

    return pd.DataFrame(lst, columns=["sym","verdict"])


def PolygonGetVerdict(barSize, mktDataHours, stocks, apiKey):

    # Polygon doesn't have the option to exclude
    # data outside of market hours
    # For now just give exted hours as default

    # extract letter and number from timeframe
    numeric = "".join([i for i in barSize if i.isdigit()])
    alpha = "".join([i for i in barSize if i.isalpha()])

    if "m" in barSize:
        timespan = "minute"
    elif "h" in barSize:
        timespan = "hour"
    elif "d" in barSize:
        timespan = "day"

    multiplier = numeric
    # maximum bars to retrieve (minutes or days)
    limit = 15000


    # err on the side of grabbing too much data
    # than too little
    toDate = datetime.now()
    if timespan == "minute":
        fromDate = toDate - timedelta(days = 5)
    if timespan == "hour":
        fromDate = toDate - timedelta(days = 5*int(multiplier))
    if timespan == "day":
        fromDate = toDate - timedelta(days = 75*int(multiplier))


    toDate = toDate.strftime("%Y-%m-%d")
    fromDate = fromDate.strftime("%Y-%m-%d")

    lst = []
    for stock in stocks:

        apiUrl = f'https://api.polygon.io/v2/aggs/ticker/{stock}/range/' \
                f'{multiplier}/{timespan}/{fromDate}/{toDate}'\
                f'?adjusted=true&sort=asc&limit={limit}&apiKey={apiKey}'

        data = requests.get(apiUrl).json() 
        df = pd.DataFrame(data["results"])
        df["t"] = pd.to_datetime(df["t"], unit = 'ms')
        df = df[["t","o","h","l","c"]]

        df.columns = ["date","open","high","low","close"]

        if mktDataHours == "noextmkt":
            df = df.set_index("date")
            df = df.between_time("09:30","16:00")
            df = df.reset_index()

        ## 15 candles are currently required to calculate our Wilders Average
        if len(df) < 15:
            return "not enough candles"
        verdict = Filter(df, barSize,stock)

        lst.append([stock,verdict])

    return pd.DataFrame(lst, columns=["sym","verdict"])

if __name__ == "__main__":
    from tsrh_dc import Filter
else:
    from lib.tsrh_dc import Filter


