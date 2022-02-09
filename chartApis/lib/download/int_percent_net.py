import pandas as pd

def Int_percent_net(df,n):
    """
    Calculates the rolling sum of the percent_net
    """
    percent_down  = 100*((df["open"] - df["low"])/df["open"])
    percent_up  = 100*((df["high"] - df["open"])/df["open"])

    percent_net = percent_up - percent_down

    int_percent_net = percent_net.rolling(window = n).sum()

    return percent_net
