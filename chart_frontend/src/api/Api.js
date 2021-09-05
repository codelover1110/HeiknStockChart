export const filterPriceData = async (symbol, macroStrategy, microStrategy, tradeStartDate, tradeEndDate) => {
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
          'strategy': x.strategy_name,
          'side': x.side,
          'quantity': x.quantity,
          'date': x.date.replace('T', ' '),
          'price': x.price
        })
      })
      return trades_data
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
          'strategy': x.strategy_name,
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
      return true
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