import React, { useState, useEffect } from "react";
import OptimizationChartItem from './OptimizationChartItem'

const OptimizationChart = (props) => {
  const { 
    strategy,
    chartPeriod,
    multiSymbol,
    microStrategy,
    startDate,
    endDate,
  } = props;

  const [chartData, setChartData] = useState(null)
	
  useEffect(() => {
    const get_data = () => {
      const symbols = multiSymbol.map((symbol) => symbol.value);
      if (!symbols.length | !microStrategy) {
        return;
      }
      
      const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          'symbols': symbols,
          "macro": strategy.value,
          "micro": microStrategy.value,
          'start_date': startDate,
          'end_date': endDate,
        })
      };
      try {
        fetch(process.env.REACT_APP_BACKEND_URL+'/api/get_backtesting_result', requestOptions)
          .then(response => response.json())
          .then(data => {
            setChartData(data['chart_data'])
          })    
      } catch (error) {
        console.log(error)
      }
    }
    
    if (multiSymbol.length) {
      get_data()
    }
  }, [multiSymbol, microStrategy, startDate, endDate, strategy])
    
  const displayPerformanceChart = (type) => {
    return (
      <OptimizationChartItem type={type} data={chartData} multiSymbol={multiSymbol}/>
    )
  }

  return (
		<>
      {
				chartData == null ? <div>Loading...</div> :
          <>
            <div className="select-wrape">
              <div>
                <strong>{chartPeriod} [NASDAQ]</strong>
              </div>
            </div>
            {displayPerformanceChart()}
          </>
        }
		</>
  )
}

export default OptimizationChart