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
  const [symbol, setSymbol] = useState({value: 'AAPL', label: 'AAPL'});
  const [strategy, setStrategy] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [isGetSymbolList, setIsGetSymbolList] = useState(false)
  const [symbolList, setSymbolList] = useState([])
  const optionsTable = [
    { value: '1D2M', label: '1D_2m' },
    { value: '4D12M', label: '4D_12m' },
    { value: '30D1H', label: '30D_1h' },
    { value: '90D4H', label: '90D_4h' },
    { value: '90D12H', label: '90D_12h' },
    { value: '1Y1D', label: '1Y_1D' }
  ] 
  
  const optionsStratgy = [
    { value: 'Stratgy1', label: 'Stratgy1' },
    { value: 'Stratgy2', label: 'Stratgy2' },
    { value: 'Stratgy3', label: 'Stratgy3' },
  ]

  const optionsIndicator = [
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

  useEffect(() => {
    if(!isGetSymbolList) {
      get_tables();    
    }  
  }, [])

  const handleChangeTable = (value) => {
    setSelectedOptionTable(value)
    const locationState = {
      initPeriod: value,
      initIndicators: indicators,
      initSymbol: symbol,
    }
    if (value) {
      history.push({
        pathname: '/itemComponent',
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
				})
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
        </div>
      </nav>
      <div className="graphs-container dark">
        <div className="row">
          <div className="col-md-4 graph-container" >
            < StockChart period='1D2M' symbol={symbol.value} indicators={indicators}/>
          </div>
          <div className="col-md-4 graph-container">
            <StockChart period='4D12M' symbol={symbol.value} indicators={indicators}/>
          </div>
          <div className="col-md-4 graph-container">
            <StockChart period='30D1H' symbol={symbol.value} indicators={indicators}/>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 graph-container">
            <StockChart period='90D4H' symbol={symbol.value} indicators={indicators}/>
          </div>
          <div className="col-md-4 graph-container">
            <StockChart period='90D12H' symbol={symbol.value} indicators={indicators}/>
          </div>
          <div className="col-md-4 graph-container">
            <StockChart period='1Y1D' symbol={symbol.value} indicators={indicators}/>
          </div>
        </div>
      </div>
    </div>

  );
};

export default TutorialsList;
