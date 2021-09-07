import numpy as np
from datetime import datetime, timedelta

from ib_insync import util
from pymongo.common import MIN_SUPPORTED_SERVER_VERSION
from .lib.heikfilter import HA, Filter
from .models import get_strategy_name_only

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
        candle_interval = int(interval_num)
    elif interval_unit in 'hours':
        candle_interval = int(interval_num) * 60
    elif interval_unit in 'days':
        candle_interval = int(interval_num) * 60 * 60

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

def calc_winningLosing(symbols, db_data):
    wL = []   
    for symbol in symbols:
        winningLosing_temp = {
            'symbol': symbol,
            'winning': 0,
            'losing': 0
        }
        pair_wL = {}
        for db_collection in db_data:
            side = db_collection['side']
            if symbol == db_collection['symbol']:
                pair_wL[side] = float(db_collection['price'])
                if 'BUY' in pair_wL and 'SELL' in pair_wL:
                    calc = pair_wL['SELL'] - pair_wL['BUY']
                    if calc > 0:
                        winningLosing_temp['winning'] =  winningLosing_temp['winning'] + 1
                    else:
                        winningLosing_temp['losing'] =  winningLosing_temp['losing'] + 1
                    pair_wL = {}
        wL.append(winningLosing_temp)
    return wL

def calc_percentEfficiency(symbols, db_data):
    pE = []
    wLA = []
    lS = []
    for symbol in symbols:
        pair_pE = {}
        sym_pE = []
        winningT = []
        losingT = []
        for db_collection in db_data:
            side = db_collection['side']
            if symbol == db_collection['symbol']:
                pair_pE[side] = {
                    "price": float(db_collection['price']),
                    "date": db_collection['date']
                    }
                if 'BUY' in pair_pE and 'SELL' in pair_pE:
                    percent = float(pair_pE['SELL']['price']) * 100  / float(pair_pE['BUY']['price'])
                    # percent = round(percent, 2)
                    percent = percent - 100
                    percent = round(percent, 3)
                    if pair_pE['SELL']['date'].timestamp() - pair_pE['BUY']['date'].timestamp() > 0:
                        entry = 'BUY'
                        exit = 'SELL'
                        exit_date = pair_pE['SELL']['date']
                    else:
                        entry = 'SELL'
                        exit = 'BUY'
                        exit_date = pair_pE['BUY']['date']

                    sym_pE.append({
                        'date': exit_date,
                        'percent': percent,
                        'entry': entry,
                        'exit': exit,
                        'efficiency': percent
                    })
                    pair_pE = {}
                    # print("percent", percent)
                    if percent > 0:
                        winningT.append(percent)
                    else:
                        losingT.append(percent)
              

        avgWinning = 0
        avgLosing = 0
        avgWinning = sum(winningT) / len(winningT) if len(winningT) > 0 else 0
        avgWinning = round(avgWinning, 3)
        avgLosing = sum(losingT) / len(losingT) if len(losingT) > 0 else 0
        avgLosing = round(avgLosing, 3)
        wLA.append({
            "symbol": symbol,
            "avgWinning": avgWinning,
            "avgLosing": abs(avgLosing)
        })

        # Calculation Long and Short
        short = 0
        long = 0
        if len(sym_pE) > 0 and sym_pE[-1]['entry'] == 'BUY':
            long = sym_pE[-1]['percent']
            short = 0
        elif len(sym_pE) > 0 and sym_pE[-1]['entry'] == 'SELL':
            long = 0
            short = sym_pE[-1]['percent']
        lS.append({
            symbol: {
                'long': long,
                'short': short,
            }
        })
        # Calculation efficiency
        # for sym_item in sym_pE:
        #     sym_item['efficiency'] = 0
        #     if long > 0:
        #         sym_item['efficiency'] = sym_item['percent'] * 100/long
        #     elif short > 0:
        #         sym_item['efficiency'] = sym_item['percent'] * 100/short

        pE.append({
            symbol: sym_pE
        })
    
    return {
        "pE": pE,
        "wLA": wLA,
        "lS": lS
    }

def fill_missing_candles__(chat_candles, candle_name, strategy_name):
    strategy_names = get_strategy_name_only()
    macro_name = strategy_name.split('-')[0]
    macro_strategies = []
    for strtg in strategy_names:
        if macro_name in strtg:
            macro_strategies.append(strtg)
    available_strategies = get_chat_available_stratgies(candle_name, macro_strategies)
    if strategy_name in available_strategies:
        insert_candles = []
        for candle in chat_candles:
            try:
                trades = candle['trades']
                if len(trades) > 1:
                    single_trades = trades[0]
                    candle['trades'] = [single_trades]
                    for trade_idx in range(1, len(trades)):
                        new_candle_trades = trades[trade_idx]
                        new_candle = candle.copy()
                        new_candle['trades'] = [new_candle_trades]
                        new_candle['date'] = new_candle_trades['trade_date']
                        insert_candles.append(new_candle)
            except:
                pass
        chat_candles.extend(insert_candles)
        chat_candles.sort(key = lambda x: x['date'])

    return chat_candles

