import React, { useEffect } from 'react';
import { useApiChartContext } from './contexts';

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	BarSeries,
	CandlestickSeries,
	StraightLine,
} from "react-stockcharts/lib/series";
import { scaleTime } from "d3-scale";
import {timeIntervalBarWidth, last} from 'react-stockcharts/lib/utils'
import { utcDay, utcHour } from "d3-time";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { fitWidth } from "react-stockcharts/lib/helper";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { format } from "d3-format";
import { withStyles } from "@material-ui/core";
import { HoverTooltip } from "react-stockcharts/lib/tooltip";
import {
	CrossHairCursor,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import dayjs from "dayjs";
import { timeFormat } from "d3-time-format";
import {
	OHLCTooltip,
	ToolTipText,
	SingleValueTooltip,
} from "react-stockcharts/lib/tooltip";
import {
	Annotate,
	SvgPathAnnotation,
	buyPath,
	sellPath,
} from "react-stockcharts/lib/annotation";
import {ema50, ema20, macdCalculator, ha, atr14, xScaleProvider} from './helpers'
import { apiGetTradeHistories } from 'api/Api';
const dateFormat = timeFormat("%Y-%m-%d");
const numberFormat = format(".2f");
const rsiAppearance = {
	stroke: {
		macd: "#FF0000",
		signal: "#00F300",
	},
	fille: {
		bearPower: "#4682B4"
	}
};

function tooltipContent(symbol, ys) {
  let tradeData = []
	return ({ currentItem, xAccessor }) => {
    const loadData = async () => {
      await apiGetTradeHistories({symbol: symbol, date: currentItem.trade_date}).then(data => {
        tradeData = data
      })
    }

    loadData()

    return {
      x: `Ticker: ${symbol}`,
      y: tradeData
    }
		// return {
		// 	x: dateFormat(xAccessor(currentItem)),
		// 	y: currentItem.trade_data
		// 		.concat(
		// 			ys.map(each => ({
		// 				label: each.label,
		// 				value: each.value(currentItem),
		// 				stroke: each.stroke
		// 			}))
		// 		)
		// 		.filter(line => line.value)
		// };
	};
}


let ChartGraph = (props) => {
  const {isLoading} = useApiChartContext()
  const {sym} = useApiChartContext()


  // extract props
  const { type, data: initialData, width, ratio, chartColumn, extendMarketTime } = props;

  if (isLoading || initialData == null || !Array.isArray(initialData)) {
    return <div className="text-white">Loading...</div>
  }

  initialData.forEach(line => {
    line.date = dayjs(line.date).toDate();
  });

  const isFullChart = (chartColumn === 1 || chartColumn === 2);

  const isIncludeIndicators = (indicator) => {
		if (props.indicators) {
			return props.indicators.filter((e) => e.value === indicator).length;
		}
		return 0;
	}

  const calculateTooltipOffset0 = (isFullChart) => {
		return 0;
		// if (!props.isHomePage || isFullChart) {
		// 	return 0;
		// }
		// if ( props.indicators ) {
		// 	if (props.indicators.length > 1) {
		// 		return 0
		// 	}
		// }
		// return 0
	}

	const calculateTooltipOffset1 = (isFullChart) => {
		return 0;
		// if (!props.isHomePage || isFullChart) {
		// 	return 0;
		// }
		// if ( props.indicators ) {
		// 	if (props.indicators.length > 1) {
		// 		return 0
		// 	}
		// }
		// return 0
	}

  const calculateHeight = (isFullChart) => {
    let height = calculateMainHeight(isFullChart)

    if ( props.indicators ) {
			if (props.indicators.length >= 1) {
				return height + props.indicators.length * 100
			}
		}

    return height + 70
	}


  const calculateMainHeight = (isFullChart) => {
    let height = 0
		if (chartColumn==6) {
			height = 300
		}
		if (chartColumn==4) {
			height = 300
		}
		if (chartColumn==2) {
			height = 550
		}
		if (chartColumn==1) {
			height = 550
		}

    return height

    // const indicators = props.indicators.map(indicator => indicator.value)
    // let volume_height = 0
    // let rsi1_height = 0
    // let heik_height = 0
    // let heikdiff_height = 0

    // if (indicators.includes('volume')) {
    //   volume_height = 100
    // }
    // if (indicators.includes('rsi1')) {
    //   rsi1_height = 70
    // }
    // if (indicators.includes('heik')) {
    //   heik_height = 70
    // }
    // if (indicators.includes('heik_diff')) {
    //   heikdiff_height = 70
    // }

    // return 300

    // let mainHeight = 300 - (volume_height+rsi1_height+heik_height+heikdiff_height)
    // return calculateHeight()

    // return mainHeight
  }



  const calculateOffset = (indicator, height, isFullChart) => {
    let mainHeight = calculateMainHeight(isFullChart)
    let volume_height = 0
    let rsi1_height = 0
    let heik_height = 0
    let heikdiff_height = 0



			const indicators = props.indicators.map(indicator => indicator.value)
      console.log('indicators', indicators)

      if (indicators.includes('volume')) {
        volume_height = 100
      }
      if (indicators.includes('rsi1')) {
        rsi1_height = 70
      }
      if (indicators.includes('heik')) {
        heik_height = 70
      }
      if (indicators.includes('heik_diff')) {
        heikdiff_height = 70
      }

			if (indicator === 'volume') {
				return mainHeight;
			}
      if (indicator === 'rsi1') {
        console.log('volume_height', volume_height)
				return mainHeight + volume_height;
			}
			if (indicator === 'heik') {
				return mainHeight + volume_height + rsi1_height;
			}

			if (indicator === 'heik_diff') {
				return mainHeight + volume_height + rsi1_height + heik_height;
			}

			return height
	}

	const calculateMainHeightOffset = (height, isFullChart) => {
		if (props.isHomePage && !isFullChart) {
			return 100 + (props.indicators.length - 1) * 50
		}
		if ( props.indicators ) {
			if (props.indicators.length > 1) {
				return 300 + (props.indicators.length - 1) * 100
			}
		}
		return 300
	}

  const calculatedData = macdCalculator((ha(atr14(initialData))));

  const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
  const {
    data,
    xScale,
    xAccessor,
    displayXAccessor,
  } = xScaleProvider(calculatedData);


  // xExtents
  const start = xAccessor(last(data));
	const end = xAccessor(data[Math.max(0, data.length - 150)]);
	const xExtents = [start, end];

  const defaultAnnotationProps = {
    onClick: console.log.bind(console),
  };

  const longAnnotationProps = {
    ...defaultAnnotationProps,
    y: ({ yScale, datum }) => { return yScale(datum.low) - calculateTooltipOffset0(isFullChart) },
    fill: "#006517",
    path: buyPath,
    tooltip: (e) => {
      const contents = e.trades.map((trade) => `${trade.longShort === 'LONG' ? 'Buy:' : 'Sell:'} Price: ${trade.price} Date: ${trade.trade_date.replace('T', ' ')}\n`)
      return contents
    },
  };

  const shortAnnotationProps = {
    ...defaultAnnotationProps,
    y: ({ yScale, datum }) => { return yScale(datum.high) - calculateTooltipOffset1(isFullChart)},
    fill: "#FF0000",
    path: sellPath,
    tooltip: (e) => {
      const contents = e.trades.map((trade) => `${trade.longShort === 'LONG' ? 'Buy:' : 'Sell:'} Price: ${trade.price} Trade Date: ${trade.trade_date.replace('T', ' ')}\n`)
      return contents
    }
  };

  const xDisplayFormatProps = {
    xDisplayFormat: timeFormat("%Y-%m-%d : %H-%M-%S"),
    ohlcFormat: () => "",
    volumeFormat: () => "",
    percentFormat: () => "",
    displayTexts: {
      d: "Date: ",
    },

  }
  const xDisplayFormatProps1 = {
    xDisplayFormat: timeFormat(""),
    displayTexts: {
      o: " O: ",
      h: " H: ",
      l: " L: ",
      c: " C: ",
      v: " Vol: ",
      na: "n/a"
    },
  }
  const xDisplayFormatProps2 = {
    xDisplayFormat: timeFormat(""),
    ohlcFormat: () => "",
    volumeFormat: () => sym,
    percentFormat: () => "",
    displayTexts: {
      v: " Symbol: ",
    },
  }

  const SMATooltipProps = {
    valueFill: '#ffffff'
  }



  return (
    <>
      {
        isLoading || data==null?
          <div className="hunter-loadding-status-text color-white">Loading...</div>
        :
          <>
              <ChartCanvas
                height={calculateHeight(isFullChart)}
                width={width}
                ratio={ratio}
                margin={{left: 50, right: 50, top: 10, bottom: 30}}
                type={'svg'}
                seriesName="MSFT"
                data={data}
                xAccessor={xAccessor}
                displayXAccessor={displayXAccessor}
                xScale={xScale}
                xExtents={xExtents}
              >
                <Chart id={1}
                  height={
                    calculateMainHeight(isFullChart)
                  }
                  yExtents={d => [d.high, d.low]}>
                  <XAxis axisAt="bottom" orient="bottom"  stroke="white" tickStroke="white" />
                  <YAxis axisAt="right" orient="right" ticks={5} stroke="white" tickStroke="white" />

                  <MouseCoordinateX
                    at="bottom"
                    orient="bottom"
                    displayFormat={timeFormat("%Y-%m-%d")} />
                  <MouseCoordinateY
                    at="right"
                    orient="right"
                    displayFormat={format(".2f")} />

                  <CandlestickSeries
                    stroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                    wickStroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                    fill={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                  />

                  <OHLCTooltip
                    origin={[-50, -5]}
                    {...xDisplayFormatProps}
                  />

                  <OHLCTooltip
                    origin={[-50, 20]}
                    {...xDisplayFormatProps1}
                  />

                  <OHLCTooltip
                    origin={[100, 0]}
                    {...xDisplayFormatProps2}
                  />

                  <Annotate with={SvgPathAnnotation} when={ d =>
                    {
                      return props.selectedInstance !== 'live_trading'
                      && d.trades
                      && d.trades[0].strategy === `${props.strategy.value}-${props.microStrategy}-trades`
                      && d.trades[0].longShort === "LONG"
                    }}
                    usingProps={longAnnotationProps} />
                  <Annotate with={SvgPathAnnotation} when={d =>
                    props.selectedInstance !== 'live_trading'
                    && d.trades
                    && d.trades[0].strategy === `${props.strategy.value}-${props.microStrategy}-trades`
                    && d.trades[0].longShort === "SHORT" }
                    usingProps={shortAnnotationProps} />

                  <HoverTooltip
                    yAccessor={ema50.accessor()}
                    tooltipContent={tooltipContent(sym, [

                    ])}
                    fontSize={12}
                  />
                </Chart>
                {isIncludeIndicators('volume') && (
                <Chart id={2} height={(!props.isHomePage || isFullChart) ? 100 : 50}
                  yExtents={[d => d.volume]}
                  origin={(w, h) => [0, calculateOffset('volume', h, isFullChart)]}
                  padding={{ top: 10, bottom: 10 }}>
                  <XAxis axisAt="bottom" orient="bottom" stroke="white" tickStroke="white" />
                  <YAxis axisAt="right" orient="right" ticks={5} tickFormat={format(".2s")} stroke="white" tickStroke="white" />

                  <MouseCoordinateY
                    at="left"
                    orient="left"
                    displayFormat={format(".4s")} />

                  <BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />
                </Chart>
                )}
                {isIncludeIndicators('rsi1') && (
                  <Chart id={3}
                    // height={(!props.isHomePage || isFullChart) ? 100 : 70}
                    height={70}
                    yExtents={[0, d => d.rsi.bearPower]}
                    origin={(w, h) => [0, calculateOffset('rsi1', h, isFullChart)]}
                    padding={{ top: 40, bottom: 10 }}>
                    <XAxis axisAt="bottom" orient="bottom" stroke="white" tickStroke="white" />
                    <YAxis axisAt="right" orient="right" stroke="white" tickStroke="white" ticks={4} tickFormat={format(".2f")}/>
                    <MouseCoordinateX
                      at="bottom"
                      orient="bottom"
                      displayFormat={timeFormat("%Y-%m-%d")} />
                    <MouseCoordinateY
                      at="right"
                      orient="right"
                      displayFormat={format(".2f")} />
                    <BarSeries
                      yAccessor={d => d.rsi.bearPower}
                      baseAt={(xScale, yScale, d) => yScale(0)}
                      fill={d => d.rsi.side === 'buy' ? '#800080' : d.rsi.side === 'sell' ? '#FFA500' : d.rsi.side === 'hold' ? '#00FF00' : '#FF0000'} />
                    <StraightLine yValue={0} />

                    <SingleValueTooltip
                      yAccessor={d => d.rsi.bearPower}
                      yLabel="RSI - Bear power"
                      yDisplayFormat={format(".2f")}
                      appearance={rsiAppearance}
                      {...SMATooltipProps}
                      origin={[-40, 35]}/>
                  </Chart>
                )}
                {isIncludeIndicators('rsi2') && (
                  <Chart id={4}
                    // height={(!props.isHomePage || isFullChart) ? 100 : 70}
                    height={70}
                    yExtents={[0, d => d.rsi2.bearPower]}
                    origin={(w, h) => [0, calculateOffset('rsi2', h, isFullChart)]}
                    padding={{ top: 40, bottom: 10 }}
                  >
                    <XAxis axisAt="bottom" orient="bottom" stroke="white" tickStroke="white" />
                    <YAxis axisAt="right" orient="right" stroke="white" tickStroke="white" ticks={4} tickFormat={format(".2f")}/>
                    <MouseCoordinateX
                      at="bottom"
                      orient="bottom"
                      displayFormat={timeFormat("%Y-%m-%d")} />
                    <MouseCoordinateY
                      at="right"
                      orient="right"
                      displayFormat={format(".2f")} />
                    <BarSeries
                      yAccessor={d => d.rsi2.bearPower}
                      baseAt={(xScale, yScale, d) => yScale(0)}
                      fill={d =>
                        d.rsi2.color === 'l_g' ? '#90EE90' : d.rsi2.color === 'd_g' ? '#006400' : d.rsi2.color === 'l_r' ? '#ED0800' : '#8B0000'
                      } />
                    <StraightLine yValue={0} />

                    <SingleValueTooltip
                      yAccessor={d => d.rsi2.bearPower}
                      yLabel="RSI2 - Bear power"
                      yDisplayFormat={format(".2f")}
                      appearance={rsiAppearance}
                      {...SMATooltipProps}
                      origin={[-40, 35]}/>
                  </Chart>
                )}
                {isIncludeIndicators('rsi3') && (
                  <Chart id={5}
                    // height={(!props.isHomePage || isFullChart) ? 100 : 70}
                    height={70}
                    yExtents={[0, d => d.rsi3.bearPower]}
                    origin={(w, h) => [0, h - calculateOffset('rsi3', isFullChart)]}
                    padding={{ top: 40, bottom: 10 }}
                  >
                    <XAxis axisAt="bottom" orient="bottom" stroke="white" tickStroke="white" />
                    <YAxis axisAt="right" orient="right" stroke="white" tickStroke="white" ticks={4} tickFormat={format(".2f")}/>
                    <MouseCoordinateX
                      at="bottom"
                      orient="bottom"
                      displayFormat={timeFormat("%Y-%m-%d")} />
                    <MouseCoordinateY
                      at="right"
                      orient="right"
                      displayFormat={format(".2f")} />
                    <BarSeries
                      yAccessor={d => d.rsi3.bearPower}
                      baseAt={(xScale, yScale, d) => yScale(0)}
                      fill={d =>
                        d.rsi3.color === 'l_g' ? '#90EE90' : d.rsi3.color === 'd_g' ? '#006400' : d.rsi3.color === 'l_r' ? '#ED0800' : '#8B0000'
                      } />
                    <StraightLine yValue={0} />

                    <SingleValueTooltip
                      yAccessor={d => d.rsi3.bearPower}
                      yLabel="RSI3 - Bear power"
                      yDisplayFormat={format(".2f")}
                      appearance={rsiAppearance}
                      {...SMATooltipProps}
                      origin={[-40, 35]}/>
                  </Chart>
                )}
                {isIncludeIndicators('heik') && (
                  <Chart id={6}
                    // height={(!props.isHomePage || isFullChart) ? 100 : 70}
                    height={70}
                    yExtents={[0, d => d.heik.bearPower]}
                    origin={(w, h) => [0, calculateOffset('heik', h, isFullChart)]}
                    padding={{ top: 40, bottom: 10 }}
                  >
                    <XAxis axisAt="bottom" orient="bottom" stroke="white" tickStroke="white" />
                    <YAxis axisAt="right" orient="right" stroke="white" tickStroke="white" ticks={4} tickFormat={format(".2f")}/>
                    <MouseCoordinateX
                      at="bottom"
                      orient="bottom"
                      displayFormat={timeFormat("%Y-%m-%d")} />
                    <MouseCoordinateY
                      at="right"
                      orient="right"
                      displayFormat={format(".2f")} />
                    <BarSeries
                      yAccessor={d => d.heik.bearPower}
                      baseAt={(xScale, yScale, d) => yScale(0)}
                      fill={d =>
                        d.heik.color === 'l_g' ? '#90EE90' : d.heik.color === 'd_g' ? '#006400' : d.heik.color === 'l_r' ? '#ED0800' : '#8B0000'
                      } />
                    <StraightLine yValue={0} />

                    <SingleValueTooltip
                      yAccessor={d => d.heik.bearPower}
                      yLabel="HEIK1 - Bear power"
                      yDisplayFormat={format(".2f")}
                      appearance={rsiAppearance}
                      {...SMATooltipProps}
                      origin={[-40, 35]}/>
                  </Chart>
                )}
                {isIncludeIndicators('heik_diff') && (
                  <Chart id={7}
                    // height={(!props.isHomePage || isFullChart) ? 100 : 70}
                    height={70}
                    yExtents={[0, d => d.heik2.bearPower]}
                    origin={(w, h) => [0, calculateOffset('heik_diff', h, isFullChart)]}
                    padding={{ top: 40, bottom: 10 }}
                  >
                    <XAxis axisAt="bottom" orient="bottom" stroke="white" tickStroke="white" />
                    <YAxis axisAt="right" orient="right" stroke="white" tickStroke="white" ticks={4} tickFormat={format(".2f")}/>
                    <MouseCoordinateX
                      at="bottom"
                      orient="bottom"
                      displayFormat={timeFormat("%Y-%m-%d")} />
                    <MouseCoordinateY
                      at="right"
                      orient="right"
                      displayFormat={format(".2f")} />
                    <BarSeries
                      yAccessor={d => d.heik2.bearPower}
                      baseAt={(xScale, yScale, d) => yScale(0)}
                      fill={d =>
                        d.heik2.color === 'l_g' ? '#90EE90' : d.heik2.color === 'd_g' ? '#006400' : d.heik2.color === 'l_r' ? '#ED0800' : '#8B0000'
                      } />
                    <StraightLine yValue={0} />

                    <SingleValueTooltip
                      yAccessor={d => d.heik2.bearPower}
                      yLabel="HEIK2 - Bear power"
                      yDisplayFormat={format(".2f")}
                      appearance={rsiAppearance}
                      {...SMATooltipProps}
                      origin={[-40, 35]}/>
                  </Chart>
                )}
                <CrossHairCursor />
              </ChartCanvas>
          </>
      }
    </>
  );
};

ChartGraph = fitWidth(ChartGraph);

export default withStyles({
	CandleChart_type_date: {
	  fontSize: "12px",
	  fill: "#AEC6EE"
	},
	CandleChart: {
	  borderRadius: "2px"
	},
	CandleChart_type_value: {
	  fontSize: "16px",
	  fontWeight: 500
	},
	deal_green_shadowed: {
	  textShadow: "0 0 3px yellowgreen"
	},
	deal_red_shadowed: {
	  textShadow: "0 0 3px fuchsia"
	}
})(fitWidth(ChartGraph));
