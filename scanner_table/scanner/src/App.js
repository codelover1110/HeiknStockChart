import React from 'react';
import ReactTable from 'react-table'
import { makePropGetter } from 'react-table';
import 'react-table/react-table.css'

import io from "socket.io-client";


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentData: [],
      isStarted: false,
    };
    /// 20.157.7.76,  20.84.64.243
    this.ws = new WebSocket("ws://20.157.7.76:9999/");
  }

  // componentDidMount() {
  //   if (!this.state.isStarted) {
  //     const socket = io.connect('http://localhost:8000');
  //     this.setState(socket)
  //     if (socket) {
  //       socket.emit('start_streaming', "run start");  
  //     }
  //     this.setState( {
  //       isStarted: true,
  //     })
  //   }
  // }

  render() {
    // console.log("sending message", this.socket)
    // this.socket.on('setFilters',  (args) => {console.log("filtered data received !!!!!", args)});
    
   
    //  this.ws.onopen = () => {
     //   console.log('Opened Connection!')
    //   };

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      console.log('-------------------', msg)
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
