import sys
import queue
import json 
import time
import threading

from base_websocket_server import WebsocketServer, WebSocketHandler
from channel_client_mgr import ChannelClientManager

candle_update_queue = queue.Queue()

class StockStreamServer(object):
	def __init__(self, update_queue):
		self.update_queue = update_queue
		self.remove_client_list = queue.Queue()
		self.new_client_list = queue.Queue()
		self.closed_client = []
		self._stop = False
		self.cc_mgr = ChannelClientManager(self.update_queue)

		self.server = WebsocketServer(9999, host='127.0.0.1')
		self.server.event_new_client_join(self.new_client_joined)
		self.server.event_client_left(self.client_left)
		self.server.event_message_received(self.receive_message)

		self.socket_thread = threading.Thread(target=self.server.run_forever)
		self.send_thread = threading.Thread(target=self.thread_func)
	
	def start(self):
		self.cc_mgr.start()
		self.socket_thread.start()
		self.send_thread.start()

	def stop(self):
		self._stop = True
		try:
			time.sleep(0.2)
			self.socket_thread.join()
			self.send_thread.join()
		except:
			pass

	def new_client_joined(self, client, server):
		print ("Connect client: ",client)

	def client_left(self, client, server):
		print ("client left: ", client)
		self.cc_mgr.set_channel_stop(client)
		self.closed_client.append(client)
		self.remove_client_list.put(client)

	def receive_message(self, client, server, message):
		scanner_info = json.loads(message)
		print ("scanner_info:", scanner_info)
		action = scanner_info['action']
		if self.cc_mgr.find_client_idx(client['id']) == -1:
			self.new_client_list.put([client, scanner_info])
			# self.cc_mgr.add_new_channel(client, scanner_info)

		elif action == 'change_fields':
			self.cc_mgr.reset_channel(client, scanner_info)
		
	def thread_func(self):
		while True:
			if self._stop:
				break
			if not self.update_queue.empty():
				while not self.update_queue.empty():
					candle_update = self.update_queue.get()
					# print (candle_update.keys())
					try:
						client = candle_update['client']
						if client in self.closed_client:
							continue
						if self.cc_mgr.find_client_idx(client['id']) != -1:
							del candle_update['client']
							message = json.dumps([candle_update])
							self.server.send_message(client, message)
							# print ('client: {}, message: {}'.format(client['id'], message))
					except:
						print ("can't send message.", 'client: {}, message: {}'.format(client['id'], candle_update))
						pass

			if not self.remove_client_list.empty():
				while not self.remove_client_list.empty():
					client = self.remove_client_list.get()
					self.cc_mgr.remove_channel(client)
					time.sleep(0.01)
			
			if not self.new_client_list.empty():
				while not self.new_client_list.empty():
					new_client = self.new_client_list.get()
					client, scanner_info = new_client[0], new_client[1]
					self.cc_mgr.add_new_channel(client, scanner_info)
					time.sleep(0.01)


			time.sleep(0.1)

if __name__=="__main__":
	stream_server = StockStreamServer(candle_update_queue)
	stream_server.start()