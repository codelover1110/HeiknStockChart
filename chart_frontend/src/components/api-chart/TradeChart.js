import React from 'react';
import ChartGraphWrap from './ChartGraphWrap';
import ChartOptions from './ChartOptions';
import { ApiChartProvider } from './contexts';

const TradeChart = () => {
  return (
    <ApiChartProvider>
      <ChartOptions />
      <ChartGraphWrap />
    </ApiChartProvider>
  );
};

export default TradeChart;