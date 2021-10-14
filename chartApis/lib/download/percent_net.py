import pandas as pd

def Percent_net(df):
    """
    percent_up - percent_down
    """
    percent_down  = 100*((df["open"] - df["low"])/df["open"])
    percent_up  = 100*((df["high"] - df["open"])/df["open"])

    percent_net = percent_up - percent_down

    return percent_net
