import React, { useState, useEffect } from "react";
import Chart from '../trades-chart/TradesChart';
import BackTestChart from '../back-test/BackTestChart'
import ScatterMock from '../demo/ScatterMock'
import GroupDataMock from '../demo/GroupMockData'
import { TypeChooser } from "react-stockcharts/lib/helper";
// import CandleChart from "../candle-chart/CandleChart";
// import Chart from '../Chart';
// import { CandleData, Deals, Signal } from "../demo/Demo";
// import MockData from '../demo/mock.json'
// import Chart from '../TestChart';
// import { tsvParse } from  "d3-dsv";
// import { timeParse } from "d3-time-format";

import { getData } from "../utils"

const StockChart = (props) => {
    const { period, symbol, indicators, strategy, isHomePage } = props;
    const [tablePrefix, setTablePrefix] = useState('')
    const [dbname, setDbname] = useState('')
	const [chartData, setChartData] = useState(null)
	const [dealData, setDealData] = useState([])
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
                setDbname('backtesting_2_minute');
            } else if(period === '4D12M') {
                setDbname('backtesting_12_minute');
            } else if(period === '30D1H') {
                setDbname('backtesting_1_hour');
            } else if(period === '90D4H') {
                setDbname('backtesting_4_hour');
            } else if(period === '90D12H') {
                setDbname('backtesting_12_hour');
            } else if(period === '1Y1D') {
                setDbname('backtesting_1_day');
            }
        }
        initPeriodPrefix();
        initDbNamebyPeriod();
    }, [period])

    useEffect(() => {
		if (symbol) {
			let table_name = tablePrefix + symbol
            get_data(table_name, symbol)
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

    const get_data = (table_name, symbol) => {
        const requestOptions = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				'db_name': dbname,
                'symbol': symbol,
				'table_name': symbol,
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
                    setDealData(data['deals'])
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
                            {type => {
                                return (
                                    isHomePage 
                                    ? <Chart type={type} data={chartData} deals={dealData} indicators={indicators} strategy={strategy} period={period} isHomePage={isHomePage}/>
                                    : <BackTestChart type={type} data={ScatterMock} GroupDataMock={GroupDataMock}/>
                                )
                            }}
                        </TypeChooser>
                    </>

			}
		</>

	)
}

export default StockChart