import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import { format } from "d3-format";
import dayjs from "dayjs";
import { withStyles } from "@material-ui/core";

import { ChartCanvas, Chart } from "react-stockcharts";
import { BarSeries, CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { timeIntervalBarWidth } from "react-stockcharts/lib/utils";
import { ToolTipText, OHLCTooltip } from "react-stockcharts/lib/tooltip";

import { fitWidth } from "react-stockcharts/lib/helper";
import { Annotate, LabelAnnotation } from "react-stockcharts/lib/annotation";
import { InteractiveYCoordinate } from "react-stockcharts/lib/interactive";

import {
	CrossHairCursor,
	EdgeIndicator,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";
import { last, toObject } from "react-stockcharts/lib/utils";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { elderRay, ema, macd, heikinAshi } from "react-stockcharts/lib/indicator";

class CandleChart extends React.Component {
  constructor(props) {
    super(props);
    this.getSignalValue = this.getSignalValue.bind(this);
    this.computeAnnotation = this.computeAnnotation.bind(this);
    this.addTextLable = this.addTextLable.bind(this);
    this.computeSignalValue = this.computeSignalValue.bind(this);
    this.props.deals.forEach(deal => {
      deal.ddate = new Date(dayjs(deal.ddate).format());
    });
    this.state = {
      enableInteractiveObject: true,
      textList_1: [],
      x: -200,
      y: -200,
      valueText: "$ 7,230.69",
      dateText: "Wednesday, Nov 22, 2017"
    };
    this.locale = d3.timeFormatLocale({
      dateTime: "%A, %e %B %Y г. %X",
      date: "%d.%m.%Y",
      time: "%H:%M:%S",
      periods: ["AM", "PM"],
      days: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ],
      shortDays: ["su", "mo", "tu", "we", "th", "fr", "sa"],
      months: [
        "january",
        "february",
        "march",
        "april",
        "may",
        "jun",
        "july",
        "august",
        "september",
        "october",
        "nowember",
        "december"
      ],
      shortMonths: [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec"
      ]
    });
    this.formatMillisecond = this.locale.format(".%L");
    this.formatSecond = this.locale.format(":%S");
    this.formatMinute = this.locale.format("%I:%M");
    this.formatHour = this.locale.format("%I %p");
    this.formatDay = this.locale.format("%d %b");
    this.formatWeek = this.locale.format("%b %d");
    this.formatMonth = this.locale.format("%B");
    this.formatYear = this.locale.format("%Y");
    this.multiformat = this.multiformat.bind(this);
  }

  getSignalValue() {
    return this.props.signal.value;
  }

  multiformat(date) {
    return (d3.timeSecond(date) < date
      ? this.formatMillisecond
      : d3.timeMinute(date) < date
      ? this.formatSecond
      : d3.timeHour(date) < date
      ? this.formatMinute
      : d3.timeDay(date) < date
      ? this.formatHour
      : d3.timeMonth(date) < date
      ? d3.timeWeek(date) < date
        ? this.formatDay
        : this.formatWeek
      : d3.timeYear(date) < date
      ? this.formatMonth
      : this.formatYear)(date);
  }

  computeAnnotation(dateLine) {
    console.log("dateLine=======================================", dateLine)
    const deal = this.props.deals.filter(
      dealLine => dateLine.date.getTime() === dealLine.ddate.getTime()
    );
    if (deal.length > 0) {
      return deal[0].action;
    }
  }

  computeSignalText() {
    switch (this.props.signal.action) {
      case "short":
        return "Open short";
      case "long":
        return "Open long";
      case "closeLong":
        return "Close long";
      default:
        return "Close short";
    }
  }

  getColor(line) {
    return line.close > line.open
      ? "rgba(34, 164, 110, 0.6)"
      : "rgba(204, 64, 96, 0.6)";
  }

  computeAnnotationScale(datum) {
    if (this.props.signal.action.search(/close/) >= 0) {
      return datum.high * 1.03;
    }
    return datum.high;
  }

  computeSignalValue() {
    return this.props.signal.value;
  }

  componentDidMount() {
    this.node.subscribe("CandleChart", { listener: this.handleEvents });
  }

  componentWillUnmount() {
    this.node.unsubscribe("CandleChart");
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
      x: +e.xScale(e.datum.date),
      y: +e.yScale(e.datum.high) - 24,
      valueText: e.datum.high,
      dateText: dateElem
    });
  }

  isIncludeIndicators(indicator) {
		if (this.props.indicators) {
			return this.props.indicators.filter((e) => e.value === indicator).length;
		}
		return 0;
	}

  calculateHeight () {
    let index = 1
    if (this.props.indicators) {
      if (this.props.indicators.length > 1) {
        index = this.props.indicators.length
      }
    }
    return 400 + index * 1 * 100
  }

  calculateMainHeightOffset() {
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
				return 85 + (this.props.indicators.length - 1) * 25
			}
		}
		return 85
	}
	
	calculateTooltipOffset1() {
		if (!this.props.isHomePage) {
			return 0;
		}
		if ( this.props.indicators ) {
			if (this.props.indicators.length > 1) {
				return 50 + (this.props.indicators.length - 1) * 25
			}
		}
		return 50
	}

  render() {
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
      y: ({ yScale, datum }) => yScale(datum.high * 1.04)
    };

    const yCloseProps = {
      y: ({ yScale, datum }) => yScale(datum.high * 1.002)
    };

    const longClose = {
      ...longFillProps,
      ...fontProps,
      ...yCloseProps,
      text: "\u25B2",
      tooltip: "Close long"
    };

    const shortClose = {
      ...shortFillProps,
      ...fontProps,
      ...yCloseProps,
      text: "\u25B2",
      tooltip: "Close short"
    };

    const long = {
      ...longFillProps,
      ...fontProps,
      ...yOpenProps,
      text: "\u25B2",
      tooltip: "Open long",
      rotate: 180
    };

    const short = {
      ...shortFillProps,
      ...fontProps,
      ...yOpenProps,
      text: "\u25B2",
      tooltip: "Open short",
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

    const { type, data: initialData, width, ratio, gridProps } = this.props;
    const calculatedData = macdCalculator((elder(ha(initialData))));
    console.log("initialData======================================================>", initialData)
		const xScaleProvider = discontinuousTimeScaleProvider
    .inputDateAccessor(d => d.date);
		const {
      data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);
    console.log("data======================================================>", data)

    const margin = { left: 70, right: 70, top: 20, bottom: 30 };
    data.forEach(line => {
      line.date = dayjs(line.date).toDate();
    });
    const height = 400;
    const gridHeight = height - margin.top - margin.bottom;
    const gridWidth = width - margin.left - margin.right;
    const signalColor =
      this.props.signal.action.search(/long/i) !== -1 ? "#1F9D55" : "#cc4060";
    const signalMarker = {
      ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
      stroke: signalColor,
      bgFill: signalColor,
      bgOpacity: 1,
      textFill: "#FFFFFF",
      text: this.computeSignalText(),
      textBox: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.textBox,
        left: width - 220,
        height: 22,
        padding: { left: 5, right: 5 },
        closeIcon: {
          ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.textBox
            .closeIcon,
          padding: { left: 0, right: 5 },
          width: 0
        }
      },
      edge: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
        stroke: signalColor,
        fill: signalColor,
        displayFormat: d3.format(".2f")
      }
    };
    const showGrid = true;
    const gridStroke = {
        tickStroke: "#ffffff",
        tickStrokeOpacity: 0.2
    };
    // const yGrid = showGrid
    //   ? {
    //       innerTickSize: -1 * gridWidth,
    //       ...gridStroke
    //     }
    //   : {};
    // const xGrid = showGrid
    //   ? {
    //       innerTickccSize: -1 * gridHeight,
    //       ...gridStroke
    //     }
    //   : {};
    const actionStateNames = {
      closeLong: "closeLong",
      closeShort: "closeShort",
      long: "long",
      short: "short"
    };

    const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 150)]);
    const xExtents = [start, end];
    // const xExtents = [
    //   this.props.data[0].date,
    //   this.props.data[this.props.data.length - 1].date
    // ];

    return (
      <ChartCanvas
        height={this.calculateHeight()}
        ratio={ratio}
        width={width}
        margin={{ left: 70, right: 70, top: 10, bottom: 30 }}
        type={type}
        seriesName="MSFT"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
        ref={node => {
          this.node = node;
        }}
      >
        <Chart 
          id={1}
          height={this.isIncludeIndicators('VOLUME') ? 250 : 250}
          yExtents={[d => [d.high, d.low], ema26.accessor(), ema12.accessor()]}
          padding={{ top: 10, bottom: 20 }}
        >
          <CandlestickSeries
            width={timeIntervalBarWidth(d3.timeHour)}
            fill={d =>
              d.close > d.open
                ? "rgba(34, 164, 110, 0.8)"
                : "rgba(204, 64, 96, 0.8)"
            }
            stroke={d =>
              d.close > d.open
                ? "rgba(34, 164, 110, 1)"
                : "rgba(204, 64, 96, 1)"
            }
            wickStroke={d =>
              d.close > d.open
                ? "rgba(34, 164, 110, 1)"
                : "rgba(204, 64, 96, 1)"
            }
            widthRatio={0.5}
          />
          <XAxis
            axisAt="bottom"
            orient="bottom"
            {...gridProps}
            ticks={4}
            showTicks={false}
            stroke="white" tickStroke="white"
            tickFormat={this.multiformat}
          />
          <YAxis
            axisAt="right"
            orient="right"
            ticks={5}
            {...gridProps}
            stroke="white" tickStroke="white"
            tickFormat={d3.format(".2f")}
          />
          <Annotate
            with={LabelAnnotation}
            when={d => this.computeAnnotation(d) === actionStateNames.closeLong}
            usingProps={longClose}
          />
          <Annotate
            with={LabelAnnotation}
            when={d =>
              this.computeAnnotation(d) === actionStateNames.closeShort
            }
            usingProps={shortClose}
          />
          <Annotate
            with={LabelAnnotation}
            when={d => this.computeAnnotation(d) === actionStateNames.long}
            usingProps={long}
          />
          <Annotate
            with={LabelAnnotation}
            when={d => this.computeAnnotation(d) === actionStateNames.short}
            usingProps={short}
          />
          <OHLCTooltip
            origin={[-40, 0]}
            xDisplayFormat={this.locale.format("%d-%m-%Y")}
          />
        </Chart>

        {this.isIncludeIndicators('VOLUME') && (
					<Chart id={2} height={150}
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
            
        <CrossHairCursor />
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
          <polygon
            points={`${this.state.x - 10},${this.state.y} ${this.state.x},
              ${this.state.y + 10} ${this.state.x + 10},${this.state.y}`}
            fill="#3D4977"
            stroke="#3D4977"
            strokeWidth="0"
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
      </ChartCanvas>
    );
  }
}

CandleChart.propTypes = {
  data: PropTypes.array.isRequired,
  deals: PropTypes.array.isRequired,
  signal: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired
};

CandleChart.defaultProps = {
  type: "hybrid"
};

CandleChart = fitWidth(CandleChart);

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
    // textShadow: "0 0 3px yellowgreen"
  },
  deal_red_shadowed: {
    // textShadow: "0 0 3px fuchsia"
  }
})(fitWidth(CandleChart));
