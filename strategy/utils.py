import subprocess
import json
import sys,os
sys.path.append(os.getcwd())


STRATEGY_FILE_PATH = 'chartApis/lib/download/'
CONFIG_FILE_PATH = 'chartApis/lib/configs/'
def save_strategy(file_name, content):
    with open(STRATEGY_FILE_PATH + file_name + '.py', 'w') as out_file:
        out_file.write(content)

def save_config(name, configs):
    del configs['update_date']
    file_path = CONFIG_FILE_PATH + name + '.json'
    print (file_path)
    with open(file_path, "w") as outfile:
        json.dump(configs, outfile)

def run_command(cmd):
    subprocess.call(cmd.split(' '))


# run_command('python chartApis/lib/download/test.py --bot=bob')
