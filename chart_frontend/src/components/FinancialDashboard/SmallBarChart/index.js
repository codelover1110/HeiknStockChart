import React, { useState, useEffect } from 'react';
import Chart from './Chart';
import './SmallBarChart.css'

const GroupBarChart = (props) => {
  const { data, chartData, globalAggregationType } = props;

  const [aggregationTypeForOne, setAggregrationTypeForOne] = useState();
  const [currentData, setCurrentData] = useState();

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
    <div className="small-bar-chart">
      {currentData && (
        currentData.dataPoints.length > 0 ? (
          <Chart type={'svg'} data={currentData} />
        ) : (
          <div className="no-data">No data...</div>
        )
      )}
    </div>
  );
};

export default GroupBarChart;
