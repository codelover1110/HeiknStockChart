import React from 'react';
import ChartGraphWrap from './ChartGraphWrap';
import ChartOptions from './ChartOptions';
import { ApiChartProvider } from './contexts';

import { fitWidth } from "react-stockcharts/lib/helper";
let TradeChart = (props) => {
  return (
    <ApiChartProvider>
      <ChartOptions showAllClicked={props.showAllClicked}  />
      <ChartGraphWrap chartColumn={props.chartColumn.value} chartIndicators={props.chartIndicators} />
    </ApiChartProvider>
  );
};

TradeChart = fitWidth(TradeChart)
export default TradeChart;