import pymongo
from pprint import pprint
import json
import copy
from tabulate import tabulate
import datetime
from simple_term_menu import TerminalMenu
from bson import ObjectId
import sys
import sys, tempfile, os
from subprocess import call

# cloud mongo
#mongoUrl = "mongodb+srv://chad:JWh1w8IFMBZcuq21@cluster0.35i8i.mongodb.net/backtesting_trades?retryWrites=true&w=majority"

# Azure vm mongo
mongoUrl = "mongodb://root:rootUser2021@20.84.64.243:27019"

client = pymongo.MongoClient(mongoUrl) 

## Features to include
# CRUD functionality for configs
# change bot status to allow killing, updating, pausing, restarting

def YesNoMenu():
        options = [
                "yes",
                "no"
                ]
        terminal_menu = TerminalMenu(options)
        menu_entry_index = terminal_menu.show()

        if options[menu_entry_index] == "yes":
            return True
        if options[menu_entry_index] == "no":
            return False
        
def DisplayBotStatus():

    statusCollection = client["processes"]["bot_status"]
    for botStatus in statusCollection.find():
        print(json.dumps(botStatus, indent=4, sort_keys=True, default=str ))

def DisplayBotConfig():

    statusCollection = client["processes"]["bot_configs"]
    for botStatus in statusCollection.find():
        print(botStatus["name"],
                json.dumps(botStatus, indent=4, sort_keys=True, default=str ))

def DeleteBotConfig():
    configCollection = client["processes"]["bot_configs"]

    print("")
    print("Found the following bot configs:")
    print("")
    items = []
    for item in configCollection.find():
        items.append([item["name"],str(item["_id"])])
    print(tabulate(items, headers=["Name","ID" ]))
    print("")

    ID = input("Please enter the id of the config you'd like to delete: \n")
    x = configCollection.find_one({"_id":ObjectId(ID)})
    if x == None:
        print("No config exists for the id you have provided")
    else:
        print(f"Are you sure you want to delete bot {x['name']}?")
        ans = YesNoMenu()

        if ans == True:
            serverResponse = configCollection.delete_one({"_id":ObjectId(ID)})
            if serverResponse is not None:
                print(f"Sucessfully deleted bot {x['name']}")
        else:
            print("Reverting changes")

def EditBotConfig():
    configCollection = client["processes"]["bot_configs"]

    print("")
    print("Found the following bot configs:")
    print("")
    items = []
    for item in configCollection.find():
        items.append([item["name"],str(item["_id"])])
    print(tabulate(items, headers=["Name","ID" ]))
    print("")

    ID = input("Please enter the id of the config you'd like to edit: \n")
    config = configCollection.find_one({"_id":ObjectId(ID)})
    oldConfig = copy.deepcopy(config) 
    if config == None:
        print("No config exists for the id you have provided")
    else:
        del config['_id']
        del config['update_date']
        config = json.loads(TempFileWrite(json.dumps(config, indent=4)))
        config["update_date"] = datetime.datetime.now()

        print("===================")
        print("Old Version",json.dumps(oldConfig, indent=4, default=str))
        print("New Version",json.dumps(config, indent=4, default=str))
        print("===================")
        print("Would you like to persist this change to the db?")
        ans = YesNoMenu()

        if ans == True:
            configCollection.insert_one(config)
            configCollection.delete_one({"_id":ObjectId(ID)})
            print("Sucessfully edited config")
        else:
            print("Reverting Changes")

def CreateBotConfig():
    newConfig = json.loads(TempFileWrite(defaultBotConfig))
    newConfig["update_date"] = datetime.datetime.now()
    configCollection = client["processes"]["bot_configs"]

    print("===================")
    print("New Config",json.dumps(newConfig, indent=4, default=str))
    print("===================")
    print("Would you like to persist this change to the db?")
    ans = YesNoMenu()

    if ans == True:
        configCollection.insert_one(newConfig)
        print("Successfully pushed new config to Mongo")
    else:
        print("Reverting Changes, config has not been pushed")

