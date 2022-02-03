import React from 'react';
import ChartGraph from './ChartGraph';
import { useApiChartContext } from './contexts';

const ChartGraphWrap = () => {
  const {chartData} = useApiChartContext()
  return (
    <>
      <ChartGraph data={chartData} />
    </>
  );
};

export default ChartGraphWrap;