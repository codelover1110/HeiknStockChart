import React, { useState } from 'react'
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import './WatchListItem.css'

const WatchListItem = () => {
  const [columns, setColumns] = useState([
    {
      label: 'Id',
      field: 'id',
      width: 100,
    },
    {
      label: 'Time',
      field: 'time',
      width: 300,
    },
    {
      label: 'Title',
      field: 'title',
      width: 300,
    }
  ]);
  
  const [watchListData, setWatchListData] = useState([])

  return (
    <div className="watch-list-item-container">
      <div className="watch-list-item-wrap">
        <div className="watch-list-item-header"></div>
        <div className="watch-list-item-content">
          <MDBTable
            hover
            dark={true}
            maxHeight='100%'
            noBottomColumns={true}
            striped={true}
            scrollX={true}
            scrollY={true}
            pagination
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
                  <td key={item.id} className="hunter-financial-table-column1">{item.id}</td>
                  <td key={item.time} className="hunter-financial-table-column2">{item.time}</td>
                  <td key={item.title} className="hunter-financial-table-column3">
                    <p>{item.title}</p>
                  </td>
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