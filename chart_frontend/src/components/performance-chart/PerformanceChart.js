import { set } from "d3-collection";
import { scaleOrdinal, schemeCategory10, scaleLinear } from  "d3-scale";
import { format } from "d3-format";
import { extent } from "d3-array";

import React from "react";
import PropTypes from "prop-types";
import { timeFormat } from "d3-time-format";
import dayjs from "dayjs";
import { ChartCanvas, Chart } from "react-stockcharts";
import { LineSeries, ScatterSeries, CircleMarker } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	GroupedBarSeries,
} from "react-stockcharts/lib/series";
import {
	EdgeIndicator,
	CurrentCoordinate
} from "react-stockcharts/lib/coordinates";

import { elderRay, ema, macd, heikinAshi } from "react-stockcharts/lib/indicator";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { HoverTooltip } from "react-stockcharts/lib/tooltip";
import { hexToRGBA } from "react-stockcharts/lib/utils";

import { fitWidth } from "react-stockcharts/lib/helper";
import temp from './temp.json';

const dateFormat = timeFormat("%Y-%m-%d");
const numberFormat = format(".2f");

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke === "undefined") {
	  stroke = true;
	}
	if (typeof radius === "undefined") {
	  radius = 5;
	}
	if (typeof radius === "number") {
	  radius = { tl: radius, tr: radius, br: radius, bl: radius };
	} else {
	  var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
	  for (var side in defaultRadius) {
		radius[side] = radius[side] || defaultRadius[side];
	  }
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(
	  x + width,
	  y + height,
	  x + width - radius.br,
	  y + height
	);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) {
	  ctx.fill();
	}
	if (stroke) {
	  ctx.stroke();
	}
}
function backgroundShapeCanvas(props, { width, height }, ctx) {
	const { fill, stroke, opacity } = props;
	
	ctx.fillStyle = hexToRGBA(fill, opacity);
	ctx.strokeStyle = stroke;
	roundRect(ctx, 0, 0, width, height, 2, true);
}
class BubbleChart extends React.Component {
	render() {

		const ema20 = ema()
			.id(0)
			.options({ windowSize: 20 })
			.merge((d, c) => { d.ema20 = c; })
			.accessor(d => d.ema20);

		const { data: mainData, type, width, ratio,multiSymbol } = this.props;
		const initialData = temp['chart_data']['percentEfficiency'];
		
		const GroupDataMock = temp['chart_data']['winningLosing'];
		const elder = elderRay();
		const ha = heikinAshi();
		const ema50 = ema()
		  .id(2)
		  .options({ windowSize: 50 })
		  .merge((d, c) => {
			d.ema50 = c;
		  })
		.accessor(d => d.ema50);
		const ema26 = ema()
			.id(0)
			.options({ windowSize: 26 })
			.merge((d, c) => { d.ema26 = c; })
			.accessor(d => d.ema26);

		const ema12 = ema()
			.id(1)
			.options({ windowSize: 12 })
			.merge((d, c) => { d.ema12 = c; })
			.accessor(d => d.ema12);

		const macdCalculator = macd()
			.options({
				fast: 12,
				slow: 26,
				signal: 9,
			})
			.merge((d, c) => { d.macd = c; })
			.accessor(d => d.macd);

		initialData.forEach(line => {
			line.date = dayjs(line.date).toDate();
		});
	

		const calculatedData = macdCalculator((elder(ha(ema20(initialData)))));

		console.log("calculatedData.......................", calculatedData)

		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);

		const r = scaleLinear()
			.range([2, 20])
			.domain(extent(data, (symbol) => {}));

		const f = scaleOrdinal(schemeCategory10)
			.domain(set(data.map(d => d.date)));

		const fill = d => f([{...d.percent}]);
		const radius = (d, symbol) => r(d.percent[symbol], symbol);

		const fGroupBar = scaleOrdinal(schemeCategory10)
			.domain(set(GroupDataMock.map(d => d.symbol)));

