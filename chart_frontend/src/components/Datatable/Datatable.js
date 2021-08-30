import React, { useState, useEffect } from "react";
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
import { MDBDataTableV5 } from 'mdbreact';

const DataTable = () => {

  useEffect(() => {
    get_trades()
  }, [])

  const get_trades = () => {
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        'strategy': 'strategy'
      })
    };
    
    fetch(process.env.REACT_APP_BACKEND_URL + "/api/get_data_trades", requestOptions)
        .then(response => response.json())
        .then(data => {
            let trades_data = []
            data.trades_data.map((x) => {
              trades_data.push({
                'symbol': x.symbol,
                'strategy': x.strategy_name,
                'side': x.side,
                'quantity': x.quantity,
                'date': x.date.replace('T', ' '),
                'price': x.price
              })
            })
            setDatatable({
              columns: hearder_columns,
              rows: trades_data
            })
        })
	}

  const hearder_columns = [
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
      // sort: 'disabled',
      sort: 'price',
      width: 100,
    },
  ]

  const [datatable, setDatatable] = React.useState({
    columns: hearder_columns,
    rows: [
    ],
  });

  const [collapseOpen,] = React.useState(false)
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
                    <DropdownItem className="nav-item">Log out</DropdownItem>
                  </NavLink>
                </DropdownMenu>
              </UncontrolledDropdown>
              <li className="separator d-lg-none" />
            </Nav>
          </Collapse>    
      </nav>
      <div className="col-sm-12 hunter-data-table-container">
        <MDBDataTableV5 
          hover
          entriesOptions={[10, 20, 25]}
          entries={10}
          pagesAmount={4}
          data={datatable}
          searchTop searchBottom={false}
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

export default DataTable;
