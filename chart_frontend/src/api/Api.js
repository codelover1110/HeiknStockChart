export const filterPriceData = async (symbol, timeFrame, tradeStartDate, tradeEndDate) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
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

export const filterTradesData = async (symbol, macroStrategy, microStrategy, tradeStartDate, tradeEndDate) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
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