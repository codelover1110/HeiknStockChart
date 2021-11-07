import React, { useState, useEffect } from "react";
import Chart from '../trades-chart/TradesChart';
import PerformanceChart from '../performance-chart/PerformanceChart'
import { TypeChooser } from "react-stockcharts/lib/helper";

import { getDataReq, getDataExtendedReq, getBacktestingResultReq, getDataSliceReq, getDataExtendedSliceReq } from 'api/Api';

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
    selectedSymbolType,
    chartPeriod,
    startDate,
    endDate,
    extendMarketTime,
    isSliced
  } = props;

  const [dbname, setDbname] = useState('')
	const [chartData, setChartData] = useState(null)
  const [exchange, setExchange] = useState('')

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
    const get_data = async (symbol) => {
      if (viewType !== 'performance') {
        if (!dbname) {
          return;
        }
        const requestBody = {
          'db_name': dbname,
          'symbol': symbol,
          'macro': strategy.value,
          'micro': (selectedInstance !== 'live_trading') ? microStrategy : '',
        }
        let dataRes;
        setChartData(null)
        try {
          if (extendMarketTime === 'extend_markettime') {
            if (isSliced) {
              dataRes = await getDataExtendedSliceReq(requestBody);
            } else {
              dataRes = await getDataExtendedReq(requestBody);
            }
          } else if (isSliced) {
            dataRes = await getDataSliceReq(requestBody);
          } else {
            dataRes = await getDataReq(requestBody);
          }
          if (dataRes.success) {
            let data = dataRes.data;
            if (data['chart_data'].length > 0) {
              data['chart_data']['columns'] = ["date", "open", "high", "low", "close", "volume", "split", "dividend", "absoluteChange", "percentChange"]
              data['chart_data'].map((x) => {
                let converDate = new Date(x.date)
                x.date = converDate
                return null
              })
              setChartData(data['chart_data'])
            }
          }
        } catch (e) {
          console.error(e)
        }
      } else {
        const symbols = multiSymbol.map((symbol) => symbol.value);
        if (!symbols.length | !microStrategy) {
          return;
        }

        const filteredSymbols = symbols.filter(symbol => symbol !== '*')
        const requestBody = {
          'symbols': filteredSymbols,
          "macro": strategy.value,
          "micro": microStrategy,
          'start_date': startDate,
          'end_date': endDate,
        }

        try {
          const backtestingResultRes = await getBacktestingResultReq(requestBody);
          if (backtestingResultRes.success) {
            setChartData(backtestingResultRes.data['chart_data'])
          }
        } catch (error) {
          console.error(error)
        }
      }
    }

    if (symbol || multiSymbol.length) {
      get_data(symbol)
    }
  }, [extendMarketTime, selectedInstance, dbname, viewType, symbol, multiSymbol, startDate, endDate, strategy.value])

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
      chartData == null ? <div className="hunter-loadding-status-text">Loading...</div> :
      <>
        <div className="select-wrape">
          <div>
            <strong>{chartPeriod} {exchange} </strong>
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