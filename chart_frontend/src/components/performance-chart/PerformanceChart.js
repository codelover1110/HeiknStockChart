import { MultiLineChart } from './MultiLineChart'
import GroupApexBar from './GroupBarChart'

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";
import { fitWidth } from "react-stockcharts/lib/helper";
class PerformanceChart extends React.Component {
	render() {

		const { data: mainData } = this.props;

		if (mainData == null) {
			return <div>Loading...</div>
		} else {
			console.log('mainData?????????????????????', mainData)
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
				<TypeChooser>
					{type => <GroupApexBar type={type} data={mainData.totWinLose} isTotal={true} isAverage={false}/>}
				</TypeChooser>
				{/* <MultiLineChart chartData={mainData.percentEfficiency} isPercent={false}/> */}
			</div>
		);
	}
}

PerformanceChart.propTypes = {
	data: PropTypes.object.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

PerformanceChart.defaultProps = {
	type: "svg",
};
PerformanceChart = fitWidth(PerformanceChart);

export default PerformanceChart;