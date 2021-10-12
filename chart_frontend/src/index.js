import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import HomePage from "layouts/User/HomePage"
import Login from "layouts/User/Login"
import AdminLayout from "layouts/Admin/Admin.js";
import UserManage from "layouts/Admin/UserManage.js";
import LinkManage from "layouts/Admin/LinkManage";
import PriceData from "layouts/User/PriceData";
import TradeData from "layouts/User/TradeData";
import HybridView from "layouts/User/HybridView";
import FinancialDashboard from "layouts/User/FinancialDashboard";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "assets/scss/black-dashboard-react.scss";
import "assets/demo/demo.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import "./App.css";
import "assets/css/nucleo-icons.css";

import FileManager from "components/SystemFileManager/FileManager";
import ThemeContextWrapper from "./components/ThemeWrapper/ThemeWrapper";
import BackgroundColorWrapper from "./components/BackgroundColorWrapper/BackgroundColorWrapper";
import ProvideAuth from 'contexts/authContext'
import PrivateRoute from 'layouts/Auth/PrivateRoute'
import SignUp from 'layouts/User/SignUp'
import Verify from 'layouts/User/Verify'
import Floats from "layouts/User/Floats";
import ForgotPassword from 'layouts/User/ForgotPassword'
import PasswordResetConfirm from 'layouts/User/PasswordResetConfirm'
import MarketWatch from 'layouts/User/MarketWatch'
import Scanner from 'layouts/User/Scanner'
import Optimization from 'layouts/User/Optimization'

ReactDOM.render(
  <ThemeContextWrapper>
    <BackgroundColorWrapper>
      <ProvideAuth>
        <BrowserRouter>
          <Switch>
            <PrivateRoute path="/admin/usermanage">
              <UserManage />
            </PrivateRoute>
            <PrivateRoute path="/admin/linkmanage">
              <LinkManage />
            </PrivateRoute>
            <PrivateRoute path="/admin">
              <UserManage />
            </PrivateRoute>
            <Route path="/login" render={(props) => <Login {...props} />} />
            <Route path="/signup" render={(props) => <SignUp {...props} />} />
            <Route path="/verify" render={(props) => <Verify {...props} />} />
            <Route path="/forgot_password" render={(props) => <ForgotPassword {...props} />} />
            <Route path="/password-reset-confirm/:uuid/:token" render={(props) => <PasswordResetConfirm {...props} />} />
            <PrivateRoute path="/botmanagement">
              <FileManager/>
            </PrivateRoute>
            <PrivateRoute path="/floats">
              <Floats />
            </PrivateRoute>
            <PrivateRoute path="/market_watch">
              <MarketWatch />
            </PrivateRoute>
            <PrivateRoute path="/optimization">
              <Optimization />
            </PrivateRoute>
            <PrivateRoute path="/pricedatatable">
              <PriceData />
            </PrivateRoute>
            <PrivateRoute path="/tradedatatable">
              <TradeData />
            </PrivateRoute>
            <PrivateRoute path="/hybrid_view">
              <HybridView />
            </PrivateRoute>
            <PrivateRoute path="/financial_data">
              <FinancialDashboard />
            </PrivateRoute>
            <PrivateRoute path="/scanner">
              <Scanner />
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
