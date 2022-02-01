import pandas as pd
pd.options.mode.chained_assignment = None  # default='warn'
from ib_insync import *


def Wilders(df,column,period):
    """
    Calculates the wilder average
    """
    return pd.Series(
        data=[df[column].iloc[:period].mean()],
        index=[df[column].index[period-1]],
    ).append(
        df[column].iloc[period:]
    ).ewm(
        alpha=1.0 / period,
        adjust=False,
    ).mean()

def HA(df):
    """
    This converts a dataframe with OHLC to heikin_ashi
    equivalent
    Obtained from 
    https://github.com/emreturan/heikin-ashi/blob/master/heikin_ashi.py
    """
    heikin_ashi_df = pd.DataFrame(index=df.index.values, columns=['o', 'h', 'l', 'c'])

    heikin_ashi_df['c'] = (df['o'] + df['h'] + df['l'] + df['c']) / 4

    for i in range(len(df)):
        if i == 0:
            heikin_ashi_df.iat[0, 0] = df['o'].iloc[0]
        else:
            heikin_ashi_df.iat[i, 0] = (heikin_ashi_df.iat[i-1, 0] + heikin_ashi_df.iat[i-1, 3]) / 2

    heikin_ashi_df['h'] = heikin_ashi_df.loc[:, ['o', 'c']].join(df['h']).max(axis=1)

    heikin_ashi_df['l'] = heikin_ashi_df.loc[:, ['o', 'c']].join(df['l']).min(axis=1)

    return heikin_ashi_df

def Filter(df):
    """
    Implementation of strategy, given a dataframe with OHLC candle data,
    bucket stock into buy,sell,hold,wait
    """

    length = 14
    length1 = 5
    length2 = 2
    length3 = 9
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

    # hadf = HA(df) 
    # heik = (hadf["c"] - hadf["o"]).rolling(window=3).mean()
    # heik_diff = heik.diff()
    # df.replace(np.nan, 0)
    return df