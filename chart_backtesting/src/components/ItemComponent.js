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

const TutorialsList = (props) => {
    const { initPeriod, initIndicators, initSymbol } = props.location.state

    const history = useHistory();
    const [isGetSymbolList, setIsGetSymbolList] = useState(false)
    const [selectedOptionTable, setSelectedOptionTable] = useState(null)
    const [symbol, setSymbol] = useState(initSymbol);
    const [strategy, setStrategy] = useState(null);
    const [symbolList, setSymbolList] = useState([])
    const [period, setPeriod] = useState(initPeriod)
    const [indicators, setIndicators] = useState(initIndicators);
    const [apiFlag, setApiFlag] = useState(false)
    
    const optionsStratgy = [
        { value: 'heikfilter', label: 'heikfilter' },
        { value: 'Strategy2', label: 'Strategy2' },
        { value: 'Strategy3', label: 'Strategy3' },
      ]

    const optionsTable = [
        { value: '1D2M', label: '1D_2m' },
        { value: '4D12M', label: '4D_12m' },
        { value: '30D1H', label: '30D_1h' },
        { value: '90D4H', label: '90D_4h' },
        { value: '90D12H', label: '90D_12h' },
        { value: '1Y1D', label: '1Y_1D' }
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
    
    useEffect(() => {
        if (!apiFlag) {
            setSelectedOptionTable(period)
            setPeriod(period)
            if (!isGetSymbolList) {
                get_tables();
            }
            setApiFlag(true)
        }
    
    })

    const handleChangeTable = (value) => {
        setSelectedOptionTable(value)
        if (value) {
            setPeriod(value)
        }

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
                        />
                    </div>
                    <div className="select-option">
                        <Select
                            value={symbol}
                            onChange={handlSymbolChange}
                            options={symbolList}
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
                < StockChart period={period.value} symbol={symbol.value} indicators={indicators} strategy={strategy} isHomePage={false}/>
            </div>
        </div>

    );
};

export default TutorialsList;
