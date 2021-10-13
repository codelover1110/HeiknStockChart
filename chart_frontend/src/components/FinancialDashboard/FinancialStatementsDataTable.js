import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Pagination from 'react-bootstrap/Pagination'
import { MDBDataTableV5, MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import { Collapse, Button, CardBody, Card } from 'reactstrap';
import moment from 'moment'

const FinancialStatementsDataTable = (props) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [wholeRows, setWholeRows] = useState(0);
  const [currentData, setCurrentData] = useState({
    columns: [
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
    ],
    rows: [],
  });
  const { data } = props;
  const [selectedRow, setSelectedRow] = useState('no select');
  const [isOpened, setIsOpened] = useState(false);

  const [symbol, setSymbol] = useState({ value: 'GOOG', label: 'GOOG' });
  const [optionsSymbol, setOptionsSymbol] = useState([]);
  // const [datatable, setDatatable] = useState();
  const columns = data.columns.map((item, index) => {
    if (index === 0) {
      return {
        label: item,
        field: item,
        width: 100,
      };  
    } else if (index === 1){
      return {
        label: item,
        field: item,
        width: 300,
      };
    } else {
      return {
        label: item,
        field: item,
      };
    }
  });

  useEffect(() => {
    if (data.rows.length) {
      setWholeRows(data.rows.length)
      const realData = data.rows.slice(currentPage * 10, 10);
      setCurrentData({
        columns: columns,
        rows: realData.map((row, index) => {
          return {
            author: row.author,
            amp_url: row.amp_url,
            article_url: row.article_url,
            published_utc: row.published_utc,
            dataId: row.id,
            description: row.description,
            id: index,
            time: moment(row.published_utc).format("YYYY-MM-DD h:mm:ss"),
            title: row.title,
            publisher: row.publisher,
          }
        })
      })
    }

  }, [data]);

  const handlePrevClick = () => {
    const realData = data.rows.slice((currentPage - 1) * 10, (currentPage) * 10);
    setCurrentData({
      columns: columns,
      rows: realData.map((row, index) => {
        return {
          author: row.author,
          amp_url: row.amp_url,
          article_url: row.article_url,
          published_utc: row.published_utc,
          dataId: row.id,
          description: row.description,
          id: (currentPage-1) * 10 + index,
          time: moment(row.published_utc).format("YYYY-MM-DD h:mm:ss"),
          title: row.title,
          publisher: row.publisher,
        }
      })
    })  
    
    setCurrentPage(currentPage - 1)
  }
  
  const handleNextClick = () => {
    const realData = data.rows.slice((currentPage + 1) * 10, (currentPage + 2) * 10);
    setCurrentData({
      columns: columns,
      rows: realData.map((row, index) => {
        return {
          author: row.author,
          amp_url: row.amp_url,
          article_url: row.article_url,
          published_utc: row.published_utc,
          dataId: row.id,
          description: row.description,
          id: (currentPage+1) * 10 + index,
          time: moment(row.published_utc).format("YYYY-MM-DD h:mm:ss"),
          title: row.title,
          publisher: row.publisher,
        }
      })
    })
    setCurrentPage(currentPage + 1)
  }

  const handleRowSelect = (dataId) => {
      setIsOpened(!isOpened)
      setSelectedRow(dataId)
  }

  return (
    <div className="hunter-chart-container">
      <div className="col-sm-12 hunter-data-table-container financial-data-table mt-30 pt-100">
        {/* <div className="hunter-search-filter-area">
          <div className="select-option">
            <Select
              value={symbol}
              onChange={handleSymbolChange}
              options={optionsSymbol}
              placeholder="Symbol"
            />
          </div>
        </div> */}
        {currentData && (
          <MDBTable
            hover
            dark={true}
            maxHeight='80vh'
            noBottomColumns={true}
            striped={true}
            scrollX={true}
            scrollY={true}
            pagination
          >
            <MDBTableHead
              class={"financial-table-head"}
            >
              <tr>
                {currentData.columns.map((item) => (
                  <th key={item.label}>{item.label}</th>
                ))}
              </tr>
            </MDBTableHead>
            <MDBTableBody
              className={"financial-table-body-1"}
            >
              {currentData.rows.map((item) => (
                <tr onClick={() => {
                  handleRowSelect(item.dataId)
                }}>
                  <td key={item.id} className="hunter-financial-table-column1">{item.id}</td>
                  <td key={item.time} className="hunter-financial-table-column2">{item.time}</td>
                  <td key={item.title} className="hunter-financial-table-column3">
                    <p>{item.title}</p>
                    <Collapse isOpen={isOpened === false && item.dataId === selectedRow}>
                      <Card>
                        <CardBody className="hunter-card-body">
                        <div className="hunter-data-table-details-area">
                          <div className="hunter-data-table-details-area-title">
                            {moment(item.date).format("YYYY-MM-DD h:mm:ss")} : {item.title}
                          </div>
                          <div className="hunter-data-table-details-area-content">
                            <p>{item.description}</p>
                            <div className="hunter-data-table-details-area-row"><div className="hunter-data-table-details-area-key">author:</div> {item.author}</div>
                            <div className="hunter-data-table-details-area-row"><div className="hunter-data-table-details-area-key">publisher:</div> {item.publisher.name}</div>
                            <div className="hunter-data-table-details-area-row"><div className="hunter-data-table-details-area-key">published_utc:</div> {item.published_utc}</div>
                            <div className="hunter-data-table-details-area-row"><div className="hunter-data-table-details-area-key">amp_url:</div> {item.amp_url}</div>
                            <div className="hunter-data-table-details-area-row"><div className="hunter-data-table-details-area-key">article_url:</div> {item.article_url}</div>
                          </div>
                        </div>
                        </CardBody>
                      </Card>
                    </Collapse>
                  </td>
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        )}
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

export default FinancialStatementsDataTable;