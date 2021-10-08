import numpy as np
from datetime import datetime, timedelta

from ib_insync import util
from pymongo.common import MIN_SUPPORTED_SERVER_VERSION
from .lib.heikfilter import HA, Filter
from .lib.ts_rsi_heik_v1 import Filter as rsi_heik_v1_fitler
from .lib.ts_rsi_heik_v1_1 import Filter as rsi_heik_v1_fitler_1
from .models import get_strategy_name_only, get_micro_strategies

def dataConverter(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, datetime.datetime):
        return obj.__str__()

def define_color(value, candle, pre_candle):
    if value > 0:
        if candle > pre_candle :
            return "l_g" # light green
        else:
            return "d_g" # dark green
    else:
        if candle > pre_candle :
            return "l_r" # light red
        else:
            return "d_r" # dark red

def get_chat_data_from_candles(candles):
    result_data = []
    for idx in range(0, len(candles)-25):
        sub_candles = candles[idx:idx+24]
        df = util.df(sub_candles)
        result_data.append(rsi_heik_v1_fitler_1(df))
    return result_data 

def get_chat_data_rsi_heik_v1(candles):
    df = util.df(candles)
    hadf = rsi_heik_v1_fitler(df)
    heik = (hadf["HA_close"] - hadf["HA_open"]).rolling(window=3).mean()
    heik_tmp = heik.copy()
    lastdf = df.iloc[-1] 

    heik_diff = heik_tmp.diff()
    heik_last = heik.iloc[-1]
    # print ("&&&&&&&&&&&&&& heik: ", type(heik), "->", heik)
    # print ("&&&&&&&&&&&&&& heik_diff: ", type(heik_diff), "->", heik_diff)

    df.replace(np.nan, 0)
    result_data = []
        
    for data in df.iloc:
        # if( data.rsi2 >= 0 and data.rsi3 >= 0 and heik.iloc[-1] >=0 and heik_diff.iloc[-1] >= 0):
        # if( data.rsi2 >= 0 and data.rsi3 >= 0 and heik_last >=0 and heik_diff.iat[-1] >= 0):
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
        # heik = dataConverter(np.nan_to_num(heik_diff.iat[-1]))
        # heik2 = dataConverter(np.nan_to_num(heik_diff.iat[-2]))
        
        log_str = ' {}    {}    {}    {}    {}'.format(rsi, rsi2, rsi3, heik, heik2)
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
            'rsi': {'bearPower': rsi, 'bullPower': rsi, 'side': side},
            'rsi2': {'bearPower': rsi2, 'bullPower': rsi2, 'color': 'l_r'},
            'rsi3': {'bearPower': rsi3, 'bullPower': rsi3, 'color': 'l_r'},
            'heik': {'bearPower': heik, 'bullPower': heik, 'color': 'l_r'},
            'heik2': {'bearPower': heik2, 'bullPower': heik2, 'color': 'l_r'},
        })

    return result_data

def get_chat_data_rsi_heik_v11(candles):
    df = util.df(candles)
    hadf = rsi_heik_v1_fitler(df)
    heik = (hadf["HA_close"] - hadf["HA_open"]).rolling(window=3).mean()
    heik_tmp = heik.copy()
    lastdf = df.iloc[-1] 

    heik_diff = heik_tmp.diff()
    heik_last = heik.iloc[-1]

    df.replace(np.nan, 0)
    result_data = []
    idx = 0        
    for data in df.iloc:
        if idx == 0:
            prev_data = df.iloc[idx]
        else:
            prev_data = df.iloc[idx-1]
        # if( data.rsi2 >= 0 and data.rsi3 >= 0 and heik.iloc[-1] >=0 and heik_diff.iloc[-1] >= 0):
        # if( data.rsi2 >= 0 and data.rsi3 >= 0 and heik_last >=0 and heik_diff.iat[-1] >= 0):
        if( data.rsi2 >= 0 and data.rsi3 >= 0):
            side = "buy"
        elif ( data.rsi2 <= 0 and heik_diff.iloc[-1] <= 0):
            side = "sell"
        elif ( data.rsi1 >= 0):
            side = "hold"
        else:
            side = "wait"
        rsi = dataConverter(np.nan_to_num(data.RSI))
        pre_rsi = dataConverter(np.nan_to_num(prev_data.RSI))
        rsi2 = rsi - pre_rsi
        pre_rs2 = dataConverter(np.nan_to_num(prev_data.rsi2))
        rsi3 = rsi2 - pre_rs2
        pre_rs3 = dataConverter(np.nan_to_num(prev_data.rsi3))
        heik = rsi3 - pre_rs3
        pre_heik = dataConverter(np.nan_to_num(heik_diff.iat[-1]))
        heik2 = heik - pre_heik
        
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
            'rsi': {'bearPower': rsi, 'bullPower': rsi, 'side': side},
            'rsi2': {'bearPower': rsi2, 'bullPower': rsi2, 'color': define_color(rsi2, rsi, pre_rsi)},
            'rsi3': {'bearPower': rsi3, 'bullPower': rsi3, 'color': define_color(rsi3, rsi2, pre_rs2)},
            'heik': {'bearPower': heik, 'bullPower': heik, 'color': define_color(heik, rsi3, pre_rs3)},
            'heik2': {'bearPower': heik2, 'bullPower': heik2, 'color': define_color(heik2, heik, pre_heik)},
        })

        idx += 1

    return result_data

