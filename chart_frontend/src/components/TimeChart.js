import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import http from "../http-common";
import axios from "axios";
import Select from 'react-select'
import 'react-select/dist/react-select.css';

import _ from "underscore";
import moment from "moment";

import { TimeSeries, Index } from "pondjs";
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";

import { tsvParse, csvParse } from "d3-dsv";
import { timeParse } from "d3-time-format";
import StockChart1D2M from "./1D2MStockChart";
import StockChart4D12M from "./4D12MStockChart";
import StockChart30D1H from "./30D1HStockChart";
import StockChart90D4H from "./90D4HStockChart";
import StockChart90D12H from "./90D12HStockChart";
import StockChart1Y1D from "./1Y1DStockChart";

import { useHistory } from "react-router-dom";

const TutorialsList = () => {
  const history = useHistory();
  const [selectedOptionTable, setSelectedOptionTable] = useState(null)
  const optionsTable = [
    { value: '1D_2m', label: '1D_2m' },
    { value: '4D_12m', label: '4D_12m' },
    { value: '30D_1h', label: '30D_1h' },
    { value: '90D_4h', label: '90D_4h' },
    { value: '90D_12h', label: '90D_12h' },
    { value: '1Y_1D', label: '1Y_1D' }
  ]

  const handleChangeTable = (value) => {
    setSelectedOptionTable(value)
    if (value) {
      history.push({
        pathname: '/itemComponent',
        state: value,
      });
    }
  
  }

  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <a href="/chart" className="navbar-brand">
          Hunter Violette - HeikinAshi
        </a>
        <div className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link to={"/chart"} className="nav-link"></Link>
          </li>
          <div className="select-option">
            <Select
              value={selectedOptionTable}
              onChange={handleChangeTable}
              options={optionsTable}
            />
          </div>
        </div>
      </nav>
      <div className="graphs-container">
        <div className="row">
          <div className="col-md-4 graph-container" >
            < StockChart1D2M />
          </div>
          <div className="col-md-4 graph-container">
            <StockChart4D12M />
          </div>
          <div className="col-md-4 graph-container">
            <StockChart30D1H />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 graph-container">
            <StockChart90D4H />
          </div>
          <div className="col-md-4 graph-container">
            <StockChart90D12H />
          </div>
          <div className="col-md-4 graph-container">
            <StockChart1Y1D />
          </div>
        </div>
      </div>
    </div>

  );
};

export default TutorialsList;
