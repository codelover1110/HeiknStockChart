import React from 'react';

const GraphTypes = (props) => {
  const {
    selectedAggregationType,
    setSelectedAggregationType,
  } = props;

  const handleAggregationTypeClicked = (aggregationType) => {
    if (selectedAggregationType === aggregationType) {
      setSelectedAggregationType('');
    } else {
      setSelectedAggregationType(aggregationType);
    }
  }

  return (
    <div className="dashboard-graph-types">
      <ul className="nav justify-content-center">
        <li
          className={`nav-item ${selectedAggregationType === "YA" ? "selected" : ""}`}
          onClick={() => handleAggregationTypeClicked("YA")}
        >
          <span>ANN</span>
        </li>
        <li
          className={`nav-item ${selectedAggregationType === "QA" ? "selected" : ""}`}
          onClick={() => handleAggregationTypeClicked("QA")}
        >
          <span>QTR</span>
        </li>
        <li
          className={`nav-item ${selectedAggregationType === "TA" ? "selected" : ""}`}
          onClick={() => handleAggregationTypeClicked("TA")}
        >
          <span>TTM</span>
        </li>
      </ul>
    </div>
  );
};

export default GraphTypes;
