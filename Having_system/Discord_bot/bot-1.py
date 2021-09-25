import os
import sys
import pymongo
import discord
import aiohttp
import asyncio
from threading import Thread
import time
from dotenv import load_dotenv
from discord.ext import commands
from discord.ext import tasks
from datetime import datetime, timedelta

try:
   import queue
except ImportError:
   import Queue as queue
trigger_queue = queue.Queue()
buy_list = []

load_dotenv()
MONGO_URL = os.getenv('MONGO_URL_BIGML')
MONGO_DATABASE = os.getenv('MONGO_DATABASE')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')
TOKEN = os.getenv('DISCORD_TOKEN_CURRENT_ONLY')
GUILD_ID = os.getenv('DISCORD_GUILD_ID_CURRENT_ONLY')

intents = discord.Intents.default()
intents.members = True
client = discord.Client(intents=intents)

mongoclient = pymongo.MongoClient(MONGO_URL)
masterdb = mongoclient[MONGO_DATABASE]

async def get_all_text_channels(guild):
    text_channel_list = []
    # for guild in client.guilds:
    for channel in guild.channels:
        if str(channel.type) == 'text':
            text_channel_list.append(channel.name)
    return text_channel_list

@client.event
async def on_ready():
    await client.wait_until_ready()
    for guild in client.guilds:
        print ("Server:", guild.name)
    # send_message.start()     # no profit calculation
    calculate_profit.start()
    # update_channels.start()

    print(f'{client.user.name} has connected to Discord!')

@client.event
async def on_member_join(member):
    for channel in member.guild.channels:
        if str(channel) == "join_leave":
            embed = discord.Embed(color=0x4a3d9a)
            embed.add_field(name="Welcome", value=f"{member.name} has joined {member.guild.name}", inline=False)
            embed.set_image(url="https://newgitlab.elaztek.com/NewHorizon-Development/discord-bots/Leha/-/raw/master/res/welcome.gif")
            await channel.send(embed=embed)
            print ("+++++ member join: +++++: ", member.name)

            ######### direct message to joined member ##########
            await member.create_dm()
            await member.dm_channel.send(
                f'Hi {member.name}, welcome to my Discord server!'
            )
            # await channel.edit(name = 'Member count: {}'.format(channel.guild.member_count))

@client.event
async def on_member_remove(member):
    for channel in member.guild.channels:
        if str(channel) == "join_leave":
            embed = discord.Embed(color=0x4a3d9a)
            embed.add_field(name="Member Left", value=f"{member.name} has left {member.guild.name}", inline=False)
            # embed.set_image(url="https://newgitlab.elaztek.com/NewHorizon-Development/discord-bots/Leha/-/raw/master/res/welcome.gif")
            await channel.send(embed=embed)
            print ("+++++ member left: +++++: ", member.name)

@client.event
async def on_message(ctx):
    if ctx.content == "create":
        emoji = '\N{EYES}'
        await ctx.add_reaction(emoji)

@tasks.loop(seconds=1)
async def send_message():
    if trigger_queue.empty():
        print ("no trigger")
    else:
        while not trigger_queue.empty():
            trigger_item = trigger_queue.get()

            channel_name = trigger_item['channel_name'].lower()
            guild = client.get_guild(880351642149597205)
            text_channels = await get_all_text_channels(guild)
            if channel_name not in text_channels:
                await guild.create_text_channel(name=channel_name)
                time.sleep(0.5)
            channel = discord.utils.get(guild.channels, name=channel_name)

            try:
                if channel is not None:
                    trade_doc = trigger_item['trade_doc']
                    time_str = str(trade_doc['date'])
                    msg = '{}   {} - {} - {} - {}'.format(time_str, trade_doc['symbol'], trade_doc['side'], int(float(trade_doc['quantity'])), trade_doc['price'])
                    print (msg)
                    await channel.send(msg)
            except:
                print ('not available to send message to deleted channel')


