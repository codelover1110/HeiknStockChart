import pymongo



client = pymongo.MongoClient("mongodb+srv://chad:JWh1w8IFMBZcuq21@cluster0.35i8i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")

print(client["backtesting_trades"]["trade-history"])
