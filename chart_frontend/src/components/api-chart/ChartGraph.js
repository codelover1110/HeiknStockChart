import React, { useEffect } from 'react';
import { useApiChartContext } from './contexts';
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { scaleTime } from "d3-scale";
import {timeIntervalBarWidth, last} from 'react-stockcharts/lib/utils'
import { utcDay, utcHour } from "d3-time";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { fitWidth } from "react-stockcharts/lib/helper";

import dayjs from "dayjs";
import {macdCalculator, ha, atr14, xScaleProvider} from './helpers'

let ChartGraph = (props) => {
  const {isLoading, chartData} = useApiChartContext()

  if (isLoading || chartData == null) {
    return <>Loading...</>
  }

  // xAccessor
  // const calculatedData = macdCalculator((ha(atr14(chartData))));
  // const {
  //   xAccessor,
  // } = xScaleProvider(calculatedData);
  const xAccessor = d => d.date

  // xExtents
  const start = xAccessor(last(chartData));
	const end = xAccessor(chartData[Math.max(0, chartData.length - 150)]);
	const xExtents = [start, end];

  // extract props
  const {width} = props

  return (
    <>
      {
        isLoading || chartData==null?
          <div className="hunter-loadding-status-text color-white">Loading...</div>
        :
          <>
              <ChartCanvas
                height={350}
                ratio={1}
                width={width}
                margin={{left: 50, right: 50, top: 10, bottom: 30}}
                type={'svg'}
                seriesName="MSFT"
                data={chartData}
                xAccessor={xAccessor}
                xScale={scaleTime()}
                xExtents={xExtents}
              >
                <Chart id={1} yExtents={d => [d.high, d.low]}>
                  <XAxis axisAt="bottom" orient="bottom" ticks={6}/>
                  <YAxis axisAt="left" orient="left" ticks={5} />
                  <CandlestickSeries
                    stroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                    wickStroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                    fill={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                    width={timeIntervalBarWidth(utcHour)}
                  />
                </Chart>
              </ChartCanvas>
          </>
      }
    </>
  );
};

ChartGraph = fitWidth(ChartGraph);

export default ChartGraph;