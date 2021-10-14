import numpy as np
import pandas as pd
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

def Rsi3(df):
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
    return df["rsi3"]
