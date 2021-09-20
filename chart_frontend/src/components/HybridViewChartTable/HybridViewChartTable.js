import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from 'react-select'
import "react-datetime/css/react-datetime.css";
import StockChart from "../stock-chart/StockChart"
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
import HybridViewTable from "./HybridViewTable"

const HybridViewChartTable = (props) => {

  const auth = useAuth();
  const { selectedInstance } = props
  const history = useHistory();
  const [symbol, setSymbol] = useState({ value: 'MSFT', label: 'MSFT' });
  const [indicators, setIndicators] = useState([]);
  const [isShowMicro, setIsShowMicro] = useState(true);
  const [symbolList, setSymbolList] = useState([])
  const [isGetSymbolList] = useState(false)
  const [collapseOpen,] = React.useState(false)
  const [selectedViewType, setSelectedViewType] = useState({ value: 'charting', label: 'Charting' });
  const [microStrategy, setMicroStrategy] = useState({ value: '2m', label: '2m' });
  const [strategy, setStrategy] = useState({ value: 'heikfilter', label: 'heikfilter' });
  const [strategyList, setStrategyList] = useState([]);
  const [user] = useState(JSON.parse(localStorage.getItem('user-info')));
  const [extendMarketTime, setExtendMarketTime] = useState(
    {
      value: 'markettime', label: 'market time',
    }
  );
  
  const [optionsViewTypes, setOptionsViewTypes] = useState([
    { value: 'charting', label: 'Charting' },
    { value: 'performance', label: 'Performance' },
  ])

  const [optionsMicroStrategy, setOptionsMicroStrategy] = useState([])
  
  const [optionsStratgy, setOptionsStrategy] = useState([])

  const [optionsIndicator, setOptionsIndicator] = useState([
    {
      value: 'VOLUME', label: 'VOLUME',
    },
    {
      value: 'RSI', label: 'RSI',
    },
    {
      value: 'RSI2', label: 'RSI2',
    },
    {
      value: 'RSI3', label: 'RSI3',
    },
    {
      value: 'HEIK1', label: 'HEIK1',
    },
    {
      value: 'HEIK2', label: 'HEIK2',
    }
  ]);
  
  const [optionsMarketTime, setOptionsMarketTime] = useState([
    {
      value: 'markettime', label: 'market time',
    },
    {
      value: 'extend_markettime', label: 'extend market time',
    }
  ]);

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
              }
            })
          }
        })   
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
          setSymbol(temp_data[0])
        })
    },
    [],
  )

  useEffect(() => {
    disableScroll.on();
    if (user.is_admin || user?.role.length) {
      if(!isGetSymbolList) {
        getStrategyList();
      }  
    }
    return () => {
      disableScroll.off();
    }
  }, [getStrategyList, isGetSymbolList, user])
  
  useEffect(() => {
    const handleInstanceChange = (value) => {
      if (value === 'live_trading') {
        setIsShowMicro(false);
        setStrategy({ value: 'no_strategy', label: 'No Strategy' });
        setOptionsStrategy([
          { value: 'no_strategy', label: 'No Srategy' },
        ])
        return
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
        { value: 'charting', label: 'Charting' },
        { value: 'performance', label: 'Performance' },
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
        initMicroStrategy: { value: '2m', label: '2m' },
        initIndicators: indicators,
        initSymbol: symbol,
      }
      if (value) {
        history.push({
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

            setMicroStrategy(microStrategyOptions[0])
            
            const symbolOptions = item.symbols.map(o => {
              return {
                value: o,
                label: o,
              }
            })
            setSymbolList(symbolOptions)
            setSymbol({value: 'MSFT', label: 'MSFT'})
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

  const calculateGridColumn = () => {
    return 12
  }

  const handleSignout = () => {
    auth.signout()
    history.push('/login')
  }

  const displayChart = () => {
    return (
      <div className={`row full-height`}>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {microStrategy && symbol && (
            < StockChart 
              extendMarketTime={extendMarketTime.value}
              selectedInstance={selectedInstance}
              selectedTradeDB='heikfilter-2mins-trades'
              chartPeriod='20D 2min'
              symbol={symbol.value}
              indicators={indicators}
              strategy={strategy}
              isHomePage={true}
              chartColumn={1}
              microStrategy={microStrategy.value}
              startDate={null}
              endDate={null}
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
            chartColumn={1}
            microStrategy={microStrategy.value}
            startDate={null}
            endDate={null}
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
              chartColumn={1}
              microStrategy={microStrategy.value}
              startDate={null}
              endDate={null}
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
              chartColumn={1}
              microStrategy={microStrategy.value}
              startDate={null}
              endDate={null}
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
              chartColumn={1}
              microStrategy={microStrategy.value}
              startDate={null}
              endDate={null}
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
            chartColumn={1}
            microStrategy={microStrategy.value}
            startDate={null}
            endDate={null}
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
        <div className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link to={"/chart"} className="nav-link"></Link>
          </li>
          {/* <div className="select-option">
            <Select
              value={extendMarketTime}
              onChange={handleMarketTimeChange}
              options={optionsMarketTime}
              placeholder="Market Time"
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
        </div>
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
      <div className="display-flex-j-c">
        <div className="graphs-container half-width dark">
          {displayChart()}
        </div>
        <div className="half-width dark">
          <HybridViewTable
            symbol={symbol}
            macroStrategy={strategy}
            microStrategy={microStrategy}
          />
        </div>
      </div>
    </div>
  );
};

export default HybridViewChartTable;