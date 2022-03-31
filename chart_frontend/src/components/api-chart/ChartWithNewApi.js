import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from 'react-select'
import "react-datetime/css/react-datetime.css";
import TradeChart from "./TradeChart"
import { useHistory } from "react-router-dom";
import {
  Button,
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
import { getStrategyListReq, getTablesReq, getSymbolsByMicroStrategy, getIndicators } from 'api/Api'

const ChartWithNewApi = (props) => {
  const auth = useAuth();
  const { selectedInstance, handleChartRedirect } = props
  const history = useHistory();
  const [symbol, setSymbol] = useState(null);//{ value: 'MSFT', label: 'MSFT' }
  const [indicators, setIndicators] = useState([]);
  const [isShowMicro, setIsShowMicro] = useState(true);
  const [symbolList, setSymbolList] = useState([])
  const [collapseOpen,] = React.useState(false)
  const [chartColumn, setChartColumn] = useState({ value: 6, label: '6' })
  const [assetClass, setAssetClass] = useState({ value: 'stock', label: 'stock' })
  const [selectedViewType, setSelectedViewType] = useState({ value: 'chart_with_new_api', label: 'Chart With New API7' });
  const [microStrategy, setMicroStrategy] = useState(null);
  const [strategy, setStrategy] = useState(null);//{ value: 'heikfilter', label: 'heikfilter' }
  const [strategyList, setStrategyList] = useState([]);
  const [user] = useState(JSON.parse(localStorage.getItem('user-info')));
  const [countShowClicked, setCountShowClicked] = useState(0)
  const [extendMarketTime, setExtendMarketTime] = useState(
    {
      value: 'markettime', label: 'market time',
    }
  );


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

  const [optionsMicroStrategy, setOptionsMicroStrategy] = useState([])

  const [optionsStratgy, setOptionsStrategy] = useState([])

  const [optionsViewTypes, setOptionsViewTypes] = useState([
    { value: 'charting', label: 'Charting' },
    { value: 'performance', label: 'Performance' },
    { value: 'sliced_charting', label: 'Sliced Chatting'},
    { value: 'chart_with_new_api', label: 'Chart With New API6' },
  ])

  const [optionsIndicator, setOptionsIndicator] = useState([
    {
      value: 'volume', label: 'VOLUME',
    },
    {
      value: 'rsi1', label: 'RSI1',
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
      value: 'heik2', label: 'HEIK2',
    },
    {
      value: 'tsr', label: 'TSR',
    },
    {
      value: 'esdbands', label: 'EsdBands',
    }
  ]);


  const getStrategyList = useCallback(
    async () => {
      const strategyListRes = await getStrategyListReq();
      console.log('strategyListRes', strategyListRes)
      if (strategyListRes.success) {
        const data = strategyListRes.data;
        setStrategyList(data.result);
        const strategyOptions = data.result.map((o => {
          return {
            value: o.macro,
            label: o.macro,
          }
        }))
        setOptionsStrategy(strategyOptions);
        setStrategy(strategyOptions[0]);
        if (data.result.length) {
          let flag = true
          let item = data.result[0]
          if (flag) {
            const microStrategyOptions = item.micro.map(o => {
              return {
                value: o,
                label: o,
              }
            })

            setMicroStrategy(microStrategyOptions[0])

            const result = await getSymbolsByMicroStrategy(strategyOptions[0].value, microStrategyOptions[0].value)
            if (result.success) {
              const symbolOptions = result.data.map(o => {
                return {
                  value: o,
                  label: o,
                }
              })

              setSymbolList(symbolOptions)
              setSymbol(symbolOptions[0])
            }
          }
          flag = false
        }
      }
    },
    [],
  )

  const get_tables = useCallback(
    async (strategy) => {
      const tablesRes = await getTablesReq(strategy);
      if (tablesRes.success) {
        const data = tablesRes.data;
        let temp_data = []
        data.tables.map((x) => {
          temp_data.push({
            value: x,
            label: x
          });
          return null
        })
        setSymbolList(temp_data)
      }
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
    }
  }, [])

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
        { value: 'charting', label: 'Charting' },
        { value: 'performance', label: 'Performance' },
        { value: 'sliced_charting', label: 'Sliced Chatting'},
        { value: 'chart_with_new_api', label: 'Chart With New API5' },
      ])
    }
  }, [selectedInstance, getStrategyList, get_tables, user.is_admin, user.role?.length])

  const handleIndicatorsChange = (options) => {
    setIndicators(options);
  }

  const handleChartsColumnChange = (option) => {
    setIndicators([])
    setChartColumn(option)
  }

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
    } else if (value.value === 'sliced_charting') {
      handleChartRedirect(2)
    } else if (value.value == 'chart_with_new_api') {
      handleChartRedirect(3)
    } else if (value.value === 'charting') {
      handleChartRedirect(0)
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

  const handleMicroStrategyChange = async (e) => {
    if (e) {
      setMicroStrategy(e)
      const result = await getSymbolsByMicroStrategy(strategy.value, e.value)
      if (result.success) {
        const symbolOptions = result.data.map(o => {
          return {
            value: o,
            label: o,
          }
        })

        setSymbolList(symbolOptions)
        setSymbol(symbolOptions[0])
      }
    }
  }

  const handleSignout = () => {
    auth.signout()
    history.push('/login')
  }


  const displayChart = () => {
    return (
      <div className={'graph-grid graph-grid-' + chartColumn.value}>
        {[...Array(chartColumn.value).keys()].map(() =>
          <div className={`graph-container`} >
            {microStrategy && <TradeChart
              chartColumn={chartColumn}
              chartIndicators={indicators}
              showAllClicked={countShowClicked}
              microStrategy={microStrategy.value}
              strategy={strategy}
              selectedInstance={selectedInstance} />}
          </div>
        )}
      </div>
    )
  }

  const handleShowAll = () => {
    setCountShowClicked(countShowClicked+1)
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
                value={chartColumn}
                onChange={handleChartsColumnChange}
                options={optionsColumn}
                placeholder="Columns"
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
              <div className="">
                <Button variant={'contained'} onClick={handleShowAll}>Show</Button>
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

export default ChartWithNewApi;