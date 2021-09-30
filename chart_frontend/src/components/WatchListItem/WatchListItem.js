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
  getIncomeStatement, getMultiFinancials
} from 'api/Api';
import { MDBSelect } from "mdbreact";


const WatchListItem = () => {
  // const options =  [
  //   {
  //     "labelKey": "optionItem1",
  //     "value": "Option item 1"
  //   },
  //   {
  //     "labelKey": "optionItem2",
  //     "value": "Option item 2"
  //   }
  // ]
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ws, setWs] = useState(null);
  const [isOpenedEditColumnWidget, setIsOpenedEditColumnWidget] = useState(false)
  const [selectedAggregationType, setSelectedAggregationType] = useState('QA');
  const [rowItems, setRowItems] = useState([])
  const [isUpdatedRows, setIsUpdatedRows] = useState(false)
  const [isUpdatedCols, setIsUpdatedCols] = useState(false)
  const [columnItems, setColumnItems] = useState([
    'symbol', 'rsi', 'rsi2', 'rsi3', 'heik', 'heik2', 'chart'
  ])
  const [isInited, setIsInited] = useState(false)
  const [isUpdatedWatchList, setIsUpdatedWatchList] = useState(false);
  const [multiFinancials, setMultiFinancials] = useState([])
  const [selectedSymbols, setSelectedSymbols] = useState([])
  const [symbolOptions, setSymbolOptions] = useState([])
  
  const [columns, setColumns] = useState([
    {
      value: 'symbol',
      label: 'symbol',
      width: 100,
    },
    {
      value: 'rsi',
      label: 'rsi',
      width: 100,
    },
    {
      value: 'rsi2',
      label: 'rsi2',
      width: 100,
    },
    {
      value: 'rsi3',
      label: 'rsi3',
      width: 100,
    },
    {
      value: 'heik',
      label: 'heik',
      width: 100,
    },
    {
      value: 'heik2',
      label: 'heik2',
      width: 100,
    },
    {
      value: 'chart',
      label: 'chart',
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

  const handleSymbolChange = (e) => {
    setSelectedSymbols(e)
  }

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
      .then(async data => {
        rows = data.tables

        const financials = await getMultiFinancials(rows, 'income_statement')
        setMultiFinancials(financials)

        setRowItems(data.tables)
        setIsUpdatedRows(true)
        
        let realData = [];
        let symbols = [];
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
          symbols.push({
            value: row,
            label: row,
          })
          realData.push(object);
        })
        setSymbolOptions(symbols)
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

  const isValidChartData = (symbol) => {
    if (!multiFinancials.length) {
      return false
    }
    const filtered = multiFinancials.filter((financial) => { console.log('filtered???', financial[0], symbol); return financial[0] === symbol; })
    return filtered.length ? true : false
  }

  const getChartDataBySymbol = (symbol, isChild) => {
    if (!multiFinancials.length) {
      return []
    }
    const filtered = multiFinancials.filter((financial) => financial[0] === symbol)
    if (!filtered.length) {
      return []
    }
    console.log('chartData', chartData)
    console.log('filtered[1]???', filtered)
    return filtered[0][1]
  }

  useEffect(() => {
    let initData = watchListInitData
    let newData = []
    let isValid = true

    initData.forEach((init) => {
      watchListData.forEach(o => {
        if (o.symbol === init.symbol) {
          const newObject = {
            symbol: o.symbol,
            ...o.data,
            chart: 
              <div className="container custom-container chart-area hunter-scanner-page-chart-area">
                <div className="row justify-content-center hunter-scanner-page-chart-area-wrap">
                  {isValidChartData(o.symbol) ? (
                    <BarChart
                      // data={getChartDataBySymbol(o.symbol)}
                      data={chartData[0]}
                      // chartData={chartData}
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

  const checkSign = (key, item) => {
    if (key === 'symbol' || key === 'chart') {
      return -1
    }

    const number = parseFloat(item[key])
    return number > 0 ? 1 : 0
  }

  const handleTimeFrameChange = (e) => {
    setTimeFrames(e)
  }

  const getIncome = async (symbol) => {
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
          <div className="select-multi-option mr-1">
            <Select
              name="filters"
              placeholder="Time Frame"
              value={timeFrames}
              onChange={handleTimeFrameChange}
              options={timeFrameOptions}
            />
          </div>
          <div className="select-multi-option mr-1">
            <Select
              name="filters"
              placeholder="Select Symbol"
              value={selectedSymbols}
              onChange={handleSymbolChange}
              options={symbolOptions}
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
          <Button
            size="sm"
            className=""
            onClick={() => {}}
          >
            save default
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
                        className={`hunter-financial-table-column ${key === 'chart' ? 'table-chart-column' : ''}${checkSign(key, item) === 1 ? 'background-green' : checkSign(key, item) === 0 ? 'background-light-red' : ''}`}
                      >
                        {key !== 'symbol' && key !== 'chart' ? parseFloat(item[key]).toFixed(2) : item[key]}
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