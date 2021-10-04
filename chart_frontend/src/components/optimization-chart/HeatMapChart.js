import React, { useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts'

const HeatMapChart = (props) => {
  const generateData = (count, period) => {
    const randomArray = []
    for (let i = 0;i < count; i ++) {
      const min = Math.ceil(period.min)
      const max = Math.floor(period.max)
      randomArray.push(Math.floor(Math.random() * (max - min) + min))
    }
    return randomArray
  }

  const [series, setSeries] = useState([])

  const [chartOptions, setChartOptions] = useState(
    {
      chart: {
        height: 350,
        type: 'heatmap',
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 1
      },
      colors: ["#008FFB"],
      title: {
        align: 'center',
        text: 'HeatMap Chart Per Symbols',
        style: {
          color: '#FFFFFF'
        }
      },
    },
  )

  useEffect(() => {
    if (props.multiSymbol && props.multiSymbol.length) {
      const seriesBuffer = props.multiSymbol.map((symbol) => {
        return {
          name: symbol.value,
          data: generateData(20, {
            min: -30,
            max: 55
          })
        }
      }) 
      console.log('props.symbols', seriesBuffer)
      setSeries(seriesBuffer)
    }
  }, [props.multiSymbol])

  return (
    <div id='chart'>
      <ReactApexChart
        options={chartOptions}
        series={series}
        type='heatmap'
        height={350}
      />
    </div>
  )
}

export default HeatMapChart