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
        'c': float(lastdf.c),
        'date': lastdf.date,
        'h': float(lastdf.h),
        'l': float(lastdf.l),
        'o': float(lastdf.o),
        'percentChange': "",
        'v': int(lastdf.v),
        'side': side,
        # 'rsi': {'bearPower': lastdf.RSI, 'bullPower': lastdf.RSI, 'color': side},
        # 'rsi2': {'bearPower': lastdf.rsi2, 'bullPower': lastdf.rsi2, 'color': define_color(df["rsi2"], lastdf.rsi2)},
        # 'rsi3': {'bearPower': lastdf.rsi3, 'bullPower': lastdf.rsi3, 'color': define_color(df["rsi3"], lastdf.rsi3)},
        # 'heik': {'bearPower': heik.iloc[-1], 'bullPower': heik.iloc[-1], 'color': define_color(heik, heik.iloc[-1])},
        # 'heik2': {'bearPower': heik_diff.iloc[-1], 'bullPower': heik_diff.iloc[-1], 'color': define_color(heik_diff, heik_diff.iloc[-1])},
        'rsi': lastdf.RSI,
        'rsi2': lastdf.rsi2,
        'rsi3': lastdf.rsi3,
        'heik': heik.iloc[-1], 
        'heik2': heik_diff.iloc[-1],
        'rsi_color': side,
        'rsi2_color': define_color(df["rsi2"], lastdf.rsi2),
        'rsi3_color': define_color(df["rsi3"], lastdf.rsi3),
        'heik_color': define_color(heik, heik.iloc[-1]),
        'hiek2_color': define_color(heik_diff, heik_diff.iloc[-1])
    }

    return result
    
def get_fields_data(fields, key):
    for item in fields:
        if key in item.keys():
            return item[key]

def combine_dict(dict1, dict2):
    if dict1 is None and dict2 is None:
        return None
    elif dict1 is None:
        return dict2
    elif dict2 is None:
        return dict1
    for key in dict2.keys():
        dict1[key] = dict2[key]
    
    return dict1

def check_dict_none(dict_value, keys):
    if dict_value is None:
        item = dict()
        for key in keys:
            item[key] = ""
        return item
    else:
        return dict_value

def get_default_scanner_view_fields():
    default_fields = [
            {
                "Stock Financials": [ "period", "calendarDate" ]
            },
            {
                "Ticker Details": [ "listdate", "cik" ]
            },
            {
                "Indicators": [ "rsi", "rsi2", "rsi3", "heik", "heik2" ]
            }
        ]
    return default_fields

def get_candle_fields():
    return ['c', 'date', 'h','l','o', 'percentChange', 'v', 'side', 'rsi', 'rsi2', 'rsi3', 'heik', 'heik2', 'rsi_color', 'rsi2_color', 'rsi3_color', 'heik_color', 'hiek2_color']