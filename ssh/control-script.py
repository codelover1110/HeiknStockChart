import pymongo
import pandas as pd
from abc import abstractclassmethod, abstractmethod
from datetime import datetime, tzinfo, timezone
from simple_term_menu import TerminalMenu



MONGO_CONNECT_STRING = 'mongodb://root:rootUser2021@20.84.64.243:27017'
mongo_client = pymongo.MongoClient(MONGO_CONNECT_STRING)


class Watch_List_Manager:
  watchlists = []

  def __init__(self):
    pass

  def get_all(self):
    if len(self.watchlists) == 0:
      db = mongo_client['parameters']
      collection = db['watchlists']
      self.watchlists = list(collection.find({}))
    return self.watchlists

  def get_options(self):
    watchlists = self.get_all()
    options = []
    for watchlist in watchlists:
      options.append(watchlist['name'])
    return options


  def find_symbols(self, name):
    watchlists = self.get_all()
    symbols = []
    for watchlist in watchlists:
      if watchlist['name'] == name:
        content = watchlist['contents']
        content.strip()
        symbols = content.split('\n')
        symbols = filter(lambda symbol: symbol.strip() != '', symbols)
        symbols = list(symbols)
        break
    return symbols


# Function that converts a string to list
def convert_str_to_list(text):
  list_in_str = text.strip()
  items = list_in_str.split(',')
  def trailling_str(n):
    return n.strip()

  items = map(trailling_str, items)
  return list(items)

def extract_data_range(text):
  parts = text.split('/')
  return parts

# Abstract class for data exporter
class Abstract_Data_Exporter:
  database_name = None
  collection_name = None
  kind_name = None

  # Initialized method
  def __init__(self, symbols, from_date, to_date):
    # self.collection_name = collection_name
    self.symbols = symbols
    self.from_date_obj = datetime.strptime(from_date, f'%Y-%m-%d')
    self.to_date_obj = datetime.strptime(to_date + ' 23:59:59.999999', f'%Y-%m-%d %H:%M:%S.%f')
    self.from_date = from_date
    self.to_date = to_date
    self.db = mongo_client[self.database_name]
    pass

  # Function that processes exporting data to csv
  def run(self):
    print('### Exporting..', self.kind_name)

    # get data from database
    collection_data = []
    if type(self.collection_name) is list:
      for collection in self.collection_name:
        data = self.get_data(collection)
        collection_data.append(data)
      data = pd.concat(collection_data)
    else:
      data = self.get_data(self.collection_name)

    # save data to csv file
    dataframe = pd.DataFrame(data)
    csv_filename = self.get_output_csv_filename()
    dataframe.to_csv(csv_filename)
    print('Outputted CSV: ', self.get_output_csv_filename())


  # Function that gets data from collection
  def get_data(self, collection_name):
    collection = self.db[collection_name]

    conditions = self.get_conditions()
    documents = collection.find(conditions)
    count = collection.count_documents(conditions)
    print(collection_name, '-', 'found', count, 'documents')

    dataframe = pd.DataFrame(list(documents))
    return dataframe

  # Function that returns the csv file name based on the kind of data and date range
  def get_output_csv_filename(self):
    return f'{self.kind_name}__{self.from_date}__{self.to_date}.csv'

  # Abstract function that need to be implemented from inherited class
  @abstractclassmethod
  def get_conditions(self):
    raise NotImplementedError

# Class News_Data_Exporter
class News_Data_Exporter(Abstract_Data_Exporter):
  database_name = 'sticker_news'
  collection_name = 'news_meta_data'
  kind_name = 'news'
  FIELD_TICKER = 'tickers'
  FIELD_DATE = 'date'

  @abstractmethod
  def get_conditions(self):
    conditions = []
    for symbol in self.symbols:
      conditions.append({self.FIELD_TICKER:{'$elemMatch': {'$eq':symbol}}})

    # {$or: [{tags:{$elemMatch: {$eq:'blue'}}}, {tags:{$elemMatch: {$eq:'plain'}}}]}

    the_symbol_condition = {'$or':conditions}
    the_date_condition = {'$and':[{self.FIELD_DATE:{'$gte': self.from_date_obj}}, {self.FIELD_DATE:{'$lte': self.to_date_obj}}]}
    the_full_condition = {'$and': [the_symbol_condition, the_date_condition]}
    return the_full_condition

