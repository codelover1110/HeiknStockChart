import React, { useEffect, useState } from 'react';
import axios from 'axios'
import {PropTypes} from 'prop-types'
import {rawData} from './api-data'
import { scaleTime } from "d3-scale";
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { utcDay } from "d3-time";
import {fitWidth} from 'react-stockcharts/lib/helper'
import {timeIntervalBarWidth, last} from 'react-stockcharts/lib/utils'
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { atr, ema, macd, heikinAshi } from "react-stockcharts/lib/indicator";

let StockChart = (props) => {
  // const {type, width, ratio} = props
  const xAccessor = (d) => {
    return d.date
  }
  // useEffect(() => {
  //   const apiUrl = 'http://40.67.136.227/raw-bars/?symbol=TSLA&timeframe=3ho&bars=100&close=true&extended_hours=true&asset_class=equities&key=Thohn9po1mai7ba'

  //   // axios.get(apiUrl,  {
  //   //   headers: {
  //   //     'Access-Control-Allow-Origin': '*',
  //   //     'Access-Control-Allow-Credentials':true,
  //   //   }
  //   // })
  // }, [])
  let data = []
  rawData['values'].map(row => data.push({date: new Date(row[0]), open: row[1], high: row[2], low: row[3], close: row[4], volume: row[6],}))


  const xExtents = [
    xAccessor(last(data)),
    xAccessor(data[data.length - 100])
  ];

  const ha = heikinAshi();
  const macdCalculator = macd()
    .options({
      fast: 12,
      slow: 26,
      signal: 9,
    })
    .merge((d, c) => { d.macd = c; })
    .accessor(d => d.macd);

  const atr14 = atr()
  .options({ windowSize: 14 })
  .merge((d, c) => {d.atr14 = c;})
  .accessor(d => d.atr14);

  const { type, width, ratio, chartColumn, extendMarketTime } = props;


  const calculatedData = macdCalculator((ha(atr14(data))));
  const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);

  const {
    xScale,
  } = xScaleProvider(calculatedData);


  return (
    <div className="stockchart-new-api">
      {data && <ChartCanvas
        height={400}
        ratio={ratio}
        width={width}
        margin={{left: 50, right: 50, top: 10, bottom: 30}}
        type={type}
        seriesName="MSFT"
        xAccessor={xAccessor}
        xScale={xScale}
        xExtents={xExtents}
        data={data}
      >
        <Chart
          id={1}
          yExtents={(d) => [d.high, d.low]}
        >
          <XAxis axisAt="bottom" orient="bottom" ticks={6} />
          <YAxis axisAt="left" orient="left" ticks={5} />
          <CandlestickSeries width={timeIntervalBarWidth(utcDay)} />
        </Chart>
      </ChartCanvas>}
    </div>
  );
};

StockChart.prototype = {
  data: PropTypes.array.isRequired,
  width: PropTypes.array.isRequired,
  ratio: PropTypes.array.isRequired,
  type: PropTypes.oneOf(['svg', 'hybrid']).isRequired,
}

StockChart.defaultProps = {
  type: 'svg',
  ratio: 1,

}
StockChart = fitWidth(StockChart)
export default StockChart;