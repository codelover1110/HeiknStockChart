import React, { useState, useEffect } from "react";
import Chart from '../trades-chart/TradesChart';
import PerformanceChart from '../performance-chart/PerformanceChart'
import { TypeChooser } from "react-stockcharts/lib/helper";

const StockChart = (props) => {
  const { 
    chartColumn,
    viewType,
    symbol,
    strategy,
    isHomePage,
    indicators,
    multiSymbol,
    microStrategy,
    selectedInstance,
    selectedTradeDB,
    chartPeriod,
    startDate,
    endDate,
    extendMarketTime
  } = props;

  const [dbname, setDbname] = useState('')
	const [chartData, setChartData] = useState(null)
	
  useEffect(() => {
    if (selectedInstance === 'live_trading') {
      setChartData(null)    
    }
  }, [selectedInstance])

  useEffect(() => {
    const initDbNamebySelectedTradeDB = () => {
      if (selectedTradeDB === 'heikfilter-2mins-trades') {
        setDbname('backtest_2_minute');
      } else if(selectedTradeDB === 'heikfilter-12mins-trades') {
        setDbname('backtest_12_minute');
      } else if(selectedTradeDB === 'heikfilter-1hour-trades') {
        setDbname('backtest_1_hour');
      } else if(selectedTradeDB === 'heikfilter-4hours-trades') {
        setDbname('backtest_4_hour');
      } else if(selectedTradeDB === 'heikfilter-12hours-trades') {
        setDbname('backtest_12_hour');
      } else if(selectedTradeDB === 'heikfilter-1day-trades') {
        setDbname('backtest_1_day');
      }
    }
    initDbNamebySelectedTradeDB();
  }, [selectedTradeDB])

  useEffect(() => {
    setChartData(null)      
  }, [viewType])

  useEffect(() => {
    const get_data = (symbol) => {
      if (viewType !== 'performance') {
        if (!dbname) {
          return;
        }
        const requestOptions = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'db_name': dbname,
            'symbol': symbol,
            'macro': strategy.value,
            'micro': (selectedInstance !== 'live_trading') ? microStrategy : '',
          })
        };
        setChartData(null)
        let apiName = '/api/get_data';
        if (extendMarketTime === 'extend_markettime') {
          apiName = '/api/get_data_extended';
        }
        try {
          fetch(process.env.REACT_APP_BACKEND_URL + apiName, requestOptions)
          .then(response => response.json())
          .then(data => {
            data['chart_data']['columns'] = ["date", "open", "high", "low", "close", "volume", "split", "dividend", "absoluteChange", "percentChange"]
            data['chart_data'].map((x) => {
              let converDate = new Date(x.date)
              x.date = converDate
              return null
            })
            setChartData(data['chart_data'])
          })
        } catch (error) {
          console.log(error)    
        }
      } else {
        const symbols = multiSymbol.map((symbol) => symbol.value);
        if (!symbols.length | !microStrategy) {
          return;
        }
        const requestOptions = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'symbols': symbols,
            "macro": strategy.value,
            "micro": microStrategy,
            'start_date': startDate,
            'end_date': endDate,
          })
        };
        try {
          fetch(process.env.REACT_APP_BACKEND_URL+'/api/get_backtesting_result', requestOptions)
            .then(response => response.json())
            .then(data => {
              setChartData(data['chart_data'])
            })
        } catch (error) {
          console.log(error)
        }
      }
    }
      
    if (symbol || multiSymbol.length) {
      get_data(symbol)
    }
  }, [extendMarketTime, selectedInstance, dbname, viewType, symbol, multiSymbol, microStrategy, startDate, endDate, strategy.value])
    
  const displayPerformanceChart = (type) => {
    return (
      <PerformanceChart type={type} data={chartData} multiSymbol={multiSymbol.map((symbol) => symbol.value)}/>
    )
  }

  const displayChart = () => {
    return (
      <TypeChooser >
        {type => {
          return (
            (isHomePage | (viewType !== 'performance'))
            && (<Chart
                type={type}
                data={chartData}
                symbol={symbol}
                strategy={strategy}
                isHomePage={isHomePage}
                indicators={indicators}
                chartColumn={chartColumn}
                microStrategy={microStrategy}
                selectedInstance={selectedInstance}
                extendMarketTime={extendMarketTime}
            />)
          )
        }}
      </TypeChooser>
    )
  }

  return (
  <>
    {
      chartData == null ? <div>Loading...</div> :
      <>
        <div className="select-wrape">
          <div>
            <strong>{chartPeriod} [NASDAQ]</strong>
          </div>
        </div>
        {(chartColumn === 1) && displayChart()}
        {(chartColumn === 2) && displayChart()}
        {(chartColumn === 4) && displayChart()}
        {(chartColumn === 6) && displayChart()}
        {(viewType === "performance") && displayPerformanceChart()}
      </>
  }
  </>)
}

export default StockChart