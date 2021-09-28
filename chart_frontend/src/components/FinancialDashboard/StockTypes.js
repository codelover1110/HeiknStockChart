import React from 'react';

const StockTypes = (props) => {
  const {
    selectedStockType,
    setSelectedStockType,
    selectedHeaderNav,
  } = props;

  const handleStockTypeClicked = (stockType) => {
    if (selectedHeaderNav === 'Chart') {
      setSelectedStockType(stockType);
    } else {
      if (selectedStockType === stockType) {
        setSelectedStockType('');
      } else {
        setSelectedStockType(stockType);
      }
    }
  }

  return (
    <div className="dashboard-graph-types">
      <ul className="nav justify-content-center">
        <li
          className={`nav-item ${selectedStockType === "Income Statement" ? "selected" : ""}`}
          onClick={() => handleStockTypeClicked("Income Statement")}
        >
          <span>Income Statement</span>
        </li>
        <li
          className={`nav-item ${selectedStockType === "Balance Sheet" ? "selected" : ""}`}
          onClick={() => handleStockTypeClicked("Balance Sheet")}
        >
          <span>Balance Sheet</span>
        </li>
        <li
          className={`nav-item ${selectedStockType === "Cash Flow Statement" ? "selected" : ""}`}
          onClick={() => handleStockTypeClicked("Cash Flow Statement")}
        >
          <span>Cash Flow Statement</span>
        </li>
      </ul>
    </div>
  );
};

export default StockTypes;
