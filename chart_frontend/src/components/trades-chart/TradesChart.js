
import React from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core";
import * as d3 from "d3";
import { format } from "d3-format";
import dayjs from "dayjs";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	BarSeries,
	CandlestickSeries,
	LineSeries,
	MACDSeries,
	StraightLine,
	RSISeries,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	EdgeIndicator,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	MovingAverageTooltip,
	OHLCTooltip,
	ToolTipText,
	MACDTooltip,
	SingleValueTooltip,
	RSITooltip,
} from "react-stockcharts/lib/tooltip";
import { atr, elderRay, ema, macd, heikinAshi, rsi } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { EquidistantChannel, DrawingObjectSelector } from "react-stockcharts/lib/interactive";
import { last, toObject } from "react-stockcharts/lib/utils";
import {
	saveInteractiveNodes,
	getInteractiveNodes,
} from "../Interactiveutils";
import {
	Label,
	Annotate,
	LabelAnnotation,
	SvgPathAnnotation,
	buyPath,
	sellPath,
} from "react-stockcharts/lib/annotation";
import algo from "react-stockcharts/lib/algorithm";

const macdAppearance = {
	stroke: {
		macd: "#FF0000",
		signal: "#00F300",
	},
	fill: {
		divergence: "#4682B4"
	},
};

const rsiAppearance = {
	stroke: {
		macd: "#FF0000",
		signal: "#00F300",
	},
	fille: {
		bearPower: "#4682B4"
	}
};