		const fillGroupBar = (d, i) => fGroupBar(i);

		function tooltipContent(ys) {
			return ({ currentItem, xAccessor }) => {
			  return {
				x: dateFormat(xAccessor(currentItem)),
				y: [
				  {
					label: currentItem.winning
						? 'Win' 
						: currentItem.losing
						? 'Lose' 
						: '',
					value: currentItem.winning 
						? numberFormat(currentItem.winning) 
						: currentItem.losing
						? numberFormat(currentItem.losing) 
						: ''
				  }
				].filter(line => line.value)
			  };
			};
		}

		return (
		<div>
			<ChartCanvas ratio={ratio} width={width} height={250}
				margin={{ left: 70, right: 70, top: 20, bottom: 50 }} type={type}
				seriesName="Hunter Violette - Hei Kin Ashi"
				data={data}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
				xScale={xScale}
				padding={{ left: 20, right: 20 }}
			>
				<Chart id={1}
					yExtents={[d => {
						return multiSymbol.map(symbol => {
							return d.percent[symbol];
						});
					}, ema20.accessor()] }
					yMousePointerRectWidth={45}
					padding={{ top: 30, bottom: 30 }}>
					<XAxis axisAt="bottom" orient="bottom" ticks={2} tickFormat={format(",d")} stroke="white" tickStroke="white"/>
					<YAxis axisAt="right" orient="right" stroke="white" tickStroke="white"/>
					{multiSymbol.map(symbol => {
						return (
							// <LineSeries 
							// 	yAccessor={d => {
							// 			if (d.percent[symbol]) {
							// 				return d.percent[symbol]
							// 			}
							// 			return
							// 		}} 
							// 	stroke="#ff7f0e"
							// />
							<LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()}/>
							// <ScatterSeries key={`ScatterSeries-${symbol}`} yAccessor={d => {
							// 		if (d.percent[symbol]) {
							// 			return d.percent[symbol]
							// 		}
							// 		return
							// 	}} 
							// 	marker={CircleMarker}
							// 	markerProps={{ r: d => radius(d, symbol), fill: fill }}
							// />
						)	
					})}
					{multiSymbol.map(symbol => {
						return (
							<CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />
						)})
					}

					
					{/* <HoverTooltip
						fontFill="#000000"
						stroke="#295d8a"
						bgFill="#295d8a"
						fill="#f8f8f8"
						bgOpacity="0.3"
						yAccessor={ema50.accessor()}
						tooltipContent={tooltipContent()}
						fontSize={15}
						backgroundShapeCanvas={backgroundShapeCanvas}
					/>	 */}
				</Chart>
			</ChartCanvas>
			{/* <ChartCanvas ratio={ratio} width={width} height={250}
				margin={{ left: 70, right: 70, top: 20, bottom: 50 }} type={type}
				seriesName="Fruits"
				data={GroupDataMock}
				xAccessor={d => GroupDataMock.indexOf(d)}
				xScale={scaleLinear()}
				padding={{ left: 150, right: 150 }}>
				<Chart id={10}
					padding={{ top: 30, bottom: 30 }}
					yExtents={[0, d => [d.winning, d.losing]]}>
					<XAxis axisAt="bottom" orient="bottom"
						innerTickSize={0}
						tickFormat={i => GroupDataMock[i] && GroupDataMock[i].symbol} 
						stroke="white" tickStroke="white"/>
					<YAxis axisAt="right" orient="right" stroke="white" tickStroke="white"/>
					<GroupedBarSeries yAccessor={[d => d.winning, d => d.losing]}
						fill={fillGroupBar}
						spaceBetweenBar={3} />
				</Chart>
			</ChartCanvas> */}
		</div>
		);
	}
}

BubbleChart.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

BubbleChart.defaultProps = {
	type: "svg",
};
BubbleChart = fitWidth(BubbleChart);

export default BubbleChart;