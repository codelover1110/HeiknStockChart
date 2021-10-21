import React, { useState, useEffect } from 'react';
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import { useCsvDownloadUpdate } from 'contexts/CsvDownloadContext';
import { useDatatableLoading, useDatatable } from "contexts/DatatableContext";
import Spinner from "components/Spinner"

const FinancialDataTable = (props) => {
  const { data, selectedStockType, selectedAggregationType } = props;

  const [datatable, setDatatable] = useState();
  const [sorted, setSorted] = useState(0);

  const [isLoadingData, setLoadingData] = useDatatableLoading()
  const updateCsvDownload = useCsvDownloadUpdate();

  const wrapSetDatatable = (data) => {
    setDatatable(data)
    updateCsvDownload([...data.rows[0]])
  }

  const handleSortClicked = (label) => {
    const sort = sorted === 0 || sorted === 2 ? 1 : 2;
    let rows = datatable.rows;
    for (let i = 0; i < rows.length; i++) {
      if (sort === 1) {
        rows[i].sort(function (a, b) {
          let valueA = a[label];
          let valueB = b[label];
          if (typeof a[label] != 'string') {
            valueA = valueA.toString();
          }
          if (typeof b[label] != 'string') {
            valueB = valueB.toString();
          }
          return valueB.localeCompare(valueA);
        });
      } else if (sort === 2) {
        rows[i].sort(function (a, b) {
          let valueA = a[label];
          let valueB = b[label];
          if (typeof a[label] != 'string') {
            valueA = valueA.toString();
          }
          if (typeof b[label] != 'string') {
            valueB = valueB.toString();
          }
          return valueA.localeCompare(valueB);
        });
      }
    }
    setSorted(sort);
    wrapSetDatatable({
      columns: datatable.columns,
      rows,
    });
  };



  useEffect(() => {
    if (data) {
      let columns = [
        {
          label: 'BreakDown',
          field: 'BreakDown',
        },
        {
          label: 'TTM',
          field: 'TTM',
        },
      ];
      let rows = [];
      data.map((item) => {
        if (selectedAggregationType === '' || selectedAggregationType === item.period) {
          const calendarDateKey = item['calendarDate'];
          if (!columns.includes(calendarDateKey)) {
            columns.push({
              label: calendarDateKey,
              field: calendarDateKey,
            });
          }

          const keys = Object.keys(item);
          keys.map((key, index) => {
            if (!(index in rows)) {
              rows[index] = {};
            }
            rows[index]['BreakDown'] = key;
            rows[index]['TTM'] = '1000000';
            rows[index][calendarDateKey] = item[key];
          });
        }
      });

      if (selectedStockType === '') {
        rows = [rows, rows, rows];
      } else {
        rows = [rows];
      }
      wrapSetDatatable({
        columns,
        rows,
      });
    }
  }, [data, selectedAggregationType, selectedStockType]);

  const formatNumber = (num) => {
    let number = parseInt(num)
    if (number > 0) {
      if ( number / 1000 < 999 ) {
        return `${number / 1000} Th`
      } else if ( number / 1000000 < 999 ) {
        return `${number / 1000000} M`
      } else if ( number / 1000000000 < 999 ) {
        return `${number / 1000000000} B`
      } else if ( number / 1000000000000 < 999 ) {
        return `${number / 1000000000000} Tr`
      } else if ( number / 1000000000000000 < 999 ) {
        return `${number / 1000000000000000} Q`
      }
    } else if (number < 0) {
      number = -number;
      if ( number < 1000 ) {
        return `-${number}`
      }
      else if ( number / 1000 < 999 ) {
        return `-${number / 1000} Th`
      } else if ( number / 1000000 < 999 ) {
        return `-${number / 1000000} M`
      } else if ( number / 1000000000 < 999 ) {
        return `-${number / 1000000000} B`
      } else if ( number / 1000000000000 < 999 ) {
        return `-${number / 1000000000000} Tr`
      } else if ( number / 1000000000000000 < 999 ) {
        return `-${number / 1000000000000000} Q`
      }
    }

    return number
  }

  const formatData = (rows) => {
    const newRows = []
    rows.map((row) => {
      let newObject = {}
      Object.keys(row).map(key => {
        if ((key === 'TTM') || (typeof(row[key]) !== 'string') && parseInt(row[key]) !== NaN) {
          newObject[key] = formatNumber(row[key])
        } else {
          newObject[key] = row[key]
        }
      })
      newRows.push(newObject)
    })
    return newRows
  }

  return (
    <div className="hunter-chart-container">
      <div className="col-sm-12 hunter-data-table-container financial-data-table">
        {isLoadingData && <div className="hunter-spinner-area"><span className="mr-30">Loading ...</span>    <Spinner>Loading</Spinner></div>}
        {!isLoadingData && datatable && (
          <MDBTable
            hover
            dark={true}
            maxHeight="80vh"
            noBottomColumns={true}
            striped={true}
            scrollX={true}
            scrollY={true}
            paging={false}
          >
            <MDBTableHead class={'financial-table-head'}>
              <tr>
                {datatable.columns.map((item) => (
                  <th
                    key={item.label}
                    onClick={() => handleSortClicked(item.label)}
                  >
                    {item.label}{' '}
                    <span>
                      <i className="fa fa-sort" />
                    </span>
                  </th>
                ))}
              </tr>
            </MDBTableHead>
            {datatable.rows.length === 3 ? (
              <>
                <MDBTableBody
                  class={'financial-table-body-1'}
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
              </>
            ) : (
              <MDBTableBody
                rows={formatData(datatable.rows[0])}
                class={
                  selectedStockType === 'Income Statement'
                    ? 'financial-table-body-1'
                    : selectedStockType === 'Balance Sheet'
                    ? 'financial-table-body-2'
                    : 'financial-table-body-3'
                }
              />
            )}
          </MDBTable>
        )}
      </div>
    </div>
  );
};

export default FinancialDataTable;
