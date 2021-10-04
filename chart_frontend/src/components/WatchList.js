import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from 'react-select'
import "react-datetime/css/react-datetime.css";
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
import WatchListItem from 'components/WatchListItem/WatchListItem'

const WatchList = (props) => {

  const auth = useAuth();
  const { selectedInstance } = props
  const history = useHistory();
  const [collapseOpen,] = React.useState(false)
  const [chartColumn, setChartColumn] = useState({ value: 6, label: '6' })
  const [user] = useState(JSON.parse(localStorage.getItem('user-info')));
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
    return () => {
      disableScroll.off();
    }
  }, [])
  
  const handleChartsColumnChange = (option) => {
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
        <div className={`watch-list col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          <WatchListItem chart_number={1} chartColumn={chartColumn.value}/>
        </div>
        <div className={`watch-list col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          <WatchListItem chart_number={2} chartColumn={chartColumn.value}/>
        </div>
        <div className={`watch-list col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          <WatchListItem chart_number={3} chartColumn={chartColumn.value}/>
        </div>
        <div className={`watch-list col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          <WatchListItem chart_number={4} chartColumn={chartColumn.value}/>
        </div>
        <div className={`watch-list col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          <WatchListItem chart_number={5} chartColumn={chartColumn.value}/>
        </div>
        <div className={`watch-list col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          <WatchListItem chart_number={6} chartColumn={chartColumn.value}/>
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

export default WatchList;