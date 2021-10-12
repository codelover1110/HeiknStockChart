export const filterPriceData = async (selectedSymbolType, symbol, timeFrame, tradeStartDate, tradeEndDate) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'selectedSymbolType': selectedSymbolType,
      'symbol': symbol,
      'time_frame': timeFrame,
      'start': tradeStartDate,
      'end': tradeEndDate
    })
  };

  return await fetch(process.env.REACT_APP_BACKEND_URL + "/api/get_table_candles", requestOptions)
    .then(response => response.json())
    .then(data => {
      const candles = []
      data.candles.forEach((x) => {
        candles.push({
          'o': x.o,
          'h': x.h,
          'c': x.c,
          'l': x.l,
          'v': x.v,
          'date': x.date.replace('T', ' '),
        })
      })
      return candles
    })
}

export const filterTradesData = async (selectedSymbolType, symbol, macroStrategy, microStrategy, tradeStartDate, tradeEndDate) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'selectedSymbolType': selectedSymbolType,
      'symbol': symbol,
      'macroStrategy': macroStrategy,
      'microStrategy': microStrategy,
      'tradeStartDate': tradeStartDate,
      'tradeEndDate': tradeEndDate
    })
  };

  return await fetch(process.env.REACT_APP_BACKEND_URL + "/api/get_data_trades", requestOptions)
    .then(response => response.json())
    .then(data => {
      let trades_data = []
      data.trades_data.forEach((x) => {
        trades_data.push({
          'symbol': x.symbol,
          'strategy': `${x.macro_strategy} - ${x.micro_strategy}`,
          'side': x.side,
          'quantity': x.quantity,
          'date': x.date.replace('T', ' '),
          'price': x.price
        })
      })
      return trades_data
    })
}

export const getAllSymbols = async () => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'strategy': 'no_strategy'
    })
  };
  
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/api/tables", requestOptions)
    .then(response => response.json())
    .then(data => {
      let temp_data = []
      data.tables.map((x) => {
        temp_data.push({
          value: x,
          label: x
        });
        return null
      })
      return temp_data
    })
}

export const createSignUpLink = async (roles) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      roles: roles,
      link: process.env.REACT_APP_BACKEND_URL + '/signup/'
    })
  };
  let res = []
  await fetch(process.env.REACT_APP_BACKEND_URL + "/links", requestOptions)
    .then(response => response.json())
    .then(async data => {
      if (data.success === "create link") {
        await fetch(process.env.REACT_APP_BACKEND_URL + "/links")
        .then(response => response.json())
        .then(data => {
          res = data
        })
      }
    })  
  return res
}

export const getActiveLinks = async () => {
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/links")
    .then(response => response.json())
    .then(data => {
      return data;
    })
}

export const sendSignUpLink = async (email, link) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      email,
      link
    })
  };
  
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/send-signup-link", requestOptions)
    .then(response => response.json())
    .then(data => {
      return true
    })  
}

export const forgotPassword = async (email) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      email,
      url: process.env.REACT_APP_BACKEND_URL
    })
  };
  
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/password_reset/", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })    
}

export const getStrategyOptions = async () => {
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/api/get_strategies")
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const passwordConfirmReset = async (password1, password2, pathname) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      password1,
      password2,
      pathname: pathname
    })
  };
  
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/password_reset_confirm/", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })    
}

export const getScriptFileNames = async() => {
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/api/get_script_files")
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const getModuleTypeNames = async() => {
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/strategy/parameter_list/")
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const getFileTypeNames = async(moduleType) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      param_type: moduleType
    })
  };
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/strategy/parameter_detail_list/", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const createScriptFile = async(filename, content, isUpdate) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      filename,
      content,
    })
  };

  const api = isUpdate ? '/api/update_script_file' : '/api/create_script_file';

  return await fetch(process.env.REACT_APP_BACKEND_URL + api, requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })
}

const convertArraytoString = (src) => {
  if (!src) {
    return ''
  }

  let dest = ''
  let comma = ''
  src.forEach(o => {
    dest = dest + comma + o.value
    comma = ','
  })
  return dest
}

const convertStringtoArray = (src) => {
  if (!src || !src.length) {
    return null
  }

  const dest = src.split(',')
  return dest.map((o) => ({
    value: o,
    label: o
  }))
}

