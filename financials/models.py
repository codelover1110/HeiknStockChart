from datetime import datetime, timedelta
import pymongo

# mongoclient = pymongo.MongoClient("mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority") 
mongoclient = pymongo.MongoClient('mongodb://user:-Hz2f$!YBXbDcKG@cluster0-shard-00-00.vcom7.mongodb.net:27017,cluster0-shard-00-01.vcom7.mongodb.net:27017,cluster0-shard-00-02.vcom7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7w6acj-shard-0&authSource=admin&retryWrites=true&w=majority')
FINANCIALS = 'financials_data'
COL_NAME = 'financials'

def get_symbol_financials(symbol):
    query = {
        "ticker": symbol
    }

    news_db = mongoclient[FINANCIALS]
    db_collection = news_db[COL_NAME]
    result = list(db_collection.find(query, {'_id': False}))
    return result


def get_income_statement(symbol):
    query = {
        "ticker": symbol
    }
    fields = {
        "_id": 0,
        "calendarDate": 1, 
        "revenues": 1,
        "costOfRevenue": 1,
        "grossProfit": 1,
        "EBITDAMargin": 1,
        "netIncome": 1,
        "earningsPerBasicShare": 1
    }

    financials_db = mongoclient[FINANCIALS]
    db_collection = financials_db[COL_NAME]
    financials_list = list(db_collection.find(query, fields))
    revenues, costOfRevenue, grossProfit, EBITDAMargin, earningsPerBasicShare = {}, {}, {}, {}, {}
    for financials in financials_list:
        if 'calendarDate' in financials.keys() and len(financials.keys()) == 7:
            key = financials['calendarDate']
            revenues[key] = financials['revenues']
            costOfRevenue[key] = financials['costOfRevenue']
            grossProfit[key] = financials['grossProfit']
            EBITDAMargin[key] = financials['EBITDAMargin']
            earningsPerBasicShare[key] = financials['earningsPerBasicShare']


    result = dict()
    result['revenues'] = revenues
    result['costOfRevenue'] = costOfRevenue
    result['grossProfit'] = grossProfit
    result['EBITDAMargin'] = EBITDAMargin
    result['earningsPerBasicShare'] = earningsPerBasicShare

    return result

def get_balance_sheet(symbol):
    query = {
        "ticker": symbol
    }
    fields = {
        "_id": 0,
        "calendarDate": 1, 
        "assets": 1,
        "liabilitiesNonCurrent": 1,
        "debt": 1,
        "tradeAndNonTradeReceivables": 1,
        "tradeAndNonTradePayables": 1,
        "cashAndEquivalents": 1
    }

    financials_db = mongoclient[FINANCIALS]
    db_collection = financials_db[COL_NAME]
    financials_list = list(db_collection.find(query, fields))
    assets, liabilitiesNonCurrent, debt, tradeAndNonTradeReceivables, tradeAndNonTradePayables, cashAndEquivalents = {}, {}, {}, {}, {}, {}
    for financials in financials_list:
        if 'calendarDate' in financials.keys() and len(financials.keys()) == 7:
            key = financials['calendarDate']
            assets[key] = financials['assets']
            liabilitiesNonCurrent[key] = financials['liabilitiesNonCurrent']
            debt[key] = financials['debt']
            tradeAndNonTradeReceivables[key] = financials['tradeAndNonTradeReceivables']
            tradeAndNonTradePayables[key] = financials['tradeAndNonTradePayables']
            cashAndEquivalents[key] = financials['cashAndEquivalents']

    result = dict()
    result['assets'] = assets
    result['liabilitiesNonCurrent'] = liabilitiesNonCurrent
    result['debt'] = debt
    result['tradeAndNonTradeReceivables'] = tradeAndNonTradeReceivables
    result['tradeAndNonTradePayables'] = tradeAndNonTradePayables
    result['cashAndEquivalents'] = cashAndEquivalents

    return result

def get_cash_statement(symbol):
    query = {
        "ticker": symbol
    }
    fields = {
        "_id": 0,
        "calendarDate": 1, 
        "netCashFlowFromOperations": 1,
        "netCashFlowFromInvesting": 1,
        "netCashFlowFromFinancing": 1,
    }

    financials_db = mongoclient[FINANCIALS]
    db_collection = financials_db[COL_NAME]
    financials_list = list(db_collection.find(query, fields))
    netCashFlowFromOperations, netCashFlowFromInvesting, netCashFlowFromFinancing = {}, {}, {}
    for financials in financials_list:
        if 'calendarDate' in financials.keys() and len(financials.keys()) == 7:
            key = financials['calendarDate']
            netCashFlowFromOperations[key] = financials['netCashFlowFromOperations']
            netCashFlowFromInvesting[key] = financials['netCashFlowFromInvesting']
            netCashFlowFromFinancing[key] = financials['netCashFlowFromFinancing']

    result = dict()
    result['netCashFlowFromOperations'] = netCashFlowFromOperations
    result['netCashFlowFromInvesting'] = netCashFlowFromInvesting
    result['netCashFlowFromFinancing'] = netCashFlowFromFinancing

    return result



def get_financial_total_data(symbol):
    query = {
        "ticker": symbol
    }
    fields = {
        "_id": 0,
        "date": 0
    }

    financials_db = mongoclient[FINANCIALS]
    db_collection = financials_db[COL_NAME]
    financials_list = list(db_collection.find(query, fields))
    return financials_list