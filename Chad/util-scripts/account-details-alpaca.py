
import json
import requests
from pathlib import Path

"""
Makes sure our order goes through and that we have enough cash
"""

baseUrl = "https://paper-api.alpaca.markets"


keyFile = (Path.cwd().parent).joinpath("configs","alpaca.key")

keys = {}
with open(keyFile,"r") as f:
    for line in f:
        keys[line.split(":")[0]] = line.split(":")[1].strip()

headers = {
	"APCA-API-KEY-ID":keys["APCA-API-KEY-ID"],
	"APCA-API-SECRET-KEY":keys["APCA-API-SECRET-KEY"],
	}



	

order = requests.get(url = f"{baseUrl}/v2/positions", 
	headers = headers).json()

print("positions:",order)


order = requests.get(url = f"{baseUrl}/v2/account", 
	headers = headers).json()

print("account:",order)






