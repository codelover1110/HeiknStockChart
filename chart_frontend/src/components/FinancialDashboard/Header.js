import React from 'react';
import Select from 'react-select';
import { useCsvDownload } from 'contexts/CsvDownloadContext';

const Header = (props) => {
  const { selectedHeaderNav, setSelectedHeaderNav, symbol, setSymbol, optionsSymbol } = props;


  const handleNavClicked = (item) => {
    setSelectedHeaderNav(item);
  }

  const handleSymbolChange = (e) => {
    setSymbol(e);
  };

  const csvData = useCsvDownload()

  return (
    <div className="container custom-container">
      <div className="row dashboard-toolbar d-block">
        <div className="dashboard-toolbar-title d-flex">
          <div className="financial-dashboard-title">
            <span>Dashboard</span>
          </div>
          <div className="financial-dashboard-toolbar d-flex">
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
                  className={`nav-item ${selectedHeaderNav == "News" ? "selected" : ""}`}
                  onClick={() => handleNavClicked("News")}
                >
                  <i className="fas fa-inbox"></i>
                  <span>News</span>
                </li>
                <li
                  className={`nav-item ${selectedHeaderNav == "Data Table" ? "selected" : ""}`}
                  onClick={() => handleNavClicked("Data Table")}
                >
                  <i className="fas fa-image"></i>
                  <span>Data Table</span>
                </li>
                <li
                  className={`nav-item ${selectedHeaderNav == "Chart" ? "selected" : ""}`}
                  onClick={() => handleNavClicked("Chart")}
                >
                  <i className="fas fa-chart-bar"></i>
                  <span>Chart</span>
                </li>
                {/* <li
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
                </li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
