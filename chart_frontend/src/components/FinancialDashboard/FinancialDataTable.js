import React, { useState, useEffect } from 'react';
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';

const FinancialDataTable = (props) => {
  const { data } = props;

  const [datatable, setDatatable] = useState();
  const [sorted, setSorted] = useState(0);

  const handleSortClicked = (label) => {
    const sort = sorted === 0 || sorted === 2 ? 1 : 2;
    let rows = datatable.rows;
    for (let i = 0; i < 3; i ++) {
      if (sort === 1) {
        rows[i].sort(function (a, b) {
          let valueA = a[label];
          let valueB = b[label];
          if (typeof a[label] != "string") {
            valueA = valueA.toString();
          }
          if (typeof b[label] != "string") {
            valueB = valueB.toString();
          }
          return valueB.localeCompare(valueA);
        });
      } else if (sort === 2) {
        rows[i].sort(function (a, b) {
          let valueA = a[label];
          let valueB = b[label];
          if (typeof a[label] != "string") {
            valueA = valueA.toString();
          }
          if (typeof b[label] != "string") {
            valueB = valueB.toString();
          }
          return valueA.localeCompare(valueB);
        });
      }
    }
    setSorted(sort);
    setDatatable({
      columns: datatable.columns,
      rows,
    })
  }

  useEffect(() => {
    if (data) {
      const columns = data.columns.map((item, index) => {
        return {
          label: item,
          field: item,
        };
      });
  
      setDatatable({
        columns,
        rows: data.rows,
      });
    }
  }, [data]);

  return (
    <div className="hunter-chart-container">
      <div className="col-sm-12 hunter-data-table-container financial-data-table">
        {datatable && (
          <MDBTable
            hover
            dark={true}
            maxHeight='80vh'
            noBottomColumns={true}
            striped={true}
            scrollX={true}
            scrollY={true}
            paging={false}
          >
            <MDBTableHead
              class={"financial-table-head"}
            >
              <tr>
                {datatable.columns.map((item) => (
                  <th key={item.label} onClick={() => handleSortClicked(item.label)}>{item.label} <span><i className="fa fa-sort" /></span></th>
                ))}
              </tr>
            </MDBTableHead>
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
