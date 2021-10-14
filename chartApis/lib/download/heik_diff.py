import numpy as np
import pandas as pd
import pandas_ta as ta

def Heik_diff(df):
    # index has to go from 0 otherwise pandas-ta complains below
    df = df.reset_index()

    # HA candle data frame using pandas-ta
    hadf = ta.ha(df["open"], df["high"], df["low"], df["close"]) 
    # takes average of HA candles and then difference
    heik = (hadf["HA_close"] - hadf["HA_open"]).rolling(window=3).mean()
    heik_diff = heik.diff()
    return heik_diff
