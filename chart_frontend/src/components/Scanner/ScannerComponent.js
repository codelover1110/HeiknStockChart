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
import { currentDateString } from 'utils/helper'

const ScannerComponent = () => {
  const auth = useAuth();
  const history = useHistory();
  const [collapseOpen,] = React.useState(false)
  const [exchange, setExchange] = React.useState(null)
  const [sector, setSector] = useState(null);
  const [industry, setIndustry] = useState(null);
  const [optionsExchange, setOptionsExchanges] = useState([])
  const [optionsSector, setOptionsSector] = useState([])
  const [optionsIndustry, setOptionsIndustry] = useState([])

  const hearder_columns = useMemo(() => {
    return [
    {
      label: 'Industry',
      field: 'industry',
      width: 200,
      attributes: {
        'aria-controls': 'DataTable',
        'aria-label': 'symbol',
      },
    },
    {
      label: 'Sector',
      field: 'sector',
      width: 200,
    },
    {
      label: 'Exchange',
      field: 'exchange',
      width: 200,
    },
    {
      label: 'Country',
      field: 'country',
      width: 200,
    },  
    {
      label: 'Market Cap',
      field: 'macket_cap',
      width: 200,
    },   
    {
      label: 'Cik Id',
      field: 'cik_id',
    },
  ]}, [])

  const [datatable, setDatatable] = React.useState({
    columns: hearder_columns,
    rows: [
    ],
  });

  useEffect(() => {
    
  }, [])

  const handleSignout = () => {
    auth.signout()
    history.push('/login')
  }

  const handleSectorChange = (e) => {
    setSector(e)
  }

  const handleExchangeChange = (e) => {
    setExchange(e)
  }
  
  const handleIndustryChange = (e) => {
    setIndustry(e)
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
          Scanner Table
        </div>
        <div className="hunter-search-filter-area">
          <div className="select-option">
            <Select
              value={exchange}
              onChange={handleExchangeChange}
              options={optionsExchange}
              placeholder="Exchange"
            />
          </div>
          <div className="select-option">
            <Select
              value={sector}
              onChange={handleSectorChange}
              options={optionsSector}
              placeholder="Sector"
            />
          </div>
          <div className="select-option">
            <Select
              value={industry}
              onChange={handleIndustryChange}
              options={optionsIndustry}
              placeholder="Industry"
            />
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

export default ScannerComponent;