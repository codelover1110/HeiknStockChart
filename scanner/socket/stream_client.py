import websocket
import _thread
import time

CONNECTION_INFO = 1000
CONNECTION_INFO_RES = 1001

import websocket, json
import time
import threading
from threading import Thread

try:
   import queue
except ImportError:
   import Queue as queue


# socket = "ws://127.0.0.1:9999/"
socket = "ws://20.84.64.243:9999"

test_info = {
        "action": "create_fields",
        "chart_number": 4,
        "symbols": [
            "AMD",
            "TSLA",
            "MSFT",
            "GOOG",
            "AMZN"
        ],
        "fields": [
            {
                "Stock Financials": [
                    "period",
                    "calendarDate"
                ]
            },
            {
                "Ticker News": [
                    "id",
                    "title"
                ]
            },
            {
                "Ticker Details": [
                    "listdate",
                    "cik"
                ]
            },
            {
                "Indicators": [
                    "rsi",
                    "rsi2",
                    "rsi3",
                    "heik",
                    "heik2"
                ]
            }
        ]
    }

class StreamClient(object):
    def __init__(self, socket_url):
        self.ws = websocket.WebSocketApp(
            socket_url, 
            on_open=self.on_open, 
            on_message=self.on_message,
            on_close=self.on_close
        )

        self.ws_thread = threading.Thread(target=self.ws.run_forever)
    
    def start(self):
        self.ws_thread.deamon = True
        self.ws_thread.start()

    def stop(self):
        self.ws.close()

    def make_message(self, cmd, info):
        msg = dict()
        msg['request_cmd'] = cmd
        msg['info'] = info
        return json.dumps(msg)
    
    def on_open(self, ws):
        print ("Open Connection!")
        scanner_info = {
            'chart_number': '1',
            'symbols': ['DOG', 'CAT', 'PIG'],
            'fields': ['rsi', 'ris2', 'rsi3', 'heik', 'heik2']
        }
        ws.send(json.dumps(test_info))

    def on_message(self, ws, message):
        print ("++++++ recv: ", message)

    def on_close(self, we):
        print ("closed connection!")

if __name__ == "__main__":
    ps = StreamClient(socket)
    ps.start()

    time.sleep(40)
    ps.stop()
