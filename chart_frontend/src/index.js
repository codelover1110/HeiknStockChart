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
import ProvideAuth from 'contexts/authContext'
import PrivateRoute from 'layouts/Auth/PrivateRoute'
import SignUp from 'layouts/User/SignUp'
import Verify from 'layouts/User/Verify'

ReactDOM.render(
  <ThemeContextWrapper>
    <BackgroundColorWrapper>
      <ProvideAuth>
        <BrowserRouter>
          <Switch>
            <PrivateRoute path="/admin">
              <AdminLayout />
            </PrivateRoute>
            <Route path="/login" render={(props) => <Login {...props} />} />
            <Route path="/signup" render={(props) => <SignUp {...props} />} />
            <Route path="/verify" render={(props) => <Verify {...props} />} />
            <PrivateRoute path="/tradedata">
              <TradeData />
            </PrivateRoute>
            <PrivateRoute path="/">
              <HomePage />
            </PrivateRoute>
          </Switch>
        </BrowserRouter>
      </ProvideAuth>
    </BackgroundColorWrapper>
  </ThemeContextWrapper>,
  document.getElementById("root")
);
