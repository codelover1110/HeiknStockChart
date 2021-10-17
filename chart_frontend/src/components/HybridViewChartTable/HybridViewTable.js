import React, { useCallback, useState, useEffect, useMemo } from "react";
import MultiRangeSlider from 'components/MultiRangeSlider/MultiRangeSlider'
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
import { filterTradesData } from 'api/Api'
import { currentDateString } from 'utils/helper'

const HybridViewTable = (props) => {
  const { symbol, macroStrategy, microStrategy, isLoaded } = props;
  const auth = useAuth();
  const history = useHistory();
  const [collapseOpen,] = React.useState(false)
  const [tradeStartDate, setTradeStartDate] = useState('2021-01-01')
  const [tradeEndDate, setTradeEndDate] = useState(currentDateString())
  
  const [pageAmount, setPageAmount] = useState(10)
  const [currentPage, setCurrentPage] = useState(1);
  const [wholeRows, setWholeRows] = useState(0);

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
    const get_trades = async (macroStrat, microStrat, tradeStartDate, tradeEndDate) => {
      const result = await filterTradesData(macroStrat, microStrat, tradeStartDate, tradeEndDate, currentPage, pageAmount);
      setDatatable({
        columns: hearder_columns,
        rows: result.trades_data
      })
      setWholeRows(result.page_total)
    }

    if (isLoaded) {
      get_trades(
        macroStrategy ? macroStrategy.value : '',
        microStrategy ? microStrategy.value : '', 
        tradeStartDate, tradeEndDate, currentPage, pageAmount)
    }
  }, [macroStrategy, microStrategy, hearder_columns, tradeStartDate, tradeEndDate, isLoaded])

  const handleSignout = () => {
    auth.signout()
    history.push('/login')
  }

  const selectDateRange = (startDate, endDate) => {
    setTradeStartDate(startDate)
    setTradeEndDate(endDate)
  }

  const loadPriceDetails = async () => {
    const result = await filterTradesData(macroStrategy ? macroStrategy.value : '',
    microStrategy ? microStrategy.value : '',
    tradeStartDate, tradeEndDate, currentPage, pageAmount);
    setDatatable({
      columns: hearder_columns,
      rows: result.trades_data
    })
    
    setWholeRows(result.page_total)
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
      <div className="col-sm-12 hunter-data-table-container">
        <div className="hunter-data-table-title">
          Trade Data Table
        </div>
        <div className="hunter-search-filter-area">
          <div className='date hunter-item-chart hunter-date-time-picker mb-3' id='datetimepicker1'>
            <MultiRangeSlider
              selectDateRange={selectDateRange}
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
        <Pagination>
          <Pagination.Item>{(currentPage-1)*10 + 1}</Pagination.Item>
          <Pagination.Item>{(currentPage) * 10}</Pagination.Item>
          <Pagination.Item> of </Pagination.Item>
          <Pagination.Item> { wholeRows } </Pagination.Item>
          <Pagination.Prev disabled={currentPage <= 0} onClick={() => { handlePrevClick() }}/>
          <Pagination.Next disabled={(currentPage + 1) >= wholeRows / 10} onClick={() => { handleNextClick() }}/>
        </Pagination>
      </div>
    </div>
  );
};

export default HybridViewTable;
