import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const getWiningData = (chartData, isAverage, isTotal) => {
  return chartData.map((d) => isAverage ? d.avgWinning / 100 : !isTotal ? d.winning : d.totWinning)
}

const getLosingData = (chartData, isAverage, isTotal) => {
  return chartData.map((d) => isAverage ? d.avgLosing / 100 : !isTotal ? d.losing : d.totLosing)
}

const getSymbols = (chartData) => {
  return chartData.map((d) => d.symbol)
}

const optionCreator = (chartData, isAverage, isTotal) => {
  const formatAvg = (value) => {
    let text = value.toFixed(10)

    let parts = text.split('.');
    if (parts && parts.length > 0 && 0 == parseInt(parts[1])) {
      return parts[0]
    }

    let newText = ''
    let beginChecking = false
    for (let i=0; i<text.length; i++) {
      newText += text[i]
      if (beginChecking && '0' != text[i]) {
        break
      }

      if ('.' == text[i] )
        beginChecking = true
    }
    return newText + ' %'
  }
  return {
    chart: {
      type: "bar",
      width: "100%",
      toolbar: {
        show: false
      },
      events: {
        click: function (event, chartContext, config) {
          console.log("clicked");
        }
      }
    },
    states: {
      normal: {
        filter: {
          type: "none"
        }
      },
      active: {
        filter: {
          type: "darken",
          value: 0.35
        }
      }
    },
    colors: ["#00ff00", `rgba(255,0,0, ${1 ? 0.5 : 1})`],
    title: {
      text: isAverage ? "Average return per trade" : !isTotal ? "Number of trades" : "Total return",
      align: "left",
      offsetX: 8,
      offsetY: -2,
      style: {
        fontSize: "16px",
        color: '#FFFFFF'
      }
    },
    plotOptions: {
      bar: {
        endingShape: "rounded",
        columnWidth: "75%",
        barHeight: "100%",
        dataLabels: {
          position: "top"
        }
      }
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: "16px",
        colors: ["#FFFFFF", "#FFFFFF"]
      },
      formatter: (value, opts) => {
        return formatAvg(value)
      },
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["#fff"]
    },
    xaxis: {
      categories: getSymbols(chartData),
      labels: {
        show: true,
        style: {
            colors: '#FFFFFF',
        },
      },
    },
    grid: {
      show: false
    },
    yaxis: {
      labels: {
        show: true,
        style: {
            colors: '#FFFFFF',
        },
        // formatter: (value) => { return isAverage ? value.toFixed(5) : value | 0 },
        formatter: (value) => {
          if (isTotal) {
            return formatAvg(value)
          } else if (isAverage) {
            return formatAvg(value)
          } else {
            return formatAvg(value)
          }
        },
      },
      axisBorder: {
        show: true,
      },
    },
    tooltip: {
      enabled: true
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      offsetY: -50,
      fontSize: "14px",
      labels: {
        colors: "#FFFFFF"
      },
      markers: {
        width: 16,
        height: 16,
        radius: 4
      },
      itemMargin: {
        horizontal: 5,
        vertical: 5
      },
      onItemHover: {
        highlightDataSeries: true
      }
    }
  };
};

export default function GroupApexBar(props) {
  const { data: chartData, isAverage, isTotal } = props;
  const [options, setOptions] = useState(optionCreator(chartData, isAverage, isTotal));
  const [series, setSeries] = useState([
    {
      data: getWiningData(chartData, isAverage, isTotal)
    },
    {
      data: getLosingData(chartData, isAverage, isTotal)
    }
  ]);

  useEffect(() => {
    setOptions(optionCreator(chartData, isAverage, isTotal))
    setSeries([
      {
        name: isAverage ? 'Winning Average' : !isTotal ? 'Winning' : 'Total Winning',
        data: getWiningData(chartData, isAverage, isTotal)
      },
      {
        name: isAverage ? 'Losing Average' : !isTotal ? 'Losing' : 'Total Losing',
        data: getLosingData(chartData, isAverage, isTotal)
      }
    ])
    console.log('isTotal')
    console.log(isTotal)
    console.log([
      {
        name: isAverage ? 'Winning Average' : !isTotal ? 'Winning' : 'Total Winning',
        data: getWiningData(chartData, isAverage, isTotal)
      },
      {
        name: isAverage ? 'Losing Average' : !isTotal ? 'Losing' : 'Total Losing',
        data: getLosingData(chartData, isAverage, isTotal)
      }
    ])
  }, [chartData, isAverage])

  return (
    <div id="chart">
      {console.log('options')}
      {console.log(options)}
      {console.log('series')}
      {console.log(series)}
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        width={'100%'}
        height={400}
      />
    </div>
  );
}