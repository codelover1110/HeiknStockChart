from ib_insync import *
from lib.tsrh_dc import Filter
from lib.get_verdict import IBGetVerdict, PolygonGetVerdict
from lib.place_orders import IBPlaceOrder, AlpacaPlaceOrder
import numpy as np
import pandas as pd
import time
import os
import sys
import pymongo
import math
import pickle
import itertools
pd.options.mode.chained_assignment = None  # default='warn'
from datetime import datetime,date
import yaml

##########################
###### USER CONFIG #######
##########################

with open("configs/general.yaml") as f:
    generalConfig = yaml.load(f, Loader = yaml.Loader)

mongoUrl = generalConfig["mongoUrl"]

## time to wait between grabbing syms in seconds
refreshtime = int(generalConfig["refreshtime"].replace("s",""))

# has to be in a list to iterate over it later
emkt = generalConfig["emkt"]
if emkt == "both" or emkt == "Both":
    emkt = ["emkt","mkt"]
else:
    emkt = [emkt]

broker = generalConfig["broker"]

sendTrades = generalConfig["sendTrades"]

# similar to emkt above
dataSources = generalConfig["dataSource"]
if dataSources == "both" or dataSources == "Both":
    dataSources = ["IB","Polygon"]
else:
    dataSources = [dataSources]

macroStrategy = generalConfig["macroStrategy"]
liveTrading = generalConfig["liveTrading"]

startingCashPerAccount = int(generalConfig["startingCashPerAccount"])

# times in EST since that's server time
marketOpen = generalConfig["marketOpen"]
marketClose = generalConfig["marketClose"]

botStartup = generalConfig["botStartup"]
gatewayReset = generalConfig["gatewayReset"]

########################

def NewStocksMenu():
    # Check if new stocks have been added
    Logger("loading in stocks list")

    with open("configs/stocks.yaml") as f:
        stocks = yaml.load(f, Loader = yaml.Loader)["syms"]

    if os.path.isfile("data/stocks.pickle"):

        with open("data/stocks.pickle", "rb") as handle:
            oldStocks = pickle.load(handle)

        # Simple CLI menu to decide whether to rebalance
        if stocks != oldStocks:
            Logger("New stock list detected")

            while True:
                goahead = input("Stock list has changed since last reload, do you wish to continue? (y/n)")
                if (goahead == "n"):
                    Logger("User selected to exit program")
                    sys.exit(0)
                elif (goahead == "y"):
                    goahead = input("This will delete all currently held positions and restart, are you sure? (y/n)")
                    if(goahead == "n"):
                        Logger("User selected to exit program")
                        sys.exit(0)
                    if(goahead == "y"):
                        if os.path.isdir("accounts"):
                            for f in os.listdir("accounts"):
                                os.remove(os.path.join("accounts",f))
                        Logger("Deleted accounts")
                    break
                else:
                    print("Unknown input, please try again (y/n)")

            # Give user a couple of seconds to read messages
            time.sleep(2)

    if not os.path.isdir("data"):
        os.mkdir("data")

    Logger("Writing stocks list to /data")
    with open("data/stocks.pickle", "wb") as handle:
        pickle.dump(stocks, handle, protocol=pickle.HIGHEST_PROTOCOL)

def PlaceOrder(side, timeframe, stock, account):

    if side == "buy":
        # don't do anything if we already have a position
        if stock in account.keys():
            Logger(f"Already have position in {stock}, will not open position")
            return 
        else:
            Logger(f"Attempting to open position in {stock}")

    elif side == "sell":
        if not stock in account.keys():
            Logger(f"No position in {stock} found, sell order not placed")
            return 
        else:
            Logger(f"Attempting to close position in {stock}")

    broker = account["broker"]
    if broker.lower() == "ib":
        tradeDetails = IBPlaceOrder(account, stock, stocks, side.upper())
    elif broker.lower() == "alpaca":

        keys = {}
        with open("configs/alpaca.key","r") as f:
            for line in f:
                keys[line.split(":")[0]] = line.split(":")[1].strip()


        tradeDetails = AlpacaPlaceOrder(account, stock, stocks, side, keys)

    if isinstance(tradeDetails, str):
        Logger("An error has occurred placing an order")
        Logger(tradeDetails)
    else:
        if side == "buy":
            account[stock] = tradeDetails
            account["cash"] = float(account["cash"]) - (float(tradeDetails["size"]) * 
                    float(tradeDetails["price"])) - float(tradeDetails["commission"])
            
        TradeLog(tradeDetails,timeframe,side,account)

        if side == "sell":
            # remove sym from account
            account.pop(stock)
            account["cash"] = float(account["cash"]) + (float(tradeDetails["size"]) * 
                    float(tradeDetails["price"])) - float(tradeDetails["commission"])

        return account
            
