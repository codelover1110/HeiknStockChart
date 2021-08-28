import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import HomePage from "layouts/User/HomePage"
import Login from "layouts/User/Login"
import AdminLayout from "layouts/Admin/Admin.js";
import TradeData from "layouts/User/TradeData";

import "assets/scss/black-dashboard-react.scss";
import "assets/demo/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import '@fortawesome/fontawesome-free/css/all.min.css'; 
import'bootstrap-css-only/css/bootstrap.min.css'; 
import 'mdbreact/dist/css/mdb.css';
import "./App.css";
import "assets/css/nucleo-icons.css";

import ThemeContextWrapper from "./components/ThemeWrapper/ThemeWrapper";
import BackgroundColorWrapper from "./components/BackgroundColorWrapper/BackgroundColorWrapper";

ReactDOM.render(
  <ThemeContextWrapper>
    <BackgroundColorWrapper>
      <BrowserRouter>
        <Switch>
          <Route path="/admin" render={(props) => <AdminLayout {...props} />} />
          <Route path="/login" render={(props) => <Login {...props} />} />
          <Route path="/tradedata" render={(props) => <TradeData {...props} />} />
          <Route path="/" render={(props) => <HomePage {...props} />} />
        </Switch>
      </BrowserRouter>
    </BackgroundColorWrapper>
  </ThemeContextWrapper>,
  document.getElementById("root")
);
