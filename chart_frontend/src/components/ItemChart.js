import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from 'react-select'
import _ from "underscore";
import "react-datetime/css/react-datetime.css";
import StockChart from "./stock-chart/StockChart"
import { useHistory } from "react-router-dom";

const TutorialsList = (props) => {
    const { instance, viewType, initStrategy, initMicroStrategy, initIndicators, initSymbol } = props.location.state
    
    const history = useHistory();
    const [isGetSymbolList, setIsGetSymbolList] = useState(false)
    
    const [selectedInstance, setSelectedInstance] = useState(
      instance 
      ? instance
      : { value: 'forward_test', label: 'Forward Test' }
    );
    const [selectedViewType, setSelectedViewType] = useState(
      viewType
      ? viewType
      : { value: 'charting', label: 'Charting' }
    );

    const [selectedOptionTable, setSelectedOptionTable] = useState(null)
    const [symbol, setSymbol] = useState(initSymbol)
    const [multiSymbol, setMultiSymbol] = useState([initSymbol])
    const [strategy, setStrategy] = useState(initStrategy ? initStrategy : {})
    const [symbolList, setSymbolList] = useState([])
    const [microStrategy, setMicroStrategy] = useState(initMicroStrategy ? initMicroStrategy: null)
    const [indicators, setIndicators] = useState(initIndicators)
    const [apiFlag, setApiFlag] = useState(false)

    const optionsInstance = [
      { value: 'forward_test', label: 'Forward Test' },
      // { value: 'optimization', label: 'Optimization' },
      { value: 'stress_test', label: 'Stress Test' },
      { value: 'live_trading', label: 'Live Trading' },
    ]
      
    const optionsViewTypes = [
      { value: 'charting', label: 'Charting' },
      { value: 'performance', label: 'Performance' },
      { value: 'optimization ', label: 'Optimization' },
    ]    

    const [optionsMicroStrategy, setOptionsMicroStrategy] = useState([
      { value: 'heikfilter-2mins-trades', label: '2 mins' },
      { value: 'heikfilter-2mins-4hours-trades', label: '2 mins>4 hours' },
      { value: 'heikfilter-2mins-12mins-4hours-trades', label: '2 mins>12 mins>4 hours' },
      { value: 'heikfilter-12mins-trades', label: '12 mins' },
      { value: 'heikfilter-12mins-4hours-trades', label: '12 mins>4 hours' },
      { value: 'heikfilter-4hours-trades', label: '4 hours' }
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
    
    useEffect(() => {
        if (!apiFlag) {
            setSelectedOptionTable(microStrategy)
            setMicroStrategy(microStrategy)
            if (!isGetSymbolList) {
                get_tables();
            }
            setApiFlag(true)
        }
    
    })

    const get_tables = () => {
      const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          'strategy': strategy.value
        })
      };
      fetch(process.env.REACT_APP_BACKEND_URL + "/api/tables", requestOptions)
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

    const handleInstanceChange = (e) => {
      setSelectedInstance(e)
    }
    
    const handleViewTypeChange = (e) => {
        setSelectedViewType(e)
        if (e.value === 'charting') {
          history.push({
            pathname: '/'
          });
        }
    }

    const handlSymbolChange = (e) => {
        if (e) {
            setSymbol(e)
        }
    }
    
    const handlMultiSymbolChange = (e) => {
        setMultiSymbol(e)
    }

    const handleStrategyChange = (e) => {
        if (e) {
          setStrategy(e)
            if (e.value === 'heikfilter') {
              setOptionsMicroStrategy([
                    { value: 'heikfilter-2mins-trades', label: '2 mins' },
                    { value: 'heikfilter-2mins-4hours-trades', label: '2 mins>4 hours' },
                    { value: 'heikfilter-2mins-12mins-4hours-trades', label: '2 mins>12 mins>4 hours' },
                    { value: 'heikfilter-12mins-trades', label: '12 mins' },
                    { value: 'heikfilter-12mins-4hours-trades', label: '12 mins>4 hours' },
                    { value: 'heikfilter-4hours-trades', label: '4 hours' },
                ])
            } else {
              setOptionsMicroStrategy([])
            }
        }
      }

    const handleIndicatorsChange = (options) => {
        setIndicators(options);
    }

    const handleMicroStrategyChange = (e) => {
        setMicroStrategy(e);
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
                    {selectedViewType.value !== 'performance'
                      ? (<div className="select-option">
                        <Select
                            value={symbol}
                            onChange={handlSymbolChange}
                            options={symbolList}
                        />
                          </div>)
                      : (<div className="select-multi-option">
                            <Select
                                value={multiSymbol}
                                onChange={handlMultiSymbolChange}
                                options={symbolList}
                                isMulti={true}
                            />
                        </div>)
                    }
                    {(selectedInstance.value !== 'live_trading') &&
                     (<div className="select-option">
                          <Select
                          value={strategy}
                          onChange={handleStrategyChange}
                          options={optionsStratgy}
                          placeholder="Macro Strategy"
                          />
                      </div>)
                    }
                    {selectedInstance.value !== 'live_trading' && 
                     (<div className="select-option">
                        <Select
                          name="filters"
                          placeholder="Micro Strategy"
                          value={microStrategy}
                          onChange={handleMicroStrategyChange}
                          options={optionsMicroStrategy}
                        />
                      </div>)
                    }
                    {selectedViewType.value !== 'performance' && 
                        (<div className="select-multi-option">
                            <Select
                                name="filters"
                                placeholder="Indicators"
                                value={indicators}
                                onChange={handleIndicatorsChange}
                                options={optionsIndicator}
                                isMulti={true}
                            />
                        </div>)
                    }
                </div>
            </nav>
            <div className="graphs-container dark">
                < StockChart
                  selectedInstance ={selectedInstance.value}
                  viewType={selectedViewType.value}
                  microStrategy={microStrategy.value}
                  symbol={symbol.value}
                  multiSymbol={multiSymbol}
                  indicators={indicators}
                  strategy={strategy}
                  isHomePage={false}
                />
            </div>
        </div>

    );
};

export default TutorialsList;
