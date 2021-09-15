import React, { useCallback, useState, useEffect, useMemo } from "react";
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
import { filterTradesData } from 'api/Api'
import { currentDateString } from 'utils/helper'

const HybridViewTable = (props) => {
  const { symbol, macroStrategy, microStrategy } = props;
  const auth = useAuth();
  const history = useHistory();
  const [collapseOpen,] = React.useState(false)
  const [tradeStartDate, setTradeStartDate] = useState('2021-01-01')
  const [tradeEndDate, setTradeEndDate] = useState(currentDateString())

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

    get_trades(
      symbol ? symbol.value : '',
      macroStrategy ? macroStrategy.value : '',
      microStrategy ? microStrategy.value : '', 
      tradeStartDate, tradeEndDate)
  }, [symbol, macroStrategy, microStrategy, hearder_columns, tradeStartDate, tradeEndDate])

  const handleSignout = () => {
    auth.signout()
    history.push('/login')
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
          Trade Data Table
        </div>
        <div className="hunter-search-filter-area">
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

export default HybridViewTable;