// common stock chart
class CandleStickChartWithEquidistantChannel extends React.Component {
	constructor(props) {
		super(props);
		this.addTextLable = this.addTextLable.bind(this);
		this.onKeyPress = this.onKeyPress.bind(this);
		this.onDrawComplete = this.onDrawComplete.bind(this);
		this.saveInteractiveNode = this.saveInteractiveNode.bind(this);
		this.saveCanvasNode = this.saveCanvasNode.bind(this);
		this.handleSelection = this.handleSelection.bind(this);

		this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
		this.getInteractiveNodes = getInteractiveNodes.bind(this);

		this.state = {
			enableInteractiveObject: true,
			x: -200,
      		y: -200,
			channels_1: [],
			channels_3: [],
			valueText: "",
      		dateText: "",
			status: '',
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
		this.canvasNode.subscribe("CandleStickChartWithEquidistantChannel", { listener: this.handleEvents });
	}
	componentWillUnmount() {
		this.canvasNode.unsubscribe("CandleStickChartWithEquidistantChannel");
		document.removeEventListener("keyup", this.onKeyPress);
	}

	handleEvents = (type, moreProps, state) => {
		if (type === "zoom") {
		  this.handleZoom();
		}
		if (type === "mousedown") {
		  this.hideTextLabel();
		}
	};

	handleZoom() {
		if (this.state.x !== -200 && this.state.y !== -200) {
		  this.hideTextLabel();
		}
	}

	hideTextLabel() {
		this.setState({
		  x: -200,
		  y: -200
		});
	}

	addTextLable(e) {
		const formatter = new Intl.DateTimeFormat("en", { month: "short" });
		const formatterW = new Intl.DateTimeFormat("en", { weekday: "long" });
		const month2 = formatter.format(e.datum.date);
		const week2 = formatterW.format(e.datum.date);
		const dateElem = `${week2}, ${month2} ${e.datum.date.getDate()}, ${e.datum.date.getFullYear()}`;
		this.setState({
			x: 500,
			y: 30,
			valueText: e.datum.high,
			dateText: dateElem,
			status: e.datum.action,
		});
		// this.setState({
		// 	x: +e.xScale(e.datum.date),
		// 	y: +e.yScale(e.datum.high) - 24,
		// 	valueText: e.datum.high,
		// 	dateText: dateElem
		// });
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

	isIncludeIndicators(indicator) {
		if (this.props.indicators) {
			return this.props.indicators.filter((e) => e.value === indicator).length;
		}
		return 0;
	}

	onDrawComplete(channels_1) {
		// this gets called on
		// 1. draw complete of drawing object
		// 2. drag complete of drawing object
		this.setState({
			enableInteractiveObject: false,
			channels_1
		});
	}
	onKeyPress(e) {
		const keyCode = e.which;
		console.log(keyCode);
		switch (keyCode) {
			case 46: { // DEL
				const channels_1 = this.state.channels_1
					.filter(each => !each.selected);
				const channels_3 = this.state.channels_3
					.filter(each => !each.selected);

				this.canvasNode.cancelDrag();
				this.setState({
					channels_1,
					channels_3,
				});
				break;
			}
			case 27: { // ESC
				this.node.terminate();
				this.canvasNode.cancelDrag();

				this.setState({
					enableInteractiveObject: false
				});
				break;
			}
			case 68:   // D - Draw drawing object
			case 69: { // E - Enable drawing object
				this.setState({
					enableInteractiveObject: true
				});
				break;
			}
		}
	}

	calculateHeight () {
		if (this.props.isHomePage) {
			return 400;
		}
		let index = 1
		if (this.props.indicators) {
			if (this.props.indicators.length > 1) {
				index = this.props.indicators.length
			}
		}
		return 500 + index * 1 * 100
	}

	calculateOffset (indicator) {
		if (this.props.isHomePage) {
			if (indicator === 'MACD') {
				if (this.isIncludeIndicators(indicator)) {
					if (this.props.indicators.length > 1) {
						return this.props.indicators.length * 50
					}
					return 50;
				}
			}
	
			if (indicator === 'RSI') {
				if (this.isIncludeIndicators(indicator)) {
					if (this.isIncludeIndicators('SMA')) {
						return 150;
					}
					return 100;
				}
			}
	
			if (indicator === 'SMA') {
				return 100;
			}
	
			return 0	
		}
		if (indicator === 'MACD') {
			if (this.isIncludeIndicators(indicator)) {
				if (this.props.indicators.length > 1) {
					return this.props.indicators.length * 100
				}
				return 100;
			}
		}

		if (indicator === 'RSI') {
			if (this.isIncludeIndicators(indicator)) {
				if (this.isIncludeIndicators('SMA')) {
					return 250;
				}
				return 150;
			}
		}

		if (indicator === 'SMA') {
			return 100;
		}

		return 0
	}

	calculateMainHeightOffset() {
		if (this.props.isHomePage) {
			return 250
		}
		if ( this.props.indicators ) {
			if (this.props.indicators.length > 1) {
				return 300 + (this.props.indicators.length - 1) * 100
			}
		}
		return 300
	}

	calculateTooltipOffset0() {
		if (!this.props.isHomePage) {
			return 0;
		}
		if ( this.props.indicators ) {
			if (this.props.indicators.length > 1) {
				return 10
			}
		}
		return 15
	}
	
	calculateTooltipOffset1() {
		if (!this.props.isHomePage) {
			return 0;
		}
		if ( this.props.indicators ) {
			if (this.props.indicators.length > 1) {
				return 10
			}
		}
		return 15
	}

	computeAnnotation(dateLine) {
		const deal = this.props.deals.filter(
			dealLine => {
				return dateLine.date.getTime() === dealLine.ddate.getTime()
			}
			);
			
		if (deal.length > 0) {
			return deal[0].action;
		}
	}

	render() {

		const ema20 = ema()
			.id(0)
			.options({ windowSize: 13 })
			.merge((d, c) => { d.ema20 = c; })
			.accessor(d => d.ema20);

		const ema50 = ema()
			.id(2)
			.options({ windowSize: 50 })
			.merge((d, c) => { d.ema50 = c; })
			.accessor(d => d.ema50);

		const buySell = algo()
			.windowSize(2)
			.accumulator(([prev, now]) => {
				const { ema20: prevShortTerm, ema50: prevLongTerm } = prev;
				const { ema20: nowShortTerm, ema50: nowLongTerm } = now;
				if (prevShortTerm < prevLongTerm && nowShortTerm > nowLongTerm) return "LONG";
				if (prevShortTerm > prevLongTerm && nowShortTerm < nowLongTerm) return "SHORT";
			})
			.merge((d, c) => { d.longShort = c; });

		const actionStateNames = {
			buy: "BUY",
			sell: "SELL"
		};

		const longFillProps = {
			stroke: "#22a46e",
			fill: "#22a46e",
			className: this.props.classes.deal_green_shadowed
		  };
	  
		  const shortFillProps = {
			stroke: "#cc4060",
			fill: "#cc4060",
			className: this.props.classes.deal_red_shadowed
		  };
	  
		  const fontProps = {
			fontFamily: "Material Icons",
			fontSize: 24,
			fontWeight: "normal",
			opacity: 1,
			onClick: this.addTextLable
		  };
	  
		const yOpenProps = {
		y: ({ yScale, datum }) => yScale(datum.high * 1.04 - 100)
		};
	  
		const yCloseProps = {
		y: ({ yScale, datum }) => yScale(datum.high * 1.04 - 100)
		};
	  
		const buyTooltipProps = {
			tooltip: (o) => {
				return `Buy: ${o.date} \n Price: ${o.price}`
			}
		}
		
		const sellTooltipProps = {
			tooltip: (o) => {
				return `Sell: ${o.date}\nPrice: ${o.price}`
			}
		}

		const buy = {
			...longFillProps,
			...fontProps,
			...yOpenProps,
			text: "\u25B2",
			...buyTooltipProps,
			rotate: 180
		};
	  
		  const sell = {
			...shortFillProps,
			...fontProps,
			...yCloseProps,
			...sellTooltipProps,
			text: "\u25B2",
			rotate: 180
		};

		const elder = elderRay();
		const ha = heikinAshi();
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

		const rsiCalculator = rsi()
		.options({ windowSize: 14 })
		.merge((d, c) => {d.rsi = c;})
		.accessor(d => d.rsi);
			
		const atr14 = atr()
		.options({ windowSize: 14 })
		.merge((d, c) => {d.atr14 = c;})
		.accessor(d => d.atr14);	

		const { type, data: initialData, width, ratio, indicators } = this.props;

		const { channels_1 } = this.state;

		this.props.deals.forEach(deal => {
			deal.ddate = new Date(dayjs(deal.ddate).format());
		});	

		initialData.forEach(line => {
			line.date = dayjs(line.date).toDate();
		  });

		const margin = { left: 80, right: 80, top: 30, bottom: 50 };  

		const height = 400;

		const [yAxisLabelX, yAxisLabelY] = [width - margin.left - 40, margin.top + (height - margin.top - margin.bottom) / 2];
		
		const calculatedData = macdCalculator((elder(ha(rsiCalculator(atr14(initialData))))));
		
		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);


		const defaultAnnotationProps = {
			onClick: console.log.bind(console),
		};

		const longAnnotationProps = {
			...defaultAnnotationProps,
			y: ({ yScale, datum }) => { return yScale(datum.low) - this.calculateTooltipOffset0() },
			fill: "#006517",
			path: buyPath,
			tooltip: (e) => `Buy: ${e.low}`,
		};

		const shortAnnotationProps = {
			...defaultAnnotationProps,
			y: ({ yScale, datum }) => { return yScale(datum.high) - this.calculateTooltipOffset1()},
			fill: "#FF0000",
			path: sellPath,
			tooltip: (e) => `Sell: ${e.high}`,
		};

		const start = xAccessor(last(data));
		const periodIndex = this.props.period === '1D2M' 
			? 15
			: this.props.period === '4D12M'
			? 30
			: this.props.period === '30D1H'
			? 90
			: this.props.period === '90D4H'
			? 200
			: this.props.period === '90D12H'
			? 200 : 1000
		
		// const end = xAccessor(data[Math.max(0, data.length - periodIndex)]);
		const end = xAccessor(data[Math.max(0, data.length - 150)]);
		const xExtents = [start, end];
		// console.log("this.props.data.length", this.props.data[1000].date)
		// const xExtents = [
		// 	this.props.data[0].date,
		// 	this.props.data[this.props.data.length-1].date
		// ];
		// console.log("xExtents", last(data).date, data[Math.max(0, data.length - 150)].date)
		// console.log("xExtents1", this.props.data[0].date, this.props.data[this.props.data.length - 1].date)
		
		const xDisplayFormatProps = {
			xDisplayFormat: timeFormat("%Y-%m-%d-%H-%M-%S"),
		}

		const RSIStrokeDashArray = {
			opacity: {
				top: 0,
				middle: 0,
				bottom: 0
			},
		};

		const SMATooltipProps = {
			valueFill: '#ffffff'
		}

		return (
			<ChartCanvas
				height={this.calculateHeight()}
				width={width}
				ratio={ratio}
				margin={{ left: 70, right: 70, top: 20, bottom: 30 }}
				type={type}
				seriesName="MSFT"
				data={data}
				xExtents={xExtents}
				xScale={xScale}
				displayXAccessor={displayXAccessor}
				xAccessor={xAccessor}
				ref={node => {
					this.canvasNode = node;
				}}
				redraw={true}
			>
				<Chart id={1}
					height={
						!this.props.isHomePage 
						? this.isIncludeIndicators('VOLUME') ? 250 : 400
						: this.props.indicators.length > 0 ? 100 : 300
					}
					yExtents={[d => [d.high, d.low], ema20.accessor(), ema50.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
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

					<EdgeIndicator itemType="last" orient="right" edgeAt="right"
						yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>

					<OHLCTooltip origin={[-40, 0]}/>
					<MovingAverageTooltip
						onClick={e => console.log(e)}
						origin={[-38, 15]}
						options={[
							{
								yAccessor: ema20.accessor(),
								type: "EMA",
								stroke: ema20.stroke(),
								windowSize: ema20.options().windowSize,
							},
							{
								yAccessor: ema50.accessor(),
								type: "EMA",
								stroke: ema50.stroke(),
								windowSize: ema50.options().windowSize,
							},
						]}
						/>

					<Annotate with={SvgPathAnnotation} when={d => d.longShort === "LONG"}
						usingProps={longAnnotationProps} />
					<Annotate with={SvgPathAnnotation} when={d => d.longShort === "SHORT"}
						usingProps={shortAnnotationProps} />

				</Chart>
				{this.isIncludeIndicators('VOLUME') && (
					<Chart id={2} height={!this.props.isHomePage ? 100 : 70}
						yExtents={[d => d.volume]}
						origin={(w, h) => [0, h - this.calculateMainHeightOffset()]}
						padding={{ top: 10, bottom: 10 }}
					>
						<XAxis axisAt="bottom" orient="bottom" stroke="white" tickStroke="white" />
						<YAxis axisAt="right" orient="right" ticks={5} tickFormat={format(".2s")} stroke="white" tickStroke="white" />

						<MouseCoordinateY
							at="left"
							orient="left"
							displayFormat={format(".4s")} />

						<BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />
					</Chart>
				)}
				{this.isIncludeIndicators('MACD') && (
					<Chart id={3} 
						height={!this.props.isHomePage ? 100 : 70}
						yExtents={macdCalculator.accessor()}
						origin={(w, h) => [0, h - this.calculateOffset('MACD')]} padding={{ top: 30, bottom: 10 }}
					>
						<XAxis axisAt="bottom" orient="bottom" stroke="white" tickStroke="white" />
						<YAxis axisAt="right" orient="right" ticks={2} stroke="white" tickStroke="white" />

						<MouseCoordinateX
							at="bottom"
							orient="bottom"
							displayFormat={timeFormat("%Y-%m-%d")} />
						<MouseCoordinateY
							at="right"
							orient="right"
							displayFormat={format(".2f")} />

						<MACDSeries yAccessor={d => d.macd}
							{...macdAppearance} />
						<MACDTooltip
							origin={[-38, this.props.isHompage ? 20 : 30]}
							yAccessor={d => d.macd}
							options={macdCalculator.options()}
							appearance={macdAppearance}
						/>
					</Chart>
				)}
				{this.isIncludeIndicators('RSI') && (
					<Chart id={4} 
						height={!this.props.isHomePage ? 100 : 70}
						yExtents={[0, d => elder.accessor()(d) && elder.accessor()(d).bearPower]}
						origin={(w, h) => [0, h - this.calculateOffset('RSI')]}
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
							yAccessor={d => elder.accessor()(d) && elder.accessor()(d).bearPower}
							baseAt={(xScale, yScale, d) => yScale(0)}
							fill={d => d.side === 'buy' ? '#800080' : d.side === 'sell' ? '#FFA500' : d.side === 'hold' ? '#00FF00' : '#FF0000'} />
						<StraightLine yValue={0} />

						<SingleValueTooltip
							yAccessor={d => elder.accessor()(d) && elder.accessor()(d).bearPower}
							yLabel="RSI - Bear power"
							yDisplayFormat={format(".2f")}
							appearance={rsiAppearance}
							{...SMATooltipProps}
							origin={[-40, this.props.isHompage ? 40 : 25]}/>
					</Chart>
				)}
				{this.isIncludeIndicators('SMA') && (
					<Chart id={5} 
						height={!this.props.isHomePage ? 100 : 70}
						yExtents={[0, d => elder.accessor()(d) && elder.accessor()(d).bearPower]}
						origin={(w, h) => [0, h - this.calculateOffset('SMA')]}
						padding={{ top: 30, bottom: 10 }}
					>
						<XAxis axisAt="bottom" orient="bottom" stroke="white" tickStroke="white"/>
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
							yAccessor={d => elder.accessor()(d) && elder.accessor()(d).bearPower}
							baseAt={(xScale, yScale, d) => yScale(0)}
							fill="#FF0000" />
						<StraightLine yValue={0} />

						<SingleValueTooltip
							yAccessor={d => elder.accessor()(d) && elder.accessor()(d).bearPower}
							yLabel="SMA - Bear power"
							yDisplayFormat={format(".2f")}
							origin={[-40, this.props.isHompage ? 30 : 20]}
							{...SMATooltipProps}
						/>
					</Chart>
				)}
				<CrossHairCursor />
				<DrawingObjectSelector
					enabled={!this.state.enableInteractiveObject}
					getInteractiveNodes={this.getInteractiveNodes}
					drawingObjectMap={{
						EquidistantChannel: "channels"
					}}
					onSelect={this.handleSelection}
				/>
			{!this.props.isHomePage && 
				<g>
					<rect
						className={this.props.classes.CandleChart}
						x={this.state.x - 100}
						y={this.state.y - 50}
						width="200"
						height="50"
						stroke="#3D4977"
						fill="#3D4977"
						rx="2"
						ry="2"
					/>
					<ToolTipText x={this.state.x} y={this.state.y}>
						<tspan
						className={this.props.classes.CandleChart_type_date}
						x={this.state.x}
						textAnchor="middle"
						dy="-1em"
						fill={"#fff"}
						onClick={this.hideTextLabel.bind(this)}
						>
						{this.state.dateText}
						{this.state.status}
						</tspan>
						<tspan
						className={this.props.classes.CandleChart_type_value}
						x={this.state.x}
						textAnchor="middle"
						key="value"
						dy="-1em"
						fill={"#fff"}
						onClick={this.hideTextLabel.bind(this)}
						>
						Price: {this.state.valueText}
						</tspan>
					</ToolTipText>
					</g>
				}
			</ChartCanvas>
		);
	}
}

CandleStickChartWithEquidistantChannel.propTypes = {
	data: PropTypes.array.isRequired,
	deals: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired
};
  
CandleStickChartWithEquidistantChannel.defaultProps = {
	type: "svg",
};

CandleStickChartWithEquidistantChannel = fitWidth(CandleStickChartWithEquidistantChannel);


  
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
})(fitWidth(CandleStickChartWithEquidistantChannel));
  