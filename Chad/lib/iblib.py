
### A collection of functions for interacting with IB

def AccountValue():
    """
    Calculates total account value, includes all stocks and cash in account
    """
    cashTotal = CashBalance()
    totalStockPosition = 0
    for stock in stocks:
        totalStockPosition += PositionSize(stock)["size"]

    return float(totalStockPosition) + float(cashTotal)

def CashBalance():
    """
    Retrieves total cash (USD) available in your IB account
    """
    cashBalance = [v for v in ib.accountValues() if v.tag == 'CashBalance'
            and v.currency == 'USD'][0].value
    return float(cashBalance)