def TradeLog(tradeDetails,timeframe,side,account):

    mktDataHours = account["mktDataHours"]
    dataSource = account["dataSource"]

    # abbreviate for trade log
    dataSourceMap = {
            "polygon":"pog",
            "coinbase":"cob",
            "ib":"inb",
            }
    dataSource = dataSourceMap[dataSource.lower()]

    # clean up strat
    timeframe = timeframe

    with open("configs/general.yaml") as f:
        generalConfig = yaml.load(f, Loader = yaml.Loader)
        
    macroStrategy = generalConfig["macroStrategy"]

    if side.upper() == "SELL":
        sellCommission = float(tradeDetails["commission"])
        buyCommission = float(account[tradeDetails["sym"]]["commission"])

        pctReturnExcl =  str((float(tradeDetails["price"])/float(account[tradeDetails["sym"]]["price"])) - 1)
        pctReturnIncl =  str(((float(tradeDetails["price"])*float(tradeDetails["size"]) - sellCommission) \
                                /(float(account[tradeDetails["sym"]]["price"])*float(tradeDetails["size"]) + buyCommission)) - 1)

    else:
        totalCommission = ""
        pctReturnExcl = ""
        pctReturnIncl = ""

    tradeCommission = tradeDetails["commission"]

    if not os.path.isdir("logs/live"):
        os.mkdir("logs/live")

    if not os.path.isdir("logs/forward-testing"):
        os.mkdir("logs/forward-testing")

    if liveTrading == "True":
        logFileName = f"logs/live/{macroStrategy}.csv"
    else:
        logFileName = f"logs/forward-testing/{macroStrategy}.csv"

    if not os.path.isfile(logFileName):
        with open(logFileName,"w") as tradefile:
            tradefile.write("id,time,sym,parameters,side,quantity,price,\
                    commission,pct_return (excl commission), pct_returns ( incl commission)\n")

    tradeTime = datetime.now()
    tradeTimeStr = tradeTime.strftime("%Y-%m-%d %H:%M:%S")
    microStrategy = f"{timeframe}_{mktDataHours}_{dataSource}"

    if sendTrades.lower() == "true":
        ## Push to mongoDB
        client = pymongo.MongoClient(mongoUrl)
        collection = client["backtesting_trades"]["trading-history"]
        post = {
                "date":tradeTime,
                "symbol":tradeDetails['sym'],
                "side":side,
                "quantity":tradeDetails['size'],
                "price":tradeDetails['price'],
                "macro_strategy":macroStrategy,
                "micro_strategy":microStrategy,
                }
        post_id = collection.insert_one(post).inserted_id

    with open(logFileName, "a") as tradefile:
        tradefile.write(f"{post_id}," + tradeTimeStr + "," + \
                f"{tradeDetails['sym']},{macroStrategy}-{microStrategy},{side}," + \
                f"{tradeDetails['size']},{tradeDetails['price']}," + \
                f"{tradeCommission},{pctReturnExcl},{pctReturnIncl}\n")

def Logger(tolog):
    print("LOG: " + tolog)

    if (os.path.isdir("logs") == False):
        os.mkdir("logs")
        
    with open("logs/" + datetime.now().strftime("%Y-%m-%d") + ".txt", "a") as logfile:
        logfile.write(datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "| " + tolog + "\n")

def Checks():
    # Check if the market is open
    # This may or may not need to be re-done
    now = datetime.now()
    currentTime = now.strftime("%H:%M:%S")

    if now.today().weekday() >= 5:
        print("It's the weekend, disconnecting from the gateway and exiting")
        print("Remember to restart the gateway and this program on Monday morning!")
        sys.exit()

    if currentTime < marketOpen or currentTime > marketClose:
        print("outside of market hours")
        return False

    return True

