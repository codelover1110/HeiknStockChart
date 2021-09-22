import React, { useState, useEffect } from 'react';
import Chart from './Chart';
import ChartTools from '../ChartTools';

const GroupBarChart = (props) => {
  const { data, chartData, globalAggregationType } = props;

  const [aggregationTypeForOne, setAggregrationTypeForOne] = useState();
  const [currentData, setCurrentData] = useState();

  const labels = [
    [
      'Revenue',
      'Cost of Revenue',
      'Gross Profit',
      'Ebit',
      'Net Income',
      'Earnings per Basic Share',
    ],
    [
      'Total Assets',
      'Total Liabilities',
      'Total Debt [USD]',
      'Receivables',
      'Payables',
      'Cash & Cash Equivalents [USD]',
    ],
    [
      'Net Cash Flow from Operations',
      'Net Cash Flow from Investing',
      'Net Cash Flow from Financing',
      'Issue/Repayment of Debt Securities',
      'Issuance/Purchase of Equity Shares',
      'Payment of Dividends & Other Cash Distributions',
    ],
  ];

  const filterByAggregationTyoe = (selectedData) => {
    if (selectedData) {
      let filteredData = {...selectedData};
      const dataPoints = filteredData.dataPoints.filter(
        (item) => aggregationTypeForOne === "" || item.period === aggregationTypeForOne
      );
      filteredData['dataPoints'] = dataPoints;
      return filteredData;
    }
    return selectedData;
  };

  const handleDataTypeChanged = (e) => {
    const selectedData = chartData.filter(
      (item) => item.label === e.target.value
    );
    const filteredSelectedData = filterByAggregationTyoe(selectedData[0]);
    setCurrentData(filteredSelectedData);
  };

  useEffect(() => {
    setAggregrationTypeForOne(globalAggregationType);
    const filteredSelectedData = filterByAggregationTyoe(data);
    setCurrentData(filteredSelectedData);
  }, [globalAggregationType]);

  useEffect(() => {
    const filteredSelectedData = filterByAggregationTyoe(data);
    setCurrentData(filteredSelectedData);
  }, [aggregationTypeForOne]);

  return (
    <>
      {currentData && (
        <>
          <div className="chart-toolbar">
            <div className="chart-toolbar-select">
              <select
                className="browser-default custom-select"
                style={{ borderColor: currentData.color, boxShadow: 'unset' }}
                onChange={handleDataTypeChanged}
              >
                {labels[currentData.group].map((item, index) => (
                  <option
                    key={index}
                    val={item}
                    selected={item === currentData.label ? true : false}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <ChartTools
              aggregationTypeForOne={aggregationTypeForOne}
              setAggregrationTypeForOne={setAggregrationTypeForOne}
              color={currentData.color}
            />
          </div>
          <div className="chart-title-area">
            <div style={{ backgroundColor: currentData.color }}></div>
            <span>{currentData.label}</span>
          </div>
          {currentData.dataPoints.length > 0 ? (
            <Chart type={'svg'} data={currentData} />
          ) : (
            <div className="no-data">No data...</div>
          )}
        </>
      )}
    </>
  );
};

export default GroupBarChart;
