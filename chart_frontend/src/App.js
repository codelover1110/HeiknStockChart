import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Link, Redirect  } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import TimeChart from "./components/TimeChart";
import Select from 'react-select'

import ItemChart from './components/ItemChart';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path={["/", "/chart"]} component={TimeChart} />
          <Route exact path="/ItemChart" component={ItemChart} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
