import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';

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
          width: 400,
          attributes: {
            'aria-controls': 'DataTable',
            'aria-label': 'BreakDown',
          }
        };
      } else {
        return {
          label: item,
          field: item,
          width: 150,
        };
      }
    });

    setDatatable({
      columns,
      rows: data.rows,
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
          <MDBTable
            hover
            dark={true}
            maxHeight='70vh'
            noBottomColumns={true}
            striped={true}
            scrollX={true}
            scrollY={true}
            paging={false}
          >
            <MDBTableHead
              columns={datatable.columns}
              class={"financial-table-head"}
            />
            <MDBTableBody
              rows={datatable.rows}
            />
          </MDBTable>
        )}
      </div>
    </div>
  );
};

export default FinancialStatementsDataTable;
