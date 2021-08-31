import React, { useState, useEffect, useMemo } from "react";
import Select from 'react-select'
import { Link } from "react-router-dom";
import "react-datetime/css/react-datetime.css";
import {
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  NavLink,
  Nav,
} from "reactstrap";
import { useHistory } from "react-router-dom";
import { MDBDataTableV5 } from 'mdbreact';
import { useAuth } from 'contexts/authContext';
import { getAllSymbols, filterTradesData } from 'api/Api'


const DataTable = () => {
  const auth = useAuth();
  const history = useHistory();
  const [collapseOpen,] = React.useState(false)
  const [symbol, setSymbol] = React.useState([])
  const [macroStrategy, setMacroStrategy] = useState({ value: 'heikfilter', label: 'heikfilter' });
  const [microStrategy, setMicrostrategy] = useState({ value: '2mins-trades', label: '2 mins' })
  const [tradeStartDate, setTradeStartDate] = useState('2021-01-01')
  const [tradeEndDate, setTradeEndDate] = useState('2021-08-31')

  const [optionsMacroStrategy,] = useState([
    { value: 'heikfilter', label: 'heikfilter' },
  ])

  const [optionsMicroStrategy,] = useState([
    { value: '2mins-trades', label: '2 mins' },
    { value: '2mins-4hours-trades', label: '2 mins>4 hours' },
    { value: '2mins-12mins-4hours-trades', label: '2 mins>12 mins>4 hours' },
    { value: '12mins-trades', label: '12 mins' },
    { value: '12mins-4hours-trades', label: '12 mins>4 hours' },
    { value: '4hours-trades', label: '4 hours' },
  ])
  
  const [optionsSymbol, setOptionsSymbol] = useState([])

  const hearder_columns = useMemo(() => {
    return [
    {
      label: 'Symbol',
      field: 'symbol',
      width: 150,
      attributes: {
        'aria-controls': 'DataTable',
        'aria-label': 'symbol',
      },
    },
    {
      label: 'Strategy',
      field: 'strategy',
      width: 200,
    },
    {
      label: 'Trade Date',
      field: 'date',
      sort: 'date',
      width: 150,
    },
    {
      label: 'Side',
      field: 'side',
      width: 270,
    },  
    {
      label: 'Quantity',
      field: 'quantity',
      sort: 'quantity',
      width: 100,
    },   
    {
      label: 'Price',
      field: 'price',
      sort: 'price',
      width: 100,
    },
  ]}, [])

  const [datatable, setDatatable] = React.useState({
    columns: hearder_columns,
    rows: [
    ],
  });

  useEffect(() => {
    const get_trades = async (symbol, macroStrat, microStrat, tradeStartDate, tradeEndDate) => {
      const trades_data = await filterTradesData(symbol, macroStrat, microStrat, tradeStartDate, tradeEndDate);
      setDatatable({
        columns: hearder_columns,
        rows: trades_data
      })
    }

    get_trades(symbol.value, macroStrategy.value, microStrategy.value, tradeStartDate, tradeEndDate)
  }, [symbol, macroStrategy, microStrategy, hearder_columns, tradeStartDate, tradeEndDate])

  useEffect(() => {
      const getSymbols = async () => {
      const res = await getAllSymbols()
      setOptionsSymbol(res)
    }
    getSymbols()
  }, [setOptionsSymbol])

  const handleSignout = () => {
    auth.signout()
    history.push('/login')
  }

  const handleSymbolChange = (e) => {
    setSymbol(e)
  }
  
  const handleMacroStrategy = (e) => {
    setMacroStrategy(e)
  }
  
  const handleMicroStrategy = (e) => {
    setMicrostrategy(e)
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
                    <DropdownItem className="nav-item" onClick={() => {handleSignout()}}>Log out</DropdownItem>
                  </NavLink>
                </DropdownMenu>
              </UncontrolledDropdown>
              <li className="separator d-lg-none" />
            </Nav>
          </Collapse>    
      </nav>
      <div className="col-sm-12 hunter-data-table-container">
        <div className="hunter-search-filter-area">
          <div className="select-option">
            <Select
              value={symbol}
              onChange={handleSymbolChange}
              options={optionsSymbol}
              placeholder="Symbol"
            />
          </div>
          <div className="select-option">
            <Select
              value={macroStrategy}
              onChange={handleMacroStrategy}
              options={optionsMacroStrategy}
              placeholder="Macro Strategy"
            />
          </div>
          <div className="select-option">
            <Select
              value={microStrategy}
              onChange={handleMicroStrategy}
              options={optionsMicroStrategy}
              placeholder="Micro Strategy"
            />
          </div>
          <div class='input-group date hunter-date-time-picker' id='datetimepicker1'>
          <span>Trade Start Time:</span>
            <input 
              type='date'
              class="form-control hunter-input"
              value={tradeStartDate}
              onChange={handleTradeStartDateChange}
            />
            <span class="input-group-addon">
            <span class="glyphicon glyphicon-calendar"></span>
            </span>
          </div>
          <div class='input-group date hunter-date-time-picker' id='datetimepicker2'>
            <span>Trade End Time:</span> 
            <input 
              type='date'
              class="form-control hunter-input"
              value={tradeEndDate}
              onChange={handleTradeEndDateChange}
            />
            <span class="input-group-addon">
            <span class="glyphicon glyphicon-calendar"></span>
            </span>
          </div>
        </div>
        <MDBDataTableV5 
          hover
          entriesOptions={[10]}
          entries={10}
          pagesAmount={4}
          data={datatable}
          // searchTop searchBottom={false}
          // bordered={true}
          dark={true}
          noBottomColumns={true}
          small={true}
          striped={true}
          // scrollY={true}
        />;
      </div>
    </div>
  );
};

export default DataTable;
