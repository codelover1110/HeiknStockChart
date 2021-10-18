import sys
import queue
import json 
import time
import threading

from base_websocket_server import WebsocketServer, WebSocketHandler
from channel_client_mgr import ChannelClientManager
from define import *

class StockStreamServer(object):
	def __init__(self):
		self.update_queue = queue.Queue()
		self.remove_client_list = queue.Queue()
		self.new_client_list = queue.Queue()
		self.closed_client = []
		self._stop = False
		self.stock_cc_mgr = ChannelClientManager(STOCK_WEBSOCKET_URL, self.update_queue, SYMBOL_TYPE_STOCK)
		self.crypto_cc_mgr = ChannelClientManager(CRYPTO_WEBSOCKET_URL, self.update_queue, SYMBOL_TYPE_CRYPTO)
		
		self.server = WebsocketServer(9999, host='0.0.0.0')
		self.server.event_new_client_join(self.new_client_joined)
		self.server.event_client_left(self.client_left)
		self.server.event_message_received(self.receive_message)

		self.socket_thread = threading.Thread(target=self.server.run_forever)
		self.send_thread = threading.Thread(target=self.thread_func)
		self.client_action_thread = threading.Thread(target=self.look_client_action)
	
	def start(self):
		self.stock_cc_mgr.start()
		self.crypto_cc_mgr.start()
		self.socket_thread.start()
		self.send_thread.start()
		self.client_action_thread.start()

	def stop(self):
		self._stop = True
		try:
			self.stock_cc_mgr.stop()
			self.crypto_cc_mgr.stop()
			time.sleep(1)
			self.socket_thread.join()
			self.send_thread.join()
			self.client_action_thread.join()
		except:
			pass

	def get_cc_mgr_by_symbol_type(self, symbol_type):
		if symbol_type == SYMBOL_TYPE_STOCK:
			return self.stock_cc_mgr
		elif symbol_type == SYMBOL_TYPE_CRYPTO:
			return self.crypto_cc_mgr
		
	def get_cc_mgr_by_client(self, client):
		if self.stock_cc_mgr.find_client_idx(client['id']) != -1:
			return self.stock_cc_mgr
		elif self.crypto_cc_mgr.find_client_idx(client['id']) != -1:
			return self.crypto_cc_mgr
		else:
			return None

	def new_client_joined(self, client, server):
		print ("Connect client: ",client)

	def client_left(self, client, server):
		print ("client left: ", client)
		if client is not None:
			cc_mgr = self.get_cc_mgr_by_client(client)
			if cc_mgr is not None:
				cc_mgr.set_channel_stop(client)
				self.closed_client.append(client)
				if len(self.closed_client) > 1000:
					self.closed_client = self.closed_client[-100:]
				self.remove_client_list.put(client)

	def receive_message(self, client, server, message):
		scanner_info = json.loads(message)
		action = scanner_info['action']
		symbol_type = scanner_info['symbol_type'] 
		cc_mgr = self.get_cc_mgr_by_symbol_type(symbol_type)
		if cc_mgr.find_client_idx(client['id']) == -1:
			self.new_client_list.put([client, scanner_info])
		elif action == CHANNEL_ACTION_CHANGE_FIELDS:
			cc_mgr.reset_channel(client, scanner_info)
		elif action == CHANNEL_ACTION_CHANGE_SYMBOL_TYPE:
			old_cc_mgr = self.get_cc_mgr_by_client(client)
			old_cc_mgr.set_channel_stop(client)
			self.closed_client.append(client)
			self.remove_client_list.put(client)
			
			new_cc_mgr = self.get_cc_mgr_by_symbol_type(symbol_type)
			if new_cc_mgr.find_client_idx(client['id']) == -1:
				self.new_client_list.put([client, scanner_info])


	def thread_func(self):
		while True:
			if self._stop:
				break
			if not self.update_queue.empty():
				while not self.update_queue.empty():
					candle_update = self.update_queue.get()
					try:
						client = candle_update['client']
						if client in self.closed_client:
							continue
						cc_mgr = self.get_cc_mgr_by_client(client)
						if cc_mgr is not None:
							del candle_update['client']
							message = json.dumps([candle_update])
							self.server.send_message(client, message)
					except:
						print ("can't send message.", 'client: {}, message: {}'.format(client['id'], candle_update))

	def look_client_action(self):
		while True:
			if self._stop:
				break

			if not self.new_client_list.empty():
				while not self.new_client_list.empty():
					new_client = self.new_client_list.get()
					client, scanner_info = new_client[0], new_client[1]
					symbol_type = scanner_info['symbol_type']
					cc_mgr = self.get_cc_mgr_by_symbol_type(symbol_type)
					cc_mgr.add_new_channel(client, scanner_info)
					cc_mgr.send_last_symbol_data(client, scanner_info)
					time.sleep(0.1)

			if not self.remove_client_list.empty():
				while not self.remove_client_list.empty():
					client = self.remove_client_list.get()
					cc_mgr = self.get_cc_mgr_by_client(client)
					cc_mgr.remove_channel(client)
					time.sleep(0.1)

			time.sleep(0.1)

if __name__=="__main__":
	stream_server = StockStreamServer()
	stream_server.start()