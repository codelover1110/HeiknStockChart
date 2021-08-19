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
        viewType,
        microStrategy,
        symbol,
        indicators,
        strategy,
        isHomePage,
        multiSymbol,
        tradeResultFile,
    } = props;
    // const [tablePrefix, setTablePrefix] = useState('')
    const [dbname, setDbname] = useState('')
	const [chartData, setChartData] = useState(null)
	const [dealData, setDealData] = useState([])
    
    useEffect(() => {
        const initDbNamebyMicroStrategy = () => {
            if (microStrategy === '1D2M') {
                setDbname('backtest_2_minute');
            } else if(microStrategy === '4D12M') {
                setDbname('backtest_12_minute');
            } else if(microStrategy === '30D1H') {
                setDbname('backtest_1_hour');
            } else if(microStrategy === '90D4H') {
                setDbname('backtest_4_hour');
            } else if(microStrategy === '90D12H') {
                setDbname('backtest_12_hour');
            } else if(microStrategy === '1Y1D') {
                setDbname('backtest_1_day');
            }
        }
        initDbNamebyMicroStrategy();
    }, [microStrategy])

    useEffect(() => {
        setChartData(null)      
    }, [viewType])

    useEffect(() => {
        if (symbol || multiSymbol.length) {
			get_data(symbol)
		}
    }, [dbname, viewType, symbol, multiSymbol, tradeResultFile])

    const get_data = (symbol) => {
        if (!dbname) {
            return;
        }

        if (viewType !== 'performance') {
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
						<TypeChooser >
                            {type => {
                                return (
                                    (isHomePage | (viewType !== 'performance'))
                                    ? <Chart type={type} data={chartData} deals={dealData} indicators={indicators} strategy={strategy} microStrategy={microStrategy} isHomePage={isHomePage}/>
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