def EditBotStatus():
    configCollection = client["processes"]["bot_status"]
    print("")
    print("The following values of status affect the running of the bot:")
    print("start: starts running the bot if possible")
    print("pause: stops the bot from running")
    print("kill: deletes the bot completely")
    print("")


    print("")
    print("Found the following bot status':")
    print("")
    items = []
    for item in configCollection.find():
        items.append([item["name"],str(item["_id"])])
    print(tabulate(items, headers=["Name","ID" ]))
    print("")

    ID = input("Please enter the id of the bot status you'd like to edit: \n")
    config = configCollection.find_one({"_id":ObjectId(ID)})
    oldConfig = copy.deepcopy(config) 
    if config == None:
        print("No status exists for the id you have provided")
    else:
        del config['_id']
        del config['update_date']
        del config['updated']
        config = json.loads(TempFileWrite(json.dumps(config, indent=4)))
        config["update_date"] = datetime.datetime.now()
        config["updated"] = datetime.datetime.now()

        print("===================")
        print("Old Version",json.dumps(oldConfig, indent=4, default=str))
        print("New Version",json.dumps(config, indent=4, default=str))
        print("===================")
        print("Would you like to persist this change to the db?")
        ans = YesNoMenu()

        if ans == True:
            configCollection.insert_one(config)
            configCollection.delete_one({"_id":ObjectId(ID)})
            print("Sucessfully edited bot status")
        else:
            print("Reverting Changes")

def EditTextFiles(db):
    parameterDB = client[db]

    print("Which collection would you like to edit?")

    options = parameterDB.list_collection_names()

    terminal_menu = TerminalMenu(options)
    menu_entry_index = terminal_menu.show()
    collection = options[menu_entry_index]

    mongoCollection = parameterDB[collection]
    print(collection)

    print("")
    print("Found the following files:")
    print("")
    items = []
    for item in mongoCollection.find():
        items.append([item["name"],str(item["_id"])])
    print(tabulate(items, headers=["Name","ID" ]))
    print("")
    fileID = input("Please enter the ID of the file you wish to edit\n")

    contents = mongoCollection.find_one({"_id":ObjectId(fileID)})["contents"]
    oldContents = copy.deepcopy(contents) 
    if contents == None:
        print("No file exists for the id you have provided")
    else:
        edited = TempFileWrite(contents).decode("utf-8")
        print("Would you like to persist this change to the db?")
        ans = YesNoMenu()


        newParameter = mongoCollection.find_one({"_id":ObjectId(fileID)})
        newParameter["contents"] = edited
        del newParameter['_id']

        if ans == True:
            mongoCollection.insert_one(newParameter)
            mongoCollection.delete_one({"_id":ObjectId(fileID)})
            print("Sucessfully edited parameter")
        else:
            print("Reverting Changes")

def AddTextFile(db):
    parameterDB = client[db]

    print("Which collection would you like to add a file to?\n")

    options = parameterDB.list_collection_names()

    terminal_menu = TerminalMenu(options)
    menu_entry_index = terminal_menu.show()
    collection = options[menu_entry_index]

    mongoCollection = parameterDB[collection]

    print("")
    name = input("What would you like the name of this file to be?\n")
    print("")

    edited = TempFileWrite("").decode("utf-8")
    print("Would you like to persist this change to the db?")
    ans = YesNoMenu()

    newParameter = {}
    newParameter["name"] = name
    newParameter["contents"] = edited

    if ans == True:
        mongoCollection.insert_one(newParameter)
        print("Sucessfully edited parameter")
    else:
        print("Reverting Changes")


