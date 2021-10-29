import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from 'react-select'
import "react-datetime/css/react-datetime.css";
import StockChart from "./stock-chart/StockChart"
import { useHistory } from "react-router-dom";
import disableScroll from 'disable-scroll';

import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import MultiRangeSlider from 'components/MultiRangeSlider/MultiRangeSlider'
import { getSymbolsByMicroStrategy, getIndicators } from 'api/Api'

const HeiknStockChartItem = (props) => {

  const { selectedInstance, handleChartRedirect } = props
  const history = useHistory();
  const { viewType, initStrategy, initMicroStrategy, initIndicators, initSymbol } = history.location.state

  const [selectedViewType, setSelectedViewType] = useState(
    viewType
    ? viewType
    : { value: 'charting', label: 'Charting' }
  );

  console.log('initSymbol')
  console.log(initSymbol)

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
    { value: 'sliced_charting', label: 'Sliced Chatting'}
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

  const [optionsIndicator, setOptionsIndicator] = useState([
    {
      value: 'volume', label: 'VOLUME',
    },
    {
      value: 'rsi', label: 'RSI',
    },
    {
      value: 'macd', label: 'MACD',
    },
    {
      value: 'sma', label: 'SMA',
    }
  ])

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
          setOptionsStrategy(strategyOptions);
          if (data.result.length) {
            let item = data.result[0]
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
                setSymbolList([{ label: "All", value: "*" }, ...symbolOptions]);
                // setSymbol(symbolOptions[0])
          }
        })
    },
    [],
  )

  useEffect(async () => {
    const result = await getIndicators()
    if (result.success) {
      const indicatorList = result.data.map((o) => (
        {
          value: o,
          label: o
        }
      ))
      setOptionsIndicator(indicatorList)
    }
  }, [])

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
        { value: 'sliced_charting', label: 'Sliced Chatting'}
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
            setSymbolList([{ label: "All", value: "*" }, ...temp_data]);
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
      handleChartRedirect(0)
    } else if (e.value === 'sliced_charting') {
      handleChartRedirect(2)
    }
  }

  const handlSymbolChange = (e) => {
    if (e) {
        setSymbol(e)
    }
  }

  const handlMultiSymbolChange = (e, event) => {
    if (event.action === 'select-option' && event.option.value === '*') {
      setMultiSymbol(symbolList)
    } else if (event.action === 'deselect-option' && event.option.value === '*') {
      setMultiSymbol([])
    } else if (event.action === 'deselect-option') {
      setMultiSymbol(e.filter((o) => o.value !== '*'))
    }
    else if (e.length === symbolList.length - 1) {
      setMultiSymbol(symbolList)
    } else {
      setMultiSymbol(e)
    }
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
              setMicroStrategy(microStrategyOptions[0])
            }

            const symbolOptions = item.symbols.map(o => {
              return {
                value: o,
                label: o,
              }
            })
            setSymbolList([{ label: "All", value: "*" }, ...symbolOptions]);
            setSymbol(symbolOptions[0])
          }
        })
      }
    }
  }

  const handleIndicatorsChange = (options) => {
    setIndicators(options);
  }

  const handleMicroStrategyChange = async (e) => {
    setMicroStrategy(e);
    const result = await getSymbolsByMicroStrategy(strategy.value, e.value)
      if (result.success) {
        const symbolOptions = result.data.map(o => {
          return {
            value: o,
            label: o,
          }
        })

        if (selectedViewType.value !== 'performance') {
          setSymbolList(symbolOptions)
          setSymbol(symbolOptions[0])
        } else {
          setSymbolList([{ label: "All", value: "*" }, ...symbolOptions]);
          if (symbolOptions.length) {
            setMultiSymbol([symbolOptions[0]])
          } else {
            setMultiSymbol([])
          }
        }
      }
  }

  const selectDateRange = (startDate, endDate) => {
    setTradeStartDate(startDate)
    setTradeEndDate(endDate)
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
          {/* <div className="select-option">
            <Select
              value={selectedSymbolType}
              onChange={handleSymbolTypeChange}
              options={optionsSymbolType}
              placeholder="Select Symbol Type"
            />
          </div> */}
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
        {multiSymbol && viewType && (
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
        )}
      </div>
    </div>
  );
};

export default HeiknStockChartItem;
