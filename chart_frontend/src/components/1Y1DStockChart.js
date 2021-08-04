import React, { useState, useEffect } from "react";
import { render } from 'react-dom';
import Chart from './Chart';
import { TypeChooser } from "react-stockcharts/lib/helper";
import Select from 'react-select'
import 'react-select/dist/react-select.css';

const ChartComponent = () => {
	const [chartData, setChartData] = useState(null)
	const [selectedOptionTable, setSelectedOptionTable] = useState('AAPL');
	const [getDataFlag, setGetDataFlag] = useState(false)
	const [optionsTable, setOptionsTable] = useState([])


	useEffect(() => {
		if (!getDataFlag) {
			get_tables()
			// get_data('2_minute_AAL')
			get_data('1_day_AAPL')
			setGetDataFlag(true)
		}

	}, [chartData])

	const get_tables = () => {
		fetch("https://675eb930ade5.ngrok.io/api/tables")
				.then(response => response.json())
				.then(data => {
					let temp_data = []
					data.tables.map((x) => {
						temp_data.push({
							value: x,
							label: x
						});
					})
					setOptionsTable(temp_data)
				})
	}

	const handleChangeTable = (value) => {
        setSelectedOptionTable(value)
        if (value) {
            let table_name = '1_day_' + value.value
            get_data(table_name)
        }
	

	}

	const get_data = (table_name) => {
		const requestOptions = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				'db_name': '1d_stocks',
				'table_name': table_name
			})
		};

		fetch('https://675eb930ade5.ngrok.io/api/get_data', requestOptions)
			.then(response => response.json())
			.then(data => {
				data['chart_data']['columns'] = ["date", "open", "high", "low", "close", "volume", "split", "dividend", "absoluteChange", "percentChange"]
				let temp_data = []
				data['chart_data'].map((x) => {
					let converDate = new Date(x.date)
					x.date = converDate
				})
				setChartData(data['chart_data'])
			})
	}

	return (
		<>
			{
				chartData == null ? <div>Loading...</div> :
					<>
						<div className="select-wrape">
							
							<Select
								value={selectedOptionTable}
								onChange={handleChangeTable}
								options={optionsTable}
							/>
							<div>
								<strong>1Y 1D [NASDAQ]</strong>
							</div>
						</div>
						<TypeChooser >
							{type => <Chart type={type} data={chartData} />}
						</TypeChooser>
					</>

			}
		</>

	)
}

export default ChartComponent