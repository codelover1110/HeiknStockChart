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
  Button,
} from "reactstrap";
import { useAuth } from 'contexts/authContext';
import disableScroll from 'disable-scroll';
import WatchListItem from 'components/WatchListItem/WatchListItem'
import {
  saveScannerAllViewData, getScannerAllViewData
} from 'api/Api';

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

  const defaultViewFields = [
    {
      label: "Indicators",
      value: "parent_value_2",
      children: [
          {
              label: "rsi",
              value: "child_value_2_1",
              default: true
          },
          {
              label: "rsi2",
              value: "child_value_2_2",
              default: true
          },
          {
              label: "rsi3",
              value: "child_value_2_3",
              default: false
          },
          {
              label: "heik",
              value: "child_value_2_4",
              default: false
          },
          {
              label: "heik2",
              value: "child_value_2_5",
              default: false
          }
      ],
      "default": true
    }
  ];

  const allViewDataDefault = [
    {
      "chart_number": 1,
      "symbols": [],
      "fields": defaultViewFields,
    },
    {
      "chart_number": 2,
      "symbols": [],
      "fields": defaultViewFields,
    },
    {
      "chart_number": 3,
      "symbols": [],
      "fields": defaultViewFields,
    },
    {
      "chart_number": 4,
      "symbols": [],
      "fields": defaultViewFields,
    },
    {
      "chart_number": 5,
      "symbols": [],
      "fields": defaultViewFields,
    },
    {
      "chart_number": 6,
      "symbols": [],
      "fields": defaultViewFields,
    }
  ];

  const [allViewData, setAllViewData] = useState(allViewDataDefault);

  const loadLayout = async () => {
    const result = await getScannerAllViewData();
    if (!result.success || result.data == undefined) return;

    const validViewDatas = result.data.filter(d => d.fields);
    const chartNumbers = validViewDatas.map(d => d.chart_number);
    const allViewDataFiltered = allViewData.filter(d => !chartNumbers.includes(d.chart_number));
    const newAllViewData = [...allViewDataFiltered, ...validViewDatas];

    setAllViewData(newAllViewData);
  }

  useEffect(() => {
    disableScroll.on();
    loadLayout()
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
          <WatchListItem 
            chart_number={1}
            chartColumn={chartColumn.value}
            allViewData={allViewData}
            setAllViewData={setAllViewData}
          />
        </div>
        <div className={`watch-list col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          <WatchListItem 
            chart_number={2}
            chartColumn={chartColumn.value}
            allViewData={allViewData}
            setAllViewData={setAllViewData}
          />
        </div>
        <div className={`watch-list col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          <WatchListItem
            chart_number={3}
            chartColumn={chartColumn.value}
            allViewData={allViewData}
            setAllViewData={setAllViewData}
          />
        </div>
        <div className={`watch-list col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          <WatchListItem 
            chart_number={4}
            chartColumn={chartColumn.value}
            allViewData={allViewData}
            setAllViewData={setAllViewData}
          />
        </div>
        <div className={`watch-list col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          <WatchListItem
            chart_number={5}
            chartColumn={chartColumn.value}
            allViewData={allViewData}
            setAllViewData={setAllViewData}
          />
        </div>
        <div className={`watch-list col-sm-12 col-md-${calculateGridColumn()} graph-container`} >
          <WatchListItem
            chart_number={6}
            chartColumn={chartColumn.value}
            allViewData={allViewData}
            setAllViewData={setAllViewData}
          />
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
            <div className="watch-list-nav-item">
              <Button
                size="sm"
                color="danger"
                onClick={async () => {
                  const result = await saveScannerAllViewData(allViewData);
                  if (result.success) alert('All fields saved successfully!!!');
                }}
              >
                save layout
              </Button>

              <Button
                size="sm"
                color="danger"
                onClick={() => {
                  window.location.reload();
                }}
              >
                load layout
              </Button>
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