import React, { useState, useEffect } from "react";
import Chart from '../Chart';
// import Chart from '../TestChart';
import { TypeChooser } from "react-stockcharts/lib/helper";
import { tsvParse } from  "d3-dsv";
import { timeParse } from "d3-time-format";

import { getData } from "../utils"

const StockChart = (props) => {
    const { period, symbol, indicators, strategy, isShowStrategy, isHomePage } = props;
    const [tablePrefix, setTablePrefix] = useState('')
    const [dbname, setDbname] = useState('')
	const [chartData, setChartData] = useState(null)
    const [isMock,] = useState(false)

    useEffect(() => {
        const initPeriodPrefix = () => {
            if (period === '1D2M') {
                setTablePrefix('2_minute_');
            } else if(period === '4D12M') {
                setTablePrefix('12_minute_');
            } else if(period === '30D1H') {
                setTablePrefix('1_hour_');
            } else if(period === '90D4H') {
                setTablePrefix('4_hour_');
            } else if(period === '90D12H') {
                setTablePrefix('12_hour_');
            } else if(period === '1Y1D') {
                setTablePrefix('1_day_');
            }
        }
        
        const initDbNamebyPeriod = () => {
            if (period === '1D2M') {
                setDbname('2m_stocks');
            } else if(period === '4D12M') {
                setDbname('12m_stocks');
            } else if(period === '30D1H') {
                setDbname('1h_stocks');
            } else if(period === '90D4H') {
                setDbname('4h_stocks');
            } else if(period === '90D12H') {
                setDbname('12h_stocks');
            } else if(period === '1Y1D') {
                setDbname('1d_stocks');
            }
        }
        initPeriodPrefix();
        initDbNamebyPeriod();
    }, [period])

    useEffect(() => {
		if (symbol) {
			let table_name = tablePrefix + symbol
            get_data(table_name)
		}
    }, [tablePrefix, symbol])

    function parseData(parse) {
        return function(d) {
            d.date = parse(d.date);
            d.open = +d.open;
            d.high = +d.high;
            d.low = +d.low;
            d.close = +d.close;
            d.volume = +d.volume;
    
            return d;
        };
    }

    const get_data = (table_name) => {
        const requestOptions = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				'db_name': dbname,
				'table_name': table_name
			})
		};

        if (!dbname) {
            return;
        }

        if (!isMock) {
            fetch(process.env.REACT_APP_BACKEND_URL+'/api/get_data', requestOptions)
                .then(response => response.json())
                .then(data => {
                    data['chart_data']['columns'] = ["date", "open", "high", "low", "close", "volume", "split", "dividend", "absoluteChange", "percentChange"]
                    data['chart_data'].map((x) => {
                        let converDate = new Date(x.date)
                        x.date = converDate
                    })
                    // console.log("--------------------------")
                    // console.log(data['chart_data'])
                    setChartData(data['chart_data'])
                })
        } else {
            getData().then(data => {
                setChartData(data)
                // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
                // console.log(data)
            })
        }

	}

	return (
		<>
			{
				chartData == null ? <div>Loading...</div> :
					<>
						<div className="select-wrape">
                            <div>
								<strong>{period} [NASDAQ]</strong>
							</div>
						</div>
						<TypeChooser >
							{type => <Chart type={type} data={chartData} indicators={indicators} strategy={strategy} isShowStrategy={isShowStrategy} isHomePage={isHomePage}/>}
						</TypeChooser>
					</>

			}
		</>

	)
}

export default StockChart