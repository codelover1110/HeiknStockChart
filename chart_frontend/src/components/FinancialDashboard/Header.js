import React, { useState, useEffect } from 'react';
import Select from 'react-select';


const Header = (props) => {
  const { selectedHeaderNav, setSelectedHeaderNav, symbol, setSymbol, optionsSymbol } = props;

  
  const handleNavClicked = (item) => {
    setSelectedHeaderNav(item);
  }

  const handleSymbolChange = (e) => {
    setSymbol(e);
  };

  

  return (
    <div className="container custom-container">
      <div className="row dashboard-toolbar d-block">
        <div className="dashboard-toolbar-title">
          <span>Dashboard</span>
        </div>
        <div className="dashboard-toolbar-main d-flex">
          <div className="select-option">
            <Select
              value={symbol}
              onChange={handleSymbolChange}
              options={optionsSymbol}
              placeholder="Symbol"
            />
          </div>
          <div className="dashboard-navbar">
            <ul className="nav justify-content-center">
              <li
                className={`nav-item ${selectedHeaderNav == "All Financial Statements" ? "selected" : ""}`}
                onClick={() => handleNavClicked("All Financial Statements")}
              >
                <i className="fas fa-inbox"></i>
                <span>All Financial Statements</span>
              </li>
              <li
                className={`nav-item ${selectedHeaderNav == "Data Table" ? "selected" : ""}`}
                onClick={() => handleNavClicked("Data Table")}
              >
                <i className="fas fa-image"></i>
                <span>Data Table</span>
              </li>
              <li
                className={`nav-item ${selectedHeaderNav == "Income Statement" ? "selected" : ""}`}
                onClick={() => handleNavClicked("Income Statement")}
              >
                <i className="fas fa-file-invoice-dollar"></i>
                <span>Income Statement</span>
              </li>
              <li
                className={`nav-item ${selectedHeaderNav == "Balance Sheet" ? "selected" : ""}`}
                onClick={() => handleNavClicked("Balance Sheet")}
              >
                <i className="fas fa-money-bill-alt"></i>
                <span>Balance Sheet</span>
              </li>
              <li
                className={`nav-item ${selectedHeaderNav == "Cash Flow Statement" ? "selected" : ""}`}
                onClick={() => handleNavClicked("Cash Flow Statement")}
              >
                <i className="fas fa-dollar-sign"></i>
                <span>Cash Flow Statement</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
