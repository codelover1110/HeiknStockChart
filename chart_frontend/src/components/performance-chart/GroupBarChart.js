import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const getWiningData = (chartData, isAverage) => {
  return chartData.map((d) => isAverage ? d.avgWinning  : d.winning )
}

const getLosingData = (chartData, isAverage) => {
  return chartData.map((d) => isAverage ? d.avgLosing : d.losing)
}

const getSymbols = (chartData) => {
  return chartData.map((d) => d.symbol)
}

const optionCreator = (chartData, isAverage) => {
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
      text: isAverage ? "Winning & Losing Avg Percent" : "Wining & Losing",
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
        fontSize: "12px",
        colors: ["#FFFFFF", "#FFFFFF"]
      }
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
        formatter: (value) => value,
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
  const { data: chartData, isAverage } = props;
  const [options, setOptions] = useState(optionCreator(chartData, isAverage));
  const [series, setSeries] = useState([
    {
      data: getWiningData(chartData, isAverage)
    },
    {
      data: getLosingData(chartData, isAverage)
    }
  ]);

  useEffect(() => {
    setOptions(optionCreator(chartData, isAverage))
    setSeries([
      {
        name: isAverage ? 'Winning Average' : 'Winning',
        data: getWiningData(chartData, isAverage)
      },
      {
        name: isAverage ? 'Losing Average' : 'Losing',
        data: getLosingData(chartData, isAverage)
      }
    ])
  }, [chartData])

  return (
    <div id="chart">
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