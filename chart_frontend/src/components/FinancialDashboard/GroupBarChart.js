import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

import ChartTools from './ChartTools';

const GroupBarChart = (props) => {
  const { data, chartData } = props;
  const [aggregationTypeForOne, setAggregrationTypeForOne] = useState();
  const [currentData, setCurrentData] = useState(data);
  const [chartInfo, setChartInfo] = useState();

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

  useEffect(() => {
    const categories = Object.keys(data.dataPoints);
    let chartDataPoints = [];
    categories.map((category) => {
      const dataPoints = currentData.dataPoints[category];
      dataPoints.map((dataPoint, index) => {
        if (chartDataPoints.length <= index) {
          chartDataPoints[index] = [];
        }
        chartDataPoints[index].push(dataPoint);
      });
      // chartDataPoints.push(dataPoint);
    });

    let series = [];
    for (let i = 0; i < chartDataPoints.length; i++) {
      const dataset = {
        name: currentData.label,
        data: chartDataPoints[i],
      };
      series.push(dataset);
    }

    const options = {
      chart: {
        type: 'bar',
        height: 550,
        toolbar: {
          show: true,
          tools: {
            download: false,
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '100%',
          endingShape: 'rounded',
        },
      },
      colors: [currentData.color],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories,
      },
      fill: {
        opacity: 1,
      },
      legend: {
        show: false,
      },
    };

    setChartInfo({
      options,
      series,
    });
  }, [currentData]);

  const handleDataTypeChanged = (e) => {
    const selectedData = chartData.filter(
      (item) => item.label === e.target.value
    );
    setCurrentData(selectedData[0]);
  };

  return (
    <>
      {chartInfo && (
        <>
          <div className="chart-toolbar">
            <div className="chart-toolbar-select">
              <select
                className="browser-default custom-select"
                style={{ borderColor: currentData.color, boxShadow: 'unset' }}
                onChange={handleDataTypeChanged}
              >
                {labels[currentData.group - 1].map((item, index) => (
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
          <ReactApexChart
            options={chartInfo.options}
            series={chartInfo.series}
            type="bar"
            height={350}
          />
        </>
      )}
    </>
  );
};

export default GroupBarChart;
