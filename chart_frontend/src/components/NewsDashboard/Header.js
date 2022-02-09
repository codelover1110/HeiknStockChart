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
        <div className="news-toolbar-title">
          <div className="financial-dashboard-title">
            <span>News Dashboard</span>
          </div>
          <div className="news-dashboard-toolbar d-flex">
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
                  className={`nav-item selected`}
                  onClick={() => handleNavClicked("News")}
                >
                  <i className="fas fa-inbox"></i>
                  <span>Symbols</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
