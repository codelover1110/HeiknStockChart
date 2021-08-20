import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from 'react-select'
import _ from "underscore";
import "react-datetime/css/react-datetime.css";
import StockChart from "./stock-chart/StockChart"
import { useHistory } from "react-router-dom";

const TutorialsList = () => {
  const history = useHistory();
  const [selectedInstance, setSelectedInstance] = useState({ value: 'stress_test', label: 'Stress Test' });
  const [selectedViewType, setSelectedViewType] = useState({ value: 'charting', label: 'Charting' });
  const [symbol, setSymbol] = useState(null);
  const [microStrategy, setMicroStrategy] = useState({ value: 'heikfilter-2mins-trades', label: '2-Mins-Trades' })
  const [strategy, setStrategy] = useState({ value: 'heikfilter', label: 'heikfilter' });
  const [indicators, setIndicators] = useState([]);
  const [isGetSymbolList, setIsGetSymbolList] = useState(false)
  const [symbolList, setSymbolList] = useState([])
  const [chartColumn, setChartColumn] = useState({ value: 6, label: '6' })

  const optionsInstance = [
    { value: 'stress_test', label: 'Stress Test' },
    { value: 'optimization', label: 'Optimization' },
    { value: 'forward_test', label: 'Forward Test' },
    { value: 'live_trading', label: 'Live Trading' },
  ]
  
  const optionsViewTypes = [
    { value: 'charting', label: 'Charting' },
    { value: 'performance', label: 'Performance' },
    { value: 'optimization ', label: 'Optimization' },
  ]

  const [optionsMicroStrategy, setOptionsMicroStrategy] = useState([
    { value: 'heikfilter-2mins-trades', label: '2-Mins-Trades' },
    { value: 'heikfilter-12mins-trades', label: '12-Mins-Trades' },
    { value: 'heikfilter-1hour-trades', label: '1-Hour-Trades' },
    { value: 'heikfilter-2hour-trades', label: '2-Hour-Trades' },
    { value: 'heikfilter-4hours-trades', label: '4-Hours-Trades' },
    { value: 'heikfilter-12hours-trades', label: '12-Hours-Trades' },
  ])
  
  const optionsStratgy = [
    { value: 'heikfilter', label: 'heikfilter' },
  ]

  const optionsIndicator = [
    {
      value: 'VOLUME', label: 'VOLUME',
    },
    {
      value: 'RSI', label: 'RSI',
    },
    {
      value: 'MACD', label: 'MACD',
    },
    {
      value: 'SMA', label: 'SMA',
    }
  ]

  const optionsColumn = [
    {
      value: 1, label: '1',
    },
    {
      value: 2, label: '2',
    },
    {
      value: 4, label: '4',
    },
    {
      value: 6, label: '6',
    }
  ]

  useEffect(() => {
    if(!isGetSymbolList) {
      get_tables();    
    }  
  }, [])

  const handleInstanceChange = (value) => {
    setSelectedInstance(value)  
  }
  
  const handleViewTypeChange = (value) => {
    setSelectedViewType(value)
    if (value.value === 'performance') {
      const locationState = {
        selectedInstance,
        viewType: value,
        initStrategy: strategy,
        initMicroStrategy: { value: 'heikfilter-2mins-trades', label: '2-Mins-Trades' },
        initIndicators: indicators,
        initSymbol: symbol,
      }
      if (value) {
        history.push({
          pathname: '/ItemChart',
          state: locationState,
        });
      }
    }
  }

  const handlSymbolChange = (e) => {
    if (e) {
      setSymbol(e)
    }
  }

  const handleStrategy = (e) => {
    if (e) {
      setStrategy(e)
      if (e.value === 'heikfilter') {
        setOptionsMicroStrategy([
          { value: 'heikfilter-2mins-trades', label: '2-Mins-Trades' },
          { value: 'heikfilter-12mins-trades', label: '12-Mins-Trades' },
          { value: 'heikfilter-1hour-trades', label: '1-Hour-Trades' },
          { value: 'heikfilter-4hours-trades', label: '4-Hours-Trades' },
          { value: 'heikfilter-12hours-trades', label: '12-Hours-Trades' },
          { value: 'heikfilter-1day-trades', label: '1-Day-Trades' }
        ])
      } else {
        setOptionsMicroStrategy([])
    }
    }
  }
  
  const handleMicroStrategyChange = (e) => {
    if (e) {
      setMicroStrategy(e)
    }

    const locationState = {
      selectedInstance,
      selectedViewType,
      initStrategy: strategy,
      initMicroStrategy: e,
      initIndicators: indicators,
      initSymbol: symbol,
    }
    if (e) {
      history.push({
        pathname: '/ItemChart',
        state: locationState,
      });
    }
  }
  
  const handleIndicatorsChange = (options) => {
    setIndicators(options);
  }

  const get_tables = () => {
		fetch(process.env.REACT_APP_BACKEND_URL + "/api/tables")
				.then(response => response.json())
				.then(data => {
					let temp_data = []
					data.tables.map((x) => {
						temp_data.push({
							value: x,
							label: x
						});
					})
					setSymbolList(temp_data)
          setSymbol(temp_data[0])
				})
	}

  const handleChartsColumnChange = (option) => {
    setChartColumn(option)
  }

  const calculateHeightStyle = () => {
    if (chartColumn.value === 1 || chartColumn.value === 2) {
      return 'full-height'
    }
    return 'half-height'
  }

  const calculateGridColumn = () => {
    if (chartColumn.value === 1) {
      return 12
    } else if ((chartColumn.value === 2) || (chartColumn.value === 4)) {
      return 6
    }
    return 4
  }

  const displayChart = () => {
    return (
        
      <div className={`row ${calculateHeightStyle()}`}>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {symbol && (
            < StockChart 
              selectedInstance={selectedInstance.value}
              selectedTradeDB='heikfilter-2mins-trades'
              symbol={symbol.value}
              indicators={indicators}
              strategy={strategy}
              isHomePage={true}
              chartColumn={chartColumn.value}
              microStrategy={microStrategy.value}
            />
          )}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {symbol && (
          < StockChart 
            selectedInstance={selectedInstance.value}
            selectedTradeDB='heikfilter-12mins-trades'
            symbol={symbol.value}
            indicators={indicators}
            strategy={strategy}
            isHomePage={true}
            chartColumn={chartColumn.value}
            microStrategy={microStrategy.value}
          />)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {symbol && (
            < StockChart
              selectedInstance={selectedInstance.value}
              selectedTradeDB='heikfilter-1hour-trades'
              symbol={symbol.value}
              indicators={indicators}
              strategy={strategy}
              isHomePage={true}
              chartColumn={chartColumn.value}
              microStrategy={microStrategy.value}
            />)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {symbol && (
            < StockChart
              selectedInstance={selectedInstance.value}
              selectedTradeDB='heikfilter-4hours-trades'
              symbol={symbol.value}
              indicators={indicators}
              strategy={strategy}
              isHomePage={true}
              chartColumn={chartColumn.value}
              microStrategy={microStrategy.value}
            />)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {symbol && (
            < StockChart
              selectedInstance={selectedInstance.value}
              selectedTradeDB='heikfilter-12hours-trades'
              symbol={symbol.value}
              indicators={indicators}
              strategy={strategy}
              isHomePage={true}
              chartColumn={chartColumn.value}
              microStrategy={microStrategy.value}
            />)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {symbol && (
          < StockChart
            selectedInstance={selectedInstance.value}
            selectedTradeDB='heikfilter-1day-trades'
            symbol={symbol.value}
            indicators={indicators}
            strategy={strategy}
            isHomePage={true}
            chartColumn={chartColumn.value}
            microStrategy={microStrategy.value}
          />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <a href="/chart" className="navbar-brand">
          Hunter Violette - HeikinAshi
        </a>
        <div className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link to={"/chart"} className="nav-link"></Link>
          </li>
          <div className="select-option">
            <Select
              value={selectedInstance}
              onChange={handleInstanceChange}
              options={optionsInstance}
              placeholder="Instance"
            />
          </div>
          <div className="select-option">
            <Select
              value={selectedViewType}
              onChange={handleViewTypeChange}
              options={optionsViewTypes}
              placeholder="Charting"
            />
          </div>
          <div className="select-option">
               <Select
                value={strategy}
                onChange={handleStrategy}
                options={optionsStratgy}
                placeholder="Macro Strategy"
              />
            </div>
          <div className="select-option">
            <Select
              value={microStrategy}
              onChange={handleMicroStrategyChange}
              options={optionsMicroStrategy}
              placeholder="Micro Strategy"
            />
          </div>
          <div className="select-option">
            <Select
              value={symbol}
              onChange={handlSymbolChange}
              options={symbolList}
              placeholder="Symbol"
            />
          </div>
          <div className="select-multi-option">
            <Select
              name="filters"
              placeholder="Indicators"
              value={indicators}
              onChange={handleIndicatorsChange}
              options={optionsIndicator}
              isMulti={true}
            />
          </div>
          <div className="select-option">
            <Select
              value={chartColumn}
              onChange={handleChartsColumnChange}
              options={optionsColumn}
              placeholder="Columns"
            />
          </div>
        </div>
      </nav>
      <div className="graphs-container dark">
        {(chartColumn.value === 1) && displayChart()}
        {(chartColumn.value === 2) && displayChart()}
        {(chartColumn.value === 4) && displayChart()}
        {(chartColumn.value === 6) && displayChart()}
      </div>
    </div>
  );
};

export default TutorialsList;
