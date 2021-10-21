import React, { useCallback, useState, useEffect, useMemo } from "react";
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
import Pagination from 'react-bootstrap/Pagination'
import { useAuth } from 'contexts/authContext';
import { getAllSymbols, filterTradesData } from 'api/Api'
import { currentDateString } from 'utils/helper'
import MultiRangeSlider from 'components/MultiRangeSlider/MultiRangeSlider'
import { useDatatable, useDatatableLoading } from "contexts/DatatableContext";
import Spinner from 'components/Spinner'

const TradeDataTable = () => {
  const auth = useAuth();
  const history = useHistory();
  const [collapseOpen,] = React.useState(false)
  const [symbol, setSymbol] = React.useState([])
  const [macroStrategy, setMacroStrategy] = useState();
  const [microStrategy, setMicroStrategy] = useState()
  const [tradeStartDate, setTradeStartDate] = useState('2021-01-01')
  const [tradeEndDate, setTradeEndDate] = useState(currentDateString())
  const [strategyList, setStrategyList] = useState([]);

  const [pageAmount, setPageAmount] = useState(10)
  const [currentPage, setCurrentPage] = useState(1);
  const [wholeRows, setWholeRows] = useState(0);

  const [optionsStrategy, setOptionsStrategy] = useState([])
  const [optionsMacroStrategy, setOptionsMacroStrategy] = useState([])

  const [optionsMicroStrategy, setOptionsMicroStrategy] = useState([])

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

  const [datatable, setDatatable] = useDatatable({
    columns: hearder_columns,
    rows: [
    ],
  });

  const [isLoadingData, setLoadingData] = useDatatableLoading()

  const wrapSetDatatable = (data) => {
    setDatatable(data)
  }

  const getStrategyList = useCallback(
    () => {
      fetch(process.env.REACT_APP_BACKEND_URL + "/api/get_strategy_list")
        .then(response => response.json())
        .then(data => {
          const strategyOptions = data.result.map((o => {
            return {
              value: o.macro,
              label: o.macro,
            }
          }))
          setOptionsStrategy(strategyOptions);
          if (data.result.length) {
            setStrategyList(data.result);
            data.result.forEach((item) => {
              if (item.macro === 'heikfilter') {
                const microStrategyOptions = item.micro.map(o => {
                  return {
                    value: o,
                    label: o,
                  }
                })
                setOptionsMicroStrategy( microStrategyOptions )
                setMicroStrategy(microStrategyOptions[0])

                const symbolOptions = item.symbols.map(o => {
                  return {
                    value: o,
                    label: o,
                  }
                })
                setOptionsSymbol(symbolOptions)
                // setSymbol(symbolOptions[0])
              }
            })
          }
        })
    },
    [],
  )

  useEffect(() => {
    getStrategyList()
  }, [getStrategyList])

  useEffect(() => {
    setLoadingData(true)
    const get_trades = async (macroStrat, microStrat, tradeStartDate, tradeEndDate, currentPage, pageAmount) => {
      const result = await filterTradesData(macroStrat, microStrat, tradeStartDate, tradeEndDate, currentPage, pageAmount);
      wrapSetDatatable({
        columns: hearder_columns,
        rows: result.trades_data
      })
      setWholeRows(result.page_total)
      setLoadingData(false)
    }

    get_trades(
      macroStrategy ? macroStrategy.value : '',
      microStrategy ? microStrategy.value : '',
      tradeStartDate, tradeEndDate, currentPage, pageAmount)
  }, [macroStrategy, microStrategy, hearder_columns, tradeStartDate, tradeEndDate])

  useEffect(() => {
      setLoadingData(true)
      const getSymbols = async () => {
      const res = await getAllSymbols()
      setOptionsSymbol(res)
      setLoadingData(false)
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

            setMicroStrategy(microStrategyOptions[0])

            const symbolOptions = item.symbols.map(o => {
              return {
                value: o,
                label: o,
              }
            })
            setOptionsSymbol(symbolOptions)
            // setSymbol(symbolOptions[0])
            // setSymbol({value: 'MSFT', label: 'MSFT'})
          }
        })
      }
      setMacroStrategy(e)
    }
  }

  const handleMicroStrategy = (e) => {
    setMicroStrategy(e)
  }

  const selectDateRange = (startDate, endDate) => {
    setTradeStartDate(startDate)
    setTradeEndDate(endDate)
  }

  const loadPriceDetails = async () => {
    setLoadingData(true)
    const result = await filterTradesData(macroStrategy ? macroStrategy.value : '',
    microStrategy ? microStrategy.value : '',
    tradeStartDate, tradeEndDate, currentPage, pageAmount);
    wrapSetDatatable({
      columns: hearder_columns,
      rows: result.trades_data
    })

    setWholeRows(result.page_total)
    setLoadingData(false)
  }

  const handlePrevClick = () => {
    setCurrentPage(currentPage - 1)
    loadPriceDetails(currentPage - 1)
  }

  const handleNextClick = () => {
    setCurrentPage(currentPage + 1)
    loadPriceDetails(currentPage + 1)
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
              options={optionsStrategy}
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
          <div className='input-group date hunter-date-time-picker' id='datetimepicker1'>
            <MultiRangeSlider
              selectDateRange={selectDateRange}
            />
          </div>
        </div>

        {isLoadingData && <div className="hunter-spinner-area"><span className="mr-30">Loading ...</span>    <Spinner>Loading</Spinner></div>}
        {!isLoadingData && <>
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
          <Pagination>
            <Pagination.Item>{(currentPage-1)*10 + 1}</Pagination.Item>
            <Pagination.Item>{(currentPage) * 10}</Pagination.Item>
            <Pagination.Item> of </Pagination.Item>
            <Pagination.Item> { wholeRows } </Pagination.Item>
            <Pagination.Prev disabled={currentPage <= 0} onClick={() => { handlePrevClick() }}/>
            <Pagination.Next disabled={(currentPage + 1) >= wholeRows / 10} onClick={() => { handleNextClick() }}/>
          </Pagination>
        </>}
      </div>
    </div>
  );
};

export default TradeDataTable;
