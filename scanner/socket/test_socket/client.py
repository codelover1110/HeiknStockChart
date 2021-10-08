import websocket
import threading
import time

server_url = "ws://127.0.0.1:11111/"

class Client(object):
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

	def on_open(self, ws):
		print ("Open Connection!")
		msg = "how are you? from client"
		ws.send(msg)
		print ('------ send: ', msg)

	def on_message(self, ws, message):
		print ("++++++ recv: ", message)

	def on_close(self, we):
		print ("closed connection!")

if __name__=="__main__":
	client = Client(server_url)
	client.start()

	time.sleep(5)
	client.stop()