# Class Financial_Data_Exporter
class Financial_Data_Exporter(Abstract_Data_Exporter):
  database_name = 'financials_data'
  collection_name = 'financials'
  kind_name = 'financial'
  FIELD_DATE = 'dateKey'
  FIELD_TICKER = 'ticker'

  # Function that gets conditions for filtering data
  @abstractmethod
  def get_conditions(self):
    conditions = []
    for symbol in self.symbols:
      conditions.append({self.FIELD_TICKER:{'$eq':symbol}})

    the_symbol_condition = {'$or':conditions}
    the_date_condition = {'$and':[{self.FIELD_DATE:{'$gte': self.from_date}}, {self.FIELD_DATE:{'$lte': self.to_date}}]}
    the_full_condition = {'$and': [the_symbol_condition, the_date_condition]}
    return the_full_condition

# Class Price_Data_Exporter
class Price_Data_Exporter(Abstract_Data_Exporter):
  database_name = 'stock_market_data_all'
  collection_name = ['backtest_1_minute', 'backtest_1_hour', 'backtest_1_day']
  kind_name = 'price'
  FIELD_TICKER = 'stock'
  FIELD_DATE = 'date'

  # Function that gets conditions for filtering data
  @abstractmethod
  def get_conditions(self):
    conditions = []
    for symbol in self.symbols:
      conditions.append({self.FIELD_TICKER:{'$eq':symbol}})

    the_symbol_condition = {'$or':conditions}
    the_date_condition = {'$and':[{self.FIELD_DATE:{'$gte': self.from_date_obj}}, {self.FIELD_DATE:{'$lte': self.to_date_obj}}]}
    the_full_condition = {'$and': [the_symbol_condition, the_date_condition]}
    return the_full_condition


if __name__ == '__main__':
  # Step 1
  # input_list_of_symbols = input('Please insert a list of symbols that you want.\n(FYI: will show you all watchlist and you can select one of them)\n') # e.g: AAPL, MSFT
  input_list_of_symbols_text = 'Please insert a list of symbols that you want.\n(FYI: will show you all watchlist and you can select one of them)\n'
  print(input_list_of_symbols_text)

  watchlist = Watch_List_Manager()
  options = watchlist.get_options()
  terminal_menu = TerminalMenu(options)
  menu_entry_index = terminal_menu.show()
  group_name = options[menu_entry_index]
  print('You selected:', group_name)
  list_of_symbols = watchlist.find_symbols(group_name)
  print(list_of_symbols,'\n')

  # Step 2
  prompt_text = 'What kind of data do you want to export from the mongo?\n- Here are data type you can export. (price, news, financial)\n'
  input_kind_of_data = input(prompt_text) # e.g: price, news, financial
  # input_kind_of_data = 'price, news, financial'
  # input_kind_of_data = 'news, financial'
  # input_kind_of_data = 'price'
  kind_of_data = convert_str_to_list(input_kind_of_data)

  # Step 3
  input_data_range = input('Please input data range(start /end time)\n') # e.g: 2021-01-01/2021-10-01
  # input_data_range = '2021-01-01/2021-10-01'
  # input_data_range = '2020-03-31/2020-03-31'
  # input_data_range = '2020-09-30/2020-09-30'
  [start_date, end_date] = extract_data_range(input_data_range)


  # Choose exporter to rn based on input data
  for kind in kind_of_data:
    if kind == 'price':
      exporter = Price_Data_Exporter(list_of_symbols, start_date, end_date)
    elif kind == 'news':
      exporter = News_Data_Exporter(list_of_symbols, start_date, end_date)
    elif kind == 'financial':
      exporter = Financial_Data_Exporter(list_of_symbols, start_date, end_date)

    if exporter:
      exporter.run()