def get_chat_data_rsi_heik_v1_non(candles):
    df = util.df(candles)

    df.replace(np.nan, 0)
    result_data = []
        
    for data in df.iloc:
        result_data.append({
            'close': float(data.c),
            'date': data.date,
            'high': float(data.h),
            'low': float(data.l),
            'open': float(data.o),
            'percentChange': "",
            'volume': int(data.v),
            'RSI': 0,
            'side': "",
            'rsi': {'bearPower': 0, 'bullPower': 0, 'color': ''},
            'rsi2': {'bearPower': 0, 'bullPower': 0, 'color': ""},
            'rsi3': {'bearPower': 0, 'bullPower': 0, 'color': ''},
            'heik': {'bearPower': 0, 'bullPower': 0, 'color': ''},
            'heik2': {'bearPower': 0, 'bullPower': 0, 'color': ''},
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
                if trades_data['side'].lower() == 'buy':
                    side_type = 'LONG'
                elif trades_data['side'].lower() == 'sell':
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

def get_chat_available_stratgies_no_interval(candle_name, micros):
    # get candle interval 
    interval_unit = candle_name.split('_')[-1]
    candle_interval = 0        # minute
    interval_num = candle_name.split('_')[1]
    if interval_unit in 'minutes':
        candle_interval = int(interval_num)
    elif interval_unit in 'hours':
        candle_interval = int(interval_num) * 60
    elif interval_unit in 'days':
        candle_interval = int(interval_num) * 24 * 60

    result = []
    for micro in micros:
        micro = '1m-'
        base_interval_str = micro[0:3]
        base_interval = 0
        if 'm' in base_interval_str:
            base_interval = int(base_interval_str.split('m')[0])
        elif 'h' in base_interval_str:
            base_interval = int(base_interval_str.split('h')[0]) * 60
        elif 'd' in base_interval_str:
            base_interval = int(base_interval_str.split('d')[0]) * 24 * 60
        
        if base_interval >= candle_interval:
            result.append(micro)
    
    return result


def get_chat_available_stratgies(candle_name, micros):
    # get candle interval 
    interval_unit = candle_name.split('_')[-1]
    candle_interval = 0        # minute
    interval_num = candle_name.split('_')[1]
    if interval_unit in 'minutes':
        candle_interval = int(interval_num)
    elif interval_unit in 'hours':
        candle_interval = int(interval_num) * 60
    elif interval_unit in 'days':
        candle_interval = int(interval_num) * 24 * 60

    result = []
    for micro in micros:
        base_interval_str = micro[0:3]
        base_interval = 0
        if 'm' in base_interval_str:
            base_interval = int(base_interval_str.split('m')[0])
        elif 'h' in base_interval_str:
            base_interval = int(base_interval_str.split('h')[0]) * 60
        elif 'd' in base_interval_str:
            base_interval = int(base_interval_str.split('d')[0]) * 24 * 60
        
        if base_interval >= candle_interval:
            result.append(micro)
    
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
            side = db_collection['side'].lower()
            if symbol == db_collection['symbol']:
                pair_wL[side] = float(db_collection['price'])
                if 'buy' in pair_wL and 'sell' in pair_wL:
                    calc = pair_wL['sell'] - pair_wL['buy']
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
            side = db_collection['side'].lower()
            if symbol == db_collection['symbol']:
                pair_pE[side] = {
                    "price": float(db_collection['price']),
                    "date": db_collection['date']
                    }
                if 'buy' in pair_pE and 'sell' in pair_pE:
                    percent = float(pair_pE['sell']['price']) * 100  / float(pair_pE['buy']['price'])
                    # percent = round(percent, 2)
                    percent = percent - 100
                    percent = round(percent, 3)
                    if pair_pE['sell']['date'].timestamp() - pair_pE['buy']['date'].timestamp() > 0:
                        entry = 'buy'
                        exit = 'sell'
                        exit_date = pair_pE['sell']['date']
                    else:
                        entry = 'sell'
                        exit = 'buy'
                        exit_date = pair_pE['buy']['date']

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
        if len(sym_pE) > 0 and sym_pE[-1]['entry'] == 'buy':
            long = sym_pE[-1]['percent']
            short = 0
        elif len(sym_pE) > 0 and sym_pE[-1]['entry'] == 'sell':
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

def fill_missing_candles__(chat_candles, candle_name, macro, micro):
    # strategy_names = get_strategy_name_only()
    # macro_name = strategy_name.split('-')[0]
    # macro_strategies = []
    # for strtg in strategy_names:
    #     if macro_name in strtg:
    #         macro_strategies.append(strtg)

    print ('---------- candle_name: {}, macro: {}, micro: {}'.format(candle_name, macro, micro))
    micros = get_micro_strategies(macro)
    print ('--------- micros: {}'.format(micros))
    available_strategies = get_chat_available_stratgies_no_interval(candle_name, micros)
    if micro in available_strategies:
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

