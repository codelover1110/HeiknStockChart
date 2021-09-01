import React, { useState, useEffect } from "react";
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

const HeiknStockChart = (props) => {

  const auth = useAuth();
  const { selectedInstance, handleChartRedirect } = props
  const history = useHistory();
  const [symbol, setSymbol] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [isShowMicro, setIsShowMicro] = useState(true);
  const [symbolList, setSymbolList] = useState([])
  const [isGetSymbolList] = useState(false)
  const [collapseOpen,] = React.useState(false)
  const [chartColumn, setChartColumn] = useState({ value: 6, label: '6' })
  const [selectedViewType, setSelectedViewType] = useState({ value: 'charting', label: 'Charting' });
  const [microStrategy, setMicroStrategy] = useState({ value: 'heikfilter-2mins-trades', label: '2 mins' })
  const [strategy, setStrategy] = useState({ value: 'heikfilter', label: 'heikfilter' });
  
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
    { value: 'heikfilter-4hours-trades', label: '4 hours' },
  ])
  
  const [optionsStratgy, setOptionsStrategy] = useState([
    { value: 'heikfilter', label: 'heikfilter' },
  ])

  const [optionsIndicator, setOptionsIndicator] = useState([
    {
      value: 'VOLUME', label: 'VOLUME',
    },
    {
      value: 'RSI', label: 'RSI',
    },
    // {
    //   value: 'HEIK1', label: 'HEIK1',
    // },
    // {
    //   value: 'HEIK2', label: 'HEIK2',
    // }
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

  useEffect(() => {
    disableScroll.on();
    if(!isGetSymbolList) {
      get_tables();    
    }  
    return () => {
      disableScroll.off();
    }
  }, [])
  
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
      setStrategy({ value: 'heikfilter', label: 'heikfilter' });
      setOptionsStrategy([
        { value: 'heikfilter', label: 'heikfilter' },
      ])
      setIsShowMicro(true);
    }
    handleInstanceChange(selectedInstance)
    if(selectedInstance === 'live_trading') {
      get_tables();    
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
  }, [selectedInstance])

  const handleViewTypeChange = (value) => {
    setSelectedViewType(value)
    if (value.value === 'performance') {
      const locationState = {
        selectedInstance,
        viewType: value,
        initStrategy: strategy,
        initMicroStrategy: { value: 'heikfilter-2mins-trades', label: '2 mins' },
        initIndicators: indicators,
        initSymbol: symbol,
      }
      if (value) {
        handleChartRedirect(false)
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

  const handleStrategy = (e) => {
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
  
  const handleMicroStrategyChange = (e) => {
    if (e) {
      setMicroStrategy(e)
    }
  }
  
  const handleIndicatorsChange = (options) => {
    setIndicators(options);
  }

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
          setSymbol(temp_data[0])
				})
	}

  const handleChartsColumnChange = (option) => {
    if (option.value === 4 || option.value === 6) {
      setOptionsIndicator([
        {
          value: 'VOLUME', label: 'VOLUME',
        },
        {
          value: 'RSI', label: 'RSI',
        },
        // {
        //   value: 'HEIK1', label: 'HEIK1',
        // },
        // {
        //   value: 'HEIK2', label: 'HEIK2',
        // }
      ])
    } else {
      setOptionsIndicator([
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
        // {
        //   value: 'HEIK1', label: 'HEIK1',
        // },
        // {
        //   value: 'HEIK2', label: 'HEIK2',
        // }
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

  const handleSignout = () => {
    auth.signout()
    history.push('/login')
  }

  const displayChart = () => {
    return (
      <div className={`row ${calculateHeightStyle()}`}>
        <div className={`col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          {symbol && (
            < StockChart 
              selectedInstance={selectedInstance}
              selectedTradeDB='heikfilter-2mins-trades'
              chartPeriod='20D 2min'
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
            selectedInstance={selectedInstance}
            selectedTradeDB='heikfilter-12mins-trades'
            chartPeriod='20D 12min'
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
              selectedInstance={selectedInstance}
              selectedTradeDB='heikfilter-1hour-trades'
              chartPeriod='30D 1hour'
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
              selectedInstance={selectedInstance}
              selectedTradeDB='heikfilter-4hours-trades'
              chartPeriod='90D 4hour'
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
              selectedInstance={selectedInstance}
              selectedTradeDB='heikfilter-12hours-trades'
              chartPeriod='90D 12hour'
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
            selectedInstance={selectedInstance}
            selectedTradeDB='heikfilter-1day-trades'
            chartPeriod='1Y 1day'
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
        <Collapse navbar isOpen={collapseOpen}>
            <Nav className="ml-auto" navbar>
              <UncontrolledDropdown nav>
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
                  <NavLink tag="li">
                    <DropdownItem className="nav-item">Profile</DropdownItem>
                  </NavLink>
                  <NavLink tag="li">
                    <DropdownItem className="nav-item">Settings</DropdownItem>
                  </NavLink>
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
      {selectedInstance === 'stress_test' || selectedInstance === 'optimization' 
        ? (<div className="development-in-content dark">
          In development
        </div>)
        : (<div className="graphs-container dark">
          {(chartColumn.value === 1) && displayChart()}
          {(chartColumn.value === 2) && displayChart()}
          {(chartColumn.value === 4) && displayChart()}
          {(chartColumn.value === 6) && displayChart()}
        </div>)
      }
    </div>
  );
};

export default HeiknStockChart;