def DeleteTextFile(db):
    parameterDB = client[db]

    print("Which collection would you like to delete a file from?\n")

    options = parameterDB.list_collection_names()

    terminal_menu = TerminalMenu(options)
    menu_entry_index = terminal_menu.show()
    collection = options[menu_entry_index]

    mongoCollection = parameterDB[collection]


    print("")
    print("Found the following files:")
    print("")
    items = []
    for item in mongoCollection.find():
        items.append([item["name"],str(item["_id"])])
    print(tabulate(items, headers=["Name","ID" ]))
    print("")
    fileID = input("Please enter the ID of the file you wish to delete\n")

    toDelete = mongoCollection.find_one({"_id":ObjectId(fileID)})


    if toDelete is not None:
        print(f"Are you sure you want to delete {toDelete['name']}?")
        ans = YesNoMenu()

        if ans == True:
            mongoCollection.delete_one({"_id":ObjectId(fileID)})
            print("Sucessfully deleted item")
        else:
            print("Reverting Changes")
    else:
        print("Could not find item with specified ID")

def AddParameter():
    AddTextFile("parameters")

def AddProcess():
    AddTextFile("processes")

def EditParameter():
    EditTextFiles("parameters")

def EditProcess():
    EditTextFiles("processes")

def DeleteParameter():
    DeleteTextFile("parameters")

def DeleteProcess():
    DeleteTextFile("processes")

def TempFileWrite(initial_message):
    EDITOR = os.environ.get('EDITOR','vim') 

    with tempfile.NamedTemporaryFile(suffix=".tmp") as tf:
      tf.write(str.encode(initial_message))
      tf.flush()
      call([EDITOR, tf.name])

      # do the parsing with `tf` using regular File operations.
      # for instance:
      tf.seek(0)
      edited_message = tf.read()
      return edited_message

def main():

    while True:
        print("")
        print("What would you like to do?")
        options = [
                "Display Bot Status",
                "Edit Bot Status",
                "Display Bot Configs",
                "Create New Bot Config",
                "Edit Bot Config",
                "Delete Bot Config", 
                "Edit Parameter",
                "Add Parameter",
                "Delete Parameter",
                "Edit Process",
                "Add Process",
                "Delete Process",
                "quit"]
        terminal_menu = TerminalMenu(options)
        menu_entry_index = terminal_menu.show()

        try:
            if options[menu_entry_index] == "Display Bot Status":
                DisplayBotStatus()
            if options[menu_entry_index] == "Edit Bot Status":
                EditBotStatus()
            if options[menu_entry_index] == "Display Bot Configs":
                DisplayBotConfig()
            if options[menu_entry_index] == "Create New Bot Config":
                CreateBotConfig()
            if options[menu_entry_index] == "Edit Bot Config":
                EditBotConfig()
            if options[menu_entry_index] == "Delete Bot Config":
                DeleteBotConfig()
            if options[menu_entry_index] == "Edit Parameter":
                EditParameter()
            if options[menu_entry_index] == "Add Parameter":
                AddParameter()
            if options[menu_entry_index] == "Delete Parameter":
                DeleteParameter()
            if options[menu_entry_index] == "Edit Process":
                EditProcess()
            if options[menu_entry_index] == "Add Process":
                AddProcess()
            if options[menu_entry_index] == "Delete Process":
                DeleteProcess()
            if options[menu_entry_index] == "quit":
                sys.exit()

        except Exception as e:
            print("")
            print("There was an error:")
            print(str(e))

if __name__ == "__main__":

    defaultBotConfig = json.dumps({
    "name": "jeff_equities_2",
    "timeframe": "3m",
    "indicator": "rsi1,rsi2,rsi3,heik,heik_diff",
    "watchlist": "buffett",
    "position_sizing": "equal",
    "order_routing": "alpaca",
    "data_source": "polygon",
    "live_trading": "false",
    "starting_cash": "10000",
    "extended_hours": "True",
    "macro_strategy": "tsrh_dc",
    "indicator_signalling": "default",
    "asset_class": "equities",
    }, indent = 4)

    main()


