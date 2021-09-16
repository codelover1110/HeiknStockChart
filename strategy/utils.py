import datetime

STRATEGY_FILE_PATH = 'chartApis/lib/download/'

def save_strategy(file_name, content):
    with open(STRATEGY_FILE_PATH + file_name + '.py', 'w') as out_file:
        out_file.write(content)
