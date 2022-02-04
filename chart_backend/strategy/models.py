from datetime import datetime, timedelta
import pymongo

# mongoclient = pymongo.MongoClient("mongodb://aliaksandr:BD20fc854X0LIfSv@cluster0-shard-00-00.35i8i.mongodb.net:27017,cluster0-shard-00-01.35i8i.mongodb.net:27017,cluster0-shard-00-02.35i8i.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-aoj781-shard-0&authSource=admin&retryWrites=true&w=majority")
mongoclient = pymongo.MongoClient('mongodb://root:rootUser2021@20.84.64.243:27018/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false')

STRATEGY_PARAMETERS = 'parameters'
PROCESS_CONFIGS = 'processes'
param_db = mongoclient[STRATEGY_PARAMETERS]
proc_db = mongoclient[PROCESS_CONFIGS]

def get_parameter_list():
    collections = param_db.collection_names(include_system_collections=False)
    return collections

def get_parameter_detail_list(param_type):
    db_collection = param_db[param_type]
    param_details = list(db_collection.find({}, {"_id": False}))
    return param_details

def get_parameter_item_names(param_type):
    db_collection = param_db[param_type]
    param_items = [item['name'] for item in db_collection.find().sort('_id', pymongo.ASCENDING)]
    return param_items

def get_parameter_content(param_type, param_item_name):
    db_collection = param_db[param_type]

    content = db_collection.find_one({"name": param_item_name})
    return content['contents']

def save_parameter_item(param_name, item_name, contents):
    db_collection = param_db[param_name]
    query = {'name': item_name}
    b_param = db_collection.find_one(query)
    if b_param is not None:
        db_collection.update_one({'_id': b_param['_id']}, {'$set': {'contents': contents}})
    else:
        db_collection.insert_one({'name': item_name, 'contents': contents})

def save_other_parameter_item(item_name, contents):
    param_other = "others"
    db_collection = param_db[param_other]
    query = {'name': item_name}
    b_param = db_collection.find_one(query)
    if b_param is not None:
        db_collection.update_one({'_id': b_param['_id']}, {'$set': {'contents': contents}})
    else:
        db_collection.insert_one({'name': item_name, 'contents': contents})


#################### config operations ####################

def create_bot_configs_one(bot_config):
    db_collection = proc_db['bot_configs']
    bot_config['update_date'] = datetime.now()
    query = {"name": bot_config['name']}
    b_config = db_collection.find_one(query)
    if b_config is not None:
        db_collection.update_one({"_id": b_config['_id']}, {"$set": bot_config}, upsert=False)
    else:
        db_collection.insert_one(bot_config)

def get_bot_config_list():
    db_collection = proc_db['bot_configs']

    return list(db_collection.find({}, {'_id': False}).sort('update_date', pymongo.ASCENDING))

def get_config_list():
    collections = proc_db.collection_names(include_system_collections=False)
    return collections

def get_config_details(config_collection):
    db_collection = proc_db[config_collection]

    return list(db_collection.find({}, {'_id': False}).sort('update_date', pymongo.ASCENDING))

def get_config_item_detail(config_collection, name):
    db_collection = proc_db[config_collection]

    return db_collection.find_one({"name": name}, {'_id': False})

def save_configs_one(config_collection, config):
    db_collection = proc_db[config_collection]
    config['update_date'] = datetime.now()
    query = {"name": config['name']}
    b_config = db_collection.find_one(query)
    if b_config is not None:
        db_collection.update_one({"_id": b_config['_id']}, {"$set": config}, upsert=False)
    else:
        db_collection.insert_one(config)

def delete_configs(delete_config_list):
    for config_collection in delete_config_list:
        proc_db.drop_collection(config_collection)

def delete_config_items(config_collection, config_detail_names):
    db_collection = proc_db[config_collection]
    for config_detail_name in config_detail_names:
        query = {"name": config_detail_name}
        doc = db_collection.find_one(query)
        obj_id = doc['_id']
        result = proc_db[config_collection].delete_one({'_id': obj_id})
