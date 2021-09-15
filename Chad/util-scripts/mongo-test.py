import pymongo
from pathlib import Path

# This will upload a text file of your choice to mongoDB
# Useful for storing python indicators and such


database = "parameters"
collection = "indicators"

topfolder = Path.cwd().parent

name = "tsrh_dc"
filePath = topfolder.joinpath("lib/tsrh_dc.py")

client = pymongo.MongoClient("mongodb+srv://chad:JWh1w8IFMBZcuq21@cluster0.35i8i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")

client = client[database][collection]

to_upload = {
        "name":name,
        "contents":filePath.read_text(),
        }

inserted_id = client.insert_one(to_upload).inserted_id

print(inserted_id)





