import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { MDBDataTableV5, MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import moment from 'moment'

const FinancialStatementsDataTable = (props) => {
  const { data, symbols } = props;

//   const [symbol, setSymbol] = useState({ value: 'GOOG', label: 'GOOG' });
//   const [optionsSymbol, setOptionsSymbol] = useState([]);
  const [datatable, setDatatable] = useState();
  const [selectedData, setSelectedData] = useState(null);
  const [selectedDataId, setSelectedDataId] = useState('');

//   const handleSymbolChange = (e) => {
//     setSymbol(e);
//   };

  useEffect(() => {
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

    setDatatable({
      columns,
      rows: data.rows ? 
        data.rows.map((row, index) => {
          return {
            dataId: row.id,
            id: index,
            time: moment(row.published_utc).format("YYYY-MM-DD h:mm:ss"),
            title: row.title,
            clickEvent: () => handleDataTableClick(row.id)
          }
        }) : [],
    });
  }, [data]);

  const handleDataTableClick = (id) => {
    const selectedData = data.rows.filter(row => row.id === id)
    setSelectedData(selectedData[0])
  }

  return (
    <div className="hunter-chart-container">
      <div className="col-sm-12 hunter-data-table-container financial-data-table mt-30">
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
        {datatable && (
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
          />
        )}
      </div>
      { selectedData !== null &&
        (<div className="hunter-data-table-details-area">
          <div className="hunter-data-table-details-area-title">
            {moment(selectedData.date).format("YYYY-MM-DD h:mm:ss")} : {selectedData.title}
          </div>
          <div className="hunter-data-table-details-area-content">
            <p>{selectedData.description}</p>
            <p><div className="hunter-data-table-details-area-key">author:</div> {selectedData.author}</p>
            <p><div className="hunter-data-table-details-area-key">publisher:</div> {selectedData.publisher.name}</p>
            <p><div className="hunter-data-table-details-area-key">published_utc:</div> {selectedData.published_utc}</p>
            <p><div className="hunter-data-table-details-area-key">amp_url:</div> {selectedData.amp_url}</p>
            <p><div className="hunter-data-table-details-area-key">article_url:</div> {selectedData.article_url}</p>
          </div>
        </div>)
      }
    </div>
  );
};

export default FinancialStatementsDataTable;