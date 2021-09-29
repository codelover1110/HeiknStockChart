import React, { useEffect, useState } from 'react'
import { Button } from 'reactstrap'
import Modal from 'react-bootstrap/Modal'
import BarChart from 'components/FinancialDashboard/SmallBarChart';
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import WatchListEditColumnWidget from 'components/WatchListEditColumnWidget/WatchListEditColumnWidget'
import './WatchListItem.css'
import { set } from 'lodash';
import Select from 'react-select'
import {
  getIncomeStatement,
} from 'api/Api';

const WatchListItem = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ws, setWs] = useState(null);
  const [isOpenedEditColumnWidget, setIsOpenedEditColumnWidget] = useState(false)
  const [selectedAggregationType, setSelectedAggregationType] = useState('QA');
  const [rowItems, setRowItems] = useState([])
  const [isUpdatedRows, setIsUpdatedRows] = useState(false)
  const [isUpdatedCols, setIsUpdatedCols] = useState(false)
  const [columnItems, setColumnItems] = useState([
    'symbol', 'chart', 'o', 'h', 'l', 'c', 'n', 'v'
  ])
  const [isInited, setIsInited] = useState(false)
  const [isUpdatedWatchList, setIsUpdatedWatchList] = useState(false);
  
  const [columns, setColumns] = useState([
    {
      value: 'symbol',
      label: 'symbol',
      width: 100,
    },
    {
      value: 'chart',
      label: 'chart',
      width: 100,
    },
    {
      value: 'o',
      label: 'o',
      width: 100,
    },
    {
      value: 'h',
      label: 'h',
      width: 100,
    },
    {
      value: 'l',
      label: 'l',
      width: 100,
    },
    {
      value: 'c',
      label: 'c',
      width: 100,
    },
    {
      value: 'n',
      label: 'n',
      width: 100,
    },
    {
      value: 'v',
      label: 'v',
      width: 100,
    }
  ]);

  const [timeFrames, setTimeFrames] = useState([])
  const [timeFrameOptions, setTimeFrameOptions] = useState([
    {
      value: '1d',
      label: '1d'
    },
    {
      value: '3d',
      label: '3d'
    },
  ])
  
  const [watchListData, setWatchListData] = useState([])
  const [watchListInitData, setWatchListInitData] = useState([])

  const handleColumnsChange = () => {
    setIsOpenedEditColumnWidget(true)
  }

  const handleModalClose = () => {
    setIsOpenedEditColumnWidget(false)
  }

  useEffect(() => {
    const loadRows = async () => {
      const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          'strategy': ''
        })
      };
      let rows = []
      await fetch(process.env.REACT_APP_BACKEND_URL + "/api/tables", requestOptions)
      .then(response => response.json())
      .then(data => {
        rows = data.tables
        setRowItems(data.tables)
        setIsUpdatedRows(true)
        
        let realData = [];
        rows.forEach((row) => {
          const object = {}
          columns.forEach((col) => {
            if (col.value === 'chart') {
              object[col.value] = 'fetching ...'
            } else {
              object[col.value] = '0.00'
            }
          })
          object.symbol = row
          realData.push(object);
        })
        setWatchListInitData(realData)
        setIsInited(true);  
      })
    }
    if (!isInited) {
      setIsLoading(1);
      getIncome();
      loadRows();
    }
    
    if (!ws) {
      const socket = new WebSocket(process.env.REACT_APP_SOCKET_URL);
      setWs(socket)
      
      socket.onopen = () => {
        console.log('Opened Connection!')
      };
    
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        setWatchListData(msg)
        setIsUpdatedWatchList(true)
      };
    
      socket.onclose = () => {
        console.log('Closed Connection!')
      };

    }
  }, [])

  useEffect(() => {
    const keys = Object.keys(columnItems)
    if(keys.length) {
      const columns = [
        {
          value: 'symbol',
          label: 'symbol',
          width: 100,
        },
      ]
      columnItems.forEach((value) => {
        if (value !== 'symbol') {
          columns.push({
            value: value,
            label: value,
            width: 100,
          })
        }
      })
      setColumns(columns)
    }

  }, [isUpdatedCols])

  useEffect(() => {
    let initData = watchListInitData
    let newData = []
    let isValid = true
    initData.forEach((init) => {
      watchListData.forEach(o => {
        if (o.symbol === init.symbol) {
          const newObject = {
            symbol: o.symbol,
            chart: <div className="container custom-container chart-area hunter-scanner-page-chart-area">
              <div className="row justify-content-center">
                {chartData ? (
                  <BarChart
                    data={chartData[0]}
                    chartData={chartData}
                    globalAggregationType={selectedAggregationType}
                  />
                ) : isLoading === 2 ? (
                  <div className="no-data">No data</div>
                ) : (
                  <div className="no-data">Fetching...</div>
                )}
              </div>
            </div>,
            ...o.data,
          }
          newData.push(newObject)
          isValid = false
        }
      })
      if (isValid) {
        newData.push(init)
      }
      isValid = true
    })
    setWatchListInitData(newData)
    setIsUpdatedWatchList(false)
  }, [isUpdatedWatchList])

  useEffect(() => {
    if (ws) {
      // ws.send("set_time_frame", '1d, 3d')
    }
  }, [timeFrames])

  const handleColumnSet = (columns) => {
    let cols = []
    Object.keys(columns).forEach((key) => {
      columns[key].children.forEach((col) => {
        cols.push(col.label)
      })
    })
    setIsUpdatedCols(!isUpdatedCols)
    setColumnItems(cols)
  }

  const isEven = (str) => {
    const dbl = parseFloat(str);
    const number = dbl.toFixed(0);
    return number % 2;
  }

  const handleTimeFrameChange = (e) => {
    setTimeFrames(e)
  }

  const getIncome = async () => {
    const res = await getIncomeStatement('AAPL');
    let revenus = {
      label: 'Revenue',
      group: 0,
      color: 'rgb(25, 185, 154)',
      dataPoints: [],
    };
    let costOfRevenue = {
      label: 'Cost of Revenue',
      group: 0,
      color: 'rgb(8, 64, 129)',
      dataPoints: [],
    };
    let grossProfit = {
      label: 'Gross Profit',
      group: 0,
      color: 'rgb(127, 0, 0)',
      dataPoints: [],
    };
    let EBITDAMargin = {
      label: 'Ebit',
      group: 0,
      color: 'rgb(89, 201, 108)',
      dataPoints: [],
    };
    let NetIncome = {
      label: 'Net Income',
      group: 0,
      color: 'rgb(75, 87, 74)',
      dataPoints: [],
    };
    let earningsPerBasicShare = {
      label: 'Earnings per Basic Share',
      group: 0,
      color: 'rgb(226, 71, 130)',
      dataPoints: [],
    };
    if (res && res.results) {
      res.results.map((item) => {
        revenus.dataPoints.push({
          calendarDate: item.calendarDate,
          period: item.period,
          value: item.revenues,
        });
        costOfRevenue.dataPoints.push({
          calendarDate: item.calendarDate,
          period: item.period,
          value: item.costOfRevenue,
        });
        grossProfit.dataPoints.push({
          calendarDate: item.calendarDate,
          period: item.period,
          value: item.grossProfit,
        });
        EBITDAMargin.dataPoints.push({
          calendarDate: item.calendarDate,
          period: item.period,
          value: item.EBITDAMargin,
        });
        NetIncome.dataPoints.push({
          calendarDate: item.calendarDate,
          period: item.period,
          value: item.netIncome,
        });
        earningsPerBasicShare.dataPoints.push({
          calendarDate: item.calendarDate,
          period: item.period,
          value: item.earningsPerBasicShare,
        });
      });
    }
    setChartData([
      sortDataPointsByDate(revenus),
      sortDataPointsByDate(costOfRevenue),
      sortDataPointsByDate(grossProfit),
      sortDataPointsByDate(EBITDAMargin),
      sortDataPointsByDate(NetIncome),
      sortDataPointsByDate(earningsPerBasicShare),
    ]);
    console.log("updated status 2..........................................")
    setIsLoading(2);
  };

  const sortDataPointsByDate = (data) => {
    let sortedData = { ...data };
    if (sortedData.dataPoints.length > 0) {
      sortedData.dataPoints.sort(function (a, b) {
        let valueA = a['calendarDate'];
        let valueB = b['calendarDate'];
        if (typeof a['calendarDate'] != 'string') {
          valueA = valueA.toString();
        }
        if (typeof b['calendarDate'] != 'string') {
          valueB = valueB.toString();
        }
        return valueA.localeCompare(valueB);
      });
    }
    return sortedData;
  };

  return (
    <div className="watch-list-item-container">
      <Modal show={isOpenedEditColumnWidget} className="hunter-widget-modal" onHide={() => handleModalClose()}>
        <WatchListEditColumnWidget
          handleModalClose={handleModalClose}
          setColumns={handleColumnSet}
        />
      </Modal>
      <div className="watch-list-item-wrap hunter-watch-list-item-wrap">
        <div className="watch-list-item-header">
          <div className="select-multi-option ml-10">
            <Select
              name="filters"
              placeholder="Time Frame"
              value={timeFrames}
              onChange={handleTimeFrameChange}
              options={timeFrameOptions}
              isMulti={true}
            />
          </div>
          <Button
            size="sm"
            className=""
            onClick={() => {handleColumnsChange()}}
          >
            change columns
          </Button>
        </div>
        <div className="watch-list-item-content">
          <MDBTable
            hover
            dark={true}
            maxHeight='100%'
            noBottomColumns={true}
            striped={true}
            scrollX={true}
            scrollY={true}
          >
            <MDBTableHead  className="watch-list-data-table-header">
              <tr>
                {columns.map((item) => (
                  <th key={item.label}>{item.label}</th>
                ))}
              </tr>
            </MDBTableHead>
            <MDBTableBody
              className={"financial-table-body-1"}
            >
              {watchListInitData && watchListInitData.map((item) => (
                <tr key={`row-${item.symbol}`}>
                  {columnItems.map((key) => 
                    (
                      <td 
                        key={`${item.symbol}-${key}`}
                        className={`hunter-financial-table-column ${isEven(item[key]) ===1 ? 'background-green' : isEven(item[key]) ===0 ? 'background-light-red' : ''}`}
                      >
                        {item[key]}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        </div>  
      </div>
    </div>
  )
}

export default WatchListItem;