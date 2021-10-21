from datetime import datetime, timedelta
import pandas as pd

def define_start_date(candle_name):
    cur_date = datetime.now().date()
    
    if candle_name == 'backtest_2_minute':
        start_time = cur_date - timedelta(days=20)
    elif candle_name == 'backtest_12_minute':
        start_time = cur_date - timedelta(days=20)
    elif candle_name == 'backtest_1_hour':
        start_time = cur_date - timedelta(days=30)
    elif candle_name == 'backtest_4_hour':
        start_time = cur_date - timedelta(days=90)
    elif candle_name == 'backtest_12_hour':
        start_time = cur_date - timedelta(days=90)
    elif candle_name == 'backtest_1_day':
        start_time = cur_date - timedelta(days=365)
    
    cur_date = cur_date + timedelta(days=1)
    return datetime.strptime(str(start_time), '%Y-%m-%d'), datetime.strptime(str(cur_date), '%Y-%m-%d')

def check_candle_in_maket_time(candle):
    market_start_time = [9, 30]
    market_end_time = [16, 30]

    candle['date'] = datetime.fromtimestamp(candle['t']/1000) - timedelta(hours=2)
    year = int(candle['date'].strftime("%Y"))
    month = int(candle['date'].strftime("%m"))
    day = int(candle['date'].strftime("%d"))
    mk_start = datetime(year, month, day, market_start_time[0], market_start_time[1])
    mk_end = datetime(year, month, day, market_end_time[0], market_end_time[1])
    if mk_start <= candle['date'] <= mk_end:
        return True
    else:
        return False

def get_symbol_exchange(symbol):
    file_name = 'chartApis/nasdaq_screener_1633384666001.csv'
    df = pd.read_csv(file_name)
    nasdaq_symbols = df['Symbol'].tolist()
    crypto_symbols = ["BTC","ETH","DOGE","BCH","LTC"]
    if symbol in nasdaq_symbols:
        return "nasdaq"
    elif symbol in crypto_symbols:
        return "crypto"
    
        
    

