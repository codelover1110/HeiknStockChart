from ib_insync import *
import pandas as pd
import pandas_ta as ta
from lib.ts_rsi_heik_v1 import Filter
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import numpy as np

""" 
This builds a bar chart of the different verdicts much like the one on TOS
Useful for debugging purposes and finding how close to the actual indicator ours is
"""

def GetVerdict(barSize, stock,bars):
    """
    Grabs historical bars from IB and returns DataFrame of syms
    along with "verdict" from the Filter function, our strategy
    """
    resample = False

    # The minute values accepted by the IB API
    minSizes = ["1","2","3","5","10","15","20","30"]

    if "min" in barSize and any([x == barSize.split(" ")[0] for x in minSizes]):
        barSizeToGet = barSize.split(" ")[0] + " mins"
        if barSize.split(" ")[0] == "1":
            barSizeToGet = barSizeToGet[:-1]
        barDuration = "2 D"
    elif "min" in barSize:
        barSizeToGet = "1 min"
        barDuration = "2 D"
        resample = True
    else:
        # Assuming that using [1 hour, 2 hours, 3 hours, 4 hours, 8 hours] # if you want more have to expand this like the minute one above.
        barSizeToGet = barSize
        barDuration = "10 D"

    contract = Stock(stock, 'ISLAND', 'USD')
    current_date = datetime.now()

    df = ib.reqHistoricalData(
        contract, endDateTime=current_date, durationStr=barDuration,
        barSizeSetting=barSizeToGet, whatToShow='MIDPOINT', useRTH=False)

    # convert to pandas dataframe:
    df = util.df(df)
    df = df[["date","open","high","low","close"]]

    # Ascending order is important for indicator calculations
    df.sort_values(by="date")

    # re-sample if necessary
    if resample == True:
        df.set_index("date", inplace = True)
        df = df.resample(barSize.split(' ')[0] + 'min').agg({
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

    verdicts = []
    times = []
    labels = []
    print(df)
    print(len(df))
    for x in [1 + x for x in range(bars)]:
        print(x)
        verdicts.append(Filter(df[:-1*x], barSize,stock))
        times.append(x)
        labels.append( pd.to_datetime(df.iloc[-1*(x+1)]["date"]).strftime("%H:%M"))

    return [verdicts[::-1],times,labels[::-1]]


if __name__ == "__main__":

    # Connecting to IB client
    ib = IB()
    ib.connect('127.0.0.1', 7496, clientId=1)

    timeframe = "15 mins"
    stock = "AMD"
    bars = 20

    df = GetVerdict(timeframe,stock,bars)

    conv = {"buy":0.8,
            "sell":0.85,
            "hold":0.79,
            "wait":0.81
            }

    verdicts = np.array([ conv[x] for x in df[0] ])
    times = np.array(df[1])

    mask1 = verdicts == conv["buy"]
    mask2 = verdicts == conv["sell"]
    mask3 = verdicts == conv["hold"]
    mask4 = verdicts == conv["wait"]

    plt.bar(times[mask1], verdicts[mask1], color = 'violet')
    plt.bar(times[mask2], verdicts[mask2], color = 'orange')
    plt.bar(times[mask3], verdicts[mask3], color = 'green')
    plt.bar(times[mask4], verdicts[mask4], color = 'red')

    plt.xticks(ticks = times, labels = df[2])

    plt.title(timeframe + " " + stock)

    plt.show()
