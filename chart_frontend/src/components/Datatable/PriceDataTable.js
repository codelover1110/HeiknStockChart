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
import { getAllSymbols, filterPriceData } from 'api/Api'

const PriceDataTable = () => {
  const auth = useAuth();
  const history = useHistory();
  const [collapseOpen,] = React.useState(false)
  const [symbol, setSymbol] = React.useState({value: "GOOG", label: "GOOG"})
  const [timeFrame, setTimeFrame] = useState({ value: "1m", label: "1m"});
  const [tradeStartDate, setTradeStartDate] = useState('2021-01-01')
  const [tradeEndDate, setTradeEndDate] = useState('2021-08-31')
  const [optionsSymbol, setOptionsSymbol] = useState([])
  const [optionsTimeFrame] = useState([
    { value: "1m", label: "1m" },
    { value: "1h", label: "1h" },
    { value: "1d", label: "1d" }
  ])

  const hearder_columns = useMemo(() => {
    return [
    {
      label: 'O',
      field: 'o',
      width: 200,
      attributes: {
        'aria-controls': 'DataTable',
        'aria-label': 'symbol',
      },
    },
    {
      label: 'H',
      field: 'h',
      width: 200,
    },
    {
      label: 'C',
      field: 'c',
      width: 200,
    },
    {
      label: 'L',
      field: 'l',
      width: 200,
    },  
    {
      label: 'V',
      field: 'v',
      width: 200,
    },   
    {
      label: 'Date',
      field: 'date',
      sort: 'price',
    },
  ]}, [])

  const [datatable, setDatatable] = React.useState({
    columns: hearder_columns,
    rows: [
    ],
  });

  useEffect(() => {
    const getPriceTrades = async (symbol, timeFrame, tradeStartDate, tradeEndDate) => {
      const trades_data = await filterPriceData(symbol, timeFrame, tradeStartDate, tradeEndDate);
      setDatatable({
        columns: hearder_columns,
        rows: trades_data
      })
    }

    getPriceTrades(symbol.value, timeFrame.value, tradeStartDate, tradeEndDate)

  }, [symbol, timeFrame, hearder_columns, tradeStartDate, tradeEndDate])

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
  
  const handleTimeFrameChange = (e) => {
    setTimeFrame(e)
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
            Violette AM - Client Portal
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
                  {/* <NavLink tag="li">
                    <DropdownItem className="nav-item">Profile</DropdownItem>
                  </NavLink>
                  <NavLink tag="li">
                    <DropdownItem className="nav-item">Settings</DropdownItem>
                  </NavLink> */}
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
        <div className="hunter-data-table-title">
          Price Data Table
        </div>
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
              value={timeFrame}
              onChange={handleTimeFrameChange}
              options={optionsTimeFrame}
              placeholder="Time Frame"
            />
          </div>
          <div className='input-group date hunter-date-time-picker' id='datetimepicker1'>
            <span>Trade Start Time:</span>
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
          <div className='input-group date hunter-date-time-picker' id='datetimepicker2'>
            <span>Trade End Time:</span> 
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
        <MDBDataTableV5 
          hover
          maxHeight="500px"
          entriesOptions={[10, 25, 50, 100]}
          entries={10}
          pagesAmount={4}
          data={datatable}
          // searchTop searchBottom={false}
          // bordered={true}
          dark={true}
          noBottomColumns={true}
          small={true}
          striped={true}
          scrollY={true}
        />;
      </div>
    </div>
  );
};

export default PriceDataTable;
