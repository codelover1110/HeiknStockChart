import requests
import websocket, json
import time

try:
   import queue
except ImportError:
   import Queue as queue

stream_queue = queue.Queue()

API_KEY = 'KFiYTNFlVvNCqBK12l0Gs322fZcenL2T'
socket = "wss://delayed.polygon.io/stocks"
TICKERS = ''

def make_symbol_params(symbols):
    param = ''
    for idx, symbol in enumerate(symbols):
        if idx == len(symbols)-1:
            break
        param += "A."+symbol +","
    param += "A." + symbol
    return param

def on_open(ws):
    print ("opened")
    auth_data = {
        "action": "auth",
        "params": API_KEY
    }

    ws.send(json.dumps(auth_data))

    channel_data = {
        "action": "subscribe",
        "params":  "A.*" # TICKERS
    }
    ws.send(json.dumps(channel_data))

def on_message(ws, message):
    print ("received a message")
    print (message)
    candle = json.load(message)
    print (candle)

    # stream_queue.put()


def on_close(we):
    print ("closed connection!")
        

def start_stream_loop(loop, server):
    loop.run_until_complete(server)
    loop.run_forever()

if __name__=="__main__":
    symbols = ["TSLA"] #["GOOG", "ATVI", "AMD", "MSFT", "AMZN", "NVDA", "TSLA", "AAPL"]
    TICKERS = make_symbol_params(symbols)
    ws = websocket.WebSocketApp(
            socket, 
            on_open=on_open, 
            on_message=on_message,
            on_close=on_close
        )

    ws.run_forever()
    



