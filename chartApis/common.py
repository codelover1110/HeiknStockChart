import numpy as np
from datetime import datetime, timedelta

from ib_insync import util
from pymongo.common import MIN_SUPPORTED_SERVER_VERSION
from .lib.heikfilter import HA, Filter

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

def dataConverter(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, datetime.datetime):
        return obj.__str__()

def get_chat_data_from_candles(candles):
    df = util.df(candles)
    df = Filter(df)
    # chat_candles = get_chat_data(df)
    hadf = HA(df) 
    heik = (hadf["c"] - hadf["o"]).rolling(window=3).mean()
    heik_diff = heik.diff()
    df.replace(np.nan, 0)
    result_data = []
    for data in df.iloc:
        if( data.rsi2 >= 0 and data.rsi3 >= 0):
            side = "buy"
        elif ( data.rsi2 <= 0 and heik_diff.iloc[-1] <= 0):
            side = "sell"
        elif ( data.rsi1 >= 0):
            side = "hold"
        else:
            side = "wait"
        rsi = dataConverter(np.nan_to_num(data.RSI))
        rsi2 = dataConverter(np.nan_to_num(data.rsi2))
        rsi3 = dataConverter(np.nan_to_num(data.rsi3))
        heik = dataConverter(np.nan_to_num(data.rsi2))
        heik2 = dataConverter(np.nan_to_num(data.rsi3))
        # heik = dataConverter(np.nan_to_num(heik_diff.iloc[-1]))
        # heik2 = dataConverter(np.nan_to_num(heik_diff.iloc[-2]))

        result_data.append({
            'close': float(data.c),
            'date': data.date,
            'high': float(data.h),
            'low': float(data.l),
            'open': float(data.o),
            'percentChange': "",
            'volume': int(data.v),
            'RSI': rsi,
            'side': side,
            'rsi': {'bearPower': rsi, 'bullPower': rsi},
            'rsi2': {'bearPower': rsi2, 'bullPower': rsi2},
            'rsi3': {'bearPower': rsi3, 'bullPower': rsi3},
            'heik': {'bearPower': heik, 'bullPower': heik},
            'heik2': {'bearPower': heik2, 'bullPower': heik2},
        })
    
    return result_data 

def join(candles, strategy_trades, strategy_name):
    candle_len = len(candles)
    candle_cursor = 0
    insert_candles = []
    for trades_data in strategy_trades:
        trade_date = trades_data['date']
        for idx in range(candle_cursor, candle_len):
            candle = candles[idx]
            if candle['date'] > trade_date and idx != 0:
                update_candle = candles[idx-1]
                if 'price' not in update_candle.keys():
                    update_candle['price'] = round(float(trades_data['price']), 2)
                    update_candle['quantity'] = round(float(trades_data['quantity']), 2)
                    update_candle['side'] = trades_data['side']
                    update_candle['trade_date'] = trade_date
                    update_candle['strategy'] = strategy_name
                else:
                    insert_candle = update_candle.copy()
                    insert_candle['date'] = trade_date
                    insert_candle['price'] = round(float(trades_data['price']), 2)
                    insert_candle['quantity'] = round(float(trades_data['quantity']), 2)
                    insert_candle['side'] = trades_data['side']
                    insert_candle['trade_date'] = trade_date
                    insert_candle['strategy'] = strategy_name
                    insert_candles.append(insert_candle)
                candle_cursor = idx
                break
    candles.extend(insert_candles)
    # print (insert_candles)
    candles.sort(key = lambda x: x['date'])

    return candles

def join_append(candles, strategy_trades, strategy_name):
    candle_len = len(candles)
    candle_cursor = 0
    for trades_data in strategy_trades:
        trade_date = trades_data['date']
        for idx in range(candle_cursor, candle_len):
            candle = candles[idx]
            if candle['date'] > trade_date and idx != 0:
                update_candle = candles[idx-1]
                if trades_data['side'] == 'BUY':
                    side_type = 'LONG'
                elif trades_data['side'] == 'SELL':
                    side_type = 'SHORT'
                trade_item = dict()
                trade_item['longShort'] = side_type
                trade_item['trade_date'] = trade_date
                trade_item['price'] = round(float(trades_data['price']), 2)
                trade_item['strategy'] = strategy_name
                trade_item['quantity'] = round(float(trades_data['quantity']), 2)
                if 'trades' not in update_candle.keys():
                    update_candle['trades'] = [trade_item]
                else:
                    trades = update_candle['trades']
                    trades.append(trade_item)
                    update_candle['trades'] = trades
                candle_cursor = idx
                break

    return candles

def get_chat_available_stratgies(candle_name, all_strategies):
    # get candle interval 
    interval_unit = candle_name.split('_')[-1]
    candle_interval = 0        # minute
    interval_num = candle_name.split('_')[1]
    if interval_unit in 'minutes':
        candle_interval = interval_num
    elif interval_unit in 'hours':
        candle_interval = interval_num * 60
    elif interval_unit in 'days':
        candle_interval = interval_num * 60 * 60

    result = []
    for strategy_name in all_strategies:
        base_interval_str = strategy_name.split('-')[1]
        base_interval = 0
        if 'min' in base_interval_str:
            base_interval = int(base_interval_str.split('min')[0])
        if 'hour' in base_interval_str:
            base_interval = int(base_interval_str.split('hour')[0]) * 60
        
        if base_interval >= candle_interval:
            result.append(strategy_name)
    
    return result


