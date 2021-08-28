from django.shortcuts import render

from django.http.response import JsonResponse
from numpy.core.arrayprint import printoptions
from numpy.core.fromnumeric import resize
from pymongo.message import update
from rest_framework.parsers import JSONParser 
from rest_framework import status
from rest_framework.decorators import api_view
from datetime import datetime, timedelta
import os
from django.views.decorators.csrf import csrf_exempt
from configparser import ConfigParser

import pymongo
from datetime import datetime
import pandas as pd 
import os
import requests
import time
import io
import csv



import numpy as np
import pandas as pd
pd.options.mode.chained_assignment = None  # default='warn'
from datetime import datetime,date

from ib_insync import *
import numpy as np
import pandas as pd
pd.options.mode.chained_assignment = None  # default='warn'
from datetime import datetime,date
import matplotlib.pyplot as plt
from tksheet import Sheet
import tkinter as tk
from django.conf import settings


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