import numpy as np
import pandas as pd
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

def Filter(df, barSize=1, stock="AMZN"):
    """
    Implementation of strategy, given a dataframe with OHLC candle data,
    bucket stock into buy,sell,hold,wait
    """

    length = 14
    length1 = 5
    length2 = 3
    length3 = 9

    # df["diff"] = df["close"].diff()
    # df["absdiff"] = abs(df["close"].diff())

    if df is None:
        return None

    df["diff"] = df["c"].diff()
    df["absdiff"] = abs(df["c"].diff())


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

    df = df.reset_index()

    hadf = ta.ha(df["o"], df["h"], df["l"], df["c"])
    return hadf
