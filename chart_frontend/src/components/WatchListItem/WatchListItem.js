import React, { useEffect, useState } from 'react'
import { Button } from 'reactstrap'
import Modal from 'react-bootstrap/Modal'
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import WatchListEditColumnWidget from 'components/WatchListEditColumnWidget/WatchListEditColumnWidget'
import './WatchListItem.css'
import { set } from 'lodash';
import Select from 'react-select'

const WatchListItem = () => {
  const [ws, setWs] = useState(null);
  const [isOpenedEditColumnWidget, setIsOpenedEditColumnWidget] = useState(false)
  const [rowItems, setRowItems] = useState([])
  const [isUpdatedRows, setIsUpdatedRows] = useState(false)
  const [isUpdatedCols, setIsUpdatedCols] = useState(false)
  const [columnItems, setColumnItems] = useState([
    'symbol', 'o', 'h', 'l', 'c', 'n', 'v', 'vw'
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
    },
    {
      value: 'vw',
      label: 'vw',
      width: 100,
    },
    {
      value: 'date',
      label: 'date',
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
            object[col.value] = '0.00'
          })
          object.symbol = row
          realData.push(object);
        })
        setWatchListInitData(realData)
        setIsInited(true);  
      })
    }
    if (!isInited) {
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
            ...o.data
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
      ws.send("set_time_frame", '1d, 3d')
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

  return (
    <div className="watch-list-item-container">
      <Modal show={isOpenedEditColumnWidget} className="hunter-widget-modal" onHide={() => handleModalClose()}>
        <WatchListEditColumnWidget
          handleModalClose={handleModalClose}
          setColumns={handleColumnSet}
        />
      </Modal>
      <div className="watch-list-item-wrap">
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