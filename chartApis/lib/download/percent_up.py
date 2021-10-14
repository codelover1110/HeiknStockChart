import pandas as pd

def Percent_up(df):
    """
    How much a stock ticked up per bar
    """
    percent_up  = 100*((df["high"] - df["open"])/df["open"])

    return percent_up
