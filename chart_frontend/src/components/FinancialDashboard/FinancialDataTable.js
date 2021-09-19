import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';

const FinancialDataTable = (props) => {
  const { data, symbols } = props;

  const [symbol, setSymbol] = useState({ value: 'GOOG', label: 'GOOG' });
  const [optionsSymbol, setOptionsSymbol] = useState([]);
  const [datatable, setDatatable] = useState();

  // const hearder_columns = [
  //   {
  //     label: 'O',
  //     field: 'o',
  //     width: 200,
  //     attributes: {
  //       'aria-controls': 'DataTable',
  //       'aria-label': 'symbol',
  //     },
  //   },
  //   {
  //     label: 'H',
  //     field: 'h',
  //     width: 200,
  //   },
  //   {
  //     label: 'C',
  //     field: 'c',
  //     width: 200,
  //   },
  //   {
  //     label: 'L',
  //     field: 'l',
  //     width: 200,
  //   },
  //   {
  //     label: 'V',
  //     field: 'v',
  //     width: 200,
  //   },
  //   {
  //     label: 'Date',
  //     field: 'date',
  //     sort: 'price',
  //   },
  // ];


  const handleSymbolChange = (e) => {
    setSymbol(e);
  };

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
        <div className="hunter-search-filter-area">
          <div className="select-option">
            <Select
              value={symbol}
              onChange={handleSymbolChange}
              options={optionsSymbol}
              placeholder="Symbol"
            />
          </div>
        </div>
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
              class={"financial-table-body-1"}
              rows={datatable.rows[0]}
            />
            <MDBTableBody
              rows={datatable.rows[1]}
              class="financial-table-body-2"
            />
            <MDBTableBody
              rows={datatable.rows[2]}
              class="financial-table-body-3"
            />
          </MDBTable>
        )}
      </div>
    </div>
  );
};

export default FinancialDataTable;
