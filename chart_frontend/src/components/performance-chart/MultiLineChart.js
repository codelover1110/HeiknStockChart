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
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 2,
          dashArray: 0,
        },
        title: {
          text: props.isPercent ? 'Percent Gain/Lost' : 'Total Percent Gain/Lost',
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
            formatter: (val, opt) => {
                if (val && val.length>10) {
                  return moment.utc(val).format("MM/DD hh:mm")
                } else {
                  return moment.utc(val).format("MM/DD")
                }
              }
          },
          datetimeUTC: true,
        },
        yaxis: {
          labels: {
            show: true,
            style: {
                colors: '#FFFFFF',
            },
            formatter: (value) => { return (value)?value.toFixed(3):'' },
          },
          axisBorder: {
            show: true,
          },
          min: this.getMinValue(),
          max: this.getMaxValue(),
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
          data: data[property].map((o) => this.props.isPercent ? o.percent.toFixed(3) : o.efficiency.toFixed(3))
        })
      }
      return null
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
              formatter: (val) => {
                if (val && val.length>10) {
                  return moment.utc(val).format("MM/DD hh:mm")
                } else {
                  return moment.utc(val).format("MM/DD")
                }
              }
            },
            datetimeUTC: true,
          },
          yaxis: {
            labels: {
              show: true,
              style: {
                  colors: '#FFFFFF',
              },
              formatter: (value) => { return (value)?value.toFixed(3):0 },
              min: this.getMinValue(),
              max: this.getMaxValue(),
            },
            axisBorder: {
              show: true,
            },
          }
        },
      })
    }
  }

  getMinValue() {
    let series = [];
    this.props.chartData.map((data) => {
      for (const property in data) {
        const rows = data[property].map(o => this.props.isPercent ? o.percent : o.efficiency)
        series.push(Math.min(...rows))
      }

      return null
    })
    const min = Math.min(...series)
    return min.toFixed(3);
  }

  getMaxValue() {
    let series = [];
    console.log('this.props.chartData')
    console.log(this.props.chartData)
    this.props.chartData.map((data) => {
      for (const property in data) {
        const rows = data[property].map(o => this.props.isPercent ? o.percent : o.efficiency)
        series.push(Math.max(...rows))
      }
      return null
    })
    const max = Math.max(...series)
    return max.toFixed(3);
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