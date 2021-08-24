import { MultiLineChart } from './MultiLineChart'
import GroupApexBar from './GroupBarChart'

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
import { TypeChooser } from "react-stockcharts/lib/helper";

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
		if (mainData == null) {
			return <div>Loading...</div>
		}
		return (
			<div>
				<MultiLineChart chartData={mainData.percentEfficiency} isPercent={true}/>
				<TypeChooser>
					{type => <GroupApexBar type={type} data={mainData.winningLosing} isAverage={false}/>}
				</TypeChooser>
				<TypeChooser>
					{type => <GroupApexBar type={type} data={mainData.winningLosingAvg} isAverage={true}/>}
				</TypeChooser>
				<MultiLineChart chartData={mainData.percentEfficiency} isPercent={false}/>
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