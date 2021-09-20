import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { MDBDataTableV5, MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';

const FinancialStatementsDataTable = (props) => {
  const { data, symbols } = props;

//   const [symbol, setSymbol] = useState({ value: 'GOOG', label: 'GOOG' });
//   const [optionsSymbol, setOptionsSymbol] = useState([]);
  const [datatable, setDatatable] = useState();

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
      rows: data.rows.map((row, index) => {
        return {
          id: index,
          time: row.published_utc,
          title: row.title
        }
      }),
    });
  }, [data]);

  return (
    <div className="hunter-chart-container">
      <div className="col-sm-12 hunter-data-table-container financial-data-table">
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
    </div>
  );
};

export default FinancialStatementsDataTable;