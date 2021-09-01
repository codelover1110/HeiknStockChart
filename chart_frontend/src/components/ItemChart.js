import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from 'react-select'
import "react-datetime/css/react-datetime.css";
import StockChart from "./stock-chart/StockChart"
import { useHistory } from "react-router-dom";
import disableScroll from 'disable-scroll';

const HeiknStockChartItem = (props) => {
    
    const { selectedInstance, handleChartRedirect } = props
    const history = useHistory();
    const { viewType, initStrategy, initMicroStrategy, initIndicators, initSymbol } = history.location.state
    
    const [selectedViewType, setSelectedViewType] = useState(
      viewType
      ? viewType
      : { value: 'charting', label: 'Charting' }
    );

    const [symbol, setSymbol] = useState(initSymbol)
    const [multiSymbol, setMultiSymbol] = useState([initSymbol])
    const [strategy, setStrategy] = useState(initStrategy ? initStrategy : {})
    const [symbolList, setSymbolList] = useState([])
    const [microStrategy, setMicroStrategy] = useState(initMicroStrategy ? initMicroStrategy: null)
    const [indicators, setIndicators] = useState(initIndicators)
    const [apiFlag, setApiFlag] = useState(false)
    const [tradeStartDate, setTradeStartDate] = useState(null)
    const [tradeEndDate, setTradeEndDate] = useState(null)

    const [optionsViewTypes, setOptionsViewTypes] = useState([
      { value: 'charting', label: 'Charting' },
      { value: 'performance', label: 'Performance' },
    ])    

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
      disableScroll.on();
      return () => {
        disableScroll.off();
      }
    })
    
    useEffect(() => {
      if (selectedInstance.value === 'optimization') {
        setOptionsViewTypes([
          { value: 'optimization', label: 'Optimization' },
        ])
      } else {
        setOptionsViewTypes([
          { value: 'charting', label: 'Charting' },
          { value: 'performance', label: 'Performance' },
        ])
      }
    }, [selectedInstance])

    useEffect(() => {
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
                return null
            })
            setSymbolList(temp_data)
          })
      }
      
      if (!apiFlag) {
        setMicroStrategy(microStrategy)
        get_tables();
        setApiFlag(true)
      }
    }, [setMicroStrategy, apiFlag, microStrategy, setApiFlag, strategy.value])

    const handleViewTypeChange = (e) => {
      setSelectedViewType(e)
      if (e.value === 'charting') {
        handleChartRedirect(true)
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

    const handleTradeStartDateChange = (e) => {
      setTradeStartDate(e.target.value)
    }
    
    const handleTradeEndDateChange = (e) => {
      setTradeEndDate(e.target.value)
    }

    return (
      <div className="hunter-chart-container">
        <nav className="navbar navbar-expand navbar-dark bg-dark hunter-nav-bar">
          <div className="logo-title">
            <a href="/chart" className="hunter-navbar-brand">
                Hunter Violette - HeikinAshi
            </a>
          </div>
          <div className="navbar-nav mr-auto">
            <li className="nav-item">
                <Link to={"/chart"} className="nav-link"></Link>
            </li>
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
            <div className='input-group date hunter-performance-chart hunter-date-time-picker' id='datetimepicker1'>
              <span> Start: </span> 
                <input 
                  type='date'
                  className="form-control hunter-input"
                  value={tradeStartDate}
                  onChange={handleTradeStartDateChange}
                />
                <span className="input-group-addon">
                <span className="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
            <div className='input-group date hunter-performance-chart hunter-date-time-picker' id='datetimepicker2'>
              <span> End: </span> 
              <input 
                type='date'
                className="form-control hunter-input"
                value={tradeEndDate}
                onChange={handleTradeEndDateChange}
              />
              <span className="input-group-addon">
              <span className="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
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
            startDate={tradeStartDate}
            endDate={tradeEndDate}
          />
        </div>
      </div>
    );
};

export default HeiknStockChartItem;
