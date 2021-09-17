import React from 'react';

const GraphTypes = (props) => {
  const {
    selectedGraphType,
    setSelectedGraphType,
    selectedAggregationType,
    setSelectedAggregationType,
  } = props;

  const handleGraphTypeClicked = (graphType) => {
    setSelectedGraphType(graphType);
  }

  const handleAggregationTypeClicked = (aggregationType) => {
    setSelectedAggregationType(aggregationType);
  }

  return (
    <div className="dashboard-graph-types">
      <ul className="nav justify-content-center">
        <li
          className={`nav-item ${selectedGraphType === "Charts" ? "selected" : ""}`}
          onClick={() => handleGraphTypeClicked("Charts")}
        >
          <span>Charts</span>
        </li>
        <li
          className={`nav-item ${selectedGraphType === "Table" ? "selected" : ""}`}
          onClick={() => handleGraphTypeClicked("Table")}
        >
          <span>Table</span>
        </li>
        <li
          className={`nav-item ${selectedAggregationType === "ANN" ? "selected" : ""}`}
          onClick={() => handleAggregationTypeClicked("ANN")}
        >
          <span>ANN</span>
        </li>
        <li
          className={`nav-item ${selectedAggregationType === "QTR" ? "selected" : ""}`}
          onClick={() => handleAggregationTypeClicked("QTR")}
        >
          <span>QTR</span>
        </li>
        <li
          className={`nav-item ${selectedAggregationType === "TTM" ? "selected" : ""}`}
          onClick={() => handleAggregationTypeClicked("TTM")}
        >
          <span>TTM</span>
        </li>
      </ul>
    </div>
  );
};

export default GraphTypes;
