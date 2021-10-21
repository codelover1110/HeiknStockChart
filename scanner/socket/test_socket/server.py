import threading
from base_server import WebsocketServer
import pathlib
import ssl

class Server(object):
	def __init__(self):
		# self.server = WebsocketServer(9999, host='127.0.0.1')
		# path_cert = pathlib.Path(__file__).with_name("cert.pem")
		# path_key = pathlib.Path(__file__).with_name("key.pem")
		self.server = WebsocketServer(9999, '0.0.0.0', key="key.pem", cert="cert.pem")
		self.server.event_new_client_join(self.new_client_joined)
		self.server.event_client_left(self.client_left)
		self.server.event_message_received(self.receive_message)

		self.socket_thread = threading.Thread(target=self.server.run_forever)

	def start(self):
		self.socket_thread.start()

	def new_client_joined(self, client, server):
		print ("Connect client: ",client)

	def client_left(self, client, server):
		print ("client left: ", client)

	def receive_message(self, client, server, message):
		print ("reveive message: ", message)
		msg = "I'm good, thank you."
		server.send_message(client, msg)

if __name__=="__main__":
	server = Server()
	server.start()