def GetAllVerdicts(mktDataHours, dataSource):

    # all bar durations that we need
    distinctBarDurations = set(itertools.chain(*[x.split("-") for x in timeframes]))

    verdicts = {}
    for barDuration in distinctBarDurations:
        barDuration = barDuration.strip()
        ## Do this programatically if we end up with lots of data sources
        Logger(f"Retrieving {mktDataHours} {barDuration} data from {dataSource}")
        if dataSource == "IB":
            verdicts[barDuration] = IBGetVerdict(barDuration,
                    mktDataHours, stocks)
        elif dataSource == "Polygon":
            if not os.path.isfile("configs/polygon.key"):
                print("Polygon Key not found!")
                sys.exit()

            with open("configs/polygon.key","r") as f:
                apiKey = f.readline().rstrip()

            verdicts[barDuration] = PolygonGetVerdict(barDuration,
                    mktDataHours, stocks, apiKey)
        Logger(f"Retrieved {mktDataHours} {barDuration} data from {dataSource}")

    return verdicts

def ConfirmCandles(timeframe, currentState, verdicts):

    confirmTimeFrames = timeframe.split(">")

    if len(confirmTimeFrames) == 1:
        return dict.fromkeys(stocks,True)
    else:
        confirmTimeFrames = confirmTimeFrames[1:]

    toBuy = {}
    for stock in stocks:
        confirm = [verdicts[timeFrame][verdicts[timeFrame]["sym"] == stock].iloc[0]["verdict"] 
                for timeFrame in confirmTimeFrames ] 
        if (not stock in currentState.keys()) or currentState[stock] == False:
            if all(["buy" == x for x in confirm]):
                toBuy[stock] = True
            else:
                toBuy[stock] = False

        elif currentState[stock] == True:
            if any(["sell" == x for x in confirm]):
                toBuy[stock] = False
            else:
                toBuy[stock] = True

    return toBuy

def ManageAccount(timeframe, verdicts, mktDataHours, dataSource, broker):

    if not os.path.isdir("accounts"):
        Logger("Creating accounts folder")
        os.mkdir("accounts")

    filename = f"accounts/{macroStrategy}-{mktDataHours}" + \
               f"-{timeframe}-{dataSource}-{broker}broker.pickle"\
            .replace(" ","").replace(">","-")

    account = {}
    if not os.path.isfile(filename):
        account["cash"] = startingCashPerAccount
        # Confirmation candles status, whether we can trade
        account["buy"] = dict.fromkeys(stocks,False)
        account["mktDataHours"] = mktDataHours
        account["dataSource"] = dataSource
        account["broker"] = broker
        with open(filename, "wb") as handle:
            pickle.dump(account, handle, protocol=pickle.HIGHEST_PROTOCOL)
        Logger(f"Created new accounts file for {timeframe}")
        
    with open(filename, "rb") as handle:
        account = pickle.load(handle)

    account["buy"] = ConfirmCandles(timeframe, account["buy"], verdicts)

    Logger(f"Loaded account file for {timeframe}")

    for stock in stocks:
        if account["buy"][stock] == True:
            tradeVerdict = verdicts[timeframe.split("-")[0]]
            tradeVerdict = tradeVerdict[ tradeVerdict["sym"] == stock].iloc[0]["verdict"]
            Logger(f"{tradeVerdict} verdict for {stock}")

            if tradeVerdict == "buy" or tradeVerdict == "sell":
                newAccount = PlaceOrder(tradeVerdict, timeframe, stock, account)
                if newAccount is not None:
                    newAccount["mktDataHours"] = mktDataHours
                    newAccount["dataSource"] = dataSource
                    newAccount["broker"] = broker
                    with open(filename, "wb") as handle:
                        pickle.dump(newAccount, handle, protocol=pickle.HIGHEST_PROTOCOL)
            
        elif account["buy"][stock] == False and stock in account.keys():
            Logger(f"No confirmation candles for {stock}, exiting positions")

    print(account)


def Judge():

    # these nested for loops are getting out of hand,
    # find a nicer way to address this
    for dataSource in dataSources:
        for mktDataHours in emkt: 
            # Get all verdicts for bar types in strategies.yaml
            verdicts = GetAllVerdicts(mktDataHours, dataSource)
            for timeframe in timeframes:
                ManageAccount(timeframe, verdicts, mktDataHours, dataSource, broker)


if __name__ == "__main__":


    with open("configs/strategies.yaml","r") as f:
        timeframes = yaml.load(f, Loader = yaml.Loader)["strategies"]

    NewStocksMenu()

    with open('data/stocks.pickle', 'rb') as handle:
        stocks = pickle.load(handle)

    while True:
        if Checks():
            Logger("================= LOOP START =====================")
            Judge()
        time.sleep(refreshtime)
