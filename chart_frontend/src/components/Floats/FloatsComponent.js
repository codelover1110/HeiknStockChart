import React, { useState, useEffect, useMemo, useCallBack } from "react";
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
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import Pagination from 'react-bootstrap/Pagination'
import { useAuth } from 'contexts/authContext';
import { getFloatsDetails, getFloatsFilterOptions } from 'api/Api'
import "./FloatsComponent.css"

const ScannerComponent = () => {
  const auth = useAuth();
  const history = useHistory();
  const [collapseOpen,] = React.useState(false)
  const [exchange, setExchange] = React.useState(null)
  const [sector, setSector] = useState(null);
  const [industry, setIndustry] = useState(null);
  const [scannerData, setScannerData] = useState([])
  const [pageAmount, setPageAmount] = useState(10)
  const [currentPage, setCurrentPage] = useState(0);
  const [wholeRows, setWholeRows] = useState(0);
  const [optionsExchange, setOptionsExchanges] = useState([])
  const [optionsSector, setOptionsSector] = useState([])
  const [optionsIndustry, setOptionsIndustry] = useState([])

  const hearder_columns = useMemo(() => {
    return [
    {
      label: 'Industry',
      field: 'Industry',
      attributes: {
        'aria-controls': 'DataTable',
        'aria-label': 'symbol',
      },
    },
    {
      label: 'Symbol',
      field: 'Symbol',
    },
    {
      label: 'AssetType',
      field: 'AssetType',
    },
    {
      label: 'Name',
      field: 'Name',
    },  
    {
      label: 'SharesFloat',
      field: 'SharesFloat',
    },
    {
      label: 'ShortPercentFloat',
      field: 'ShortPercentFloat',
    },   
    {
      label: 'Description',
      field: 'Description',
    },
    {
      label: 'CIK',
      field: 'CIK',
    },
    {
      label: 'Exchange',
      field: 'Exchange',
    },
    {
      label: 'Currency',
      field: 'Currency',
    },
    {
      label: 'Country',
      field: 'Country',
    },
    {
      label: 'Sector',
      field: 'Sector',
    },
    {
      label: 'Industry',
      field: 'Industry',
    },
    {
      label: 'Address',
      field: 'Address',
    },
    {
      label: 'FiscalYearEnd',
      field: 'FiscalYearEnd',
    },
    {
      label: 'LatestQuarter',
      field: 'LatestQuarter',
    },
    {
      label: 'MarketCapitalization',
      field: 'MarketCapitalization',
    },
    {
      label: 'EBITDA',
      field: 'EBITDA',
    },
    {
      label: 'PERatio',
      field: 'PERatio',
    },
    {
      label: 'PEGRatio',
      field: 'PEGRatio',
    },
    {
      label: 'BookValue',
      field: 'BookValue',
    },
    {
      label: 'DividendPerShare',
      field: 'DividendPerShare',
    },
    {
      label: 'DividendYield',
      field: 'DividendYield',
    },
    {
      label: 'EPS',
      field: 'EPS',
    },
    {
      label: 'RevenuePerShareTTM',
      field: 'RevenuePerShareTTM',
    },
    {
      label: 'ProfitMargin',
      field: 'ProfitMargin',
    },
    {
      label: 'OperatingMarginTTM',
      field: 'OperatingMarginTTM',
    },
    {
      label: 'ReturnOnAssetsTTM',
      field: 'ReturnOnAssetsTTM',
    },
    {
      label: 'ReturnOnEquityTTM',
      field: 'ReturnOnEquityTTM',
    },
    {
      label: 'RevenueTTM',
      field: 'RevenueTTM',
    },
    {
      label: 'GrossProfitTTM',
      field: 'GrossProfitTTM',
    },
    {
      label: 'DilutedEPSTTM',
      field: 'DilutedEPSTTM',
    },
    {
      label: 'QuarterlyEarningsGrowthYOY',
      field: 'QuarterlyEarningsGrowthYOY',
    },
    {
      label: 'AnalystTargetPrice',
      field: 'AnalystTargetPrice',
    },
    {
      label: 'TrailingPE',
      field: 'TrailingPE',
    },
    {
      label: 'ForwardPE',
      field: 'ForwardPE',
    },
    {
      label: 'PriceToSalesRatioTTM',
      field: 'PriceToSalesRatioTTM',
    },
    {
      label: 'PriceToBookRatio',
      field: 'PriceToBookRatio',
    },
    {
      label: 'EVToRevenue',
      field: 'EVToRevenue',
    },
    {
      label: 'EVToEBITDA',
      field: 'EVToEBITDA',
    },
    {
      label: 'Beta',
      field: 'Beta',
    },
    {
      label: '52WeekHigh',
      field: '52WeekHigh',
    },
    {
      label: '50DayMovingAverage',
      field: '50DayMovingAverage',
    },
    {
      label: '200DayMovingAverage',
      field: '200DayMovingAverage',
    },
    {
      label: 'SharesOutstanding',
      field: 'SharesOutstanding',
    },
    {
      label: 'SharesShort',
      field: 'SharesShort',
    },
    {
      label: 'SharesShortPriorMonth',
      field: 'SharesShortPriorMonth',
    },
    {
      label: 'ShortRatio',
      field: 'ShortRatio',
    },
    {
      label: 'ShortPercentOutstanding',
      field: 'ShortPercentOutstanding',
    },
    {
      label: 'PercentInsiders',
      field: 'PercentInsiders',
    },
    {
      label: 'PercentInstitutions',
      field: 'PercentInstitutions',
    },
    {
      label: 'ForwardAnnualDividendRate',
      field: 'ForwardAnnualDividendRate',
    },
    {
      label: 'ForwardAnnualDividendYield',
      field: 'ForwardAnnualDividendYield',
    },
    {
      label: 'PayoutRatio',
      field: 'PayoutRatio',
    },
    {
      label: 'DividendDate',
      field: 'DividendDate',
    },
    {
      label: 'ExDividendDate',
      field: 'ExDividendDate',
    },
    {
      label: 'LastSplitFactor',
      field: 'LastSplitFactor',
    },
    {
      label: 'ShortPercentOutstanding',
      field: 'ShortPercentOutstanding',
    },
    {
      label: 'LastSplitDate',
      field: 'LastSplitDate',
    },
  ]}, [])

  const [datatable, setDatatable] = React.useState({
    columns: hearder_columns,
    rows: scannerData,
  });

  const loadFloatDetails = async (pageNum) => {
    console.log("pageNum", pageNum)
    const floatDetails = await getFloatsDetails(pageNum, pageAmount)

    if (floatDetails) {
      setWholeRows(floatDetails.page_total)
      setDatatable({
        columns: hearder_columns,
        rows: floatDetails.floats,
      })
    }
  }

  const loadFloatsFilterOption = async () => {
    const scannerOptions = await getFloatsFilterOptions()
    if (scannerOptions.success) {
      const exchanges = [{
        value: '',
        label: 'All'
      }]
      scannerOptions.result.exchanges.map(exchange => {
        if (exchange === '') {
          return null
        }
        exchanges.push({
          value: exchange,
          label: exchange
        })
      })

      const industries = [{
        value: '',
        label: 'All'
      }]

      scannerOptions.result.industry.map(industry => {
        if (industry !== '' && industry !== null) {
          industries.push({
            value: industry,
            label: industry
          })
        }
      })

      const sectors = [{
        value: '',
        label: 'All'
      }]
      scannerOptions.result.sector.forEach(sector => {
        if (sector !== '' && sector !== null) {
          sectors.push({
            value: sector,
            label: sector
          })
        }
      })

      setOptionsExchanges(exchanges)
      setOptionsIndustry(industries)
      setOptionsSector(sectors)
    }
  }

  useEffect(() => {
    loadFloatDetails(currentPage)
    loadFloatsFilterOption() 
  }, [])

  const handleSignout = () => {
    auth.signout()
    history.push('/login')
  }

  const handlePrevClick = () => {
    setCurrentPage(currentPage - 1)
    loadFloatDetails(currentPage - 1)
  }
  
  const handleNextClick = () => {
    setCurrentPage(currentPage + 1)
    loadFloatDetails(currentPage + 1)
  }

  const handleSectorChange = async (e) => {
    setSector(e)
    
    const floatDetails = await getFloatsDetails(currentPage, pageAmount, exchange ? exchange.value : '', industry ? industry.value : '', e.value)

    if (floatDetails) {
      setWholeRows(floatDetails.page_total)
      setDatatable({
        columns: hearder_columns,
        rows: floatDetails.floats,
      })
    }
  }

  const handleExchangeChange = async (e) => {
    setExchange(e)

    const floatDetails = await getFloatsDetails(currentPage, pageAmount, e.value, industry ? industry.value : '', sector ? sector.value : '')

    if (floatDetails) {
      setWholeRows(floatDetails.page_total)
      setDatatable({
        columns: hearder_columns,
        rows: floatDetails.floats,
      })
    }
  }
  
  const handleIndustryChange = async (e) => {
    setIndustry(e)

    const floatDetails = await getFloatsDetails(currentPage, pageAmount, exchange ? exchange.value : '', e.value, sector ? sector.value : '')
    setWholeRows(floatDetails.page_total)
    setDatatable({
      columns: hearder_columns,
      rows: floatDetails.floats,
    })
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
      <div className="col-sm-12 hunter-data-table-container scanner-page-container">
        <div className="hunter-data-table-title">
          Floats Table
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
        <MDBTable 
          hover
          small={true}
          maxHeight="500px"
          entriesOptions={[10, 25, 50, 100]}
          entries={10}
          pagesAmount={50}
          data={datatable}
          dark={true}
          noBottomColumns={true}
          small={true}
          scrollX={true}
          scrollY={true}
        >
          <MDBTableHead  className="watch-list-data-table-header">
            <tr>
              {hearder_columns.map((item) => (
                <th key={item.label} className={`hunter-custom-table-chart-th'`}>{item.label}</th>
              ))}
            </tr>
          </MDBTableHead>
          <MDBTableBody
              className={"financial-table-body-1"}
            >
            {datatable.rows.map((item) => (
              <tr key={`row-${item.Symbol}`}>
                {hearder_columns.map((column) => 
                  (
                    <td 
                      key={`${item.symbol}-${column.field}`}
                      className={`${column.field === 'Description' ? 'hunter-custom-table-description-td' : ''}`}
                    >
                      {item[column.field]}
                    </td>
                  )
                )}
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
        <Pagination>
          <Pagination.Item>{currentPage*10}</Pagination.Item>
          <Pagination.Item>{(currentPage) * 10 + 9}</Pagination.Item>
          <Pagination.Item> of </Pagination.Item>
          <Pagination.Item> { wholeRows } </Pagination.Item>
          <Pagination.Prev disabled={currentPage <= 0} onClick={() => { handlePrevClick() }}/>
          <Pagination.Next disabled={(currentPage + 1) >= wholeRows / 10} onClick={() => { handleNextClick() }}/>
        </Pagination>
      </div>
    </div>
  );
};

export default ScannerComponent;
