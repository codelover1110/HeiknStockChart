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

def define_color(df, value):
    if value > 0:
        if df.iloc[0] > df.iloc[-1] :
            return "l_g" # light green
        else:
            return "d_g" # dark green
    else:
        if df.iloc[0] > df.iloc[-1] :
            return "l_r" # light red
        else:
            return "d_r" # dark red

def dataConverter(value):
    obj = np.nan_to_num(value)

    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, datetime.datetime):
        return obj.__str__()

def Filter(df, barSize=1, stock="AMZN"):
    """
    Implementation of strategy, given a dataframe with OHLC candle data,
    bucket stock into buy,sell,hold,wait
    """

    length = 14
    length1 = 5
    length2 = 3
    length3 = 9

    df["diff"] = df["c"].diff()
    df["absdiff"] = abs(df["c"].diff())
    df['diff'] = df['diff'].replace(np.nan, 0)
    df['absdiff'] = df['absdiff'].replace(np.nan, 0)

    df["NetChgAvg"] = Wilders(df,"diff",14)
    # print (df)
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
    df['RSI'] = df['RSI'].replace(np.nan, 0)
    df['rsi2'] = df['rsi2'].replace(np.nan, 0)
    df['rsi3'] = df['rsi3'].replace(np.nan, 0)

    hadf = ta.ha(df["o"], df["h"], df["l"], df["c"]) 
    # takes average of HA candles and then difference
    heik = (hadf["HA_close"] - hadf["HA_open"]).rolling(window=3).mean()
    heik_diff = heik.diff()
    lastdf = df.iloc[-1]
    
    side = ''
    if( lastdf.rsi2 >= 0 and lastdf.rsi3 >= 0 and heik.iloc[-1] >=0 and heik_diff.iloc[-1] >= 0):
        side = "buy"
    elif ( lastdf.rsi2 <= 0 and heik_diff.iloc[-1] <= 0):
        side = "sell"
    elif ( lastdf.rsi1 >= 0):
        side = "hold"
    else:
        side = "wait"

    result = {
        'close': float(lastdf.c),
        'date': lastdf.date,
        'high': float(lastdf.h),
        'low': float(lastdf.l),
        'open': float(lastdf.o),
        'percentChange': "",
        'volume': int(lastdf.v),
        'RSI': lastdf.RSI,
        'side': side,
        'rsi': {'bearPower': lastdf.RSI, 'bullPower': lastdf.RSI, 'color': side},
        'rsi2': {'bearPower': lastdf.rsi2, 'bullPower': lastdf.rsi2, 'color': define_color(df["rsi2"], lastdf.rsi2)},
        'rsi3': {'bearPower': lastdf.rsi3, 'bullPower': lastdf.rsi3, 'color': define_color(df["rsi3"], lastdf.rsi3)},
        'heik': {'bearPower': heik.iloc[-1], 'bullPower': heik.iloc[-1], 'color': define_color(heik, heik.iloc[-1])},
        'heik2': {'bearPower': heik_diff.iloc[-1], 'bullPower': heik_diff.iloc[-1], 'color': define_color(heik_diff, heik_diff.iloc[-1])},
    }

    return result
    