import React from 'react';

const ChartTools = (props) => {
  const {
    aggregationTypeForOne,
    setAggregrationTypeForOne,
    color,
  } = props;
  
  const handleAggregationForOneClicked = (aggregationType) => {
    setAggregrationTypeForOne(aggregationType);
  }

  return (
    <div className="dashboard-chart-tool">
      <ul className="nav justify-content-center">
        <li
          className="nav-item"
          style={aggregationTypeForOne === "A" ? { backgroundColor: color, color: "white" } : {}}
          onClick={() => handleAggregationForOneClicked("A")}
        >
          <span>A</span>
        </li>
        <li
          className="nav-item"
          style={aggregationTypeForOne === "Q" ? { backgroundColor: color, color: "white" } : {}}
          onClick={() => handleAggregationForOneClicked("Q")}
        >
          <span>Q</span>
        </li>
        <li
          className="nav-item"
          style={aggregationTypeForOne === "T" ? { backgroundColor: color, color: "white" } : {}}
          onClick={() => handleAggregationForOneClicked("T")}
        >
          <span>T</span>
        </li>
      </ul>
    </div>
  );
};

export default ChartTools;
