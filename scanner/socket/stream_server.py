import queue
import json 
import time
import threading

from base_websocket_server import WebsocketServer, WebSocketHandler
from scanner_client_mgr import ScannerClientManager

candle_update_queue = queue.Queue()

# def new_client_joined(client, server):
# 	print ("Connect client: ",client)

# def client_left(client, server):
# 	print ("client left: ", client)
# 	sc_mgr.remove_scanner(client)

# def receive_message(client, server, message):
# 	scanner_info = json.loads(message)
# 	sc_mgr.add_scanner(client, scanner_info)
	
# 	server.send_message(client, "stream sending ...")
		
# server = WebsocketServer(9998, host='127.0.0.1')
# server.event_new_client_join(new_client_joined)
# server.event_client_left(client_left)
# server.event_message_received(receive_message)

# server.run_forever()


class StockStreamServer(object):
	def __init__(self, update_queue):
		self.update_queue = update_queue
		self.removing_client = []
		self.sc_mgr = ScannerClientManager(self.update_queue)

		self.server = WebsocketServer(9999, host='127.0.0.1')
		self.server.event_new_client_join(self.new_client_joined)
		self.server.event_client_left(self.client_left)
		self.server.event_message_received(self.receive_message)

		self.socket_thread = threading.Thread(target=self.server.run_forever)
		self.send_thread = threading.Thread(target=self.thread_func)
	
	def start(self):
		self.socket_thread.start()
		self.send_thread.start()

	def new_client_joined(self, client, server):
		print ("Connect client: ",client)

	def client_left(self, client, server):
		print ("client left: ", client)
		# self.sc_mgr.remove_scanner(client)
		self.removing_client.append(client)

	def receive_message(self, client, server, message):
		scanner_info = json.loads(message)
		print ("scanner_info:", scanner_info)
		action = scanner_info['action']
		if self.sc_mgr.find_client_idx(client['id']) == -1:
			self.sc_mgr.add_scanner(client, scanner_info)
		elif action == 'change_fields':
			self.sc_mgr.reset_scanner(client, scanner_info)
		
	def thread_func(self):
		while True:
			if not self.update_queue.empty():
				while not self.update_queue.empty():
					candle_update = self.update_queue.get()
					client = candle_update['client']
					if client in self.removing_client:
						continue
					if self.sc_mgr.find_client_idx(client['id']) != -1:
						del candle_update['client']
						print (candle_update['symbol'])
						message = json.dumps([candle_update])
						self.server.send_message(client, message)
			if len(self.removing_client) > 0:
				for client in self.removing_client:
					if self.sc_mgr.get_status():
						while self.sc_mgr.get_status():
							time.sleep(0.1)
					self.sc_mgr.remove_scanner(client)
			time.sleep(1)

if __name__=="__main__":
	stream_server = StockStreamServer(candle_update_queue)
	stream_server.start()
			