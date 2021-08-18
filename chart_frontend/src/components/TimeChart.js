import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import http from "../http-common";
import axios from "axios";
import Select from 'react-select'

import _ from "underscore";
import moment from "moment";

import { TimeSeries, Index } from "pondjs";
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";

import { tsvParse, csvParse } from "d3-dsv";
import { timeParse } from "d3-time-format";
import StockChart from "./stock-chart/StockChart"

import { useHistory } from "react-router-dom";

const TutorialsList = () => {
  const history = useHistory();
  const [selectedOptionTable, setSelectedOptionTable] = useState(null)
  const [selectedInstance, setSelectedInstance] = useState([{ value: 'stress_test', label: 'Stress Test' }]);
  const [selectedViewType, setSelectedViewType] = useState([{ value: 'charting', label: 'Charting' }]);
  const [symbol, setSymbol] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [isGetSymbolList, setIsGetSymbolList] = useState(false)
  const [symbolList, setSymbolList] = useState([])
  const [chartColumn, setChartColumn] = useState({ value: 6, label: '6' })

  const optionsInstance = [
    { value: 'stress_test', label: 'Stress Test' },
    { value: 'optimization', label: 'Optimization' },
    { value: 'forward_test ', label: 'Forward Test' },
    { value: 'live_trading ', label: 'Live Trading' },
  ]
  
  const optionsViewTypes = [
    { value: 'charting', label: 'Charting' },
    { value: 'performance', label: 'Performance' },
    { value: 'optimization ', label: 'Optimization' },
  ]

  const optionsTable = [
    { value: '1D2M', label: '1D_2m' },
    { value: '4D12M', label: '4D_12m' },
    { value: '30D1H', label: '30D_1h' },
    { value: '90D4H', label: '90D_4h' },
    { value: '90D12H', label: '90D_12h' },
    { value: '1Y1D', label: '1Y_1D' }
  ] 
  
  const optionsStratgy = [
    { value: 'heikfilter', label: 'heikfilter' },
    { value: 'Strategy2', label: 'Strategy2' },
    { value: 'Strategy3', label: 'Strategy3' },
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
        instance: value,
        initPeriod: { value: '1D2M', label: '1D_2m' },
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

  const handleChangeTable = (value) => {
    setSelectedOptionTable(value)
    const locationState = {
      initPeriod: value,
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

  const handlSymbolChange = (e) => {
    if (e) {
      setSymbol(e)
    }
  }

  const handleStrategy = (e) => {
    if (e) {
      setStrategy(e)
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
          {symbol && (< StockChart period='1D2M' symbol={symbol.value} indicators={indicators} strategy={strategy} isHomePage={true}/>)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {symbol && (< StockChart period='4D12M' symbol={symbol.value} indicators={indicators} strategy={strategy} isHomePage={true}/>)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {symbol && (< StockChart period='30D1H' symbol={symbol.value} indicators={indicators} strategy={strategy} isHomePage={true}/>)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {symbol && (< StockChart period='90D4H' symbol={symbol.value} indicators={indicators} strategy={strategy} isHomePage={true}/>)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {symbol && (< StockChart period='90D12H' symbol={symbol.value} indicators={indicators} strategy={strategy} isHomePage={true}/>)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {symbol && (< StockChart period='1Y1D' symbol={symbol.value} indicators={indicators} strategy={strategy} isHomePage={true}/>)}
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
              value={selectedOptionTable}
              onChange={handleChangeTable}
              options={optionsTable}
              placeholder="Period"
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
          <div className="select-option">
            <Select
              value={strategy}
              onChange={handleStrategy}
              options={optionsStratgy}
              placeholder="Strategy"
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
