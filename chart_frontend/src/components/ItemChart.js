import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from 'react-select'
import "react-datetime/css/react-datetime.css";
import StockChart from "./stock-chart/StockChart"
import { useHistory } from "react-router-dom";
import disableScroll from 'disable-scroll';

import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import MultiRangeSlider from 'components/MultiRangeSlider/MultiRangeSlider'

const HeiknStockChartItem = (props) => {
    
  const { selectedInstance, handleChartRedirect } = props
  const history = useHistory();
  const { viewType, initStrategy, initMicroStrategy, initIndicators, initSymbol } = history.location.state
  
  const [selectedViewType, setSelectedViewType] = useState(
    viewType
    ? viewType
    : { value: 'charting', label: 'Charting' }
  );
    
  const [selectedSymbolType, setSelectedSymbolType] = useState({
    value: 'stock',
    label: 'stock'
  })
  const [symbol, setSymbol] = useState(initSymbol)
  const [multiSymbol, setMultiSymbol] = useState([initSymbol])
  const [strategy, setStrategy] = useState(initStrategy ? initStrategy : {})
  const [symbolList, setSymbolList] = useState([])
  const [microStrategy, setMicroStrategy] = useState(initMicroStrategy ? initMicroStrategy: null)
  const [indicators, setIndicators] = useState(initIndicators)
  const [apiFlag, setApiFlag] = useState(false)
  const [tradeStartDate, setTradeStartDate] = useState('')
  const [tradeEndDate, setTradeEndDate] = useState('')
  const [strategyList, setStrategyList] = useState([]);
    
  const [optionsViewTypes, setOptionsViewTypes] = useState([
    { value: 'charting', label: 'Charting' },
    { value: 'performance', label: 'Performance' },
  ])    

  const [optionsMicroStrategy, setOptionsMicroStrategy] = useState([])
    
  const [optionsStratgy, setOptionsStrategy] = useState([])

  const optionsSymbolType = [
    {
      value: 'stock', label: 'stock',
    },
    {
      value: 'crypto', label: 'crypto',
    }
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

  const getStrategyList = useCallback(
    () => {
      fetch(process.env.REACT_APP_BACKEND_URL + "/api/get_strategy_list")
        .then(response => response.json())
        .then(data => {
          setStrategyList(data.result);
          const strategyOptions = data.result.map((o => {
            return {
              value: o.macro,
              label: o.macro,
            }
          }))
          // setStrategy({
          //   value: 'heikfilter',
          //   label: 'heikfilter'
          // });
          setOptionsStrategy(strategyOptions);
          if (data.result.length) {
            data.result.forEach((item) => {
              if (item.macro === 'heikfilter') {
                const microStrategyOptions = item.micro.map(o => {
                  return {
                    value: o,
                    label: o,
                  }
                })
                setOptionsMicroStrategy( microStrategyOptions )                

                const symbolOptions = item.symbols.map(o => {
                  return {
                    value: o,
                    label: o,
                  }
                })
                setSymbolList(symbolOptions)
                // setSymbol(symbolOptions[0])
              }
            })
          }
        })   
    },
    [],
  )

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user-info'))
    if (user.is_admin || user.role.length) {
      getStrategyList();
    }
    disableScroll.on();
    return () => {
      disableScroll.off();
    }
  }, [getStrategyList])
    
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
      try {
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
      } catch (error) {
        console.log(error)  
      }
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

  const handleStrategyChange = async (e) => {
    if (e) {
      setStrategy(e)
      if (strategyList.length) {
        strategyList.forEach((item) => {
          if (item.macro === e.value) {
            const microStrategyOptions = item.micro.map(o => {
              return {
                value: o,
                label: o,
              }
            })
            setOptionsMicroStrategy( microStrategyOptions )

            const is_2m = microStrategyOptions.filter((o => o.value === '2m'))
            if (is_2m.length) {
              setMicroStrategy({
                value: '2m',
                label: '2m'
              })
            } else {
              setMicroStrategy(microStrategyOptions[2])
            }

            const symbolOptions = item.symbols.map(o => {
              return {
                value: o,
                label: o,
              }
            })
            setSymbolList(symbolOptions)
            setSymbol(symbolOptions[0])
          }
        })
      }
    }
  }

  const handleIndicatorsChange = (options) => {
    setIndicators(options);
  }

  const handleMicroStrategyChange = (e) => {
    setMicroStrategy(e);
  }

  const selectDateRange = (startDate, endDate) => {
    setTradeStartDate(startDate)
    setTradeEndDate(endDate)
  }

  const handleSymbolTypeChange = (e) => {
    setSelectedSymbolType(e)
  }

  return (
    <div className="hunter-chart-container">
      <nav className="navbar navbar-expand navbar-dark bg-dark hunter-nav-bar">
        <div className="logo-title">
          <a href="/chart" className="hunter-navbar-brand">
            Violette AM - Client Portal 
          </a>
        </div>
        <div className="navbar-nav ma-auto hunter-nav-bar-nav">
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
            : (<div className="select-multi-option hunter-multi-select-checkboxes">
                <ReactMultiSelectCheckboxes
                  options={symbolList}
                  value={multiSymbol}
                  onChange={handlMultiSymbolChange}
                />
              </div>)
          }
          <div className="select-option">
            <Select
              value={selectedSymbolType}
              onChange={handleSymbolTypeChange}
              options={optionsSymbolType}
              placeholder="Select Symbol Type"
            />
          </div>
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
          <div className='date hunter-item-chart hunter-date-time-picker' id='datetimepicker1'>
            <MultiRangeSlider
              selectDateRange={selectDateRange}
            />
          </div>
        </div>
      </nav>
      <div className="graphs-container dark">
        {viewType && (
          < StockChart
            selectedSymbolType={selectedSymbolType.value}
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
        )}
      </div>
    </div>
  );
};

export default HeiknStockChartItem;
