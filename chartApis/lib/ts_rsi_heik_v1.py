import numpy as np
import pandas as pd
import os
pd.options.mode.chained_assignment = None  # default='warn'
from datetime import datetime,date
import pandas_ta as ta


def Wilders(df,column,period):
    """
    Calculates the wilder average
    """
    # Using pandas-ta bc libraries are nice
    df = df[["date",column]]
    df = df.rename(columns = {column:"close"})
    df =  df.ta.rma(length = period)
    return df

def Filter(df, barSize, stock):
    """
    Implementation of strategy, given a dataframe with OHLC candle data,
    bucket stock into buy,sell,hold,wait
    """

    length = 14
    length1 = 5
    length2 = 3
    length3 = 9

    df["diff"] = df["close"].diff()
    df["absdiff"] = abs(df["close"].diff())

    df["NetChgAvg"] = Wilders(df,"diff",14)
    df["TotChgAvg"] = Wilders(df,"absdiff",14)
    df["ChgRatio"] = df["NetChgAvg"]/df["TotChgAvg"]
    df["RSI"] = (50 * (df["ChgRatio"] + 1) - 50)

    df["x"] = pd.Series.ewm(df['RSI'], span=length1).mean()
    df["x2"] = pd.Series.ewm(df['x'], span=length2).mean()
    df["xs"] = df["x2"].rolling(window=length3).mean()

    df["rsi1"] = df["x2"] - df["xs"]
    df["rsi2"] = df["rsi1"].diff()
    df["rsi3"] = df["rsi2"].diff()

    # index has to go from 0 otherwise pandas-ta complains below
    df = df.reset_index()

    # HA candle data frame using pandas-ta
    hadf = ta.ha(df["open"], df["high"], df["low"], df["close"]) 
    # takes average of HA candles and then difference
    heik = (hadf["HA_close"] - hadf["HA_open"]).rolling(window=3).mean()
    heik_diff = heik.diff()
    lastdf = df.iloc[-1]
    
    #print(pd.concat([df["date"],heik], axis = 1).iloc[-50:])

    #print(hadf)
    #print("heik-new")
    #print(pd.concat([df["date"],heik], axis = 1).iloc[-50:])

    # logging values for debugging later
    today = datetime.today().strftime("%Y-%m-%d")
    with open(f"logs/heiklog-{today}.txt","a") as f:
        f.write("============= \n")
        f.write( datetime.now().strftime("%H:%M:%S") + "\n" )
        f.write(f"Stock: {stock} \n")
        f.write(f"Bar size: {barSize} \n")
        f.write(f"RSI 1, 2, 3 \n")
        f.write(f"{lastdf.rsi1}, {lastdf.rsi2}, {lastdf.rsi3} \n")
        f.write(f"heik1, heik_diff \n")
        f.write(f"{heik.iloc[-1]}, {heik_diff.iloc[-1]} \n")
        f.write("============= \n")


    if( lastdf.rsi2 >= 0 and lastdf.rsi3 >= 0 and heik.iloc[-1] >=0 and heik_diff.iloc[-1] >= 0):
        return "buy"
    elif ( lastdf.rsi2 <= 0 and heik_diff.iloc[-1] <= 0):
        return "sell"
    elif ( lastdf.rsi1 >= 0):
        return "hold"
    else:
        return "wait"