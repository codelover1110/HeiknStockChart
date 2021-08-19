import React, { useState, useEffect } from "react";
import Chart from '../trades-chart/TradesChart';
import PerformanceChart from '../performance-chart/PerformanceChart'
import { TypeChooser } from "react-stockcharts/lib/helper";
// import ScatterMock from '../demo/ScatterMock'
// import GroupDataMock from '../demo/GroupMockData'
// import CandleChart from "../candle-chart/CandleChart";
// import Chart from '../Chart';
// import { CandleData, Deals, Signal } from "../demo/Demo";
// import MockData from '../demo/mock.json'
// import Chart from '../TestChart';
// import { tsvParse } from  "d3-dsv";
// import { timeParse } from "d3-time-format";

const StockChart = (props) => {
    const { 
        instance,
        period,
        symbol,
        indicators,
        strategy,
        isHomePage,
        multiSymbol,
        tradeResultFile,
    } = props;
    const [tablePrefix, setTablePrefix] = useState('')
    const [dbname, setDbname] = useState('')
	const [chartData, setChartData] = useState(null)
	const [dealData, setDealData] = useState([])
    
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
                setDbname('backtest_2_minute');
            } else if(period === '4D12M') {
                setDbname('backtest_12_minute');
            } else if(period === '30D1H') {
                setDbname('backtest_1_hour');
            } else if(period === '90D4H') {
                setDbname('backtest_4_hour');
            } else if(period === '90D12H') {
                setDbname('backtest_12_hour');
            } else if(period === '1Y1D') {
                setDbname('backtest_1_day');
            }
        }
        initPeriodPrefix();
        initDbNamebyPeriod();
    }, [period])

    useEffect(() => {
        if ((instance === 'performance') && (!multiSymbol.length)) {
            setChartData(null)    
        }
		if (symbol || multiSymbol.length) {
			get_data(symbol)
		}
    }, [instance, tablePrefix, symbol, multiSymbol, tradeResultFile])

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

    const get_data = (symbol) => {
        if (!dbname) {
            return;
        }

        if (instance !== 'performance') {
            const requestOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    'db_name': dbname,
                    'symbol': symbol,
                    'table_name': symbol,
                })
            };
            fetch(process.env.REACT_APP_BACKEND_URL+'/api/get_data', requestOptions)
            .then(response => response.json())
            .then(data => {
                data['chart_data']['columns'] = ["date", "open", "high", "low", "close", "volume", "split", "dividend", "absoluteChange", "percentChange"]
                data['chart_data'].map((x) => {
                    let converDate = new Date(x.date)
                    x.date = converDate
                })
                setChartData(data['chart_data'])
                setDealData(data['deals'])
            })
        } else {
            const symbols = multiSymbol.map((symbol) => symbol.value);
            if (!symbols.length | !tradeResultFile) {
                return;
            }
            const requestOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    'symbols': symbols,
                    'table_name': tradeResultFile,
                })
            };
            fetch(process.env.REACT_APP_BACKEND_URL+'/api/get_backtesting_data', requestOptions)
                .then(response => response.json())
                .then(data => {
                    setChartData(data['chart_data'])
                })
        }
    }

    return (
		<>
			{
				chartData == null ? <div>Loading...</div> :
					<>
						{/* <div className="select-wrape">
                            <div>
								<strong>{period} [NASDAQ]</strong>
							</div>
						</div> */}
						<TypeChooser >
                            {type => {
                                return (
                                    (isHomePage | (instance !== 'performance'))
                                    ? <Chart type={type} data={chartData} deals={dealData} indicators={indicators} strategy={strategy} period={period} isHomePage={isHomePage}/>
                                    : <PerformanceChart type={type} data={chartData} multiSymbol={multiSymbol.map((symbol) => symbol.value)}/>
                                )
                            }}
                        </TypeChooser>
                    </>

			}
		</>

	)
}

export default StockChart