import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from 'react-select'
import "react-datetime/css/react-datetime.css";
import StockChart from "./stock-chart/StockChart"
import { useHistory } from "react-router-dom";
import {
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  NavLink,
  Nav,
} from "reactstrap";
import { useAuth } from 'contexts/authContext';
import disableScroll from 'disable-scroll';

const HeiknStockSlicedChart = (props) => {

  const auth = useAuth();
  const { selectedInstance, handleChartRedirect } = props
  const history = useHistory();
  const [symbol, setSymbol] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [isShowMicro, setIsShowMicro] = useState(true);
  const [symbolList, setSymbolList] = useState([])
  const [collapseOpen,] = React.useState(false)
  const [chartColumn, setChartColumn] = useState({ value: 6, label: '6' })
  const [selectedViewType, setSelectedViewType] = useState({ value: 'sliced_charting', label: 'Sliced Charting' });
  const [microStrategy, setMicroStrategy] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [strategyList, setStrategyList] = useState([]);
  const [user] = useState(JSON.parse(localStorage.getItem('user-info')));
  const [extendMarketTime, setExtendMarketTime] = useState(
    {
      value: 'markettime', label: 'market time',
    }
  );

  const [selectedSymbolType, setSelectedSymbolType] = useState({
    value: 'stock',
    label: 'stock'
  })

  const optionsSymbolType = [
    {
      value: 'stock', label: 'stock',
    },
    {
      value: 'crypto', label: 'crypto',
    }
  ]

  const [optionsViewTypes, setOptionsViewTypes] = useState([
    { value: 'chart_with_new_api', label: 'Chart With New API4' },
    { value: 'charting', label: 'Charting' },
    { value: 'performance', label: 'Performance' },
    { value: 'sliced_charting', label: 'Sliced Charting' },
  ])

  const [optionsMicroStrategy, setOptionsMicroStrategy] = useState([])

  const [optionsStratgy, setOptionsStrategy] = useState([])

  const [optionsIndicator, setOptionsIndicator] = useState([
    {
      value: 'volume', label: 'VOLUME',
    },
    {
      value: 'rsi1', label: 'RSI',
    },
    {
      value: 'heik', label: 'HEIK1',
    },
    {
      value: 'heik_diff', label: 'HEIK2',
    }
  ]);

  const [optionsMarketTime] = useState([
    {
      value: 'markettime', label: 'market time',
    },
    {
      value: 'extend_markettime', label: 'extend market time',
    }
  ]);

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

  const getStrategyList = useCallback(
    () => {
      try {
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/get_strategy_list")
          .then(response => response.json())
          .then(data => {
            console.log('data???', data)
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
            setStrategy(strategyOptions[0]);
            if (data.result.length) {
              let item = data.result[0]
              const microStrategyOptions = item.micro.map(o => {
                return {
                  value: o,
                  label: o,
                }
              })
              setOptionsMicroStrategy( microStrategyOptions )
              setMicroStrategy(microStrategyOptions[0])

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
      } catch (error) {
        console.log(error)
      }
    },
    [],
  )

  const get_tables = useCallback(
    (strategy) => {
      const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          'strategy': strategy
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
          // setSymbol(temp_data[0])
        })
    },
    [],
  )

  useEffect(() => {
    disableScroll.on();
    return () => {
      disableScroll.off();
    }
  }, [getStrategyList, user])

  useEffect(() => {
    const handleInstanceChange = (value) => {
      if (value === 'live_trading') {
        setIsShowMicro(false);
        setStrategy({ value: 'no_strategy', label: 'No Strategy' });
        setOptionsStrategy([
          { value: 'no_strategy', label: 'No Srategy' },
        ])
        return
      } else if (value === 'forward_test') {
        // setStrategy({ value: 'heikfilter', label: 'heikfilter' });
        // setSymbol({ value: 'MSFT', label: 'MSFT' });
      }
      getStrategyList()
      setIsShowMicro(true);
    }
    if (!user.is_admin && !user?.role.length) {
      return;
    }
    handleInstanceChange(selectedInstance)
    if(selectedInstance === 'live_trading') {
      get_tables('no_strategy');
    }
    if (selectedInstance === 'optimization') {
      setOptionsViewTypes([
        { value: 'optimization ', label: 'Optimization' },
      ])
    } else {
      setOptionsViewTypes([
        { value: 'chart_with_new_api', label: 'Chart With New API3' },
        { value: 'charting', label: 'Charting' },
        { value: 'performance', label: 'Performance' },
        { value: 'sliced_charting', label: 'Sliced Charting' },
      ])
    }
  }, [selectedInstance, getStrategyList, get_tables, user.is_admin, user.role?.length])

  const handleViewTypeChange = (value) => {
    setSelectedViewType(value)
    if (value.value === 'performance') {
      const locationState = {
        selectedInstance,
        viewType: value,
        initStrategy: strategy,
        initMicroStrategy: microStrategy,//{ value: '2m', label: '2m' }
        initIndicators: indicators,
        initSymbol: symbol,
      }
      if (value) {
        handleChartRedirect(1)
        history.push({
          state: locationState,
        });
      }
    } else if (value.value === 'charting') {
      handleChartRedirect(0)
    } else if (value.value === 'chart_with_new_api') {
      handleChartRedirect(3)
    }
  }

  const handlSymbolChange = (e) => {
    if (e) {
      setSymbol(e)
    }
  }

  const handleMarketTimeChange = (e) => {
    if (e) {
      setExtendMarketTime(e)
    }
  }

  const handleStrategy = async (e) => {
    if (e) {
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
            setSymbolList(symbolOptions)
            setSymbol(symbolOptions[0])
            // setSymbol({value: 'MSFT', label: 'MSFT'})
          }
        })
      }
      setStrategy(e)
    }
  }

  const handleMicroStrategyChange = (e) => {
    if (e) {
      setMicroStrategy(e)
    }
  }

  const handleIndicatorsChange = (options) => {
    setIndicators(options);
  }

  const handleChartsColumnChange = (option) => {
    if (option.value === 4 || option.value === 6) {
      setIndicators([])
      setOptionsIndicator([
        {
          value: 'volume', label: 'VOLUME',
        },
        {
          value: 'rsi1', label: 'RSI',
        },
        {
          value: 'heik', label: 'HEIK1',
        },
        {
          value: 'heik_diff', label: 'HEIK2',
        }
      ])
    } else {
      setIndicators([])
      setOptionsIndicator([
        {
          value: 'volume', label: 'VOLUME',
        },
        {
          value: 'rsi1', label: 'RSI',
        },
        {
          value: 'rsi2', label: 'RSI2',
        },
        {
          value: 'rsi3', label: 'RSI3',
        },
        {
          value: 'heik', label: 'HEIK1',
        },
        {
          value: 'heik_diff', label: 'HEIK2',
        }
      ])
    }
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

  const handleSymbolTypeChange = (e) => {
    setSelectedSymbolType(e)
  }

  const handleSignout = () => {
    auth.signout()
    history.push('/login')
  }

  const displayChart = () => {
    return (
      <div className={`row ${calculateHeightStyle()}`}>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {microStrategy && symbol && (
            < StockChart
              selectedSymbolType={selectedSymbolType.value}
              extendMarketTime={extendMarketTime.value}
              selectedInstance={selectedInstance}
              selectedTradeDB='heikfilter-2mins-trades'
              chartPeriod='20D 2min'
              symbol={symbol.value}
              indicators={indicators}
              strategy={strategy}
              isHomePage={true}
              chartColumn={chartColumn.value}
              microStrategy={microStrategy.value}
              startDate={null}
              endDate={null}
              isSliced={true}
            />
          )}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {microStrategy && symbol && (
            < StockChart
            extendMarketTime={extendMarketTime.value}
            selectedInstance={selectedInstance}
            selectedTradeDB='heikfilter-12mins-trades'
            chartPeriod='20D 12min'
            symbol={symbol.value}
            indicators={indicators}
            strategy={strategy}
            isHomePage={true}
            chartColumn={chartColumn.value}
            microStrategy={microStrategy.value}
            startDate={null}
            endDate={null}
            isSliced={true}
          />)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {microStrategy && symbol && (
            < StockChart
              extendMarketTime={extendMarketTime.value}
              selectedInstance={selectedInstance}
              selectedTradeDB='heikfilter-1hour-trades'
              chartPeriod='30D 1hour'
              symbol={symbol.value}
              indicators={indicators}
              strategy={strategy}
              isHomePage={true}
              chartColumn={chartColumn.value}
              microStrategy={microStrategy.value}
              startDate={null}
              endDate={null}
              isSliced={true}
            />)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {microStrategy && symbol && (
            < StockChart
              extendMarketTime={extendMarketTime.value}
              selectedInstance={selectedInstance}
              selectedTradeDB='heikfilter-4hours-trades'
              chartPeriod='90D 4hour'
              symbol={symbol.value}
              indicators={indicators}
              strategy={strategy}
              isHomePage={true}
              chartColumn={chartColumn.value}
              microStrategy={microStrategy.value}
              startDate={null}
              endDate={null}
              isSliced={true}
            />)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {microStrategy && symbol && (
            < StockChart
              extendMarketTime={extendMarketTime.value}
              selectedInstance={selectedInstance}
              selectedTradeDB='heikfilter-12hours-trades'
              chartPeriod='90D 12hour'
              symbol={symbol.value}
              indicators={indicators}
              strategy={strategy}
              isHomePage={true}
              chartColumn={chartColumn.value}
              microStrategy={microStrategy.value}
              startDate={null}
              endDate={null}
              isSliced={true}
            />)}
        </div>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {microStrategy && symbol && (
          < StockChart
            extendMarketTime={extendMarketTime.value}
            selectedInstance={selectedInstance}
            selectedTradeDB='heikfilter-1day-trades'
            chartPeriod='1Y 1day'
            symbol={symbol.value}
            indicators={indicators}
            strategy={strategy}
            isHomePage={true}
            chartColumn={chartColumn.value}
            microStrategy={microStrategy.value}
            startDate={null}
            endDate={null}
            isSliced={true}
          />)}
        </div>
      </div>
    )
  }

  return (
    <div className="hunter-chart-container">
      <nav className="navbar navbar-expand navbar-dark bg-dark hunter-nav-bar">
        <div className="logo-title">
          <a href="/chart" className="hunter-navbar-brand">
            Violette AM - Client Portal
          </a>
        </div>
        {(user.is_admin || (user.role?.length)) && (
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
            <div className="select-option">
              <Select
                value={extendMarketTime}
                onChange={handleMarketTimeChange}
                options={optionsMarketTime}
                placeholder="Market Time"
              />
            </div>
            {/* <div className="select-option">
              <Select
                value={selectedSymbolType}
                onChange={handleSymbolTypeChange}
                options={optionsSymbolType}
                placeholder="Select Symbol Type"
              />
            </div> */}
            <div className="select-option">
              <Select
                value={strategy}
                onChange={handleStrategy}
                options={optionsStratgy}
                placeholder="Macro Strategy"
              />
            </div>
            {isShowMicro && (
              <div className="select-option">
                <Select
                  value={microStrategy}
                  onChange={handleMicroStrategyChange}
                  options={optionsMicroStrategy}
                  placeholder="Micro Strategy"
                />
              </div>
            )}
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
        )}
        <Collapse navbar isOpen={collapseOpen}>
            <Nav className="ml-auto" navbar>
              <UncontrolledDropdown>
                <DropdownToggle
                  caret
                  color="default"
                  nav
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="photo">
                    <img
                      alt="..."
                      src={require("assets/img/anime3.png").default}
                    />
                  </div>
                  <p className="d-lg-none">Log out</p>
                </DropdownToggle>
                <DropdownMenu className="dropdown-navbar" right tag="ul">
                  <DropdownItem divider tag="li" />
                  <NavLink tag="li">
                    <DropdownItem className="nav-item" onClick={() => {
                      handleSignout()
                    }}>Log out</DropdownItem>
                  </NavLink>
                </DropdownMenu>
              </UncontrolledDropdown>
              <li className="separator d-lg-none" />
            </Nav>
          </Collapse>
      </nav>
      {!user.is_admin && !user?.role.length
        ? (<div className="development-in-content dark">
            No Permission
          </div>)
        : selectedInstance === 'stress_test' || selectedInstance === 'optimization'
        ? (<div className="development-in-content dark">
          In development
        </div>)
        : (<div className="graphs-container dark">
          {displayChart()}
        </div>)
      }
    </div>
  );
};

export default HeiknStockSlicedChart;