
from ib_insync import *
import math
import time
import requests
import json


# This sub-module contains functions for interfacing with particular
# brokers, allowing paper-trader.py to be agnostic to the broker used


def IBPlaceOrder(account, stock, stocks, side ):
    """
    Makes sure our order goes through and that we have enough cash
    """

    ibOrder = IB()
    ibOrder.connect('127.0.0.1', 7496, clientId=3)

    freeCash = 0.95*(float(account["cash"])/float(len(stocks)))

    contract = Stock(stock,'SMART', 'USD',primaryExchange='NASDAQ')

    ibOrder.qualifyContracts(contract)

    # Determine how many shares to buy
    if side == "BUY":
        data = ibOrder.reqMktData(contract)

        counter = 0 
        while data.bid != data.bid: 
            ibOrder.sleep(0.01) #Wait until data is in (nan != nan is True)
            counter += 1
            if counter > 10000:
                ibOrder.disconnect()
                return "Error requesting market data when opening position, aborting"

        bid = data.bid # could also use data.marketPrice()
        ibOrder.cancelMktData(contract)

        if bid == -1: 
            ibOrder.disconnect()
            return f"Bid price for {stock} is -1, Market is likely closed"

        position = math.floor(freeCash/bid)

        if position == 0:
            ibOrder.disconnect()
            return f"Not enough cash to buy 1 share of {stock}, no order placed"
    else:
        position = account[stock]["size"]

    order = MarketOrder(side, position)
    trade = ibOrder.placeOrder(contract, order)

    counter = 0 
    while not trade.isDone():
        ibOrder.sleep(0.01)
        counter += 1
        if counter > 10000:
            ibOrder.cancelOrder(order)
            ibOrder.disconnect()
            return f"Something went wrong placing a market {side} order on {stock}"

    # Wait for commission data to come through
    while 0 in [x.commissionReport.commission for x in trade.fills] or \
            [] == [x.commissionReport.commission for x in trade.fills]:
        ibOrder.sleep(0.1)

    commission = sum([x.commissionReport.commission for x in trade.fills])

    # record information about the  trade to be used to calculate profit/loss later
    tradeDetails = {
            "id":trade.order.orderId,
            "sym":stock,
            "size":float(trade.order.totalQuantity),
            "price":float(trade.orderStatus.avgFillPrice),
            "commission":float(sum([x.commissionReport.commission for x in trade.fills]))
                      }

    ibOrder.disconnect()

    return tradeDetails

def AlpacaPlaceOrder(account, stock, stocks, side, apiKey):
    """
    Makes sure our order goes through and that we have enough cash
    """

    baseUrl = "https://paper-api.alpaca.markets"

    freeCash = 0.95*(float(account["cash"])/float(len(stocks))) 



    headers = {
            "APCA-API-KEY-ID":apiKey["APCA-API-KEY-ID"],
            "APCA-API-SECRET-KEY":apiKey["APCA-API-SECRET-KEY"],
            }

    
    parameters = {
            "symbol":stock,
            "side":side.lower(),
            "type":"market",
            "time_in_force":"day",
            }

    if side.upper() == "BUY":
        parameters["notional"] = str(freeCash)
    else:
        parameters["qty"] = account[stock]["size"]

    order = requests.post(url = f"{baseUrl}/v2/orders", 
            json = parameters, headers = headers).json()

    if "client_order_id" not in order.keys():
        if "message" in order.keys():
            return f"Order Id not in response: {order['message']}"
        return f"Order Id not in response" 

    orderId = order["client_order_id"]

    counter = 0 
    while not order["status"] == "filled":
        time.sleep(0.5)
        order = requests.get(url = f"{baseUrl}/v2/orders:by_client_order_id" + \
                f"?client_order_id={orderId}",
                headers = headers).json()
        counter += 1
        if counter > 100:
            return f"Something went wrong placing a market {side} order on {stock}\n" + \
                    f"{order}"

    commission = 0 

    # record information about the  trade to be used to calculate profit/loss later
    tradeDetails = {
            "id":order["client_order_id"],
            "sym":stock,
            "size":order["filled_qty"],
            "price":order["filled_avg_price"],
            "commission":0
                      }

    return tradeDetails
    


