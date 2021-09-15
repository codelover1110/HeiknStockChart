from ib_insync import *
from lib.heikfilter import Filter
import sys
import numpy as np
import pandas as pd
pd.options.mode.chained_assignment = None  # default='warn'
from datetime import datetime,date
import matplotlib.pyplot as plt
from tksheet import Sheet
import tkinter as tk

##########################
###### USER CONFIG #######

## time to wait between grabbing syms in ms
refreshtime = 60000


barsize = "10 mins"


########################

class demo(tk.Tk):
    def __init__(self):
        tk.Tk.__init__(self)
        self.grid_columnconfigure(0, weight = 1)
        self.grid_rowconfigure(0, weight = 1)
        self.frame = tk.Frame(self)
        self.frame.grid_columnconfigure(0, weight = 1)
        self.frame.grid_rowconfigure(0, weight = 1)
        self.sheet = Sheet(self.frame,
                           data = [["Stock","Result"]])
        self.sheet.enable_bindings()
        self.frame.grid(row = 0, column = 0, sticky = "nswe")
        self.sheet.grid(row = 0, column = 0, sticky = "nswe")

# Connecting to IB client
ib = IB()
ib.connect('127.0.0.1', 7496, clientId=1)

# Opening and reading file containing stock tickers 
try:
    with open("configs/stocks.csv") as f:
        stocks = f.readlines()
except:
    print("please create a stocks.csv file in configs")
    sys.exit(1)
    
stocks = [x.strip() for x in stocks] 

dfcontents = {
        "stock":stocks,
        "verdict":["N/A" for x in range(len(stocks))],
            }
masterdf = pd.DataFrame(dfcontents)

app = demo()
app.sheet.set_sheet_data(data = masterdf.values.tolist(),
               reset_col_positions = True,
               reset_row_positions = True,
               redraw = True,
               verify = False,
               reset_highlights = False)

app.sheet.redraw(redraw_header = True, redraw_row_index = True)

def GrabData():
    for counter in range(len(stocks)):
        stock = stocks[counter]
        contract = Stock(stock, 'ISLAND', 'USD')
        current_date = datetime.now()

        df = ib.reqHistoricalData(
            contract, endDateTime=current_date, durationStr='1 D',
            barSizeSetting=barsize, whatToShow='MIDPOINT', useRTH=True)

        # convert to pandas dataframe:
        df = util.df(df)
        counter += 1

        verdict = Filter(df)
        if(verdict == "buy"):
            color = "#9400D3"
        elif(verdict == "sell"):
            color = "#FF8C00"
        elif(verdict == "hold"):
            color = "#006400"
        elif(verdict == "wait"):
            color = "#8B0000"
        app.sheet.set_cell_data(counter-1, 1, value = verdict, set_copy = True, redraw = False)
        app.sheet.highlight_cells(row = counter-1, column = 1, cells = [], canvas = "table", bg = color, fg = None, redraw = True)


        print([stock,verdict])
    app.after(refreshtime,GrabData)

app.after(0,GrabData)
app.mainloop()