const transformingProcessConfigToQuery = (settings) => {
  return {
    bot_name: settings.bot_name,
    timeframe: convertArraytoString(settings.timeframe),
    indicator: convertArraytoString(settings.indicator),
    watchlist: convertArraytoString(settings.watchlist),
    position_sizing: convertArraytoString(settings.position_sizing),
    order_routing: convertArraytoString(settings.order_routing),
    data_source: convertArraytoString(settings.data_source),
    live_trading: convertArraytoString(settings.live_trading),
    starting_cash: settings.starting_cash,
    hours: convertArraytoString(settings.hours),
    name: settings.name,
    macro_strategy: convertArraytoString(settings.macro_strategy),
    indicator_signalling: convertArraytoString(settings.indicator_signalling),
    asset_class: convertArraytoString(settings.asset_class),
  };
}

const transformingProcessConfigFromParam = (settings) => {
  return {
    bot_name: settings.bot_name,
    timeframe: convertStringtoArray(settings.timeframe),
    indicator: convertStringtoArray(settings.indicator),
    watchlist: convertStringtoArray(settings.watchlist),
    position_sizing: convertStringtoArray(settings.position_sizing),
    order_routing: convertStringtoArray(settings.order_routing),
    data_source: convertStringtoArray(settings.data_source),
    live_trading: convertStringtoArray(settings.live_trading),
    starting_cash: settings.starting_cash,
    hours: convertStringtoArray(settings.hours),
    name: settings.name,
    macro_strategy: convertStringtoArray(settings.macro_strategy),
    indicator_signalling: convertStringtoArray(settings.indicator_signalling),
    asset_class: convertStringtoArray(settings.asset_class),
  };
}

export const saveConfigFile = async(settings) => {
  const data = transformingProcessConfigToQuery(settings)
  
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      config_collection: 'bot_configs',
      config: data
    })
  };  

  const api = '/strategy/create_one_config_detail/';

  return await fetch(process.env.REACT_APP_BACKEND_URL + api, requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const saveScriptFile = async(filename, content, isUpdate, isCheckedStrategy) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      filename,
      content,
      isStrategyScript: isCheckedStrategy
    })
  };

  const api = isUpdate ? '/strategy/save_script_file' : '/api/create_script_file';

  return await fetch(process.env.REACT_APP_BACKEND_URL + api, requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const getScriptFile = async(filename) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      filename,
    })
  };
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/api/get_script_file", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })
}

/** User Management Api*/
export const getUserList = async () => {
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/get_user_list")
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const updateUserRole = async (id, role) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      id,
      role
    })
  };
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/update_user_role", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const deleteUser = async (id) => {
  const requestOptions = {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      id,
    })
  };

  return await fetch(process.env.REACT_APP_BACKEND_URL + "/delete_user/", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const getConfigFileList = async (collection) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      config_collection: collection,
    })
  };
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/strategy/config_detail_names/", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const getConfigFileDetail = async (collection, name) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      config_collection: collection,
      name,
    })
  };
  const res = await fetch(process.env.REACT_APP_BACKEND_URL + "/strategy/config_item_detail/", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })

  return transformingProcessConfigFromParam(res.result)
}

export const getBotStatusList = async () => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      "config_collection": "bot_status"
    })
  };
  
  return await fetch(process.env.REACT_APP_BACKEND_URL + "/strategy/bot_status_list/", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })  
}

export const updateBotStatus = async (botName, botAction) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      "config_collection": "bot_configs",
      "name": botName
    })
  };
  
  const apiUrl = botAction === 'start' 
    ? '/strategy/bot_run/'
    : botAction === 'pause' 
    ? '/strategy/bot_pause/'
    : '/strategy/bot_stop/'

  try {
    return await fetch(process.env.REACT_APP_BACKEND_URL + apiUrl, requestOptions)
      .then(response => response.json())
      .then(data => {
        return data
      })  
  } catch (e) {
    return {
      success: false,
      message: e
    }
  }
}

export const getBotConfigList = async () => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      "config_collection": "bot_configs",
    })
  };
  
  const apiUrl = '/strategy/config_details/'

  try {
    return await fetch(process.env.REACT_APP_BACKEND_URL + apiUrl, requestOptions)
      .then(response => response.json())
      .then(data => {
        return data
      })  
  } catch (e) {
    return {
      success: false,
      message: e
    }
  }
}

export const getNewsFinancialData = async (symbol) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'symbol': symbol,
    })
  };
  
  const apiUrl = '/news/symbol_news/'

  try {
    return await fetch(process.env.REACT_APP_BACKEND_URL + apiUrl, requestOptions)
      .then(response => response.json())
      .then(data => {
        return data
      })  
  } catch (e) {
    return {
      success: false,
      message: e
    }
  }
}

