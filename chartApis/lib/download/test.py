import importlib
import pathlib
import numpy as np
import pandas as pd
import time
import os
import sys
import pymongo
import math
import pickle
import json
import itertools
pd.options.mode.chained_assignment = None  # default='warn'
from datetime import datetime,date
import yaml

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

    tradeDetails = order_routing.DoTrade(account, stock, watchlist, side)

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

    with open("config.json") as f:
        generalConfig = yaml.load(f, Loader = yaml.Loader)
        
    macroStrategy = generalConfig["macro_strategy"]

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

    if sendToMongo.lower() == "true":
        ## Push to mongoDB
        client = pymongo.MongoClient(mongoUrl)
        collection = client["backtesting_trades"]["trade-history"]
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
    else:
        post_id = "1123"


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

def GetAllVerdicts(mktDataHours):

    # all bar durations that we need
    distinctBarDurations = set(itertools.chain(*[x.split("-") for x in timeframes]))

    verdicts = {}
    for barDuration in distinctBarDurations:
        barDuration = barDuration.strip()
        ## Do this programatically if we end up with lots of data sources
        Logger(f"Retrieving {mktDataHours} {barDuration} data from {dataSource}")
        verdicts[barDuration] = data_source.GetVerdicts(barDuration,
                mktDataHours, watchlist)
        Logger(f"Retrieved {mktDataHours} {barDuration} data from {dataSource}")

    return verdicts

def ConfirmCandles(timeframe, currentState, verdicts):

    confirmTimeFrames = timeframe.split(">")

    if len(confirmTimeFrames) == 1:
        return dict.fromkeys(watchlist,True)
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

def ManageAccount(timeframe, verdicts, mktDataHours, dataSource):

    if not os.path.isdir("accounts"):
        Logger("Creating accounts folder")
        os.mkdir("accounts")

    filename = f"accounts/{macroStrategy}-{mktDataHours}" + \
               f"-{timeframe}-{dataSource}.json"\
            .replace(" ","").replace(">","-")

    account = {}
    if not os.path.isfile(filename):
        account["cash"] = startingCashPerAccount
        # Confirmation candles status, whether we can trade
        account["buy"] = dict.fromkeys(watchlist,False)
        account["mktDataHours"] = mktDataHours
        account["dataSource"] = dataSource
        account["broker"] = broker
        with open(filename, "w") as handle:
            json.dump(account, handle)
        Logger(f"Created new accounts file for {timeframe}")
        
    with open(filename, "r") as handle:
        account = json.load(handle)

    account["buy"] = ConfirmCandles(timeframe, account["buy"], verdicts)

    Logger(f"Loaded account file for {timeframe}")

    for stock in watchlist:
        if account["buy"][stock] == True:
            tradeVerdict = verdicts[timeframe.split("-")[0]]
            tradeVerdict = tradeVerdict[ tradeVerdict["sym"] == stock].iloc[0]["verdict"]
            Logger(f"{tradeVerdict} verdict for {stock}")

            if tradeVerdict in ["buy","sell"]:
                Logger(f"{tradeVerdict} {stock}")
                newAccount = PlaceOrder(tradeVerdict, timeframe, stock, account) 

                if newAccount is not None:
                    newAccount["mktDataHours"] = mktDataHours
                    newAccount["dataSource"] = dataSource
                    newAccount["broker"] = broker
                    with open(filename, "w") as handle:
                        json.dump(newAccount, handle)
            
        elif account["buy"][stock] == False and stock in account.keys():
            Logger(f"No confirmation candles for {stock}, exiting positions")

    print(account)


def Judge():

    verdicts = GetAllVerdicts(mktDataHours)
    ManageAccount(timeframes[0], verdicts, mktDataHours, dataSource)


if __name__ == "__main__":

    thisfile = pathlib.Path(__file__).parent.resolve()

    os.chdir(thisfile)

    with open("config.json","r") as f:
        config = json.load(f)

    with open("watchlist.json","r") as f:
        watchlist = json.loads(json.load(f))["tickers"]

    order_routing = importlib.import_module(f"{config['order_routing']}_order_routing", package=None)
    # DoTrade(account, stock, stocks, side, apiKey)

    data_source = importlib.import_module(f"{config['data_source']}_data_source", package=None)
    # GetVerdicts(barSize, mktDataHours, stocks)


    macroStrategy = config['macro_strategy']
    liveTrading = config['live_trading']
    startingCashPerAccount = int(config["starting_cash"])
    mktDataHours = config["hours"]
    timeframes = [config["timeframe"]]
    dataSource = config["data_source"]
    broker = config["order_routing"]


    with open("general.json") as f:
        generalConfig = json.loads(json.load(f))

    mongoUrl = generalConfig["mongo_url"]
    sendToMongo = generalConfig["send_to_mongo"]
    ## time to wait between grabbing syms in seconds
    refreshtime = int(generalConfig["refresh_time"].replace("s",""))

    while True:
        Judge()
        time.sleep(60)

