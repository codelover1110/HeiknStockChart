import React, { useState } from 'react';
import Chart from './Chart';
import ChartTools from '../ChartTools';

const GroupBarChart = (props) => {
  const { data, chartData } = props;
  console.log("props", props);
  const [aggregationTypeForOne, setAggregrationTypeForOne] = useState();
  const [currentData, setCurrentData] = useState(data);

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

  const handleDataTypeChanged = (e) => {
    const selectedData = chartData.filter(
      (item) => item.label === e.target.value
    );
    setCurrentData(selectedData[0]);
  };

  return (
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
      {currentData.dataPoints.length > 0 ? <Chart type={'svg'} data={currentData} /> : <div className="no-data">No data...</div>}
    </>
  );
};

export default GroupBarChart;
