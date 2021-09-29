import React from 'react';
import ReactTable from 'react-table'
import { makePropGetter } from 'react-table';
import 'react-table/react-table.css'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentData: []
    };
    this.ws = new WebSocket("ws://127.0.0.1:8888/");
  }

  render() {
    this.ws.onopen = () => {
      console.log('Opened Connection!')
    };

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      // const tdata = array()
      let tempCon = []
      msg.map(data => {
        tempCon.push(data.data)
      })
      this.setState({ currentData: tempCon });
      // this.setState({ currentData: msg['data'] });
    };

    this.ws.onclose = () => {
      console.log('Closed Connection!')
    };

    const columns = [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Number', accessor: 'number' }
    ]

    const colums_1 = [
      { Header: 'V', accessor: 'v' },
      { Header: 'VW', accessor: 'vw' },
      { Header: 'O', accessor: 'o' },
      { Header: 'C', accessor: 'c' },
      { Header: 'H', accessor: 'h' },
      { Header: 'L', accessor: 'l' },
      { Header: 'N', accessor: 'n' },
      { Header: 'DATE', accessor: 'date' }
    ]
    console.log(this.state.currentData);
    return (
      <div className="App">
        <ReactTable
          data={this.state.currentData}
          columns={colums_1}
        />
      </div>
    );
  }
}

export default App;