export const getIncomeStatement = async (symbol) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'symbol': symbol,
    })
  };

  return await fetch(process.env.REACT_APP_BACKEND_URL + "/financials/income_statement/", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })
}
export const getBalanceSheet = async (symbol) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'symbol': symbol,
    })
  };

  return await fetch(process.env.REACT_APP_BACKEND_URL + "/financials/balance_sheet/", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const getCashStatement = async (symbol) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'symbol': symbol,
    })
  };

  return await fetch(process.env.REACT_APP_BACKEND_URL + "/financials/cash_statement/", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const getFinancialTotalData = async (symbol) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'symbol': symbol,
    })
  };

  return await fetch(process.env.REACT_APP_BACKEND_URL + "/financials/financial_total_data/", requestOptions)
    .then(response => response.json())
    .then(data => {
      return data
    })
}

export const getStockModalData = async () => {
  const apiUrl = '/scanner/available_items/'

  try {
    return await fetch(process.env.REACT_APP_BACKEND_URL + apiUrl)
      .then(response => response.json())
      .then(data => {
        return data
      })  
  } catch (e) {
    return {
      success: false,
      message: e
    }
  }
}

export const getMultiFinancials = async (symbols, statement_type) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'symbols': symbols,
      'financial_part': statement_type,
    })
  };

  const apiURL = '/scanner/multi_financials/'
  try {
    return await fetch(process.env.REACT_APP_BACKEND_URL + apiURL, requestOptions)
      .then(response => response.json())
      .then(data => {
        return data.results
      })  
  } catch (e) {
    return {
      success: false,
      message: e
    }
  }
}

export const saveScannerView = async (chart_number, symbols, fields) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'chart_number': chart_number,
      'symbols': symbols,
      'fields': fields,
    })
  };

  const apiURL = '/scanner/save_scanner_views/'
  try {
    return await fetch(process.env.REACT_APP_BACKEND_URL + apiURL, requestOptions)
      .then(response => response.json())
      .then(data => {
        return data.results
      })  
  } catch (e) {
    return {
      success: false,
      message: e
    }
  }    
}

export const getScannerViewData = async (chart_number) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'chart_number': chart_number,
    })
  };

  const apiURL = '/scanner/scanner_views/'
  try {
    return await fetch(process.env.REACT_APP_BACKEND_URL + apiURL, requestOptions)
    .then(response => response.json())
    .then(data => {
        return data.result
      })  
  } catch (e) {
    return {
      success: false,
      message: e
    }
  }
}

export const getScannerDetails = async (exchange='', industry='', sector='') => {
  
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'exchange': exchange,
      'industry': industry,
      'sector': sector
    })
  };
  
  const apiURL = '/scanner/ticker_details_list/'
  
  try {
    return await fetch(process.env.REACT_APP_BACKEND_URL + apiURL, requestOptions)
    .then(response => response.json())
    .then(data => {
      return data.result
    })  
  } catch (e) {
    return {
      success: false,
      message: e
    }
  }
}

export const getTickerScannerOptions = async () => {
  const apiUrl = '/scanner/ticker_details_filter_options/'

  try {
    return await fetch(process.env.REACT_APP_BACKEND_URL + apiUrl)
      .then(response => response.json())
      .then(data => {
        return data
      })  
  } catch (e) {
    return {
      success: false,
      message: e
    }
  }
}

export const getFloatsFilterOptions = async () => {
  const apiUrl = '/floats/float_details_filter_options/'

  try {
    return await fetch(process.env.REACT_APP_BACKEND_URL + apiUrl)
      .then(response => response.json())
      .then(data => {
        return data
      })  
  } catch (e) {
    return {
      success: false,
      message: e
    }
  }
}

export const getFloatsDetails = async (pageNumber, pageAmount, exchange='', industry='', sector='') => {
  
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'page_num': pageNumber,
      'page_mounts': pageAmount,
      'exchange': exchange,
      'industry': industry,
      'sector': sector,
    })
  };
  
  const apiURL = '/floats/float_details_list/'
  
  try {
    return await fetch(process.env.REACT_APP_BACKEND_URL + apiURL, requestOptions)
    .then(response => response.json())
    .then(data => {
      return data.results
    })  
  } catch (e) {
    return {
      success: false,
      message: e
    }
  }
}