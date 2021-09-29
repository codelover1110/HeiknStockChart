
import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import dayjs from "dayjs";
import { ChartCanvas, Chart } from "react-stockcharts";
import {
	BarSeries,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { ema, macd } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { DrawingObjectSelector } from "react-stockcharts/lib/interactive";
import { last, toObject } from "react-stockcharts/lib/utils";
import {
	saveInteractiveNodes,
	getInteractiveNodes,
} from "./interactiveutils";

class CandleStickChartWithEquidistantChannel extends React.Component {
	constructor(props) {
		super(props);
		this.onKeyPress = this.onKeyPress.bind(this);
		// this.onDrawComplete = this.onDrawComplete.bind(this);
		this.saveInteractiveNode = this.saveInteractiveNode.bind(this);
		this.saveCanvasNode = this.saveCanvasNode.bind(this);
		this.handleSelection = this.handleSelection.bind(this);

		this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
		this.getInteractiveNodes = getInteractiveNodes.bind(this);

		this.state = {
			enableInteractiveObject: true,
			channels_1: [],
			channels_3: [],
		};
	}
	saveInteractiveNode(node) {
		this.node = node;
	}
	saveCanvasNode(node) {
		this.canvasNode = node;
	}
	componentDidMount() {
		document.addEventListener("keyup", this.onKeyPress);
	}
	componentWillUnmount() {
		document.removeEventListener("keyup", this.onKeyPress);
	}
	handleSelection(interactives) {
		const state = toObject(interactives, each => {
			return [
				`channels_${each.chartId}`,
				each.objects,
			];
		});
		this.setState(state);
	}
	// onDrawComplete(channels_1) {
	// 	// this gets called on
	// 	// 1. draw complete of drawing object
	// 	// 2. drag complete of drawing object
	// 	this.setState({
	// 		enableInteractiveObject: false,
	// 		channels_1
	// 	});
	// }
	onKeyPress(e) {
	}
	render() {
		const ema26 = ema()
			.id(0)
			.options({ windowSize: 26 })
			.merge((d, c) => { d.ema26 = c; })
			.accessor(d => d.ema26);

		const ema12 = ema()
			.id(1)
			.options({ windowSize: 12 })
			.merge((d, c) => {d.ema12 = c;})
			.accessor(d => d.ema12);

		const macdCalculator = macd()
			.options({
				fast: 12,
				slow: 26,
				signal: 9,
			})
			.merge((d, c) => {d.macd = c;})
			.accessor(d => d.macd);

		const { type, data: initialData, width, ratio } = this.props;
    initialData.dataPoints.forEach(line => {
			line.date = dayjs(line.calendarDate).toDate();
		});
		const { channels_1, channels_3 } = this.state;

		const calculatedData = macdCalculator(ema12(ema26(initialData.dataPoints)));
		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);

		const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 150)]);
		const xExtents = [start, end];

		return (
			<ChartCanvas ref={this.saveCanvasNode}
				height={50}
				width={width}
				ratio={ratio}
				margin={{ left: 0, right: 0, top: 20, bottom: 30 }}
				type={type}
				seriesName="MSFT"
				data={data}
				xScale={xScale}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
				xExtents={xExtents}
			>
				
				<Chart id={3} height={50}
					yExtents={[d => d.value]}
					// origin={(w, h) => [0, h - 300]}
				>
					{/* <XAxis axisAt="bottom" orient="bottom"/>
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")}/> */}

          			{/* <MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="left"
						orient="left"
						displayFormat={format(".4s")} /> */}

					<BarSeries yAccessor={d => d.value} fill={d => initialData.color} baseAt={(xScale, yScale, d) => yScale(0)} />
				</Chart>
					{/* <CrossHairCursor /> */}
					{/* <DrawingObjectSelector
						enabled={!this.state.enableInteractiveObject}
						getInteractiveNodes={this.getInteractiveNodes}
						drawingObjectMap={{
							EquidistantChannel: "channels"
						}}
						onSelect={this.handleSelection}
					/> */}
			</ChartCanvas>
		);
	}
}

CandleStickChartWithEquidistantChannel.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithEquidistantChannel.defaultProps = {
	type: "svg",
};

CandleStickChartWithEquidistantChannel = fitWidth(CandleStickChartWithEquidistantChannel);

export default CandleStickChartWithEquidistantChannel;
