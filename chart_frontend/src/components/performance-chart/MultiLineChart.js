import React from 'react'
import Chart from 'react-apexcharts'
import moment from "moment";

export class MultiLineChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: this.getSeries(),
      options: {
        chart: {
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'straight'
        },
        title: {
          text: props.isPercent ? 'Percent' : 'Efficiency',
          align: 'left',
          style: {
            fontSize:  '18px',
            fontWeight:  'bold',
            color: '#FFFFFF'
          },
        },
        grid: {
          show: false
        },
        xaxis: {
          categories: this.getCategories(),
          labels: {
            show: true,
            style: {
                colors: '#FFFFFF',
            },
            formatter: (val, opt) =>
              moment.utc(val).format("MM/DD hh:mm")
          },
          datetimeUTC: true,
        },
        yaxis: {
          labels: {
            show: true,
            style: {
                colors: '#FFFFFF',
            },
            formatter: (value) => { return Math.round(value) },
          },
          axisBorder: {
            show: true,
          },
        },
        legend: {
          show: true,
          labels: {
            colors: ['#FFFFFF']
          },
          position: 'top'
        }
      },
    };
  }

  getSeries() {
    const series = []
    this.props.chartData.map((data) => {
      for (const property in data) {
        series.push({
          name: property,
          data: data[property].map((o) => this.props.isPercent ? o.percent : o.efficiency)
        })
      }
    })
    return series
  }

  componentDidUpdate(prevProps) {
    if (prevProps.chartData !== this.props.chartData) {
      this.setState({
        series: this.getSeries(),
        options: {
          xaxis: {
            categories: this.getCategories(),
            labels: {
              show: true,
              style: {
                  colors: '#FFFFFF',
              },
              formatter: (val, opt) =>
                moment.utc(val).format("MM/DD hh:mm")
            },
            datetimeUTC: true,
          },
          yaxis: {
            labels: {
              show: true,
              style: {
                  colors: '#FFFFFF',
              },
              formatter: (value) => { return Math.round(value) },
            },
            axisBorder: {
              show: true,
            },
          }
        },
      })
    }
  }


  getCategories() {
    const categories = this.props.chartData.map((data) => {
      for (const property in data) {
        return data[property].map((o) => o.date)
      }
      return []
    })

    return categories[0]
  }
  
  render() {
    return (
      <div id="chart">
        <Chart options={this.state.options} series={this.state.series} type="line" height={350} />
      </div>
    )
  }
}