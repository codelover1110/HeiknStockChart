import React, { useCallback, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import Select from 'react-select'
import "react-datetime/css/react-datetime.css";
import OptimizationChart from "components/optimization-chart/OptimizationChart"
import disableScroll from 'disable-scroll';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import MultiRangeSlider from 'components/MultiRangeSlider/MultiRangeSlider'

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

const OptimizationChartPage = () => {
  
  const auth = useAuth();
  const history = useHistory();
  const [collapseOpen,] = React.useState(false)
  const [timeFrame, setTimeFrame] = useState({
    value: '2min',
    label: '2min',
  })
  
  const [optionsTimeFrame] = useState([
    {
      value: '2min',
      label: '2min',
    },
    {
      value: '12min',
      label: '12min',
    }
  ])

  const [selectedInstance] = useState({
      value: 'Optimization',
      label: 'Optimization'
  })
  
  const [multiSymbol, setMultiSymbol] = useState([])
  const [strategy, setStrategy] = useState(null)
  const [symbolList, setSymbolList] = useState([])
  const [microStrategy, setMicroStrategy] = useState(null)
  const [apiFlag, setApiFlag] = useState(false)
  const [tradeStartDate, setTradeStartDate] = useState('')
  const [tradeEndDate, setTradeEndDate] = useState('')
  const [strategyList, setStrategyList] = useState([]);
  
  const [optionsMicroStrategy, setOptionsMicroStrategy] = useState([])
  
  const [optionsStratgy, setOptionsStrategy] = useState([])

  const  handleTimeFrameChange = (e) => {
    setTimeFrame(e)
  }

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
          setStrategy( strategyOptions[0] )
          
          if (data.result.length) {
            data.result.forEach((item) => {
              if (item.macro) {
                const microStrategyOptions = item.micro.map(o => {
                  return {
                    value: o,
                    label: o,
                  }
                })
                
                setOptionsMicroStrategy( microStrategyOptions )
                setMicroStrategy( microStrategyOptions[0] )
                
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
          setMultiSymbol([temp_data[0]])
        })
    }
    
    if (!apiFlag && strategy) {
      get_tables();
      setApiFlag(true)
    }
  }, [apiFlag, setApiFlag, strategy])

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
            setMultiSymbol([symbolOptions[0]])
          }
        })
      }
    }
  }

  const handleMicroStrategyChange = (e) => {
    setMicroStrategy(e);
  }

  const selectDateRange = (startDate, endDate) => {
    setTradeStartDate(startDate)
    setTradeEndDate(endDate)
  }

  const handleSignout = () => {
    auth.signout()
    history.push('/login')
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
              value={timeFrame}
              onChange={handleTimeFrameChange}
              options={optionsTimeFrame}
              placeholder="Time Frame"
            />
          </div>
          <div className="select-multi-option hunter-multi-select-checkboxes">
            <ReactMultiSelectCheckboxes
              options={symbolList}
              value={multiSymbol}
              onChange={handlMultiSymbolChange}
            />
          </div>
          <div className="select-option">
            <Select
              value={strategy}
              onChange={handleStrategyChange}
              options={optionsStratgy}
              placeholder="Macro Strategy"
            />
          </div>
          <div className="select-option">
            <Select
              name="filters"
              placeholder="Micro Strategy"
              value={microStrategy}
              onChange={handleMicroStrategyChange}
              options={optionsMicroStrategy}
            />
          </div>
          <div className='date hunter-item-chart hunter-date-time-picker' id='datetimepicker1'>
            <MultiRangeSlider
              selectDateRange={selectDateRange}
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
      <div className="graphs-container dark">
        {microStrategy && (
          < OptimizationChart
            selectedInstance ={selectedInstance.value}
            microStrategy={microStrategy}
            multiSymbol={multiSymbol}
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

export default OptimizationChartPage;
