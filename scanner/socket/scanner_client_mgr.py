import queue
import time
from threading import Thread
from ib_insync import util

from scanner_client import ScannerClient


polygon_websocket = "wss://delayed.polygon.io/stocks"
candle_update_queue = queue.Queue()

class ScannerClientManager(object):
    def __init__(self, update_queue):
        self.update_queue = update_queue
        self.client_list = []
        self.scanner_obj_list = []

        self._removeing = False

    def find_client_idx(self, client_id):
        for idx, client in enumerate(self.client_list):
            if client['id'] == client_id:
                return idx
        return -1

    def add_scanner(self, client_info, scanner_info):
        fields = scanner_info['fields']
        symbols = scanner_info['symbols']
        scanner_client = ScannerClient(polygon_websocket, self.update_queue, symbols, scanner_info, client_info)
        scanner_client.start()
        self.scanner_obj_list.append(scanner_client)
        self.client_list.append(client_info)

        print ("++++ client connected socket ===> chart_number: ", scanner_info['chart_number'])
        print ('        symbols: {}, fields: {}'.format(scanner_info['symbols'], scanner_info['fields']))

    def remove_scanner(self, client_info):
        self._removeing = True
        client_id = client_info['id']
        client_idx = self.find_client_idx(client_id)
        print ("____________________________________:", client_id)
        if client_idx != -1:
            scanner_obj = self.scanner_obj_list[client_idx]
            scanner_info = scanner_obj.get_scanner_info()
            scanner_obj.stop()
            time.sleep(1)
            del self.scanner_obj_list[client_idx]
            del self.client_list[client_idx]
            
            print ("---- client closed socket ===> chart_number: ", scanner_info['chart_number'])
            print ('        symbols: {}, fields: {}'.format(scanner_info['symbols'], scanner_info['fields']))
        self._removeing = False

    def is_removing(self):
        return self._removeing

    def reset_scanner(self, client_info, scanner_info):
        client_id = client_info['id']
        client_idx = self.find_client_idx(client_id)
        if client_idx != -1:
            scanner_obj = self.scanner_obj_list[client_idx]
            old_scanner_info = scanner_obj.get_scanner_info()
            scanner_obj.reset(scanner_info)

            print("**** client changed scanner information => old_info: ", old_scanner_info)
            print ('        new_info: {}'.format(scanner_info))

    def remove_all(self):
        for scaner_obj in self.scanner_obj_list:
            scaner_obj.stop()

def generate_info():
    client_info = {
        "id": 1,
        'handler': 'handler',
        'address': ('234.23.12.42', 8382)
    }
    scanner_info = {
        'chart_number': '1',
        'symbols': ['DOG', 'CAT', 'PIG'],
        'fields': ['rsi', 'ris2', 'rsi3', 'heik', 'heik2']
    }

    return client_info, scanner_info

def generate_info_1():
    client_info = {
        "id": 2,
        'handler': 'handler2',
        'address': ('234.23.12.42', 8282)
    }
    scanner_info = {
        'chart_number': '1',
        'symbols': ['HAMBERGER', 'RICE', 'NOODLE'],
        'fields': ['rsi', 'ris2', 'rsi3', 'heik', 'heik2']
    }

    return client_info, scanner_info

def generate_info_2():
    scanner_info = {
        'chart_number': '1',
        'symbols': ['UPWORK', 'FREELANCER', 'FIBBER'],
        'fields': ['rsi', 'ris2', 'rsi3', 'heik', 'heik2']
    }

    return scanner_info


if __name__=="__main__":
    if False:
        sc_mgr = ScannerClientManager(candle_update_queue)
        # add client 1
        client_info, scanner_info = generate_info()
        sc_mgr.add_scanner(client_info, scanner_info)

        update_cnt = 0
        while True:
            if update_cnt > 20:
                break
            if not candle_update_queue.empty():
                while not candle_update_queue.empty():
                    candle_update = candle_update_queue.get()
                    print(candle_update['symbol'])
                    update_cnt += 1

            time.sleep(1)
            print ("update candle count: ", update_cnt)

        # add client 2
        client_info1, scanner_info1 = generate_info_1()
        sc_mgr.add_scanner(client_info1, scanner_info1)
        while True:
            if update_cnt > 200:
                break
            if not candle_update_queue.empty():
                while not candle_update_queue.empty():
                    candle_update = candle_update_queue.get()
                    print(candle_update['symbol'])
                    update_cnt += 1

            time.sleep(1)
            print ("update candle count: ", update_cnt)
        
        # remove client 1
        sc_mgr.remove_scanner(client_info)
        while True:
            if update_cnt > 300:
                break
            if not candle_update_queue.empty():
                while not candle_update_queue.empty():
                    candle_update = candle_update_queue.get()
                    print(candle_update['symbol'])
                    update_cnt += 1

            time.sleep(1)
            print ("update candle count: ", update_cnt)

        # reset scanner
        new_scanner_info = generate_info_2()
        sc_mgr.reset_scanner(client_info1, new_scanner_info)
        while True:
            if update_cnt > 400:
                break
            if not candle_update_queue.empty():
                while not candle_update_queue.empty():
                    candle_update = candle_update_queue.get()
                    print(candle_update['symbol'])
                    update_cnt += 1

            time.sleep(1)
            print ("update candle count: ", update_cnt)

        sc_mgr.remove_all()
        print ("************* end **************")
