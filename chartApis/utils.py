from datetime import datetime, timedelta


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