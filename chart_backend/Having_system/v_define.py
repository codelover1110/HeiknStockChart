API_KEY = 'tuQt2ur25Y7hTdGYdqI2VrE4dueVA8Xk'
MONGO_URL = 'mongodb://root:rootUser2021@20.84.64.243:27017'

STOCK_WEBSOCKET_URL = "wss://delayed.polygon.io/stocks"
CRYPTO_WEBSOCKET_URL = "wss://socket.polygon.io/crypto"

SYMBOL_TYPE_STOCK = 'stock'
SYMBOL_TYPE_CRYPTO = 'crypto'

CHANNEL_ACTION_CREATE = 'create_fields'
CHANNEL_ACTION_CHANGE_FIELDS = 'change_fields'
CHANNEL_ACTION_CHANGE_SYMBOL_TYPE = 'change_symbol_type'

STOCK_CHART_DB_NAME = 'chart_market_data'
STOCK_LAST_UPDATE_DATE_COL = "stock_symbol_last_date"

CRYPTO_CHART_DB_NAME = 'chart_market_data'
CRYPTO_LAST_UPDATE_DATE_COL = "crypto_symbol_last_date"

NASDAQ_100_DB_NAME = "nasdaq100"
NASDAQ_100_LAST_UPDATE_DATE_COL = 'symbol_last_date'

STOCK_MARKET_DATA_ALL_DB = 'stock_market_data_all'
STOCK_LAST_UPDATE_DATE_ALL_COL = 'symbol_last_date'

TICKER_NEWS_DB = 'sticker_news'
TICKER_NEWS_META_DATA_COL = 'news_meta_data'
TICKER_NEWS_LAST_UPDATE_COL = 'last_update_date'

FINANCIALS = 'financials_data_1008'
FINANCIALS_COL_NAME = 'financials'
DETAILS = 'ticker_details'
DETAILS_COL_NAME = 'ticker_detail_meta_data'
PARAMETERS = 'parame'

SCANNER_DB = 'scanner'
SCANNER_VIEWS = 'scanner_views'

PARAMETERS_DB = 'parameters'
INDICATORS_COL_NAME = 'indicators'
INDICATOR_SIGNALLING_COL_NAME = 'indicator_signalling'
WATCHLIST_COL_NAME = 'watchlists'

SCANNER_FINANCIAL_DETAIL_FIELDS = {
        "_id": 0,
        "calendarDate": 1,
        "currentRatio": 1,
        "debt": 1,
        "period": 1,
        "updated": 1,
        "assetsCurrent": 1,
        "assets": 1,
        "profitMargin": 1,
        "shares": 1,
        "taxAssets": 1
    }


SCANNER_TICKER_DETAIL_FIELDS = {
        "_id": 0,
        "country": 1,
        "phone": 1,
        "url": 1,
        "hq_state": 1,
        "type": 1,
        "updated": 1,
        "active": 1,
        "ceo": 1,
        "exchangeSymbol": 1,
        "name": 1
    }

INTERVALS = [
    # [['1', 'minute'], 1, False, 30],
    # [['2', 'minute'], 2, False, 30],
    # [['12', 'minute'], 12, False, 30],
    # [['1', 'hour'], 1*60, False, 40],
    # [['4', 'hour'], 4*60, False, 90],
    [['12', 'hour'], 12*60, False, 90],
    [['1', 'day'], 24*60, False, 365],
]