@tasks.loop(seconds=1)
async def calculate_profit():
    if trigger_queue.empty():
        print ("no trigger")
    else:
        while not trigger_queue.empty():
            trigger_item = trigger_queue.get()
            if trigger_item['trade_doc']['side'].lower() == 'buy':
                buy_list.append(trigger_item)
            else:
                if len(buy_list) > 0:
                    for idx, buy_item in reversed(list(enumerate(buy_list))):
                        buy_trade_doc = buy_item['trade_doc']
                        if buy_item['channel_name'].lower() == trigger_item['channel_name'].lower():
                            if buy_trade_doc['symbol'] == trigger_item['trade_doc']['symbol']:
                                channel_name = trigger_item['channel_name'].lower()
                                guild = client.get_guild(880351642149597205)
                                text_channels = await get_all_text_channels(guild)
                                if channel_name not in text_channels:
                                    await guild.create_text_channel(name=channel_name)
                                    time.sleep(0.5)
                                channel = discord.utils.get(guild.channels, name=channel_name)

                                try:
                                    if channel is not None:
                                        sell_trade_doc = trigger_item['trade_doc']
                                        buy_msg = '    {}   {} - {} - {} - {}'.format(str(buy_trade_doc['date']),
                                                                                buy_trade_doc['symbol'], 
                                                                                buy_trade_doc['side'], 
                                                                                int(float(buy_trade_doc['quantity'])), 
                                                                                buy_trade_doc['price'])
                                        
                                        sell_msg = '    {}   {} - {} - {} - {}'.format(str(sell_trade_doc['date']), 
                                                                                sell_trade_doc['symbol'], 
                                                                                sell_trade_doc['side'], 
                                                                                int(float(sell_trade_doc['quantity'])), 
                                                                                sell_trade_doc['price'])
                                        
                                        profit_msg = '@@@@@@@@@@@@@@@@@@@@@@@=>  {} %       $ {}'.format(
                                                round(float(sell_trade_doc['price'])*100/float(buy_trade_doc['price']) - 100 + 0.0000001, 4),
                                                round(float(sell_trade_doc['price']) - float(buy_trade_doc['price']) + 0.0000001, 4)
                                            )

                                        await channel.send(buy_msg)
                                        await channel.send(sell_msg)
                                        await channel.send(profit_msg)
                                        del buy_list[idx]
                                except:
                                    print ('not available to send message to deleted channel')


@tasks.loop(seconds=10)
async def update_channels():
    guild = client.get_guild(880351642149597205)
    for channel in guild.channels:
        if str(channel.type) == 'text':
            messages = await channel.history(limit=10).flatten()
            if len(messages) > 1:
                last_message = messages[-2]
                time_str = ''.join(last_message.content[:19])
                try:
                    msg_time = datetime.strptime(time_str, '%Y-%m-%d %H:%M:%S')
                    current_time = datetime.now()
                    if current_time > msg_time + timedelta(days=7):
                        if channel is not None:
                            print ('delete channel: {}     => {}'.format(channel.name, last_message.content))
                            await channel.delete()
                except:
                    print ("error: time_str->'{}', message->{}".format(time_str, last_message.content) )

def put_new_trigger(doc):
    trade_doc = doc['fullDocument']
    strategy_name = trade_doc['macro_strategy'] + '-' + trade_doc['micro_strategy'] + '-trades'

    trigger_item = dict()
    trigger_item['channel_name'] = strategy_name
    trigger_item['trade_doc'] = trade_doc
    trigger_queue.put(trigger_item)

def start_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

def insert_change_stream():
    print("Insert listener thread started.")
    trade_collection = masterdb[MONGO_COLLECTION]

    # Change stream pipeline
    pipeline = [
        {'$match': {'operationType': 'insert'}}
    ]
    try:
        for document in trade_collection.watch(pipeline=pipeline, full_document='updateLookup'):
            put_new_trigger(document)

    except KeyboardInterrupt:
        keyboard_shutdown()

def keyboard_shutdown():
    print('Interrupted\n')
    try:
        sys.exit(0)
    except SystemExit:
        os._exit(0)

insert_loop = asyncio.new_event_loop()
insert_loop.call_soon_threadsafe(insert_change_stream)
t = Thread(target=start_loop, args=(insert_loop,))
t.start()
time.sleep(0.25)

client.run('ODgwMzQzNTM2Mzg0NDk1NjU4.YSc5zw.C82WpuDX_bD-3M1aKVXxrPFLjcA')
