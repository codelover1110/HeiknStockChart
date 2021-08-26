import { MultiLineChart } from './MultiLineChart'
import GroupApexBar from './GroupBarChart'

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";
import { fitWidth } from "react-stockcharts/lib/helper";
class BubbleChart extends React.Component {
	render() {

		
		const { data: mainData } = this.props;

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