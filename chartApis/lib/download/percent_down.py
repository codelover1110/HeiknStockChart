import pandas as pd

def Percent_down(df):
    """
    How much a stock ticked down per bar
    """
    percent_down  = 100*((df["open"] - df["low"])/df["open"])

    return percent_down
