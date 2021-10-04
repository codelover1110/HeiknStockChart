import { MultiLineChart } from './MultiLineChart'
import HeatMapChart from './HeatMapChart'
import GroupApexBar from './GroupBarChart'

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";
import { fitWidth } from "react-stockcharts/lib/helper";
class OptimizationChartItem extends React.Component {
	render() {
    const { data: mainData, multiSymbol } = this.props;

		if (mainData == null) {
			return <div>Loading...</div>
		}

		return (
			<div>
				<HeatMapChart multiSymbol={multiSymbol}/>
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

OptimizationChartItem.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

OptimizationChartItem.defaultProps = {
	type: "svg",
};
OptimizationChartItem = fitWidth(OptimizationChartItem);

export default OptimizationChartItem;