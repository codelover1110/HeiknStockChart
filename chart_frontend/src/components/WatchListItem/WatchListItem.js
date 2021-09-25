import React, { useEffect, useState } from 'react'
import { Button } from 'reactstrap'
import Modal from 'react-bootstrap/Modal'
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import WatchListEditColumnWidget from 'components/WatchListEditColumnWidget/WatchListEditColumnWidget'
import './WatchListItem.css'

const WatchListItem = () => {
  const [ws, setWs] = useState(null);
  const [isOpenedEditColumnWidget, setIsOpenedEditColumnWidget] = useState(false)
  
  const colums_1 = [
    { Header: 'V', accessor: 'v' },
    { Header: 'VW', accessor: 'vw' },
    { Header: 'O', accessor: 'o' },
    { Header: 'C', accessor: 'c' },
    { Header: 'H', accessor: 'h' },
    { Header: 'L', accessor: 'l' },
    { Header: 'N', accessor: 'n' },
    { Header: 'DATE', accessor: 'date' }
  ]
  
  const [columns, setColumns] = useState([
    {
      label: 'Symbol',
      field: 'symbol',
      width: 100,
    },
    {
      label: 'V',
      field: 'v',
      width: 100,
    },
    {
      label: 'VW',
      field: 'vw',
      width: 100,
    },
    {
      label: 'O',
      field: 'o',
      width: 100,
    },
    {
      label: 'C',
      field: 'c',
      width: 100,
    },
    {
      label: 'H',
      field: 'h',
      width: 100,
    },
    {
      label: 'L',
      field: 'l',
      width: 100,
    },
    {
      label: 'N',
      field: 'n',
      width: 100,
    },
    {
      label: 'Date',
      field: 'date',
      width: 100,
    }
  ]);
  
  const [watchListData, setWatchListData] = useState([])

  const handleColumnsChange = () => {
    setIsOpenedEditColumnWidget(true)
  }

  const handleModalClose = () => {
    setIsOpenedEditColumnWidget(false)
  }

  useEffect(() => {
    if (!ws) {
      const socket = new WebSocket(process.env.REACT_APP_SOCKET_URL);
      setWs(socket)
      
      socket.onopen = () => {
        console.log('Opened Connection!')
      };
    
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        console.log('msg???', msg)
        setWatchListData(msg)
      };
    
      socket.onclose = () => {
        console.log('Closed Connection!')
      };
    }
  }, [])

  return (
    <div className="watch-list-item-container">
      <Modal show={isOpenedEditColumnWidget} className="hunter-modal" onHide={() => handleModalClose()}>
        <WatchListEditColumnWidget />
      </Modal>
      <div className="watch-list-item-wrap">
        <div className="watch-list-item-header">
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
              {watchListData && watchListData.map((item) => (
                <tr>
                  <td key={item.id} className="hunter-financial-table-column">{item.symbol}</td>
                  <td key={item.id} className="hunter-financial-table-column">{item.data.v}</td>
                  <td key={item.id} className="hunter-financial-table-column">{item.data.vw}</td>
                  <td key={item.id} className="hunter-financial-table-column">{item.data.o}</td>
                  <td key={item.id} className="hunter-financial-table-column">{item.data.c}</td>
                  <td key={item.id} className="hunter-financial-table-column">{item.data.h}</td>
                  <td key={item.id} className="hunter-financial-table-column">{item.data.l}</td>
                  <td key={item.id} className="hunter-financial-table-column">{item.data.n}</td>
                  <td key={item.id} className="hunter-financial-table-column">{item.data.date}</td>
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